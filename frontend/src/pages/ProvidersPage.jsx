import { useState } from 'react';
import {
  useProviders,
  useUpdateProvider,
  useDeleteProvider,
  useReassignStockAddition,
} from '../hooks/useApi';
import { useTranslation, formatCurrency } from '../i18n/translations';

const API_BASE = (() => {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    const hostname = window.location.hostname;
    return `http://${hostname}:8000`;
  }
  return import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
})();

// ── Helpers ──────────────────────────────────────────────────────
function toDateKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(dateKey, isKhmer) {
  const d = new Date(dateKey + 'T00:00:00');
  const today = toDateKey(new Date().toISOString());
  const yesterday = toDateKey(new Date(Date.now() - 86400000).toISOString());

  if (dateKey === today) return isKhmer ? 'ថ្ងៃនេះ' : 'Today';
  if (dateKey === yesterday) return isKhmer ? 'ម្សិលមិញ' : 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/**
 * Build a flat list of daily stock entries from providers.
 * Each entry = { dateKey, provider, items: [...items added that day] }
 * Sorted by most recent first.
 */
function buildDailyEntries(providers) {
  const entries = [];
  for (const provider of providers) {
    const additionsByDate = {};
    for (const addition of (provider.stock_additions || [])) {
      const dk = toDateKey(addition.created_at);
      if (!additionsByDate[dk]) additionsByDate[dk] = [];
      additionsByDate[dk].push(addition);
    }
    for (const [dateKey, additions] of Object.entries(additionsByDate)) {
      entries.push({ dateKey, provider, additions });
    }
  }
  // Sort by date descending, then provider name
  entries.sort((a, b) => {
    if (a.dateKey !== b.dateKey) return b.dateKey.localeCompare(a.dateKey);
    return a.provider.name.localeCompare(b.provider.name);
  });
  return entries;
}

// ── Delete Modal ─────────────────────────────────────────────────
function DeleteModal({ provider, onConfirm, onClose, isPending }) {
  const { t } = useTranslation();
  const isKh = t('common.save') === 'រក្សាទុក';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center mb-1">{isKh ? 'លុបអ្នកផ្គត់ផ្គង់?' : 'Delete Provider?'}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          {isKh ? 'តើអ្នកពិតជាចង់លុប' : 'Are you sure you want to delete'} <span className="font-bold text-slate-800 dark:text-slate-200">{provider.name}</span>?
          {provider.items_count > 0 && (
            <span className="block mt-1 text-rose-600 text-xs">⚠ {isKh ? `អ្នកផ្គត់ផ្គង់នេះមាន ${provider.items_count} ទំនិញពាក់ព័ន្ធ។` : `This provider has ${provider.items_count} linked items.`}</span>
          )}
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm">{t('common.cancel')}</button>
          <button onClick={onConfirm} disabled={isPending} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 transition-all disabled:opacity-50 cursor-pointer shadow-sm">{isPending ? t('common.loading') : t('common.delete')}</button>
        </div>
      </div>
    </div>
  );
}

