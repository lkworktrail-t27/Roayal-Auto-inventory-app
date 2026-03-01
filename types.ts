
export type OrderStatus = 'Completed' | 'Pending' | 'Received' | 'Out of Stock';
export type PaymentType = 'Cash' | 'Credit';
export type TransactionType = 'Sales' | 'Purchase' | 'Expense';
export type CashTransactionType = 'Income' | 'Expense';

// Added User interface to fix import error in components/Login.tsx
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'STAFF';
}

export interface Product {
  sku: string;
  name: string;
  brand: string;
  category: string;
  stock: number;
  price: number;
  cost_price: number;
  supplier: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  size?: string;
  variation?: string;
  lowStockThreshold?: number;
  lastUpdated?: string;
}

export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
  total: number;
  size?: string;
  variation?: string;
}

export interface Order {
  id: string;
  date: string;
  customer?: string;
  customerPhone?: string;
  supplier?: string;
  amount: number;
  paidAmount?: number; // Added to track partial payments
  paymentType: PaymentType;
  status: OrderStatus;
  items: OrderItem[];
  type: 'Sales' | 'Purchase';
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

export interface CashTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: CashTransactionType;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  location?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  totalPurchases?: number;
}

export interface AppState {
  inventory: Product[];
  sales: Order[];
  purchases: Order[];
  expenses: Expense[];
  suppliers: Supplier[];
  customers: Customer[];
  cashBox: CashTransaction[];
  lastImported?: string;
}
