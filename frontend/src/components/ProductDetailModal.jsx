import { useTranslation, formatCurrency, getCategoryDisplayName } from '../i18n/translations';

const API_BASE = (() => {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    const hostname = window.location.hostname;
    return `http://${hostname}:8000`;
  }
  return import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
})();

const getCategoryBadgeClass = (type) => {
  switch (type) {
    case 'age_group':
      return 'bg-blue-600 text-white border border-blue-500 dark:bg-blue-600 dark:text-white dark:border-blue-500 shadow-md font-extrabold uppercase tracking-wider text-[9.5px] px-2.5 py-0.5';
    case 'formulation':
      return 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5';
    case 'therapeutic':
    default:
      return 'bg-teal-50 text-teal-600 border border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5';
  }
};

export default function ProductDetailModal({ item, isOpen, onClose }) {
  const { t, lang } = useTranslation();

  if (!isOpen || !item) return null;

  const totalPcs = (item.boxes_quantity || 0) * (item.pieces_per_box || 0);
  const isLowStock = item.boxes_quantity <= 5;
  const imageUrl = item.image_path ? `${API_BASE}/storage/${item.image_path}` : null;

  // Split categories for overlay positions
  const ageGroupCats = item.categories?.filter((cat) => cat.type === 'age_group') || [];
  const otherCats = item.categories?.filter((cat) => cat.type !== 'age_group') || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all" />

      {/* Modal Container */}
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl animate-scale-in text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Header */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors shadow-sm cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable Content wrapper */}
        <div className="overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            
            {/* Left side: Image Frame & Badges (2/5 size) */}
            <div className="md:col-span-2 space-y-4">
              <div className="relative aspect-square w-full rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-inner flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 opacity-30 flex flex-col items-center gap-2">
                    <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-semibold">{t('stock.form.image')}</span>
                  </div>
                )}

                {/* Age Group Badges (Top-Left overlay) */}
                {ageGroupCats.length > 0 && (
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    {ageGroupCats.map((cat) => (
                      <span
                        key={cat.id}
                        className={`rounded-full backdrop-blur-sm ${getCategoryBadgeClass(cat.type)}`}
                      >
                        {getCategoryDisplayName(cat.name, lang)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stock Level Status (Top-Right overlay) */}
                <div className="absolute top-3 right-3 z-10">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow ${
                    isLowStock
                      ? 'bg-rose-500/90 text-white'
                      : 'bg-emerald-500/90 text-white'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {isLowStock ? t('dashboard.lowStock') : t('sell.inStock')}
                  </span>
                </div>

                {/* Formulation & Therapeutic Badges (Bottom-Left overlay) */}
                {otherCats.length > 0 && (
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-1 max-w-[85%] z-10">
                    {otherCats.map((cat) => (
                      <span
                        key={cat.id}
                        className={`rounded-full backdrop-blur-sm ${getCategoryBadgeClass(cat.type)}`}
                      >
                        {getCategoryDisplayName(cat.name, lang)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Title, Description, Numbers (3/5 size) */}
            <div className="md:col-span-3 space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                {/* Title and Code */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {item.code && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-bold border border-slate-200/40 dark:border-slate-700/40">
                        {item.code}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('stock.table.item')}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                    {item.name}
                  </h2>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    {t('stock.form.description')}
                  </span>
                  <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-lg p-2.5 text-xs text-slate-700 dark:text-white leading-relaxed max-h-20 overflow-y-auto shadow-inner">
                    {item.description ? (
                      <p className="whitespace-pre-wrap">{item.description}</p>
                    ) : (
                      <p className="text-slate-400 dark:text-slate-500 italic">
                        {lang === 'kh' ? 'គ្មានការពិពណ៌នាទេ' : 'No description provided.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/30 p-1.5 rounded-lg text-center shadow-sm">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                      {t('stock.table.boxes')}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {item.boxes_quantity}
                    </span>
                  </div>
                  <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/30 p-1.5 rounded-lg text-center shadow-sm">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                      {t('stock.table.pcsPerBox')}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {item.pieces_per_box}
                    </span>
                  </div>
                  <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/30 p-1.5 rounded-lg text-center shadow-sm">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                      {t('stock.table.totalPcs')}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {totalPcs}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Provider Box */}
              <div className="space-y-3.5 pt-3.5 border-t border-slate-200 dark:border-slate-800 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {t('stock.table.unitPrice')}
                  </span>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 block leading-tight">
                      {formatCurrency(item.unit_price)} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">/ {t('sell.quantitySelect.box')}</span>
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatCurrency(item.unit_price / (item.pieces_per_box || 1))} / {t('sell.quantitySelect.pcs')}
                    </span>
                  </div>
                </div>

                {item.provider && (
                  <div className="p-2 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-lg space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                      {t('stock.table.provider')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-6.5 h-6.5 rounded-full bg-teal-50 dark:bg-teal-955/40 border border-teal-100 dark:border-teal-900/50 flex items-center justify-center text-[10px] font-bold text-teal-600 dark:text-teal-400">
                        {item.provider.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {item.provider.name}
                        </p>
                        {item.provider.phone && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            📞 {item.provider.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
