import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';

// Lightweight inline icons (no external icon package required)
const Icon = {
    Search: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
        </svg>
    ),
    Plus: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M12 5v14M5 12h14" />
        </svg>
    ),
    Megaphone: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="m3 11 18-5v12L3 14v-3Z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
    ),
    Calendar: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
    ),
    Paperclip: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
    ),
    Pencil: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
    ),
    Trash2: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14ZM10 11v6M14 11v6" />
        </svg>
    ),
    X: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    ),
    Upload: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
        </svg>
    ),
};

const TYPE_STYLES = {
    General: 'bg-blue-50 text-blue-600',
    Exam: 'bg-red-50 text-red-600',
    Holiday: 'bg-emerald-50 text-emerald-600',
    Event: 'bg-purple-50 text-purple-600',
};

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

    const goToPage = (url) => {
        if (!url) return;
        router.get(url, { search: searchTerm }, { preserveState: true, preserveScroll: true });
    };

    const withAttachmentCount = notices.data.filter(n => n.attachment).length;
    const thisMonthCount = notices.data.filter(n => {
        const d = new Date(n.notice_date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Notice Board</h2>}>
            <Head title="Notices" />

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">

                {/* Stat strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                        <div className="h-11 w-11 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <Icon.Megaphone className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 leading-tight">{notices.total ?? notices.data.length}</div>
                            <div className="text-xs text-gray-500 font-medium">Total Notices</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                        <div className="h-11 w-11 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                            <Icon.Calendar className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 leading-tight">{thisMonthCount}</div>
                            <div className="text-xs text-gray-500 font-medium">Posted This Month</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                        <div className="h-11 w-11 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <Icon.Paperclip className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 leading-tight">{withAttachmentCount}</div>
                            <div className="text-xs text-gray-500 font-medium">With Attachment</div>
                        </div>
                    </div>
                </div>

                {/* Main card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 border-b border-gray-100">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">All Notices</h3>
                            <p className="text-sm text-gray-500 mt-0.5">Announcements and circulars shared across the school</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Icon.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search notices..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm text-sm pl-9 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center gap-1.5 bg-indigo-600 whitespace-nowrap text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                            >
                                <Icon.Plus className="h-4 w-4" /> Add Notice
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/70 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                                    <th className="p-4 font-semibold">Date & Type</th>
                                    <th className="p-4 font-semibold">Title</th>
                                    <th className="p-4 font-semibold">Attachment</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {notices.data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center">
                                            <Icon.Megaphone className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-gray-500">No notices found</p>
                                            <p className="text-xs text-gray-400 mt-1">Try a different search, or post a new notice</p>
                                        </td>
                                    </tr>
                                )}
                                {notices.data.map((notice) => (
                                    <tr key={notice.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                                <Icon.Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                {notice.notice_date}
                                            </div>
                                            <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-bold ${TYPE_STYLES[notice.type] || TYPE_STYLES.General}`}>
                                                {notice.type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-800 font-bold">{notice.title}</div>
                                            {notice.description && (
                                                <div className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-md">{notice.description}</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {notice.attachment ? (
                                                <a
                                                    href={`/storage/${notice.attachment}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    <Icon.Paperclip className="h-3.5 w-3.5" /> View File
                                                </a>
                                            ) : <span className="text-xs text-gray-400">No File</span>}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEditModal(notice)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Icon.Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setItemToDelete(notice)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Icon.Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination (Laravel paginator links) */}
                    {Array.isArray(notices.links) && notices.links.length > 3 && (
                        <div className="flex flex-wrap gap-1 items-center justify-end p-4 border-t border-gray-100">
                            {notices.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => goToPage(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                                        link.active
                                            ? 'bg-indigo-600 text-white'
                                            : link.url
                                                ? 'text-gray-600 hover:bg-gray-100'
                                                : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">{editMode ? 'Edit Notice' : 'Add New Notice'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                                <Icon.X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={submit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notice Title *</label>
                                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500" required />
                                {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notice Type *</label>
                                    <select value={data.type} onChange={e => setData('type', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                        <option value="General">General</option>
                                        <option value="Exam">Exam</option>
                                        <option value="Holiday">Holiday</option>
                                        <option value="Event">Event</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                    <input type="date" value={data.notice_date} onChange={e => setData('notice_date', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows="3" className="w-full rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (PDF/Image)</label>
                                <label className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 px-4 py-3 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors">
                                    <Icon.Upload className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm text-gray-500 truncate">
                                        {data.attachment ? data.attachment.name : 'Click to choose a file'}
                                    </span>
                                    <input type="file" onChange={e => setData('attachment', e.target.files[0])} className="hidden" />
                                </label>
                                {editMode && !data.attachment && (
                                    <p className="text-xs text-gray-400 mt-1">Leave empty to keep the current attachment</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">Cancel</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors">
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