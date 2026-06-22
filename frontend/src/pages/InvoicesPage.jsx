import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useInvoices } from '../hooks/useApi';
import { useTranslation, formatCurrency, getCategoryDisplayName } from '../i18n/translations';

// ── Helpers ──────────────────────────────────────────────────────
function formatInvNumber(id) {
  return `INV-${String(id).padStart(5, '0')}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function getBuyerType(invoice) {
  return invoice.buyer ? 'named' : 'walk-in';
}

function getInvoiceCategories(invoice) {
  const cats = new Set();
  (invoice.invoice_items || []).forEach((li) => {
    if (li.item?.categories) {
      li.item.categories.forEach((cat) => {
        if (cat.name) cats.add(cat.name);
      });
    }
  });
  return [...cats];
}

export default function InvoicesPage() {
  const { data: invoices = [], isLoading } = useInvoices();
  const { t, lang } = useTranslation();
  const isKh = t('common.save') === 'រក្សាទុក';

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [buyerFilter, setBuyerFilter] = useState('all'); // 'all' | 'named' | 'walk-in'
  const [categoryFilter, setCategoryFilter] = useState('all');

  const allCategories = useMemo(() => {
    const cats = new Set();
    invoices.forEach((inv) => {
      (inv.invoice_items || []).forEach((li) => {
        if (li.item?.categories) {
          li.item.categories.forEach((cat) => {
            if (cat.name) cats.add(cat.name);
          });
        }
      });
    });
    return [...cats].sort();
  }, [invoices]);

  // Filter invoices
  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      // Search filter
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const invNum = formatInvNumber(inv.id).toLowerCase();
        const rawNum = String(inv.invoice_number).toLowerCase();
        const buyerName = inv.buyer?.name?.toLowerCase() || '';
        const buyerPhone = inv.buyer?.phone?.toLowerCase() || '';
        const matchSearch = invNum.includes(q) || rawNum.includes(q) || buyerName.includes(q) || buyerPhone.includes(q);
        if (!matchSearch) return false;
      }

      // Buyer type filter
      if (buyerFilter !== 'all') {
        const type = getBuyerType(inv);
        if (type !== buyerFilter) return false;
      }

      // Category filter
      if (categoryFilter !== 'all') {
        const cats = getInvoiceCategories(inv);
        if (!cats.includes(categoryFilter)) return false;
      }

      return true;
    });
  }, [invoices, searchTerm, buyerFilter, categoryFilter]);

  const totalRevenue = filtered.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);
  const todayCount = filtered.filter((inv) => {
    const d = new Date(inv.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const hasActiveFilters = searchTerm || buyerFilter !== 'all' || categoryFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{t('invoices.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('invoices.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300"><span className="font-bold text-slate-800 dark:text-slate-100">{filtered.length}</span> {isKh ? 'វិក្កយបត្រ' : 'invoices'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-slate-600 dark:text-slate-300"><span className="font-bold text-slate-800 dark:text-slate-100">{todayCount}</span> {isKh ? 'ថ្ងៃនេះ' : 'today'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-slate-600 dark:text-slate-300">{isKh ? 'សរុប' : 'Total'}: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalRevenue)}</span></span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">{t('invoices.table.total')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">{t('invoices.title')}</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center">
              <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{filtered.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">{t('dashboard.todaySales')}</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center">
              <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{todayCount}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isKh ? 'ស្វែងរកតាមលេខវិក្កយបត្រ ឈ្មោះ ឬលេខទូរស័ព្ទ...' : 'Search by invoice #, name, or phone...'}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
          />
        </div>

        {/* Buyer Type Filter */}
        <select
          value={buyerFilter}
          onChange={(e) => setBuyerFilter(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm cursor-pointer min-w-[160px]"
        >
          <option value="all">{isKh ? 'អ្នកទិញទាំងអស់' : 'All Buyers'}</option>
          <option value="named">{isKh ? 'ភ្ញៀវស្គាល់' : 'Known Buyer'}</option>
          <option value="walk-in">{isKh ? 'ភ្ញៀវទូទៅ' : 'Walk-in Buyer'}</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm cursor-pointer min-w-[160px]"
        >
          <option value="all">{isKh ? 'គ្រប់ប្រភេទ' : 'All Categories'}</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>{getCategoryDisplayName(cat, lang)}</option>
          ))}
        </select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={() => { setSearchTerm(''); setBuyerFilter('all'); setCategoryFilter('all'); }}
            className="px-4 py-3 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800 transition-all shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            {isKh ? 'សម្អាត' : 'Clear'}
          </button>
        )}
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(6)].map((_, i) => (<div key={i} className="h-12 bg-slate-50 dark:bg-slate-950 rounded-lg animate-pulse" />))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-20">🧾</div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {hasActiveFilters
                ? (isKh ? 'មិនមានវិក្កយបត្រត្រូវគ្នានឹងការស្វែងរកទេ។' : 'No invoices match your filters.')
                : (isKh ? 'មិនទាន់មានវិក្កយបត្រនៅឡើយទេ។' : 'No invoices yet.')}
            </p>
            {!hasActiveFilters && (
              <Link to="/sell" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm cursor-pointer">
                {t('dashboard.newSale')}
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 px-5 py-3">{t('invoices.table.invoiceNum')}</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 px-5 py-3">{t('invoices.table.date')}</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 px-5 py-3">{t('invoices.table.buyer')}</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 px-5 py-3">{isKh ? 'ប្រភេទ' : 'Type'}</th>
                  <th className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 px-5 py-3">{isKh ? 'ទំនិញ' : 'Items'}</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 px-5 py-3">{t('invoices.table.total')}</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 px-5 py-3">{t('invoices.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-200 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    {/* Invoice # */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-mono font-bold text-teal-600 dark:text-teal-400">{formatInvNumber(invoice.id)}</span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{formatDate(invoice.created_at)}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatTime(invoice.created_at)}</p>
                      </div>
                    </td>

                    {/* Buyer */}
                    <td className="px-5 py-4">
                      {invoice.buyer ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/50 flex items-center justify-center text-xs font-bold text-cyan-600 dark:text-cyan-400">
                            {invoice.buyer.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{invoice.buyer.name}</p>
                            {invoice.buyer.phone && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500">{invoice.buyer.phone}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 dark:text-slate-500 italic flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          </div>
                          {t('sell.walkIn')}
                        </span>
                      )}
                    </td>

                    {/* Buyer Type */}
                    <td className="px-5 py-4">
                      {invoice.buyer ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 border border-cyan-200/50 dark:border-cyan-900/40">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                          {isKh ? 'ភ្ញៀវស្គាល់' : 'Known'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {isKh ? 'ភ្ញៀវទូទៅ' : 'Walk-in'}
                        </span>
                      )}
                    </td>

                    {/* Items Count */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 border border-teal-200/50 dark:border-teal-900/50">
                        {invoice.invoice_items_count || 0}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(invoice.total_amount)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/invoice/${invoice.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-500 shadow-sm transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {t('invoices.view')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
