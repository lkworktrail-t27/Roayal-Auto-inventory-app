
import React, { useState, useMemo } from 'react';
import { translations } from '../App';
import { 
  Banknote, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  X,
  History
} from 'lucide-react';
import { CashTransaction, CashTransactionType } from '../types';

interface CashBoxProps {
  transactions: CashTransaction[];
  onAddTransaction: (t: CashTransaction) => void;
  language?: 'en' | 'bn';
}

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'all';

const CashBox: React.FC<CashBoxProps> = ({ transactions, onAddTransaction, language = 'en' }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ description: '', amount: 0, type: 'Income' as CashTransactionType });
  const t = (key: keyof typeof translations.en) => translations[language][key] || key;

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(tr => {
      if (timeframe === 'all') return true;
      const tDate = new Date(tr.date);
      const diffDays = Math.ceil(Math.abs(now.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24));
      if (timeframe === 'daily') return tDate.toDateString() === now.toDateString();
      if (timeframe === 'weekly') return diffDays <= 7;
      if (timeframe === 'monthly') return diffDays <= 30;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, timeframe]);

  const stats = useMemo(() => {
    const totalIncome = transactions.filter(tr => tr.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(tr => tr.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
    return { balance: totalIncome - totalExpense };
  }, [transactions]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">{t('cashBox')}</h2>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'bn' ? 'ব্যালেন্স:' : 'Current Balance'}</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <p className="text-2xl font-black text-blue-600">৳{Math.round(stats.balance).toLocaleString()}</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
          >
            <Plus size={14} /> {language === 'bn' ? 'যোগ করুন' : 'Add Entry'}
          </button>
        </div>
      </div>

      <div className="bg-white p-1 rounded-2xl border border-slate-200 flex w-full shadow-sm overflow-x-auto no-scrollbar">
        {(['daily', 'weekly', 'monthly', 'all'] as Timeframe[]).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`flex-1 min-w-[80px] px-3 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              timeframe === tf ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            {t(tf as any)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{language === 'bn' ? 'সাম্প্রতিক লেনদেন' : 'Recent Activity'}</h3>
        {filteredTransactions.map(tr => (
          <div key={tr.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                tr.type === 'Income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {tr.type === 'Income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 leading-tight truncate max-w-[150px]">{tr.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Calendar size={10} className="text-slate-300" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tr.date}</p>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-lg font-black ${tr.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {tr.type === 'Income' ? '+' : '-'}৳{Math.round(tr.amount).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-white z-[70] flex flex-col p-0 overflow-y-auto">
          <div className="px-6 pt-12 pb-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{language === 'bn' ? 'ক্যাশ এন্ট্রি' : 'New Cash Entry'}</h3>
            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400">
              <X size={28} />
            </button>
          </div>
          <form className="p-6 space-y-6" onSubmit={(e) => {
            e.preventDefault();
            onAddTransaction({ id: `CB-${Date.now()}`, date: new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), ...formData, amount: Math.round(formData.amount) });
            setIsModalOpen(false);
          }}>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Description</label>
              <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full h-16 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-lg font-bold text-black" placeholder="Reason for entry..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Amount (৳)</label>
                <input 
                  required 
                  type="number" 
                  step="1" 
                  min="0"
                  onKeyDown={(e) => e.key === '-' && e.preventDefault()}
                  value={formData.amount} 
                  onChange={e => setFormData({...formData, amount: Math.max(0, parseFloat(e.target.value) || 0)})} 
                  className="w-full h-16 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-xl font-black text-black" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as CashTransactionType})} className="w-full h-16 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-bold text-black">
                  <option value="Income">Cash in (+)</option>
                  <option value="Expense">Cash Withdraw (-)</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full h-16 bg-slate-900 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-transform">
              Log Transaction
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CashBox;
