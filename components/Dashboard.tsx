
import React, { useMemo, useState } from 'react';
import { AppState } from '../types';
import { translations } from '../App';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Box,
  CheckCircle2,
  BarChart3,
  Calendar,
  CreditCard,
  Target,
  Layers
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

interface DashboardProps {
  state: AppState;
  setCurrentView: (view: any) => void;
  language?: 'en' | 'bn';
}

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'all';

const Dashboard: React.FC<DashboardProps> = ({ state, setCurrentView, language = 'en' }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('weekly');
  const t = (key: keyof typeof translations.en) => translations[language][key] || key;

  const stats = useMemo(() => {
    const now = new Date();
    const filterByDate = (dateStr: string) => {
      if (timeframe === 'all') return true;
      const date = new Date(dateStr);
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (timeframe === 'daily') return date.toDateString() === now.toDateString();
      if (timeframe === 'weekly') return diffDays <= 7;
      if (timeframe === 'monthly') return diffDays <= 30;
      return true;
    };

    const filteredSales = state.sales.filter(s => filterByDate(s.date));
    const filteredExpenses = state.expenses.filter(e => filterByDate(e.date));
    const revenue = filteredSales.reduce((acc, curr) => acc + curr.amount, 0);
    const expenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    // Calculate COGS for profit
    const cogs = filteredSales.reduce((totalCogs, sale) => {
      return totalCogs + sale.items.reduce((itemCogs, item) => {
        let itemCost = item.cost_price;
        if (itemCost === undefined) {
           const product = state.inventory.find(p => p.sku === item.sku);
           itemCost = product ? product.cost_price : 0;
        }
        return itemCogs + (item.qty * itemCost);
      }, 0);
    }, 0);

    const profit = revenue - cogs - expenses;
    const inventoryValue = state.inventory.reduce((acc, curr) => acc + (curr.stock * curr.price), 0);
    const totalCost = state.inventory.reduce((acc, curr) => acc + (curr.stock * curr.cost_price), 0);
    return { revenue, expenses, profit, inventoryValue, totalCost };
  }, [state, timeframe]);

  const chartData = useMemo(() => {
    if (timeframe === 'all') {
      // Group by month
      const months: {[key: string]: number} = {};
      state.sales.forEach(s => {
        const date = new Date(s.date);
        const key = date.toLocaleString('default', { month: 'short' });
        months[key] = (months[key] || 0) + s.amount;
      });
      return Object.entries(months).map(([name, revenue]) => ({ name, revenue }));
    } else {
      // Group by day for daily/weekly/monthly views (simplified)
      const days: {[key: string]: number} = {};
      state.sales.forEach(s => {
        const date = new Date(s.date);
        const key = date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' });
        days[key] = (days[key] || 0) + s.amount;
      });
      return Object.entries(days).map(([name, revenue]) => ({ name, revenue }));
    }
  }, [timeframe, state.sales, language]);

  const PremiumStatCard = ({ title, value, icon: Icon, color, isHero = false }: any) => (
    <div className={`
      relative group overflow-hidden bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
      rounded-[2rem] p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95
      ${isHero ? 'col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none' : ''}
    `}>
      <div className="flex flex-col h-full justify-between gap-4">
        <div className="flex items-center justify-between">
          <div className={`
            p-3 rounded-2xl shadow-inner
            ${isHero ? 'bg-white/10 text-blue-400' : `${color} bg-opacity-10 ${color.replace('bg-', 'text-')}`}
          `}>
            <Icon size={isHero ? 28 : 22} strokeWidth={2.5} />
          </div>
          <div className={`h-2 w-2 rounded-full animate-pulse ${isHero ? 'bg-blue-400' : color.replace('bg-', 'bg-')}`}></div>
        </div>
        
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isHero ? 'text-slate-400' : 'text-slate-400'}`}>
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl md:text-3xl font-black tracking-tight ${isHero ? 'text-white' : 'text-slate-900'}`}>
              ৳{Math.round(value).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>
      
      {/* Decorative Gradient Background for Hero */}
      {isHero && (
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/20 blur-[60px] rounded-full pointer-events-none"></div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('welcomeBack')}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Operational Overview</p>
          </div>
          <button className="h-12 w-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 active:scale-90 transition-all" onClick={() => setCurrentView('sales')}>
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>
        
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200/60 flex w-full shadow-sm overflow-x-auto no-scrollbar">
          {(['daily', 'weekly', 'monthly', 'all'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`flex-1 min-w-[80px] px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                timeframe === tf ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t(tf as any)}
            </button>
          ))}
        </div>
      </div>

      {/* 2x2 Premium Grid System */}
      <div className="grid grid-cols-2 gap-4">
        {/* Main Hero Card */}
        <PremiumStatCard 
          title={`${t(timeframe === 'all' ? 'allTime' : timeframe as any)} ${t('revenue')}`} 
          value={stats.revenue} 
          icon={DollarSign} 
          isHero={true} 
        />
        
        {/* The 2x2 Grid Members */}
        <PremiumStatCard 
          title={t('netProfit')} 
          value={stats.profit} 
          icon={TrendingUp} 
          color="bg-emerald-500" 
        />
        <PremiumStatCard 
          title={t('expense')} 
          value={stats.expenses} 
          icon={ArrowDownRight} 
          color="bg-rose-500" 
        />
        <PremiumStatCard 
          title={t('stockValue')} 
          value={stats.inventoryValue} 
          icon={Package} 
          color="bg-indigo-500" 
        />
        <PremiumStatCard 
          title={t('totalCost')} 
          value={stats.totalCost} 
          icon={CreditCard} 
          color="bg-amber-500" 
        />
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-slate-800 flex items-center gap-3 uppercase text-[10px] tracking-[0.2em]">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BarChart3 size={16} /></div> 
            {t('financials')}
          </h3>
          <div className="h-2 w-12 bg-slate-100 rounded-full"></div>
        </div>
        <div className="h-48 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 800}} />
              <YAxis hide />
              <Tooltip 
                formatter={(value: any) => [`৳${Math.round(value).toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-rose-500 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-rose-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <AlertTriangle size={80} />
        </div>
        <div className="relative z-10">
          <h4 className="font-black mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em]">
            <AlertTriangle size={18} className="text-white animate-pulse" /> {t('lowStockAlerts')}
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {state.inventory.filter(p => p.stock < (p.lowStockThreshold || 10) && p.stock > 0).slice(0, 3).map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all cursor-default group">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center">
                    <Box size={14} />
                  </div>
                  <span className="text-sm font-bold truncate max-w-[140px] md:max-w-none">{p.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase opacity-60">Remaining</span>
                  <span className="text-xs font-black bg-white text-rose-600 px-4 py-1.5 rounded-xl shadow-lg shadow-black/5">{p.stock}</span>
                </div>
              </div>
            ))}
            {state.inventory.filter(p => p.stock < (p.lowStockThreshold || 10) && p.stock > 0).length === 0 && (
              <div className="text-center py-4 bg-white/5 rounded-2xl border border-dashed border-white/20">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">No Low Stock Alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
