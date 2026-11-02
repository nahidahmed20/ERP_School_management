import { Head, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Pagination from "@/Components/Pagination";
import Icon from "@/Components/Icons";
import { useState } from "react";

const C = "mt-1.5 w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15";
const Card = ({ title, children }) => (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h3 className="flex items-center gap-2 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 to-white px-4 py-3 font-extrabold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800"><Icon name="users" className="h-4 w-4" /></span>
            {title}
        </h3>
        <div className="space-y-3 p-4">{children}</div>
    </section>
);

export default function FamilyHub({ students, guardians, filters }) {
    const [open, setOpen] = useState(null),
        [search, setSearch] = useState(filters.search || "");
    const link = useForm({
        guardian_id: "",
        relationship: "guardian",
        is_primary: false,
        can_pickup: true,
        receives_sms: true,
        receives_email: true,
        custody_note: "",
    });
    const pickup = useForm({
        name: "",
        relationship: "",
        phone: "",
        national_id: "",
        valid_until: "",
    });
    const note = useForm({
        guardian_id: "",
        category: "general",
        note: "",
        is_confidential: false,
    });
    const consent = useForm({
        guardian_id: "",
        consent_type: "general",
        title: "",
        details: "",
        expires_at: "",
    });
    const submit = (form, url) => (e) => {
        e.preventDefault();
        form.post(url, { preserveScroll: true, onSuccess: () => form.reset() });
    };
    const updateClearance = (record, status) =>
        router.patch(
            route("admin.students.clearances.update", record.id),
            {
                status,
                amount_due: Number(record.amount_due || 0),
                remarks: record.remarks || "",
            },
            { preserveScroll: true },
        );

    return (
        <AuthenticatedLayout>
            <Head title="Student & Guardian Hub" />
            <div className="w-full max-w-none space-y-5 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
                <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-5 py-6 shadow-sm sm:px-7">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">Students / Family services</p>
                    <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Student & Guardian Hub</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        Manage family permissions, authorized pickup, consent forms and transfer clearance for each student.
                    </p>
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.get(
                            route("admin.students.family-hub"),
                            { search },
                            { preserveState: true },
                        );
                    }}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center"
                >
                    <div className="relative min-w-0 flex-1">
                    <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Student name or admission no"
                    />
                    </div>
                    <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 text-sm font-bold text-white transition hover:bg-emerald-900">
                        <Icon name="search" className="h-4 w-4" />
                        Search
                    </button>
                </form>
                <div className="space-y-4">
                    {students.data.map((student) => (
                        <section
                            key={student.id}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                        >
                            <button
                                onClick={() =>
                                    setOpen(
                                        open === student.id ? null : student.id,
                                    )
                                }
                                className="flex w-full flex-col gap-3 bg-gradient-to-r from-white via-white to-emerald-50/70 p-4 text-left transition hover:bg-emerald-50 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                            >
                                <span>
                                    <b className="block text-base font-extrabold text-slate-900">
                                        {student.first_name} {student.last_name}
                                    </b>
                                    <small className="mt-1 block text-xs text-slate-500 sm:ml-0">
                                        {student.admission_no} ·{" "}
                                        {
                                            student.current_enrollment
                                                ?.school_class?.name
                                        }{" "}
                                        /{" "}
                                        {
                                            student.current_enrollment?.section
                                                ?.name
                                        }
                                    </small>
                                </span>
                                <span className="inline-flex w-fit items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                                    {student.guardians.length} guardian ·{" "}
                                    {student.authorized_pickups.length} pickup
                                </span>
                            </button>
                            {open === student.id && (
                                <div className="grid gap-4 border-t border-slate-200 bg-slate-50/70 p-4 lg:grid-cols-2 2xl:grid-cols-4 sm:p-5">
                                    <Card title="Guardians & permissions">
                                        {student.guardians.map((guardian) => (
                                            <div
                                                key={guardian.id}
                                                className="mb-2 rounded-xl bg-slate-50 p-3 text-sm"
                                            >
                                                <div className="flex justify-between">
                                                    <b>
                                                        {guardian.father_name}
                                                    </b>
                                                    <span>
                                                        {guardian.pivot
                                                            .is_primary
                                                            ? "Primary"
                                                            : "Linked"}
                                                    </span>
                                                </div>
                                                <p>
                                                    {guardian.father_phone} ·{" "}
                                                    {
                                                        guardian.pivot
                                                            .relationship
                                                    }
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Pickup{" "}
                                                    {guardian.pivot.can_pickup
                                                        ? "✓"
                                                        : "×"}{" "}
                                                    · SMS{" "}
                                                    {guardian.pivot.receives_sms
                                                        ? "✓"
                                                        : "×"}{" "}
                                                    · Email{" "}
                                                    {guardian.pivot
                                                        .receives_email
                                                        ? "✓"
                                                        : "×"}
                                                </p>
                                                {guardian.pivot
                                                    .custody_note && (
                                                    <p className="mt-1 text-xs text-rose-600">
                                                        {
                                                            guardian.pivot
                                                                .custody_note
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                        <form
                                            onSubmit={submit(
                                                link,
                                                route(
                                                    "admin.students.guardians.link",
                                                    student.id,
                                                ),
                                            )}
                                            className="space-y-2"
                                        >
                                            <select
                                                className={C}
                                                value={link.data.guardian_id}
                                                onChange={(e) =>
                                                    link.setData(
                                                        "guardian_id",
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Link guardian
                                                </option>
                                                {guardians.map((guardian) => (
                                                    <option
                                                        key={guardian.id}
                                                        value={guardian.id}
                                                    >
                                                        {guardian.father_name} ·{" "}
                                                        {guardian.father_phone}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                className={C}
                                                value={link.data.relationship}
                                                onChange={(e) =>
                                                    link.setData(
                                                        "relationship",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Relationship"
                                            />
                                            <input
                                                className={C}
                                                value={link.data.custody_note}
                                                onChange={(e) =>
                                                    link.setData(
                                                        "custody_note",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Custody/restriction note"
                                            />
                                            <div className="flex flex-wrap gap-3 text-xs">
                                                {[
                                                    ["Primary", "is_primary"],
                                                    ["Pickup", "can_pickup"],
                                                    ["SMS", "receives_sms"],
                                                    ["Email", "receives_email"],
                                                ].map(([label, key]) => (
                                                    <label key={key}>
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                link.data[key]
                                                            }
                                                            onChange={(e) =>
                                                                link.setData(
                                                                    key,
                                                                    e.target
                                                                        .checked,
                                                                )
                                                            }
                                                        />{" "}
                                                        {label}
                                                    </label>
                                                ))}
                                            </div>
                                            <button className="rounded-xl bg-emerald-800 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900">
                                                Link
                                            </button>
                                        </form>
                                    </Card>
                                    <Card title="Authorized pickup">
                                        {student.authorized_pickups.map(
                                            (person) => (
                                                <div
                                                    key={person.id}
                                                    className="mb-2 rounded-xl bg-emerald-50 p-3 text-sm"
                                                >
                                                    <b>{person.name}</b>
                                                    <p>
                                                        {person.relationship} ·{" "}
                                                        {person.phone}
                                                    </p>
                                                    <p className="text-xs">
                                                        {person.verified_at
                                                            ? "Identity verified ✓"
                                                            : "Verification pending"}
                                                    </p>
                                                    <div className="mt-1 flex gap-3">
                                                        <button
                                                            onClick={() =>
                                                                router.patch(
                                                                    route(
                                                                        "admin.students.pickups.status",
                                                                        person.id,
                                                                    ),
                                                                    {
                                                                        is_verified:
                                                                            !person.verified_at,
                                                                    },
                                                                )
                                                            }
                                                            className="text-indigo-700"
                                                        >
                                                            {person.verified_at
                                                                ? "Unverify"
                                                                : "Verify ID"}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                router.patch(
                                                                    route(
                                                                        "admin.students.pickups.status",
                                                                        person.id,
                                                                    ),
                                                                    {
                                                                        is_active: false,
                                                                    },
                                                                )
                                                            }
                                                            className="text-rose-600"
                                                        >
                                                            Disable
                                                        </button>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                        <form
                                            onSubmit={submit(
                                                pickup,
                                                route(
                                                    "admin.students.pickups.store",
                                                    student.id,
                                                ),
                                            )}
                                            className="space-y-2"
                                        >
                                            <input
                                                className={C}
                                                required
                                                value={pickup.data.name}
                                                onChange={(e) =>
                                                    pickup.setData(
                                                        "name",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Full name"
                                            />
                                            <input
                                                className={C}
                                                required
                                                value={pickup.data.relationship}
                                                onChange={(e) =>
                                                    pickup.setData(
                                                        "relationship",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Relationship"
                                            />
                                            <input
                                                className={C}
                                                required
                                                value={pickup.data.phone}
                                                onChange={(e) =>
                                                    pickup.setData(
                                                        "phone",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Phone"
                                            />
                                            <input
                                                className={C}
                                                value={pickup.data.national_id}
                                                onChange={(e) =>
                                                    pickup.setData(
                                                        "national_id",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="National ID"
                                            />
                                            <input
                                                className={C}
                                                type="date"
                                                value={pickup.data.valid_until}
                                                onChange={(e) =>
                                                    pickup.setData(
                                                        "valid_until",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white">
                                                Authorize
                                            </button>
                                        </form>
                                    </Card>
                                    <Card title="Consent & permission">
                                        {student.parent_consents.map((item) => (
                                            <div
                                                key={item.id}
                                                className="mb-2 rounded-xl bg-violet-50 p-3 text-sm"
                                            >
                                                <b>{item.title}</b>
                                                <p>
                                                    {item.responded_at
                                                        ? item.is_granted
                                                            ? "Granted"
                                                            : "Declined"
                                                        : "Awaiting response"}
                                                </p>
                                            </div>
                                        ))}
                                        <form
                                            onSubmit={submit(
                                                consent,
                                                route(
                                                    "admin.students.consents.store",
                                                    student.id,
                                                ),
                                            )}
                                            className="space-y-2"
                                        >
                                            <select
                                                className={C}
                                                required
                                                value={consent.data.guardian_id}
                                                onChange={(e) =>
                                                    consent.setData(
                                                        "guardian_id",
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select linked guardian
                                                </option>
                                                {student.guardians.map(
                                                    (guardian) => (
                                                        <option
                                                            key={guardian.id}
                                                            value={guardian.id}
                                                        >
                                                            {
                                                                guardian.father_name
                                                            }
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            <input
                                                className={C}
                                                required
                                                value={consent.data.title}
                                                onChange={(e) =>
                                                    consent.setData(
                                                        "title",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Consent title"
                                            />
                                            <select
                                                className={C}
                                                value={
                                                    consent.data.consent_type
                                                }
                                                onChange={(e) =>
                                                    consent.setData(
                                                        "consent_type",
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option>general</option>
                                                <option>trip</option>
                                                <option>media</option>
                                                <option>medical</option>
                                                <option>activity</option>
                                            </select>
                                            <textarea
                                                className={C}
                                                value={consent.data.details}
                                                onChange={(e) =>
                                                    consent.setData(
                                                        "details",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Terms/details"
                                            />
                                            <input
                                                className={C}
                                                type="datetime-local"
                                                value={consent.data.expires_at}
                                                onChange={(e) =>
                                                    consent.setData(
                                                        "expires_at",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <button className="rounded-xl bg-emerald-800 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900">
                                                Assign consent
                                            </button>
                                        </form>
                                    </Card>
                                    <Card title="Clearance & case notes">
                                        {student.clearances.map((record) => (
                                            <div
                                                key={record.id}
                                                className="mb-2 rounded-xl bg-blue-50 p-3 text-sm"
                                            >
                                                <div className="flex justify-between">
                                                    <b>{record.department}</b>
                                                    <span>{record.status}</span>
                                                </div>
                                                <p>Due: ৳{record.amount_due}</p>
                                                {record.status !==
                                                    "cleared" && (
                                                    <div className="mt-1 flex gap-3">
                                                        <button
                                                            className="text-emerald-700"
                                                            onClick={() =>
                                                                updateClearance(
                                                                    record,
                                                                    "cleared",
                                                                )
                                                            }
                                                        >
                                                            Clear
                                                        </button>
                                                        <button
                                                            className="text-rose-700"
                                                            onClick={() =>
                                                                updateClearance(
                                                                    record,
                                                                    "blocked",
                                                                )
                                                            }
                                                        >
                                                            Block
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {student.guardian_notes.map((item) => (
                                            <div
                                                key={item.id}
                                                className="mb-2 rounded-xl bg-amber-50 p-3 text-sm"
                                            >
                                                <b>
                                                    {item.category}
                                                    {item.is_confidential
                                                        ? " · Confidential"
                                                        : ""}
                                                </b>
                                                <p>{item.note}</p>
                                            </div>
                                        ))}
                                        <form
                                            onSubmit={submit(
                                                note,
                                                route(
                                                    "admin.students.guardian-notes.store",
                                                    student.id,
                                                ),
                                            )}
                                            className="space-y-2"
                                        >
                                            <select
                                                className={C}
                                                value={note.data.category}
                                                onChange={(e) =>
                                                    note.setData(
                                                        "category",
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                {[
                                                    "general",
                                                    "custody",
                                                    "communication",
                                                    "emergency",
                                                    "academic",
                                                ].map((value) => (
                                                    <option key={value}>
                                                        {value}
                                                    </option>
                                                ))}
                                            </select>
                                            <textarea
                                                className={C}
                                                required
                                                value={note.data.note}
                                                onChange={(e) =>
                                                    note.setData(
                                                        "note",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Case note"
                                            />
                                            <label className="block text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        note.data
                                                            .is_confidential
                                                    }
                                                    onChange={(e) =>
                                                        note.setData(
                                                            "is_confidential",
                                                            e.target.checked,
                                                        )
                                                    }
                                                />{" "}
                                                Confidential
                                            </label>
                                            <button className="rounded-xl bg-emerald-800 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900">
                                                Save note
                                            </button>
                                        </form>
                                    </Card>
                                </div>
                            )}
                        </section>
                    ))}
                </div>
                <Pagination meta={students} />
            </div>
        </AuthenticatedLayout>
    );
}
