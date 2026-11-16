import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Pagination from "@/Components/Pagination";
import Icon from "@/Components/Icons";
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal";
import Swal from "sweetalert2";

const types = {
    counselling: "Counselling",
    guardian_meeting: "Guardian Meeting",
    scholarship: "Scholarship",
    co_curricular: "Co-curricular / Club",
    achievement: "Achievement / Award",
    behaviour: "Behaviour Observation",
    learning_support: "Learning Support",
    career_guidance: "Career Guidance",
};

const blank = {
    student_id: "", record_type: "counselling", record_date: new Date().toISOString().slice(0, 10),
    follow_up_date: "", title: "", period: "", amount: 0, score: "", status: "open", details: {}, notes: "",
};

// --- Custom Searchable Select Component ---
function SearchableSelect({ options, value, onChange, placeholder, error }) {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOpt = options.find((o) => String(o.value) === String(value));
    const filteredOptions = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="relative mt-1" ref={wrapperRef}>
            <div
                className={`w-full rounded-xl border bg-white p-2.5 text-sm cursor-pointer flex justify-between items-center ${error ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 hover:border-slate-300'}`}
                onClick={() => setOpen(!open)}
            >
                <span className={selectedOpt ? "text-slate-900 font-semibold truncate" : "text-slate-400"}>
                    {selectedOpt ? selectedOpt.label : placeholder}
                </span>
                <span className="text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
            </div>

            {open && (
                <div 
                    className="absolute z-[9999] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()} 
                >
                    <div className="p-2 sticky top-0 bg-white border-b border-slate-100 z-10">
                        <input
                            autoFocus
                            type="text"
                            className="w-full border-slate-300 rounded-lg text-sm px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Type to search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="p-3 text-sm text-slate-500 text-center">No student found</div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    className={`px-3 py-2.5 text-sm cursor-pointer rounded-lg hover:bg-emerald-50 transition-colors ${String(value) === String(opt.value) ? 'bg-emerald-100 font-bold text-emerald-800' : 'text-slate-700'}`}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setOpen(false);
                                        setSearch("");
                                    }}
                                >
                                    {opt.label}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Form Component ---
function Form({ item, students, close }) {
    const { data, setData, post, put, processing, errors } = useForm(
        item ? { ...blank, ...item, record_date: item.record_date?.slice(0, 10), follow_up_date: item.follow_up_date?.slice(0, 10) || "", details: item.details || {} } : blank,
    );

    const submit = (e) => {
        e.preventDefault();
        const o = { onSuccess: close, preserveScroll: true };
        item ? put(route("admin.student-development-records.update", item.id), o) : post(route("admin.student-development-records.store"), o);
    };

    const scholarship = data.record_type === "scholarship";

    const studentOptions = students.map(s => ({
        value: s.id,
        label: `${s.first_name} ${s.last_name || ''} (${s.admission_no})`
    }));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3" onClick={close}>
            <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-5 flex justify-between">
                    <div>
                        <h2 className="text-xl font-bold">{item ? "Edit" : "Add"} Student Record</h2>
                        <p className="text-sm text-slate-500">Student support, achievement and development</p>
                    </div>
                    <button type="button" onClick={close} className="text-slate-400 hover:text-rose-600">✕</button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    
                    <div className="text-sm font-semibold">
                        Student
                        <SearchableSelect 
                            options={studentOptions}
                            value={data.student_id}
                            onChange={(val) => setData("student_id", val)}
                            placeholder="Search & select student..."
                            error={errors.student_id}
                        />
                        {errors.student_id && <small className="text-rose-600 mt-1 block">{errors.student_id}</small>}
                    </div>

                    <label className="text-sm font-semibold">
                        Record type
                        <select value={data.record_type} onChange={(e) => setData("record_type", e.target.value)} className="mt-1 w-full rounded-xl border-slate-200">
                            {Object.entries(types).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </label>
                    <label className="text-sm font-semibold">
                        Record date
                        <input type="date" value={data.record_date} onChange={(e) => setData("record_date", e.target.value)} className="mt-1 w-full rounded-xl border-slate-200" />
                    </label>
                    <label className="text-sm font-semibold">
                        Follow-up date
                        <input type="date" value={data.follow_up_date || ""} onChange={(e) => setData("follow_up_date", e.target.value)} className="mt-1 w-full rounded-xl border-slate-200" />
                        {errors.follow_up_date && <small className="text-rose-600">{errors.follow_up_date}</small>}
                    </label>
                    <label className="text-sm font-semibold">
                        Title
                        <input value={data.title} onChange={(e) => setData("title", e.target.value)} placeholder="Session / activity / achievement title" className="mt-1 w-full rounded-xl border-slate-200" />
                        {errors.title && <small className="text-rose-600">{errors.title}</small>}
                    </label>
                    <label className="text-sm font-semibold">
                        Period
                        <input value={data.period || ""} onChange={(e) => setData("period", e.target.value)} placeholder="e.g. Session 2026" className="mt-1 w-full rounded-xl border-slate-200" />
                    </label>

                    {scholarship && (
                        <label className="text-sm font-semibold">
                            Scholarship amount
                            <input type="number" min="0" step=".01" value={data.amount} onChange={(e) => setData("amount", e.target.value)} className="mt-1 w-full rounded-xl border-slate-200" />
                        </label>
                    )}
                    {["behaviour", "learning_support", "co_curricular"].includes(data.record_type) && (
                        <label className="text-sm font-semibold">
                            Score / progress (%)
                            <input type="number" min="0" max="100" value={data.score} onChange={(e) => setData("score", e.target.value)} className="mt-1 w-full rounded-xl border-slate-200" />
                        </label>
                    )}
                    <label className="text-sm font-semibold">
                        Status
                        <select value={data.status} onChange={(e) => setData("status", e.target.value)} className="mt-1 w-full rounded-xl border-slate-200">
                            {["open", "in_progress", "resolved", "awarded", "completed", "cancelled"].map((x) => (
                                <option key={x} value={x}>{x.replace("_", " ")}</option>
                            ))}
                        </select>
                    </label>
                    <label className="text-sm font-semibold sm:col-span-2">
                        Notes
                        <textarea rows="4" value={data.notes || ""} onChange={(e) => setData("notes", e.target.value)} className="mt-1 w-full rounded-xl border-slate-200" />
                    </label>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={close} className="rounded-xl border px-5 py-2.5 hover:bg-slate-50 transition-colors">Cancel</button>
                    <button disabled={processing} className="rounded-xl bg-emerald-800 px-6 py-2.5 font-semibold text-white transition-opacity disabled:opacity-50">Save Record</button>
                </div>
            </form>
        </div>
    );
}

// --- Main Index Component ---
export default function Index({ records, studentList, filters, summary }) {
    const { flash } = usePage().props;
    
    // States
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(null);
    const [deleteId, setDeleteId] = useState(null); // Delete modal state

    // SweetAlert Flash Message Handle
    useEffect(() => {
        if (flash?.success) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
        }
    }, [flash]);

    // Filter Navigation
    const filter = (key, value) => router.get(route("admin.student-development-records.index"), { ...filters, [key]: value }, { preserveState: true, replace: true });

    // Handle Delete Confirm
    const handleDeleteConfirm = () => {
        if (deleteId) {
            router.delete(route("admin.student-development-records.destroy", deleteId), {
                preserveScroll: true,
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Student Development" />
            <div className="space-y-6 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-3 sm:flex-row items-center">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Students · Development</p>
                        <h1 className="text-2xl font-bold text-slate-900">Student Development & Support</h1>
                        <p className="text-sm text-slate-500">Counselling, scholarship, activities, achievements and learning support.</p>
                    </div>
                    <button onClick={() => { setEdit(null); setOpen(true); }} className="rounded-xl bg-emerald-800 px-5 py-2.5 font-semibold text-white hover:bg-emerald-900 transition-colors shadow-md">
                        <Icon name="plus" className="w-4 h-4 inline-block mr-2" />
                        Add Record
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {Object.entries(types).map(([k, l]) => (
                        <button key={k} onClick={() => filter("type", filters.type === k ? "" : k)} className={`rounded-xl border p-4 text-left transition-colors ${filters.type === k ? "border-emerald-700 bg-emerald-50" : "bg-white hover:border-slate-300"}`}>
                            <b className="block text-2xl">{summary[k] || 0}</b>
                            <span className="text-xs text-slate-500">{l}</span>
                        </button>
                    ))}
                </div>
                <div className="flex flex-col gap-3 rounded-xl border bg-white p-3 sm:flex-row">
                    <input defaultValue={filters.search || ""} onKeyDown={(e) => e.key === "Enter" && filter("search", e.currentTarget.value)} placeholder="Search student, admission no. or title..." className="flex-1 rounded-xl border-slate-200 px-4 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div className="overflow-x-auto rounded-2xl border bg-white">
                    <table className="w-full min-w-[850px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                {["Date", "Student", "Type / Title", "Follow-up", "Amount / Score", "Status"].map((x) => <th key={x} className="px-5 py-4">{x}</th>)}
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {records.data.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">{r.record_date}</td>
                                    <td className="px-5 py-4 font-semibold text-slate-800">
                                        {r.student?.first_name} {r.student?.last_name}
                                        <small className="block text-slate-400 font-medium">ID: {r.student?.admission_no}</small>
                                    </td>
                                    <td className="px-5 py-4">
                                        <b className="text-slate-800">{types[r.record_type]}</b>
                                        <small className="block text-slate-500 mt-0.5">{r.title}</small>
                                    </td>
                                    <td className="px-5 py-4 text-slate-600">{r.follow_up_date || "—"}</td>
                                    <td className="px-5 py-4 font-medium text-slate-700">
                                        {r.record_type === "scholarship" ? `৳ ${r.amount}` : r.score ? `${r.score}%` : "—"}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                            r.status === 'completed' || r.status === 'resolved' || r.status === 'awarded' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                            r.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                            r.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                            'bg-amber-50 text-amber-700 border border-amber-200'
                                        }`}>
                                            {r.status?.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {/* Edit Icon Button */}
                                            <button 
                                                onClick={() => { setEdit(r); setOpen(true); }} 
                                                className=" text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" 
                                                title="Edit Record"
                                            >
                                                <Icon name="edit" className="w-4 h-4" />
                                            </button>
                                            
                                            {/* Delete Icon Button */}
                                            <button 
                                                onClick={() => setDeleteId(r.id)} 
                                                className=" text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                                                title="Delete Record"
                                            >
                                                <Icon name="trash" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!records.data.length && (
                                <tr><td colSpan="7" className="p-12 text-center text-slate-500">No student development records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                    <div className="border-t border-slate-100 p-4">
                        <Pagination meta={records} />
                    </div>
                </div>
            </div>

            {/* Modal Components */}
            {open && <Form item={edit} students={studentList} close={() => setOpen(false)} />}
            
            {deleteId && (
                <ConfirmDeleteModal
                    item={{ name: "এই ডেভেলপমেন্ট রেকর্ডটি" }}
                    onCancel={() => setDeleteId(null)}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </AuthenticatedLayout>
    );
}