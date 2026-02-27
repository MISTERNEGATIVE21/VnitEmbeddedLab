'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Transaction, TransactionStatus, ItemCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Search,
  MoreHorizontal,
  Undo2,
  Trash2,
  FileText,
  Filter,
  Download,
  Lock,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<TransactionStatus, { color: string; icon: typeof Clock }> = {
  'Borrowed': { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Clock },
  'Returned': { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle },
  'Overdue': { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: AlertCircle },
};

interface TransactionFormData {
  itemId: string;
  itemName: string;
  borrowerName: string;
  borrowerRollNo: string;
  borrowerContact: string;
  borrowerDepartment: string;
  quantity: number;
  dateBorrowed: string;
  expectedReturnDate: string;
  notes: string;
}

const initialFormData: TransactionFormData = {
  itemId: '',
  itemName: '',
  borrowerName: '',
  borrowerRollNo: '',
  borrowerContact: '',
  borrowerDepartment: '',
  quantity: 1,
  dateBorrowed: new Date().toISOString().split('T')[0],
  expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  notes: '',
};

export function TransactionSection() {
  const { 
    inventory, 
    transactions, 
    user, 
    addTransaction, 
    returnItem, 
    deleteTransaction,
    searchTransactions,
    hasPermission,
  } = useStore();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>(initialFormData);

  const availableItems = inventory.filter((item) => item.quantityAvailable > 0);

  const filteredTransactions = (() => {
    let items = search ? searchTransactions(search) : transactions;
    if (statusFilter !== 'all') {
      items = items.filter((t) => t.status === statusFilter);
    }
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  })();

  const overdueCount = transactions.filter((t) => t.status === 'Overdue').length;

  const handleOpenAdd = () => {
    if (!hasPermission('manageTransactions')) {
      toast({
        title: 'Authentication Required',
        description: 'Please login as admin or teacher to create transactions.',
        variant: 'destructive',
      });
      return;
    }
    setFormData({
      ...initialFormData,
      dateBorrowed: new Date().toISOString().split('T')[0],
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setDialogOpen(true);
  };

  const handleItemSelect = (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    if (item) {
      setFormData({
        ...formData,
        itemId: item.id,
        itemName: item.name,
        quantity: 1,
      });
    }
  };

  const handleOpenReturn = (transaction: Transaction) => {
    if (!hasPermission('manageTransactions')) {
      toast({
        title: 'Authentication Required',
        description: 'Please login as admin or teacher to process returns.',
        variant: 'destructive',
      });
      return;
    }
    if (transaction.status === 'Returned') {
      toast({
        title: 'Already Returned',
        description: 'This item has already been returned.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedTransaction(transaction);
    setReturnDialogOpen(true);
  };

  const handleOpenDelete = (transaction: Transaction) => {
    if (!hasPermission('manageTransactions')) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to delete transactions.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.itemName || !formData.borrowerName || !formData.borrowerRollNo) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const item = inventory.find((i) => i.id === formData.itemId);
    if (!item || item.quantityAvailable < formData.quantity) {
      toast({
        title: 'Insufficient Stock',
        description: 'Not enough items available.',
        variant: 'destructive',
      });
      return;
    }

    addTransaction(formData);
    toast({
      title: 'Transaction Created',
      description: `${formData.itemName} has been borrowed by ${formData.borrowerName}.`,
    });
    setDialogOpen(false);
  };

  const handleReturn = () => {
    if (selectedTransaction) {
      returnItem(selectedTransaction.id);
      toast({
        title: 'Item Returned',
        description: `${selectedTransaction.itemName} has been returned successfully.`,
      });
    }
    setReturnDialogOpen(false);
    setSelectedTransaction(null);
  };

  const handleDelete = () => {
    if (selectedTransaction) {
      deleteTransaction(selectedTransaction.id);
      toast({
        title: 'Transaction Deleted',
        description: 'The transaction has been removed.',
      });
    }
    setDeleteDialogOpen(false);
    setSelectedTransaction(null);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Item', 'Borrower', 'Roll No', 'Department', 'Qty', 'Borrowed', 'Expected Return', 'Actual Return', 'Duration', 'Status'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.itemName,
      t.borrowerName,
      t.borrowerRollNo,
      t.borrowerDepartment,
      t.quantity,
      t.dateBorrowed,
      t.expectedReturnDate,
      t.actualReturnDate || '-',
      t.duration ? `${t.duration} days` : '-',
      t.status,
    ]);
    
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vnit-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export Successful',
      description: 'Transaction data has been exported to CSV.',
    });
  };

  return (
    <section id="transactions" className="py-16">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold">Transaction Management</h2>
            <p className="text-muted-foreground">
              Track borrowed items and manage returns
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleOpenAdd}>
              <Plus className="h-4 w-4 mr-2" />
              New Borrow
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {overdueCount > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{overdueCount}</strong> item{overdueCount > 1 ? 's are' : ' is'} overdue. Please follow up with the borrowers.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by item, borrower, or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TransactionStatus | 'all')}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Borrowed">Borrowed</SelectItem>
              <SelectItem value="Returned">Returned</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead>Borrowed</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No transactions found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const StatusIcon = STATUS_CONFIG[transaction.status].icon;
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.itemName}</TableCell>
                        <TableCell>
                          <div>
                            <p>{transaction.borrowerName}</p>
                            <p className="text-xs text-muted-foreground">{transaction.borrowerDepartment}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{transaction.borrowerRollNo}</TableCell>
                        <TableCell className="text-center">{transaction.quantity}</TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(transaction.dateBorrowed), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(transaction.expectedReturnDate), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {transaction.duration ? `${transaction.duration} days` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('border gap-1', STATUS_CONFIG[transaction.status].color)}>
                            <StatusIcon className="h-3 w-3" />
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {hasPermission('manageTransactions') && transaction.status !== 'Returned' && (
                                <DropdownMenuItem onClick={() => handleOpenReturn(transaction)}>
                                  <Undo2 className="h-4 w-4 mr-2" />
                                  Mark as Returned
                                </DropdownMenuItem>
                              )}
                              {hasPermission('manageTransactions') && transaction.status !== 'Returned' && (
                                <DropdownMenuSeparator />
                              )}
                              {hasPermission('manageTransactions') && (
                                <DropdownMenuItem 
                                  onClick={() => handleOpenDelete(transaction)}
                                  className="text-red-500"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {!user.isAuthenticated && (
          <Alert className="mt-4">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Login as admin or teacher to manage transactions.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Borrowing Transaction</DialogTitle>
            <DialogDescription>
              Create a new borrowing record for lab equipment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Select Item *</Label>
              <Select onValueChange={handleItemSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an item to borrow" />
                </SelectTrigger>
                <SelectContent>
                  {availableItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.quantityAvailable} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Selected Item</Label>
                <Input value={formData.itemName || 'No item selected'} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="borrowerName">Borrower Name *</Label>
                <Input
                  id="borrowerName"
                  value={formData.borrowerName}
                  onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rollNo">Roll Number *</Label>
                <Input
                  id="rollNo"
                  value={formData.borrowerRollNo}
                  onChange={(e) => setFormData({ ...formData, borrowerRollNo: e.target.value })}
                  placeholder="e.g., BT21CSE001"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  value={formData.borrowerContact}
                  onChange={(e) => setFormData({ ...formData, borrowerContact: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.borrowerDepartment}
                  onChange={(e) => setFormData({ ...formData, borrowerDepartment: e.target.value })}
                  placeholder="e.g., CSE, ECE"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dateBorrowed">Date Borrowed</Label>
                <Input
                  id="dateBorrowed"
                  type="date"
                  value={formData.dateBorrowed}
                  onChange={(e) => setFormData({ ...formData, dateBorrowed: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expectedReturn">Expected Return</Label>
                <Input
                  id="expectedReturn"
                  type="date"
                  value={formData.expectedReturnDate}
                  onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Create Transaction
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Return Confirmation Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Return</DialogTitle>
            <DialogDescription>
              Mark &quot;{selectedTransaction?.itemName}&quot; as returned by {selectedTransaction?.borrowerName}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturn}>
              Confirm Return
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
