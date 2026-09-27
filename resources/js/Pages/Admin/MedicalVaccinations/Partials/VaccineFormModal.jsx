import { useForm, usePage } from "@inertiajs/react";
import WorkingCampusField from "@/Components/WorkingCampusField";
import Icon from "@/Components/Icons";

export default function VaccineFormModal({ item, users, campuses, activeCampusId, onClose }) {
    const isEdit = !!item;
    const { auth } = usePage().props;
    const isSuperAdmin = auth?.user?.role === "super_admin" || auth?.user?.roles?.some((r) => r.name === "Super Admin");

    const { data, setData, post, put, processing, errors, reset } = useForm({
        campus_id: item?.campus_id ?? auth?.active_campus_id ?? activeCampusId ?? "",
        user_id: item?.user_id ?? "",
        vaccine_name: item?.vaccine_name ?? "",
        dose_number: item?.dose_number ?? "",
        date_administered: item?.date_administered ? item.date_administered.split("T")[0] : new Date().toISOString().split("T")[0],
        next_due_date: item?.next_due_date ? item.next_due_date.split("T")[0] : "",
        remarks: item?.remarks ?? "",
    });

    function submit(e) {
        e.preventDefault();
        const options = { onSuccess: () => { reset(); onClose(); } };
        if (isEdit) put(route("admin.medical.vaccinations.update", item.id), options);
        else post(route("admin.medical.vaccinations.store"), options);
    }

    const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
    const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{isEdit ? "Edit Vaccination Record" : "Add Vaccination Record"}</h3>
                        <p className="text-sm text-slate-500 mt-1">Configure administered vaccines and due dates.</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 bg-white border border-slate-200 shadow-sm shrink-0">
                        <Icon name="close" className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Assign to Campus <span className="text-rose-500">*</span></label>
                                <WorkingCampusField value={data.campus_id} campuses={campuses} className={`${inputClass} ${!isSuperAdmin ? "bg-slate-100 opacity-70" : "bg-white"}`} />
                                {errors.campus_id && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.campus_id}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className={labelClass}>Select Student / Staff <span className="text-rose-500">*</span></label>
                                <select value={data.user_id} onChange={(e) => setData("user_id", e.target.value)} required disabled={isEdit} className={`${inputClass} ${isEdit ? "bg-slate-100 opacity-70" : "bg-white"}`}>
                                    <option value="" disabled>Select Patient</option>
                                    {users.map((u) => (<option key={u.id} value={u.id}>{u.name} — {u.role}</option>))}
                                </select>
                                {errors.user_id && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.user_id}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Vaccine Name <span className="text-rose-500">*</span></label>
                                <input type="text" value={data.vaccine_name} onChange={(e) => setData("vaccine_name", e.target.value)} required placeholder="e.g. Covid-19, Polio" className={inputClass} />
                                {/* 🟢 FIX: Error Message Added */}
                                {errors.vaccine_name && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.vaccine_name}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Dose Number</label>
                                <input type="text" value={data.dose_number} onChange={(e) => setData("dose_number", e.target.value)} placeholder="e.g. 1st Dose, Booster" className={inputClass} />
                                {/* 🟢 FIX: Error Message Added */}
                                {errors.dose_number && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.dose_number}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Date Administered <span className="text-rose-500">*</span></label>
                                <input type="date" value={data.date_administered} onChange={(e) => setData("date_administered", e.target.value)} required className={`${inputClass} font-mono`} />
                                {/* 🟢 FIX: Error Message Added */}
                                {errors.date_administered && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.date_administered}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Next Due Date (Optional)</label>
                                <input type="date" value={data.next_due_date} onChange={(e) => setData("next_due_date", e.target.value)} className={`${inputClass} font-mono`} />
                                {/* 🟢 FIX: Error Message Added (This one often blocks submission silently) */}
                                {errors.next_due_date && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.next_due_date}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className={labelClass}>Remarks (Optional)</label>
                                <textarea rows="2" value={data.remarks} onChange={(e) => setData("remarks", e.target.value)} placeholder="Any reaction, specific brand name, or notes..." className={`${inputClass} resize-none`} />
                                {/* 🟢 FIX: Error Message Added */}
                                {errors.remarks && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.remarks}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
                        <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
                            Cancel
                        </button>
                        
                        <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md disabled:opacity-70 active:scale-95">
                            {processing ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Saving...
                              </>
                            ) : (
                              <><Icon name="save" className="w-4 h-4" /> Save Record</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}