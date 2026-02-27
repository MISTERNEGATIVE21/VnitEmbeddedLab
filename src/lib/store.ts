import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  InventoryItem, 
  Transaction, 
  User, 
  AppSettings, 
  SyncData,
  ItemCategory,
  ItemStatus,
  TransactionStatus,
  UserRole
} from './types';

// Simple hash function for password
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Calculate status based on quantity
function calculateItemStatus(available: number, total: number): ItemStatus {
  if (available === 0) return 'Out of Stock';
  if (available <= total * 0.2) return 'Low Stock';
  return 'Available';
}

// Calculate transaction status
function calculateTransactionStatus(
  status: TransactionStatus, 
  expectedReturn: string, 
  actualReturn: string | null
): TransactionStatus {
  if (actualReturn) return 'Returned';
  if (status === 'Returned') return 'Returned';
  const expected = new Date(expectedReturn);
  const now = new Date();
  if (now > expected) return 'Overdue';
  return 'Borrowed';
}

// Permission checks
function canEditInventory(role: UserRole): boolean {
  return role === 'admin' || role === 'teacher';
}

function canDeleteInventory(role: UserRole): boolean {
  return role === 'admin';
}

function canManageTransactions(role: UserRole): boolean {
  return role === 'admin' || role === 'teacher';
}

function canManageSettings(role: UserRole): boolean {
  return role === 'admin';
}

function canClearData(role: UserRole): boolean {
  return role === 'admin';
}

// Pre-generated timestamps for sample data (fixed to avoid hydration issues)
const SAMPLE_TIMESTAMP = '2024-01-15T10:00:00.000Z';

// Sample inventory with fixed timestamps
function getSampleInventory(): InventoryItem[] {
  return [
    {
      id: '1',
      name: 'Arduino Uno R3',
      category: 'Boards',
      quantityAvailable: 15,
      quantityTotal: 20,
      size: 'Standard',
      location: 'Shelf A-1',
      description: 'ATmega328P microcontroller board',
      status: 'Available',
      createdAt: SAMPLE_TIMESTAMP,
      updatedAt: SAMPLE_TIMESTAMP,
    },
    {
      id: '2',
      name: 'Raspberry Pi 4 Model B',
      category: 'Boards',
      quantityAvailable: 5,
      quantityTotal: 8,
      size: 'Standard',
      location: 'Shelf A-2',
      description: 'ARM Cortex-A72 based SBC, 4GB RAM',
      status: 'Available',
      createdAt: SAMPLE_TIMESTAMP,
      updatedAt: SAMPLE_TIMESTAMP,
    },
    {
      id: '3',
      name: 'ESP32 DevKit V1',
      category: 'Boards',
      quantityAvailable: 10,
      quantityTotal: 12,
      size: 'Standard',
      location: 'Shelf A-3',
      description: 'WiFi + Bluetooth enabled development board',
      status: 'Available',
      createdAt: SAMPLE_TIMESTAMP,
      updatedAt: SAMPLE_TIMESTAMP,
    },
    {
      id: '4',
      name: 'DHT11 Temperature Sensor',
      category: 'Sensors',
      quantityAvailable: 25,
      quantityTotal: 30,
      size: 'Small',
      location: 'Shelf B-1',
      description: 'Digital temperature and humidity sensor',
      status: 'Available',
      createdAt: SAMPLE_TIMESTAMP,
      updatedAt: SAMPLE_TIMESTAMP,
    },
    {
      id: '5',
      name: 'Ultrasonic Sensor HC-SR04',
      category: 'Sensors',
      quantityAvailable: 18,
      quantityTotal: 20,
      size: 'Medium',
      location: 'Shelf B-2',
      description: 'Distance measuring sensor, 2-400cm range',
      status: 'Available',
      createdAt: SAMPLE_TIMESTAMP,
      updatedAt: SAMPLE_TIMESTAMP,
    },
    {
      id: '6',
      name: 'Digital Oscilloscope',
      category: 'Test Equipment',
      quantityAvailable: 2,
      quantityTotal: 3,
      size: 'Large',
      location: 'Equipment Room',
      description: '100MHz bandwidth, 4-channel digital oscilloscope',
      status: 'Available',
      createdAt: SAMPLE_TIMESTAMP,
      updatedAt: SAMPLE_TIMESTAMP,
    },
    {
      id: '7',
      name: 'Soldering Iron 60W',
      category: 'Tools',
      quantityAvailable: 8,
      quantityTotal: 10,
      size: 'Medium',
      location: 'Tool Cabinet',
      description: 'Temperature adjustable soldering station',
      status: 'Available',
      createdAt: SAMPLE_TIMESTAMP,
      updatedAt: SAMPLE_TIMESTAMP,
    },
    {
      id: '8',
      name: 'Breadboard 830 Points',
      category: 'Components',
      quantityAvailable: 30,
      quantityTotal: 35,
      size: 'Medium',
      location: 'Shelf C-1',
      description: 'Standard solderless breadboard',
      status: 'Available',
      createdAt: SAMPLE_TIMESTAMP,
      updatedAt: SAMPLE_TIMESTAMP,
    },
    {
      id: '9',
      name: 'Jumper Wires Pack',
      category: 'Cables',
      quantityAvailable: 45,
      quantityTotal: 50,
      size: 'Small',
      location: 'Shelf C-2',
      description: 'Male-to-male, male-to-female, female-to-female assorted',
      status: 'Available',
      createdAt: SAMPLE_TIMESTAMP,
      updatedAt: SAMPLE_TIMESTAMP,
    },
    {
      id: '10',
      name: 'L298N Motor Driver',
      category: 'Modules',
      quantityAvailable: 12,
      quantityTotal: 15,
      size: 'Medium',
      location: 'Shelf D-1',
      description: 'Dual H-bridge motor driver module',
      status: 'Available',
      createdAt: SAMPLE_TIMESTAMP,
      updatedAt: SAMPLE_TIMESTAMP,
    },
  ];
}

