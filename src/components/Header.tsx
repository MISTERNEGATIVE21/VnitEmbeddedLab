'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Cpu, 
  Menu, 
  LogIn, 
  LogOut, 
  User, 
  Shield,
  Home,
  Package,
  FileText,
  BarChart3,
  Lock,
  GraduationCap,
  Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/#inventory', label: 'Inventory', icon: Package },
  { href: '/#transactions', label: 'Transactions', icon: FileText },
  { href: '/#dashboard', label: 'Dashboard', icon: BarChart3 },
];

export function Header() {
  const pathname = usePathname();
  const { user, login, logout } = useStore();
  const [loginOpen, setLoginOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    const result = login(password);
    if (result.success) {
      toast({
        title: 'Login Successful',
        description: `Welcome! Logged in as ${result.role === 'admin' ? 'Administrator' : 'Teacher'}.`,
      });
      setLoginOpen(false);
      setPassword('');
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully.',
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Admin</Badge>;
      case 'teacher':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Teacher</Badge>;
      default:
        return null;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'teacher':
        return <GraduationCap className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold">VNIT Embedded Lab</span>
            <p className="text-xs text-muted-foreground">Materials Tracking System</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center space-x-2">
          {user.isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {getRoleIcon(user.role)}
                  <span className="hidden sm:inline">{user.username}</span>
                  {getRoleBadge(user.role)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2">
                  {getRoleIcon(user.role)}
                  {user.role === 'admin' ? 'Administrator' : 'Teacher'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user.role === 'admin' && (
                  <>
                    <DropdownMenuItem className="gap-2 text-muted-foreground">
                      <Settings className="h-4 w-4" />
                      Full Access
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {user.role === 'teacher' && (
                  <>
                    <DropdownMenuItem className="gap-2 text-muted-foreground">
                      <Settings className="h-4 w-4" />
                      Inventory & Transactions
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-500">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLoginOpen(true)}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-orange-500" />
                  VNIT Embedded Lab
                </SheetTitle>
                <SheetDescription>
                  Navigate to different sections
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col space-y-2 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={pathname === item.href ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  {user.isAuthenticated ? (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2 text-red-500"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLoginOpen(true);
                      }}
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Lab Access Login
            </DialogTitle>
            <DialogDescription>
              Enter your password to access editing features. Contact lab administrator if you don&apos;t have the password.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="admin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="admin" className="gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </TabsTrigger>
              <TabsTrigger value="teacher" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Teacher
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="admin" className="space-y-4 pt-4">
              <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium mb-1">
                  <Shield className="h-4 w-4" />
                  Administrator Access
                </div>
                <p className="text-xs text-muted-foreground">
                  Full access: Manage inventory, transactions, settings, and data.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Admin Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                Login as Admin
              </Button>
            </TabsContent>
            
            <TabsContent value="teacher" className="space-y-4 pt-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium mb-1">
                  <GraduationCap className="h-4 w-4" />
                  Teacher Access
                </div>
                <p className="text-xs text-muted-foreground">
                  Limited access: Manage inventory and transactions only.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-password">Teacher Password</Label>
                <Input
                  id="teacher-password"
                  type="password"
                  placeholder="Enter teacher password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                Login as Teacher
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </header>
  );
}
