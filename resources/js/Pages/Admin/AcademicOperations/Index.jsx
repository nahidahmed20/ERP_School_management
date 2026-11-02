import { useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

const Field = ({ label, children }) => <label className="block min-w-0 text-xs font-bold text-slate-600">{label}{children}</label>;
const Input = props => <input {...props} className="mt-1.5 w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15" />;
const Select = ({ children, ...props }) => <select {...props} className="mt-1.5 w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15">{children}</select>;
const Card = ({ title, icon = 'grid', children }) => <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
  <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 via-white to-white px-5 py-4">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><Icon name={icon} className="h-5 w-5" /></span>
    <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
  </div>
  <div className="flex-1 p-5">{children}</div>
</section>;
const Button = ({ children }) => <button className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/30">{children}</button>;

export default function Index({ assignments, topics, diaries, substitutions, meetings, transfers, sessions, classes, subjects, staff, students }) {
  const { flash } = usePage().props;

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
  }, [flash]);

  const a = useForm({ staff_id: '', class_id: '', section_id: '', subject_id: '', is_class_teacher: false });
  const t = useForm({ academic_session_id: '', class_id: '', section_id: '', subject_id: '', title: '', planned_date: '' });
  const d = useForm({ date: new Date().toISOString().slice(0, 10), class_id: '', section_id: '', subject_id: '', teacher_id: '', topic: '', homework: '', notes: '' });
  const s = useForm({ date: new Date().toISOString().slice(0, 10), class_id: '', section_id: '', subject_id: '', absent_teacher_id: '', substitute_teacher_id: '', start_time: '', end_time: '', reason: '' });
  const m = useForm({ student_id: '', teacher_id: '', scheduled_at: '', agenda: '', notes: '' });
  const x = useForm({ student_id: '', type: 'transfer', effective_date: new Date().toISOString().slice(0, 10), reason: '', destination_school: '' });

  const opts = (items, label, placeholder = 'Select') => <><option value="">{placeholder}</option>{items.map(i => <option key={i.id} value={i.id}>{label(i)}</option>)}</>;
  const sections = (classId) => classes.find(c => String(c.id) === String(classId))?.sections || [];
  
  const submit = (form, url) => e => { 
    e.preventDefault(); 
    form.post(route(url), { preserveScroll: true, onSuccess: () => form.reset() }); 
  };

  const Summary = ({ rows, render }) => <div className="mt-4 max-h-48 overflow-auto divide-y text-sm">{rows.length ? rows.map(render) : <p className="py-3 text-slate-500">No records yet.</p>}</div>;

  return (
    <AuthenticatedLayout>
      <Head title="Academic Operations" />
      <div className="w-full max-w-none space-y-6 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-5 py-6 shadow-sm sm:px-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">Academics / Operations</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Academic Operations</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Manage teacher assignments, syllabus progress, class diaries, substitutions, parent meetings and student transfers from one place.</p>
        </div>
        
        <div className="grid items-start gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {/* Teacher Assignment */}
          <Card title="Teacher Assignment" icon="user">
            <form onSubmit={submit(a, 'admin.academic-operations.assignment')} className="grid grid-cols-2 gap-3">
              <Field label="Teacher"><Select value={a.data.staff_id} onChange={e => a.setData('staff_id', e.target.value)} required>{opts(staff, i => `${i.first_name} ${i.last_name || ''}`)}</Select></Field>
              <Field label="Class"><Select value={a.data.class_id} onChange={e => a.setData({ ...a.data, class_id: e.target.value, section_id: '' })} required>{opts(classes, i => i.name)}</Select></Field>
              <Field label="Section (optional)"><Select value={a.data.section_id} onChange={e => a.setData('section_id', e.target.value)}>{opts(sections(a.data.class_id), i => i.name, 'No section')}</Select></Field>
              <Field label="Subject"><Select value={a.data.subject_id} onChange={e => a.setData('subject_id', e.target.value)} required>{opts(subjects, i => i.name)}</Select></Field>
              <label className="col-span-2 flex gap-2 text-sm"><input type="checkbox" checked={a.data.is_class_teacher} onChange={e => a.setData('is_class_teacher', e.target.checked)} /> Class teacher</label>
              <Button>Save assignment</Button>
            </form>
            <Summary rows={assignments} render={r => <div key={r.id} className="py-2">{r.staff?.first_name} — {r.school_class?.name} / {r.section?.name} / {r.subject?.name}</div>} />
          </Card>

          {/* Syllabus Progress */}
          <Card title="Syllabus Progress" icon="book">
            <form onSubmit={submit(t, 'admin.academic-operations.topic')} className="grid grid-cols-2 gap-3">
              <Field label="Session"><Select value={t.data.academic_session_id} onChange={e => t.setData('academic_session_id', e.target.value)} required>{opts(sessions, i => i.name)}</Select></Field>
              <Field label="Class"><Select value={t.data.class_id} onChange={e => t.setData({ ...t.data, class_id: e.target.value, section_id: '' })} required>{opts(classes, i => i.name)}</Select></Field>
              <Field label="Section (optional)"><Select value={t.data.section_id} onChange={e => t.setData('section_id', e.target.value)}>{opts(sections(t.data.class_id), i => i.name)}</Select></Field>
              <Field label="Subject"><Select value={t.data.subject_id} onChange={e => t.setData('subject_id', e.target.value)} required>{opts(subjects, i => i.name)}</Select></Field>
              <Field label="Topic"><Input value={t.data.title} onChange={e => t.setData('title', e.target.value)} required /></Field>
              <Field label="Planned date"><Input type="date" value={t.data.planned_date} onChange={e => t.setData('planned_date', e.target.value)} /></Field>
              <Button>Add topic</Button>
            </form>
            <Summary rows={topics} render={r => <div key={r.id} className="flex items-center justify-between py-2"><span>{r.title} <b className="text-indigo-600">{r.status}</b></span><button onClick={() => router.patch(route('admin.academic-operations.topic-status', r.id), { status: r.status === 'planned' ? 'in_progress' : 'completed' })} className="text-indigo-600">Advance</button></div>} />
          </Card>

          {/* Class Diary */}
          <Card title="Class Diary" icon="edit">
            <form onSubmit={submit(d, 'admin.academic-operations.diary')} className="grid grid-cols-2 gap-3">
              <Field label="Date"><Input type="date" value={d.data.date} onChange={e => d.setData('date', e.target.value)} required /></Field>
              <Field label="Teacher"><Select value={d.data.teacher_id} onChange={e => d.setData('teacher_id', e.target.value)} required>{opts(staff, i => i.first_name)}</Select></Field>
              <Field label="Class"><Select value={d.data.class_id} onChange={e => d.setData({ ...d.data, class_id: e.target.value, section_id: '' })} required>{opts(classes, i => i.name)}</Select></Field>
              <Field label="Section (optional)"><Select value={d.data.section_id} onChange={e => d.setData('section_id', e.target.value)}>{opts(sections(d.data.class_id), i => i.name, 'No section')}</Select></Field>
              <Field label="Subject"><Select value={d.data.subject_id} onChange={e => d.setData('subject_id', e.target.value)}>{opts(subjects, i => i.name)}</Select></Field>
              <Field label="Topic taught"><Input value={d.data.topic} onChange={e => d.setData('topic', e.target.value)} required /></Field>
              <Field label="Homework"><Input value={d.data.homework} onChange={e => d.setData('homework', e.target.value)} /></Field>
              <div><Button>Save diary</Button></div>
            </form>
            <Summary rows={diaries} render={r => <div key={r.id} className="py-2">{r.date} — {r.topic}{r.homework && ` · Homework: ${r.homework}`}</div>} />
          </Card>

          {/* Substitute Class */}
          <Card title="Substitute Class" icon="refresh">
            <form onSubmit={submit(s, 'admin.academic-operations.substitution')} className="grid grid-cols-2 gap-3">
              <Field label="Date"><Input type="date" value={s.data.date} onChange={e => s.setData('date', e.target.value)} required /></Field>
              <Field label="Class"><Select value={s.data.class_id} onChange={e => s.setData({ ...s.data, class_id: e.target.value, section_id: '' })} required>{opts(classes, i => i.name)}</Select></Field>
              <Field label="Section (optional)"><Select value={s.data.section_id} onChange={e => s.setData('section_id', e.target.value)}>{opts(sections(s.data.class_id), i => i.name, 'No section')}</Select></Field>
              <Field label="Subject"><Select value={s.data.subject_id} onChange={e => s.setData('subject_id', e.target.value)}>{opts(subjects, i => i.name)}</Select></Field>
              <Field label="Absent teacher"><Select value={s.data.absent_teacher_id} onChange={e => s.setData('absent_teacher_id', e.target.value)} required>{opts(staff, i => i.first_name)}</Select></Field>
              <Field label="Substitute teacher"><Select value={s.data.substitute_teacher_id} onChange={e => s.setData('substitute_teacher_id', e.target.value)} required>{opts(staff, i => i.first_name)}</Select></Field>
              <Field label="Start"><Input type="time" value={s.data.start_time} onChange={e => s.setData('start_time', e.target.value)} /></Field>
              <Field label="End"><Input type="time" value={s.data.end_time} onChange={e => s.setData('end_time', e.target.value)} /></Field>
              <div><Button>Assign</Button></div>
            </form>
            <Summary rows={substitutions} render={r => <div key={r.id} className="py-2">{r.date} · Teacher #{r.absent_teacher_id} → #{r.substitute_teacher_id}</div>} />
          </Card>

          {/* Parent–Teacher Meeting */}
          <Card title="Parent–Teacher Meeting" icon="users">
            <form onSubmit={submit(m, 'admin.academic-operations.meeting')} className="grid grid-cols-2 gap-3">
              <Field label="Student"><Select value={m.data.student_id} onChange={e => m.setData('student_id', e.target.value)} required>{opts(students, i => `${i.admission_no} — ${i.first_name}`)}</Select></Field>
              <Field label="Teacher"><Select value={m.data.teacher_id} onChange={e => m.setData('teacher_id', e.target.value)} required>{opts(staff, i => i.first_name)}</Select></Field>
              <Field label="Schedule"><Input type="datetime-local" value={m.data.scheduled_at} onChange={e => m.setData('scheduled_at', e.target.value)} required /></Field>
              <Field label="Agenda"><Input value={m.data.agenda} onChange={e => m.setData('agenda', e.target.value)} required /></Field>
              <div><Button>Schedule</Button></div>
            </form>
            <Summary rows={meetings} render={r => <div key={r.id} className="flex justify-between py-2"><span>{r.requested_at} · {r.agenda}</span><button className="text-emerald-600" onClick={() => router.patch(route('admin.academic-operations.meeting-status', r.id), { status: 'completed' })}>Complete</button></div>} />
          </Card>

          {/* Transfer / Withdrawal */}
          <Card title="Transfer / Withdrawal" icon="arrow-right">
            <form onSubmit={submit(x, 'admin.academic-operations.transfer')} className="grid grid-cols-2 gap-3">
              <Field label="Student"><Select value={x.data.student_id} onChange={e => x.setData('student_id', e.target.value)} required>{opts(students, i => `${i.admission_no} — ${i.first_name}`)}</Select></Field>
              <Field label="Type"><Select value={x.data.type} onChange={e => x.setData('type', e.target.value)}><option value="transfer">Transfer</option><option value="withdrawal">Withdrawal</option></Select></Field>
              <Field label="Effective date"><Input type="date" value={x.data.effective_date} onChange={e => x.setData('effective_date', e.target.value)} required /></Field>
              <Field label="Destination school"><Input value={x.data.destination_school} onChange={e => x.setData('destination_school', e.target.value)} /></Field>
              <Field label="Reason"><Input value={x.data.reason} onChange={e => x.setData('reason', e.target.value)} required /></Field>
              <div><Button>Create request</Button></div>
            </form>
            <Summary rows={transfers} render={r => <div key={r.id} className="flex justify-between py-2"><span>{r.type} · Student #{r.student_id} · {r.status} {r.certificate_no && `· ${r.certificate_no}`}</span>{r.status === 'requested' && <button className="text-emerald-600" onClick={() => router.patch(route('admin.academic-operations.transfer-approve', r.id))}>Approve</button>}</div>} />
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
