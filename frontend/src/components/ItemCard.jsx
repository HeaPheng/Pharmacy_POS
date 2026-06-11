import { useTranslation, formatCurrency } from '../i18n/translations';

const API_BASE = (() => {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    const hostname = window.location.hostname;
    return `http://${hostname}:8000`;
  }
  return import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
})();

export default function ItemCard({ item, onEdit, onDelete, isDeleting }) {
  const { t } = useTranslation();
  const totalPcs = (item.boxes_quantity || 0) * (item.pieces_per_box || 0);
  const isLowStock = item.boxes_quantity <= 5;

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-950 overflow-hidden">
        {item.image_path ? (
          <img
            src={`${API_BASE}/storage/${item.image_path}`}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Stock Badge */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm ${
            isLowStock
              ? 'bg-rose-500/90 text-white'
              : 'bg-emerald-500/90 text-white'
          }`}>
            <span className="w-1 h-1 rounded-full bg-white" />
            {isLowStock ? t('dashboard.lowStock') : t('sell.inStock')}
          </span>
        </div>
        {/* Category Badges */}
        {item.categories && item.categories.length > 0 && (
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 max-w-[80%]">
            {item.categories.map((cat) => (
              <span
                key={cat.id}
                className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 backdrop-blur-sm"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
            {item.code && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 font-mono font-bold shrink-0">
                {item.code}
              </span>
            )}
            <span className="truncate">{item.name}</span>
          </h3>
          {item.provider && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
              {item.provider.name}
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-2 text-[10px]">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 dark:text-slate-500">{t('stock.table.boxes')}:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{item.boxes_quantity}</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 dark:text-slate-500">{t('stock.table.totalPcs')}:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{totalPcs}</span>
          </div>
        </div>

        {/* Price + Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(item.unit_price)}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t('common.edit')}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(item.id)}
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              title={t('common.delete')}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
