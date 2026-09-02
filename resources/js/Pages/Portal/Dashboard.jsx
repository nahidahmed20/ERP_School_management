import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import { Head, Link, router } from '@inertiajs/react';

const statusTone = (status) => {
    const value = (status ?? '').toLowerCase();
    if (['present', 'approved', 'paid'].includes(value)) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (['late', 'partial', 'pending'].includes(value)) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (['absent', 'rejected', 'unpaid'].includes(value)) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
};

function EmptyState({ icon = 'calendar', text }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                <Icon name={icon} className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">{text}</p>
        </div>
    );
}

function Section({ title, subtitle, icon, children, className = '' }) {
    return (
        <section className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                    <Icon name={icon} className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                    <h2 className="text-base font-bold text-slate-900">{title}</h2>
                    {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
                </div>
            </div>
            {children}
        </section>
    );
}

function ClassList({ classes, staff = false }) {
    if (!classes?.length) return <EmptyState text="আজ কোনো class নেই। আজকের দিনটি revision বা preparation-এর জন্য ব্যবহার করুন।" />;

    return (
        <div className="divide-y divide-slate-100">
            {classes.map((item, index) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-emerald-50/40">
                    <div className="w-16 shrink-0 text-center">
                        <div className="text-sm font-black text-emerald-900">{item.start}</div>
                        <div className="mt-0.5 text-[10px] font-semibold text-slate-400">{item.end}</div>
                    </div>
                    <div className="h-10 w-px bg-slate-200" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">{item.subject}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                            {staff ? item.class : item.teacher} · Room {item.room}
                        </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">#{index + 1}</span>
                </div>
            ))}
        </div>
    );
}

