import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Import({ campus, sessions = [], classes = [], maxRows }) {
    const { data, setData, post, processing, errors, progress } = useForm({
        campus_id: campus?.id ?? '',
        file: null,
    });
    const errorMessages = [...new Set(Object.values(errors))];
    const inputClass = 'w-full rounded-lg border border-slate-300 bg-white p-3 text-sm';

    const submit = (event) => {
        event.preventDefault();
        post(route('admin.students.import.store'), { forceFormData: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Import Students" />
            <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Import students</h1>
                        <p className="mt-1 text-sm text-slate-600">Add students, guardians and enrollments from a UTF-8 CSV file.</p>
                    </div>
                    <Link href={route('admin.students.index')} className="text-sm font-semibold text-indigo-700">Back to students</Link>
                </div>

                <div className={`rounded-xl border p-4 ${campus ? 'border-indigo-200 bg-indigo-50 text-indigo-900' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>
                    {campus ? <>Working campus: <strong>{campus.name}</strong>. Every imported student and enrollment belongs to this campus.</>
                        : 'Select a working campus from the top bar before importing.'}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                        <h2 className="text-lg font-semibold text-slate-900">1. Prepare your file</h2>
                        <a href={route('admin.students.import.template')} className="inline-flex rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">Download CSV template</a>
                        <p className="text-sm leading-6 text-slate-600">Use the IDs listed below for academic_session_id, class_id and section_id. Dates must use YYYY-MM-DD. Gender must be male, female or other. Keep phone numbers and roll numbers as text in your spreadsheet.</p>
                        <p className="text-sm leading-6 text-slate-600">Required student fields: first_name, gender, date_of_birth, admission_date, nationality, present_address and permanent_address. Academic session, class and section IDs are also required.</p>
                        <p className="text-sm leading-6 text-slate-600">Leave admission_no blank to generate a unique admission number. Email, roll number and last name are optional. Duplicate admission numbers, student/account emails, or rolls in the same session, class and section are rejected.</p>
                        <p className="text-sm leading-6 text-slate-600">Enter guardian_id to link an existing guardian from this campus. Otherwise provide father_name, father_phone and mother_name. A matching father_phone reuses the campus guardian without changing their details; siblings can share that phone.</p>
                        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">This import creates student records and enrollments. It does not create portal accounts, set passwords or send messages.</p>
                    </section>

                    <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                        <h2 className="text-lg font-semibold text-slate-900">2. Upload and import</h2>
                        <label htmlFor="student-csv" className="block text-sm font-semibold text-slate-700">Student CSV file</label>
                        <input id="student-csv" type="file" accept=".csv,text/csv" className={inputClass}
                            onChange={(event) => setData('file', event.target.files?.[0] ?? null)} required disabled={processing} />
                        <p className="text-sm text-slate-600">Maximum {maxRows} students and 2 MB per file. All rows are checked before saving. If any row fails, nothing is imported.</p>
                        {progress && <p className="text-sm text-slate-600" role="status">Uploading: {progress.percentage}%</p>}
                        {errorMessages.length > 0 && (
                            <div role="alert" className="max-h-80 overflow-auto rounded-lg border border-rose-200 bg-rose-50 p-4">
                                <p className="mb-2 font-semibold text-rose-900">No students were imported. Correct these errors and upload again.</p>
                                <ul className="list-disc space-y-1 pl-5 text-sm text-rose-800">
                                    {errorMessages.map((message, index) => <li key={index}>{message}</li>)}
                                </ul>
                            </div>
                        )}
                        <button type="submit" disabled={processing || !campus || !data.file} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
                            {processing ? 'Validating and importing…' : 'Validate and import students'}
                        </button>
                    </form>
                </div>

                <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Academic IDs for {campus?.name ?? 'the selected campus'}</h2>
                    <div className="mt-4 grid gap-6 md:grid-cols-2">
                        <div>
                            <h3 className="mb-2 text-sm font-semibold text-slate-700">Academic sessions</h3>
                            {sessions.length ? <ul className="space-y-2 text-sm text-slate-600">{sessions.map(session => <li key={session.id}><code className="rounded bg-slate-100 px-2 py-1">{session.id}</code> {session.name}{session.is_current ? ' (current)' : ''}</li>)}</ul>
                                : <p className="text-sm text-amber-700">Create an active academic session for this campus first.</p>}
                        </div>
                        <div>
                            <h3 className="mb-2 text-sm font-semibold text-slate-700">Classes and their sections</h3>
                            {classes.length ? <ul className="space-y-3 text-sm text-slate-600">{classes.map(schoolClass => <li key={schoolClass.id}>
                                <p><code className="rounded bg-slate-100 px-2 py-1">{schoolClass.id}</code> {schoolClass.name}</p>
                                <p className="mt-1">Sections: {schoolClass.sections?.length ? schoolClass.sections.map(section => `${section.name} (ID ${section.id})`).join(', ') : 'Assign an active section to this class first.'}</p>
                            </li>)}</ul> : <p className="text-sm text-amber-700">Create a class and assign its sections for this campus first.</p>}
                        </div>
                    </div>
                </section>
            </main>
        </AuthenticatedLayout>
    );
}
