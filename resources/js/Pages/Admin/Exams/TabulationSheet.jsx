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

  return (
    <AuthenticatedLayout header={
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-100 px-2 py-1 rounded-md">Examinations</span>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-2">Tabulation Sheet</h1>
        </div>
        {tabulationData.length > 0 && (
          <button onClick={handlePrint} className="no-print flex items-center gap-2 py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all">
            <Icon name="printer" className="w-5 h-5" />
            Print Sheet
          </button>
        )}
      </div>
    }>
      <Head title="Tabulation Sheet" />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* 🎛️ Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 no-print">
          <form onSubmit={searchSheet} className="flex flex-wrap gap-5 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-bold text-gray-700">Exam *</label>
              <select value={data.exam_id} onChange={e => setData('exam_id', e.target.value)} required className="w-full mt-1 rounded-lg border-gray-300 bg-gray-50 focus:bg-white shadow-sm">
                <option value="">-- Select Exam --</option>
                {exams?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-bold text-gray-700">Class *</label>
              <select value={data.class_id} onChange={handleClassChange} required className="w-full mt-1 rounded-lg border-gray-300 bg-gray-50 focus:bg-white shadow-sm">
                <option value="">-- Select Class --</option>
                {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-bold text-gray-700">Section *</label>
              <select value={data.section_id} onChange={handleSectionChange} required disabled={!data.class_id} className="w-full mt-1 rounded-lg border-gray-300 bg-gray-50 focus:bg-white shadow-sm disabled:opacity-50">
                <option value="">-- Select Section --</option>
                {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="flex-shrink-0">
              <button type="submit" disabled={processing} className="px-6 py-2.5 rounded-lg shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all flex items-center gap-2">
                <Icon name="search" className="w-4 h-4" /> Generate Sheet
              </button>
            </div>
          </form>
        </div>

        {/* 📊 Printable Tabulation Sheet */}
        {tabulationData.length > 0 && (
          <div className="printable-area bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">

            {/* Header for Print */}
            <div className="text-center mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-black text-slate-900">IDEAL SCHOOL & COLLEGE</h2>
              <p className="text-sm text-gray-600 font-bold uppercase tracking-wider mt-1">Master Tabulation Sheet</p>
              <div className="flex justify-center gap-4 mt-3 text-sm font-bold text-indigo-700">
                <span>Exam: {selectedExam?.name}</span>
                <span>•</span>
                <span>Class: {selectedClass?.name}</span>
                <span>•</span>
                <span>Section: {selectedSection?.name}</span>
              </div>
            </div>

            {/* Grid Table */}
            <div className="overflow-x-auto print-overflow-visible">
              <table className="min-w-full divide-y divide-gray-300 border border-gray-300 text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-3 border-r border-gray-300 text-center font-extrabold text-slate-700 w-16">Roll</th>
                    <th className="px-4 py-3 border-r border-gray-300 text-left font-extrabold text-slate-700 min-w-[150px]">Student Name</th>

                    {/* Dynamic Subject Headers */}
                    {subjects.map(sub => (
                      <th key={sub.id} className="px-3 py-3 border-r border-gray-300 text-center font-extrabold text-slate-700 whitespace-nowrap min-w-[80px]">
                        <div className="truncate max-w-[100px]" title={sub.name}>{sub.name}</div>
                      </th>
                    ))}

                    <th className="px-3 py-3 border-r border-gray-300 text-center font-extrabold text-slate-700">Total</th>
                    <th className="px-3 py-3 border-r border-gray-300 text-center font-extrabold text-slate-700">GPA</th>
                    <th className="px-3 py-3 border-r border-gray-300 text-center font-extrabold text-slate-700">Grade</th>
                    <th className="px-3 py-3 text-center font-extrabold text-slate-700">Result</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tabulationData.map((student, idx) => (
                    <tr key={student.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-3 py-2 border-r border-gray-300 text-center font-bold text-gray-700">
                        {student.roll_no === 9999 ? '--' : student.roll_no}
                      </td>
                      <td className="px-4 py-2 border-r border-gray-300">
                        <div className="font-bold text-gray-900">{student.name}</div>
                        <div className="text-[10px] text-gray-500">Adm: {student.admission_no}</div>
                      </td>

                      {/* Marks Cells */}
                      {subjects.map(sub => {
                        const mark = student.marks[sub.id];
                        return (
                          <td key={sub.id} className="px-2 py-2 border-r border-gray-300 text-center">
                            {mark ? (
                              <>
                                <div className={`font-extrabold ${mark.grade === 'F' ? 'text-rose-600' : 'text-indigo-600'}`}>
                                  {mark.obtained}
                                </div>
                                <div className={`text-[10px] font-bold ${mark.grade === 'F' ? 'text-rose-500' : 'text-slate-500'}`}>
                                  {mark.grade} ({mark.point})
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-300 font-bold">A</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="px-3 py-2 border-r border-gray-300 text-center font-black text-slate-700">{student.total_marks}</td>
                      <td className="px-3 py-2 border-r border-gray-300 text-center font-black text-emerald-600">{student.gpa}</td>
                      <td className="px-3 py-2 border-r border-gray-300 text-center font-black">{student.grade}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${student.status === 'Passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Print Signatures */}
            <div className="hidden print:flex justify-between items-end mt-16 text-sm font-bold text-gray-500">
              <div className="border-t-2 border-gray-400 pt-1 px-4">Class Teacher</div>
              <div className="border-t-2 border-gray-400 pt-1 px-4">Exam Controller</div>
              <div className="border-t-2 border-gray-400 pt-1 px-4">Headmaster</div>
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
