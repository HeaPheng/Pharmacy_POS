import { useState, useRef, useEffect } from 'react';
import { useCategories, useCreateCategory, useProviders, useItems } from '../hooks/useApi';
import { useTranslation, getCategoryDisplayName } from '../i18n/translations';
import ProviderModal from './ProviderModal';
import toast from 'react-hot-toast';

const API_BASE = (() => {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    const hostname = window.location.hostname;
    return `http://${hostname}:8000`;
  }
  return import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
})();

const EMPTY_FORM = {
  code: '',
  name: '',
  description: '',
  unit_price: '',
  boxes_quantity: '',
  pieces_per_box: '',
  category_ids: [],
  provider_id: '',
};

export default function ItemForm({ editingItem, onSubmit, onCancel, isPending, onSelectExistingItem, isAddingStock }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showNewFormulationInput, setShowNewFormulationInput] = useState(false);
  const [newFormulationName, setNewFormulationName] = useState('');
  const [showNewTherapeuticInput, setShowNewTherapeuticInput] = useState(false);
  const [newTherapeuticName, setNewTherapeuticName] = useState('');
  const [showProviderModal, setShowProviderModal] = useState(false);
  const fileInputRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const nameContainerRef = useRef(null);
  const codeContainerRef = useRef(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCodeSuggestions, setShowCodeSuggestions] = useState(false);
  const { t, lang } = useTranslation();

  const { data: categories = [] } = useCategories();
  const { data: providers = [] } = useProviders();
  const { data: items = [] } = useItems({});
  const createCategory = useCreateCategory();

  const ageGroupCats = categories.filter((c) => c.type === 'age_group');
  const therapeuticCats = categories.filter((c) => c.type === 'therapeutic' || !c.type);
  const formulationCats = categories.filter((c) => c.type === 'formulation');

  useEffect(() => {
    if (editingItem) {
      setForm({
        code: editingItem.code || '',
        name: editingItem.name || '',
        description: editingItem.description || '',
        unit_price: editingItem.unit_price || '',
        boxes_quantity: isAddingStock ? '' : (editingItem.boxes_quantity || ''),
        pieces_per_box: editingItem.pieces_per_box || '',
        category_ids: editingItem.categories ? editingItem.categories.map((c) => c.id) : [],
        provider_id: editingItem.provider_id || '',
      });
      setImageFile(null);
      setImagePreview(null);
    } else {
      // Auto-suggest next sequential code based on existing items count/max code
      const nextCode = (() => {
        const codes = items.map((item) => parseInt(item.code)).filter((num) => !isNaN(num));
        const max = codes.length > 0 ? Math.max(...codes) : 0;
        return String(max + 1).padStart(3, '0');
      })();

      setForm({
        ...EMPTY_FORM,
        code: nextCode,
      });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [editingItem, items]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setShowCategoryDropdown(false);
      }
      if (nameContainerRef.current && !nameContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (codeContainerRef.current && !codeContainerRef.current.contains(e.target)) {
        setShowCodeSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCategory = async (type = 'therapeutic', nameValue) => {
    if (!nameValue.trim()) return;
    try {
      const cat = await createCategory.mutateAsync({ name: nameValue.trim(), type });
      return cat;
    } catch (err) {
      console.error('Failed to create category:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.provider_id) {
      toast.error(t('stock.form.pleaseSelectProvider') || 'Please select a provider');
      return;
    }
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'category_ids') {
        value.forEach((id) => formData.append('category_ids[]', id));
      } else if (key === 'boxes_quantity') {
        if (isAddingStock && editingItem) {
          const originalVal = parseInt(editingItem.boxes_quantity) || 0;
          const enteredVal = parseInt(value) || 0;
          formData.append('boxes_quantity', originalVal + enteredVal);
          formData.append('boxes_added', enteredVal);
        } else {
          formData.append('boxes_quantity', value);
        }
      } else if (value !== '' && value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (editingItem) {
      formData.append('_method', 'PUT');
    }
    onSubmit(formData);
  };

  const suggestions = form.name.trim().length >= 1
    ? items.filter((item) => {
        const q = form.name.toLowerCase();
        return (
          item.name?.toLowerCase().includes(q) ||
          item.code?.toLowerCase().includes(q)
        );
      })
    : [];

  const codeSuggestions = form.code.trim().length >= 1
    ? items.filter((item) => {
        const q = form.code.toLowerCase();
        return (
          item.code?.toLowerCase().includes(q) ||
          item.name?.toLowerCase().includes(q)
        );
      })
    : [];

  const isEditing = !!editingItem;

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {isAddingStock
              ? (t('kh' === t('common.save') ? 'បន្ថែមស្តុក' : 'Add Stock'))
              : isEditing
                ? t('stock.editItem')
                : t('stock.addNewItem')}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
             {/* Item Code */}
            <div className="relative" ref={codeContainerRef}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {t('stock.form.itemCode')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => {
                  setForm({ ...form, code: e.target.value });
                  setShowCodeSuggestions(true);
                }}
                onFocus={() => setShowCodeSuggestions(true)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
              />

              {/* Code Suggestions Dropdown */}
              {!isEditing && showCodeSuggestions && codeSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 z-35 mt-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto p-1.5 space-y-0.5 animate-scale-in">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
                    {t('kh' === t('common.save') ? 'ផលិតផលមានស្រាប់' : 'Existing Products')}
                  </div>
                  {codeSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectExistingItem(item);
                        setShowCodeSuggestions(false);
                      }}
                      className="w-full px-2.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-lg flex items-center justify-between cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">[{item.code}] {item.name}</span>
                        {item.provider && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-400 block truncate">{item.provider.name}</span>
                        )}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 font-semibold font-mono shrink-0">
                        {item.boxes_quantity} {t('sell.quantitySelect.box')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item Name */}
            <div className="relative" ref={nameContainerRef}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {t('stock.form.itemName')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
              />

              {/* Suggestions Dropdown */}
              {!isEditing && showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 z-35 mt-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto p-1.5 space-y-0.5 animate-scale-in">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
                    {t('kh' === t('common.save') ? 'ផលិតផលមានស្រាប់' : 'Existing Products')}
                  </div>
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectExistingItem(item);
                        setShowSuggestions(false);
                      }}
                      className="w-full px-2.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-lg flex items-center justify-between cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">[{item.code}] {item.name}</span>
                        {item.provider && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-400 block truncate">{item.provider.name}</span>
                        )}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 font-semibold font-mono shrink-0">
                        {item.boxes_quantity} {t('sell.quantitySelect.box')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dosage Form (Formulation) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {t('stock.form.formulation')}
              </label>
              {showNewFormulationInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFormulationName}
                    onChange={(e) => setNewFormulationName(e.target.value)}
                    placeholder="New formulation name (e.g. Tablets)"
                    className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newFormulationName.trim()) return;
                      const cat = await handleCreateCategory('formulation', newFormulationName);
                      if (cat) {
                        const baseIds = form.category_ids.filter(id => !formulationCats.some(c => c.id === id));
                        baseIds.push(cat.id);
                        setForm((prev) => ({ ...prev, category_ids: baseIds }));
                        setNewFormulationName('');
                        setShowNewFormulationInput(false);
                      }
                    }}
                    disabled={createCategory.isPending}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {createCategory.isPending ? '...' : '+'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewFormulationInput(false);
                      setNewFormulationName('');
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={form.category_ids.find(id => formulationCats.some(c => c.id === id)) || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const baseIds = form.category_ids.filter(id => !formulationCats.some(c => c.id === id));
                      if (val) {
                        baseIds.push(Number(val));
                      }
                      setForm({ ...form, category_ids: baseIds });
                    }}
                    className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm cursor-pointer"
                  >
                    <option value="">{t('stock.form.formulationSelect')}</option>
                    {formulationCats.map((cat) => (
                      <option key={cat.id} value={cat.id}>{getCategoryDisplayName(cat.name, lang)}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewFormulationInput(true)}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Therapeutic Category */}
            <div className="relative" ref={categoryDropdownRef}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {t('stock.form.therapeutic')}
              </label>
              {showNewTherapeuticInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTherapeuticName}
                    onChange={(e) => setNewTherapeuticName(e.target.value)}
                    placeholder="New therapeutic class"
                    className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newTherapeuticName.trim()) return;
                      const cat = await handleCreateCategory('therapeutic', newTherapeuticName);
                      if (cat) {
                        setForm((prev) => ({ ...prev, category_ids: [...prev.category_ids, cat.id] }));
                        setNewTherapeuticName('');
                        setShowNewTherapeuticInput(false);
                      }
                    }}
                    disabled={createCategory.isPending}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {createCategory.isPending ? '...' : '+'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewTherapeuticInput(false);
                      setNewTherapeuticName('');
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="w-full text-left bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all flex items-center justify-between shadow-sm cursor-pointer"
                  >
                    <span className="truncate">
                      {form.category_ids.filter((id) => therapeuticCats.some((c) => c.id === id)).length > 0
                        ? categories
                            .filter((c) => form.category_ids.includes(c.id) && (c.type === 'therapeutic' || !c.type))
                            .map((c) => getCategoryDisplayName(c.name, lang))
                            .join(', ')
                        : t('stock.form.therapeuticSelect')}
                    </span>
                    <svg
                      className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                        showCategoryDropdown ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showCategoryDropdown && (
                    <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-56 overflow-y-auto p-1.5 space-y-0.5 animate-fade-in">
                      {therapeuticCats.map((cat) => {
                        const isSelected = form.category_ids.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              const nextIds = isSelected
                                ? form.category_ids.filter((id) => id !== cat.id)
                                : [...form.category_ids, cat.id];
                              setForm({ ...form, category_ids: nextIds });
                            }}
                            className={`w-full px-3 py-2 text-left text-sm font-medium rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <span>{getCategoryDisplayName(cat.name, lang)}</span>
                            {isSelected && (
                              <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                      
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewTherapeuticInput(true);
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm font-bold text-teal-600 dark:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors border-t border-slate-100 dark:border-slate-800 mt-1 pt-2 cursor-pointer"
                      >
                        <span className="text-base font-bold">+</span>
                        {t('kh' === t('common.save') ? 'បន្ថែមប្រភេទព្យាបាល' : 'Add Therapeutic Class')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Patient/Age Group */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {t('stock.form.ageGroup')}
              </label>
              <div className="flex flex-wrap gap-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 rounded-lg px-4 py-2.5">
                {ageGroupCats.map((cat) => {
                  const isSelected = form.category_ids.includes(cat.id);
                  return (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const nextIds = isSelected
                            ? form.category_ids.filter((id) => id !== cat.id)
                            : [...form.category_ids, cat.id];
                          setForm({ ...form, category_ids: nextIds });
                        }}
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500/20 border-slate-350 dark:border-slate-800 dark:bg-slate-950 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-450 transition-colors">
                        {getCategoryDisplayName(cat.name, lang)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Provider */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {t('stock.table.provider')}
              </label>
              <div className="flex gap-2">
                <select
                  value={form.provider_id}
                  onChange={(e) => setForm({ ...form, provider_id: e.target.value })}
                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm cursor-pointer"
                >
                  <option value="">{t('stock.form.providerSelect')}</option>
                  {providers.map((prov) => (
                    <option key={prov.id} value={prov.id}>{prov.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowProviderModal(true)}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Boxes Quantity */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {t('stock.form.boxesQty')}
              </label>
              <input
                type="number"
                min="0"
                value={form.boxes_quantity}
                onChange={(e) => setForm({ ...form, boxes_quantity: e.target.value })}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
              />
            </div>

            {/* Pieces per Box */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {t('stock.form.pcsPerBox')}
              </label>
              <input
                type="number"
                min="0"
                value={form.pieces_per_box}
                onChange={(e) => setForm({ ...form, pieces_per_box: e.target.value })}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
              />
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {t('stock.form.unitPrice')}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.unit_price}
                onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {t('stock.form.description')}
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm resize-none"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {t('stock.form.image')}
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 transition-colors bg-slate-50 dark:bg-slate-950"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : editingItem?.image_path ? (
                  <img src={`${API_BASE}/storage/${editingItem.image_path}`} alt="Product" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <>
                    <svg className="w-6 h-6 text-slate-400 dark:text-slate-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{t('stock.form.imageUploadHint')}</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 shadow-sm shadow-teal-600/10 transition-all cursor-pointer"
            >
              {isPending
                ? (isEditing ? t('stock.form.saving') : t('stock.form.creating'))
                : (isEditing ? t('common.save') : t('stock.addNewItem'))
              }
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {t('common.cancel')}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Provider Modal */}
      <ProviderModal
        isOpen={showProviderModal}
        onClose={() => setShowProviderModal(false)}
        onCreated={(newProv) => setForm({ ...form, provider_id: newProv.id })}
      />
    </>
  );
}
