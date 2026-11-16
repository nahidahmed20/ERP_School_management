import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import Icon from '@/Components/Icons';

const types = { promotion: 'Staff Promotion', pf: 'Provident Fund (PF)', gf: 'Gratuity Fund (GF)', class_performance: 'Class Performance', training: 'Teacher Training', certification: 'Certification', award: 'Award / Recognition', disciplinary: 'Disciplinary Record', transfer: 'Transfer / Posting' };
const empty = { staff_id: '', record_type: 'promotion', record_date: new Date().toISOString().slice(0,10), title: '', period: '', employee_amount: 0, employer_amount: 0, rating: '', status: 'draft', details: {}, notes: '' };

function RecordForm({ item, staffList, close }) {
  const { data, setData, post, put, processing, errors } = useForm(item ? { ...empty, ...item, record_date: item.record_date?.slice(0,10), details: item.details || {} } : empty);
  const submit = e => { e.preventDefault(); const done = { onSuccess: close, preserveScroll: true }; item ? put(route('admin.staff-hr-records.update', item.id), done) : post(route('admin.staff-hr-records.store'), done); };
  const fund = ['pf','gf'].includes(data.record_type);
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3" onClick={close}><form onSubmit={submit} onClick={e=>e.stopPropagation()} className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex justify-between"><div><h2 className="text-xl font-bold">{item ? 'Edit' : 'Add'} HR Record</h2><p className="text-sm text-slate-500">Promotion, fund, performance or training record</p></div><button type="button" onClick={close}>✕</button></div><div className="grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-semibold">Staff<select value={data.staff_id} onChange={e=>setData('staff_id',e.target.value)} className="mt-1 w-full rounded-xl border-slate-200"><option value="">Select staff</option>{staffList.map(s=><option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.staff_id_no})</option>)}</select>{errors.staff_id&&<small className="text-rose-600">{errors.staff_id}</small>}</label>
    <label className="text-sm font-semibold">Record type<select value={data.record_type} onChange={e=>setData('record_type',e.target.value)} className="mt-1 w-full rounded-xl border-slate-200">{Object.entries(types).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
    <label className="text-sm font-semibold">Date<input type="date" value={data.record_date} onChange={e=>setData('record_date',e.target.value)} className="mt-1 w-full rounded-xl border-slate-200" /></label>
    <label className="text-sm font-semibold">Title<input value={data.title} onChange={e=>setData('title',e.target.value)} placeholder="Course / promotion / evaluation title" className="mt-1 w-full rounded-xl border-slate-200" />{errors.title&&<small className="text-rose-600">{errors.title}</small>}</label>
    <label className="text-sm font-semibold">Period<input value={data.period||''} onChange={e=>setData('period',e.target.value)} placeholder="e.g. 2026 or Jan–Jun" className="mt-1 w-full rounded-xl border-slate-200" /></label>
    <label className="text-sm font-semibold">Status<select value={data.status} onChange={e=>setData('status',e.target.value)} className="mt-1 w-full rounded-xl border-slate-200">{['draft','pending','approved','completed','cancelled'].map(x=><option key={x}>{x}</option>)}</select></label>
    {fund && <><label className="text-sm font-semibold">Employee contribution<input type="number" min="0" step=".01" value={data.employee_amount} onChange={e=>setData('employee_amount',e.target.value)} className="mt-1 w-full rounded-xl border-slate-200" /></label><label className="text-sm font-semibold">Employer contribution<input type="number" min="0" step=".01" value={data.employer_amount} onChange={e=>setData('employer_amount',e.target.value)} className="mt-1 w-full rounded-xl border-slate-200" /></label></>}
    {data.record_type==='class_performance' && <label className="text-sm font-semibold">Performance score (%)<input type="number" min="0" max="100" value={data.rating} onChange={e=>setData('rating',e.target.value)} className="mt-1 w-full rounded-xl border-slate-200" /></label>}
    <label className="text-sm font-semibold sm:col-span-2">Notes<textarea rows="3" value={data.notes||''} onChange={e=>setData('notes',e.target.value)} className="mt-1 w-full rounded-xl border-slate-200" /></label>
  </div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={close} className="rounded-xl border px-5 py-2.5">Cancel</button><button disabled={processing} className="rounded-xl bg-emerald-800 px-6 py-2.5 font-semibold text-white">Save Record</button></div></form></div>;
}

