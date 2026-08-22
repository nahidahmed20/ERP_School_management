import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

export default function TabulationSheet({ exams, classes, subjects, tabulationData, filters }) {
  const { data, setData, get, processing } = useForm({
    exam_id: filters?.exam_id || '',
    class_id: filters?.class_id || '',
    section_id: filters?.section_id || '',
  });

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setData(prev => ({ ...prev, class_id: classId, section_id: '' }));
    router.get(route('admin.exams.tabulation'), { exam_id: data.exam_id, class_id: classId }, { preserveState: true });
  };

  const handleSectionChange = (e) => {
    const sectionId = e.target.value;
    setData(prev => ({ ...prev, section_id: sectionId }));
    router.get(route('admin.exams.tabulation'), { exam_id: data.exam_id, class_id: data.class_id, section_id: sectionId }, { preserveState: true });
  };

  const searchSheet = (e) => {
    e.preventDefault();
    get(route('admin.exams.tabulation'), { preserveState: true });
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedClass = classes?.find(c => c.id == data.class_id);
  const selectedExam = exams?.find(e => e.id == data.exam_id);
  const selectedSection = selectedClass?.sections?.find(s => s.id == data.section_id);

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">Examinations</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Tabulation Sheet</h1>
            <p className="text-sm text-slate-500 mt-1">শ্রেণি ও সেকশনভিত্তিক মাস্টার টাবুলেশন শিট বা গ্রেডশিট তৈরি করুন।</p>
          </div>
          {tabulationData.length > 0 && (
            <button onClick={handlePrint} className="no-print inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95">
              <Icon name="printer" className="w-4 h-4" />
              Print Sheet
            </button>
          )}
        </div>
      }
    >
      <Head title="Tabulation Sheet" />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">

        {/* 🎛️ Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 no-print border-t-4 border-t-indigo-600">
          <form onSubmit={searchSheet} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
            
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
              <label className={labelClass}>Section <span className="text-rose-500">*</span></label>
              <select value={data.section_id} onChange={handleSectionChange} required disabled={!data.class_id} className={inputClass}>
                <option value="" disabled>-- Select Section --</option>
                {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <button type="submit" disabled={processing} className="w-full px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 h-[42px] disabled:opacity-70">
                <Icon name="search" className="w-4 h-4" /> {processing ? 'Loading...' : 'Generate Sheet'}
              </button>
            </div>
            
          </form>
        </div>

        {/* 📊 Printable Tabulation Sheet */}
        {tabulationData.length > 0 && (
          <div className="printable-area bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 p-6 sm:p-8 relative overflow-hidden">

            {/* Header for Print */}
            <div className="text-center mb-6 border-b border-slate-200 pb-5 space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-wide">IDEAL SCHOOL & COLLEGE</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Master Tabulation Sheet</p>
              <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs font-bold text-indigo-700">
                <span className="bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">Exam: {selectedExam?.name}</span>
                <span className="bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">Class: {selectedClass?.name}</span>
                <span className="bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">Section: {selectedSection?.name}</span>
              </div>
            </div>

            {/* Grid Table */}
            <div className="overflow-x-auto print-overflow-visible">
              <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-3.5 border-r border-slate-200 text-center font-bold text-slate-600 uppercase w-16">Roll</th>
                    <th className="px-4 py-3.5 border-r border-slate-200 text-left font-bold text-slate-600 uppercase min-w-[150px]">Student Name</th>

                    {/* Dynamic Subject Headers */}
                    {subjects.map(sub => (
                      <th key={sub.id} className="px-2 py-3.5 border-r border-slate-200 text-center font-bold text-slate-600 uppercase whitespace-nowrap min-w-[75px]">
                        <div className="truncate max-w-[90px]" title={sub.name}>{sub.name}</div>
                      </th>
                    ))}

                    <th className="px-3 py-3.5 border-r border-slate-200 text-center font-bold text-slate-600 uppercase">Total</th>
                    <th className="px-3 py-3.5 border-r border-slate-200 text-center font-bold text-slate-600 uppercase">GPA</th>
                    <th className="px-3 py-3.5 border-r border-slate-200 text-center font-bold text-slate-600 uppercase">Grade</th>
                    <th className="px-3 py-3.5 text-center font-bold text-slate-600 uppercase">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {tabulationData.map((student, idx) => (
                    <tr key={student.id} className={`hover:bg-slate-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                      <td className="px-3 py-2.5 border-r border-slate-200 text-center font-bold text-slate-700">
                        {student.roll_no === 9999 ? '--' : student.roll_no}
                      </td>
                      <td className="px-4 py-2.5 border-r border-slate-200">
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">Adm: {student.admission_no}</div>
                      </td>

                      {/* Marks Cells */}
                      {subjects.map(sub => {
                        const mark = student.marks[sub.id];
                        return (
                          <td key={sub.id} className="px-1 py-2 border-r border-slate-200 text-center">
                            {mark ? (
                              <>
                                <div className={`font-bold text-xs ${mark.grade === 'F' ? 'text-rose-600' : 'text-slate-800'}`}>
                                  {mark.obtained}
                                </div>
                                <div className={`text-[10px] font-semibold ${mark.grade === 'F' ? 'text-rose-500' : 'text-slate-400'}`}>
                                  {mark.grade} ({mark.point})
                                </div>
                              </>
                            ) : (
                              <span className="text-slate-300 font-bold">—</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="px-3 py-2.5 border-r border-slate-200 text-center font-extrabold text-slate-800">{student.total_marks}</td>
                      <td className="px-3 py-2.5 border-r border-slate-200 text-center font-extrabold text-emerald-600">{student.gpa}</td>
                      <td className="px-3 py-2.5 border-r border-slate-200 text-center font-black">{student.grade}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${student.status === 'Passed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Print Signatures */}
            <div className="hidden print:flex justify-between items-end mt-16 text-xs font-semibold text-slate-500">
              <div className="border-t-2 border-slate-400 pt-1.5 px-6">Class Teacher</div>
              <div className="border-t-2 border-slate-400 pt-1.5 px-6">Exam Controller</div>
              <div className="border-t-2 border-slate-400 pt-1.5 px-6">Headmaster / Principal</div>
            </div>

          </div>
        )}

      </div>

      {/* 🖨️ Landscape Print CSS */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { background-color: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area {
            position: absolute; left: 0; top: 0; width: 100%;
            border: none !important; box-shadow: none !important; padding: 0 !important;
          }
          .no-print { display: none !important; }
          .print-overflow-visible { overflow: visible !important; }
        }
      `}</style>
    </AuthenticatedLayout>
  );
}