import { useParams, Link } from 'react-router-dom';
import { useInvoice } from '../hooks/useApi';
import { useTranslation, formatCurrency } from '../i18n/translations';

const API_BASE = (() => {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    const hostname = window.location.hostname;
    return `http://${hostname}:8000`;
  }
  return import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
})();

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
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function InvoicePage() {
  const { id } = useParams();
  const { data: invoice, isLoading, isError } = useInvoice(id);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {"kh" === t('common.save') ? "កំពុងផ្ទុកវិក្កយបត្រ..." : "Loading invoice..."}
          </p>
        </div>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-4 opacity-30">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {"kh" === t('common.save') ? "រកមិនឃើញវិក្កយបត្រទេ" : "Invoice Not Found"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {"kh" === t('common.save') ? "មិនអាចផ្ទុកវិក្កយបត្រដែលបានស្នើសុំបានទេ។" : "The requested invoice could not be loaded."}
          </p>
          <Link
            to="/sell"
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm cursor-pointer"
          >
            {t('invoice.back')}
          </Link>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const invoiceItems = invoice.invoice_items || [];
  const grandTotal = parseFloat(invoice.total_amount || 0);

  return (
    <>
      {/* Action Bar — hidden on print */}
      <div className="no-print mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Link
            to="/sell"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('invoice.back')}
          </Link>
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('invoice.number')} {formatInvNumber(invoice.id)}</span>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/10 active:scale-[0.98] transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          {t('invoice.print')}
        </button>
      </div>

      {/* Invoice Document */}
      <div
        id="invoice-document"
        className="invoice-document bg-white rounded-2xl shadow-2xl overflow-hidden mx-auto animate-fade-in"
        style={{ maxWidth: '800px' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-700 to-indigo-700 px-8 py-6 flex items-start justify-between">
          {/* Left: Logo + Business Name */}
          <div className="flex items-center gap-4">
            <img
              src="/pharmacy-logo.png"
              alt="PharmSystem Logo"
              className="w-14 h-14 rounded-xl object-contain bg-white/10 p-1"
            />
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">PharmSystem</h1>
              <p className="text-xs text-violet-200/80 font-medium">
                {"kh" === t('common.save') ? "ដៃគូឱសថស្ថានដែលគួរឱ្យទុកចិត្តរបស់អ្នក" : "Your Trusted Pharmacy Partner"}
              </p>
            </div>
          </div>

          {/* Right: Invoice Number + Date */}
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm mb-2">
              <span className="text-xs font-bold text-white/90">{t('invoice.title')}</span>
            </div>
            <p className="text-sm font-bold text-white">{formatInvNumber(invoice.id)}</p>
            <p className="text-xs text-violet-200/70 mt-0.5">{formatDate(invoice.created_at)}</p>
            <p className="text-xs text-violet-200/50">{formatTime(invoice.created_at)}</p>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="px-8 py-5 border-b border-slate-200">
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                {"kh" === t('common.save') ? "ទូទាត់ទៅឱ្យ" : "Billed To"}
              </p>
              {invoice.buyer ? (
                <>
                  <p className="text-sm font-bold text-slate-800">{invoice.buyer.name}</p>
                  {invoice.buyer.phone && (
                    <p className="text-xs text-slate-500 mt-0.5">{invoice.buyer.phone}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500 italic">{t('sell.walkIn')}</p>
              )}
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                {"kh" === t('common.save') ? "ស្ថានភាពទូទាត់" : "Payment Status"}
              </p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {"kh" === t('common.save') ? "បានបញ្ចប់" : "Completed"}
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="px-8 py-6">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 pb-3 pr-4">#</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 pb-3 pr-4">{t('invoice.table.item')}</th>
                <th className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 pb-3 px-2">
                  {"kh" === t('common.save') ? "ប្រអប់" : "Qty (Boxes)"}
                </th>
                <th className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 pb-3 px-2">
                  {"kh" === t('common.save') ? "គ្រាប់" : "Qty (Pcs)"}
                </th>
                <th className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-400 pb-3 px-2">{t('invoice.table.unitPrice')}</th>
                <th className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-400 pb-3 pl-4">{t('invoice.table.subtotal')}</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((lineItem, idx) => (
                <tr key={lineItem.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="py-3 pr-4 text-xs text-slate-400 font-medium">{idx + 1}</td>
                  <td className="py-3 pr-4">
                    <p className="text-sm font-semibold text-slate-800">{lineItem.item?.name || 'Unknown Item'}</p>
                    {lineItem.item?.categories && lineItem.item.categories.length > 0 && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {lineItem.item.categories.map((c) => c.name).join(', ')}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center text-sm text-slate-600 font-medium">{lineItem.quantity_boxes}</td>
                  <td className="py-3 px-2 text-center text-sm text-slate-600 font-medium">{lineItem.quantity_pieces}</td>
                  <td className="py-3 px-2 text-right text-sm text-slate-600 font-medium">
                    {formatCurrency(lineItem.unit_price)}
                  </td>
                  <td className="py-3 pl-4 text-right text-sm font-bold text-slate-800">
                    {formatCurrency(lineItem.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Grand Total */}
          <div className="mt-6 pt-4 border-t-2 border-slate-200">
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>
                    {"kh" === t('common.save') ? "ចំនួនមុខទំនិញ" : "Items Count"}
                  </span>
                  <span className="font-medium text-slate-600">
                    {invoiceItems.length} {"kh" === t('common.save') ? "មុខទំនិញ" : "line items"}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-2 border-t border-slate-100">
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-500">{t('invoice.grandTotal')}</span>
                  <span className="text-2xl font-extrabold text-violet-700">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code + Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-8 py-6">
          <div className="flex flex-col items-center text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{t('invoice.scanToPay')}</p>
            <img
              src="/aba-qr.png"
              alt="ABA Bank QR Code"
              className="w-64 h-auto rounded-xl border border-slate-200 bg-white p-2.5 shadow-md transition-all hover:shadow-lg hover:scale-[1.02] duration-300"
            />
            <p className="text-[10px] text-slate-400 mt-3">
              {"kh" === t('common.save') ? "ស្កេនជាមួយកម្មវិធី ABA Mobile ដើម្បីទូទាត់ប្រាក់" : "Scan with ABA Mobile app to pay"}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">
              {"kh" === t('common.save') ? "សូមអរគុណសម្រាប់ការគាំទ្ររបស់អ្នក!" : "Thank you for your purchase!"}
            </p>
            <p className="text-[10px] text-slate-300 mt-1">
              PharmSystem — {"kh" === t('common.save') ? "ដៃគូឱសថស្ថានដែលគួរឱ្យទុកចិត្តរបស់អ្នក" : "Your Trusted Pharmacy Partner"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