export default function Index({ records, staffList, filters, summary }) {
  const [form, setForm] = useState(false);
  const [edit, setEdit] = useState(null);
  const [search, setSearch] = useState(filters.search || '');
  const filter = (key, value) => router.get(
    route('admin.staff-hr-records.index'),
    { ...filters, [key]: value },
    { preserveState: true, replace: true }
  );

  const statusClass = status => (
    status === 'approved' || status === 'completed'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'cancelled'
        ? 'bg-rose-50 text-rose-700'
        : 'bg-amber-50 text-amber-700'
  );

  return (
    <AuthenticatedLayout>
      <Head title="Teacher & Staff HR" />
      <div className="w-full space-y-5 px-3 py-4 sm:space-y-6 sm:px-5 sm:py-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-5 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">People · Teacher HR</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Teacher &amp; Staff Development</h1>
            <p className="mt-1 text-sm text-slate-600">Promotion, PF/GF, class performance and training records.</p>
          </div>
          <button onClick={() => { setEdit(null); setForm(true); }} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 sm:w-auto">
            <Icon name="plus" className="h-4 w-4" /> Add HR Record
          </button>
        </header>

        <section aria-label="HR record summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Object.entries(types).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={filters.type === key}
              onClick={() => filter('type', filters.type === key ? '' : key)}
              className={'group rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ' + (filters.type === key ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-700/10' : 'border-slate-200 bg-white hover:border-emerald-200')}
            >
              <span className="block text-2xl font-black tracking-tight text-slate-900">{summary[key] || 0}</span>
              <span className="mt-1 block text-xs font-semibold text-slate-500 group-hover:text-emerald-800">{label}</span>
            </button>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-700">Record directory</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Search and filter staff records</h2>
          </div>
          <form onSubmit={e => { e.preventDefault(); filter('search', search); }} className="grid grid-cols-1 items-end gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 lg:col-span-2">
              Search records
              <span className="relative mt-1.5 block">
                <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff name or record title..." className="block min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20" />
              </span>
            </label>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Staff member
              <select value={filters.staff_id || ''} onChange={e => filter('staff_id', e.target.value)} className="mt-1.5 block min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20">
                <option value="">All staff</option>
                {staffList.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
              </select>
            </label>
            <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900">
              <Icon name="filter" className="h-4 w-4" /> Apply filters
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Development records</h2>
              <p className="mt-0.5 text-xs text-slate-500">Promotions, funds, performance and training history</p>
            </div>
            <span className="self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 sm:self-auto">{records.total ?? records.data.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>{['Date', 'Staff', 'Type / Title', 'Financial / Score', 'Status', 'Actions'].map(x => <th key={x} className="px-5 py-4">{x}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.data.map(r => (
                  <tr key={r.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{r.record_date}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">{r.staff?.first_name} {r.staff?.last_name}<small className="mt-0.5 block text-slate-400">{r.staff?.staff_id_no}</small></td>
                    <td className="px-5 py-4"><b className="text-slate-800">{types[r.record_type]}</b><small className="mt-0.5 block text-slate-500">{r.title}</small></td>
                    <td className="px-5 py-4 font-medium text-slate-700">{['pf', 'gf'].includes(r.record_type) ? '৳ ' + (Number(r.employee_amount) + Number(r.employer_amount)) : r.rating ? r.rating + '%' : '—'}</td>
                    <td className="px-5 py-4"><span className={'inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ' + statusClass(r.status)}>{r.status}</span></td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                        <button onClick={() => { setEdit(r); setForm(true); }} className="rounded-lg px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-white hover:shadow-sm">Edit</button>
                        <button onClick={() => confirm('Delete this record?') && router.delete(route('admin.staff-hr-records.destroy', r.id))} className="rounded-lg px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-white hover:shadow-sm">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!records.data.length && <tr><td colSpan="6" className="p-10 text-center text-slate-500">No HR records found.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 p-4 sm:px-6"><Pagination meta={records} /></div>
        </section>
      </div>
      {form && <RecordForm item={edit} staffList={staffList} close={() => setForm(false)} />}
    </AuthenticatedLayout>
  );
}