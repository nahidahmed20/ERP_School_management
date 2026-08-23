import { useState, useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Catalogue({ books, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters?.search ?? '');
  const [perPage, setPerPage] = useState(filters?.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  const { data, setData, post, put, processing, reset, errors } = useForm({
    id: '', title: '', author: '', isbn_no: '', publisher: '', qty: 1, price: '',
  });

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.library.catalogue.index'), {
      search, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  const openAddModal = () => {
    reset(); setEditMode(false); setFormOpen(true);
  };

  const openEditModal = (book) => {
    setData({
      id: book.id, title: book.title, author: book.author || '',
      isbn_no: book.isbn_no || '', publisher: book.publisher || '',
      qty: book.qty, price: book.price || '',
    });
    setEditMode(true); setFormOpen(true);
  };

  const submit = (e) => {
    e.preventDefault();
    const routeName = editMode
      ? route('admin.library.catalogue.update', data.id)
      : route('admin.library.catalogue.store');

    if (editMode) {
      put(routeName, { onSuccess: () => { setFormOpen(false); reset(); } });
    } else {
      post(routeName, { onSuccess: () => { setFormOpen(false); reset(); } });
    }
  };

  const confirmDelete = () => {
    router.delete(route('admin.library.catalogue.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  };

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!books.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Title', 'Author', 'ISBN No', 'Publisher', 'Total Qty', 'Available', 'Price'];
    const rows = books.data.map(item => [
      item.title || 'N/A',
      item.author || 'N/A',
      item.isbn_no || 'N/A',
      item.publisher || 'N/A',
      item.qty || '0',
      item.available || '0',
      item.price || '0'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Library_Catalogue_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!books.data.length) return;
    let text = "Title\tAuthor\tISBN\tPublisher\tQty\tAvailable\tPrice\n";
    books.data.forEach(item => {
      text += `${item.title}\t${item.author || '-'}\t${item.isbn_no || '-'}\t${item.publisher || '-'}\t${item.qty}\t${item.available}\t${item.price || '-'}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <AuthenticatedLayout>
      <Head title="Library Catalogue" />

      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, aside, header, .no-print, button, a, select, input { display: none !important; }
          body, html { background: #f8fafc !important; }
          .print-table-wrapper { width: 100% !important; border: none !important; box-shadow: none !important; }
          .print-title { display: block !important; font-size: 24px !important; font-weight: bold !important; margin-bottom: 20px !important; }
        }
        @media screen { .print-title { display: none; } }
      `}} />

      <div className="print-title">Library Catalogue Directory - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Campus Life &gt; Library</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Book Catalogue</h1>
            <p className="text-sm text-slate-500 mt-1">বইয়ের সংগ্রহ, স্টক এবং প্রকাশনার তথ্য পরিচালনা করুন।</p>
          </div>
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <Icon name="plus" className="w-4 h-4" /> Add Book
          </button>
        </div>

        {/* Unified Modern Toolbar */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">

            {/* Per Page */}
            <select
              value={perPage}
              onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}
              className="appearance-none bg-none pr-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-center font-mono"
              style={{ backgroundImage: 'none' }}
            >
              <option value="10">10 / Page</option>
              <option value="20">20 / Page</option>
              <option value="50">50 / Page</option>
              <option value="all">All</option>
            </select>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search title, author, ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={() => applyFilters()}
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Search
            </button>
          </div>

          {/* Export Actions */}
          <div className="flex items-center justify-end gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl w-full xl:w-auto shadow-sm shrink-0 ml-auto">
            <button onClick={copyToClipboard} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Copy to Clipboard">
              Copy
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={exportToCSV} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export CSV">
              CSV
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend Excel plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export Excel">
              Excel
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend PDF plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export PDF">
              PDF
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Print List">
              Print
            </button>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 print-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Book &amp; Author</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ISBN &amp; Publisher</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Stock</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Price</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <Icon name="book-open" className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">কোনো বই খুঁজে পাওয়া যায়নি</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting filters or add a new book</p>
                    </td>
                  </tr>
                ) : (
                  books.data.map((book) => (
                    <tr key={book.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                            <Icon name="book-open" className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-900 block">{book.title}</span>
                            <span className="text-xs text-slate-500 font-medium block mt-0.5">{book.author || 'Unknown Author'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 block w-max">{book.isbn_no || '—'}</span>
                        <span className="text-xs text-slate-500 font-medium block mt-1">{book.publisher || '—'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs text-slate-500 block mb-1 font-medium">Total: {book.qty}</span>
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border ${book.available > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          Available: {book.available}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-slate-800 font-mono">
                          ৳ {book.price ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEditModal(book)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Book">
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeletingItem(book)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Book">
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="no-print border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
            <Pagination meta={books} />
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setFormOpen(false)}>
          <div
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{editMode ? 'Edit Book' : 'Add New Book'}</h3>
                <p className="text-sm text-slate-500 mt-1">{editMode ? 'বইয়ের তথ্য হালনাগাদ করুন' : 'ক্যাটালগে নতুন বই যুক্ত করুন'}</p>
              </div>
              <button onClick={() => setFormOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body (Scrollable) */}
            <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

                <div>
                  <label className={labelClass}>Book Title <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={e => setData('title', e.target.value)}
                    placeholder="Enter book title (e.g. The Great Gatsby)"
                    className={inputClass}
                    required
                    autoFocus
                  />
                  {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Author</label>
                    <input
                      type="text"
                      value={data.author}
                      onChange={e => setData('author', e.target.value)}
                      placeholder="Enter author name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>ISBN Number</label>
                    <input
                      type="text"
                      value={data.isbn_no}
                      onChange={e => setData('isbn_no', e.target.value)}
                      placeholder="e.g. 978-x-xx-xxxxxx-x"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="sm:col-span-1">
                    <label className={labelClass}>Publisher</label>
                    <input
                      type="text"
                      value={data.publisher}
                      onChange={e => setData('publisher', e.target.value)}
                      placeholder="Enter publisher"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Quantity <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      min="1"
                      value={data.qty}
                      onChange={e => setData('qty', e.target.value)}
                      placeholder="0"
                      className={`${inputClass} font-mono font-bold text-slate-800`}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Price (৳)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={data.price}
                      onChange={e => setData('price', e.target.value)}
                      placeholder="0.00"
                      className={`${inputClass} font-mono font-bold text-emerald-600`}
                    />
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
                <button type="button" onClick={() => setFormOpen(false)} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
                  Cancel
                </button>
                <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
                  <Icon name="save" className="w-4 h-4" />
                  {processing ? 'Saving...' : (editMode ? 'Update Book' : 'Save Book')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingItem && (
        <ConfirmDeleteModal
          item={{ name: deletingItem.title }}
          onCancel={() => setDeletingItem(null)}
          onConfirm={confirmDelete}
          title="Delete Book"
          message="আপনি কি নিশ্চিত যে এই বই বুক ক্যাটালগ থেকে মুছে ফেলতে চান?"
        />
      )}
    </AuthenticatedLayout>
  );
}
