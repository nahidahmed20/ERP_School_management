import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function Results({ student, results }) {
    return <AuthenticatedLayout><Head title="My Exam Results"/><main className="space-y-5 py-4 sm:px-2 sm:py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-gradient-to-br from-emerald-950 to-emerald-800 p-6 text-white">
            <div><p className="text-xs font-bold uppercase tracking-wider text-amber-300">Student Result Account</p><h1 className="mt-2 text-2xl font-bold">{student.name}</h1><p className="mt-1 text-sm text-emerald-100">Student ID: {student.admission_no}</p></div>
            <div className="flex gap-2"><Link href={route('dashboard')} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold">Dashboard</Link><button onClick={()=>window.print()} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-emerald-950">Print</button></div>
        </div>
        {!results.length ? <div className="rounded-2xl border bg-white p-12 text-center"><Icon name="pencil" className="mx-auto h-8 w-8 text-slate-300"/><h2 className="mt-3 font-bold">কোনো published result নেই</h2><p className="mt-1 text-sm text-slate-500">School result publish করলে এখানে দেখা যাবে।</p></div> : results.map((result, index) => <section key={index} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="flex flex-wrap justify-between gap-3 border-b bg-slate-50 p-5"><div><h2 className="text-lg font-bold">{result.exam}</h2><p className="text-xs text-slate-500">Published result · {result.date || ''}</p></div><div className="flex gap-4 text-right"><div><p className="text-xs text-slate-500">Total</p><p className="font-black">{result.total}</p></div><div><p className="text-xs text-slate-500">GPA</p><p className="font-black">{result.gpa ?? '—'}</p></div><span className={`self-center rounded-full px-3 py-1 text-xs font-bold ${result.status==='Passed'?'bg-emerald-100 text-emerald-800':'bg-rose-100 text-rose-800'}`}>{result.status}</span></div></div>
            <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="bg-white text-left text-xs uppercase text-slate-500"><th className="p-4">Subject</th><th className="p-4 text-center">Marks</th><th className="p-4 text-center">Grade</th><th className="p-4 text-center">Grade Point</th><th className="p-4">Remarks</th></tr></thead><tbody>{result.marks.map((mark,i)=><tr key={i} className="border-t"><td className="p-4 font-semibold">{mark.subject}</td><td className="p-4 text-center font-black">{mark.marks ?? '—'}</td><td className="p-4 text-center">{mark.grade ?? '—'}</td><td className="p-4 text-center">{mark.grade_point ?? '—'}</td><td className="p-4 text-slate-500">{mark.note || '—'}</td></tr>)}</tbody></table></div>
        </section>)}
    </main></AuthenticatedLayout>;
}
