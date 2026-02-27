// Types for VNIT Embedded Labs Materials Tracking System

export type ItemCategory = 
  | 'Components'
  | 'Tools'
  | 'Boards'
  | 'Sensors'
  | 'Modules'
  | 'Cables'
  | 'Power Supplies'
  | 'Test Equipment'
  | 'Other';

export type ItemStatus = 'Available' | 'Low Stock' | 'Out of Stock';

export type TransactionStatus = 'Borrowed' | 'Returned' | 'Overdue';

export type UserRole = 'admin' | 'teacher' | 'viewer';

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantityAvailable: number;
  quantityTotal: number;
  size: string;
  location: string;
  description: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  borrowerName: string;
  borrowerRollNo: string;
  borrowerContact: string;
  borrowerDepartment: string;
  quantity: number;
  dateBorrowed: string;
  expectedReturnDate: string;
  actualReturnDate: string | null;
  duration: number | null; // in days
  status: TransactionStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalItems: number;
  totalQuantity: number;
  activeBorrows: number;
  overdueItems: number;
  returnedThisMonth: number;
  categoryBreakdown: Record<ItemCategory, number>;
  recentTransactions: Transaction[];
}

export interface User {
  isAuthenticated: boolean;
  role: UserRole;
  loginTime: string | null;
  username: string | null;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  labName: string;
  labLocation: string;
  adminPasswordHash: string;
  teacherPasswordHash: string;
  githubGistId: string | null;
  lastSync: string | null;
}

export interface SyncData {
  inventory: InventoryItem[];
  transactions: Transaction[];
  settings: Partial<AppSettings>;
  exportedAt: string;
  version: string;
}
