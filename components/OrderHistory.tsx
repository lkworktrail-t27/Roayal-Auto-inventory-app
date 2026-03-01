
import React, { useMemo, useState } from 'react';
import { Order, Product } from '../types';
import { translations } from '../App';
import { Download, Search, Calendar, FileCheck, History, Banknote, CreditCard, Package, Filter, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface OrderHistoryProps {
  sales: Order[];
  purchases: Order[];
  inventory: Product[];
  language?: 'en' | 'bn';
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ sales, purchases, inventory, language = 'en' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Sales' | 'Purchase'>('All');
  const [filterPayment, setFilterPayment] = useState<'All' | 'Cash' | 'Credit'>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);

  const t = (key: keyof typeof translations.en) => translations[language][key] || key;

  // Extract unique categories from inventory
  const categories = useMemo(() => {
    const cats = new Set(inventory.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [inventory]);

  const history = useMemo(() => {
    const combined = [...sales, ...purchases];
    return combined
      .filter(order => {
        const matchesSearch = 
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.supplier || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterType === 'All' || order.type === filterType;
        const matchesPayment = filterPayment === 'All' || order.paymentType === filterPayment;
        
        // Check if any item in the order matches the category filter
        const matchesCategory = filterCategory === 'All' || order.items.some(item => {
          const product = inventory.find(p => p.sku === item.sku);
          return product?.category === filterCategory;
        });

        return matchesSearch && matchesType && matchesPayment && matchesCategory;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, purchases, searchTerm, filterType, filterPayment, filterCategory, inventory]);

  const handleExportOrder = (order: Order) => {
    const doc = new jsPDF() as any;
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("FOYEZ TELECOM", 14, 25);
    doc.setFontSize(10);
    doc.text("PREMIUM INVENTORY MANAGEMENT SYSTEM", 14, 33);
    doc.setFontSize(14);
    doc.text(`${order.type.toUpperCase()} INVOICE`, 195, 25, { align: 'right' });
    doc.setFontSize(10);
    doc.text(`#${order.id}`, 195, 33, { align: 'right' });

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9);
    doc.text("BILL TO:", 14, 60);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(`${order.customer || order.supplier || 'Walk-in Customer'}`, 14, 68);
    
    doc.setTextColor(71, 85, 105);
    doc.text("DATE:", 140, 60);
    doc.text("PAYMENT METHOD:", 140, 68);
    doc.setTextColor(15, 23, 42);
    doc.text(`${order.date}`, 195, 60, { align: 'right' });
    doc.text(`${order.paymentType}`, 195, 68, { align: 'right' });

    doc.autoTable({
      head: [['PRODUCT DESCRIPTION', 'QTY', 'UNIT PRICE', 'TOTAL AMOUNT']],
      body: order.items.map(i => [
        `${i.name.toUpperCase()}${i.size ? ` [SIZE: ${i.size}]` : ''}${i.variation ? ` [VAR: ${i.variation}]` : ''}`, 
        i.qty, 
        `TK ${Math.round(i.price).toLocaleString()}`, 
        `TK ${Math.round(i.total).toLocaleString()}`
      ]),
      startY: 85,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      foot: [['', '', 'GRAND TOTAL', `TK ${Math.round(order.amount).toLocaleString()}`]],
      footStyles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [15, 23, 42] }
    });
    doc.save(`Invoice_${order.id}.pdf`);
  };

  const handleExportAll = () => {
    const doc = new jsPDF() as any;
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("TRANSACTION LEDGER", 14, 25);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 33);
    
    const totalAmount = history.reduce((acc, curr) => acc + curr.amount, 0);

    doc.autoTable({
      head: [['DATE', 'ID', 'TYPE', 'PARTY', 'METHOD', 'TOTAL']],
      body: history.map(h => [
        h.date, 
        h.id, 
        h.type.toUpperCase(), 
        h.customer || h.supplier || 'N/A', 
        h.paymentType, 
        `TK ${Math.round(h.amount).toLocaleString()}`
      ]),
      startY: 50,
      theme: 'striped',
      styles: { fontSize: 8 },
      foot: [['', '', '', '', 'NET TOTAL', `TK ${Math.round(totalAmount).toLocaleString()}`]],
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
    });
    doc.save(`History_Ledger_${Date.now()}.pdf`);
  };

  const clearFilters = () => {
    setFilterType('All');
    setFilterPayment('All');
    setFilterCategory('All');
    setSearchTerm('');
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header with Filters */}
      <div className="flex flex-col gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-0 z-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-xl"><History size={28} strokeWidth={2.5} /></div>
            <div>
              <h3 className="font-black text-slate-900 text-xl uppercase tracking-tight leading-none">{t('orderHistory')}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Audit Control Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder={language === 'bn' ? "আইডি বা নাম দিয়ে খুঁজুন..." : "Filter by ID or Name..."} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none text-[11px] font-bold text-black focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`h-14 w-14 rounded-[1.25rem] flex items-center justify-center shadow-lg transition-all active:scale-95 ${showFilters ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <Filter size={20} strokeWidth={2.5} />
            </button>
            <button 
              onClick={handleExportAll}
              disabled={history.length === 0}
              className="h-14 w-14 md:w-auto md:px-8 bg-slate-900 text-white rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 shadow-2xl"
            >
              <Download size={18} strokeWidth={3} />
              <span className="hidden md:inline">{t('exportLedger')}</span>
            </button>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="h-12 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black outline-none focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="All">{language === 'bn' ? 'সকল ধরন' : 'All Types'}</option>
              <option value="Sales">{language === 'bn' ? 'বিক্রয়' : 'Sales'}</option>
              <option value="Purchase">{language === 'bn' ? 'ক্রয়' : 'Purchase'}</option>
            </select>

            <select 
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value as any)}
              className="h-12 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black outline-none focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="All">{language === 'bn' ? 'সকল পেমেন্ট' : 'All Payments'}</option>
              <option value="Cash">{language === 'bn' ? 'নগদ' : 'Cash'}</option>
              <option value="Credit">{language === 'bn' ? 'বাকী' : 'Credit'}</option>
            </select>

            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-12 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black outline-none focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="All">{language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
              {categories.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button 
              onClick={clearFilters}
              className="h-12 px-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
            >
              <X size={14} /> {t('clearFilters')}
            </button>
          </div>
        )}
      </div>

      {/* High Density Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-12">
        {history.map(order => {
          const firstItem = order.items[0];
          const productDetails = firstItem ? inventory.find(p => p.sku === firstItem.sku) : null;
          const brand = productDetails?.brand || 'Generic';
          const category = productDetails?.category || 'General';
          const productName = firstItem ? firstItem.name : (language === 'bn' ? 'কোন পণ্য নেই' : 'No Items');
          const extraCount = Math.max(0, order.items.length - 1);

          return (
            <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col gap-5 group">
              {/* Top Section: Order ID, Name, Date */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider font-mono border border-blue-100">
                    {order.id}
                  </span>
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all">
                    <Package size={20} strokeWidth={1.5} />
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  {/* Brand & Category */}
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    {brand}
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    {category}
                  </p>
                  
                  {/* Product Name */}
                  <h4 className="text-xl font-black text-slate-900 leading-tight truncate pr-2 mt-0.5">
                    {productName}
                    {extraCount > 0 && <span className="text-xs text-slate-400 ml-1 font-bold">+{extraCount} more</span>}
                  </h4>

                  {/* Supplier/Customer Name */}
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1.5">
                    {order.type === 'Sales' ? (language === 'bn' ? 'গ্রাহক' : 'Customer') : (language === 'bn' ? 'সরবরাহকারী' : 'Supplier')}: {order.customer || order.supplier || (language === 'bn' ? 'সাধারণ' : 'Walk-in')}
                  </p>

                  {/* Date & Time */}
                  <div className="flex items-center gap-1 text-slate-400 mt-1">
                    <Calendar size={10} className="text-slate-300" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{order.date}</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-50"></div>

              {/* Bottom Section: Method, Amount, Export */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     {order.paymentType === 'Cash' ? <Banknote size={15} className="text-emerald-500" /> : <CreditCard size={15} className="text-indigo-500" />}
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'bn' ? (order.paymentType === 'Cash' ? 'নগদ' : 'বাকী') : order.paymentType}</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
                    ৳{Math.round(order.amount).toLocaleString()}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleExportOrder(order)}
                  className="h-14 w-14 bg-slate-900 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl active:scale-90 transition-all hover:bg-emerald-600"
                >
                  <Download size={20} />
                </button>
              </div>
            </div>
          );
        })}

        {history.length === 0 && (
          <div className="col-span-full py-32 text-center">
            <div className="flex flex-col items-center justify-center opacity-30">
              <FileCheck size={72} className="mb-6" strokeWidth={1} />
              <p className="text-[12px] font-black uppercase tracking-[0.3em]">{language === 'bn' ? 'কোন লেনদেন নেই' : 'No records found'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
