
import React, { useMemo, useState } from 'react';
import { AppState, Order } from '../types';
import { translations } from '../App';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Info, BookText, CheckCircle, Calendar, User, X, AlertCircle, Download, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface FinancialsProps {
  state: AppState;
  onRecordPayment: (orderId: string, amount: number) => void;
  language?: 'en' | 'bn';
}

const Financials: React.FC<FinancialsProps> = ({ state, onRecordPayment, language = 'en' }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMode, setPaymentMode] = useState<'Full' | 'Partial'>('Full');
  const [partialAmount, setPartialAmount] = useState('');
  const [creditBookTab, setCreditBookTab] = useState<'receivables' | 'payables'>('receivables');
  const [reportTimeframe, setReportTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');
  const t = (key: keyof typeof translations.en) => translations[language][key] || key;

  const filterByDate = (dateStr: string, tf: 'daily' | 'weekly' | 'monthly' | 'all') => {
    if (tf === 'all') return true;
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (tf === 'daily') return date.toDateString() === now.toDateString();
    if (tf === 'weekly') return diffDays <= 7;
    if (tf === 'monthly') return diffDays <= 30;
    return true;
  };

  const generatePDF = (title: string, head: string[][], body: any[][], foot?: any[][]) => {
    const doc = new jsPDF() as any;
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(title.toUpperCase(), 14, 25);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleString()} | Timeframe: ${reportTimeframe.toUpperCase()}`, 14, 33);
    
    doc.autoTable({
      head,
      body,
      startY: 50,
      theme: 'striped',
      styles: { fontSize: 8 },
      foot: foot,
      footStyles: foot ? { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' } : undefined
    });
    doc.save(`${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  };

  const handleGenerateReport = (type: string) => {
    const filteredSales = state.sales.filter(s => filterByDate(s.date, reportTimeframe));
    const filteredPurchases = state.purchases.filter(p => filterByDate(p.date, reportTimeframe));
    const filteredExpenses = state.expenses.filter(e => filterByDate(e.date, reportTimeframe));

    if (type === 'Product Stock') {
      const head = [['SKU', 'PRODUCT', 'CATEGORY', 'STOCK', 'UNIT PRICE', 'TOTAL VALUE']];
      const body = state.inventory.map(p => [
        p.sku,
        p.name,
        p.category,
        p.stock.toString(),
        `TK ${Math.round(p.price).toLocaleString()}`,
        `TK ${Math.round(p.stock * p.price).toLocaleString()}`
      ]);
      const totalValue = state.inventory.reduce((acc, p) => acc + (p.stock * p.price), 0);
      const foot = [['', '', '', '', 'TOTAL VALUE', `TK ${Math.round(totalValue).toLocaleString()}`]];
      generatePDF('Product Stock Report', head, body, foot);
    } 
    else if (type === 'Purchase Report') {
      const head = [['DATE', 'ID', 'SUPPLIER', 'ITEMS', 'PAYMENT', 'AMOUNT']];
      const body = filteredPurchases.map(p => [
        p.date,
        p.id,
        p.supplier || 'N/A',
        p.items.reduce((acc, i) => acc + i.qty, 0).toString(),
        p.paymentType,
        `TK ${Math.round(p.amount).toLocaleString()}`
      ]);
      const total = filteredPurchases.reduce((acc, p) => acc + p.amount, 0);
      const foot = [['', '', '', '', 'TOTAL PURCHASE', `TK ${Math.round(total).toLocaleString()}`]];
      generatePDF('Purchase Report', head, body, foot);
    }
    else if (type === 'Sale Report') {
      const head = [['DATE', 'ID', 'CUSTOMER', 'ITEMS', 'PAYMENT', 'AMOUNT']];
      const body = filteredSales.map(s => [
        s.date,
        s.id,
        s.customer || 'Walk-in',
        s.items.reduce((acc, i) => acc + i.qty, 0).toString(),
        s.paymentType,
        `TK ${Math.round(s.amount).toLocaleString()}`
      ]);
      const total = filteredSales.reduce((acc, s) => acc + s.amount, 0);
      const foot = [['', '', '', '', 'TOTAL SALES', `TK ${Math.round(total).toLocaleString()}`]];
      generatePDF('Sale Report', head, body, foot);
    }
    else if (type === 'Expense Report') {
      const head = [['DATE', 'ID', 'CATEGORY', 'DESCRIPTION', 'AMOUNT']];
      const body = filteredExpenses.map(e => [
        e.date,
        e.id,
        e.category,
        e.description,
        `TK ${Math.round(e.amount).toLocaleString()}`
      ]);
      const total = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
      const foot = [['', '', '', 'TOTAL EXPENSE', `TK ${Math.round(total).toLocaleString()}`]];
      generatePDF('Expense Report', head, body, foot);
    }
    else if (type === 'Customer Ledger') {
      const head = [['CUSTOMER', 'TOTAL PURCHASES', 'PAID AMOUNT', 'DUE AMOUNT']];
      
      const customerMap = new Map();
      filteredSales.forEach(s => {
        const name = s.customer || 'Walk-in';
        if (!customerMap.has(name)) {
          customerMap.set(name, { total: 0, paid: 0 });
        }
        const data = customerMap.get(name);
        data.total += s.amount;
        data.paid += (s.paidAmount || 0);
      });

      const body = Array.from(customerMap.entries()).map(([name, data]) => [
        name,
        `TK ${Math.round(data.total).toLocaleString()}`,
        `TK ${Math.round(data.paid).toLocaleString()}`,
        `TK ${Math.round(data.total - data.paid).toLocaleString()}`
      ]);
      
      const totalSales = Array.from(customerMap.values()).reduce((acc, d) => acc + d.total, 0);
      const totalPaid = Array.from(customerMap.values()).reduce((acc, d) => acc + d.paid, 0);
      const totalDue = totalSales - totalPaid;
      
      const foot = [['GRAND TOTAL', `TK ${Math.round(totalSales).toLocaleString()}`, `TK ${Math.round(totalPaid).toLocaleString()}`, `TK ${Math.round(totalDue).toLocaleString()}`]];
      generatePDF('Customer Ledger Report', head, body, foot);
    }
    else if (type === 'Balance Sheet') {
      const revenue = filteredSales.reduce((a, b) => a + b.amount, 0);
      const cogs = Math.round(revenue * 0.55);
      const grossProfit = revenue - cogs;
      const opExpenses = filteredExpenses.reduce((a, b) => a + b.amount, 0);
      const netIncome = grossProfit - opExpenses;
      
      const inventoryValue = state.inventory.reduce((a, b) => a + (b.stock * b.cost_price), 0);
      const receivables = filteredSales.reduce((a, b) => a + (b.amount - (b.paidAmount || 0)), 0);
      const payables = filteredPurchases.reduce((a, b) => a + (b.amount - (b.paidAmount || 0)), 0);

      const head = [['ACCOUNT', 'AMOUNT']];
      const body = [
        ['ASSETS', ''],
        ['  Inventory Value', `TK ${Math.round(inventoryValue).toLocaleString()}`],
        ['  Accounts Receivable', `TK ${Math.round(receivables).toLocaleString()}`],
        ['LIABILITIES', ''],
        ['  Accounts Payable', `TK ${Math.round(payables).toLocaleString()}`],
        ['EQUITY & INCOME', ''],
        ['  Gross Revenue', `TK ${Math.round(revenue).toLocaleString()}`],
        ['  Cost of Goods Sold', `TK ${Math.round(cogs).toLocaleString()}`],
        ['  Operating Expenses', `TK ${Math.round(opExpenses).toLocaleString()}`],
        ['  Net Income', `TK ${Math.round(netIncome).toLocaleString()}`]
      ];
      generatePDF('Balance Sheet', head, body);
    }
  };

  const calculations = useMemo(() => {
    const revenue = state.sales.reduce((a, b) => a + b.amount, 0);
    const opExpenses = state.expenses.reduce((a, b) => a + b.amount, 0);
    // COGS estimation rounded
    const cogs = Math.round(revenue * 0.55); 
    const grossProfit = Math.round(revenue - cogs);
    const netIncome = Math.round(grossProfit - opExpenses);

    const cashRevenue = state.sales.filter(s => s.paymentType === 'Cash').reduce((a, b) => a + b.amount, 0);
    const creditRevenue = state.sales.filter(s => s.paymentType === 'Credit').reduce((a, b) => a + (b.amount - (b.paidAmount || 0)), 0);
    const totalPayables = state.purchases.reduce((a, b) => a + (b.amount - (b.paidAmount || 0)), 0);

    return { revenue, opExpenses, cogs, grossProfit, netIncome, cashRevenue, creditRevenue, totalPayables };
  }, [state]);

  const pendingCredits = useMemo(() => {
    // Sales that are Credit type and have amount remaining
    return state.sales.filter(s => s.paymentType === 'Credit' && (s.amount - (s.paidAmount || 0)) > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.sales]);

  const pendingPayables = useMemo(() => {
    // Purchases that have amount remaining
    return state.purchases.filter(p => (p.amount - (p.paidAmount || 0)) > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.purchases]);

  const handleConfirmPayment = () => {
    if (selectedOrder) {
      const remaining = selectedOrder.amount - (selectedOrder.paidAmount || 0);
      const amountToPay = paymentMode === 'Full' ? remaining : (parseFloat(partialAmount) || 0);
      
      if (amountToPay > 0 && amountToPay <= remaining) {
        onRecordPayment(selectedOrder.id, amountToPay);
        setSelectedOrder(null);
        setPaymentMode('Full');
        setPartialAmount('');
      }
    }
  };

  const FinanceRow = ({ label, value, isNegative, isTotal }: any) => (
    <div className={`flex justify-between py-4 ${isTotal ? 'bg-slate-50 dark:bg-slate-800 px-4 rounded-xl border border-slate-200 dark:border-slate-700 mt-4' : 'border-b border-slate-50 dark:border-slate-800'}`}>
      <span className={`text-sm ${isTotal ? 'font-bold text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>{label}</span>
      <span className={`text-sm font-bold ${isNegative ? 'text-red-500' : isTotal ? 'text-slate-900 dark:text-white text-lg' : 'text-slate-800 dark:text-slate-200'}`}>
        {isNegative ? `(৳${Math.round(value).toLocaleString()})` : `৳${Math.round(value).toLocaleString()}`}
      </span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Credit Book Section (Moved to Top) */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl"><BookText size={20} /></div>
                  {language === 'bn' ? 'বকেয়া খাতা' : 'Credit Book'}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1">{language === 'bn' ? 'বকেয়া পাওনা এবং দেনার তালিকা' : 'Manage receivables and payables'}</p>
              </div>
              
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button 
                  onClick={() => setCreditBookTab('receivables')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${creditBookTab === 'receivables' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
                >
                  Receivables
                </button>
                <button 
                  onClick={() => setCreditBookTab('payables')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${creditBookTab === 'payables' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
                >
                  Payables
                </button>
              </div>
            </div>

            {creditBookTab === 'receivables' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-end pb-2 border-b border-slate-50 dark:border-slate-800 mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'bn' ? 'মোট বকেয়া (পাবো)' : 'Total Pending'}</p>
                    <p className="text-xl font-black text-amber-600">৳{Math.round(calculations.creditRevenue).toLocaleString()}</p>
                </div>
                {pendingCredits.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <CheckCircle size={40} className="text-emerald-500/30 mb-3" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{language === 'bn' ? 'কোন বকেয়া নেই' : 'No Pending Receivables'}</p>
                  </div>
                ) : (
                  pendingCredits.map(sale => {
                    const remaining = sale.amount - (sale.paidAmount || 0);
                    return (
                      <div key={sale.id} className="group p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                            <User size={20} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">{sale.customer || (language === 'bn' ? 'অজানা গ্রাহক' : 'Unknown Customer')}</h4>
                            <div className="flex items-center gap-3 mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <span className="flex items-center gap-1"><Calendar size={12} /> {sale.date}</span>
                              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">{sale.id}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-lg font-black text-slate-900 dark:text-white">৳{Math.round(remaining).toLocaleString()}</p>
                            <p className="text-[9px] font-bold text-slate-400">Total: ৳{Math.round(sale.amount).toLocaleString()}</p>
                          </div>
                          <button 
                            onClick={() => { setSelectedOrder(sale); setPaymentMode('Full'); }}
                            className="h-12 px-5 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:bg-amber-600 active:scale-95 transition-all"
                          >
                            <CheckCircle size={14} strokeWidth={3} />
                            <span className="hidden sm:inline">{language === 'bn' ? 'জমা করুন' : 'Recv Money'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-end pb-2 border-b border-slate-50 dark:border-slate-800 mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'bn' ? 'মোট দেনা (দিবো)' : 'Total Payables'}</p>
                    <p className="text-xl font-black text-rose-600">৳{Math.round(calculations.totalPayables).toLocaleString()}</p>
                </div>
                {pendingPayables.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <CheckCircle size={40} className="text-emerald-500/30 mb-3" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{language === 'bn' ? 'কোন দেনা নেই' : 'No Pending Payables'}</p>
                  </div>
                ) : (
                  pendingPayables.map(purchase => {
                    const remaining = purchase.amount - (purchase.paidAmount || 0);
                    return (
                      <div key={purchase.id} className="group p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                            <User size={20} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">{purchase.supplier || (language === 'bn' ? 'অজানা সরবরাহকারী' : 'Unknown Supplier')}</h4>
                            <div className="flex items-center gap-3 mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <span className="flex items-center gap-1"><Calendar size={12} /> {purchase.date}</span>
                              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">{purchase.id}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-lg font-black text-rose-600 dark:text-rose-400">৳{Math.round(remaining).toLocaleString()}</p>
                            <p className="text-[9px] font-bold text-slate-400">Bill: ৳{Math.round(purchase.amount).toLocaleString()}</p>
                          </div>
                          <button 
                            onClick={() => { setSelectedOrder(purchase); setPaymentMode('Full'); }}
                            className="h-12 px-5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 hover:bg-rose-600 active:scale-95 transition-all"
                          >
                             <CheckCircle size={14} strokeWidth={3} />
                             <span className="hidden sm:inline">{language === 'bn' ? 'পরিশোধ করুন' : 'Pay Bill'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Income Statement */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t('incomeStatement')}</h3>
                <p className="text-xs text-slate-400 font-medium">{language === 'bn' ? 'নির্ধারিত সময়ের রিপোর্ট' : 'Condensed version for fiscal period'}</p>
              </div>
              <button className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"><Info size={18} /></button>
            </div>
            
            <div className="space-y-1">
              <FinanceRow label={language === 'bn' ? 'মোট আয়' : 'Gross Revenue'} value={calculations.revenue} />
              <FinanceRow label={language === 'bn' ? 'পণ্য খরচ' : 'Cost of Goods Sold (COGS)'} value={calculations.cogs} isNegative />
              <FinanceRow label={t('grossProfit')} value={calculations.grossProfit} isTotal />
              
              <div className="pt-8">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{language === 'bn' ? 'পরিচালন ব্যয়' : 'Operating Expenses'}</h4>
                <FinanceRow label={language === 'bn' ? 'পরিচালন খরচ' : 'Operating Expenses'} value={calculations.opExpenses} isNegative />
              </div>

              <div className="pt-4 mt-8 bg-slate-900 dark:bg-slate-800 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('netIncome')}</p>
                  <p className="text-xs text-slate-500">{language === 'bn' ? 'সব বাদ দেওয়ার পর' : 'After all deductions'}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-black">৳{Math.round(calculations.netIncome).toLocaleString()}</h2>
                  <p className="text-[10px] font-bold text-green-400 flex items-center justify-end gap-1">
                    <TrendingUp size={10} /> {( (calculations.netIncome / calculations.revenue) * 100 ).toFixed(1)}% {language === 'bn' ? 'লাভের হার' : 'margin'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Distribution */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-2">
              <PieChart size={20} className="text-blue-500" /> {language === 'bn' ? 'আয়ের ধরণ' : 'Revenue Distribution'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>{language === 'bn' ? 'নগদ সংগ্রহ' : 'CASH COLLECTIONS'}</span>
                    <span>{((calculations.cashRevenue / calculations.revenue) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${(calculations.cashRevenue / calculations.revenue) * 100}%` }}></div>
                  </div>
                  <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">৳{Math.round(calculations.cashRevenue).toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>{language === 'bn' ? 'বাকী বিক্রয়' : 'CREDIT SALES'}</span>
                    <span>{((calculations.creditRevenue / calculations.revenue) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(calculations.creditRevenue / calculations.revenue) * 100}%` }}></div>
                  </div>
                  <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">৳{Math.round(calculations.creditRevenue).toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col justify-center text-center">
                <DollarSign className="mx-auto text-blue-500 mb-2" size={32} />
                <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400">{t('liquidCash')}</h4>
                <p className="text-2xl font-black text-slate-800 dark:text-white">৳{Math.round(calculations.cashRevenue - calculations.opExpenses).toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 mt-2 italic font-medium">{language === 'bn' ? 'শুধুমাত্র নগদ লেনদেনের উপর ভিত্তি করে' : 'Estimated based on cash transactions only'}</p>
              </div>
            </div>
          </div>

          {/* Reports Section */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-xl"><FileText size={20} /></div>
                  {language === 'bn' ? 'রিপোর্ট সমূহ' : 'Financial Reports'}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1">{language === 'bn' ? 'পিডিএফ রিপোর্ট ডাউনলোড করুন' : 'Generate and download PDF reports'}</p>
              </div>
              
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(['daily', 'weekly', 'monthly', 'all'] as const).map((tf) => (
                  <button 
                    key={tf}
                    onClick={() => setReportTimeframe(tf)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${reportTimeframe === tf ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
                  >
                    {t(tf as any)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: 'Product Stock', icon: BookText, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                { name: 'Purchase Report', icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                { name: 'Sale Report', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                { name: 'Balance Sheet', icon: PieChart, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { name: 'Customer Ledger', icon: User, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                { name: 'Expense Report', icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' }
              ].map((report) => (
                <button
                  key={report.name}
                  onClick={() => handleGenerateReport(report.name)}
                  className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex flex-col items-center justify-center gap-3 active:scale-95"
                >
                  <div className={`p-3 rounded-xl ${report.bg} ${report.color} group-hover:scale-110 transition-transform`}>
                    <report.icon size={24} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center">{report.name}</span>
                  <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download size={10} /> Download
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
             <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-1">{t('stockInvestment')}</p>
             <h3 className="text-3xl font-black mb-6">৳{Math.round(state.inventory.reduce((a, b) => a + (b.stock * b.cost_price), 0)).toLocaleString()}</h3>
             <div className="space-y-4">
               <div className="flex items-center gap-3 text-sm">
                 <div className="w-2 h-2 rounded-full bg-green-400"></div>
                 <span className="opacity-80">{language === 'bn' ? 'মোট মূল্য (ক্রয়)' : 'Total Value (Buying)'}</span>
               </div>
               <div className="flex items-center gap-3 text-sm">
                 <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                 <span className="opacity-80">{language === 'bn' ? 'বিক্রয় সম্ভাবনা' : 'Retail Potential'}: ৳{Math.round(state.inventory.reduce((a, b) => a + (b.stock * b.price), 0)).toLocaleString()}</span>
               </div>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4">{t('audit')}</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{language === 'bn' ? 'অপরিশোধিত ক্রেডিট' : 'Unpaid Credit'}</span>
                <span className="text-sm font-bold text-amber-600">৳{Math.round(calculations.creditRevenue).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{language === 'bn' ? 'অপরিশোধিত দেনা' : 'Unpaid Payables'}</span>
                <span className="text-sm font-bold text-rose-600">৳{Math.round(calculations.totalPayables).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{language === 'bn' ? 'অপারেশনাল অনুপাত' : 'Operating Ratio'}</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{((calculations.opExpenses / calculations.revenue) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Improved Confirmation Modal for Payment */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="text-center mb-6">
                <div className={`mx-auto h-16 w-16 ${selectedOrder.type === 'Sales' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'} rounded-3xl flex items-center justify-center mb-4`}>
                  <AlertCircle size={32} />
                </div>
                
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                   {selectedOrder.type === 'Sales' ? (language === 'bn' ? 'টাকা জমা নিন' : 'Receive Payment') : (language === 'bn' ? 'বিল পরিশোধ করুন' : 'Pay Bill')}
                </h3>
                <p className="text-sm text-slate-500 font-bold mt-1">Order #{selectedOrder.id}</p>
              </div>
              
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 mb-6">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'bn' ? 'মোট বকেয়া' : 'Total Due'}</span>
                    <span className={`text-xl font-black ${selectedOrder.type === 'Sales' ? 'text-amber-600' : 'text-rose-600'}`}>
                        ৳{Math.round(selectedOrder.amount - (selectedOrder.paidAmount || 0)).toLocaleString()}
                    </span>
                </div>

                <div className="space-y-3">
                   <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button 
                        onClick={() => { setPaymentMode('Full'); setPartialAmount(''); }}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${paymentMode === 'Full' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {language === 'bn' ? 'সম্পূর্ণ' : 'Full Payment'}
                      </button>
                      <button 
                        onClick={() => setPaymentMode('Partial')}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${paymentMode === 'Partial' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {language === 'bn' ? 'আংশিক' : 'Partial'}
                      </button>
                   </div>

                   {paymentMode === 'Partial' && (
                       <div className="animate-in fade-in slide-in-from-top-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-1">{language === 'bn' ? 'পরিমাণ' : 'Enter Amount'}</label>
                           <input 
                              type="number"
                              min="0"
                              onKeyDown={(e) => e.key === '-' && e.preventDefault()}
                              placeholder="0.00"
                              value={partialAmount}
                              onChange={(e) => setPartialAmount(e.target.value)}
                              className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none text-lg font-bold text-black"
                           />
                       </div>
                   )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setSelectedOrder(null); setPartialAmount(''); }}
                  className="h-14 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button 
                  onClick={handleConfirmPayment}
                  disabled={paymentMode === 'Partial' && (!partialAmount || parseFloat(partialAmount) <= 0)}
                  className={`h-14 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${selectedOrder.type === 'Sales' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}
                >
                  <CheckCircle size={18} />
                  {language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financials;
