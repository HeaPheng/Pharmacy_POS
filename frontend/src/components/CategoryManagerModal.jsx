import { useState } from 'react';
import { useCategories, useCreateCategory, useDeleteCategory } from '../hooks/useApi';
import { useTranslation } from '../i18n/translations';

export default function CategoryManagerModal({ isOpen, onClose, items = [] }) {
  const { t } = useTranslation();
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [deletingCategory, setDeletingCategory] = useState(null); // Category object currently checking delete
  const [warningItems, setWarningItems] = useState([]); // Items inside the category to be deleted

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await createCategory.mutateAsync({ name: newCategoryName.trim() });
      setNewCategoryName('');
    } catch (err) {
      console.error('Failed to create category:', err);
    }
  };

  const initiateDelete = (cat) => {
    // Filter items that belong to this category
    const linkedItems = items.filter((item) =>
      item.categories?.some((c) => c.id === cat.id)
    );

    if (linkedItems.length > 0) {
      setDeletingCategory(cat);
      setWarningItems(linkedItems);
    } else {
      // No items linked, double confirm directly using standard prompt or simple warning
      if (window.confirm(t('kh' === t('common.save') ? 'តើអ្នកពិតជាចង់លុបប្រភេទនេះមែនទេ?' : 'Are you sure you want to delete this category?'))) {
        deleteCategory.mutate(cat.id);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    try {
      await deleteCategory.mutateAsync(deletingCategory.id);
      setDeletingCategory(null);
      setWarningItems([]);
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-in text-slate-800 dark:text-slate-100 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 className="text-lg font-bold">
            {deletingCategory ? t('stock.categoryManager.deleteWarningTitle', { name: deletingCategory.name }) : t('stock.categoryManager.title')}
          </h3>
          <button
            onClick={() => {
              if (deletingCategory) {
                setDeletingCategory(null);
                setWarningItems([]);
              } else {
                onClose();
              }
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {deletingCategory ? (
            /* Warning Confirmation View */
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-2">
                  {t('stock.categoryManager.deleteWarningDesc')}
                </p>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2">
                  {warningItems.map((item) => (
                    <div
                      key={item.id}
                      className="text-xs py-1 px-2.5 bg-white dark:bg-slate-950 rounded border border-slate-200/60 dark:border-slate-800 flex justify-between items-center"
                    >
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {item.categories?.length || 0} {t('kh' === t('common.save') ? 'ប្រភេទសរុប' : 'total categories')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-800 dark:text-rose-450 leading-relaxed">
                {t('stock.categoryManager.deleteWarningInfo')}
              </div>
            </div>
          ) : (
            /* Default Category Manager List & Add Form */
            <div className="space-y-4">
              {/* Add Form */}
              <form onSubmit={handleCreate} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={t('stock.categoryManager.addPlaceholder')}
                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                />
                <button
                  type="submit"
                  disabled={createCategory.isPending || !newCategoryName.trim()}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-lg disabled:opacity-50 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                >
                  {createCategory.isPending ? '...' : '+'}
                </button>
              </form>

              {/* List */}
              {isLoading ? (
                <div className="space-y-2 py-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-400 dark:text-slate-500">
                  {t('stock.categoryManager.emptyCategories')}
                </div>
              ) : (
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50 dark:bg-slate-950/40">
                  {categories.map((cat) => {
                    const count = items.filter((item) =>
                      item.categories?.some((c) => c.id === cat.id)
                    ).length;

                    return (
                      <div
                        key={cat.id}
                        className="px-4 py-3 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-850 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        <div>
                          <span className="font-semibold text-sm">{cat.name}</span>
                          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {count} {t('stock.table.item')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => initiateDelete(cat)}
                          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                          title={t('common.delete')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0">
          {deletingCategory ? (
            /* Warnings Confirmer buttons */
            <>
              <button
                type="button"
                onClick={() => {
                  setDeletingCategory(null);
                  setWarningItems([]);
                }}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteCategory.isPending}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-sm shadow-rose-600/10 active:scale-95 transition-all cursor-pointer"
              >
                {deleteCategory.isPending ? '...' : t('stock.categoryManager.confirmDeleteBtn')}
              </button>
            </>
          ) : (
            /* Close button */
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold text-sm rounded-lg transition-colors cursor-pointer"
            >
              {t('sell.successModal.close')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
