
import React, { useState } from 'react';
import { Supplier, Product, Order } from '../types';
import { translations } from '../App';
import { User, Mail, Phone, ExternalLink, Plus, MapPin, Package, X, Check, Pencil, Search, History, ArrowLeft, Truck, ShoppingCart } from 'lucide-react';

interface SuppliersProps {
  suppliers: Supplier[];
  inventory: Product[];
  purchases: Order[];
  onUpdateInventory: (products: Product[]) => void;
  onAddSupplier: (supplier: Supplier) => void;
  onUpdateSupplier: (supplier: Supplier) => void;
  language?: 'en' | 'bn';
}

const Suppliers: React.FC<SuppliersProps> = ({ suppliers, inventory, purchases, onUpdateInventory, onAddSupplier, onUpdateSupplier, language = 'en' }) => {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const t = (key: keyof typeof translations.en) => translations[language][key] || key;

  const getProductsBySupplier = (supplierName: string) => {
    return inventory.filter(p => p.supplier === supplierName);
  };

  const getPurchasesBySupplier = (supplierName: string) => {
    return purchases.filter(p => p.supplier === supplierName);
  };

  const handleLinkProduct = (sku: string, supplierName: string) => {
    const updatedInventory = inventory.map(p => 
      p.sku === sku ? { ...p, supplier: supplierName } : p
    );
    onUpdateInventory(updatedInventory);
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SupplierFormModal = () => {
    const [formData, setFormData] = useState({ 
      name: editingSupplier?.name || '', 
      contact: editingSupplier?.contact || '', 
      email: editingSupplier?.email || '',
      location: editingSupplier?.location || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name) return;
      
      if (editingSupplier) {
        onUpdateSupplier({
          ...editingSupplier,
          ...formData
        });
      } else {
        const newSupplier: Supplier = {
          id: `SUP-${Date.now()}`,
          ...formData
        };
        onAddSupplier(newSupplier);
      }
      
      setIsFormModalOpen(false);
      setEditingSupplier(null);
    };

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {editingSupplier ? (language === 'bn' ? 'সম্পাদনা করুন' : 'Edit Supplier') : t('addSupplier')}
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Vendor Registry</p>
            </div>
            <button onClick={() => { setIsFormModalOpen(false); setEditingSupplier(null); }} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">{language === 'bn' ? 'নাম' : 'Supplier Name'}</label>
              <input 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-semibold text-black focus:ring-4 focus:ring-blue-500/5 transition-all" 
                placeholder="e.g. Samsung Electronics"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">{language === 'bn' ? 'যোগাযোগ ব্যক্তি' : 'Contact Person'}</label>
              <input 
                required 
                value={formData.contact} 
                onChange={e => setFormData({...formData, contact: e.target.value})} 
                className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-semibold text-black focus:ring-4 focus:ring-blue-500/5 transition-all" 
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">{language === 'bn' ? 'ইমেইল' : 'Email Address'}</label>
              <input 
                required 
                type="email"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-semibold text-black focus:ring-4 focus:ring-blue-500/5 transition-all" 
                placeholder="e.g. support@vendor.com"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">{language === 'bn' ? 'অবস্থান' : 'Location'}</label>
              <input 
                value={formData.location} 
                onChange={e => setFormData({...formData, location: e.target.value})} 
                className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-semibold text-black focus:ring-4 focus:ring-blue-500/5 transition-all" 
                placeholder="e.g. Dhaka, Bangladesh"
              />
            </div>
            <button type="submit" className="w-full h-16 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest active:scale-95">
              <Check size={18} strokeWidth={3} /> {editingSupplier ? (language === 'bn' ? 'আপডেট করুন' : 'Update Supplier') : (language === 'bn' ? 'সেভ করুন' : 'Save Supplier')}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const SupplierDetailView = () => {
    if (!selectedSupplier) return null;
    const linkedProducts = getProductsBySupplier(selectedSupplier.name);
    const availableProducts = inventory.filter(p => p.supplier !== selectedSupplier.name);
    const supplierPurchases = getPurchasesBySupplier(selectedSupplier.name);

    return (
      <div className="animate-in slide-in-from-right duration-500 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setSelectedSupplier(null)}
            className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedSupplier.name}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier Profile</p>
          </div>
          <div className="ml-auto">
             <button 
               onClick={() => { setEditingSupplier(selectedSupplier); setIsFormModalOpen(true); }}
               className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
             >
               <Pencil size={14} /> {language === 'bn' ? 'সম্পাদনা' : 'Edit Details'}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Info & Stats */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
               <div className="flex items-center gap-4 mb-6">
                 <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black">
                   {selectedSupplier.name.charAt(0)}
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Person</p>
                   <p className="text-lg font-black text-slate-900">{selectedSupplier.contact}</p>
                 </div>
               </div>
               
               <div className="space-y-4">
                 <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                   <Mail size={16} className="text-slate-400" />
                   <span className="text-sm font-bold text-slate-700">{selectedSupplier.email}</span>
                 </div>
                 <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                   <MapPin size={16} className="text-slate-400" />
                   <span className="text-sm font-bold text-slate-700">{selectedSupplier.location || 'N/A'}</span>
                 </div>
               </div>
            </div>

            <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-500/20">
               <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-4">Performance</h4>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-3xl font-black">{linkedProducts.length}</p>
                   <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Products</p>
                 </div>
                 <div>
                   <p className="text-3xl font-black">{supplierPurchases.length}</p>
                   <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Orders</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Middle Column: Products */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col h-[500px]">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Package size={14} className="text-emerald-500" /> {language === 'bn' ? 'সংযুক্ত পণ্য' : 'Linked Products'}
            </h4>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {linkedProducts.map(p => (
                <div key={p.sku} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center group hover:bg-white hover:border-blue-200 transition-all">
                  <div>
                    <p className="text-xs font-black text-slate-800">{p.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{p.sku}</p>
                  </div>
                  <button onClick={() => handleLinkProduct(p.sku, '')} className="text-slate-300 hover:text-rose-500 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {linkedProducts.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs italic">No products linked</div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Link New Product</p>
               <div className="h-32 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                 {availableProducts.map(p => (
                   <button 
                     key={p.sku}
                     onClick={() => handleLinkProduct(p.sku, selectedSupplier.name)}
                     className="w-full text-left p-2 hover:bg-blue-50 rounded-lg text-xs font-bold text-slate-600 flex justify-between items-center group"
                   >
                     <span className="truncate">{p.name}</span>
                     <Plus size={12} className="opacity-0 group-hover:opacity-100 text-blue-600" />
                   </button>
                 ))}
               </div>
            </div>
          </div>

          {/* Right Column: History */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col h-[500px]">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <History size={14} className="text-amber-500" /> {language === 'bn' ? 'ক্রয় ইতিহাস' : 'Purchase History'}
            </h4>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {supplierPurchases.map(order => (
                <div key={order.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-amber-200 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-black bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">{order.id}</span>
                    <span className="text-[9px] font-bold text-slate-400">{order.date}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{order.items.length} Items</p>
                    </div>
                    <p className="text-sm font-black text-slate-900">৳{Math.round(order.amount).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {supplierPurchases.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs italic">No purchase history</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProductListModal = () => null; // Deprecated, integrated into detail view

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {selectedSupplier ? (
        <SupplierDetailView />
      ) : (
        <>
          <div className="flex justify-between items-center px-2">
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t('suppliers')}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Vendor Network</p>
            </div>
            <button 
              onClick={() => { setEditingSupplier(null); setIsFormModalOpen(true); }}
              className="h-14 px-8 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 transition-all"
            >
              <Plus size={18} strokeWidth={3} /> {t('addSupplier')}
            </button>
          </div>

          <div className="bg-white p-4 rounded-[2rem] border border-slate-200/60 shadow-sm">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder={language === 'bn' ? "সরবরাহকারী খুঁজুন..." : "Search suppliers..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-black"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuppliers.map(sup => {
                const productCount = getProductsBySupplier(sup.name).length;
                return (
                  <div 
                    key={sup.id} 
                    onClick={() => setSelectedSupplier(sup)}
                    className="group bg-white p-5 rounded-[1.5rem] border border-slate-200/60 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 bg-slate-100 group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-600 rounded-2xl flex items-center justify-center transition-colors font-black text-lg">
                        {sup.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-slate-800 truncate text-lg">{sup.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{sup.contact}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Package size={14} className="text-emerald-500" />
                        <span>{productCount} Products</span>
                      </div>
                      <div className="h-8 w-8 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <ExternalLink size={14} />
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredSuppliers.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-400">
                  <Truck size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-xs font-bold uppercase tracking-widest">No suppliers found</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {isFormModalOpen && <SupplierFormModal />}
    </div>
  );
};

export default Suppliers;