const DEFAULT_ADMIN_PASSWORD_HASH = simpleHash('vnit@admin2024');
const DEFAULT_TEACHER_PASSWORD_HASH = simpleHash('vnit@teacher2024');

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  labName: 'VNIT Embedded Systems Lab',
  labLocation: 'Centre for VLSI & Embedded Systems, VNIT Nagpur',
  adminPasswordHash: DEFAULT_ADMIN_PASSWORD_HASH,
  teacherPasswordHash: DEFAULT_TEACHER_PASSWORD_HASH,
  githubGistId: null,
  lastSync: null,
};

interface AppState {
  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  
  // Data
  inventory: InventoryItem[];
  transactions: Transaction[];
  user: User;
  settings: AppSettings;
  
  // Auth actions
  login: (password: string) => { success: boolean; role?: UserRole };
  logout: () => void;
  isAuthenticated: () => boolean;
  hasPermission: (action: 'editInventory' | 'deleteInventory' | 'manageTransactions' | 'manageSettings' | 'clearData') => boolean;
  
  // Inventory actions
  addItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => InventoryItem;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  getItem: (id: string) => InventoryItem | undefined;
  searchItems: (query: string) => InventoryItem[];
  filterItems: (category?: ItemCategory, status?: ItemStatus) => InventoryItem[];
  loadSampleData: () => void;
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'duration' | 'actualReturnDate' | 'status'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  returnItem: (transactionId: string) => void;
  deleteTransaction: (id: string) => void;
  getTransaction: (id: string) => Transaction | undefined;
  getActiveTransactions: () => Transaction[];
  getOverdueTransactions: () => Transaction[];
  searchTransactions: (query: string) => Transaction[];
  filterTransactions: (status?: TransactionStatus, borrower?: string) => Transaction[];
  
  // Settings actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  changePassword: (role: 'admin' | 'teacher', oldPassword: string, newPassword: string) => boolean;
  
  // Data management
  exportData: () => SyncData;
  importData: (data: SyncData) => void;
  clearAllData: () => void;
  
