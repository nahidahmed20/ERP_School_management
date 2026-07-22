import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';

export default function CertificateTemplates({ templates, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const { data, setData, post, processing, reset } = useForm({
        id: '', name: '', type: 'Student', body_content: '', background_image: null, _method: 'POST'
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(route('admin.documents.certificatetemplates.index'), { search: searchTerm }, { preserveState: true, preserveScroll: true });
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const openAddModal = () => {
        reset(); setData('_method', 'POST'); setEditMode(false); setShowModal(true);
    };

    const openEditModal = (template) => {
        setData({
            id: template.id, name: template.name, type: template.type,
            body_content: template.body_content, background_image: null,
            _method: 'PUT' // File upload in edit requires POST route with _method PUT
        });
        setEditMode(true); setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const routeName = editMode ? route('admin.documents.certificatetemplates.update', data.id) : route('admin.documents.certificatetemplates.store');

        post(routeName, { onSuccess: () => { setShowModal(false); reset(); } });
    };

    const confirmDelete = () => {
        router.delete(route('admin.documents.certificatetemplates.destroy', itemToDelete.id), {
            onSuccess: () => setItemToDelete(null),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Certificate Templates</h2>}>
            <Head title="Templates" />
            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-lg font-bold text-gray-800">Template Designs</h3>
                        <div className="flex gap-3 w-full md:w-auto">
                            <input type="text" placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 rounded-lg border-gray-300 shadow-sm text-sm" />
                            <button onClick={openAddModal} className="bg-indigo-600 whitespace-nowrap text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-indigo-700">
                                + Add Template
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.data.map((template) => (
                            <div key={template.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all bg-gray-50">
                                {/* Image Preview Block */}
                                <div className="h-40 bg-gray-200 w-full flex items-center justify-center relative overflow-hidden">
                                    {template.background_image ? (
                                        <img src={`/storage/${template.background_image}`} alt={template.name} className="object-cover w-full h-full opacity-80" />
                                    ) : (
                                        <span className="text-gray-400 font-bold text-sm">No Background Image</span>
                                    )}
                                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">
                                        {template.type}
                                    </div>
                                </div>
                                {/* Details Block */}
                                <div className="p-4 bg-white">
                                    <h4 className="font-bold text-gray-800">{template.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.body_content}</p>
                                    <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-100">
                                        <button onClick={() => openEditModal(template)} className="text-blue-600 font-bold text-sm">Edit</button>
                                        <button onClick={() => setItemToDelete(template)} className="text-rose-500 font-bold text-sm">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{editMode ? 'Edit Template' : 'Add New Template'}</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Template Name *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" placeholder="e.g. Transfer Certificate" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type *</label>
                                    <select value={data.type} onChange={e => setData('type', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" required>
                                        <option value="Student">Student</option>
                                        <option value="Staff">Staff</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Body Content *</label>
                                <p className="text-xs text-gray-400 mb-1">Use tags like [student_name], [class], [date]</p>
                                <textarea value={data.body_content} onChange={e => setData('body_content', e.target.value)} rows="5" className="w-full rounded-lg border-gray-300" required></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Background Image (Optional)</label>
                                <input type="file" onChange={e => setData('background_image', e.target.files[0])} className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-bold">Cancel</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">
                                    {editMode ? 'Update Template' : 'Save Template'}
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
