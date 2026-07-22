import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';

export default function HomeworkIndex({ homeworks, classes, subjects, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const [availableSections, setAvailableSections] = useState([]);

    const { data, setData, post, processing, reset } = useForm({
        id: '', school_class_id: '', section_id: '', subject_id: '',
        homework_date: new Date().toISOString().split('T')[0],
        submission_date: '', description: '', document: null, _method: 'POST'
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(route('admin.lms.homework.index'), { search: searchTerm }, { preserveState: true, preserveScroll: true });
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        if (data.school_class_id) {
            const selectedClass = classes.find(c => c.id == data.school_class_id);
            setAvailableSections(selectedClass ? selectedClass.sections : []);
        } else {
            setAvailableSections([]);
        }
    }, [data.school_class_id]);

    const openAddModal = () => {
        reset();
        setData('_method', 'POST');
        setEditMode(false);
        setShowModal(true);
    };

    const openEditModal = (hw) => {
        setData({
            id: hw.id, school_class_id: hw.school_class_id, section_id: hw.section_id,
            subject_id: hw.subject_id, homework_date: hw.homework_date,
            submission_date: hw.submission_date, description: hw.description,
            document: null, _method: 'PUT'
        });
        setEditMode(true);
        setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const routeName = editMode ? route('admin.lms.homework.update', data.id) : route('admin.lms.homework.store');
        post(routeName, { onSuccess: () => { setShowModal(false); reset(); } });
    };

    const confirmDelete = () => {
        router.delete(route('admin.lms.homework.destroy', itemToDelete.id), {
            onSuccess: () => setItemToDelete(null),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Homework Management</h2>}>
            <Head title="Homework" />
            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-lg font-bold text-gray-800">Assigned Homework</h3>
                        <div className="flex gap-3 w-full md:w-auto">
                            <input type="text" placeholder="Search by description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 rounded-lg border-gray-300 shadow-sm text-sm" />
                            <button onClick={openAddModal} className="bg-indigo-600 whitespace-nowrap text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-indigo-700">
                                + Assign Homework
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                                    <th className="p-4 font-semibold">Class & Subject</th>
                                    <th className="p-4 font-semibold">Dates</th>
                                    <th className="p-4 font-semibold">Document</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {homeworks.data.map((hw) => (
                                    <tr key={hw.id} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{hw.school_class?.name} ({hw.section?.name})</div>
                                            <div className="text-xs text-indigo-600 font-bold">{hw.subject?.name}</div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div><span className="text-gray-500">Assign:</span> {hw.homework_date}</div>
                                            <div><span className="text-rose-500 font-bold">Submit:</span> {hw.submission_date}</div>
                                        </td>
                                        <td className="p-4">
                                            {hw.document ? (
                                                <a href={`/storage/${hw.document}`} target="_blank" className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200">Download</a>
                                            ) : <span className="text-xs text-gray-400">No File</span>}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => openEditModal(hw)} className="text-blue-600 hover:text-blue-900 font-bold text-sm mr-4">Edit</button>
                                            <button onClick={() => setItemToDelete(hw)} className="text-rose-500 hover:text-rose-700 font-bold text-sm">Delete</button>
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
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{editMode ? 'Edit Homework' : 'Assign Homework'}</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Class *</label>
                                    <select value={data.school_class_id} onChange={e => setData('school_class_id', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" required>
                                        <option value="">Select Class</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Section *</label>
                                    <select value={data.section_id} onChange={e => setData('section_id', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" required disabled={!data.school_class_id}>
                                        <option value="">Select Section</option>
                                        {availableSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Subject *</label>
                                <select value={data.subject_id} onChange={e => setData('subject_id', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" required>
                                    <option value="">Select Subject</option>
                                    {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Assign Date *</label>
                                    <input type="date" value={data.homework_date} onChange={e => setData('homework_date', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Submission Date *</label>
                                    <input type="date" value={data.submission_date} onChange={e => setData('submission_date', e.target.value)} className="mt-1 w-full rounded-lg border-gray-300" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Details / Description *</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows="3" className="mt-1 w-full rounded-lg border-gray-300" required></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Attach File (Optional)</label>
                                <input type="file" onChange={e => setData('document', e.target.files[0])} className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
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

            {itemToDelete && <ConfirmDeleteModal item={{ name: 'this homework' }} onCancel={() => setItemToDelete(null)} onConfirm={confirmDelete} />}
        </AuthenticatedLayout>
    );
}
