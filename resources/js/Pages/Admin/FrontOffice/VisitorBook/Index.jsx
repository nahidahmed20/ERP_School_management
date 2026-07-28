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
    Phone: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    ),
    LogIn: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
        </svg>
    ),
    LogOut: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
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
    Users: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    X: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    ),
};

export default function VisitorBook({ visitors, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const { data, setData, post, put, processing, reset } = useForm({
        id: '', name: '', phone: '', purpose: '', person_to_meet: '',
        visit_date: new Date().toISOString().split('T')[0], in_time: '', out_time: ''
    });

    // Search functionality
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(route('admin.frontoffice.visitors.index'), { search: searchTerm }, { preserveState: true, preserveScroll: true });
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const openAddModal = () => {
        reset(); setEditMode(false); setShowModal(true);
    };

    const openEditModal = (visitor) => {
        setData({
            id: visitor.id, name: visitor.name, phone: visitor.phone || '',
            purpose: visitor.purpose, person_to_meet: visitor.person_to_meet || '',
            visit_date: visitor.visit_date, in_time: visitor.in_time, out_time: visitor.out_time || ''
        });
        setEditMode(true); setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const routeName = editMode ? route('admin.frontoffice.visitors.update', data.id) : route('admin.frontoffice.visitors.store');

        if (editMode) {
            put(routeName, { onSuccess: () => { setShowModal(false); reset(); } });
        } else {
            post(routeName, { onSuccess: () => { setShowModal(false); reset(); } });
        }
    };

    const confirmDelete = () => {
        router.delete(route('admin.frontoffice.visitors.destroy', itemToDelete.id), {
            onSuccess: () => setItemToDelete(null),
        });
    };

    const goToPage = (url) => {
        if (!url) return;
        router.get(url, { search: searchTerm }, { preserveState: true, preserveScroll: true });
    };

    const initials = (name) => (name || '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase();

    const checkedInCount = visitors.data.filter(v => !v.out_time).length;
    const checkedOutCount = visitors.data.length - checkedInCount;

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Visitor Book</h2>}>
            <Head title="Visitor Book" />

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">

                {/* Stat strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                        <div className="h-11 w-11 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <Icon.Users className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 leading-tight">{visitors.total ?? visitors.data.length}</div>
                            <div className="text-xs text-gray-500 font-medium">Total Visitors</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                        <div className="h-11 w-11 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <Icon.LogIn className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 leading-tight">{checkedInCount}</div>
                            <div className="text-xs text-gray-500 font-medium">Currently In</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                        <div className="h-11 w-11 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                            <Icon.LogOut className="h-5 w-5 text-rose-500" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 leading-tight">{checkedOutCount}</div>
                            <div className="text-xs text-gray-500 font-medium">Checked Out</div>
                        </div>
                    </div>
                </div>

                {/* Main card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 border-b border-gray-100">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Visitor Logs</h3>
                            <p className="text-sm text-gray-500 mt-0.5">Track everyone coming in and out of the front office</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Icon.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm text-sm pl-9 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center gap-1.5 bg-indigo-600 whitespace-nowrap text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                            >
                                <Icon.Plus className="h-4 w-4" /> Add Visitor
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/70 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                                    <th className="p-4 font-semibold">Visitor</th>
                                    <th className="p-4 font-semibold">Purpose & Person</th>
                                    <th className="p-4 font-semibold">Time</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {visitors.data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center">
                                            <Icon.Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-gray-500">No visitors found</p>
                                            <p className="text-xs text-gray-400 mt-1">Try a different search, or add a new visitor</p>
                                        </td>
                                    </tr>
                                )}
                                {visitors.data.map((visitor) => (
                                    <tr key={visitor.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                                    {initials(visitor.name)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800">{visitor.name}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <Icon.Phone className="h-3 w-3" /> {visitor.phone || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-800 font-medium">{visitor.purpose}</div>
                                            <div className="text-xs text-indigo-600 mt-0.5">To meet: {visitor.person_to_meet || '--'}</div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="text-gray-700 font-medium">{visitor.visit_date}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                    In {visitor.in_time}
                                                </span>
                                                {visitor.out_time && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                                                        Out {visitor.out_time}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEditModal(visitor)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Icon.Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setItemToDelete(visitor)}
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
                    {Array.isArray(visitors.links) && visitors.links.length > 3 && (
                        <div className="flex flex-wrap gap-1 items-center justify-end p-4 border-t border-gray-100">
                            {visitors.links.map((link, i) => (
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
                            <h3 className="text-lg font-bold text-gray-900">{editMode ? 'Edit Visitor' : 'Add New Visitor'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                                <Icon.X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={submit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Name *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
                                    <input type="text" value={data.purpose} onChange={e => setData('purpose', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Person to Meet</label>
                                    <input type="text" value={data.person_to_meet} onChange={e => setData('person_to_meet', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                    <input type="date" value={data.visit_date} onChange={e => setData('visit_date', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">In Time *</label>
                                    <input type="time" value={data.in_time} onChange={e => setData('in_time', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Out Time</label>
                                    <input type="time" value={data.out_time} onChange={e => setData('out_time', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">Cancel</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                                    {editMode ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {itemToDelete && <ConfirmDeleteModal item={{ name: itemToDelete.name }} onCancel={() => setItemToDelete(null)} onConfirm={confirmDelete} />}
        </AuthenticatedLayout>
    );
}