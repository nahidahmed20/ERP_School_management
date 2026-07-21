import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function Grades({ grades }) {
  const [editingId, setEditingId] = useState(null);

  const { data, setData, post, put, reset, processing, errors } = useForm({
    name: '',
    grade_point: '',
    min_marks: '',
    max_marks: '',
    remarks: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      put(route('admin.grades.update', editingId), {
        onSuccess: () => { reset(); setEditingId(null); }
      });
    } else {
      post(route('admin.grades.store'), {
        onSuccess: () => reset()
      });
    }
  };

  const handleEdit = (grade) => {
    setEditingId(grade.id);
    setData({
      name: grade.name,
      grade_point: grade.grade_point,
      min_marks: grade.min_marks,
      max_marks: grade.max_marks,
      remarks: grade.remarks || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "আপনি কি এই গ্রেডটি মুছে ফেলতে চান?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Delete!'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin.grades.destroy', id));
      }
    });
  };

  return (
    <AuthenticatedLayout header={
      <div>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-100 px-2 py-1 rounded-md">Settings</span>
        <h1 className="text-2xl font-extrabold text-gray-900 mt-2">Exam Grade Setup</h1>
      </div>
    }>
      <Head title="Grade Setup" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* 📝 Left Side: Form */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-extrabold text-slate-800 mb-5 border-b border-gray-100 pb-3">
                {editingId ? 'Edit Grade' : 'Add New Grade'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700">Grade Name (e.g. A+)</label>
                  <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required className="w-full mt-1 rounded-lg border-gray-300 focus:ring-indigo-500" placeholder="A+" />
                  {errors.name && <span className="text-rose-500 text-xs mt-1">{errors.name}</span>}
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700">Grade Point (e.g. 5.00)</label>
                  <input type="number" step="0.01" value={data.grade_point} onChange={e => setData('grade_point', e.target.value)} required className="w-full mt-1 rounded-lg border-gray-300 focus:ring-indigo-500" placeholder="5.00" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700">Min Marks</label>
                    <input type="number" value={data.min_marks} onChange={e => setData('min_marks', e.target.value)} required className="w-full mt-1 rounded-lg border-gray-300 focus:ring-indigo-500" placeholder="80" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700">Max Marks</label>
                    <input type="number" value={data.max_marks} onChange={e => setData('max_marks', e.target.value)} required className="w-full mt-1 rounded-lg border-gray-300 focus:ring-indigo-500" placeholder="100" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700">Remarks (Optional)</label>
                  <input type="text" value={data.remarks} onChange={e => setData('remarks', e.target.value)} className="w-full mt-1 rounded-lg border-gray-300 focus:ring-indigo-500" placeholder="Excellent, Good, Fail..." />
                </div>

                <div className="pt-3 flex gap-3">
                  {editingId && (
                    <button type="button" onClick={cancelEdit} className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-slate-700 font-bold hover:bg-slate-50 transition-all">Cancel</button>
                  )}
                  <button type="submit" disabled={processing} className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all">
                    {processing ? 'Saving...' : (editingId ? 'Update Grade' : 'Save Grade')}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* 📊 Right Side: Table */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-extrabold text-slate-800">Grading Scale List</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-4 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">Point</th>
                      <th className="px-6 py-4 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">Marks Range</th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Remarks</th>
                      <th className="px-6 py-4 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {grades.length > 0 ? grades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-black ${grade.grade_point == 0 ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {grade.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center font-extrabold text-slate-700">
                          {grade.grade_point}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-slate-600">
                          {grade.min_marks} - {grade.max_marks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 italic">
                          {grade.remarks || '--'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <button onClick={() => handleEdit(grade)} className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 p-2 rounded-lg transition-colors">
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(grade.id)} className="text-rose-500 hover:text-rose-700 bg-rose-50 p-2 rounded-lg transition-colors">
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-bold">No grades setup yet. Please add some grades!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}