import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function Index({ student, filters }) {
  const { flash, errors: pageErrors } = usePage().props;
  const [admissionNo, setAdmissionNo] = useState(filters.admission_no ?? '');

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    student_id: student?.id || '',
    document_type: '',
    file: null,
    remarks: ''
  });

  useEffect(() => {
    if (student?.id) setData('student_id', student.id);
  }, [student]);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
      reset('document_type', 'file', 'remarks');
      clearErrors();
      // Reset file input element visually
      const fileInput = document.getElementById('fileUpload');
      if (fileInput) fileInput.value = '';
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
  }, [flash, pageErrors]);

  const searchStudent = (e) => {
    e.preventDefault();
    if (!admissionNo) return;
    router.get(route('admin.students.documents.index'), { admission_no: admissionNo }, { preserveState: true });
  };

  const handleUpload = (e) => {
    e.preventDefault();
    post(route('admin.students.documents.store'));
  };

  const handleDelete = (docId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "এই ডকুমেন্টটি ডিলিট করতে চান? এটি আর রিকভার করা সম্ভব নয়!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: { popup: 'rounded-2xl' }
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin.students.documents.destroy', docId));
      }
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Student Documents" />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Students</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Student Documents</h1>
            <p className="text-sm text-slate-500 mt-1">শিক্ষার্থীদের জন্ম নিবন্ধন, ছাড়পত্র ও অন্যান্য প্রয়োজনীয় কাগজপত্র সংরক্ষণ করুন।</p>
          </div>
        </div>

        {/* Step 1: Search Student Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-indigo-600">
          <form onSubmit={searchStudent} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full max-w-md">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Student Admission Number <span className="text-rose-500">*</span></label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Icon name="search" className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. STU-2025-0001"
                  value={admissionNo}
                  onChange={e => setAdmissionNo(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono"
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95 flex justify-center items-center gap-2"
            >
              Search Student
            </button>
          </form>
        </div>

        {/* Step 2: Student Profile & Documents */}
        {student && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Upload Form (Takes up 5 columns) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-emerald-500 flex flex-col h-max">
              
              {/* Profile Snippet */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 rounded-full bg-indigo-50 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 text-xl font-bold font-serif shrink-0">
                  {student.first_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{student.first_name} {student.last_name || ''}</h3>
                  <div className="text-sm font-medium text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                    <span>Class: <strong className="text-slate-700">{student.current_enrollment?.school_class?.name || 'N/A'}</strong></span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>Adm: <strong className="text-slate-700 font-mono">{student.admission_no}</strong></span>
                  </div>
                </div>
              </div>

              <h4 className="text-base font-bold text-slate-800 mb-4">Upload New Document</h4>
              
              <form onSubmit={handleUpload} className="flex flex-col gap-4 flex-1">
                {/* Document Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Document Type <span className="text-rose-500">*</span></label>
                  <select 
                    value={data.document_type} 
                    onChange={e => setData('document_type', e.target.value)} 
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer" 
                    required
                  >
                    <option value="" disabled>-- Select Type --</option>
                    <option value="Birth Certificate">Birth Certificate</option>
                    <option value="Transfer Certificate">Transfer Certificate (TC)</option>
                    <option value="Parent NID">Parent NID</option>
                    <option value="Medical Report">Medical Report</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.document_type && <p className="text-rose-500 text-xs font-medium mt-1">{errors.document_type}</p>}
                </div>

                {/* File Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select File (PDF, JPG, PNG) <span className="text-rose-500">*</span></label>
                  <input 
                    id="fileUpload" 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png" 
                    onChange={e => setData('file', e.target.files[0])} 
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all border border-slate-200 rounded-xl bg-slate-50 cursor-pointer" 
                    required 
                  />
                  {errors.file && <p className="text-rose-500 text-xs font-medium mt-1">{errors.file}</p>}
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Remarks <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input 
                    type="text" 
                    value={data.remarks} 
                    onChange={e => setData('remarks', e.target.value)} 
                    placeholder="Add a short note about this file..." 
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={processing || !data.file || !data.document_type} 
                  className="mt-auto w-full flex justify-center items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Icon name="upload" className="w-4 h-4" /> Upload Document
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Uploaded Documents List (Takes up 7 columns) */}
            <div className="lg:col-span-7 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
              <div className="flex items-center justify-between mb-5">
                <h4 className="flex items-center gap-2 text-base font-bold text-slate-800">
                  <Icon name="folder" className="w-5 h-5 text-indigo-500" /> Uploaded Documents
                </h4>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold">
                  {student.documents?.length || 0} Files
                </span>
              </div>

              {student.documents?.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {student.documents.map(doc => (
                    <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-xl shadow-sm transition-all hover:border-indigo-200 hover:shadow">
                      <div>
                        <strong className="text-sm font-bold text-slate-900 block mb-0.5">{doc.document_type}</strong>
                        <div className="text-xs font-medium text-slate-500">
                          {doc.remarks || <span className="italic text-slate-400">No remarks provided</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a 
                          href={`/storage/${doc.file_path}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
                        >
                          <Icon name="eye" className="w-3.5 h-3.5" /> View
                        </a>
                        <button 
                          onClick={() => handleDelete(doc.id)} 
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100"
                        >
                          <Icon name="trash" className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-300 rounded-xl bg-white text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <Icon name="file" className="w-8 h-8 text-slate-300" />
                  </div>
                  <h5 className="text-sm font-bold text-slate-700">No documents found</h5>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">You haven't uploaded any documents for this student yet. Use the form to upload.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </AuthenticatedLayout>
  );
}