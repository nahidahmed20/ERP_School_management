import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";
const selectCls = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer transition-all";

const STATUS_OPTS = [
  { key: 'promote', label: 'Promote', active: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 border-emerald-600' },
  { key: 'retain', label: 'Retain', active: 'bg-amber-500 text-white shadow-md shadow-amber-500/20 border-amber-500' },
  { key: 'leave', label: 'Leave', active: 'bg-rose-600 text-white shadow-md shadow-rose-500/20 border-rose-600' },
];

export default function Promotions({ sessions, classes, students, filters }) {
  const { flash } = usePage().props;

  // Search Filters
  const [currentSession, setCurrentSession] = useState(filters.current_session_id ?? '');
  const [currentClass, setCurrentClass] = useState(filters.current_class_id ?? '');
  const [currentSection, setCurrentSection] = useState(filters.current_section_id ?? '');

  // Fetch Students Form
  const fetchStudents = () => {
    if (!currentSession || !currentClass || !currentSection) {
      Swal.fire({ icon: 'warning', title: 'Oops...', text: 'দয়া করে বর্তমান সেশন, ক্লাস এবং সেকশন সিলেক্ট করুন!', customClass: { popup: 'rounded-2xl' } });
      return;
    }
    router.get(route('admin.students.promotions'), {
      current_session_id: currentSession,
      current_class_id: currentClass,
      current_section_id: currentSection,
    }, { preserveState: true });
  };

  // Promotion Form (Submit to next class)
  const { data, setData, post, processing } = useForm({
    next_session_id: '',
    next_class_id: '',
    next_section_id: '',
    students: students || []
  });

  useEffect(() => {
    setData('students', students || []);
  }, [students]);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
  }, [flash]);

  const handleStatusChange = (index, status) => {
    const updatedStudents = [...data.students];
    updatedStudents[index].promote_status = status;
    setData('students', updatedStudents);
  };

  const handlePromotionSubmit = (e) => {
    e.preventDefault();
    if (!data.next_session_id || !data.next_class_id || !data.next_section_id) {
      Swal.fire({ icon: 'error', title: 'Action Denied', text: 'পরবর্তী সেশন, ক্লাস এবং সেকশন সিলেক্ট করা বাধ্যতামূলক!', customClass: { popup: 'rounded-2xl' } });
      return;
    }
    post(route('admin.students.promotions.store'), {
      data: {
        ...data,
        current_class_id: currentClass,
        current_section_id: currentSection
      }
    });
  };

  const selectedCurrentClass = classes.find(c => c.id == currentClass);
  const selectedNextClass = classes.find(c => c.id == data.next_class_id);

  return (
    <AuthenticatedLayout>
      <Head title="Student Promotions" />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Academics &gt; Promotions</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Student Promotions</h1>
            <p className="text-sm text-slate-500 mt-1">শিক্ষার্থীদের নতুন শিক্ষাবর্ষ ও ক্লাসে উন্নীত (Promote) করুন।</p>
          </div>
        </div>

        {/* Step 1: Filter/Fetch Students */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-indigo-600">
          
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-sm font-bold shrink-0">1</span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Current Class Information</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">বর্তমান ক্লাসের তথ্য নির্বাচন করুন</p>
            </div>
          </div>

          <div className="grid gap-5 items-end" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <label className={labelCls}>Current Session <span className="text-rose-500">*</span></label>
              <select value={currentSession} onChange={e => setCurrentSession(e.target.value)} className={selectCls}>
                <option value="">-- Select Session --</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Current Class <span className="text-rose-500">*</span></label>
              <select value={currentClass} onChange={e => { setCurrentClass(e.target.value); setCurrentSection(''); }} className={selectCls}>
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Current Section <span className="text-rose-500">*</span></label>
              <select
                value={currentSection} onChange={e => setCurrentSection(e.target.value)}
                disabled={!currentClass} className={`${selectCls} disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <option value="">-- Select Section --</option>
                {selectedCurrentClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <button
              type="button" onClick={fetchStudents}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 h-[42px]"
            >
              <Icon name="search" className="w-4 h-4" /> Fetch Students
            </button>
          </div>
        </div>

        {/* Step 2: Display Students & Select Next Class */}
        {students && students.length > 0 && (
          <form onSubmit={handlePromotionSubmit} className="space-y-6">

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner border-t-4 border-t-emerald-500">
              
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center text-sm font-bold shrink-0">2</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Promotion Setup</h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">পরবর্তী সেশন ও ক্লাস নির্বাচন করুন</p>
                </div>
              </div>

              <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div>
                  <label className={labelCls}>Next Session <span className="text-rose-500">*</span></label>
                  <select
                    value={data.next_session_id} onChange={e => setData('next_session_id', e.target.value)}
                    required className={`${selectCls} bg-white shadow-sm`}
                  >
                    <option value="">-- Select Next Session --</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Next Class <span className="text-rose-500">*</span></label>
                  <select
                    value={data.next_class_id}
                    onChange={e => { setData('next_class_id', e.target.value); setData('next_section_id', ''); }}
                    required className={`${selectCls} bg-white shadow-sm`}
                  >
                    <option value="">-- Select Next Class --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Next Section <span className="text-rose-500">*</span></label>
                  <select
                    value={data.next_section_id} onChange={e => setData('next_section_id', e.target.value)}
                    required disabled={!data.next_class_id}
                    className={`${selectCls} bg-white shadow-sm disabled:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <option value="">-- Select Next Section --</option>
                    {selectedNextClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Student List Table */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Admission No</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Roll</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Promotion Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.students.map((student, index) => (
                      <tr key={student.student_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <code className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">
                            {student.admission_no}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900">{student.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-500">{student.roll_no || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
                            {STATUS_OPTS.map(opt => (
                              <label
                                key={opt.key}
                                className={`cursor-pointer px-4 py-1.5 rounded-lg text-[11px] uppercase tracking-wide font-bold transition-all border ${
                                  student.promote_status === opt.key 
                                    ? opt.active 
                                    : 'border-transparent text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm'
                                }`}
                              >
                                <input
                                  type="radio" 
                                  name={`status-${student.student_id}`} 
                                  className="hidden"
                                  checked={student.promote_status === opt.key}
                                  onChange={() => handleStatusChange(index, opt.key)}
                                />
                                {opt.label}
                              </label>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end rounded-b-2xl">
                <button
                  type="submit" 
                  disabled={processing}
                  className="flex justify-center items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Icon name="check-circle" className="w-4 h-4" /> Save Promotions
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Empty State */}
        {filters.current_session_id && students && students.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-slate-300 rounded-2xl bg-white text-center">
            <div className="w-16 h-16 bg-amber-50 border-2 border-amber-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Icon name="info" className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">কোনো শিক্ষার্থী পাওয়া যায়নি!</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              নির্বাচিত ক্লাস এবং সেকশনে বর্তমানে কোনো শিক্ষার্থী ভর্তি নেই। দয়া করে অন্য ক্লাস সিলেক্ট করুন।
            </p>
          </div>
        )}

      </div>
    </AuthenticatedLayout>
  );
}