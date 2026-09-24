import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import Icon from '@/Components/Icons';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

// --- Generate Question Paper Form Component ---
function GenerateForm({ classes, subjects, allQuestions, close }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    school_class_id: '',
    subject_id: '',
    exam_name: '',
    exam_date: new Date().toISOString().slice(0, 10),
    duration_minutes: 60,
    instructions: 'Answer all questions. Write clearly and show necessary working.',
    selection_type: 'manual', 
    question_count: 10,
    question_type: '',
    shuffle: true,
    question_ids: [] 
  });

  const availableSubjects = data.school_class_id 
    ? classes.find(c => c.id == data.school_class_id)?.subjects || []
    : [];

  const filteredQuestions = useMemo(() => {
    if (!data.school_class_id || !data.subject_id) return [];
    return allQuestions.filter(q => q.school_class_id == data.school_class_id && q.subject_id == data.subject_id);
  }, [data.school_class_id, data.subject_id, allQuestions]);

  const totalSelectedMarks = useMemo(() => {
    return data.question_ids.reduce((total, id) => {
      const q = allQuestions.find(x => x.id == id);
      return total + (q ? parseFloat(q.marks) : 0);
    }, 0);
  }, [data.question_ids, allQuestions]);

  const handleCheckboxChange = (id) => {
    let newSelection = [...data.question_ids];
    if (newSelection.includes(id)) {
      newSelection = newSelection.filter(item => item !== id);
    } else {
      newSelection.push(id);
    }
    setData('question_ids', newSelection);
  };

  const submit = e => {
    e.preventDefault();
    if (data.selection_type === 'manual' && data.question_ids.length === 0) {
      alert('অনুগ্রহ করে অন্তত একটি প্রশ্ন সিলেক্ট করুন!');
      return;
    }
    post(route('admin.lms.question-papers.store'), { 
      onSuccess: () => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Question Paper Generated!', showConfirmButton: false, timer: 3000 });
        close();
      }
    });
  };

  const input = 'mt-1 block w-full px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 text-sm focus:ring-emerald-500 focus:border-emerald-500';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm" onClick={close}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="max-h-[94vh] w-full max-w-4xl flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 flex justify-between items-start border-b border-slate-100 bg-slate-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Build Question Paper</h2>
            <p className="text-sm text-slate-500 mt-1">কাস্টম প্রশ্নপত্র তৈরি করুন এবং প্রিন্ট নিন।</p>
          </div>
          <button type="button" onClick={close} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-600 transition-colors">✕</button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">Class <span className="text-rose-500">*</span>
              <select value={data.school_class_id} onChange={e => setData({ ...data, school_class_id: e.target.value, subject_id: '', question_ids: [] })} className={input} required>
                <option value="">Select class</option>
                {classes.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </label>

            <label className="text-sm font-semibold text-slate-700">Subject <span className="text-rose-500">*</span>
              <select value={data.subject_id} onChange={e => setData({ ...data, subject_id: e.target.value, question_ids: [] })} className={input} required disabled={!data.school_class_id}>
                <option value="">{data.school_class_id ? "Select subject" : "Select Class First"}</option>
                {availableSubjects.map(x => <option key={x.id} value={x.id}>{x.name} {x.code && `(${x.code})`}</option>)}
              </select>
            </label>

            <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Examination Name <span className="text-rose-500">*</span>
              <input value={data.exam_name} onChange={e => setData('exam_name', e.target.value)} placeholder="e.g. Mid-Term Examination 2026" className={input} required />
            </label>

            <label className="text-sm font-semibold text-slate-700">Exam Date
              <input type="date" value={data.exam_date} onChange={e => setData('exam_date', e.target.value)} className={input} />
            </label>

            <label className="text-sm font-semibold text-slate-700">Duration (minutes) <span className="text-rose-500">*</span>
              <input type="number" min="5" value={data.duration_minutes} onChange={e => setData('duration_minutes', e.target.value)} className={input} required />
            </label>
          </div>

          <div className="bg-slate-100 p-1.5 rounded-xl flex gap-1 border border-slate-200">
            <button type="button" onClick={() => setData('selection_type', 'manual')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${data.selection_type === 'manual' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>
              <Icon name="check-square" className="inline-block w-4 h-4 mr-2" /> Manually Pick Questions
            </button>
            <button type="button" onClick={() => setData('selection_type', 'auto')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${data.selection_type === 'auto' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>
              <Icon name="zap" className="inline-block w-4 h-4 mr-2" /> Auto Generate Random
            </button>
          </div>

          {data.selection_type === 'manual' && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <label className="text-sm font-bold text-indigo-900 flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    onChange={(e) => setData('question_ids', e.target.checked ? filteredQuestions.map(q => q.id) : [])}
                    checked={filteredQuestions.length > 0 && data.question_ids.length === filteredQuestions.length}
                    className="w-5 h-5 text-indigo-600 rounded"
                  />
                  Select All Questions ({filteredQuestions.length})
                </label>
                
                <div className="bg-white border border-indigo-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2">
                  <span className="text-slate-500">Selected Total Marks:</span> 
                  <span className="text-emerald-600 text-lg">{totalSelectedMarks}</span> 
                </div>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto p-2 space-y-1 bg-slate-50 custom-scrollbar">
                {filteredQuestions.length === 0 ? (
                  <p className="text-slate-400 text-sm p-8 text-center italic">অনুগ্রহ করে আগে ক্লাস এবং সাবজেক্ট সিলেক্ট করুন।</p>
                ) : (
                  filteredQuestions.map(q => (
                    <label key={q.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      data.question_ids.includes(q.id) ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-transparent hover:border-slate-200'
                    }`}>
                      <input 
                        type="checkbox" 
                        checked={data.question_ids.includes(q.id)}
                        onChange={() => handleCheckboxChange(q.id)}
                        className="w-5 h-5 text-indigo-600 border-slate-300 rounded mt-0.5"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-2">{q.question}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{q.question_type}</span>
                          <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">{q.marks} Marks</span>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {data.selection_type === 'auto' && (
            <div className="grid gap-5 sm:grid-cols-2 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <label className="text-sm font-semibold text-slate-700">Number of Questions <span className="text-rose-500">*</span>
                <input type="number" min="1" max="200" value={data.question_count} onChange={e => setData('question_count', e.target.value)} className={input} />
              </label>

              <label className="text-sm font-semibold text-slate-700">Question Type
                <select value={data.question_type} onChange={e => setData('question_type', e.target.value)} className={input}>
                  <option value="">Mixed (All types)</option>
                  <option value="MCQ">Only MCQ</option>
                  <option value="True/False">Only True / False</option>
                </select>
              </label>
              
              <label className="flex items-center gap-3 text-sm font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl sm:col-span-2 cursor-pointer border border-emerald-200">
                <input type="checkbox" checked={data.shuffle} onChange={e => setData('shuffle', e.target.checked)} className="w-5 h-5 text-emerald-600 rounded" /> 
                Randomize questions from bank (Shuffle)
              </label>
            </div>
          )}

          <label className="text-sm font-semibold text-slate-700 block">Instructions for Students
            <textarea rows="2" value={data.instructions} onChange={e => setData('instructions', e.target.value)} className={input} />
          </label>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={close} className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button disabled={processing || (data.selection_type === 'manual' && data.question_ids.length === 0)} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-8 py-2.5 font-bold text-white shadow-md active:scale-95 transition-all">
            {processing ? 'Generating...' : 'Build Question Paper'}
          </button>
        </div>
      </form>
    </div>
  );
}

// --- Preview & Print Component ---
function Paper({ paper, site, close }) {
  const duration = `${Math.floor(paper.duration_minutes / 60) ? `${Math.floor(paper.duration_minutes / 60)} hour${Math.floor(paper.duration_minutes / 60) > 1 ? 's' : ''}` : ''}${paper.duration_minutes % 60 ? ` ${paper.duration_minutes % 60} minutes` : ''}`;
  
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/80 p-2 sm:p-6 backdrop-blur-sm">
      <style>{`
        @media print{
          body *{visibility:hidden}
          .question-paper, .question-paper *{visibility:visible}
          .question-paper{position:absolute!important;inset:0!important;width:100%!important;box-shadow:none!important;margin:0!important}
          .paper-actions{display:none!important}
          @page{size:A4;margin:14mm}
        }
      `}</style>
      
      <div className="paper-actions mx-auto mb-3 flex max-w-[210mm] justify-end gap-3 sticky top-2 z-10">
        <button onClick={close} className="rounded-xl bg-white border border-slate-300 px-5 py-2 font-bold text-slate-700 shadow-sm hover:bg-slate-50">Close</button>
        <button onClick={() => window.print()} className="rounded-xl bg-emerald-700 hover:bg-emerald-800 px-6 py-2 font-bold text-white shadow-md flex items-center gap-2">
          <Icon name="printer" className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      <article className="question-paper mx-auto min-h-[297mm] max-w-[210mm] bg-white p-8 sm:p-12 text-black shadow-2xl relative">
        <header className="border-b-2 border-black pb-4 text-center">
          {site?.logo && <img src={site.logo} className="mx-auto mb-2 h-16 max-w-24 object-contain" alt="Logo" />}
          <h1 className="text-3xl font-bold uppercase tracking-wide">{site?.school_name || 'School Name'}</h1>
          {site?.address && <p className="text-sm mt-1">{site.address}</p>}
          <h2 className="mt-4 text-xl font-bold uppercase underline underline-offset-4">{paper.exam_name}</h2>
          <p className="text-md mt-2 font-medium">Subject: <span className="font-bold">{paper.subject?.name}</span> &nbsp;&nbsp;|&nbsp;&nbsp; Class: <span className="font-bold">{paper.school_class?.name}</span></p>
        </header>
        
        <div className="my-4 flex flex-wrap justify-between border-b-2 border-black pb-4 text-base font-medium">
          <span>Date: <b>{paper.exam_date || '________________'}</b></span>
          <span>Time: <b>{duration}</b></span>
          <span>Full Marks: <b>{Number(paper.full_marks)}</b></span>
        </div>
        
        {paper.instructions && <div className="mb-6 border-2 border-black p-3 text-sm bg-gray-50 italic"><b>Instructions:</b> {paper.instructions}</div>}
        
        <ol className="space-y-6">
          {paper.questions.map((q, i) => (
            <li key={`${q.id}-${i}`} className="break-inside-avoid">
              <div className="flex gap-3">
                <b className="text-lg">{i + 1}.</b>
                <div className="flex-1">
                  <div className="flex justify-between gap-3">
                    <span className="text-base font-semibold leading-relaxed whitespace-pre-wrap">{q.question}</span>
                    <b className="whitespace-nowrap text-lg">[{q.marks}]</b>
                  </div>
                  {q.options?.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-base font-medium pl-2">
                      {q.options.map((o, j) => (
                        <span key={j}>({String.fromCharCode(97 + j)}) {o}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
        
        <footer className="mt-16 flex justify-between border-t border-black pt-8 text-sm font-bold">
          <span>Paper Code: {paper.paper_code}</span>
          <span>Examiner's Signature: __________________</span>
        </footer>
      </article>
    </div>
  );
}

// --- Main Index Page ---
export default function Index({ papers, classes, subjects, allQuestions, siteSettings, filters }) {
  const [form, setForm] = useState(false);
  const [preview, setPreview] = useState(null);
  
  // --- Delete Modal State যুক্ত করা হলো ---
  const [deletingItem, setDeletingItem] = useState(null);

  return (
    <AuthenticatedLayout>
      <Head title="Question Paper Generator" />
      <div className="space-y-6 py-8 sm:px-6 lg:px-8">
        
        <div className="flex flex-col justify-between gap-3 sm:flex-row items-start sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Question Bank System</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Question Paper Builder</h1>
            <p className="text-sm text-slate-500 mt-1">অফলাইন পরীক্ষার জন্য প্রশ্নব্যাংক থেকে পছন্দমতো প্রশ্ন সিলেক্ট করে প্রশ্নপত্র তৈরি করুন।</p>
          </div>
          <button onClick={() => setForm(true)} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 font-bold text-white shadow-md transition-all active:scale-95 flex items-center gap-2">
            <Icon name="plus" className="w-5 h-5" /> Build Question Paper
          </button>
        </div>
        
        <div className="relative">
          <input 
            defaultValue={filters.search || ''} 
            onKeyDown={e => e.key === 'Enter' && router.get(route('admin.lms.question-papers.index'), { search: e.currentTarget.value })} 
            placeholder="Search exam name or paper code and press Enter..." 
            className="w-full rounded-2xl border-slate-200 bg-white py-3 pl-4 pr-10 shadow-sm focus:ring-indigo-500"
          />
        </div>
        
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {papers.data.map(p => (
            <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <span className="rounded bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-bold text-indigo-700">{p.paper_code}</span>
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">{p.exam_date || 'No Date'}</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 truncate" title={p.exam_name}>{p.exam_name}</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">{p.school_class?.name} · {p.subject?.name}</p>
              
              <div className="mt-5 flex justify-between gap-4 border-y border-slate-100 py-3 text-sm">
                <div className="flex flex-col"><span className="text-slate-400 text-xs">Questions</span><b className="text-slate-800">{p.questions.length}</b></div>
                <div className="flex flex-col"><span className="text-slate-400 text-xs">Full Marks</span><b className="text-emerald-600">{Number(p.full_marks)}</b></div>
                <div className="flex flex-col"><span className="text-slate-400 text-xs">Duration</span><b className="text-slate-800">{p.duration_minutes}m</b></div>
              </div>
              
              <div className="mt-5 flex justify-end gap-3">
                {/* ডিলিট বাটন আপডেট করা হলো */}
                <button 
                  onClick={() => setDeletingItem(p)} 
                  className="text-sm font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg"
                >
                  Delete
                </button>
                <button onClick={() => setPreview(p)} className="text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 px-4 py-1.5 rounded-lg shadow-sm">Preview & Print</button>
              </div>
            </div>
          ))}
          {!papers.data.length && <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500 font-medium">No generated question papers found. Click the button above to build one.</div>}
        </div>
        
        <Pagination meta={papers} />
      </div>

      {form && <GenerateForm classes={classes} subjects={subjects} allQuestions={allQuestions} close={() => setForm(false)} />}
      {preview && <Paper paper={preview} site={siteSettings} close={() => setPreview(null)} />}

      {deletingItem && (
        <ConfirmDeleteModal 
          item={{ name: `প্রশ্নপত্র: ${deletingItem.exam_name}` }} 
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => {
            router.delete(route('admin.lms.question-papers.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }} 
        />
      )}
    </AuthenticatedLayout>
  );
}