function NoticeList({ notices }) {
    if (!notices?.length) return <EmptyState icon="bell" text="কোনো নতুন notice নেই।" />;

    return (
        <div className="divide-y divide-slate-100">
            {notices.map((notice) => (
                <div key={notice.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{notice.title}</p>
                            <p className="mt-1 text-xs text-slate-400">{notice.type || 'General'} · {notice.date}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function StudentParentDashboard({ portal }) {
    const isParent = portal.type === 'parent';
    const todayExams = portal.exams?.filter((exam) => exam.is_today) ?? [];
    const upcomingExams = portal.exams?.filter((exam) => !exam.is_today) ?? [];

    if (!portal.student) {
        return (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
                <Icon name="users" className="mx-auto h-10 w-10 text-amber-700" />
                <h2 className="mt-4 text-xl font-bold text-amber-950">কোনো student profile linked নেই</h2>
                <p className="mt-2 text-sm text-amber-800">School office থেকে এই parent account-এর সঙ্গে student link করুন।</p>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 p-6 text-white shadow-lg sm:p-8">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">{portal.today}</p>
                        <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                            {isParent ? `${portal.student.name}-এর আজকের update` : `স্বাগতম, ${portal.greeting_name}`}
                        </h1>
                        <p className="mt-2 text-sm text-emerald-100">
                            {portal.student.class} · Section {portal.student.section} · ID {portal.student.admission_no}
                        </p>
                        {!isParent && <Link href={route('portal.services')} className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-bold text-emerald-950 shadow-sm">Open My Student Account</Link>}
                    </div>
                    {isParent && portal.children?.length > 1 && (
                        <label className="min-w-52 text-xs font-semibold text-emerald-100">
                            সন্তান নির্বাচন করুন
                            <select
                                value={portal.student.id}
                                onChange={(event) => router.get(route('dashboard'), { student_id: event.target.value }, { preserveState: true })}
                                className="mt-2 w-full rounded-xl border border-white/20 bg-white px-3 py-2 text-sm font-semibold text-emerald-950"
                            >
                                {portal.children.map((child) => <option key={child.id} value={child.id}>{child.name} — {child.class}</option>)}
                            </select>
                        </label>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">আজকের Class</p>
                    <p className="mt-2 text-2xl font-black text-emerald-900">{portal.classes?.length ?? 0}</p>
                </div>
                <div className={`rounded-2xl border p-4 shadow-sm ${todayExams.length ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'}`}>
                    <p className="text-xs font-semibold text-slate-500">আজকের Exam</p>
                    <p className={`mt-2 text-2xl font-black ${todayExams.length ? 'text-rose-700' : 'text-emerald-900'}`}>{todayExams.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Attendance</p>
                    <p className="mt-2 text-2xl font-black text-emerald-900">{portal.attendance?.percentage ?? 0}%</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">বকেয়া Fee</p>
                    <p className="mt-2 text-xl font-black text-emerald-900">৳ {Number(portal.dues ?? 0).toLocaleString()}</p>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Section title="My Recent Attendance" subtitle="সর্বশেষ ৭টি attendance record" icon="check-circle">
                    <div className="flex flex-wrap gap-2 p-4">{portal.attendance?.recent?.length ? portal.attendance.recent.map((row, i) => <div key={`${row.date}-${i}`} className="min-w-20 rounded-xl border border-slate-200 p-3 text-center"><p className="text-xs text-slate-500">{row.date}</p><span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${statusTone(row.status)}`}>{row.status}</span></div>) : <EmptyState text="Attendance record পাওয়া যায়নি।" />}</div>
                </Section>
                <Section title="Exam Results" subtitle="শুধু published result এবং আপনার নিজের marks" icon="pencil">
                    <div className="p-5">{portal.can_view_results ? <><p className="text-sm text-slate-600">Subject-wise marks, grade, GPA ও result status দেখুন।</p><Link href={route('portal.results.view')} className="mt-4 inline-flex rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-900">View My Marks</Link></> : <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Result দেখার permission এখনো দেওয়া হয়নি। School admin permission দিলে এখানে button দেখা যাবে।</p>}</div>
                </Section>
            </div>

            {todayExams.length > 0 && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-700"><Icon name="alert-circle" /></div>
                        <div><p className="text-xs font-bold uppercase tracking-wider text-rose-600">আজ পরীক্ষা আছে</p><h2 className="text-lg font-bold text-rose-950">{todayExams.map((exam) => `${exam.exam} — ${exam.subject}`).join(', ')}</h2></div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {todayExams.map((exam) => <div key={exam.id} className="rounded-xl bg-white p-3 text-sm text-slate-700"><strong>{exam.subject}</strong><div className="mt-1 text-xs text-slate-500">{exam.time} · Room {exam.room}</div></div>)}
                    </div>
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-2">
                <Section title="আজকের Class Routine" subtitle="সময় অনুযায়ী সাজানো" icon="calendar"><ClassList classes={portal.classes} /></Section>
                <Section title="Homework & Assignment" subtitle="নিকটতম deadline আগে" icon="book">
                    {!portal.homework?.length ? <EmptyState icon="check-circle" text="Pending homework নেই—দারুণ!" /> : (
                        <div className="divide-y divide-slate-100">
                            {portal.homework.map((item) => <div key={item.id} className="px-5 py-4"><div className="flex justify-between gap-4"><div className="min-w-0"><p className="text-xs font-bold uppercase text-emerald-700">{item.subject}</p><p className="mt-1 text-sm font-bold text-slate-900">{item.title}</p>{item.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.description}</p>}</div><div className="shrink-0 text-right"><p className="text-xs font-bold text-rose-600">Due {item.due}</p>{item.document_url && <a href={item.document_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-bold text-emerald-800">Download</a>}</div></div></div>)}
                        </div>
                    )}
                </Section>
                <Section title="Upcoming Exams" subtitle="আগামী ১৪ দিনের schedule" icon="pencil">
                    {!upcomingExams.length ? <EmptyState icon="calendar" text="আগামী ১৪ দিনে কোনো exam schedule নেই।" /> : (
                        <div className="divide-y divide-slate-100">{upcomingExams.map((exam) => <div key={exam.id} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="text-sm font-bold text-slate-900">{exam.subject}</p><p className="mt-1 text-xs text-slate-500">{exam.exam} · Room {exam.room}</p></div><div className="text-right"><p className="text-xs font-bold text-emerald-800">{exam.date}</p><p className="mt-1 text-xs text-slate-400">{exam.time}</p></div></div>)}</div>
                    )}
                </Section>
                <Section title="Notes & Study Materials" subtitle="Class-এর সর্বশেষ files" icon="file-text">
                    {!portal.materials?.length ? <EmptyState icon="file-text" text="এখনও কোনো note upload হয়নি।" /> : (
                        <div className="grid gap-3 p-4 sm:grid-cols-2">{portal.materials.map((item) => <a key={item.id} href={item.file_url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 p-3 transition hover:border-emerald-300 hover:bg-emerald-50"><p className="truncate text-sm font-bold text-slate-800">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.subject} · {item.file_type}</p></a>)}</div>
                    )}
                </Section>
            </div>

            <Section title="School Notices" subtitle="গুরুত্বপূর্ণ ঘোষণা" icon="bell"><NoticeList notices={portal.notices} /></Section>
        </>
    );
}

function StaffDashboard({ portal }) {
    return (
        <>
            <div className="rounded-3xl bg-gradient-to-br from-emerald-950 to-emerald-800 p-6 text-white shadow-lg sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">{portal.today}</p>
                <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">স্বাগতম, {portal.greeting_name}</h1>
                <p className="mt-2 text-sm text-emerald-100">{portal.staff.designation} · {portal.staff.department} · ID {portal.staff.staff_no}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold text-slate-500">আজকের Class</p><p className="mt-2 text-3xl font-black text-emerald-900">{portal.classes?.length ?? 0}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold text-slate-500">আজকের Attendance</p><span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusTone(portal.attendance)}`}>{portal.attendance || 'Not marked'}</span></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold text-slate-500">Leave Requests</p><p className="mt-2 text-3xl font-black text-emerald-900">{portal.leaves?.length ?? 0}</p></div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <Section title="My Classes Today" subtitle="Class, section, room এবং সময়" icon="calendar"><ClassList classes={portal.classes} staff /></Section>
                <Section title="My Recent Leaves" subtitle="সর্বশেষ application status" icon="file-text">
                    {!portal.leaves?.length ? <EmptyState icon="check-circle" text="কোনো recent leave application নেই।" /> : <div className="divide-y divide-slate-100">{portal.leaves.map((leave) => <div key={leave.id} className="flex items-center justify-between px-5 py-4"><div><p className="text-sm font-bold text-slate-900">{leave.type}</p><p className="mt-1 text-xs text-slate-500">{leave.from} – {leave.to}</p></div><span className={`rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${statusTone(leave.status)}`}>{leave.status}</span></div>)}</div>}
                </Section>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <Section title="Today's Work" subtitle="আজকের assigned class ও কাজ" icon="check-circle">
                    {!portal.tasks?.length ? <EmptyState text="আজ কোনো assigned কাজ নেই।" /> : <div className="divide-y divide-slate-100">{portal.tasks.map(task => <div key={task.id} className="p-4"><p className="text-sm font-bold text-slate-900">{task.title}</p><p className="mt-1 text-xs text-slate-500">{task.detail}</p></div>)}</div>}
                </Section>
                <Section title="My Recent Attendance" subtitle="সর্বশেষ ৭টি attendance record" icon="calendar">
                    <div className="flex flex-wrap gap-2 p-4">{portal.attendance_recent?.length ? portal.attendance_recent.map((row, i) => <div key={`${row.date}-${i}`} className="min-w-20 rounded-xl border p-3 text-center"><p className="text-xs text-slate-500">{row.date}</p><span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${statusTone(row.status)}`}>{row.status}</span></div>) : <EmptyState text="Attendance record পাওয়া যায়নি।" />}</div>
                </Section>
            </div>

            <Section title="School Notices" subtitle="আজকের কাজ শুরুর আগে দেখে নিন" icon="bell"><NoticeList notices={portal.notices} /></Section>
        </>
    );
}

export default function PortalDashboard({ portal }) {
    return (
        <AuthenticatedLayout>
            <Head title={portal.type === 'student' ? 'Student Dashboard' : portal.type === 'parent' ? 'Parent Dashboard' : 'Staff Dashboard'} />
            <main className="space-y-6 py-4 sm:px-2 sm:py-6">
                {portal.type === 'staff' ? <StaffDashboard portal={portal} /> : <StudentParentDashboard portal={portal} />}
            </main>
        </AuthenticatedLayout>
    );
}
