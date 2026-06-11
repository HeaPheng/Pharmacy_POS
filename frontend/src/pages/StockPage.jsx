import { useState } from 'react';
import { useItems, useCreateItem, useUpdateItem, useDeleteItem, useCategories } from '../hooks/useApi';
import { useTranslation } from '../i18n/translations';
import ItemForm from '../components/ItemForm';
import ItemCard from '../components/ItemCard';
import CategoryManagerModal from '../components/CategoryManagerModal';

export default function StockPage() {
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const { t } = useTranslation();

  const { data: items = [], isLoading, isError } = useItems({});
  const { data: categories = [] } = useCategories();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const handleSubmit = async (formData) => {
    try {
      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, formData });
      } else {
        await createItem.mutateAsync(formData);
      }
      setEditingItem(null);
      setIsAddingStock(false);
    } catch (err) {
      console.error('Failed to save item:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('kh' === t('common.save') ? 'តើអ្នកពិតជាចង់លុបផលិតផលនេះមែនទេ?' : 'Are you sure you want to delete this item?'))) return;
    setDeletingId(id);
    try {
      await deleteItem.mutateAsync(id);
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (item) => {
    setIsAddingStock(false);
    setEditingItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectExistingItem = (item) => {
    setIsAddingStock(true);
    setEditingItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter items by search query and category (client-side for responsiveness)
  const filteredItems = items.filter((item) => {
    const matchesSearch = !searchQuery ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categories?.some((cat) => cat.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.provider?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory ||
      item.categories?.some((cat) => cat.id === parseInt(selectedCategory));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            {t('stock.title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('stock.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-800 dark:text-slate-100">{items.length}</span> {t('dashboard.totalProducts')}
            </span>
          </div>
        </div>
      </div>

      {/* Add / Edit Item Form */}
      <ItemForm
        editingItem={editingItem}
        onSubmit={handleSubmit}
        onCancel={() => {
          setEditingItem(null);
          setIsAddingStock(false);
        }}
        isPending={createItem.isPending || updateItem.isPending}
        onSelectExistingItem={handleSelectExistingItem}
        isAddingStock={isAddingStock}
      />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950">
            {t('stock.table.item')}
          </span>
        </div>
      </div>

      {/* Search Bar & Actions */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('stock.searchPlaceholder')}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-755 dark:text-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm cursor-pointer"
          >
            <option value="">{t('sell.categoryFilterAll')} ({items.length})</option>
            {categories.map((cat) => {
              const count = items.filter((item) =>
                item.categories?.some((c) => c.id === cat.id)
              ).length;
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({count})
                </option>
              );
            })}
          </select>
        </div>

        <button
          onClick={() => setShowCategoryManager(true)}
          className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-650 dark:text-slate-300 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shrink-0"
        >
          <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {t('stock.manageCategories')}
        </button>
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-60 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm text-rose-500 font-medium">{t('dashboard.failedLoad')}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4 opacity-30">📦</div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {searchQuery ? t('sell.emptyCart').replace(/Cart|កន្ត្រក/, '') : t('sell.emptyCart').replace(/Cart|កន្ត្រក/, '')}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {searchQuery ? t('common.search') : t('stock.form.imageUploadHint')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deletingId === item.id}
            />
          ))}
        </div>
      )}

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        items={items}
      />
    </div>
  );
}
