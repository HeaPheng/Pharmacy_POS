import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  useCategories,
  useItems,
  useBuyers,
  useCreateBuyer,
  useCreateInvoice,
} from '../hooks/useApi';
import { useTranslation, formatCurrency, getCategoryDisplayName } from '../i18n/translations';

const API_BASE = (() => {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    const hostname = window.location.hostname;
    return `http://${hostname}:8000`;
  }
  return import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
})();

function generateInvoiceNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  return `INV-${date}-${seq}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Buyer Info Panel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function BuyerInfoPanel({
  buyerMode,
  setBuyerMode,
  selectedBuyer,
  setSelectedBuyer,
  itemSearchQuery,
  setItemSearchQuery
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [newBuyerName, setNewBuyerName] = useState('');
  const [newBuyerPhone, setNewBuyerPhone] = useState('');
  const [showNewBuyerForm, setShowNewBuyerForm] = useState(false);
  const dropdownRef = useRef(null);
  const { t } = useTranslation();

  const { data: buyers = [] } = useBuyers(searchTerm);
  const createBuyer = useCreateBuyer();

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelectBuyer = (buyer) => {
    setSelectedBuyer(buyer);
    setSearchTerm(buyer.name);
    setShowDropdown(false);
  };

  const handleCreateBuyer = async () => {
    if (!newBuyerName.trim()) return;
    try {
      const buyer = await createBuyer.mutateAsync({
        name: newBuyerName.trim(),
        phone: newBuyerPhone.trim() || null,
        is_walkin: false,
      });
      setSelectedBuyer(buyer);
      setSearchTerm(buyer.name);
      setNewBuyerName('');
      setNewBuyerPhone('');
      setShowNewBuyerForm(false);
      toast.success(t('kh' === t('common.save') ? 'អ្នកទិញត្រូវបានបង្កើតដោយជោគជ័យ' : 'Buyer created successfully'));
    } catch (err) {
      console.error('Failed to create buyer:', err);
      const isUniqueError = err.response?.data?.errors?.phone?.[0]?.includes('taken') ||
        err.response?.data?.message?.includes('unique') ||
        err.message?.includes('422');

      if (isUniqueError) {
        toast.error(t('kh' === t('common.save') ? 'លេខទូរស័ព្ទនេះត្រូវបានប្រើប្រាស់រួចហើយ' : 'This phone number is already registered'));
      } else {
        toast.error(t('kh' === t('common.save') ? 'ការបង្កើតអ្នកទិញបានបរាជ័យ' : 'Failed to create buyer'));
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl p-5 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center">
          <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('sell.buyerInfo')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('kh' === t('common.save') ? 'តើអ្នកណាជាអ្នកទិញទំនិញ?' : 'Who is purchasing?')}
          </p>
        </div>
      </div>

      {/* Walk-in / Known Buyer Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setBuyerMode('walkin'); setSelectedBuyer(null); setSearchTerm(''); }}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${buyerMode === 'walkin'
              ? 'bg-teal-600 text-white shadow-sm hover:bg-teal-700'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-800'
            }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t('sell.walkIn')}
          </span>
        </button>
        <button
          onClick={() => setBuyerMode('known')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${buyerMode === 'known'
              ? 'bg-teal-600 text-white shadow-sm hover:bg-teal-700'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-800'
            }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t('sell.knownBuyer')}
          </span>
        </button>
      </div>

      {/* Known Buyer — Autocomplete search */}
      {buyerMode === 'known' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex gap-2" ref={dropdownRef}>
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  if (!e.target.value) setSelectedBuyer(null);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder={t('sell.searchBuyer')}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
              />

              {/* Dropdown */}
              {showDropdown && searchTerm && (
                <div className="absolute z-30 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {buyers.length > 0 ? (
                    buyers.map((buyer) => (
                      <button
                        key={buyer.id}
                        onClick={() => handleSelectBuyer(buyer)}
                        className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors first:rounded-t-lg last:rounded-b-lg cursor-pointer text-slate-800 dark:text-slate-100"
                      >
                        <span className="text-sm font-medium">{buyer.name}</span>
                        {buyer.phone && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">{buyer.phone}</span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 text-center">
                      {t('kh' === t('common.save') ? 'រកមិនឃើញអ្នកទិញទេ' : 'No buyers found')}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => { setShowNewBuyerForm(true); setShowDropdown(false); }}
              className="px-3.5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center justify-center gap-1.5 text-sm font-bold shadow-sm shadow-teal-500/10 active:scale-[0.98] transition-all cursor-pointer shrink-0"
              title={t('kh' === t('common.save') ? 'បន្ថែមអ្នកទិញថ្មី' : 'Add New Buyer')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">
                {t('kh' === t('common.save') ? 'បន្ថែមថ្មី' : 'Add New')}
              </span>
            </button>
          </div>

          {/* Selected buyer badge */}
          {selectedBuyer && (
            <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900 rounded-lg text-teal-700 dark:text-teal-400">
              <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white">
                {selectedBuyer.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-teal-900 dark:text-teal-100 truncate">{selectedBuyer.name}</p>
                {selectedBuyer.phone && <p className="text-xs text-teal-600/70 dark:text-teal-400/70">{selectedBuyer.phone}</p>}
              </div>
              <button
                onClick={() => { setSelectedBuyer(null); setSearchTerm(''); }}
                className="text-teal-600/60 hover:text-teal-800 dark:hover:text-teal-300 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* New Buyer Form */}
          {showNewBuyerForm && (
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 animate-scale-in">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('kh' === t('common.save') ? 'អ្នកទិញថ្មី' : 'New Buyer')}
              </h4>
              <input
                type="text"
                value={newBuyerName}
                onChange={(e) => setNewBuyerName(e.target.value)}
                placeholder={t('common.name') + " *"}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm"
              />
              <input
                type="text"
                value={newBuyerPhone}
                onChange={(e) => setNewBuyerPhone(e.target.value)}
                placeholder={t('common.phone') + ` (${t('kh' === t('common.save') ? 'ជម្រើស' : 'optional')})`}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewBuyerForm(false)}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleCreateBuyer}
                  disabled={!newBuyerName.trim() || createBuyer.isPending}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors disabled:opacity-50 cursor-pointer shadow-sm shadow-teal-600/10"
                >
                  {createBuyer.isPending ? t('stock.form.saving') : t('common.save')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Item search input (always visible at the bottom) */}
      <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
        <div className="relative animate-fade-in">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={itemSearchQuery}
            onChange={(e) => setItemSearchQuery(e.target.value)}
            placeholder={t('kh' === t('common.save') ? 'ស្វែងរកតាមឈ្មោះ ឬកូដថ្នាំ...' : 'Search medicine by name or code...')}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-850 dark:text-slate-100 placeholder:text-slate-450 dark:placeholder:text-slate-655 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
          />
          {itemSearchQuery && (
            <button
              onClick={() => setItemSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Category Filter Bar
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CategoryFilterBar({
  categories,
  activeAgeGroup,
  setActiveAgeGroup,
  activeFormulation,
  setActiveFormulation,
  activeTherapeutic,
  setActiveTherapeutic,
  getFilteredCount,
  allAgeGroupCount,
  allFormulationCount,
  allTherapeuticCount
}) {
  const { t, lang } = useTranslation();

  const ageGroupCats = categories.filter((c) => c.type === 'age_group');
  const formulationCats = categories.filter((c) => c.type === 'formulation');
  const therapeuticCats = categories.filter((c) => c.type === 'therapeutic' || !c.type);

  const selectClass = "w-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2.5 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Patient Group */}
      <div className="space-y-1">
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
          {t('stock.form.ageGroup')}
        </label>
        <div className="relative">
          <select
            value={activeAgeGroup || ''}
            onChange={(e) => setActiveAgeGroup(e.target.value ? Number(e.target.value) : null)}
            className={selectClass}
          >
            <option value="">{t('sell.categoryFilterAll')} ({allAgeGroupCount})</option>
            {ageGroupCats.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {getCategoryDisplayName(cat.name, lang)} ({getFilteredCount('age_group', cat.id)})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* Formulation */}
      <div className="space-y-1">
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
          {t('stock.form.formulation')}
        </label>
        <div className="relative">
          <select
            value={activeFormulation || ''}
            onChange={(e) => setActiveFormulation(e.target.value ? Number(e.target.value) : null)}
            className={selectClass}
          >
            <option value="">{t('sell.categoryFilterAll')} ({allFormulationCount})</option>
            {formulationCats.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {getCategoryDisplayName(cat.name, lang)} ({getFilteredCount('formulation', cat.id)})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* Therapeutic */}
      <div className="space-y-1">
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
          {t('stock.form.therapeutic')}
        </label>
        <div className="relative">
          <select
            value={activeTherapeutic || ''}
            onChange={(e) => setActiveTherapeutic(e.target.value ? Number(e.target.value) : null)}
            className={selectClass}
          >
            <option value="">{t('sell.categoryFilterAll')} ({allTherapeuticCount})</option>
            {therapeuticCats.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {getCategoryDisplayName(cat.name, lang)} ({getFilteredCount('therapeutic', cat.id)})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Quantity Selector Modal
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function QuantitySelector({ item, onAdd, onClose }) {
  const [boxes, setBoxes] = useState('');
  const [pieces, setPieces] = useState('');
  const { t } = useTranslation();

  const totalPieces = (parseInt(boxes) || 0) * (item.pieces_per_box || 1) + (parseInt(pieces) || 0);
  const availablePieces = (item.boxes_quantity || 0) * (item.pieces_per_box || 1);
  const boxPrice = parseFloat(item.unit_price || 0);
  const piecePrice = boxPrice / (item.pieces_per_box || 1);
  const subtotal = (parseInt(boxes) || 0) * boxPrice + (parseInt(pieces) || 0) * piecePrice;
  const isOverStock = totalPieces > availablePieces;
  const isZero = totalPieces === 0;

  const handleAdd = () => {
    if (isOverStock || isZero) return;
    onAdd({
      item,
      quantity_boxes: parseInt(boxes) || 0,
      quantity_pieces: parseInt(pieces) || 0,
      totalPieces,
      subtotal,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0">
            {item.image_path ? (
              <img src={`${API_BASE}/storage/${item.image_path}`} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl opacity-30">💊</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{item.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('sell.stock')}: {item.boxes_quantity} {t('sell.quantitySelect.box')} · {availablePieces} {t('sell.quantitySelect.pcs')} · {formatCurrency(item.unit_price)}/{t('sell.quantitySelect.box')}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quantity Inputs */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t('sell.quantitySelect.box')}
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setBoxes(Math.max(0, (parseInt(boxes) || 0) - 1) || '')}
                className="px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >−</button>
              <input
                type="number"
                value={boxes}
                onChange={(e) => { const v = e.target.value; setBoxes(v === '' ? '' : Math.max(0, parseInt(v) || 0)); }}
                className="w-full bg-transparent text-center text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setBoxes((parseInt(boxes) || 0) + 1)}
                className="px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >+</button>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block text-center">
              {item.pieces_per_box} {t('sell.quantitySelect.pcs')}/{t('sell.quantitySelect.box')}
            </span>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t('sell.quantitySelect.pcs')}
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setPieces(Math.max(0, (parseInt(pieces) || 0) - 1) || '')}
                className="px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >−</button>
              <input
                type="number"
                value={pieces}
                onChange={(e) => { const v = e.target.value; setPieces(v === '' ? '' : Math.max(0, parseInt(v) || 0)); }}
                className="w-full bg-transparent text-center text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setPieces((parseInt(pieces) || 0) + 1)}
                className="px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >+</button>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block text-center">
              {t('kh' === t('common.save') ? 'គ្រាប់រាយ' : 'individual pcs')}
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 mb-4">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t('kh' === t('common.save') ? 'ចំនួនសរុប៖' : 'Total pieces:')}</span>
            <span className={`font-bold ${isOverStock ? 'text-rose-600 animate-pulse' : 'text-slate-850 dark:text-slate-200'}`}>
              {totalPieces} {t('sell.quantitySelect.pcs')}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-slate-500 dark:text-slate-400">{t('sell.subtotal')}:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(subtotal)}</span>
          </div>
          {isOverStock && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {t('kh' === t('common.save') ? 'លើសពីស្តុកដែលមានស្រាប់' : 'Exceeds available stock')} ({availablePieces} {t('sell.quantitySelect.pcs')})
            </p>
          )}
        </div>

        {/* Action */}
        <button
          onClick={handleAdd}
          disabled={isOverStock || isZero}
          className="w-full py-3 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/10 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          {t('sell.quantitySelect.addToCart')}
        </button>
      </div>
    </div>
  );
}

const getCategoryBadgeClass = (type) => {
  switch (type) {
    case 'age_group':
      return 'bg-blue-600 text-white border border-blue-500 dark:bg-blue-600 dark:text-white dark:border-blue-500 shadow-md font-extrabold uppercase tracking-wider text-[9.5px] px-2 py-0.5';
    case 'formulation':
      return 'bg-amber-50/90 text-amber-600 border border-amber-200/30 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-900/30 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5';
    case 'therapeutic':
    default:
      return 'bg-teal-50/90 text-teal-600 border border-teal-200/30 dark:bg-teal-950/80 dark:text-teal-400 dark:border-teal-900/30 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5';
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Item Selection Card (POS version)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function PosItemCard({ item, isInCart, onSelect }) {
  const { t, lang } = useTranslation();
  const totalPieces = (item.boxes_quantity || 0) * (item.pieces_per_box || 1);
  const outOfStock = totalPieces === 0;
  const isLowStock = item.boxes_quantity <= 5;
  const imageUrl = item.image_path ? `${API_BASE}/storage/${item.image_path}` : null;

  const ageGroupCats = item.categories?.filter((cat) => cat.type === 'age_group') || [];
  const formulationCats = item.categories?.filter((cat) => cat.type === 'formulation') || [];
  const therapeuticCats = item.categories?.filter((cat) => cat.type === 'therapeutic') || [];

  return (
    <button
      onClick={() => !outOfStock && onSelect(item)}
      disabled={outOfStock}
      className={`group relative text-left bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-100/50 dark:hover:shadow-none hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full ${isInCart
          ? 'border-teal-500 ring-1 ring-teal-500/20'
          : outOfStock
            ? 'border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-950'
            : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer'
        }`}
    >
      {isInCart && (
        <div className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center shadow-lg border border-teal-500/30">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {outOfStock && (
        <div className="absolute inset-0 z-10 bg-white/70 dark:bg-slate-950/70 flex items-center justify-center">
          <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-xs font-bold uppercase tracking-wider border border-rose-200 dark:border-rose-900">
            {t('sell.outOfStock')}
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-950 overflow-hidden shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Age Group Badges (Top-Left) */}
        {ageGroupCats.length > 0 && (
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 z-10">
            {ageGroupCats.map((cat) => (
              <span
                key={cat.id}
                className="rounded-full shadow-sm bg-blue-600 text-white border border-blue-500/30 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Dosage Form Badge (Top-Right) - Fades on hover, hidden if in cart */}
        {formulationCats.length > 0 && !isInCart && (
          <div className="absolute top-2.5 right-2.5 z-10 transition-all duration-300 group-hover:opacity-0 group-hover:scale-95">
            {formulationCats.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider shadow-sm backdrop-blur-md bg-amber-500/90 text-white border border-amber-400/30"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-grow justify-between gap-3">
        <div className="space-y-2">
          {/* Therapeutic Tags in Body */}
          {therapeuticCats.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {therapeuticCats.map((cat) => (
                <span
                  key={cat.id}
                  className="rounded-md text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border bg-teal-500/5 text-teal-600 border-teal-500/10 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {/* Title & Code */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {item.name}
            </h3>
            {item.code && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-extrabold shrink-0">
                {item.code}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {/* Stats Row: Boxes | Total Pcs */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/85 dark:border-slate-800/80 rounded-xl p-2">
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('stock.table.boxes')}</span>
              <span className="text-xs font-black text-slate-700 dark:text-slate-200 mt-0.5">{item.boxes_quantity}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center border-l border-slate-150 dark:border-slate-800">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('stock.table.totalPcs')}</span>
              <span className="text-xs font-black text-slate-700 dark:text-slate-200 mt-0.5">{totalPieces}</span>
            </div>
          </div>

          {/* Footer Price / Stock Status */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('stock.table.unitPrice')}</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatCurrency(item.unit_price)}
              </span>
            </div>
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 ${isLowStock
                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500 border border-rose-100/50 dark:border-rose-900/30'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLowStock ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
              {isLowStock ? t('dashboard.lowStock') : t('sell.inStock')}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Cart Panel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CartPanel({ cart, onRemove, onGenerateInvoice, isPending }) {
  const grandTotal = cart.reduce((sum, entry) => sum + entry.subtotal, 0);
  const isEmpty = cart.length === 0;
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center">
              <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('sell.cart')}</h3>
          </div>
          {!isEmpty && (
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 text-xs font-bold border border-teal-200/50 dark:border-teal-900/50 shadow-sm">
              {cart.length} {t('stock.table.item')}
            </span>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '400px' }}>
        {isEmpty ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3 opacity-20">🛒</div>
            <p className="text-sm text-slate-450 dark:text-slate-500 font-medium">{t('sell.emptyCart')}</p>
          </div>
        ) : (
          cart.map((entry, index) => (
            <div
              key={entry.item.id}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-sm animate-fade-in"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0">
                  {entry.item.image_path ? (
                    <img src={`${API_BASE}/storage/${entry.item.image_path}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm opacity-20">💊</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{entry.item.name}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {entry.quantity_boxes > 0 && `${entry.quantity_boxes} ${t('sell.quantitySelect.box')}`}
                    {entry.quantity_boxes > 0 && entry.quantity_pieces > 0 && ' + '}
                    {entry.quantity_pieces > 0 && `${entry.quantity_pieces} ${t('sell.quantitySelect.pcs')}`}
                    {' '}· {entry.totalPieces} {t('sell.quantitySelect.pcs')}
                  </p>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(entry.subtotal)}</span>
                  <button
                    onClick={() => onRemove(index)}
                    className="block mt-1 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer — Total & Generate */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">{t('sell.grandTotal')}</span>
          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(grandTotal)}
          </span>
        </div>
        <button
          onClick={onGenerateInvoice}
          disabled={isEmpty || isPending}
          className="w-full py-3 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/10 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('sell.generatingInvoice')}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('sell.generateInvoice')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Invoice Success Modal
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function InvoiceSuccessModal({ invoice, onClose }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleViewInvoice = () => {
    navigate(`/invoice/${invoice.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-scale-in text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center mx-auto mb-4 shadow-sm text-teal-600 dark:text-teal-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-1">{t('sell.successModal.title')}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {t('kh' === t('common.save') ? 'ការលក់ត្រូវបានកត់ត្រា និងធ្វើបច្ចុប្បន្នភាពស្តុកដោយជោគជ័យ។' : 'The sale has been recorded and stock updated.')}
        </p>

        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-left space-y-2 mb-6">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">{t('invoice.number')}</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{invoice.invoice_number}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">{t('invoice.grandTotal')}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(invoice.total_amount)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">{t('stock.table.item')}</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {invoice.invoice_items?.length || 0} {t('kh' === t('common.save') ? 'មុខទំនិញ' : 'line items')}
            </span>
          </div>
          {invoice.buyer && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">{t('invoice.buyer')}</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{invoice.buyer.name}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
          >
            {t('sell.successModal.close')}
          </button>
          <button
            onClick={handleViewInvoice}
            className="flex-1 py-3 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {t('sell.successModal.viewInvoice')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Mobile Cart Drawer Toggle
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MobileCartButton({ count, total, onClick }) {
  const { t } = useTranslation();
  if (count === 0) return null;
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 lg:hidden flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 active:scale-95 transition-all cursor-pointer"
    >
      <div className="relative">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 text-[10px] font-bold flex items-center justify-center shadow-sm">
          {count}
        </span>
      </div>
      <span className="text-sm font-bold">{formatCurrency(total)}</span>
    </button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Sell Page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function SellPage() {
  const [buyerMode, setBuyerMode] = useState('walkin');
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [activeAgeGroup, setActiveAgeGroup] = useState(null);
  const [activeFormulation, setActiveFormulation] = useState(null);
  const [activeTherapeutic, setActiveTherapeutic] = useState(null);
  const [selectorItem, setSelectorItem] = useState(null);
  const [cart, setCart] = useState([]);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState(null);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const { t } = useTranslation();

  const { data: categories = [] } = useCategories();
  const { data: items = [], isLoading: itemsLoading } = useItems({});
  const createInvoice = useCreateInvoice();

  const getFilteredCount = (type, categoryId) => {
    return items.filter((item) => {
      const matchesSearch = !itemSearchQuery ||
        item.name?.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
        item.code?.toLowerCase().includes(itemSearchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (type !== 'age_group') {
        const matchesAgeGroup = !activeAgeGroup ||
          item.categories?.some((cat) => cat.id === activeAgeGroup);
        if (!matchesAgeGroup) return false;
      } else {
        const matchesAgeGroup = item.categories?.some((cat) => cat.id === categoryId);
        if (!matchesAgeGroup) return false;
      }

      if (type !== 'formulation') {
        const matchesFormulation = !activeFormulation ||
          item.categories?.some((cat) => cat.id === activeFormulation);
        if (!matchesFormulation) return false;
      } else {
        const matchesFormulation = item.categories?.some((cat) => cat.id === categoryId);
        if (!matchesFormulation) return false;
      }

      if (type !== 'therapeutic') {
        const matchesTherapeutic = !activeTherapeutic ||
          item.categories?.some((cat) => cat.id === activeTherapeutic);
        if (!matchesTherapeutic) return false;
      } else {
        const matchesTherapeutic = item.categories?.some((cat) => cat.id === categoryId);
        if (!matchesTherapeutic) return false;
      }

      return true;
    }).length;
  };

  const allAgeGroupCount = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = !itemSearchQuery || item.name?.toLowerCase().includes(itemSearchQuery.toLowerCase()) || item.code?.toLowerCase().includes(itemSearchQuery.toLowerCase());
      const matchesForm = !activeFormulation || item.categories?.some((cat) => cat.id === activeFormulation);
      const matchesTher = !activeTherapeutic || item.categories?.some((cat) => cat.id === activeTherapeutic);
      return matchesSearch && matchesForm && matchesTher;
    }).length;
  }, [items, itemSearchQuery, activeFormulation, activeTherapeutic]);

  const allFormulationCount = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = !itemSearchQuery || item.name?.toLowerCase().includes(itemSearchQuery.toLowerCase()) || item.code?.toLowerCase().includes(itemSearchQuery.toLowerCase());
      const matchesAge = !activeAgeGroup || item.categories?.some((cat) => cat.id === activeAgeGroup);
      const matchesTher = !activeTherapeutic || item.categories?.some((cat) => cat.id === activeTherapeutic);
      return matchesSearch && matchesAge && matchesTher;
    }).length;
  }, [items, itemSearchQuery, activeAgeGroup, activeTherapeutic]);

  const allTherapeuticCount = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = !itemSearchQuery || item.name?.toLowerCase().includes(itemSearchQuery.toLowerCase()) || item.code?.toLowerCase().includes(itemSearchQuery.toLowerCase());
      const matchesAge = !activeAgeGroup || item.categories?.some((cat) => cat.id === activeAgeGroup);
      const matchesForm = !activeFormulation || item.categories?.some((cat) => cat.id === activeFormulation);
      return matchesSearch && matchesAge && matchesForm;
    }).length;
  }, [items, itemSearchQuery, activeAgeGroup, activeFormulation]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = !itemSearchQuery ||
        item.name?.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
        item.code?.toLowerCase().includes(itemSearchQuery.toLowerCase());
      if (!matchesSearch) return false;

      const matchesAgeGroup = !activeAgeGroup || item.categories?.some((cat) => cat.id === activeAgeGroup);
      if (!matchesAgeGroup) return false;

      const matchesFormulation = !activeFormulation || item.categories?.some((cat) => cat.id === activeFormulation);
      if (!matchesFormulation) return false;

      const matchesTherapeutic = !activeTherapeutic || item.categories?.some((cat) => cat.id === activeTherapeutic);
      if (!matchesTherapeutic) return false;

      return true;
    });
  }, [items, activeAgeGroup, activeFormulation, activeTherapeutic, itemSearchQuery]);

  const cartItemIds = useMemo(() => new Set(cart.map((e) => e.item.id)), [cart]);

  const handleAddToCart = (entry) => {
    setCart((prev) => {
      const existing = prev.findIndex((e) => e.item.id === entry.item.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = entry;
        return updated;
      }
      return [...prev, entry];
    });
  };

  const handleRemoveFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateInvoice = async () => {
    if (cart.length === 0) return;

    const payload = {
      buyer_id: buyerMode === 'known' && selectedBuyer ? selectedBuyer.id : null,
      invoice_number: generateInvoiceNumber(),
      items: cart.map((entry) => ({
        item_id: entry.item.id,
        quantity_boxes: entry.quantity_boxes,
        quantity_pieces: entry.quantity_pieces,
      })),
    };

    try {
      const invoice = await createInvoice.mutateAsync(payload);
      setSuccessInvoice(invoice);
      setCart([]);
      setBuyerMode('walkin');
      setSelectedBuyer(null);
      setItemSearchQuery('');
      setMobileCartOpen(false);
    } catch (err) {
      console.error('Failed to generate invoice:', err);
    }
  };

  const grandTotal = cart.reduce((sum, e) => sum + e.subtotal, 0);

  return (
    <div className="space-y-6">
      {/* Main layout: Left (content) + Right (cart) */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column — Buyer + Categories + Items */}
        <div className="flex-1 space-y-5 min-w-0">
          <BuyerInfoPanel
            buyerMode={buyerMode}
            setBuyerMode={setBuyerMode}
            selectedBuyer={selectedBuyer}
            setSelectedBuyer={setSelectedBuyer}
            itemSearchQuery={itemSearchQuery}
            setItemSearchQuery={setItemSearchQuery}
          />

          <CategoryFilterBar
            categories={categories}
            activeAgeGroup={activeAgeGroup}
            setActiveAgeGroup={setActiveAgeGroup}
            activeFormulation={activeFormulation}
            setActiveFormulation={setActiveFormulation}
            activeTherapeutic={activeTherapeutic}
            setActiveTherapeutic={setActiveTherapeutic}
            getFilteredCount={getFilteredCount}
            allAgeGroupCount={allAgeGroupCount}
            allFormulationCount={allFormulationCount}
            allTherapeuticCount={allTherapeuticCount}
          />

          {/* Item Selection Grid */}
          {itemsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 border border-transparent">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl h-48 animate-pulse" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4 opacity-30">🔍</div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {t('kh' === t('common.save') ? 'រកមិនឃើញទំនិញទេ' : 'No items found')}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {(activeAgeGroup || activeFormulation || activeTherapeutic)
                  ? t('kh' === t('common.save') ? 'សាកល្បងជ្រើសរើសប្រភេទផ្សេងទៀត។' : 'Try selecting a different category.')
                  : t('kh' === t('common.save') ? 'បន្ថែមទំនិញនៅក្នុងទំព័រគ្រប់គ្រងស្តុក។' : 'Add items in the Stock Management page.')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <PosItemCard
                  key={item.id}
                  item={item}
                  isInCart={cartItemIds.has(item.id)}
                  onSelect={(itm) => setSelectorItem(itm)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right column — Cart Panel (desktop) */}
        <div className="hidden lg:block w-72 xl:w-80 shrink-0">
          <div className="sticky top-24">
            <CartPanel
              cart={cart}
              onRemove={handleRemoveFromCart}
              onGenerateInvoice={handleGenerateInvoice}
              isPending={createInvoice.isPending}
              buyerMode={buyerMode}
              selectedBuyer={selectedBuyer}
            />
          </div>
        </div>
      </div>

      {/* Mobile Cart FAB */}
      <MobileCartButton
        count={cart.length}
        total={grandTotal}
        onClick={() => setMobileCartOpen(true)}
      />

      {/* Mobile Cart Drawer */}
      {mobileCartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileCartOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-2xl overflow-hidden flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center py-2 shrink-0 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>
            <div className="flex-1 overflow-y-auto">
              <CartPanel
                cart={cart}
                onRemove={handleRemoveFromCart}
                onGenerateInvoice={handleGenerateInvoice}
                isPending={createInvoice.isPending}
                buyerMode={buyerMode}
                selectedBuyer={selectedBuyer}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quantity Selector Modal */}
      {selectorItem && (
        <QuantitySelector
          item={selectorItem}
          onAdd={handleAddToCart}
          onClose={() => setSelectorItem(null)}
        />
      )}

      {/* Success Modal */}
      {successInvoice && (
        <InvoiceSuccessModal
          invoice={successInvoice}
          onClose={() => setSuccessInvoice(null)}
        />
      )}
    </div>
  );
}
