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
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel',
      customClass: { popup: 'rounded-2xl' }
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin.grades.destroy', id));
      }
    });
  };

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">Settings</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Exam Grade Setup</h1>
            <p className="text-sm text-slate-500 mt-1">পরীক্ষার গ্রেডিং সিস্টেম এবং নম্বর সীমা নির্ধারণ করুন।</p>
          </div>
        </div>
      }
    >
      <Head title="Grade Setup" />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* 📝 Left Side: Form */}
          <div className="w-full lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-8 ring-1 ring-slate-900/5">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  {editingId ? 'Edit Grade' : 'Add New Grade'}
                </h3>
                {editingId && (
                  <span className="text-xs font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">Editing</span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelClass}>Grade Name <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={data.name} 
                    onChange={e => setData('name', e.target.value)} 
                    required 
                    className={inputClass} 
                    placeholder="e.g. A+" 
                  />
                  {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className={labelClass}>Grade Point <span className="text-rose-500">*</span></label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={data.grade_point} 
                    onChange={e => setData('grade_point', e.target.value)} 
                    required 
                    className={inputClass} 
                    placeholder="e.g. 5.00" 
                  />
                  {errors.grade_point && <p className="text-rose-500 text-xs mt-1">{errors.grade_point}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Min Marks <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      value={data.min_marks} 
                      onChange={e => setData('min_marks', e.target.value)} 
                      required 
                      className={inputClass} 
                      placeholder="80" 
                    />
                    {errors.min_marks && <p className="text-rose-500 text-xs mt-1">{errors.min_marks}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Max Marks <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      value={data.max_marks} 
                      onChange={e => setData('max_marks', e.target.value)} 
                      required 
                      className={inputClass} 
                      placeholder="100" 
                    />
                    {errors.max_marks && <p className="text-rose-500 text-xs mt-1">{errors.max_marks}</p>}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Remarks <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input 
                    type="text" 
                    value={data.remarks} 
                    onChange={e => setData('remarks', e.target.value)} 
                    className={inputClass} 
                    placeholder="e.g. Excellent, Good, Fail" 
                  />
                  {errors.remarks && <p className="text-rose-500 text-xs mt-1">{errors.remarks}</p>}
                </div>

                <div className="pt-3 flex gap-3">
                  {editingId && (
                    <button 
                      type="button" 
                      onClick={cancelEdit} 
                      className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl transition-all shadow-sm"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    type="submit" 
                    disabled={processing} 
                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95"
                  >
                    {processing ? 'Saving...' : (editingId ? 'Update Grade' : 'Save Grade')}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* 📊 Right Side: Table */}
          <div className="w-full lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
              <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-900">Grading Scale List</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Point</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Marks Range</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Remarks</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {grades.length > 0 ? grades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold border ${grade.grade_point == 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                            {grade.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-slate-800">
                          {grade.grade_point}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-slate-600">
                          {grade.min_marks} - {grade.max_marks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 italic">
                          {grade.remarks || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => handleEdit(grade)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Grade">
                              <Icon name="edit" className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(grade.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Grade">
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500 text-sm italic">
                          No grades setup yet. Please add some grades!
                        </td>
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