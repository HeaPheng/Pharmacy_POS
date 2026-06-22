import { useTranslation, formatCurrency, getCategoryDisplayName } from '../i18n/translations';

const API_BASE = (() => {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    const hostname = window.location.hostname;
    return `http://${hostname}:8000`;
  }
  return import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
})();

export default function ItemCard({ item, onView, onEdit, onDelete, isDeleting }) {
  const { t, lang } = useTranslation();
  const totalPcs = (item.boxes_quantity || 0) * (item.pieces_per_box || 0);
  const isLowStock = item.boxes_quantity <= 5;

  const ageGroupCats = item.categories?.filter((cat) => cat.type === 'age_group') || [];
  const formulationCats = item.categories?.filter((cat) => cat.type === 'formulation') || [];
  const therapeuticCats = item.categories?.filter((cat) => cat.type === 'therapeutic') || [];

  return (
    <div
      onClick={() => onView(item)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-100/50 dark:hover:shadow-none hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-950 overflow-hidden shrink-0">
        {item.image_path ? (
          <img
            src={`${API_BASE}/storage/${item.image_path}`}
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

        {/* Dosage Form Badge (Top-Right) - Fades out on hover to show action buttons */}
        {formulationCats.length > 0 && (
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

        {/* Floating Edit/Delete Actions (Hidden by default, slide/fade in on hover) */}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5 z-20 opacity-0 scale-90 translate-y-[-4px] group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
            className="w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-350 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={t('common.edit')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
            disabled={isDeleting}
            className="w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-350 hover:text-rose-500 dark:hover:text-rose-450 hover:bg-slate-50 dark:hover:bg-slate-850 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            title={t('common.delete')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
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
              <span className="text-xs font-black text-slate-700 dark:text-slate-200 mt-0.5">{totalPcs}</span>
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
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 ${
              isLowStock
                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500 border border-rose-100/50 dark:border-rose-900/30'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLowStock ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
              {isLowStock ? t('dashboard.lowStock') : t('sell.inStock')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
