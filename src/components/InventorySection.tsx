'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { InventoryItem, ItemCategory, ItemStatus } from '@/lib/types';
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
  Pencil,
  Trash2,
  Package,
  Filter,
  Download,
  Lock,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const CATEGORIES: ItemCategory[] = [
  'Components',
  'Tools',
  'Boards',
  'Sensors',
  'Modules',
  'Cables',
  'Power Supplies',
  'Test Equipment',
  'Other',
];

const STATUS_COLORS: Record<ItemStatus, string> = {
  'Available': 'bg-green-500/10 text-green-500 border-green-500/20',
  'Low Stock': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'Out of Stock': 'bg-red-500/10 text-red-500 border-red-500/20',
};

interface InventoryFormData {
  name: string;
  category: ItemCategory;
  quantityAvailable: number;
  quantityTotal: number;
  size: string;
  location: string;
  description: string;
}

const initialFormData: InventoryFormData = {
  name: '',
  category: 'Components',
  quantityAvailable: 0,
  quantityTotal: 0,
  size: '',
  location: '',
  description: '',
};

export function InventorySection() {
  const { inventory, user, addItem, updateItem, deleteItem, searchItems, filterItems, hasPermission } = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<InventoryFormData>(initialFormData);

  const filteredItems = (() => {
    let items = search ? searchItems(search) : inventory;
    if (categoryFilter !== 'all') {
      items = items.filter((item) => item.category === categoryFilter);
    }
    if (statusFilter !== 'all') {
      items = items.filter((item) => item.status === statusFilter);
    }
    return items;
  })();

  const handleOpenAdd = () => {
    if (!hasPermission('editInventory')) {
      toast({
        title: 'Authentication Required',
        description: 'Please login as admin or teacher to add items.',
        variant: 'destructive',
      });
      return;
    }
    setEditingItem(null);
    setFormData(initialFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    if (!hasPermission('editInventory')) {
      toast({
        title: 'Authentication Required',
        description: 'Please login as admin or teacher to edit items.',
        variant: 'destructive',
      });
      return;
    }
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantityAvailable: item.quantityAvailable,
      quantityTotal: item.quantityTotal,
      size: item.size,
      location: item.location,
      description: item.description,
    });
    setDialogOpen(true);
  };

  const handleOpenDelete = (item: InventoryItem) => {
    if (!hasPermission('deleteInventory')) {
      toast({
        title: 'Access Denied',
        description: 'Only admin can delete items.',
        variant: 'destructive',
      });
      return;
    }
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Item name is required.',
        variant: 'destructive',
      });
      return;
    }

    if (editingItem) {
      updateItem(editingItem.id, formData);
      toast({
        title: 'Item Updated',
        description: `${formData.name} has been updated successfully.`,
      });
    } else {
      addItem(formData);
      toast({
        title: 'Item Added',
        description: `${formData.name} has been added to inventory.`,
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete.id);
      toast({
        title: 'Item Deleted',
        description: `${itemToDelete.name} has been removed from inventory.`,
      });
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Category', 'Available', 'Total', 'Size', 'Location', 'Status', 'Description'];
    const rows = filteredItems.map((item) => [
      item.name,
      item.category,
      item.quantityAvailable,
      item.quantityTotal,
      item.size,
      item.location,
      item.status,
      item.description,
    ]);
    
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vnit-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export Successful',
      description: 'Inventory data has been exported to CSV.',
    });
  };

  return (
    <section id="inventory" className="py-16 bg-muted/30">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold">Inventory Management</h2>
            <p className="text-muted-foreground">
              Manage and track all lab equipment and components
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleOpenAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as ItemCategory | 'all')}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ItemStatus | 'all')}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Available</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No items found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono">{item.quantityAvailable}</TableCell>
                      <TableCell className="text-center font-mono">{item.quantityTotal}</TableCell>
                      <TableCell>{item.size || '-'}</TableCell>
                      <TableCell>{item.location || '-'}</TableCell>
                      <TableCell>
                        <Badge className={cn('border', STATUS_COLORS[item.status])}>
                          {item.status}
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
                            {hasPermission('editInventory') && (
                              <DropdownMenuItem onClick={() => handleOpenEdit(item)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {hasPermission('editInventory') && hasPermission('deleteInventory') && (
                              <DropdownMenuSeparator />
                            )}
                            {hasPermission('deleteInventory') && (
                              <DropdownMenuItem 
                                onClick={() => handleOpenDelete(item)}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {!user.isAuthenticated && (
          <Alert className="mt-4">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Login as admin or teacher to manage inventory items.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the item details below.' : 'Fill in the details for the new inventory item.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Arduino Uno R3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData({ ...formData, category: v as ItemCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="size">Size/Dimensions</Label>
                <Input
                  id="size"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="e.g., Standard"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="available">Quantity Available</Label>
                <Input
                  id="available"
                  type="number"
                  min="0"
                  value={formData.quantityAvailable}
                  onChange={(e) => setFormData({ ...formData, quantityAvailable: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="total">Total Quantity</Label>
                <Input
                  id="total"
                  type="number"
                  min="0"
                  value={formData.quantityTotal}
                  onChange={(e) => setFormData({ ...formData, quantityTotal: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location in Lab</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Shelf A-1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the item..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingItem ? 'Update' : 'Add'} Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{itemToDelete?.name}&quot;? This action cannot be undone.
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
