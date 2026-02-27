'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { SyncData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Download,
  Upload,
  Trash2,
  Save,
  Key,
  AlertTriangle,
  Database,
  Shield,
  GraduationCap,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function SettingsSection() {
  const { 
    user, 
    settings, 
    updateSettings, 
    changePassword, 
    exportData, 
    importData, 
    clearAllData,
    hasPermission 
  } = useStore();
  
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [passwordRole, setPasswordRole] = useState<'admin' | 'teacher'>('admin');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleExport = () => {
    const data = exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vnit-embedded-lab-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export Successful',
      description: 'Data has been exported to JSON file.',
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user.isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to import data.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data: SyncData = JSON.parse(e.target?.result as string);
        importData(data);
        toast({
          title: 'Import Successful',
          description: `Imported ${data.inventory?.length || 0} items and ${data.transactions?.length || 0} transactions.`,
        });
      } catch {
        toast({
          title: 'Import Failed',
          description: 'Invalid JSON file format.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const openPasswordDialog = (role: 'admin' | 'teacher') => {
    setPasswordRole(role);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordDialogOpen(true);
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all password fields.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (changePassword(passwordRole, oldPassword, newPassword)) {
      toast({
        title: 'Password Changed',
        description: `The ${passwordRole} password has been updated successfully.`,
      });
      setPasswordDialogOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast({
        title: 'Error',
        description: 'Current password is incorrect.',
        variant: 'destructive',
      });
    }
  };

  const handleClearData = () => {
    if (!hasPermission('clearData')) {
      toast({
        title: 'Access Denied',
        description: 'Only admin can clear all data.',
        variant: 'destructive',
      });
      return;
    }
    clearAllData();
    toast({
      title: 'Data Cleared',
      description: 'All inventory and transaction data has been removed.',
    });
    setClearDialogOpen(false);
  };

  const isAdmin = user.role === 'admin';

  return (
    <section id="settings" className="py-16">
      <div className="container">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Data Management</h2>
          <p className="text-muted-foreground">
            Export, import, and manage your lab data
          </p>
        </div>

        {!user.isAuthenticated && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Login Required</AlertTitle>
            <AlertDescription>
              Please login to modify settings and manage data.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Export Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-500" />
                Export Data
              </CardTitle>
              <CardDescription>
                Download all inventory and transaction data as JSON
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExport} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Export to JSON
              </Button>
            </CardContent>
          </Card>

          {/* Import Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-green-500" />
                Import Data
              </CardTitle>
              <CardDescription>
                Restore data from a previously exported JSON file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={!user.isAuthenticated}
                />
                {!user.isAuthenticated && (
                  <p className="text-xs text-muted-foreground">Login required</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Change Password - Admin */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Admin Password
              </CardTitle>
              <CardDescription>
                Change the admin access password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => openPasswordDialog('admin')}
                disabled={!isAdmin}
                variant="outline"
                className="w-full"
              >
                <Key className="h-4 w-4 mr-2" />
                Change Admin Password
              </Button>
              {!isAdmin && (
                <p className="text-xs text-muted-foreground mt-2">Admin only</p>
              )}
            </CardContent>
          </Card>

          {/* Change Password - Teacher */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                Teacher Password
              </CardTitle>
              <CardDescription>
                Change the teacher access password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => openPasswordDialog('teacher')}
                disabled={!isAdmin}
                variant="outline"
                className="w-full"
              >
                <Key className="h-4 w-4 mr-2" />
                Change Teacher Password
              </Button>
              {!isAdmin && (
                <p className="text-xs text-muted-foreground mt-2">Admin only</p>
              )}
            </CardContent>
          </Card>

          {/* Clear Data */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <Trash2 className="h-5 w-5" />
                Clear All Data
              </CardTitle>
              <CardDescription>
                Remove all inventory and transaction records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive"
                onClick={() => setClearDialogOpen(true)}
                disabled={!hasPermission('clearData')}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
              {!isAdmin && (
                <p className="text-xs text-muted-foreground mt-2">Admin only</p>
              )}
            </CardContent>
          </Card>

          {/* Storage Info */}
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-cyan-500" />
                Storage
              </CardTitle>
              <CardDescription>
                Data stored locally in browser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Data persists in your browser&apos;s localStorage.</p>
                <p>Export regularly for backup.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lab Settings */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Lab Information</CardTitle>
            <CardDescription>
              Update lab name and location (admin only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="labName">Lab Name</Label>
                <Input
                  id="labName"
                  value={settings.labName}
                  onChange={(e) => updateSettings({ labName: e.target.value })}
                  disabled={!hasPermission('manageSettings')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labLocation">Location</Label>
                <Input
                  id="labLocation"
                  value={settings.labLocation}
                  onChange={(e) => updateSettings({ labLocation: e.target.value })}
                  disabled={!hasPermission('manageSettings')}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {passwordRole === 'admin' ? (
                <>
                  <Shield className="h-5 w-5 text-red-500" />
                  Change Admin Password
                </>
              ) : (
                <>
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  Change Teacher Password
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Enter the current {passwordRole} password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Update Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Data Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500">Clear All Data</DialogTitle>
            <DialogDescription>
              This will permanently delete all inventory items and transactions. 
              This action cannot be undone. Please export your data first if you want to keep a backup.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearData}>
              Clear All Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
