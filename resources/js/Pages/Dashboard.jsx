import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import { Head, Link, usePage } from '@inertiajs/react';

const money = (value) => `৳ ${Number(value || 0).toLocaleString('en-BD')}`;

const getRoute = (name) => {
    try { return route().has(name) ? route(name) : '#'; } catch { return '#'; }
};

function MetricCard({ title, value, detail, icon, tone = 'emerald', href }) {
    const tones = {
        emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
        amber: 'bg-amber-50 text-amber-700 ring-amber-100',
        rose: 'bg-rose-50 text-rose-700 ring-rose-100',
    };
    return <Link href={href} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5">
        <div className="flex items-start justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">{title}</p><p className="mt-3 text-2xl font-black tracking-tight text-slate-900">{value}</p></div>
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${tones[tone]}`}><Icon name={icon} className="h-5 w-5" /></span>
        </div>
        <p className="mt-3 text-xs text-slate-500">{detail}</p>
    </Link>;
}

function Panel({ title, subtitle, action, children, className = '' }) {
    return <section className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}>
        <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div><h2 className="text-base font-bold text-slate-900">{title}</h2>{subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}</div>
            {action}
        </header>
        {children}
    </section>;
}

export default function Dashboard({ overview = {}, attendance = {}, alerts = {}, operations = {}, financeTrend = [], recentAdmissions = [], pendingLeaves = [], upcomingExams = [], notices = [] }) {
    const { auth } = usePage().props;
    const maxFinance = Math.max(1, ...financeTrend.flatMap((item) => [Number(item.income), Number(item.expense)]));
    const quickActions = [
        ['New admission', 'plus', 'admin.students.create', 'emerald'],
        ['Take attendance', 'check-square', 'admin.student-attendance.index', 'indigo'],
        ['Collect fee', 'wallet', 'admin.studentfees.index', 'amber'],
        ['Run payroll', 'receipt', 'admin.staff-payrolls.index', 'rose'],
        ['Send SMS', 'send', 'admin.sms-logs.index', 'indigo'],
        ['Device status', 'fingerprint', 'admin.biometric-devices.index', 'emerald'],
    ];
    const alertItems = [
        ['Absent students', alerts.absent_students, 'Students marked absent today', 'rose', 'admin.student-attendance.index'],
        ['Leave approvals', alerts.pending_leaves, 'Staff requests waiting for review', 'amber', 'admin.staff-leaves.index'],
        ['Overdue invoices', alerts.overdue_invoices, 'Fee invoices past their due date', 'rose', 'admin.studentfees.index'],
        ['Device issues', alerts.device_issues, 'Biometric devices need attention', 'indigo', 'admin.biometric-devices.index'],
        ['Failed SMS', alerts.failed_sms, 'Messages that failed today', 'amber', 'admin.sms-logs.index'],
        ['Low stock', alerts.low_stock, 'Products at or below reorder level', 'rose', 'admin.purchase.items.report'],
        ['Failed payments', alerts.failed_payments, 'Payment attempts failed today', 'amber', 'admin.payments.transactions.index'],
    ];
    const operationItems = [
        ['Payroll approval', operations.payroll_approval, 'admin.staff-payrolls.index'],
        ['Payroll finalization', operations.payroll_finalize, 'admin.staff-payrolls.index'],
        ['Stock adjustments', operations.stock_adjustments, 'admin.purchase.items.index'],
        ['Sale void requests', operations.sale_voids, 'admin.sales.index'],
        ['Payment refunds', operations.payment_refunds, 'admin.payments.refunds.index'],
    ];

    return <AuthenticatedLayout>
        <Head title="Admin Dashboard" />
        <div className="space-y-6 py-4 sm:py-6">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#082f2b] via-[#0f4c42] to-[#176b5c] px-6 py-7 text-white shadow-xl shadow-emerald-950/15 sm:px-8">
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[34px] border-white/5" />
                <div className="absolute bottom-[-90px] right-32 h-48 w-48 rounded-full bg-amber-300/10 blur-2xl" />
                <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <div><span className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">School command center</span><h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Good day, {auth?.user?.name || 'Administrator'}</h1><p className="mt-2 max-w-2xl text-sm text-emerald-50/75">Attendance, finance, communication and daily operations—সব গুরুত্বপূর্ণ তথ্য এক জায়গায়।</p></div>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur"><Icon name="calendar" className="h-5 w-5 text-amber-300"/><div><p className="text-[10px] uppercase tracking-widest text-emerald-100/70">Today</p><p className="text-sm font-semibold">{new Intl.DateTimeFormat('en-BD', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</p></div></div>
                </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <MetricCard title="Total students" value={Number(overview.students || 0).toLocaleString()} detail="Currently registered students" icon="users" href={getRoute('admin.students.index')} />
                <MetricCard title="Today attendance" value={`${overview.attendance_percentage || 0}%`} detail={`${attendance.present || 0} present · ${attendance.absent || 0} absent`} icon="activity" tone="indigo" href={getRoute('admin.student-attendance.index')} />
                <MetricCard title="Today's collection" value={money(overview.today_collection)} detail="Fee payments received today" icon="wallet" tone="amber" href={getRoute('admin.fees.ledger')} />
                <MetricCard title="Outstanding dues" value={money(overview.pending_dues)} detail="Unpaid and partially paid invoices" icon="alert-circle" tone="rose" href={getRoute('admin.studentfees.index')} />
                <MetricCard title="Total staff" value={Number(overview.staff || 0).toLocaleString()} detail="Teachers and operational staff" icon="briefcase" tone="indigo" href={getRoute('admin.staff.index')} />
                <MetricCard title="Inventory value" value={money(overview.inventory_value)} detail="Current stock at purchase cost" icon="package" tone="emerald" href={getRoute('admin.purchase.items.report')} />
            </div>

            <Panel title="Quick actions" subtitle="Your most-used daily tasks">
                <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 xl:grid-cols-6">
                    {quickActions.map(([label, icon, routeName, tone]) => <Link key={label} href={getRoute(routeName)} className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-4 text-center transition hover:border-emerald-200 hover:bg-emerald-50/60">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone === 'emerald' ? 'bg-emerald-100 text-emerald-700' : tone === 'indigo' ? 'bg-indigo-100 text-indigo-700' : tone === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}><Icon name={icon} className="h-5 w-5" /></span><span className="text-xs font-bold text-slate-700 group-hover:text-emerald-800">{label}</span>
                    </Link>)}
                </div>
            </Panel>

            <div className="grid gap-6 xl:grid-cols-3">
                <Panel title="Income & expense" subtitle="Last six months" className="xl:col-span-2" action={<Link href={getRoute('admin.fees.ledger')} className="text-xs font-bold text-emerald-700">View ledger →</Link>}>
                    <div className="p-5"><div className="mb-5 flex gap-5 text-xs text-slate-500"><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"/>Income</span><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-amber-400"/>Expense</span></div>
                        <div className="flex h-52 items-end gap-3 sm:gap-6">{financeTrend.map((item) => <div key={item.label} className="flex h-full flex-1 flex-col justify-end"><div className="flex h-[170px] items-end justify-center gap-1 sm:gap-2"><div title={money(item.income)} className="w-3/5 max-w-8 rounded-t-md bg-gradient-to-t from-emerald-700 to-emerald-400" style={{height: `${Math.max(3, Number(item.income) / maxFinance * 100)}%`}}/><div title={money(item.expense)} className="w-3/5 max-w-8 rounded-t-md bg-gradient-to-t from-amber-500 to-amber-300" style={{height: `${Math.max(3, Number(item.expense) / maxFinance * 100)}%`}}/></div><p className="mt-2 text-center text-[11px] font-semibold text-slate-500">{item.label}</p></div>)}</div>
                    </div>
                </Panel>
                <Panel title="Today's attendance" subtitle={`${attendance.total || 0} attendance records`}>
                    <div className="flex flex-col items-center p-6"><div className="grid h-36 w-36 place-items-center rounded-full" style={{background: `conic-gradient(#10b981 ${attendance.percentage || 0}%, #e2e8f0 0)`}}><div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center"><div><p className="text-3xl font-black text-slate-900">{attendance.percentage || 0}%</p><p className="text-[10px] uppercase tracking-widest text-slate-400">Present</p></div></div></div>
                        <div className="mt-6 grid w-full grid-cols-2 gap-2 text-xs">{[['Present', attendance.present, 'bg-emerald-500'], ['Absent', attendance.absent, 'bg-rose-500'], ['Late', attendance.late, 'bg-amber-400'], ['Leave', attendance.leave, 'bg-indigo-500']].map(([label, value, color]) => <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500"><i className={`mr-2 inline-block h-2 w-2 rounded-full ${color}`}/>{label}</span><b>{value || 0}</b></div>)}</div>
                    </div>
                </Panel>
            </div>

            <Panel title="Approval command center" subtitle="Finance and stock decisions waiting for action">
                <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">{operationItems.map(([label,value,routeName]) => <Link key={label} href={getRoute(routeName)} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-emerald-200 hover:bg-emerald-50"><span className="text-sm font-bold text-slate-700">{label}</span><b className={`grid h-8 min-w-8 place-items-center rounded-full px-2 text-sm ${Number(value)>0?'bg-amber-100 text-amber-800':'bg-emerald-100 text-emerald-800'}`}>{value || 0}</b></Link>)}</div>
            </Panel>

            <div className="grid gap-6 xl:grid-cols-3">
                <Panel title="Needs attention" subtitle="Items requiring an admin decision">
                    <div className="divide-y divide-slate-100">{alertItems.map(([label, value, detail, tone, routeName]) => <Link key={label} href={getRoute(routeName)} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50"><span className={`grid h-9 w-9 place-items-center rounded-xl text-sm font-black ${tone === 'rose' ? 'bg-rose-50 text-rose-700' : tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'}`}>{value || 0}</span><span className="min-w-0"><b className="block text-sm text-slate-800">{label}</b><small className="block truncate text-slate-500">{detail}</small></span><span className="ml-auto text-slate-300">›</span></Link>)}</div>
                </Panel>
                <Panel title="Upcoming exams" subtitle="Scheduled in the next 14 days" action={<Link href={getRoute('admin.exam-schedules.index')} className="text-xs font-bold text-emerald-700">All →</Link>}>
                    <div className="divide-y divide-slate-100">{upcomingExams.map((exam) => <div key={exam.id} className="flex gap-3 px-5 py-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-xs font-black text-indigo-700">{exam.date}</span><div><b className="text-sm text-slate-800">{exam.subject}</b><p className="mt-1 text-xs text-slate-500">{exam.exam} · {exam.class}</p></div></div>)}{!upcomingExams.length && <p className="p-8 text-center text-sm text-slate-400">No upcoming exam scheduled.</p>}</div>
                </Panel>
                <Panel title="Pending leave" subtitle="Staff leave requests" action={<Link href={getRoute('admin.staff-leaves.index')} className="text-xs font-bold text-emerald-700">Review →</Link>}>
                    <div className="divide-y divide-slate-100">{pendingLeaves.map((leave) => <div key={leave.id} className="flex items-center gap-3 px-5 py-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700"><Icon name="calendar" className="h-4 w-4"/></span><div><b className="text-sm text-slate-800">{leave.staff}</b><p className="mt-1 text-xs text-slate-500">{leave.from} – {leave.to}</p></div><span className="ml-auto rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase text-amber-700">Pending</span></div>)}{!pendingLeaves.length && <p className="p-8 text-center text-sm text-slate-400">No leave request is pending.</p>}</div>
                </Panel>
            </div>

            <div className="grid gap-6 xl:grid-cols-5">
                <Panel title="Latest admissions" subtitle="Recently added students" className="xl:col-span-3" action={<Link href={getRoute('admin.students.index')} className="text-xs font-bold text-emerald-700">View all →</Link>}><div className="divide-y divide-slate-100">{recentAdmissions.map((student) => <div key={student.id} className="flex items-center gap-3 px-5 py-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 font-bold text-emerald-700">{student.name?.charAt(0)}</span><div><b className="text-sm text-slate-800">{student.name}</b><p className="text-xs text-slate-500">{student.id} · {student.class}</p></div><span className="ml-auto text-xs text-slate-400">{student.date}</span></div>)}{!recentAdmissions.length && <p className="p-8 text-center text-sm text-slate-400">No recent admission found.</p>}</div></Panel>
                <Panel title="Recent notices" subtitle="Latest school announcements" className="xl:col-span-2" action={<Link href={getRoute('admin.frontoffice.notices.index')} className="text-xs font-bold text-emerald-700">Manage →</Link>}><div className="divide-y divide-slate-100">{notices.map((notice) => <div key={notice.id} className="px-5 py-4"><div className="flex gap-2"><Icon name="bell" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"/><b className="text-sm text-slate-800">{notice.title}</b></div><p className="ml-6 mt-1 text-xs text-slate-500">{notice.type || 'General'} · {notice.date}</p></div>)}{!notices.length && <p className="p-8 text-center text-sm text-slate-400">No active notice.</p>}</div></Panel>
            </div>
        </div>
    </AuthenticatedLayout>;
}