  // Statistics
  getStats: () => {
    totalItems: number;
    totalQuantity: number;
    activeBorrows: number;
    overdueItems: number;
    returnedThisMonth: number;
    categoryBreakdown: Record<ItemCategory, number>;
    recentTransactions: Transaction[];
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
      
      inventory: [], // Start with empty array
      transactions: [],
      user: {
        isAuthenticated: false,
        role: 'viewer',
        loginTime: null,
        username: null,
      },
      settings: DEFAULT_SETTINGS,

      // Auth actions
      login: (password: string) => {
        const state = get();
        const hash = simpleHash(password);
        
        if (hash === state.settings.adminPasswordHash) {
          set({
            user: {
              isAuthenticated: true,
              role: 'admin',
              loginTime: new Date().toISOString(),
              username: 'Administrator',
            },
          });
          return { success: true, role: 'admin' };
        }
        
        if (hash === state.settings.teacherPasswordHash) {
          set({
            user: {
              isAuthenticated: true,
              role: 'teacher',
              loginTime: new Date().toISOString(),
              username: 'Teacher',
            },
          });
          return { success: true, role: 'teacher' };
        }
        
        return { success: false };
      },

      logout: () => {
        set({
          user: {
            isAuthenticated: false,
            role: 'viewer',
            loginTime: null,
            username: null,
          },
        });
      },

      isAuthenticated: () => get().user.isAuthenticated,

      hasPermission: (action) => {
        const role = get().user.role;
        switch (action) {
          case 'editInventory':
            return canEditInventory(role);
          case 'deleteInventory':
            return canDeleteInventory(role);
          case 'manageTransactions':
            return canManageTransactions(role);
          case 'manageSettings':
            return canManageSettings(role);
          case 'clearData':
            return canClearData(role);
          default:
            return false;
        }
      },

      // Load sample data
      loadSampleData: () => {
        const state = get();
        if (state.inventory.length === 0) {
          set({ inventory: getSampleInventory() });
        }
      },

      // Inventory actions
      addItem: (item) => {
        const id = generateId();
        const now = new Date().toISOString();
        const status = calculateItemStatus(item.quantityAvailable, item.quantityTotal);
        const newItem: InventoryItem = {
          ...item,
          id,
          status,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          inventory: [...state.inventory, newItem],
        }));
        return newItem;
      },

      updateItem: (id, updates) => {
        set((state) => ({
          inventory: state.inventory.map((item) => {
            if (item.id === id) {
              const updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
              updated.status = calculateItemStatus(updated.quantityAvailable, updated.quantityTotal);
              return updated;
            }
            return item;
          }),
        }));
      },

      deleteItem: (id) => {
        set((state) => ({
          inventory: state.inventory.filter((item) => item.id !== id),
        }));
      },

      getItem: (id) => get().inventory.find((item) => item.id === id),

      searchItems: (query) => {
        const lower = query.toLowerCase();
        return get().inventory.filter(
          (item) =>
            item.name.toLowerCase().includes(lower) ||
            item.category.toLowerCase().includes(lower) ||
            item.location.toLowerCase().includes(lower) ||
            item.description.toLowerCase().includes(lower)
        );
      },

      filterItems: (category, status) => {
        return get().inventory.filter((item) => {
          if (category && item.category !== category) return false;
          if (status && item.status !== status) return false;
          return true;
        });
      },

      // Transaction actions
      addTransaction: (transaction) => {
        const id = generateId();
        const now = new Date().toISOString();
        const status: TransactionStatus = 'Borrowed';
        const newTransaction: Transaction = {
          ...transaction,
          id,
          status,
          actualReturnDate: null,
          duration: null,
          createdAt: now,
          updatedAt: now,
        };
        
        const item = get().getItem(transaction.itemId);
        if (item) {
          const newAvailable = Math.max(0, item.quantityAvailable - transaction.quantity);
          get().updateItem(item.id, { quantityAvailable: newAvailable });
        }
        
        set((state) => ({
          transactions: [...state.transactions, newTransaction],
        }));
        return newTransaction;
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) => {
            if (t.id === id) {
              const updated = { ...t, ...updates, updatedAt: new Date().toISOString() };
              updated.status = calculateTransactionStatus(
                updated.status,
                updated.expectedReturnDate,
                updated.actualReturnDate
              );
              return updated;
            }
            return t;
          }),
        }));
      },

      returnItem: (transactionId) => {
        const transaction = get().getTransaction(transactionId);
        if (!transaction || transaction.status === 'Returned') return;
        
        const now = new Date();
        const borrowed = new Date(transaction.dateBorrowed);
        const duration = Math.ceil((now.getTime() - borrowed.getTime()) / (1000 * 60 * 60 * 24));
        
        get().updateTransaction(transactionId, {
          actualReturnDate: now.toISOString(),
          duration,
          status: 'Returned',
        });
        
        const item = get().getItem(transaction.itemId);
        if (item) {
          get().updateItem(item.id, {
            quantityAvailable: item.quantityAvailable + transaction.quantity,
          });
        }
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      getTransaction: (id) => get().transactions.find((t) => t.id === id),

      getActiveTransactions: () => 
        get().transactions.filter((t) => t.status === 'Borrowed' || t.status === 'Overdue'),

      getOverdueTransactions: () => 
        get().transactions.filter((t) => t.status === 'Overdue'),

      searchTransactions: (query) => {
        const lower = query.toLowerCase();
        return get().transactions.filter(
          (t) =>
            t.itemName.toLowerCase().includes(lower) ||
            t.borrowerName.toLowerCase().includes(lower) ||
            t.borrowerRollNo.toLowerCase().includes(lower) ||
            t.borrowerDepartment.toLowerCase().includes(lower)
        );
      },

      filterTransactions: (status, borrower) => {
        return get().transactions.filter((t) => {
          if (status && t.status !== status) return false;
          if (borrower && !t.borrowerName.toLowerCase().includes(borrower.toLowerCase())) return false;
          return true;
        });
      },

      // Settings actions
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      changePassword: (role, oldPassword, newPassword) => {
        const state = get();
        const hash = simpleHash(oldPassword);
        
        if (role === 'admin') {
          if (hash !== state.settings.adminPasswordHash) return false;
          set({
            settings: { ...state.settings, adminPasswordHash: simpleHash(newPassword) },
          });
          return true;
        } else if (role === 'teacher') {
          if (hash !== state.settings.teacherPasswordHash) return false;
          set({
            settings: { ...state.settings, teacherPasswordHash: simpleHash(newPassword) },
          });
          return true;
        }
        return false;
      },

      // Data management
      exportData: () => ({
        inventory: get().inventory,
        transactions: get().transactions,
        settings: {
          labName: get().settings.labName,
          labLocation: get().settings.labLocation,
        },
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      }),

      importData: (data) => {
        set({
          inventory: data.inventory || [],
          transactions: data.transactions || [],
          settings: {
            ...get().settings,
            ...(data.settings || {}),
          },
        });
      },

      clearAllData: () => {
        set({
          inventory: [],
          transactions: [],
        });
      },

      // Statistics
      getStats: () => {
        const state = get();
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const categoryBreakdown: Record<ItemCategory, number> = {
          'Components': 0,
          'Tools': 0,
          'Boards': 0,
          'Sensors': 0,
          'Modules': 0,
          'Cables': 0,
          'Power Supplies': 0,
          'Test Equipment': 0,
          'Other': 0,
        };
        
        state.inventory.forEach((item) => {
          categoryBreakdown[item.category] += item.quantityAvailable;
        });
        
        const recentTransactions = [...state.transactions]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);
        
        const returnedThisMonth = state.transactions.filter(
          (t) => t.actualReturnDate && new Date(t.actualReturnDate) >= monthStart
        ).length;
        
        return {
          totalItems: state.inventory.length,
          totalQuantity: state.inventory.reduce((sum, item) => sum + item.quantityAvailable, 0),
          activeBorrows: state.transactions.filter((t) => t.status === 'Borrowed').length,
          overdueItems: state.transactions.filter((t) => t.status === 'Overdue').length,
          returnedThisMonth,
          categoryBreakdown,
          recentTransactions,
        };
      },
    }),
    {
      name: 'vnit-embedded-labs-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        inventory: state.inventory,
        transactions: state.transactions,
        settings: state.settings,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // Load sample data if inventory is empty after hydration
        if (state && state.inventory.length === 0) {
          state.inventory = getSampleInventory();
        }
      },
    }
  )
);

export { generateId, calculateItemStatus, calculateTransactionStatus, simpleHash };
