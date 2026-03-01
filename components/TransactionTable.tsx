
import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, CreditCard, Banknote, X, Trash2, User, Package, Tag, Layers, ShoppingBag, Download, Phone, Users, Save, Filter } from 'lucide-react';
import { Order, Product, OrderItem, PaymentType, Supplier, Customer } from '../types';
import { translations } from '../App';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface TransactionTableProps {
  title: 'Sales' | 'Purchase';
  data: Order[];
  inventory: Product[];
  onAddOrder: (order: Order) => void;
  suppliers?: Supplier[];
  onAddSupplier?: (supplier: Supplier) => void;
  customers?: Customer[];
  onAddCustomer?: (customer: Customer) => void;
  language?: 'en' | 'bn';
}

const TransactionTable: React.FC<TransactionTableProps> = ({ title, data, inventory, onAddOrder, suppliers, onAddSupplier, customers, onAddCustomer, language = 'en' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomerListOpen, setIsCustomerListOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState<'All' | 'Cash' | 'Credit'>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);

  const isSales = title === 'Sales';
  const t = (key: keyof typeof translations.en) => translations[language][key] || key;

  // Extract unique categories from inventory
  const categories = useMemo(() => {
    const cats = new Set(inventory.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [inventory]);

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.supplier || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPayment = filterPayment === 'All' || order.paymentType === filterPayment;
      
      // Check if any item in the order matches the category filter
      const matchesCategory = filterCategory === 'All' || order.items.some(item => {
        const product = inventory.find(p => p.sku === item.sku);
        return product?.category === filterCategory;
      });

      return matchesSearch && matchesPayment && matchesCategory;
    });
  }, [data, searchTerm, filterPayment, filterCategory, inventory]);

  const clearFilters = () => {
    setFilterPayment('All');
    setFilterCategory('All');
    setSearchTerm('');
  };

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
    
    if (order.customerPhone) {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Phone: ${order.customerPhone}`, 14, 74);
    }
    
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9);
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

  const CustomerListModal = () => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredCustomers = customers?.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone?.includes(searchTerm)
    ) || [];

    return (
      <div className="fixed inset-0 bg-slate-900/80 z-[160] flex items-center justify-center p-4 backdrop-blur-md">
        <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white/20 animate-in zoom-in-95 duration-300">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">{language === 'bn' ? 'গ্রাহক তালিকা' : 'Customer Directory'}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage Relationships</p>
            </div>
            <button onClick={() => setIsCustomerListOpen(false)} className="h-10 w-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder={language === 'bn' ? "গ্রাহক খুঁজুন..." : "Search customers..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-black"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {selectedCustomer ? (
              <div className="animate-in slide-in-from-right duration-300">
                <button onClick={() => setSelectedCustomer(null)} className="mb-4 flex items-center gap-2 text-xs font-black text-slate-500 hover:text-blue-600 uppercase tracking-wider">
                  <X size={14} /> {language === 'bn' ? 'ফিরে যান' : 'Back to List'}
                </button>
                
                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200/60">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="h-20 w-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-500/20">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedCustomer.name}</h2>
                      <div className="flex gap-4 mt-2 text-xs font-bold text-slate-500">
                        {selectedCustomer.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {selectedCustomer.phone}</span>}
                        <span className="flex items-center gap-1.5 text-emerald-600"><ShoppingBag size={14} /> ৳{Math.round(selectedCustomer.totalPurchases || 0).toLocaleString()} Spent</span>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{language === 'bn' ? 'ক্রয় ইতিহাস' : 'Purchase History'}</h4>
                  <div className="space-y-3">
                    {data.filter(o => o.customer === selectedCustomer.name).map(order => (
                      <div key={order.id} className="bg-white p-4 rounded-2xl border border-slate-200/60 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-black text-[10px]">
                            {order.id}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800">{order.date}</p>
                            <p className="text-[10px] font-bold text-slate-400">{order.items.length} Items</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900">৳{Math.round(order.amount).toLocaleString()}</p>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${order.paymentType === 'Cash' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {order.paymentType}
                          </span>
                        </div>
                      </div>
                    ))}
                    {data.filter(o => o.customer === selectedCustomer.name).length === 0 && (
                      <p className="text-center text-slate-400 text-xs italic py-4">No history found</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCustomers.map(customer => (
                  <div 
                    key={customer.id} 
                    onClick={() => setSelectedCustomer(customer)}
                    className="group bg-white p-5 rounded-[1.5rem] border border-slate-200/60 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-100 group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-600 rounded-xl flex items-center justify-center transition-colors">
                        <User size={20} strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-slate-800 truncate">{customer.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{customer.phone || 'No Phone'}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Spent</span>
                      <span className="text-xs font-black text-emerald-600">৳{Math.round(customer.totalPurchases || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {filteredCustomers.length === 0 && (
                  <div className="col-span-full text-center py-12 text-slate-400">
                    <Users size={48} className="mx-auto mb-3 opacity-50" />
                    <p className="text-xs font-bold uppercase tracking-widest">No customers found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const OrderModal = () => {
    const [party, setParty] = useState('');
    const [phone, setPhone] = useState('');
    const [items, setItems] = useState<OrderItem[]>([]);
    const [selectedSku, setSelectedSku] = useState('');
    const [itemQty, setItemQty] = useState(1);
    const [manualPrice, setManualPrice] = useState(0);
    const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
    
    // Payment State for Sales & Purchases
    const [paymentStatus, setPaymentStatus] = useState<'Full' | 'Partial'>('Full');
    const [partialAmount, setPartialAmount] = useState('');
    const [saveCustomer, setSaveCustomer] = useState(false);

    // Filter suppliers for Purchase dropdown
    const filteredSuppliers = !isSales && suppliers 
      ? suppliers.filter(s => s.name.toLowerCase().includes(party.toLowerCase()))
      : [];

    const handleProductSelect = (sku: string) => {
      setSelectedSku(sku);
      const product = inventory.find(p => p.sku === sku);
      if (product) {
        setManualPrice(isSales ? product.price : product.cost_price);
      }
    };

    const addItem = () => {
      const product = inventory.find(p => p.sku === selectedSku);
      if (!product || itemQty <= 0) return;
      const roundedPrice = Math.round(manualPrice);
      const newItem: OrderItem = {
        sku: product.sku,
        name: product.name,
        qty: itemQty,
        price: roundedPrice,
        total: itemQty * roundedPrice,
        size: product.size,
        variation: product.variation
      };
      setItems([...items, newItem]);
      setSelectedSku('');
      setItemQty(1);
      setManualPrice(0);
    };

    const removeItem = (index: number) => {
      setItems(items.filter((_, i) => i !== index));
    };

    const total = items.reduce((acc, curr) => acc + curr.total, 0);

    const handleSubmit = () => {
      if (items.length === 0) return;
      
      // Mandatory Supplier Check for Purchase
      if (!isSales && !party.trim()) {
        alert(language === 'bn' ? 'সরবরাহকারীর নাম আবশ্যক' : 'Supplier name is required');
        return;
      }

      // Add new supplier if it doesn't exist (for Purchase only)
      if (!isSales && party.trim() && onAddSupplier && suppliers) {
        const exists = suppliers.some(s => s.name.toLowerCase() === party.trim().toLowerCase());
        if (!exists) {
            onAddSupplier({
                id: `SUP-${Date.now()}`,
                name: party.trim(),
                contact: 'N/A',
                email: 'N/A',
                location: 'N/A'
            });
        }
      }

      // Determine Payment Details for both Sales and Purchase
      const pAmount = paymentStatus === 'Full' ? total : (parseFloat(partialAmount) || 0);
      const finalPaidAmount = Math.min(pAmount, total); // Cap at total
      const finalPaymentType: PaymentType = finalPaidAmount >= total ? 'Cash' : 'Credit';

      // Save Customer Logic
      if (isSales && saveCustomer && party.trim() && onAddCustomer && customers) {
        const existingCustomer = customers.find(c => c.name.toLowerCase() === party.trim().toLowerCase());
        if (!existingCustomer) {
          onAddCustomer({
            id: `CUST-${Date.now()}`,
            name: party.trim(),
            phone: phone.trim(),
            totalPurchases: 0
          });
        }
      }

      const order: Order = {
        id: `${isSales ? 'SO' : 'PO'}-${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }),
        customer: isSales ? (party.trim() || (language === 'bn' ? 'সাধারণ গ্রাহক' : 'Walk-in Customer')) : undefined,
        customerPhone: isSales ? phone.trim() : undefined,
        supplier: !isSales ? (party.trim() || (language === 'bn' ? 'অজানা সরবরাহকারী' : 'Unknown Supplier')) : undefined,
        amount: Math.round(total),
        paidAmount: Math.round(finalPaidAmount),
        paymentType: finalPaymentType,
        status: 'Completed',
        items,
        type: title
      };
      onAddOrder(order);
      setIsModalOpen(false);
    };

    return (
      <div className="fixed inset-0 bg-slate-900/80 z-[160] flex items-start md:items-center justify-center p-0 md:p-4 backdrop-blur-md">
        <div className="bg-white rounded-b-[2.5rem] md:rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20 animate-in slide-in-from-top duration-500">
          <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">{language === 'bn' ? (isSales ? 'নতুন বিক্রয়' : 'নতুন ক্রয়') : `New ${title} Record`}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Transaction Builder</p>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="px-8 py-5 overflow-y-auto custom-scrollbar space-y-5 flex-1">
            <div className="relative group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block">
                {isSales ? t('customer') : t('supplier')} 
                {isSales ? (
                    <span className="text-slate-300 italic"> ({language === 'bn' ? 'ঐচ্ছিক' : 'Optional'})</span>
                ) : (
                    <span className="text-rose-400 font-bold"> *</span>
                )}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <User size={18} />
                </div>
                <input 
                  value={party} 
                  onChange={e => {
                    setParty(e.target.value);
                    if (!isSales) setShowSupplierDropdown(true);
                  }}
                  onFocus={() => !isSales && setShowSupplierDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSupplierDropdown(false), 200)}
                  placeholder={isSales ? (language === 'bn' ? "গ্রাহকের নাম..." : "Enter customer name...") : (language === 'bn' ? "সরবরাহকারীর নাম..." : "Select or type supplier...")}
                  className={`w-full h-14 pl-12 pr-4 bg-white border rounded-2xl outline-none focus:ring-4 transition-all font-semibold text-black ${
                    !isSales && !party ? 'border-rose-200 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200/60 focus:ring-blue-500/5 focus:border-blue-500/50'
                  }`} 
                />

                {/* Dropdown for Suppliers in Purchase mode */}
                {!isSales && showSupplierDropdown && filteredSuppliers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-40 overflow-y-auto custom-scrollbar">
                    {filteredSuppliers.map(s => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => {
                          setParty(s.name);
                          setShowSupplierDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700"
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
                {!isSales && showSupplierDropdown && party && filteredSuppliers.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-3">
                    <p className="text-xs text-slate-400 italic">
                      {language === 'bn' ? `"${party}" নতুন যোগ হবে` : `"${party}" will be added as new`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Optional Phone Number for Sales */}
            {isSales && (
              <div className="space-y-3">
                <div className="relative group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block">
                    {language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'} 
                    <span className="text-slate-300 italic"> ({language === 'bn' ? 'ঐচ্ছিক' : 'Optional'})</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                      <Phone size={18} />
                    </div>
                    <input 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)}
                      placeholder={language === 'bn' ? "মোবাইল নম্বর..." : "Customer phone..."}
                      className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all font-semibold text-black" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 px-1">
                  <button 
                    onClick={() => setSaveCustomer(!saveCustomer)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border ${saveCustomer ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-50'}`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${saveCustomer ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                      {saveCustomer && <Plus size={14} className="text-white" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider">{language === 'bn' ? 'গ্রাহক সংরক্ষণ করুন' : 'Save Customer Info'}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="bg-slate-50/80 p-5 rounded-[2rem] border border-slate-200/40 space-y-4">
              <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-blue-500 text-white rounded-lg"><Plus size={12} strokeWidth={3} /></div>
                 <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{language === 'bn' ? 'পণ্য যোগ করুন' : 'Add Line Items'}</h4>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{language === 'bn' ? '১. পণ্য নির্বাচন করুন' : '1. Select Product'}</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Package size={20} />
                  </div>
                  <select 
                    value={selectedSku} 
                    onChange={e => handleProductSelect(e.target.value)}
                    className="w-full h-16 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 font-bold text-black appearance-none shadow-sm"
                  >
                    <option value="">{language === 'bn' ? 'পণ্য বাছাই করুন...' : 'Choose item...'}</option>
                    {inventory.map(p => (
                      <option key={p.sku} value={p.sku}>
                        {p.name}
                        {p.size ? ` [Size: ${p.size}]` : ''}
                        {p.variation ? ` [Var: ${p.variation}]` : ''}
                        {' '}({p.stock} {language === 'bn' ? 'টি স্টকে আছে' : 'in stock'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{language === 'bn' ? 'মূল্য' : 'Price'} (৳)</label>
                  <input 
                    type="number" 
                    min="0"
                    onKeyDown={(e) => e.key === '-' && e.preventDefault()}
                    value={manualPrice} 
                    onChange={e => setManualPrice(Math.max(0, parseFloat(e.target.value) || 0))} 
                    className="w-full h-16 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-black text-black shadow-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('qty')}</label>
                  <input 
                    type="number" 
                    min="0"
                    onKeyDown={(e) => e.key === '-' && e.preventDefault()}
                    value={itemQty} 
                    onChange={e => setItemQty(Math.max(0, parseInt(e.target.value) || 0))} 
                    className="w-full h-16 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-black text-black shadow-sm" 
                  />
                </div>
              </div>

              <button 
                onClick={addItem} 
                disabled={!selectedSku}
                className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} strokeWidth={3} /> {language === 'bn' ? 'তালিকায় যোগ করুন' : 'Add Item to List'}
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-[0.1em]">
                  <tr>
                    <th className="p-4 text-left">{t('item')}</th>
                    <th className="p-4 text-right">{t('qty')}</th>
                    <th className="p-4 text-right">{t('total')}</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <p className="font-black text-slate-800 leading-none">{item.name}</p>
                        {(item.size || item.variation) && (
                          <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase">
                            {item.size && <span className="mr-2">Size: {item.size}</span>}
                            {item.variation && <span>Var: {item.variation}</span>}
                          </p>
                        )}
                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">৳{Math.round(item.price).toLocaleString()}</p>
                      </td>
                      <td className="p-4 text-right">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-lg font-black text-slate-600">x{item.qty}</span>
                      </td>
                      <td className="p-4 text-right font-black text-slate-900">৳{Math.round(item.total).toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payment Section - For both Sales and Purchase */}
            {items.length > 0 && (
              <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                          {language === 'bn' ? (isSales ? 'গ্রহণকৃত পরিমাণ' : 'পরিশোধের পরিমাণ') : (isSales ? 'Received Amount' : 'Paid Amount')}
                      </label>
                      <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                          <button
                              onClick={() => { setPaymentStatus('Full'); setPartialAmount(''); }}
                              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${paymentStatus === 'Full' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                              {language === 'bn' ? 'সম্পূর্ণ' : 'Full'}
                          </button>
                          <button
                              onClick={() => setPaymentStatus('Partial')}
                              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${paymentStatus === 'Partial' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                              {language === 'bn' ? 'আংশিক' : 'Partial'}
                          </button>
                      </div>
                  </div>

                  {paymentStatus === 'Partial' && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                          <input
                              type="number"
                              min="0"
                              onKeyDown={(e) => e.key === '-' && e.preventDefault()}
                              value={partialAmount}
                              onChange={(e) => setPartialAmount(Math.max(0, parseFloat(e.target.value) || 0).toString())}
                              placeholder={language === 'bn' ? 'পরিমাণ লিখুন...' : 'Enter amount...'}
                              className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none text-sm font-bold text-black focus:ring-2 focus:ring-blue-500/20"
                          />
                      </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                       <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-slate-400 uppercase">{language === 'bn' ? 'মোট বিল' : 'Total Bill'}</span>
                           <span className="text-sm font-black text-slate-800">৳{Math.round(total).toLocaleString()}</span>
                       </div>
                       <div className="flex flex-col items-end">
                           <span className="text-[10px] font-bold text-slate-400 uppercase">
                               {isSales ? (language === 'bn' ? 'বকেয়া পাওনা' : 'Receivables Remaining') : (language === 'bn' ? 'বকেয়া' : 'Remaining Payable')}
                           </span>
                           <span className={`text-sm font-black ${total - (paymentStatus === 'Full' ? total : (parseFloat(partialAmount)||0)) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                              ৳{Math.round(Math.max(0, total - (paymentStatus === 'Full' ? total : (parseFloat(partialAmount)||0)))).toLocaleString()}
                           </span>
                       </div>
                  </div>
              </div>
            )}
          </div>

          <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-white sticky bottom-0">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('grandTotal')}</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">৳{Math.round(total).toLocaleString()}</h2>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={items.length === 0}
              className="px-10 h-16 bg-blue-600 text-white font-black uppercase text-xs tracking-[0.15em] rounded-[1.5rem] shadow-2xl hover:bg-blue-700 active:scale-95 transition-all"
            >
              {t('finalizeOrder')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-black text-slate-800 text-2xl uppercase tracking-tight">{language === 'bn' ? (isSales ? 'বিক্রয় রেকর্ড' : 'ক্রয় রেকর্ড') : `${title} Logs`}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Operational Activity</p>
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
            <button onClick={() => setIsModalOpen(true)} className="h-14 px-6 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all">
              <Plus size={18} strokeWidth={3} /> <span className="hidden md:inline">{language === 'bn' ? (isSales ? 'নতুন বিক্রয়' : 'নতুন ক্রয়') : `New ${title}`}</span>
            </button>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
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
              <X size={14} /> {language === 'bn' ? 'ফিল্টার মুছুন' : 'Clear Filters'}
            </button>
          </div>
        )}
      </div>

      {isSales && (
        <div className="px-2">
           <button 
             onClick={() => setIsCustomerListOpen(true)}
             className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm"
           >
             <Users size={16} /> {language === 'bn' ? 'গ্রাহক তালিকা' : 'Customers Directory'}
           </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
        {[...filteredData].reverse().map(order => (
          <div key={order.id} className="bg-white p-6 rounded-[2.25rem] border border-slate-200/60 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] flex flex-col gap-5 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 active:scale-[0.98]">
            {/* Top Grid: Order ID, Name, Date */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider font-mono border border-blue-100/50 shadow-sm">
                  {order.id}
                </span>
                <div className="p-2 bg-slate-50 rounded-xl text-slate-300">
                  <Package size={16} strokeWidth={1.5} />
                </div>
              </div>

              {(() => {
                const firstItem = order.items[0];
                const productDetails = firstItem ? inventory.find(p => p.sku === firstItem.sku) : null;
                const brand = productDetails?.brand || 'Generic';
                const category = productDetails?.category || 'General';
                const productName = firstItem ? firstItem.name : (language === 'bn' ? 'কোন পণ্য নেই' : 'No Items');
                const extraCount = Math.max(0, order.items.length - 1);

                return (
                  <div className="flex flex-col gap-0.5">
                    {/* Brand & Category */}
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      {brand}
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      {category}
                    </p>
                    
                    {/* Product Name */}
                    <h4 className="text-lg font-black text-slate-900 leading-tight truncate pr-2">
                      {productName}
                      {extraCount > 0 && <span className="text-xs text-slate-400 ml-1 font-bold">+{extraCount} more</span>}
                    </h4>

                    {/* Customer Name */}
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">
                      {isSales ? (language === 'bn' ? 'গ্রাহক' : 'Customer') : (language === 'bn' ? 'সরবরাহকারী' : 'Supplier')}: {order.customer || order.supplier || (language === 'bn' ? 'সাধারণ' : 'Walk-in')}
                    </p>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                      <Calendar size={10} className="text-slate-300" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{order.date}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="h-px bg-slate-50"></div>

            {/* Bottom Grid: Method, Amount, Export */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                  order.paymentType === 'Cash' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                }`}>
                  {order.paymentType === 'Cash' ? <Banknote size={12} /> : <CreditCard size={12} />}
                  {language === 'bn' ? (order.paymentType === 'Cash' ? 'নগদ' : 'বাকী') : order.paymentType}
                </span>
                <div className="text-xl font-black text-slate-900 tracking-tighter">
                  ৳{Math.round(order.amount).toLocaleString()}
                </div>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); handleExportOrder(order); }}
                className="group h-14 w-14 bg-slate-900 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl active:scale-90 transition-all hover:bg-blue-600"
              >
                <Download size={22} className="group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-24 text-slate-300 opacity-60">
            <ShoppingBag size={56} className="mb-4" strokeWidth={1.5} />
            <p className="text-[11px] font-black uppercase tracking-[0.2em]">{language === 'bn' ? 'কোন রেকর্ড পাওয়া যায়নি' : 'No records found'}</p>
          </div>
        )}
      </div>
      
      {isModalOpen && <OrderModal />}
      {isCustomerListOpen && <CustomerListModal />}
    </div>
  );
};

export default TransactionTable;
