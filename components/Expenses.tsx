
import React, { useState, useMemo } from 'react';
import { Expense, CashTransaction } from '../types';
import { translations } from '../App';
import { Plus, Wallet, Calendar, Tag, X, ArrowDownRight, Banknote, History as HistoryIcon } from 'lucide-react';

interface ExpensesProps {
  expenses: Expense[];
  cashBox: CashTransaction[];
  onAddExpense: (expense: Expense) => void;
  language?: 'en' | 'bn';
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, cashBox, onAddExpense, language = 'en' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ description: '', category: 'Utilities', amount: 0 });
  const t = (key: keyof typeof translations.en) => translations[language][key] || key;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || formData.amount <= 0) return;

    onAddExpense({
      id: `EXP-${Date.now()}`,
      date: new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      ...formData,
      amount: Math.round(formData.amount)
    });
    setIsModalOpen(false);
    setFormData({ description: '', category: 'Utilities', amount: 0 });
  };

  const totals = useMemo(() => {
    const totalSpent = expenses.reduce((a, b) => a + b.amount, 0);
    const income = cashBox.filter(tr => tr.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
    const expense = cashBox.filter(tr => tr.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
    const availableCash = income - expense;
    return { totalSpent, availableCash };
  }, [expenses, cashBox]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{t('expenses')}</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Operational Costs</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-14 px-8 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 transition-all"
        >
          <Plus size={18} strokeWidth={3} /> {t('newExpense')}
        </button>
      </div>

      {/* Money Amount Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center gap-5">
          <div className="h-14 w-14 bg-rose-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-rose-500/20">
            <ArrowDownRight size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{t('spentTotal')}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">৳{Math.round(totals.totalSpent).toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center gap-5">
          <div className="h-14 w-14 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Banknote size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{language === 'bn' ? 'নগদ টাকা' : 'Available Cash'}</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">৳{Math.round(totals.availableCash).toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
           <div className="flex items-center gap-2 px-2 mb-2">
             <HistoryIcon size={16} className="text-slate-400" />
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'bn' ? 'খরচের ইতিহাস' : 'Expense History'}</h3>
           </div>

           <div className="grid grid-cols-1 gap-4">
             {expenses.length === 0 && (
                <div className="py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                  <Wallet size={56} className="mb-4 opacity-20" />
                  <p className="text-[11px] font-black uppercase tracking-widest">{language === 'bn' ? 'কোন খরচ নেই' : 'No expenses logged'}</p>
                </div>
             )}

             {[...expenses].reverse().map(exp => (
               <div key={exp.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]">
                 <div className="flex justify-between items-start">
                   {/* Left Stack: Date, Description */}
                   <div className="flex flex-col gap-2 min-w-0">
                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                       <Calendar size={13} className="text-slate-300 dark:text-slate-600" />
                       {exp.date}
                     </div>
                     <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight truncate pr-4">
                       {exp.description}
                     </h3>
                   </div>

                   {/* Right Stack: Category, Amount */}
                   <div className="flex flex-col items-end gap-3 shrink-0">
                     <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 shadow-sm">
                       <Tag size={10} className="text-blue-500" />
                       {exp.category}
                     </span>
                     <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tighter">
                       -৳{Math.round(exp.amount).toLocaleString()}
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">{t('spentTotal')}</h4>
             <h3 className="text-4xl font-black mb-6 tracking-tighter relative z-10">৳{Math.round(totals.totalSpent).toLocaleString()}</h3>
             <div className="p-5 bg-white/5 rounded-2xl border border-white/10 relative z-10">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                 <Tag size={12} /> {t('topCategory')}
               </div>
               <p className="font-black text-xl tracking-tight">Utilities</p>
             </div>
             <div className="absolute right-0 bottom-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full"></div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('grandTotal')}</p>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
               ৳{Math.round(totals.totalSpent).toLocaleString()}
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">{language === 'bn' ? 'সর্বমোট খরচ করা টাকা' : 'Total money spent across all categories'}</p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[160] flex items-start md:items-center justify-center p-0 md:p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-b-[2.5rem] md:rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-top duration-500">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('newExpense')}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cost Registration</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">{t('description')}</label>
                <input required placeholder={language === 'bn' ? "উদাহরণ: বিদ্যুৎ বিল" : "e.g. Office Stationery"} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-semibold text-black focus:ring-4 focus:ring-blue-500/5 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">{t('category')}</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-bold text-black appearance-none">
                  <option>Utilities</option>
                  <option>Maintenance</option>
                  <option>Supplies</option>
                  <option>Salary</option>
                  <option>Rent</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">{t('amount')} (৳)</label>
                <input 
                  required 
                  type="number" 
                  step="1" 
                  min="0"
                  onKeyDown={(e) => e.key === '-' && e.preventDefault()}
                  value={formData.amount} 
                  onChange={e => setFormData({...formData, amount: Math.max(0, parseFloat(e.target.value) || 0)})} 
                  className="w-full h-16 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-xl font-black text-black focus:ring-4 focus:ring-blue-500/5 transition-all" 
                />
              </div>
              <button type="submit" className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black rounded-2xl shadow-xl hover:bg-slate-800 dark:hover:bg-white transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest active:scale-95">
                {language === 'bn' ? 'সেভ করুন' : 'Save Expense'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
    