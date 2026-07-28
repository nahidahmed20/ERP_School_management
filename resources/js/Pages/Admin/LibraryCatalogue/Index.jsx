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

  const { data, setData, post, put, processing, reset } = useForm({
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

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Campus Life &gt; Library</span>
            <h1>Book Catalogue</h1>
            <p className="desc">বইয়ের সংগ্রহ, স্টক এবং প্রকাশনার তথ্য পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={openAddModal}>
              <Icon name="plus" /> Add Book
            </button>
          </div>
        </div>
      }
    >
      <Head title="Library Catalogue" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>

          <div className="search">
            <Icon name="search" />
            <input
              placeholder="Search title, author, ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Book & Author</th>
                <th>ISBN & Publisher</th>
                <th>Stock</th>
                <th>Price</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.data.length === 0 && (
                <tr><td colSpan={5} className="mm-empty">কোনো বই খুঁজে পাওয়া যায়নি।</td></tr>
              )}
              {books.data.map((book) => (
                <tr key={book.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="book-open" className="mm-row-icon" />
                      <div>
                        <div style={{ fontWeight: 500, color: '#111827' }}>{book.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{book.author || 'Unknown Author'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#166534' }}>{book.isbn_no || '--'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{book.publisher || '--'}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '4px' }}>Total: {book.qty}</div>
                    <span style={{
                      backgroundColor: book.available > 0 ? '#dcfce7' : '#fee2e2',
                      color: book.available > 0 ? '#15803d' : '#b91c1c',
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                    }}>
                      Available: {book.available}
                    </span>
                  </td>
                  <td><strong style={{ color: '#374151' }}>৳ {book.price ?? '--'}</strong></td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="Edit" onClick={() => openEditModal(book)}>
                        <Icon name="edit" />
                      </button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeletingItem(book)}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={books} />
      </div>

      {/* Add / Edit Modal (Smooth Animation Included) */}
      <div 
        className={`fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all duration-300 ease-in-out ${
          formOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div 
          className={`bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden transform transition-all duration-300 ease-in-out ${
            formOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
        >
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Icon name="book" className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">
                  {editMode ? 'Edit Book' : 'Add New Book'}
                </h3>
                <p className="text-emerald-100 text-xs">
                  {editMode ? 'বইয়ের তথ্য হালনাগাদ করুন' : 'ক্যাটালগে নতুন বই যুক্ত করুন'}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setFormOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <Icon name="cross" />
            </button>
          </div>

          <form onSubmit={submit} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Book Title *</label>
              <input
                type="text" 
                value={data.title} 
                onChange={e => setData('title', e.target.value)}
                placeholder="Enter book title (e.g. The Great Gatsby)"
                className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Author</label>
                <input
                  type="text" 
                  value={data.author} 
                  onChange={e => setData('author', e.target.value)}
                  placeholder="Enter author name"
                  className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">ISBN Number</label>
                <input
                  type="text" 
                  value={data.isbn_no} 
                  onChange={e => setData('isbn_no', e.target.value)}
                  placeholder="e.g. 978-x-xx-xxxxxx-x"
                  className="w-full rounded-lg border-gray-300 font-mono focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Publisher</label>
                <input
                  type="text" 
                  value={data.publisher} 
                  onChange={e => setData('publisher', e.target.value)}
                  placeholder="Enter publisher"
                  className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Quantity *</label>
                <input
                  type="number" 
                  min="1" 
                  value={data.qty} 
                  onChange={e => setData('qty', e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Price (৳)</label>
                <input
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={data.price} 
                  onChange={e => setData('price', e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button" 
                onClick={() => setFormOpen(false)}
                className="px-5 py-2.5 rounded-lg text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit" 
                disabled={processing}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/30 hover:shadow-xl transition-all disabled:opacity-60"
              >
                {editMode ? 'Update Book' : 'Save Book'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {deletingItem && (
        <ConfirmDeleteModal
          item={{ name: deletingItem.title }}
          onCancel={() => setDeletingItem(null)}
          onConfirm={confirmDelete}
        />
      )}
    </AuthenticatedLayout>
  );
}