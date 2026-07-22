import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';

export default function Catalogue({ books, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const { data, setData, post, put, processing, reset } = useForm({
        id: '', title: '', author: '', isbn_no: '', publisher: '', qty: 1, price: ''
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(route('admin.library.catalogue.index'), { search: searchTerm }, { preserveState: true, preserveScroll: true });
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const openAddModal = () => {
        reset(); setEditMode(false); setShowModal(true);
    };

    const openEditModal = (book) => {
        setData({
            id: book.id, title: book.title, author: book.author || '',
            isbn_no: book.isbn_no || '', publisher: book.publisher || '',
            qty: book.qty, price: book.price || ''
        });
        setEditMode(true); setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const routeName = editMode ? route('admin.library.catalogue.update', data.id) : route('admin.library.catalogue.store');

        if (editMode) {
            put(routeName, { onSuccess: () => { setShowModal(false); reset(); } });
        } else {
            post(routeName, { onSuccess: () => { setShowModal(false); reset(); } });
        }
    };

    const confirmDelete = () => {
        router.delete(route('admin.library.catalogue.destroy', itemToDelete.id), {
            onSuccess: () => setItemToDelete(null),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Library Catalogue</h2>}>
            <Head title="Library Catalogue" />
            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-lg font-bold text-gray-800">Book Collection</h3>
                        <div className="flex gap-3 w-full md:w-auto">
                            <input type="text" placeholder="Search book, author, ISBN..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 rounded-lg border-gray-300 shadow-sm text-sm" />
                            <button onClick={openAddModal} className="bg-indigo-600 whitespace-nowrap text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-indigo-700">
                                + Add Book
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                                    <th className="p-4 font-semibold">Book Title & Author</th>
                                    <th className="p-4 font-semibold">ISBN & Publisher</th>
                                    <th className="p-4 font-semibold text-center">Stock Info</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {books.data.map((book) => (
                                    <tr key={book.id} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{book.title}</div>
                                            <div className="text-xs text-gray-500">{book.author || 'Unknown Author'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-mono text-indigo-600">{book.isbn_no || '--'}</div>
                                            <div className="text-xs text-gray-500">{book.publisher || '--'}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="text-xs text-gray-600 mb-1">Total: {book.qty}</div>
                                            <span className={`text-xs px-2 py-1 rounded-md font-bold ${book.available > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                Available: {book.available}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => openEditModal(book)} className="text-blue-600 font-bold text-sm mr-3">Edit</button>
                                            <button onClick={() => setItemToDelete(book)} className="text-rose-500 font-bold text-sm">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{editMode ? 'Edit Book' : 'Add New Book'}</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Book Title *</label>
                                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Author</label>
                                    <input type="text" value={data.author} onChange={e => setData('author', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ISBN Number</label>
                                    <input type="text" value={data.isbn_no} onChange={e => setData('isbn_no', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Publisher</label>
                                    <input type="text" value={data.publisher} onChange={e => setData('publisher', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                                    <input type="number" min="1" value={data.qty} onChange={e => setData('qty', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" required />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-bold">Cancel</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">
                                    {editMode ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {itemToDelete && <ConfirmDeleteModal item={{ name: itemToDelete.title }} onCancel={() => setItemToDelete(null)} onConfirm={confirmDelete} />}
        </AuthenticatedLayout>
    );
}
