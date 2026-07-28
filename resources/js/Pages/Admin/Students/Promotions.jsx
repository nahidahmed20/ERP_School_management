import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5";
const selectCls = "w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-700 focus:border-emerald-500 focus:ring-emerald-500 focus:bg-white transition";

const STATUS_OPTS = [
  { key: 'promote', label: 'Promote', active: 'bg-emerald-600 text-white shadow-sm' },
  { key: 'retain', label: 'Retain', active: 'bg-amber-500 text-white shadow-sm' },
  { key: 'leave', label: 'Leave', active: 'bg-rose-500 text-white shadow-sm' },
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
      Swal.fire({ icon: 'warning', title: 'Oops...', text: 'দয়া করে বর্তমান সেশন, ক্লাস এবং সেকশন সিলেক্ট করুন!' });
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
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
  }, [flash]);

  const handleStatusChange = (index, status) => {
    const updatedStudents = [...data.students];
    updatedStudents[index].promote_status = status;
    setData('students', updatedStudents);
  };

  const handlePromotionSubmit = (e) => {
    e.preventDefault();
    if (!data.next_session_id || !data.next_class_id || !data.next_section_id) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'পরবর্তী সেশন, ক্লাস এবং সেকশন সিলেক্ট করা বাধ্যতামূলক!' });
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
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Academics &gt; Promotions</span>
            <h1>Student Promotions</h1>
            <p className="desc">শিক্ষার্থীদের নতুন শিক্ষাবর্ষ ও ক্লাসে উন্নীত (Promote) করুন।</p>
          </div>
        </div>
      }
    >
      <Head title="Student Promotions" />

      <div className="pb-10 space-y-6">

        {/* Step 1: Filter/Fetch Students */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-bold shrink-0">1</span>
            <h3 className="text-lg font-bold text-gray-900">বর্তমান ক্লাসের তথ্য</h3>
            <span className="text-sm text-gray-400 font-medium">Current Class</span>
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
                disabled={!currentClass} className={`${selectCls} disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <option value="">-- Select Section --</option>
                {selectedCurrentClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <button
              type="button" onClick={fetchStudents}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/25 hover:shadow-xl transition flex items-center justify-center gap-2"
            >
              <Icon name="search" /> Fetch Students
            </button>
          </div>
        </div>

        {/* Step 2: Display Students & Select Next Class */}
        {students && students.length > 0 && (
          <form onSubmit={handlePromotionSubmit} className="space-y-6">

            <div className="relative bg-amber-50/50 rounded-2xl border border-amber-200/60 shadow-sm p-7 pl-8 overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-700 to-amber-400" />
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold shrink-0">2</span>
                <h3 className="text-lg font-bold text-gray-900">প্রমোশন সেটআপ</h3>
                <span className="text-sm text-gray-400 font-medium">Promote To</span>
              </div>

              <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div>
                  <label className={labelCls}>Next Session <span className="text-rose-500">*</span></label>
                  <select
                    value={data.next_session_id} onChange={e => setData('next_session_id', e.target.value)}
                    required className={`${selectCls} bg-white`}
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
                    required className={`${selectCls} bg-white`}
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
                    className={`${selectCls} bg-white disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <option value="">-- Select Next Section --</option>
                    {selectedNextClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Student List Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Admission No</th>
                      <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Student Name</th>
                      <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Current Roll</th>
                      <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Promotion Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.students.map((student, index) => (
                      <tr key={student.student_id} className="hover:bg-gray-50/70 transition">
                        <td className="px-5 py-4">
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-bold">
                            {student.admission_no}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-gray-900">{student.name}</td>
                        <td className="px-5 py-4 text-gray-500">{student.roll_no || 'N/A'}</td>
                        <td className="px-5 py-4">
                          <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1 gap-1">
                            {STATUS_OPTS.map(opt => (
                              <label
                                key={opt.key}
                                className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-bold transition ${
                                  student.promote_status === opt.key ? opt.active : 'text-gray-500 hover:bg-white'
                                }`}
                              >
                                <input
                                  type="radio" name={`status-${student.student_id}`} className="hidden"
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

              <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  type="submit" disabled={processing}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/25 hover:shadow-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : 'Save Promotions'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Empty State */}
        {filters.current_session_id && students && students.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-14 px-6 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="info" className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">কোনো শিক্ষার্থী পাওয়া যায়নি!</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              নির্বাচিত ক্লাস এবং সেকশনে বর্তমানে কোনো শিক্ষার্থী ভর্তি নেই। দয়া করে অন্য ক্লাস সিলেক্ট করুন।
            </p>
          </div>
        )}

      </div>
    </AuthenticatedLayout>
  );
}