import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

export default function ReportCards({ exams, classes, students, reportCard, filters }) {
  const { data, setData, get, processing } = useForm({
    exam_id: filters?.exam_id || '',
    class_id: filters?.class_id || '',
    section_id: filters?.section_id || '',
    student_id: filters?.student_id || '',
  });

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setData(prev => ({ ...prev, class_id: classId, section_id: '', student_id: '' }));
    router.get(route('admin.exams.reportcards'), { exam_id: data.exam_id, class_id: classId }, { preserveState: true });
  };

  const handleSectionChange = (e) => {
    const sectionId = e.target.value;
    setData(prev => ({ ...prev, section_id: sectionId, student_id: '' }));
    router.get(route('admin.exams.reportcards'), { exam_id: data.exam_id, class_id: data.class_id, section_id: sectionId }, { preserveState: true });
  };

  const searchReportCard = (e) => {
    e.preventDefault();
    get(route('admin.exams.reportcards'), { preserveState: true });
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedClass = classes?.find(c => c.id == data.class_id);
  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">Examinations</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Student Report Card / Marksheet</h1>
            <p className="text-sm text-slate-500 mt-1">শিক্ষার্থীদের পরীক্ষার ফলাফল এবং একাডেমিক ট্রান্সক্রিপ্ট তৈরি করুন।</p>
          </div>
          {reportCard && (
            <button onClick={handlePrint} className="no-print inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Marksheet
            </button>
          )}
        </div>
      }
    >
      <Head title="Report Cards" />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">

        {/* 🎛️ Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 no-print border-t-4 border-t-indigo-600">
          <form onSubmit={searchReportCard} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
            
            <div>
              <label className={labelClass}>Exam <span className="text-rose-500">*</span></label>
              <select value={data.exam_id} onChange={e => setData('exam_id', e.target.value)} required className={inputClass}>
                <option value="" disabled>-- Select Exam --</option>
                {exams?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Class <span className="text-rose-500">*</span></label>
              <select value={data.class_id} onChange={handleClassChange} required className={inputClass}>
                <option value="" disabled>-- Select Class --</option>
                {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Section</label>
              <select value={data.section_id} onChange={handleSectionChange} disabled={!data.class_id} className={inputClass}>
                <option value="">-- All Sections --</option>
                {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Student <span className="text-rose-500">*</span></label>
              <select value={data.student_id} onChange={e => setData('student_id', e.target.value)} required disabled={!data.class_id} className={inputClass}>
                <option value="" disabled>-- Select Student --</option>
                {students?.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} (Adm: {s.admission_no})</option>)}
              </select>
            </div>

            <div>
              <button type="submit" disabled={processing} className="w-full px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 h-[42px] disabled:opacity-70">
                <Icon name="search" className="w-4 h-4" /> {processing ? 'Loading...' : 'Generate Report Card'}
              </button>
            </div>
            
          </form>
        </div>

        {/* 📄 Official Marksheet Area */}
        {reportCard && (
          <div className="printable-area max-w-4xl mx-auto bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 p-8 sm:p-10 space-y-6 relative overflow-hidden">
            
            {/* School Header */}
            <div className="text-center border-b border-slate-100 pb-5 space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-wide">IDEAL SCHOOL & COLLEGE</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Main Campus, Dhaka • Academic Transcript</p>
              <div className="inline-block bg-indigo-50 text-indigo-700 font-extrabold px-3 py-1 rounded-full text-xs mt-2 border border-indigo-100">
                Official Academic Report Card
              </div>
            </div>

            {/* Student Info Compact Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block font-bold uppercase mb-0.5">Student Name</span>
                <span className="font-bold text-slate-900 text-sm">{reportCard.student.first_name} {reportCard.student.last_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase mb-0.5">Admission No</span>
                <span className="font-semibold text-slate-700 text-sm">{reportCard.student.admission_no}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase mb-0.5">Class & Section</span>
                <span className="font-semibold text-slate-700 text-sm">{reportCard.student.current_enrollment?.school_class?.name} ({reportCard.student.current_enrollment?.section?.name || 'General'})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase mb-0.5">Roll No</span>
                <span className="font-semibold text-slate-700 text-sm">{reportCard.student.current_enrollment?.roll_no || '--'}</span>
              </div>
            </div>

            {/* Marks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3.5 font-bold text-slate-600 uppercase text-xs">Subject Name</th>
                    <th className="px-5 py-3.5 text-center font-bold text-slate-600 uppercase text-xs">Marks Obtained</th>
                    <th className="px-5 py-3.5 text-center font-bold text-slate-600 uppercase text-xs">Letter Grade</th>
                    <th className="px-5 py-3.5 text-center font-bold text-slate-600 uppercase text-xs">Grade Point</th>
                    <th className="px-5 py-3.5 font-bold text-slate-600 uppercase text-xs">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {reportCard.marks.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-semibold text-slate-800">{m.subject?.name}</td>
                      <td className="px-5 py-3 text-center font-bold text-indigo-600">{m.marks_obtained ?? '--'}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${m.grade === 'F' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                          {m.grade || '--'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center font-semibold text-slate-700">{m.grade_point ?? '--'}</td>
                      <td className="px-5 py-3 text-slate-400 italic text-xs">{m.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Result Summary Compact Box */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900 text-white p-5 rounded-xl shadow-sm gap-3 summary-box">
              <div className="text-center sm:text-left">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Marks</div>
                <div className="text-lg font-black text-indigo-300">{reportCard.total_marks}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">GPA</div>
                <div className="text-xl font-black text-emerald-400">{reportCard.gpa}</div>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Final Status</div>
                <div className={`text-xs font-bold px-3 py-1 rounded-lg mt-0.5 inline-block ${reportCard.status === 'Passed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                  {reportCard.status} ({reportCard.letter_grade})
                </div>
              </div>
            </div>

            {/* Signature Area */}
            <div className="pt-16 flex justify-between items-center text-center text-xs font-semibold text-slate-500">
              <div className="border-t-2 border-slate-300 pt-2 px-6">Class Teacher</div>
              <div className="border-t-2 border-slate-300 pt-2 px-6">Controller of Exams</div>
              <div className="border-t-2 border-slate-300 pt-2 px-6">Principal</div>
            </div>

          </div>
        )}

      </div>

      {/* 🖨️ Advanced Print Custom CSS */}
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background-color: white; }
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            border: none !important; 
            box-shadow: none !important; 
            padding: 0 !important; 
            background: white !important; 
          }
          .no-print { display: none !important; }
          .summary-box { background-color: #0f172a !important; color: white !important; border-radius: 0.75rem !important; }
        }
      `}</style>
    </AuthenticatedLayout>
  );
}