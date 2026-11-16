import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function OnlineExam({exam}) {
 const started=useMemo(()=>new Date(exam.started_at).getTime(),[exam.started_at]);
 const [left,setLeft]=useState(Math.max(0,exam.duration*60-Math.floor((Date.now()-started)/1000)));
 const form=useForm({answers:{}});
 const submit=()=>form.post(route('portal.exams.submit',exam.id));
 useEffect(()=>{const timer=setInterval(()=>setLeft(v=>{if(v<=1){clearInterval(timer);submit();return 0}return v-1}),1000);return()=>clearInterval(timer)},[]);
 return <AuthenticatedLayout><Head title={exam.title}/><main className="space-y-4 py-4 sm:px-2"><div className="sticky top-0 z-10 flex justify-between rounded-2xl bg-emerald-950 p-4 text-white"><div><h1 className="font-bold">{exam.title}</h1><p className="text-xs text-emerald-200">{exam.subject} · Total {exam.total_marks}</p></div><div className="text-right"><p className="text-xs">Time remaining</p><strong className="text-xl">{String(Math.floor(left/60)).padStart(2,'0')}:{String(left%60).padStart(2,'0')}</strong></div></div>
 {exam.questions.map((q,i)=><section key={q.id} className="rounded-2xl border bg-white p-5"><p className="font-bold">{i+1}. {q.question} <span className="text-xs text-slate-400">({q.marks} marks)</span></p>{Object.keys(q.options).length?<div className="mt-3 grid gap-2">{Object.entries(q.options).map(([key,value])=><label key={key} className="flex gap-2 rounded-lg border p-3"><input type="radio" name={`q-${q.id}`} value={key} onChange={e=>form.setData('answers',{...form.data.answers,[q.id]:e.target.value})}/><span>{key.toUpperCase()}. {value}</span></label>)}</div>:<textarea onChange={e=>form.setData('answers',{...form.data.answers,[q.id]:e.target.value})} className="mt-3 w-full rounded-lg border-slate-300" rows="4" placeholder="Write your answer"/>}</section>)}
 <button disabled={form.processing||left===0} onClick={submit} className="w-full rounded-xl bg-emerald-800 p-3 font-bold text-white">Submit Exam</button></main></AuthenticatedLayout>;
}
