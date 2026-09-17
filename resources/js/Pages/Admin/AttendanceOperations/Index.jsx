import { Head, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const input =
    "mt-1 block w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors";

export default function Index({ policy, locks, classes, holidays }) {
    const p = useForm({
        student_start_time: policy?.student_start_time?.slice(0, 5) || "08:00",
        staff_start_time: policy?.staff_start_time?.slice(0, 5) || "08:00",
        late_grace_minutes: policy?.late_grace_minutes || 15,
        half_day_after_minutes: policy?.half_day_after_minutes || 180,
        weekly_holidays: policy?.weekly_holidays || [5],
        block_holiday_entry: policy?.block_holiday_entry ?? true,
        auto_absent_sms: policy?.auto_absent_sms ?? false,
    });

    const l = useForm({
        attendance_type: "student",
        attendance_date: new Date().toISOString().slice(0, 10),
        class_id: "",
        section_id: "",
    });

    const sections =
        classes.find((c) => String(c.id) === String(l.data.class_id))
            ?.sections || [];

    return (
        <AuthenticatedLayout>
            <Head title="Attendance Control" />

            <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6 p-4 sm:p-6">

                {/* Header */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                        Attendance Control & Policy
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manual, biometric, holiday and approved-leave attendance rules in one place.
                    </p>
                </div>

                <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">

                    {/* Policy Section */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                        <h2 className="mb-4 sm:mb-5 text-lg font-bold text-slate-800">
                            Automatic Attendance Rules
                        </h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                p.post(route("admin.attendance-control.policy"));
                            }}
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5"
                        >
                            {[
                                ["Student start", "student_start_time", "time"],
                                ["Staff start", "staff_start_time", "time"],
                                ["Late grace (minutes)", "late_grace_minutes", "number"],
                                ["Half-day after (minutes)", "half_day_after_minutes", "number"],
                            ].map(([a, b, c]) => (
                                <label key={b} className="text-sm font-semibold text-slate-700">
                                    {a}
                                    <input
                                        className={input}
                                        type={c}
                                        value={p.data[b]}
                                        onChange={(e) => p.setData(b, e.target.value)}
                                    />
                                </label>
                            ))}

                            <div className="sm:col-span-2 pt-2">
                                <p className="mb-2 text-sm font-semibold text-slate-700">
                                    Weekly holidays
                                </p>
                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                    {[
                                        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
                                    ].map((day, i) => (
                                        <label
                                            key={day}
                                            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm transition-colors hover:bg-slate-100"
                                        >
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={p.data.weekly_holidays.includes(i)}
                                                onChange={(e) =>
                                                    p.setData(
                                                        "weekly_holidays",
                                                        e.target.checked
                                                            ? [...p.data.weekly_holidays, i]
                                                            : p.data.weekly_holidays.filter((x) => x !== i)
                                                    )
                                                }
                                            />
                                            <span className="font-medium text-slate-700">{day}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:col-span-2 pt-2">
                                <label className="flex cursor-pointer items-center text-sm font-medium text-slate-700">
                                    <input
                                        type="checkbox"
                                        className="mr-2.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={p.data.block_holiday_entry}
                                        onChange={(e) => p.setData("block_holiday_entry", e.target.checked)}
                                    />
                                    Block entry on holidays
                                </label>
                                <label className="flex cursor-pointer items-center text-sm font-medium text-slate-700">
                                    <input
                                        type="checkbox"
                                        className="mr-2.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={p.data.auto_absent_sms}
                                        onChange={(e) => p.setData("auto_absent_sms", e.target.checked)}
                                    />
                                    Enable automatic absent SMS
                                </label>
                            </div>

                            <div className="mt-2 sm:col-span-2">
                                <button className="w-full sm:w-auto rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95">
                                    Save policy
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Lock/Close Day Section */}
                    <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                        <h2 className="mb-4 sm:mb-5 text-lg font-bold text-slate-800">
                            Close Attendance Day
                        </h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                l.post(route("admin.attendance-control.lock"));
                            }}
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5"
                        >
                            <label className="text-sm font-semibold text-slate-700">
                                Type
                                <select
                                    className={input}
                                    value={l.data.attendance_type}
                                    onChange={(e) => l.setData("attendance_type", e.target.value)}
                                >
                                    <option value="student">Student</option>
                                    <option value="staff">Staff</option>
                                </select>
                            </label>

                            <label className="text-sm font-semibold text-slate-700">
                                Date
                                <input
                                    className={input}
                                    type="date"
                                    value={l.data.attendance_date}
                                    onChange={(e) => l.setData("attendance_date", e.target.value)}
                                />
                            </label>

                            {l.data.attendance_type === "student" && (
                                <>
                                    <label className="text-sm font-semibold text-slate-700">
                                        Class
                                        <select
                                            className={input}
                                            value={l.data.class_id}
                                            onChange={(e) => l.setData("class_id", e.target.value)}
                                        >
                                            <option value="">Select</option>
                                            {classes.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="text-sm font-semibold text-slate-700">
                                        Section
                                        <select
                                            className={input}
                                            value={l.data.section_id}
                                            onChange={(e) => l.setData("section_id", e.target.value)}
                                        >
                                            <option value="">All</option>
                                            {sections.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                </>
                            )}

                            <div className="mt-2 sm:col-span-2">
                                <button className="w-full sm:w-auto rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95">
                                    Lock day
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 flex-1 rounded-xl border border-slate-100 bg-slate-50 p-1">
                            {locks.length === 0 && (
                                <p className="p-4 text-center text-sm text-slate-500">No locked days found.</p>
                            )}
                            <div className="divide-y divide-slate-200">
                                {locks.map((r) => (
                                    <div
                                        key={r.id}
                                        className="flex items-center justify-between p-3 text-sm transition-colors hover:bg-white"
                                    >
                                        <span className="font-medium text-slate-700">
                                            {r.attendance_date} <span className="mx-1 text-slate-400">•</span>
                                            <span className="capitalize">{r.attendance_type}</span>
                                        </span>
                                        <button
                                            onClick={() => router.delete(route("admin.attendance-control.unlock", r.id))}
                                            className="rounded-lg bg-rose-50 px-3 py-1.5 font-semibold text-rose-600 transition-colors hover:bg-rose-100"
                                        >
                                            Reopen
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Holidays Section */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-slate-800">
                        Government / Academic Holidays
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {holidays.length ? (
                            holidays.map((h) => (
                                <div key={h.id} className="flex flex-col justify-center rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
                                    <span className="font-bold text-slate-800">{h.title}</span>
                                    <span className="mt-1 text-slate-500">{h.start_datetime}</span>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full rounded-xl border border-slate-100 bg-slate-50 p-6 text-center">
                                <p className="text-sm font-medium text-slate-500">
                                    No configured holidays.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </AuthenticatedLayout>
    );
}
