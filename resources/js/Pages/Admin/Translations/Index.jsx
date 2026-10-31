import { useEffect, useMemo, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';
import { translations } from '@/localization/catalog';

const hasBangla = (value) => /[\u0980-\u09FF]/u.test(value);

export default function Index({ overrides = [] }) {
  const { flash = {} } = usePage().props;
  const [search, setSearch] = useState('');
  const [perPage, setPerPage] = useState('25');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const form = useForm({ source_key: '', english_text: '', bangla_text: '' });

  const overrideMap = useMemo(() => Object.fromEntries(overrides.map((item) => [item.source_key, item])), [overrides]);
  const rows = useMemo(() => {
    const catalogRows = Object.entries(translations.bn)
      .filter(([source]) => !hasBangla(source))
      .map(([source, bangla]) => {
        const override = overrideMap[source];
        return {
          id: override?.id ?? null,
          source_key: source,
          english_text: override?.english_text ?? source,
          bangla_text: override?.bangla_text ?? bangla,
          isOverride: Boolean(override),
        };
      });
    const extraRows = overrides
      .filter((item) => !Object.hasOwn(translations.bn, item.source_key))
      .map((item) => ({ ...item, isOverride: true }));
    return [...catalogRows, ...extraRows].sort((a, b) => a.source_key.localeCompare(b.source_key));
  }, [overrideMap, overrides]);
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return rows;
    return rows.filter((item) => [item.source_key, item.english_text, item.bangla_text]
      .some((text) => text.toLocaleLowerCase().includes(term)));
  }, [rows, search]);
  const pageSize = perPage === 'all' ? Math.max(filtered.length, 1) : Number(perPage);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const shown = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
  }, [flash]);

  useEffect(() => setPage(1), [search, perPage]);

  function openEditor(item = null) {
    setEditing(item);
    setEditorOpen(true);
    form.clearErrors();
    form.setData({
      source_key: item?.source_key ?? '',
      english_text: item?.english_text ?? '',
      bangla_text: item?.bangla_text ?? '',
    });
  }

  function save(event) {
    event.preventDefault();
    const options = { preserveScroll: true, onSuccess: () => setEditorOpen(false) };
    if (editing?.id) router.put(route('admin.translations.update', editing.id), form.data, options);
    else router.post(route('admin.translations.store'), form.data, options);
  }

  async function remove(item) {
    if (!item.id) return;
    const result = await Swal.fire({
      title: 'Reset this translation?',
      text: 'The built-in English and Bangla text will be restored.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Reset translation',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4f46e5',
    });
    if (result.isConfirmed) router.delete(route('admin.translations.destroy', item.id), { preserveScroll: true });
  }

  return (
    <AuthenticatedLayout>
      <Head title="Language & Translations" />
      <div className="w-full space-y-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Settings &amp; Registry</span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Language &amp; Translations</h1>
            <p className="mt-1 text-sm text-slate-500">Edit the English and Bangla text used across the project.</p>
          </div>
          <button onClick={() => openEditor()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-95 sm:w-auto sm:shrink-0">
            <Icon name="plus" className="h-4 w-4" /> Add Translation
          </button>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:w-auto">
            <select value={perPage} onChange={(event) => setPerPage(event.target.value)} className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center font-mono text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 sm:w-auto">
              <option value="10">10 / Page</option>
              <option value="25">25 / Page</option>
              <option value="50">50 / Page</option>
              <option value="100">100 / Page</option>
              <option value="all">All</option>
            </select>
            <div className="hidden h-6 w-px bg-slate-200 sm:block" />
            <div className="relative w-full min-w-0 sm:w-80 sm:flex-1 xl:flex-none">
              <Icon name="search" className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search English or Bangla text..." className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm text-slate-500 xl:justify-end">
            <span>{filtered.length.toLocaleString()} phrases</span>
            <span className="hidden h-5 w-px bg-slate-200 sm:block" />
            <span>Page {page} of {pageCount}</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead><tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">English</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Bangla</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Source phrase</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {shown.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-14 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-slate-100 bg-slate-50"><Icon name="search" className="h-6 w-6 text-slate-300" /></div>
                    <p className="text-sm font-semibold text-slate-600">No translations found</p>
                    <p className="mt-1 text-xs text-slate-400">Try another search or add a new translation.</p>
                  </td></tr>
                ) : shown.map((item) => (
                  <tr key={item.source_key} className="transition-colors hover:bg-slate-50/70">
                    <td className="max-w-sm px-5 py-4 text-sm font-medium text-slate-800">{item.english_text}</td>
                    <td lang="bn" className="max-w-sm px-5 py-4 text-sm text-slate-800">{item.bangla_text}</td>
                    <td className="max-w-sm px-5 py-4 text-xs text-slate-500">{item.source_key}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <button type="button" onClick={() => openEditor(item)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600" title="Edit translation" aria-label="Edit translation"><Icon name="edit" className="h-4 w-4" /></button>
                      {item.isOverride && <button type="button" onClick={() => remove(item)} className="ml-1 rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600" title="Reset translation" aria-label="Reset translation"><Icon name="refresh" className="h-4 w-4" /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 bg-white px-5 py-3">
            <span className="text-xs text-slate-500">Showing {filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} of {filtered.length.toLocaleString()}</span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
              <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      </div>

      {editorOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditorOpen(false); }}>
        <form onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="translation-form-title" className="w-full max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div><span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Language &amp; Translations</span><h2 id="translation-form-title" className="mt-1 text-xl font-bold text-slate-900">{editing ? 'Edit Translation' : 'Add Translation'}</h2><p className="mt-1 text-sm text-slate-500">The source phrase links this translation to text in the app.</p></div>
            <button type="button" onClick={() => setEditorOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close dialog"><Icon name="x" className="h-5 w-5" /></button>
          </div>
          <label className="block text-sm font-semibold text-slate-700">Source phrase
            <input required maxLength="500" value={form.data.source_key} onChange={(event) => form.setData('source_key', event.target.value)} readOnly={Boolean(editing)} className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-normal text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 read-only:bg-slate-100" />
            {form.errors.source_key && <span className="mt-1 block text-xs font-normal text-rose-600">{form.errors.source_key}</span>}
          </label>
          <label className="block text-sm font-semibold text-slate-700">English text
            <textarea required maxLength="2000" rows="2" value={form.data.english_text} onChange={(event) => form.setData('english_text', event.target.value)} className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-normal text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" />
            {form.errors.english_text && <span className="mt-1 block text-xs font-normal text-rose-600">{form.errors.english_text}</span>}
          </label>
          <label className="block text-sm font-semibold text-slate-700">Bangla text
            <textarea required maxLength="2000" rows="2" lang="bn" value={form.data.bangla_text} onChange={(event) => form.setData('bangla_text', event.target.value)} className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-normal text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" />
            {form.errors.bangla_text && <span className="mt-1 block text-xs font-normal text-rose-600">{form.errors.bangla_text}</span>}
          </label>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={() => setEditorOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">Cancel</button><button type="submit" disabled={form.processing} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{form.processing && <Icon name="refresh" className="h-4 w-4 animate-spin" />}{form.processing ? 'Saving...' : 'Save Translation'}</button></div>
        </form>
      </div>}
    </AuthenticatedLayout>
  );
}
