import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';

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

        // ফাইলে আপলোড না থাকায় সরাসরি post/put ব্যবহার করা যায়
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

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Visitor Book</h2>}>
            <Head title="Visitor Book" />
            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-lg font-bold text-gray-800">Visitor Logs</h3>
                        <div className="flex gap-3 w-full md:w-auto">
                            <input type="text" placeholder="Search by name, phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 rounded-lg border-gray-300 shadow-sm text-sm" />
                            <button onClick={openAddModal} className="bg-indigo-600 whitespace-nowrap text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-indigo-700">
                                + Add Visitor
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                                    <th className="p-4 font-semibold">Visitor Details</th>
                                    <th className="p-4 font-semibold">Purpose & Person</th>
                                    <th className="p-4 font-semibold">Time</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {visitors.data.map((visitor) => (
                                    <tr key={visitor.id} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{visitor.name}</div>
                                            <div className="text-xs text-gray-500">📞 {visitor.phone || 'N/A'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-800 font-medium">{visitor.purpose}</div>
                                            <div className="text-xs text-indigo-600">To meet: {visitor.person_to_meet || '--'}</div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="text-gray-600 font-medium">{visitor.visit_date}</div>
                                            <div className="text-xs mt-1">
                                                <span className="text-emerald-600 font-bold mr-2">In: {visitor.in_time}</span>
                                                {visitor.out_time && <span className="text-rose-500 font-bold">Out: {visitor.out_time}</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => openEditModal(visitor)} className="text-blue-600 font-bold text-sm mr-3">Edit</button>
                                            <button onClick={() => setItemToDelete(visitor)} className="text-rose-500 font-bold text-sm">Delete</button>
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
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{editMode ? 'Edit Visitor' : 'Add New Visitor'}</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Visitor Name *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Purpose *</label>
                                    <input type="text" value={data.purpose} onChange={e => setData('purpose', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Person to Meet</label>
                                    <input type="text" value={data.person_to_meet} onChange={e => setData('person_to_meet', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date *</label>
                                    <input type="date" value={data.visit_date} onChange={e => setData('visit_date', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">In Time *</label>
                                    <input type="time" value={data.in_time} onChange={e => setData('in_time', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Out Time</label>
                                    <input type="time" value={data.out_time} onChange={e => setData('out_time', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" />
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

            {itemToDelete && <ConfirmDeleteModal item={{ name: itemToDelete.name }} onCancel={() => setItemToDelete(null)} onConfirm={confirmDelete} />}
        </AuthenticatedLayout>
    );
}
