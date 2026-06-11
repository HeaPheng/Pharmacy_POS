import { useState } from 'react';
import { useCreateProvider } from '../hooks/useApi';
import { useTranslation } from '../i18n/translations';

export default function ProviderModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const createProvider = useCreateProvider();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newProvider = await createProvider.mutateAsync(form);
      setForm({ name: '', phone: '', address: '' });
      onCreated?.(newProvider);
      onClose();
    } catch (err) {
      console.error('Failed to create provider:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {t('providers.addNewProvider')}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {"kh" === t('common.save') ? "ចុះឈ្មោះអ្នកផ្គត់ផ្គង់ឱសថ ឬបរិក្ខារថ្មី។" : "Register a new medicine or equipment supplier."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Provider Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              {t('providers.form.name')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={"kh" === t('common.save') ? "ឧទាហរណ៍៖ MediPharma Co." : "e.g. MediPharma Co."}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              {t('providers.form.phone')}
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder={"kh" === t('common.save') ? "ឧទាហរណ៍៖ +855 12 345 678" : "e.g. +855 12 345 678"}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              {t('providers.form.address')}
            </label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder={"kh" === t('common.save') ? "ឧទាហរណ៍៖ លេខ១២៣ ផ្លូវ៤៥៦ ភ្នំពេញ" : "e.g. #123, St. 456, Phnom Penh"}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={createProvider.isPending}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/10 disabled:opacity-50 transition-all cursor-pointer"
            >
              {createProvider.isPending ? t('providers.form.saving') : t('providers.addNewProvider')}
            </button>
          </div>

          {createProvider.isError && (
            <p className="text-xs text-rose-500 text-center">
              {createProvider.error?.response?.data?.message || ("kh" === t('common.save') ? "ការបង្កើតអ្នកផ្គត់ផ្គង់បានបរាជ័យ។" : "Failed to create provider.")}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
