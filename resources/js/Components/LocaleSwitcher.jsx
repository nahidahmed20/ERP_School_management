import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';

export default function LocaleSwitcher({ className = '' }) {
  const { locale = 'en' } = usePage().props;
  const [processing, setProcessing] = useState(false);
  const isBangla = locale === 'bn';

  function changeLocale(event) {
    const nextLocale = event.target.value;
    if (nextLocale === locale || processing) return;
    setProcessing(true);
    document.documentElement.lang = nextLocale;
    window.dispatchEvent(new CustomEvent('app:locale-changed', { detail: { locale: nextLocale } }));

    const restoreLocale = () => {
      document.documentElement.lang = locale;
      window.dispatchEvent(new CustomEvent('app:locale-changed', { detail: { locale } }));
    };

    router.post(route('locale.update'), { locale: nextLocale }, {
      preserveScroll: true,
      onFinish: () => setProcessing(false),
      onError: restoreLocale,
      onHttpException: restoreLocale,
      onNetworkError: restoreLocale,
    });
  }

  return (
    <label className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="sr-only">{isBangla ? 'ভাষা' : 'Language'}</span>
      <select aria-label={isBangla ? 'ভাষা' : 'Language'} value={locale} onChange={changeLocale} disabled={processing}
        className="locale-switcher-select rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60">
        <option value="en">{isBangla ? 'ইংরেজি' : 'English'}</option>
        <option value="bn">{isBangla ? 'বাংলা' : 'Bangla'}</option>
      </select>
    </label>
  );
}
