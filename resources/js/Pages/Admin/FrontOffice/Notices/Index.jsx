import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';

export default function Notices({ notices, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const { data, setData, post, processing, reset, errors } = useForm({
        id: '', title: '', type: 'General', notice_date: new Date().toISOString().split('T')[0],
        description: '', attachment: null, _method: 'POST'
    });

    // Search functionality
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(route('admin.frontoffice.notices.index'), { search: searchTerm }, { preserveState: true, preserveScroll: true });
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const openAddModal = () => {
        reset();
        setData('_method', 'POST');
        setEditMode(false);
        setShowModal(true);
    };

    const openEditModal = (notice) => {
        setData({
            id: notice.id, title: notice.title, type: notice.type,
            notice_date: notice.notice_date, description: notice.description || '',
            attachment: null, // নতুন ফাইল না দিলে আগেরটাই থাকবে
            _method: 'PUT' // লারাভেলে ফাইলসহ আপডেটের জন্য ট্রিক
        });
        setEditMode(true);
        setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const routeName = editMode ? route('admin.frontoffice.notices.update', data.id) : route('admin.frontoffice.notices.store');

        post(routeName, {
            onSuccess: () => { setShowModal(false); reset(); },
        });
    };

    const confirmDelete = () => {
        router.delete(route('admin.frontoffice.notices.destroy', itemToDelete.id), {
            onSuccess: () => setItemToDelete(null),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Notice Board</h2>}>
            <Head title="Notices" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                    {/* Header & Search */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-lg font-bold text-gray-800">All Notices</h3>
                        <div className="flex gap-3 w-full md:w-auto">
                            <input type="text" placeholder="Search notices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 rounded-lg border-gray-300 shadow-sm text-sm" />
                            <button onClick={openAddModal} className="bg-indigo-600 whitespace-nowrap text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-indigo-700">
                                + Add Notice
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                                    <th className="p-4 font-semibold">Date & Type</th>
                                    <th className="p-4 font-semibold">Title</th>
                                    <th className="p-4 font-semibold">Attachment</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {notices.data.map((notice) => (
                                    <tr key={notice.id} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-gray-800">{notice.notice_date}</div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${notice.type === 'Exam' ? 'bg-red-100 text-red-600' : notice.type === 'Holiday' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {notice.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-700 font-medium">{notice.title}</td>
                                        <td className="p-4">
                                            {notice.attachment ? (
                                                <a href={`/storage/${notice.attachment}`} target="_blank" className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200">📎 View File</a>
                                            ) : <span className="text-xs text-gray-400">No File</span>}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => openEditModal(notice)} className="text-indigo-600 hover:text-indigo-900 font-bold text-sm mr-4">Edit</button>
                                            <button onClick={() => setItemToDelete(notice)} className="text-rose-500 hover:text-rose-700 font-bold text-sm">Delete</button>
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
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{editMode ? 'Edit Notice' : 'Add New Notice'}</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Notice Title *</label>
                                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Notice Type *</label>
                                    <select value={data.type} onChange={e => setData('type', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" required>
                                        <option value="General">General</option>
                                        <option value="Exam">Exam</option>
                                        <option value="Holiday">Holiday</option>
                                        <option value="Event">Event</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date *</label>
                                    <input type="date" value={data.notice_date} onChange={e => setData('notice_date', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows="3" className="mt-1 w-full rounded-lg border-gray-300"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Attachment (PDF/Image)</label>
                                <input type="file" onChange={e => setData('attachment', e.target.files[0])} className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-bold">Cancel</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">
                                    {editMode ? 'Update Notice' : 'Save Notice'}
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
