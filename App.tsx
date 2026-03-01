
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  ShoppingCart, 
  ArrowUpRight, 
  Wallet, 
  History, 
  Truck, 
  BarChart3, 
  LogOut,
  ChevronRight,
  Bell,
  Banknote,
  Languages,
  LayoutGrid,
  ChevronLeft,
  Zap,
  Clock,
  Plus,
  Activity,
  ArrowRightCircle,
  Sparkles,
  Receipt,
  PlusCircle,
  ArrowDownCircle,
  Sun,
  Moon,
  User as UserIcon,
  MessageSquare,
  ChevronDown,
  Dot,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import TransactionTable from './components/TransactionTable';
import Financials from './components/Financials';
import OrderHistory from './components/OrderHistory';
import Suppliers from './components/Suppliers';
import Expenses from './components/Expenses';
import CashBox from './components/CashBox';
import Login from './components/Login';
import { Product, Order, Expense, Supplier, AppState, CashTransaction, User, Customer } from './types';

export const translations = {
  en: {
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    salesOrders: 'Sales',
    purchaseOrders: 'Purchase',
    cashBox: 'Cash Box',
    expenses: 'Expenses',
    financials: 'Accounting',
    finance: 'Accounting',
    orderHistory: 'History',
    suppliers: 'Suppliers',
    mainMenu: 'Menu Hub',
    transactions: 'Transactions',
    analytics: 'Analytics',
    logout: 'Logout',
    operational: 'Live',
    welcomeBack: "Welcome back",
    newSale: 'New Sale',
    revenue: 'Revenue',
    netProfit: 'Profit',
    stockValue: 'Stock Value',
    totalCost: 'Total Cost',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    allTime: 'All',
    income: 'Income',
    expense: 'Expense',
    balance: 'Balance',
    description: 'Description',
    amount: 'Amount of Money',
    date: 'Date',
    type: 'Type',
    actions: 'Actions',
    lowStockAlerts: 'Low Stock',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    addSale: 'New Sale',
    addExpense: 'Log Cost',
    addProduct: 'Add Product',
    purchasePrice: 'Purchase Price',
    importCSV: 'Import CSV',
    exportCSV: 'Export CSV',
    sampleCSV: 'Sample CSV',
    customer: 'Customer',
    supplier: 'Supplier',
    finalizeOrder: 'Finalize Order',
    newTransaction: 'New Record',
    exportLedger: 'Export Ledger',
    category: 'Category',
    incomeStatement: 'Income Statement',
    grossProfit: 'Gross Profit',
    netIncome: 'Net Income',
    liquidCash: 'Liquid Cash',
    stockInvestment: 'Stock Investment',
    audit: 'Quick Audit',
    manageProducts: 'Manage Products',
    addSupplier: 'Add Supplier',
    item: 'Item',
    qty: 'Qty',
    total: 'Total',
    search: 'Search...',
    newExpense: 'New Expense',
    spentTotal: 'Total Spent',
    topCategory: 'Top Category',
    edit: 'Edit',
    remove: 'Remove',
    billTo: 'Bill To',
    paymentMethod: 'Payment Method',
    grandTotal: 'Grand Total',
    profile: 'Profile',
    notifications: 'Notifications',
    messages: 'Messages',
    admin: 'Administrator',
    viewAll: 'View All',
    brand: 'Brand',
    filters: 'Filters',
    clearFilters: 'Clear Filters'
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড',
    inventory: 'ইনভেন্টরি',
    salesOrders: 'বিক্রয়',
    purchaseOrders: 'ক্রয়',
    cashBox: 'ক্যাশ বক্স',
    expenses: 'খরচ',
    financials: 'একাউন্টিং',
    finance: 'একাউন্টিং',
    orderHistory: 'ইতিহাস',
    suppliers: 'সরবরাহকারী',
    mainMenu: 'মেনু হাব',
    transactions: 'লেনদেন',
    analytics: 'বিশ্লেষণ',
    logout: 'লগআউট',
    operational: 'সচল',
    welcomeBack: 'স্বাগতম',
    newSale: 'নতুন বিক্রয়',
    revenue: 'আয়',
    netProfit: 'নিট লাভ',
    stockValue: 'স্টক মূল্য',
    totalCost: 'মোট খরচ',
    daily: 'দৈনিক',
    weekly: 'সাপ্তাহিক',
    monthly: 'মাসিক',
    allTime: 'সর্বমোট',
    income: 'আয়',
    expense: 'ব্যয়',
    balance: 'ব্যালেন্স',
    description: 'বিবরণ',
    amount: 'টাকার পরিমাণ',
    date: 'তারিখ',
    type: 'ধরন',
    actions: 'অ্যাকশন',
    lowStockAlerts: 'কম স্টক',
    recentActivity: 'সাম্প্রতিক কার্যক্রম',
    quickActions: 'কুইক অ্যাকশন',
    addSale: 'নতুন সেল',
    addExpense: 'খরচ যোগ',
    addProduct: 'পণ্য যোগ',
    purchasePrice: 'ক্রয়মূল্য',
    importCSV: 'ইম্পোর্ট সিএসভি',
    exportCSV: 'এক্সপোর্ট সিএসভি',
    sampleCSV: 'স্যাম্পল সিএসভি',
    customer: 'গ্রাহক',
    supplier: 'সরবরাহকারী',
    finalizeOrder: 'অর্ডার সম্পন্ন করুন',
    newTransaction: 'নতুন রেকর্ড',
    exportLedger: 'লেজার এক্সপোর্ট',
    category: 'বিভাগ',
    incomeStatement: 'আয় বিবরণী',
    grossProfit: 'মোট লাভ',
    netIncome: 'নিট আয়',
    liquidCash: 'নগদ টাকা',
    stockInvestment: 'স্টক ইনভেস্টমেন্ট',
    audit: 'কুইক অডিট',
    manageProducts: 'পণ্য পরিচালনা',
    addSupplier: 'সরবরাহকারী যোগ',
    item: 'পণ্য',
    qty: 'পরিমাণ',
    total: 'মোট',
    search: 'অনুসন্ধান...',
    newExpense: 'নতুন খরচ',
    spentTotal: 'মোট ব্যয়',
    topCategory: 'শীর্ষ বিভাগ',
    edit: 'সম্পাদনা',
    remove: 'মুছে ফেলুন',
    billTo: 'কার নামে',
    paymentMethod: 'পেমেন্ট মাধ্যম',
    grandTotal: 'সর্বমোট',
    profile: 'প্রোফাইল',
    notifications: 'নোটিফিকেশন',
    messages: 'মেসেজ',
    admin: 'অ্যাডমিনিস্ট্রেটর',
    viewAll: 'সব দেখুন',
    brand: 'ব্র্যান্ড',
    filters: 'ফিল্টার',
    clearFilters: 'ফিল্টার মুছুন'
  }
};