// ── Expanded Items Detail ────────────────────────────────────────
function DayItemsPanel({ additions, provider, allProviders }) {
  const { t } = useTranslation();
  const reassignStockAddition = useReassignStockAddition();
  const [reassigningAdditionId, setReassigningAdditionId] = useState(null);

  const handleReassign = async (addition, newProviderId) => {
    if (!newProviderId || newProviderId === String(provider.id)) { setReassigningAdditionId(null); return; }
    try {
      await reassignStockAddition.mutateAsync({ id: addition.id, provider_id: newProviderId });
      setReassigningAdditionId(null);
    } catch (err) { console.error('Failed to reassign:', err); }
  };

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-200 dark:border-slate-800">
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {additions.map((addition) => {
          const item = addition.item || {};
          return (
            <div key={addition.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex gap-3 shadow-sm hover:shadow-md transition-shadow group">
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0">
                {item.image_path ? (
                  <img src={`${API_BASE}/storage/${item.image_path}`} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                      {item.code ? `[${item.code}] ` : ''}{item.name || 'Unknown Item'}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.categories && item.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.categories.map((cat) => (
                            <span key={cat.id} className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">{cat.name}</span>
                          ))}
                        </div>
                      )}
                      <span className="text-[10px] text-slate-400 dark:text-slate-600">{formatTime(addition.created_at)}</span>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">{formatCurrency(addition.unit_price)}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">📦 {addition.boxes_added} {t('providers.detail.boxes')}</span>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">💊 {item.pieces_per_box || 1} {t('providers.detail.pcsPerBox')}</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold ${addition.boxes_added <= 5 ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'}`}>
                    = {(addition.boxes_added || 0) * (item.pieces_per_box || 0)} pcs
                  </span>
                </div>
                {/* Reassign */}
                {reassigningAdditionId === addition.id ? (
                  <div className="mt-2 flex items-center gap-2 animate-fade-in">
                    <select defaultValue="" onChange={(e) => handleReassign(addition, e.target.value)} disabled={reassignStockAddition.isPending} className="flex-1 bg-white dark:bg-slate-950 border border-teal-300 dark:border-teal-800 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer">
                      <option value="" disabled>{t('stock.form.providerSelect')}</option>
                      {allProviders.filter((p) => p.id !== provider.id).map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                    <button onClick={() => setReassigningAdditionId(null)} className="px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">✕</button>
                  </div>
                ) : (
                  <button onClick={() => setReassigningAdditionId(addition.id)} className="mt-2 inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium opacity-0 group-hover:opacity-100 transition-all cursor-pointer" title={t('providers.detail.reassignHint')}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    {t('providers.detail.reassignProvider')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function ProvidersPage() {
  const [expandedKey, setExpandedKey] = useState(null);
  const [deletingProvider, setDeletingProvider] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();
  const isKh = t('common.save') === 'រក្សាទុក';

  const { data: providers = [], isLoading } = useProviders();
  const deleteProvider = useDeleteProvider();

  // Build daily stock entries
  const allEntries = buildDailyEntries(providers);

  // Filter by search
  const entries = searchTerm
    ? allEntries.filter((e) => {
        const q = searchTerm.toLowerCase();
        return (
          e.provider.name?.toLowerCase().includes(q) ||
          e.provider.phone?.toLowerCase().includes(q) ||
          e.additions.some((add) => add.item?.name?.toLowerCase().includes(q))
        );
      })
    : allEntries;

  const handleDelete = async () => {
    if (!deletingProvider) return;
    try {
      await deleteProvider.mutateAsync(deletingProvider.id);
      setDeletingProvider(null);
    } catch (err) { console.error('Failed to delete:', err); }
  };

  const totalProviders = providers.length;
  const totalItems = providers.reduce((s, p) => s + (p.items_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{t('providers.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{isKh ? 'បង្ហាញប្រវត្តិស្តុកប្រចាំថ្ងៃតាមអ្នកផ្គត់ផ្គង់។' : 'Daily stock history grouped by provider.'}</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-slate-600 dark:text-slate-300"><span className="font-bold text-slate-800 dark:text-slate-100">{totalProviders}</span> {t('nav.providers')}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300"><span className="font-bold text-slate-800 dark:text-slate-100">{totalItems}</span> {isKh ? 'ទំនិញសរុប' : 'total items'}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isKh ? 'ស្វែងរកតាមឈ្មោះអ្នកផ្គត់ផ្គង់ លេខទូរស័ព្ទ ឬឈ្មោះទំនិញ...' : 'Search by provider name, phone, or item name...'}
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
        />
      </div>

      {/* Stock History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(6)].map((_, i) => (<div key={i} className="h-14 bg-slate-50 dark:bg-slate-950 rounded-lg animate-pulse" />))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-20">📋</div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{searchTerm ? (isKh ? 'មិនមានលទ្ធផលត្រូវគ្នា។' : 'No matching results.') : (isKh ? 'មិនទាន់មានប្រវត្តិស្តុកនៅឡើយទេ។' : 'No stock history yet.')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 px-5 py-3 w-10">#</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 px-4 py-3">{isKh ? 'កាលបរិច្ឆេទ' : 'Date'}</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 px-4 py-3">{t('providers.table.name')}</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 px-4 py-3">{t('providers.table.phone')}</th>
                  <th className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 px-4 py-3">{isKh ? 'ទំនិញបានបន្ថែម' : 'Items Added'}</th>
                  <th className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 px-4 py-3">{isKh ? 'តម្លៃ' : 'Value'}</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 px-4 py-3">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => {
                  const key = `${entry.provider.id}-${entry.dateKey}`;
                  const isExpanded = expandedKey === key;
                  const totalValue = entry.additions.reduce((s, add) => s + (parseFloat(add.unit_price) || 0) * (add.boxes_added || 0) * (add.item?.pieces_per_box || 1), 0);
                  const totalBoxes = entry.additions.reduce((s, add) => s + (add.boxes_added || 0), 0);

                  return (
                    <StockEntryRow
                      key={key}
                      entry={entry}
                      idx={idx}
                      isExpanded={isExpanded}
                      totalValue={totalValue}
                      totalBoxes={totalBoxes}
                      onToggle={() => setExpandedKey(isExpanded ? null : key)}
                      onDelete={() => setDeletingProvider(entry.provider)}
                      allProviders={providers}
                      isKh={isKh}
                      t={t}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deletingProvider && (
        <DeleteModal provider={deletingProvider} onConfirm={handleDelete} onClose={() => setDeletingProvider(null)} isPending={deleteProvider.isPending} />
      )}
    </div>
  );
}

// ── Stock Entry Row ──────────────────────────────────────────────
function StockEntryRow({ entry, idx, isExpanded, totalValue, totalBoxes, onToggle, onDelete, allProviders, isKh, t }) {
  const { provider, dateKey, additions } = entry;

  // Check if this date is "today"
  const isToday = dateKey === toDateKey(new Date().toISOString());

  return (
    <>
      <tr
        className={`border-b border-slate-200 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer ${isExpanded ? 'bg-teal-50/30 dark:bg-teal-950/10' : ''}`}
        onClick={onToggle}
      >
        <td className="px-5 py-4 text-xs text-slate-400 dark:text-slate-500 font-medium">{idx + 1}</td>

        {/* Date */}
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            {isToday && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />}
            <span className={`text-sm font-semibold ${isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {formatDate(dateKey, isKh)}
            </span>
          </div>
        </td>

        {/* Provider Name */}
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{provider.name?.charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{provider.name}</span>
          </div>
        </td>

        {/* Phone */}
        <td className="px-4 py-4">
          {provider.phone ? (
            <span className="text-sm text-slate-600 dark:text-slate-300">{provider.phone}</span>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500 italic">—</span>
          )}
        </td>

        {/* Items Added */}
        <td className="px-4 py-4 text-center">
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              isExpanded
                ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 border-teal-200/50 dark:border-teal-900/50 shadow-sm'
                : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-teal-200/50 dark:border-teal-900/50 hover:bg-teal-100 dark:hover:bg-teal-950'
            }`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {additions.length} {isKh ? 'ទំនិញ' : (additions.length === 1 ? 'item' : 'items')}
            <span className="text-[10px] font-normal text-teal-600/60 dark:text-teal-400/60">({totalBoxes} {isKh ? 'ប្រអប់' : 'boxes'})</span>
            <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </td>

        {/* Value */}
        <td className="px-4 py-4 text-center">
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalValue)}</span>
        </td>

        {/* Actions */}
        <td className="px-4 py-4 text-right">
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <button onClick={onDelete} className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer" title={t('common.delete')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Detail */}
      {isExpanded && (
        <tr><td colSpan={7} className="p-0"><DayItemsPanel additions={additions} provider={provider} allProviders={allProviders} /></td></tr>
      )}
    </>
  );
}
