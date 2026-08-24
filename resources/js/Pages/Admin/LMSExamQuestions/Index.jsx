import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ExamQuestionFormModal from './Partials/ExamQuestionFormModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ examQuestions, exams, questions, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [examId, setExamId] = useState(filters.exam_id ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.lms.exam-questions.index'), {
      search, exam_id: examId, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  // Selected Exam Details
  const currentExam = exams.find(e => e.id == examId);

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!examQuestions.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Exam Name', 'Question', 'Type', 'Marks'];
    const rows = examQuestions.data.map(item => [
      item.exam?.title || 'N/A', 
      item.question?.question || 'N/A', 
      item.question?.question_type || 'N/A', 
      item.question?.marks || '0'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Exam_Questions_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!examQuestions.data.length) return;
    let text = "Exam Name\tQuestion\tType\tMarks\n";
    examQuestions.data.forEach(item => {
      text += `${item.exam?.title || '-'}\t${item.question?.question || '-'}\t${item.question?.question_type || '-'}\t${item.question?.marks || '0'}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Exam Questions" />

      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, aside, header, .no-print, button, a, select, input { display: none !important; }
          body, html { background: #f8fafc !important; }
          .print-table-wrapper { width: 100% !important; border: none !important; box-shadow: none !important; }
          .print-title { display: block !important; font-size: 24px !important; font-weight: bold !important; margin-bottom: 20px !important; }
        }
        @media screen { .print-title { display: none; } }
      `}} />

      <div className="print-title">Exam Questions Directory - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">LMS (Learning Management)</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Assign Exam Questions</h1>
            <p className="text-sm text-slate-500 mt-1">পরীক্ষার জন্য প্রশ্নব্যাংক থেকে প্রশ্ন যুক্ত ও পরিচালনা করুন।</p>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <Icon name="plus" className="w-4 h-4" /> Assign Question
          </button>
        </div>

        {/* Unified Modern Toolbar */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            
            {/* Per Page */}
            <select
              value={perPage}
              onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}
              className="appearance-none bg-none pr-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-center font-mono"
              style={{ backgroundImage: 'none' }}
            >
              <option value="10">10 / Page</option>
              <option value="20">20 / Page</option>
              <option value="50">50 / Page</option>
              <option value="all">All</option>
            </select>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            {/* Exam Filter */}
            <select 
              value={examId} 
              onChange={(e) => { setExamId(e.target.value); applyFilters({ exam_id: e.target.value }); }}
              className="w-full sm:w-64 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer truncate"
            >
              <option value="">-- All Exams --</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>

            {/* Apply Button */}
            <button
              onClick={() => applyFilters()}
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Filter
            </button>
          </div>

          {/* Export Actions (Fixed: All 5 Buttons Added) */}
          <div className="flex items-center justify-end gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl w-full xl:w-auto shadow-sm shrink-0 ml-auto">
            <button onClick={copyToClipboard} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Copy to Clipboard">
              Copy
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={exportToCSV} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export CSV">
              CSV
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend Excel plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export Excel">
              Excel
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend PDF plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export PDF">
              PDF
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Print List">
              Print
            </button>
          </div>
        </div>

        {/* Selected Exam Information Banner */}
        {examId && currentExam && (
          <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl shadow-sm flex items-center gap-4 animate-in fade-in duration-300">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <Icon name="info" className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Currently viewing questions for</p>
              <p className="text-base font-bold text-slate-800">
                {currentExam.title} <span className="font-medium text-slate-500 text-sm ml-2 border-l border-emerald-200 pl-2">Total Exam Marks: {currentExam.total_marks}</span>
              </p>
            </div>
          </div>
        )}

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 print-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">SL</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[40%]">Question</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Marks</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {examQuestions.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <Icon name="file-text" className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">এই পরীক্ষায় এখনো কোনো প্রশ্ন যুক্ত করা হয়নি।</p>
                      <p className="text-xs text-slate-400 mt-1">Try assigning a new question</p>
                    </td>
                  </tr>
                ) : (
                  examQuestions.data.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-500 font-mono">
                        {(examQuestions.from ?? 1) + index}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">{item.exam?.title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-700 line-clamp-2" title={item.question?.question}>
                          {item.question?.question}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-sky-50 text-sky-700 border border-sky-200">
                          {item.question?.question_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-emerald-700 font-mono">
                          {item.question?.marks}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <button 
                          onClick={() => setDeletingItem(item)} 
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                          title="Remove from Exam"
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="no-print border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
            <Pagination meta={examQuestions} />
          </div>
        </div>
      </div>

      {formOpen && <ExamQuestionFormModal exams={exams} questions={questions} defaultExamId={examId} onClose={() => setFormOpen(false)} />}

      {deletingItem && (
        <ConfirmDeleteModal 
          item={{ name: 'এক্সাম থেকে এই প্রশ্নটি' }} 
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => {
            router.delete(route('admin.lms.exam-questions.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }} 
        />
      )}
    </AuthenticatedLayout>
  );
}