const INITIAL_STATE: AppState = {
  inventory: [],
  sales: [],
  purchases: [],
  expenses: [],
  suppliers: [],
  cashBox: [],
  customers: [],
  lastImported: undefined
};

type View = 'home' | 'dashboard' | 'inventory' | 'sales' | 'purchase' | 'costs' | 'finance' | 'history' | 'suppliers' | 'cashbox';
type Language = 'en' | 'bn';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Merge with initial state structure to ensure all fields exist
        setState(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse state', e);
      }
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state));
  }, [state]);

  const [currentView, setCurrentView] = useState<View>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Default to light unless 'dark' is explicitly saved
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'light';
  });
  const [toast, setToast] = useState<{message: string, show: boolean}>({ message: '', show: false });
  const mainRef = useRef<HTMLDivElement>(null);

  const t = (key: keyof typeof translations.en) => (translations[language] as any)[key] || key;

  // Close profile on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync theme with HTML class and localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Reset scroll to top on view change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentView]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 3000);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    showToast(language === 'bn' ? `স্বাগতম, ${loggedInUser.name}` : `Welcome back, ${loggedInUser.name}`);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('home');
    setIsProfileOpen(false);
    showToast(language === 'bn' ? 'লগআউট সফল হয়েছে' : 'Logged out successfully');
  };

  const updateInventory = (products: Product[]) => {
    setState(prev => ({ ...prev, inventory: products }));
  };

  const addSupplier = (supplier: Supplier) => {
    setState(prev => ({ ...prev, suppliers: [...prev.suppliers, supplier] }));
    showToast("Supplier added successfully");
  };

  const addCustomer = (customer: Customer) => {
    setState(prev => ({ ...prev, customers: [...prev.customers, customer] }));
    showToast("Customer saved successfully");
  };

  const updateSupplier = (updatedSupplier: Supplier) => {
    setState(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s)
    }));
    showToast("Supplier updated successfully");
  };

  const updateLastImported = (dateStr: string) => {
    setState(prev => ({ ...prev, lastImported: dateStr }));
  };

  const addOrder = (order: Order) => {
    setState(prev => {
      const isSales = order.type === 'Sales';
      const newState = { ...prev };
      if (isSales) newState.sales = [...prev.sales, order];
      else newState.purchases = [...prev.purchases, order];
      
      const paidAmt = order.paidAmount || 0;
      if (paidAmt > 0) {
        const cashEntry: CashTransaction = {
          id: `CB-${Date.now().toString().slice(-4)}`,
          date: order.date,
          description: `${order.type} Order ${order.id} (${order.customer || order.supplier}) - Paid: ${Math.round(paidAmt)}`,
          amount: Math.round(paidAmt),
          type: isSales ? 'Income' : 'Expense'
        };
        newState.cashBox = [...prev.cashBox, cashEntry];
      }
      
      // Update inventory based on items in order
      newState.inventory = prev.inventory.map(p => {
        const item = order.items.find(oi => oi.sku === p.sku);
        if (item) {
          const newStock = isSales ? p.stock - item.qty : p.stock + item.qty;
          const threshold = p.lowStockThreshold || 10;
          return {
            ...p,
            stock: newStock,
            status: newStock <= 0 ? 'Out of Stock' : newStock < threshold ? 'Low Stock' : 'In Stock',
            lastUpdated: new Date().toLocaleString()
          };
        }
        return p;
      });

      // Update customer total purchases if applicable
      if (isSales && order.customer) {
        const customerIndex = newState.customers.findIndex(c => c.name === order.customer);
        if (customerIndex >= 0) {
          const customer = newState.customers[customerIndex];
          const newTotal = (customer.totalPurchases || 0) + order.amount;
          newState.customers[customerIndex] = { ...customer, totalPurchases: newTotal };
        }
      }

      return newState;
    });
    showToast(`${order.type} order finalized`);
  };

  const handleOrderPayment = (orderId: string, amount: number) => {
    setState(prev => {
      let isSale = true;
      let order = prev.sales.find(s => s.id === orderId);
      
      if (!order) {
        order = prev.purchases.find(p => p.id === orderId);
        isSale = false;
      }
      
      if (!order) return prev;
      
      const newPaidAmount = (order.paidAmount || 0) + amount;
      const updatedOrder = { ...order, paidAmount: newPaidAmount };
      
      if (newPaidAmount >= order.amount) {
          updatedOrder.paymentType = 'Cash'; 
          updatedOrder.status = 'Completed';
      }

      const newSales = isSale 
        ? prev.sales.map(s => s.id === orderId ? updatedOrder : s)
        : prev.sales;
        
      const newPurchases = !isSale
        ? prev.purchases.map(p => p.id === orderId ? updatedOrder : p)
        : prev.purchases;

      const cashEntry: CashTransaction = {
        id: `CB-${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }),
        description: `${isSale ? 'Credit Collection' : 'Bill Payment'}: ${order.id} (${isSale ? order.customer : order.supplier})`,
        amount: Math.round(amount),
        type: isSale ? 'Income' : 'Expense'
      };

      return {
        ...prev,
        sales: newSales,
        purchases: newPurchases,
        cashBox: [...prev.cashBox, cashEntry]
      };
    });
    showToast(language === 'bn' ? 'পেমেন্ট সফলভাবে রেকর্ড করা হয়েছে' : "Payment recorded successfully");
  };

  const addExpense = (expense: Expense) => {
    setState(prev => {
      const newExpense = { ...expense, amount: Math.round(expense.amount) };
      
      const cashEntry: CashTransaction = {
        id: `CB-${Date.now().toString().slice(-4)}`,
        date: expense.date,
        description: `Expense: ${expense.description} (${expense.category})`,
        amount: Math.round(expense.amount),
        type: 'Expense'
      };

      return {
        ...prev,
        expenses: [...prev.expenses, newExpense],
        cashBox: [...prev.cashBox, cashEntry]
      };
    });
    showToast("Expense logged successfully");
  };

  const addCashTransaction = (transaction: CashTransaction) => {
    setState(prev => ({ ...prev, cashBox: [...prev.cashBox, { ...transaction, amount: Math.round(transaction.amount) }] }));
    showToast(`Cash ${transaction.type.toLowerCase()} logged`);
  };

  const deleteOrder = (orderId: string, type: 'Sales' | 'Purchase') => {
    if (!window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি এই রেকর্ডটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this record? This will revert stock changes.')) {
      return;
    }

    setState(prev => {
      const isSales = type === 'Sales';
      const orderList = isSales ? prev.sales : prev.purchases;
      const orderToDelete = orderList.find(o => o.id === orderId);
      
      if (!orderToDelete) return prev;

      // Revert Inventory
      const newInventory = prev.inventory.map(p => {
        const item = orderToDelete.items.find(oi => oi.sku === p.sku);
        if (item) {
          // If it was a sale, we subtracted stock, so now we add it back.
          // If it was a purchase, we added stock, so now we subtract it.
          const newStock = isSales ? p.stock + item.qty : Math.max(0, p.stock - item.qty);
           const threshold = p.lowStockThreshold || 10;
          return {
            ...p,
            stock: newStock,
            status: (newStock <= 0 ? 'Out of Stock' : newStock < threshold ? 'Low Stock' : 'In Stock') as 'Out of Stock' | 'Low Stock' | 'In Stock',
            lastUpdated: new Date().toLocaleString()
          };
        }
        return p;
      });

      // Remove Order
      const newOrderList = orderList.filter(o => o.id !== orderId);
      
      // Remove associated CashBox entries
      // We look for descriptions containing the Order ID to remove related financial records
      const newCashBox = prev.cashBox.filter(c => !c.description.includes(`Order ${orderId}`) && !c.description.includes(`: ${orderId}`));

      // Update customer total purchases if applicable
      let newCustomers = prev.customers;
      if (isSales && orderToDelete.customer) {
        newCustomers = prev.customers.map(c => {
          if (c.name === orderToDelete.customer) {
            return { ...c, totalPurchases: Math.max(0, (c.totalPurchases || 0) - orderToDelete.amount) };
          }
          return c;
        });
      }

      return {
        ...prev,
        inventory: newInventory,
        sales: isSales ? newOrderList : prev.sales,
        purchases: !isSales ? newOrderList : prev.purchases,
        cashBox: newCashBox,
        customers: newCustomers
      };
    });
    showToast(language === 'bn' ? 'রেকর্ড মুছে ফেলা হয়েছে' : `${type} record deleted`);
  };

  const recentActivities = useMemo(() => {
    const combined = [
      ...state.sales.map(s => ({ ...s, category: 'Sales' as const })),
      ...state.purchases.map(p => ({ ...p, category: 'Purchase' as const })),
      ...state.expenses.map(e => ({ ...e, category: 'Expense' as const }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return combined.slice(0, 3);
  }, [state.sales, state.purchases, state.expenses]);

  if (!user) {
    return (
      <React.StrictMode>
        <Login onLogin={handleLogin} language={language} setLanguage={setLanguage} />
      </React.StrictMode>
    );
  }

  const HubItem = ({ id, labelKey, icon: Icon, color }: { id: View, labelKey: keyof typeof translations.en, icon: any, color: string }) => (
    <button
      onClick={() => setCurrentView(id)}
      className="group relative flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] transition-all active:scale-95 hover:shadow-2xl hover:-translate-y-1.5"
    >
      <div className={`mb-3 p-3.5 rounded-2xl bg-${color}-500 text-white shadow-xl shadow-${color}-500/30 transition-transform group-hover:scale-110`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-700 dark:text-slate-300 text-center leading-tight">
        {t(labelKey)}
      </span>
    </button>
  );

  const HomeHub = () => (
    <div className="animate-in fade-in zoom-in-95 duration-700 max-w-4xl mx-auto py-6 space-y-10">
      <div className="text-center px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mb-3">
          <Sparkles size={12} className="animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest">{t('operational')} NOW</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight uppercase">
          {t('welcomeBack')}, <span className="text-blue-600 dark:text-blue-400">{user.name}</span>
        </h1>
        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">
          {new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Main Grid Hub */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 px-4">
        <HubItem id="dashboard" labelKey="dashboard" icon={LayoutDashboard} color="blue" />
        <HubItem id="inventory" labelKey="inventory" icon={Boxes} color="indigo" />
        <HubItem id="sales" labelKey="salesOrders" icon={ArrowUpRight} color="emerald" />
        <HubItem id="purchase" labelKey="purchaseOrders" icon={ShoppingCart} color="amber" />
        <HubItem id="cashbox" labelKey="cashBox" icon={Banknote} color="purple" />
        <HubItem id="costs" labelKey="expenses" icon={Wallet} color="rose" />
        <HubItem id="finance" labelKey="financials" icon={BarChart3} color="cyan" />
        <HubItem id="history" labelKey="orderHistory" icon={History} color="slate" />
        <HubItem id="suppliers" labelKey="suppliers" icon={Truck} color="orange" />
      </div>

      {/* Premium Horizontal Quick Actions Grid */}
      <div className="px-4 space-y-4">
        <div className="flex items-center gap-3 px-2">
           <Zap size={18} className="text-amber-500 fill-amber-500/20" />
           <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">{t('quickActions')}</h3>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
           {/* Action 1: New Sale */}
           <button 
             onClick={() => setCurrentView('sales')} 
             className="group relative flex flex-col items-center justify-center p-5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.25rem] shadow-xl shadow-blue-500/20 active:scale-95 transition-all overflow-hidden border border-white/10"
           >
             <div className="mb-3 h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
               <ArrowUpRight size={28} strokeWidth={3} className="text-white" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-white">{t('addSale')}</span>
             <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/10 rounded-full blur-xl"></div>
           </button>

           {/* Action 2: Log Cost */}
           <button 
             onClick={() => setCurrentView('costs')} 
             className="group relative flex flex-col items-center justify-center p-5 bg-slate-900 dark:bg-slate-800 rounded-[2.25rem] shadow-xl shadow-slate-900/20 active:scale-95 transition-all overflow-hidden border border-slate-800"
           >
             <div className="mb-3 h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
               <Wallet size={28} className="text-rose-400" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t('addExpense')}</span>
             <div className="absolute right-0 bottom-0 w-16 h-8 bg-indigo-500/10 blur-2xl rounded-full"></div>
           </button>

           {/* Action 3: Add Product */}
           <button 
             onClick={() => setCurrentView('inventory')} 
             className="group relative flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.25rem] shadow-lg active:scale-95 transition-all overflow-hidden hover:border-indigo-200"
           >
             <div className="mb-3 h-14 w-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
               <Boxes size={28} className="text-indigo-600 dark:text-indigo-400" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{t('addProduct')}</span>
             <div className="absolute -left-2 -bottom-2 w-10 h-10 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-lg"></div>
           </button>
        </div>
      </div>

      <div className="px-4 space-y-4 pb-4">
        <div className="flex items-center gap-3 px-2">
           <Clock size={18} className="text-slate-400" />
           <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">{t('recentActivity')}</h3>
        </div>
        <div className="space-y-3">
          {recentActivities.map((act: any) => (
            <div key={act.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700">
              <div className="flex items-center gap-4">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${
                  act.category === 'Sales' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 
                  act.category === 'Purchase' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                }`}>
                  {act.category === 'Sales' ? <ArrowUpRight size={20} /> : 
                   act.category === 'Purchase' ? <ShoppingCart size={20} /> : <Wallet size={20} />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200 leading-tight truncate">
                    {act.customer || act.supplier || act.description}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">{act.date} • {act.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-base font-black ${act.category === 'Sales' ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'}`}>
                  ৳{Math.round(act.amount).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 flex justify-center pb-20">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-8 py-4 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-full font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <LogOut size={16} /> {t('logout')}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative font-sans selection:bg-blue-100 ${language === 'bn' ? 'lang-bn' : ''}`}>
      {/* Floating Sticky Header */}
      <div className="sticky top-0 z-[100] px-2 md:px-6 pt-2 md:pt-4 bg-transparent shrink-0">
        <header className="h-16 flex items-center justify-between px-4 md:px-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl max-w-7xl mx-auto safe-area-top">
          <div className="flex items-center gap-3">
            {currentView !== 'home' ? (
              <button 
                onClick={() => setCurrentView('home')}
                className="h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center active:scale-90 transition-transform hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <ChevronLeft size={24} />
              </button>
            ) : (
              <div className="h-10 w-10 bg-slate-900 dark:bg-slate-100 rounded-xl flex items-center justify-center shadow-xl text-white dark:text-slate-900">
                <Boxes size={22} strokeWidth={2.5} />
              </div>
            )}
            <div className={currentView === 'home' ? 'block' : 'hidden md:block'}>
              <h1 className="text-slate-900 dark:text-slate-100 font-black text-sm tracking-tight leading-none uppercase">Royal<span className="text-blue-600 dark:text-blue-400">Auto</span></h1>
              <p className="text-[8px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Inventory Pro Hub
              </p>
            </div>
          </div>

          {currentView !== 'home' && (
            <h2 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.3em] absolute left-1/2 -translate-x-1/2 hidden lg:block pointer-events-none">
              {t(currentView as any)}
            </h2>
          )}

          <div className="flex items-center gap-2 md:gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-lg transition-all hover:scale-105 active:scale-90"
              aria-label="Toggle Theme"
            >
              <div className="relative h-6 w-6">
                 <Sun size={24} className={`absolute transition-all duration-500 transform ${theme === 'dark' ? 'translate-y-0 opacity-100 rotate-0' : 'translate-y-8 opacity-0 rotate-90'}`} />
                 <Moon size={24} className={`absolute transition-all duration-500 transform ${theme === 'light' ? 'translate-y-0 opacity-100 rotate-0' : '-translate-y-8 opacity-0 -rotate-90'}`} />
              </div>
            </button>

            {/* Language Toggle */}
            <button 
              onClick={() => setLanguage(l => l === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all min-w-[64px] justify-center hover:bg-slate-800 dark:hover:bg-white"
            >
              <Languages size={14} className="text-blue-400 dark:text-blue-600" />
              {language === 'en' ? 'বাং' : 'EN'}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-2 p-1 pl-1 pr-2 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl transition-all hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 ${isProfileOpen ? 'ring-2 ring-blue-500/20' : ''}`}
              >
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
                  <UserIcon size={18} strokeWidth={2.5} />
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Menu Dropdown */}
              <div className={`absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl z-[200] overflow-hidden transition-all duration-300 origin-top-right transform ${isProfileOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                {/* Header Section */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white leading-none">{user.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                        {user.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content Sections */}
                <div className="p-2">
                  {/* Notifications */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('notifications')}</h5>
                      <span className="h-4 px-1.5 bg-rose-500 text-white rounded text-[8px] font-black flex items-center">2</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex gap-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                        <div className="h-8 w-8 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                          <AlertTriangle size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">Monitor Stand out of stock</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase mt-1">2 mins ago</p>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex gap-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                        <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                          <CheckCircle2 size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">PO-001 Received from Global Imports</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase mt-1">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="p-4 pt-0">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('messages')}</h5>
                      <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{t('viewAll')}</button>
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center gap-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                        <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center font-black shrink-0">A</div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-800 dark:text-slate-200 leading-tight">Alice (Global Imports)</p>
                          <p className="text-[10px] font-bold text-slate-400 truncate mt-1">Hey, when will the payment be processed?</p>
                        </div>
                        <Dot className="text-blue-600 ml-auto shrink-0" size={32} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={handleLogout}
                    className="w-full h-12 flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all active:scale-95"
                  >
                    <LogOut size={14} /> {t('logout')}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </header>
      </div>

      {/* Main Content Area */}
      <main ref={mainRef} className="flex-1 overflow-y-auto custom-scrollbar relative bg-slate-50/50 dark:bg-slate-950/50">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 pt-4 md:pt-6">
          {currentView === 'home' ? (
            <HomeHub />
          ) : (
            <div className="animate-in slide-in-from-top-12 duration-700">
               {/* Render Sub-View Component */}
               {(() => {
                  switch (currentView) {
                    case 'dashboard': return <Dashboard state={state} setCurrentView={setCurrentView} language={language} />;
                    case 'inventory': return <Inventory inventory={state.inventory} suppliers={state.suppliers} onUpdate={updateInventory} onAddSupplier={addSupplier} onAddOrder={addOrder} showToast={showToast} lastImported={state.lastImported} onUpdateLastImported={updateLastImported} language={language} />;
                    case 'sales': return <TransactionTable title="Sales" data={state.sales} inventory={state.inventory} onAddOrder={addOrder} onDeleteOrder={deleteOrder} suppliers={state.suppliers} onAddSupplier={addSupplier} customers={state.customers} onAddCustomer={addCustomer} language={language} />;
                    case 'purchase': return <TransactionTable title="Purchase" data={state.purchases} inventory={state.inventory} onAddOrder={addOrder} onDeleteOrder={deleteOrder} suppliers={state.suppliers} onAddSupplier={addSupplier} language={language} />;
                    case 'costs': return <Expenses expenses={state.expenses} cashBox={state.cashBox} onAddExpense={addExpense} language={language} />;
                    case 'cashbox': return <CashBox transactions={state.cashBox} onAddTransaction={addCashTransaction} language={language} />;
                    case 'finance': return <Financials state={state} onRecordPayment={handleOrderPayment} language={language} />;
                    case 'history': return <OrderHistory sales={state.sales} purchases={state.purchases} inventory={state.inventory} language={language} />;
                    case 'suppliers': return <Suppliers suppliers={state.suppliers} inventory={state.inventory} purchases={state.purchases} onUpdateInventory={updateInventory} onAddSupplier={addSupplier} onUpdateSupplier={updateSupplier} language={language} />;
                    default: return <HomeHub />;
                  }
               })()}
            </div>
          )}
        </div>
      </main>

      {/* Toast Notification */}
      <div className={`
        fixed bottom-6 right-6 left-6 md:left-auto md:w-80 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 p-5 rounded-2xl shadow-2xl z-[200] border border-white/10 dark:border-slate-200 transition-all duration-300 transform
        ${toast.show ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}
      `}>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <Activity size={20} strokeWidth={3} className="animate-pulse" />
          </div>
          <p className="text-sm font-black tracking-tight leading-tight uppercase">{toast.message}</p>
        </div>
      </div>
    </div>
  );
};

export default App;
