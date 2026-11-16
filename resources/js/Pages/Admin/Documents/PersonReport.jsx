import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

const valueOrDash = (value) => value === null || value === undefined || value === '' ? '—' : value;
const tabs = {
    profile: 'Profile', attendance: 'Attendance', results: 'Results', fees: 'Fees',
    payrolls: 'Payroll', leaves: 'Leave', hr: 'HR Records',
};

function StatCard({ label, value, icon, tone = 'emerald' }) {
    const tones = {
        emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
        blue: 'bg-blue-50 text-blue-800 ring-blue-100',
        amber: 'bg-amber-50 text-amber-800 ring-amber-100',
        violet: 'bg-violet-50 text-violet-800 ring-violet-100',
    };
    return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${tones[tone]}`}><Icon name={icon} className="h-5 w-5" /></span>
        </div>
        <p className="mt-3 text-2xl font-black tracking-tight text-slate-900">{value}</p>
    </div>;
}

function DataTable({ headings, rows, empty = 'No records found.' }) {
    return <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-0 text-left text-sm">
            <thead><tr>{headings.map((heading) => <th key={heading} className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">{heading}</th>)}</tr></thead>
            <tbody>{rows.length ? rows.map((row, index) => <tr key={index} className="odd:bg-white even:bg-slate-50/60 hover:bg-emerald-50/50">
                {row.map((value, column) => <td key={column} className="border-b border-slate-100 px-4 py-3.5 font-medium text-slate-700">{valueOrDash(value)}</td>)}
            </tr>) : <tr><td colSpan={headings.length} className="px-4 py-14 text-center text-sm text-slate-500">{empty}</td></tr>}</tbody>
        </table>
    </div>;
}

function ProfileDetails({ person, student, name }) {
    const details = [
        ['Full name', name],
        [student ? 'Admission number' : 'Staff ID', student ? person.admission_no : person.staff_id_no],
        ['Phone', person.phone],
        ['Email', person.email],
        ['Gender', person.gender],
        ['Blood group', person.blood_group],
        ['Department', person.department?.name],
        ['Designation', person.designation?.name],
        ['Campus', person.campus?.name],
        ['Present address', person.present_address],
        ['Joining date', person.joining_date],
        ['Status', (student ? person.status : person.is_active) ? 'Active' : 'Inactive'],
    ];
    return <dl className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 sm:p-6">
        {details.map(([label, value]) => <div key={label} className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 break-words text-sm font-semibold text-slate-900">{valueOrDash(value)}</dd>
        </div>)}
    </dl>;
}

export default function PersonReport({ personType, person, initialTab, attendance = [], results = [], fees = [], leaves = [], payrolls = [], hrRecords = [] }) {
    const student = personType === 'student';
    const name = `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim();
    const availableTabs = student ? ['profile', 'attendance', 'results', 'fees', 'leaves'] : ['profile', 'attendance', 'payrolls', 'leaves', 'hr'];
    const [activeTab, setActiveTab] = useState(availableTabs.includes(initialTab) ? initialTab : 'profile');
    const idLabel = student ? person.admission_no : person.staff_id_no;
    const status = student ? person.status : person.is_active;

    const content = {
        profile: <ProfileDetails person={person} student={student} name={name} />,
        attendance: <DataTable headings={['Date', 'Status', 'In time', 'Out time', 'Source']} rows={attendance.map((row) => [row.attendance_date || row.date, row.status, row.in_time, row.out_time, row.source])} />,
        results: <DataTable headings={['Exam', 'Subject', 'Marks', 'Grade']} rows={results.map((row) => [row.exam?.name, row.subject?.name, row.marks_obtained, row.letter_grade || row.grade])} />,
        fees: <DataTable headings={['Invoice', 'Fee group', 'Amount', 'Paid', 'Status']} rows={fees.map((row) => [row.invoice_no, row.fee_group?.name, row.amount, row.paid_amount, row.status])} />,
        leaves: <DataTable headings={['From', 'To', 'Leave type', 'Status']} rows={leaves.map((row) => [row.start_date, row.end_date, row.leave_type, row.school_status || row.status])} />,
        payrolls: <DataTable headings={['Period', 'Gross pay', 'Deduction', 'Net pay', 'Status']} rows={payrolls.map((row) => [row.payroll_month || row.month, row.gross_salary, row.total_deduction, row.net_salary, row.status])} />,
        hr: <DataTable headings={['Record type', 'Title', 'Date', 'Status']} rows={hrRecords.map((row) => [row.record_type, row.title, row.record_date, row.status])} />,
    };

    return <AuthenticatedLayout>
        <Head title={`${name} report`} />
        <style>{`@media print { body * { visibility: hidden !important; } .report-print, .report-print * { visibility: visible !important; } .report-print { position: absolute; inset: 0; width: 100%; padding: 0 !important; } .report-no-print { display: none !important; } .report-card { box-shadow: none !important; } }`}</style>
        <div className="report-print w-full max-w-none space-y-5 p-3 sm:space-y-6 sm:p-6 lg:p-8">
            <header className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-teal-100 text-slate-900 shadow-sm">
                <div className="flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between lg:p-8">
                    <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                        {person.photo_url ? <img src={person.photo_url} alt="" className="h-16 w-16 shrink-0 rounded-2xl border border-white object-cover shadow-sm sm:h-20 sm:w-20" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-800 text-2xl font-black text-white shadow-sm sm:h-20 sm:w-20">{name.charAt(0) || '?'}</div>}
                        <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">{student ? 'Student report' : 'Staff report'}</p>
                            <h1 className="mt-1 truncate text-2xl font-black tracking-tight sm:text-3xl">{name}</h1>
                            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                                <span>{student ? 'Admission' : 'Staff ID'}: {valueOrDash(idLabel)}</span>
                                <span className="hidden text-slate-300 sm:inline">•</span>
                                <span>{valueOrDash(person.designation?.name || person.current_enrollment?.school_class?.name || person.campus?.name)}</span>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>{status ? 'Active' : 'Inactive'}</span>
                            </p>
                        </div>
                    </div>
                    <div className="report-no-print flex flex-wrap gap-2">
                        <Link href={student ? route('admin.students.id-card', person.id) : route('admin.staff.id-card', person.id)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-white/80 px-4 text-sm font-bold text-emerald-900 transition hover:bg-white">
                            <Icon name="user" className="h-4 w-4" /> ID Card
                        </Link>
                        <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-bold text-white transition hover:bg-emerald-900">
                            <Icon name="printer" className="h-4 w-4" /> Print report
                        </button>
                    </div>
                </div>
            </header>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Attendance records" value={attendance.length} icon="calendar" />
                <StatCard label={student ? 'Fee invoices' : 'Payroll records'} value={student ? fees.length : payrolls.length} icon="credit-card" tone="blue" />
                <StatCard label={student ? 'Published results' : 'Leave requests'} value={student ? results.length : leaves.length} icon="file-text" tone="violet" />
                <StatCard label={student ? 'Leave requests' : 'HR records'} value={student ? leaves.length : hrRecords.length} icon="users" tone="amber" />
            </section>

            <section className="report-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-4 pt-4 sm:px-6 sm:pt-5">
                    <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Report sections">
                        {availableTabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold capitalize transition ${activeTab === tab ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
                            {tabs[tab]}
                        </button>)}
                    </div>
                </div>
                <div role="tabpanel">{content[activeTab]}</div>
            </section>
        </div>
    </AuthenticatedLayout>;
}
