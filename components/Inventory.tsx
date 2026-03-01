
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { translations } from '../App';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Package,
  X,
  Tag,
  ShoppingBag,
  FileUp,
  Download,
  ChevronDown,
  Check,
  Filter,
  Layers,
  FileDown,
  AlertCircle,
  Clock,
  CreditCard
} from 'lucide-react';
import { Product, Supplier, Order } from '../types';

interface InventoryProps {
  inventory: Product[];
  suppliers: Supplier[];
  onUpdate: (products: Product[]) => void;
  onAddSupplier: (supplier: Supplier) => void;
  onAddOrder?: (order: Order) => void;
  showToast: (msg: string) => void;
  lastImported?: string;
  onUpdateLastImported?: (date: string) => void;
  language?: 'en' | 'bn';
}

const FilterDropdown = ({ 
  label, 
  options, 
  selected, 
  onChange,
  icon: Icon
}: { 
  label: string, 
  options: string[], 
  selected: string[], 
  onChange: (val: string[]) => void,
  icon: any
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`h-11 px-4 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
          selected.length > 0 
            ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
            : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
        }`}
      >
        <Icon size={14} />
        {label}
        {selected.length > 0 && (
          <span className="ml-1 h-5 w-5 flex items-center justify-center bg-white text-slate-900 rounded-md text-[9px] font-black">
            {selected.length}
          </span>
        )}
        <ChevronDown size={12} className={`ml-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
            {options.map(option => (
              <button
                key={option}
                onClick={() => toggleOption(option)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  selected.includes(option)
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-slate-300 group-hover:border-blue-400'
                }`}>
                  {selected.includes(option) && <Check size={10} className="text-white" strokeWidth={4} />}
                </div>
                <span className={`text-xs font-bold ${selected.includes(option) ? 'text-slate-900' : 'text-slate-500'} truncate`}>
                  {option || 'Uncategorized'}
                </span>
              </button>
            ))}
            {options.length === 0 && (
              <div className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                No options
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Inventory: React.FC<InventoryProps> = ({ inventory, suppliers, onUpdate, onAddSupplier, onAddOrder, showToast, lastImported, onUpdateLastImported, language = 'en' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for import conflict resolution
  const [importConflictData, setImportConflictData] = useState<{
    newItems: Product[];
    duplicateItems: Product[];
  } | null>(null);

  const t = (key: keyof typeof translations.en) => translations[language][key] || key;

  // Extract unique brands and categories for filter options
  const brands = useMemo(() => Array.from(new Set(inventory.map(p => p.brand).filter(Boolean))).sort(), [inventory]);
  const categories = useMemo(() => Array.from(new Set(inventory.map(p => p.category).filter(Boolean))).sort(), [inventory]);

  const filteredItems = useMemo(() => {
    const lowerTerm = searchTerm.toLowerCase();
    
    // First, filter items
    const matches = inventory.filter(item => {
      // 1. Search term match
      const matchesSearch = 
        item.name.toLowerCase().includes(lowerTerm) || 
        item.sku.toLowerCase().includes(lowerTerm) ||
        (item.brand || '').toLowerCase().includes(lowerTerm) ||
        item.category.toLowerCase().includes(lowerTerm);

      if (!matchesSearch) return false;

      // 2. Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(item.brand)) {
        return false;
      }

      // 3. Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) {
        return false;
      }

      return true;
    });

    // Then, sort items
    if (!lowerTerm) return [...matches].reverse();

    return matches.sort((a, b) => {
      const aNameStarts = a.name.toLowerCase().startsWith(lowerTerm);
      const bNameStarts = b.name.toLowerCase().startsWith(lowerTerm);
      if (aNameStarts && !bNameStarts) return -1;
      if (!aNameStarts && bNameStarts) return 1;
      return 0;
    });
  }, [inventory, searchTerm, selectedBrands, selectedCategories]);

  const handleDelete = (sku: string) => {
    if (confirm(language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      onUpdate(inventory.filter(p => p.sku !== sku));
      showToast('Product removed');
    }
  };

  const handleDownloadSample = () => {
    const csvContent = "SKU,Name,Brand,Category,Stock,Price,Cost Price,Supplier\nP-1001,Sample Product,Logitech,Electronics,100,2500,1800,Global Imports\nP-1002,Item Two,Anker,Accessories,50,999,400,TechSol Inc";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "inventory_sample.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Sample CSV downloaded');
  };

  const handleExportCSV = () => {
    const headers = ["SKU,Name,Brand,Category,Stock,Price,Cost Price,Supplier,Status"];
    
    const rows = filteredItems.map(item => 
      [
        `"${item.sku.replace(/"/g, '""')}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.brand.replace(/"/g, '""')}"`,
        `"${item.category.replace(/"/g, '""')}"`,
        item.stock,
        item.price,
        item.cost_price,
        `"${item.supplier.replace(/"/g, '""')}"`,
        `"${item.status}"`
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Inventory exported successfully');
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '');
      
      if (lines.length < 2) {
        showToast('Empty or invalid CSV file');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Prepare prefix counts for auto-generation
      const prefixCounts: {[key: string]: number} = {};
      inventory.forEach(p => {
          const prefix = p.sku.charAt(0).toUpperCase();
          const numPart = parseInt(p.sku.slice(1), 10);
          if (/^[A-Z]\d{3}$/.test(p.sku) && !isNaN(numPart)) {
              prefixCounts[prefix] = Math.max(prefixCounts[prefix] || 0, numPart);
          }
      });

      // Skip header row
      const dataLines = lines.slice(1);
      
      const parsedProducts: Product[] = dataLines.map((line, idx) => {
        const parts = line.split(',');
        const name = parts[1]?.trim() || 'Imported Product';
        let sku = parts[0]?.trim();

        if (!sku) {
            const prefix = name.charAt(0).toUpperCase() || 'P';
            const currentMax = prefixCounts[prefix] || 0;
            const nextNum = currentMax + 1;
            prefixCounts[prefix] = nextNum;
            sku = `${prefix}${nextNum.toString().padStart(3, '0')}`;
        }

        const brand = parts[2]?.trim() || 'Generic';
        const category = parts[3]?.trim() || 'General';
        const stock = parseInt(parts[4]) || 0;
        const price = Math.round(parseFloat(parts[5])) || 0;
        const costPrice = Math.round(parseFloat(parts[6])) || 0;
        const supplier = parts[7]?.trim() || '';

        const threshold = 10;
        return {
          sku,
          name,
          brand,
          category,
          stock,
          price,
          cost_price: costPrice,
          supplier,
          status: stock <= 0 ? 'Out of Stock' : stock < threshold ? 'Low Stock' : 'In Stock',
          lowStockThreshold: 10 // Default for imported items
        } as Product;
      });

      // Split into duplicates and new items
      const existingSkus = new Set(inventory.map(p => p.sku));
      const duplicateItems: Product[] = [];
      const newItems: Product[] = [];

      parsedProducts.forEach(p => {
        if (existingSkus.has(p.sku)) {
          duplicateItems.push(p);
        } else {
          newItems.push(p);
        }
      });

      if (duplicateItems.length > 0) {
        setImportConflictData({ newItems, duplicateItems });
      } else if (newItems.length > 0) {
        onUpdate([...inventory, ...newItems]);
        if (onUpdateLastImported) onUpdateLastImported(new Date().toLocaleString());
        showToast(`Imported ${newItems.length} new items`);
      } else {
         showToast('No valid items found in CSV');
      }

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const resolveImportConflict = (strategy: 'skip' | 'overwrite') => {
    if (!importConflictData) return;

    const { newItems, duplicateItems } = importConflictData;
    let finalInventory = [...inventory];

    if (strategy === 'overwrite') {
      // Create a map of duplicates for faster lookup
      const duplicateMap = new Map<string, Product>();
      duplicateItems.forEach(item => duplicateMap.set(item.sku, item));
      
      finalInventory = inventory.map(existingItem => {
        const overwritingItem = duplicateMap.get(existingItem.sku);
        if (overwritingItem) {
          // If overwriting, we should preserve existing supplier if the new one is empty
          return {
             ...overwritingItem,
             supplier: overwritingItem.supplier || existingItem.supplier
          };
        }
        return existingItem;
      });
      
      showToast(`Updated ${duplicateItems.length} items and added ${newItems.length} new items`);
    } else {
      showToast(`Skipped duplicates. Added ${newItems.length} new items`);
    }

    onUpdate([...finalInventory, ...newItems]);
    if (onUpdateLastImported) onUpdateLastImported(new Date().toLocaleString());
    setImportConflictData(null);
  };

  const ImportConflictModal = () => {
    if (!importConflictData) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="p-8 text-center">
            <div className="mx-auto h-16 w-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-5">
              <AlertCircle size={32} />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
              {language === 'bn' ? 'ডুপ্লিকেট পাওয়া গেছে' : 'Duplicate Items Found'}
            </h3>
            
            <p className="text-sm text-slate-500 font-medium mb-6">
              {language === 'bn' 
                ? `${importConflictData.duplicateItems.length} টি পণ্যের SKU ইতিমধ্যে বিদ্যমান। আপনি কি এগুলো প্রতিস্থাপন করতে চান?` 
                : `Found ${importConflictData.duplicateItems.length} items with SKUs that already exist in your inventory. How would you like to proceed?`}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => resolveImportConflict('skip')}
                className="h-14 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors"
              >
                {language === 'bn' ? 'বাদ দিন' : 'Skip Duplicates'}
              </button>
              <button 
                onClick={() => resolveImportConflict('overwrite')}
                className="h-14 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors"
              >
                {language === 'bn' ? 'প্রতিস্থাপন করুন' : 'Overwrite Existing'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProductModal = () => {
    const [formData, setFormData] = useState<Partial<Product>>(editingProduct || {
      sku: '', name: '', brand: '', category: '', stock: 0, price: 0, cost_price: 0, supplier: '', size: '', variation: '', lowStockThreshold: 10
    });
    const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
    
    // New state for Purchase payment logic
    const [paymentStatus, setPaymentStatus] = useState<'Full' | 'Partial'>('Full');
    const [partialPaidAmount, setPartialPaidAmount] = useState<string>('');

    // Filter suppliers based on current input in the supplier field
    const filteredSuppliers = suppliers.filter(s => 
      s.name.toLowerCase().includes((formData.supplier || '').toLowerCase())
    );

    // Calculate total cost and payable
    const totalCost = (formData.stock || 0) * (formData.cost_price || 0);
    const paidAmount = paymentStatus === 'Full' ? totalCost : (parseFloat(partialPaidAmount) || 0);
    const remainingPayable = totalCost - paidAmount;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Auto-generate SKU if not provided
      let finalSku = formData.sku?.trim();
      
      if (!finalSku) {
          const name = formData.name || 'Product';
          const prefix = name.charAt(0).toUpperCase();
          const regex = new RegExp(`^${prefix}\\d{3}$`);
          const existingCodes = inventory
            .map(p => p.sku)
            .filter(sku => regex.test(sku))
            .map(sku => parseInt(sku.slice(1), 10));
          
          const nextNum = existingCodes.length > 0 ? Math.max(...existingCodes) + 1 : 1;
          finalSku = `${prefix}${nextNum.toString().padStart(3, '0')}`;
      }

      // Handle new supplier addition logic
      const supplierName = formData.supplier?.trim() || '';
      if (supplierName && !suppliers.some(s => s.name.toLowerCase() === supplierName.toLowerCase())) {
        // Create new supplier if it doesn't exist
        const newSupplier: Supplier = {
          id: `SUP-${Date.now()}`,
          name: supplierName,
          contact: 'N/A',
          email: 'N/A',
          location: 'N/A'
        };
        onAddSupplier(newSupplier);
        showToast(`New supplier "${supplierName}" added to registry`);
      }

      const threshold = formData.lowStockThreshold || 10;
      const updatedProduct = { 
        ...formData, 
        sku: finalSku,
        brand: formData.brand || 'Generic',
        supplier: supplierName,
        status: (formData.stock || 0) <= 0 ? 'Out of Stock' : (formData.stock || 0) < threshold ? 'Low Stock' : 'In Stock',
        lastUpdated: new Date().toLocaleString()
      } as Product;
      
      // Ensure prices are rounded integers
      updatedProduct.price = Math.round(updatedProduct.price || 0);
      updatedProduct.cost_price = Math.round(updatedProduct.cost_price || 0);
      
      // Determine if we should generate a PO (Only for new products with stock)
      const shouldGeneratePO = !editingProduct && onAddOrder && (formData.stock || 0) > 0;

      // If generating a PO, we set initial stock to 0 so the PO addition results in the correct total.
      // Otherwise (editing or no PO), we use the form's stock value directly.
      const productToSave = {
        ...updatedProduct,
        stock: shouldGeneratePO ? 0 : updatedProduct.stock
      };

      if (editingProduct) onUpdate(inventory.map(p => p.sku === editingProduct.sku ? productToSave : p));
      else onUpdate([...inventory, productToSave]);

      // Generate Purchase Order ONLY if adding new product
      if (shouldGeneratePO) {
          const purchaseOrder: Order = {
              id: `PO-${Date.now().toString().slice(-4)}`,
              date: new Date().toISOString().split('T')[0],
              supplier: supplierName || 'Unknown Supplier',
              amount: totalCost,
              paidAmount: Math.round(paidAmount),
              paymentType: remainingPayable <= 0 ? 'Cash' : 'Credit',
              status: 'Received',
              type: 'Purchase',
              items: [{
                  sku: finalSku,
                  name: updatedProduct.name,
                  qty: updatedProduct.stock, // Use the original entered stock for the PO
                  price: updatedProduct.cost_price,
                  cost_price: updatedProduct.cost_price,
                  total: totalCost,
                  size: updatedProduct.size,
                  variation: updatedProduct.variation
              }]
          };
          onAddOrder!(purchaseOrder);
      }

      setIsModalOpen(false);
      setEditingProduct(null);
    };

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex flex-col md:inset-0 md:bg-slate-900/60 md:flex md:items-center md:justify-start md:pt-20 p-0 md:p-4">
        <div className="bg-white flex flex-col h-full w-full md:h-auto md:max-h-[85vh] md:max-w-xl md:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-top duration-500">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingProduct ? t('actions') : t('inventory')}</h3>
            <button onClick={() => { setIsModalOpen(false); setEditingProduct(null); }} className="p-2 text-slate-400">
              <X size={28} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Product Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-semibold text-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">SKU Code <span className="text-slate-300 font-bold tracking-normal normal-case">(Optional)</span></label>
                  <input disabled={!!editingProduct} value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-bold text-black disabled:text-slate-500" placeholder="Auto-generated" />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Stock Qty</label>
                   <input 
                     type="number" 
                     min="0" 
                     value={formData.stock} 
                     onChange={e => setFormData({...formData, stock: Math.max(0, parseInt(e.target.value) || 0)})} 
                     className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-black text-black" 
                   />
                </div>
              </div>
              
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Low Stock Alert Threshold</label>
                 <input 
                   type="number" 
                   min="1" 
                   value={formData.lowStockThreshold || ''} 
                   onChange={e => setFormData({...formData, lowStockThreshold: Math.max(1, parseInt(e.target.value) || 10)})} 
                   placeholder="Default: 10"
                   className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-bold text-black" 
                 />
                 <p className="text-[10px] text-slate-400 mt-1 font-bold">Alert will trigger when stock falls below this number</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Brand Name</label>
                  <input placeholder="e.g. Logitech" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base text-black" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Category</label>
                  <input placeholder="e.g. Electronics" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base text-black" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Size <span className="text-slate-300 font-bold tracking-normal normal-case">(Optional)</span></label>
                  <input placeholder="e.g. XL, 42, 100ml" value={formData.size || ''} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base text-black" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Variation <span className="text-slate-300 font-bold tracking-normal normal-case">(Optional)</span></label>
                  <input placeholder="e.g. Red, Matte, Pro" value={formData.variation || ''} onChange={e => setFormData({...formData, variation: e.target.value})} className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base text-black" />
                </div>
              </div>
              
              {/* Supplier Input Combobox */}
              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{t('supplier')}</label>
                <input 
                  placeholder={language === 'bn' ? 'সরবরাহকারী নির্বাচন করুন বা লিখুন...' : 'Select or type new supplier...'} 
                  value={formData.supplier || ''} 
                  onChange={e => {
                    setFormData({...formData, supplier: e.target.value});
                    setShowSupplierDropdown(true);
                  }}
                  onFocus={() => setShowSupplierDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSupplierDropdown(false), 200)}
                  className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base text-black" 
                />
                
                {showSupplierDropdown && filteredSuppliers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-40 overflow-y-auto custom-scrollbar">
                    {filteredSuppliers.map(s => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => {
                          setFormData({...formData, supplier: s.name});
                          setShowSupplierDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700"
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
                {showSupplierDropdown && formData.supplier && filteredSuppliers.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-3">
                    <p className="text-xs text-slate-400 italic">
                      {language === 'bn' ? `"${formData.supplier}" নতুন যোগ হবে` : `"${formData.supplier}" will be added as new`}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{t('purchasePrice')} (৳)</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="1" 
                    value={formData.cost_price} 
                    onChange={e => setFormData({...formData, cost_price: Math.max(0, parseFloat(e.target.value) || 0)})} 
                    className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-black text-black" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Selling Price (৳)</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="1" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: Math.max(0, parseFloat(e.target.value) || 0)})} 
                    className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-black text-black" 
                  />
                </div>
              </div>

              {/* Paid Amount Section (Only for new products to simulate purchase) */}
              {!editingProduct && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Amount</label>
                        <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                            <button 
                                type="button"
                                onClick={() => { setPaymentStatus('Full'); setPartialPaidAmount(''); }}
                                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${paymentStatus === 'Full' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Full
                            </button>
                            <button 
                                type="button"
                                onClick={() => setPaymentStatus('Partial')}
                                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${paymentStatus === 'Partial' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Partial
                            </button>
                        </div>
                    </div>
                    
                    {paymentStatus === 'Partial' && (
                        <input 
                            type="number" 
                            placeholder="Enter amount paid..."
                            value={partialPaidAmount}
                            onChange={(e) => setPartialPaidAmount(e.target.value)}
                            className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none text-sm font-bold text-black" 
                        />
                    )}

                    <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                        <span className="text-slate-500 font-bold">Total Cost: ৳{totalCost.toLocaleString()}</span>
                        {remainingPayable > 0 ? (
                            <span className="text-rose-500 font-black">Payable: ৳{remainingPayable.toLocaleString()}</span>
                        ) : (
                            <span className="text-emerald-500 font-black flex items-center gap-1"><Check size={12} strokeWidth={3} /> Fully Paid</span>
                        )}
                    </div>
                </div>
              )}

            </div>
            <button type="submit" className="w-full h-16 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 transition-transform sticky bottom-0 mt-4">
              <Plus size={24} /> {editingProduct ? 'Update Item' : 'Add to Inventory'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-auto md:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder={language === 'bn' ? 'ব্র্যান্ড, ক্যাটাগরি বা নাম খুঁজুন...' : 'Search Brand, Category or Name...'} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-12 h-14 bg-white border border-slate-200 rounded-2xl outline-none w-full shadow-sm font-semibold text-base text-black transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" 
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-rose-500 rounded-full transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        
        <div className="flex flex-col w-full md:w-auto gap-1">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button 
              onClick={handleDownloadSample}
              className="flex-1 md:w-auto px-4 h-14 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm active:scale-95 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
              title="Download Sample Structure"
            >
              <Download size={18} /> {t('sampleCSV')}
            </button>
            
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImportCSV} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 md:w-auto px-6 h-14 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm active:scale-95 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <FileUp size={18} className="text-blue-500" /> {t('importCSV')}
            </button>

            <button 
              onClick={handleExportCSV}
              className="flex-1 md:w-auto px-6 h-14 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm active:scale-95 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <FileDown size={18} className="text-purple-500" /> {t('exportCSV')}
            </button>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 md:w-auto px-8 h-14 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus size={18} /> {language === 'bn' ? 'পণ্য যোগ' : 'Add Product'}
            </button>
          </div>
          
          {lastImported && (
             <div className="flex justify-end pr-2">
                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                  <Clock size={10} />
                  Last Imported: {lastImported}
                </span>
             </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 pb-2 animate-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-2 mr-2">
          <Filter size={18} className="text-slate-400" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('filters')}:</span>
        </div>
        
        <FilterDropdown 
          label={t('brand')} 
          options={brands} 
          selected={selectedBrands} 
          onChange={setSelectedBrands} 
          icon={Tag}
        />
        
        <FilterDropdown 
          label={t('category')} 
          options={categories} 
          selected={selectedCategories} 
          onChange={setSelectedCategories} 
          icon={Layers}
        />
        
        {(selectedBrands.length > 0 || selectedCategories.length > 0) && (
           <button 
             onClick={() => {setSelectedBrands([]); setSelectedCategories([]);}}
             className="h-11 px-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors active:scale-95"
           >
             <X size={14} /> {t('clearFilters')}
           </button>
        )}
      </div>

      <div className="space-y-4">
        {filteredItems.map(item => (
          <div key={item.sku} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest mb-1.5 inline-block">{item.sku}</span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                   {item.brand || 'GENERIC'} 
                   <span className="w-1 h-1 bg-slate-300 rounded-full"></span> 
                   {item.category}
                </p>
                <h3 className="text-lg font-black text-slate-800 leading-tight mb-1">{item.name}</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">
                  {t('supplier')}: {item.supplier || 'N/A'}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                  <Clock size={10} />
                  {item.lastUpdated || 'N/A'}
                </p>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="flex flex-col items-end gap-1">
                   <div className="flex items-center gap-1.5 text-xs font-black text-slate-400">
                     <Tag size={12} className="text-blue-500" />
                     <span>৳{Math.round(item.price).toLocaleString()}</span>
                   </div>
                   <div className="flex items-center gap-1.5 text-xs font-black text-slate-400">
                     <ShoppingBag size={12} className="text-amber-500" />
                     <span>৳{Math.round(item.cost_price || 0).toLocaleString()}</span>
                   </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase mt-3 ${
                  item.stock < (item.lowStockThreshold || 10) ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {item.stock < (item.lowStockThreshold || 10) && <AlertCircle size={10} strokeWidth={3} />}
                  {item.stock} {language === 'bn' ? 'টি' : 'Units'}
                </span>
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-50">
              <button 
                onClick={() => { setEditingProduct(item); setIsModalOpen(true); }}
                className="flex-1 h-12 bg-slate-100 rounded-xl text-slate-600 font-bold text-xs uppercase flex items-center justify-center gap-2 active:bg-slate-200"
              >
                <Pencil size={14} /> {language === 'bn' ? 'সম্পাদনা' : 'Edit'}
              </button>
              <button 
                onClick={() => handleDelete(item.sku)}
                className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center active:bg-rose-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <Package size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest">{language === 'bn' ? 'কোন পণ্য পাওয়া যায়নি' : 'No matching products found'}</p>
          </div>
        )}
      </div>

      {isModalOpen && <ProductModal />}
      {importConflictData && <ImportConflictModal />}
    </div>
  );
};

export default Inventory;
