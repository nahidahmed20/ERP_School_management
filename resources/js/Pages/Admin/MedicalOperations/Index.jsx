import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';
import { useEffect } from 'react';

const C = 'mt-1 w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all px-4 py-2.5';
const Box = ({ title, children, icon }) => (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
            {icon && <Icon name={icon} className="w-5 h-5 text-indigo-500" />}
            <h2 className="font-bold text-slate-800 text-lg">{title}</h2>
        </div>
        {children}
    </section>
);

export default function Index({ people, students, profiles, medicines, issues, appointments, consents, alerts, documents, vaccinations, summary }) {
    const { flash } = usePage().props;
    const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Dhaka' }).slice(0, 16);
    const today = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
        if (flash?.warning) Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: flash.warning, showConfirmButton: false, timer: 4000 });
    }, [flash]);

    const pr = useForm({ user_id: '', blood_group: '', allergies: '', chronic_conditions: '', emergency_contact: '', emergency_alert: false, emergency_instructions: '' });
    const co = useForm({ student_id: '', consent_type: 'general_treatment', is_granted: true, valid_from: today, valid_until: '', restrictions: '', signed_name: '' });
    const mi = useForm({ medicine_stock_id: '', user_id: '', quantity: 1, dosage: '', prescribed_by: '', reason: '' });
    const ap = useForm({ user_id: '', doctor_name: '', scheduled_at: now, location: '', reason: '' });
    const em = useForm({ user_id: '', severity: 'serious', message: '', location: '' });
    const doc = useForm({ user_id: '', title: '', document_type: 'medical_report', document_date: today, visibility: 'medical_only', file: null });

    const post = (f, n) => e => {
        e.preventDefault();
        f.post(route(n), { preserveScroll: true, forceFormData: n === 'admin.medical.documents', onSuccess: () => f.reset() });
    };

    const personSelect = (f) => (
        <select className={C} value={f.data.user_id} onChange={e => f.setData('user_id', e.target.value)} required>
            <option value="" disabled>Select Student / Staff</option>
            {people.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Medical Operations Dashboard" />
            <main className="mx-auto max-w-7xl space-y-8 p-6">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Hospital & Clinic</span>
                        <h1 className="text-3xl font-black text-slate-900 mt-1">Medical Operations</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage restricted clinical data, medicine issues, appointments, and emergency response.</p>
                    </div>
                </div>

                {/* Summary Widgets */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(summary).map(([k, v]) => (
                        <div key={k} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${k.includes('emergency') ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                <Icon name={k.includes('emergency') ? 'alert-triangle' : k.includes('Stock') ? 'archive' : 'activity'} className="w-6 h-6" />
                            </div>
                            <div>
                                <small className="block font-semibold text-slate-500 uppercase tracking-wider text-[10px]">{k.replace(/([A-Z])/g, ' $1')}</small>
                                <b className="block text-2xl font-black text-slate-900">{v}</b>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Operations Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    
                    {/* Column 1 */}
                    <div className="space-y-6">
                        <Box title="Issue Medicine to Patient" icon="briefcase-medical">
                            <form onSubmit={post(mi, 'admin.medical.medicine-issue')} className="space-y-3">
                                <select className={C} value={mi.data.medicine_stock_id} onChange={e => mi.setData('medicine_stock_id', e.target.value)} required>
                                    <option value="" disabled>Select Medicine from Stock</option>
                                    {medicines.map(x => <option key={x.id} value={x.id}>{x.medicine_name} (Stock: {x.quantity})</option>)}
                                </select>
                                {personSelect(mi)}
                                <div className="grid grid-cols-2 gap-3">
                                    <input className={C} type="number" min="1" placeholder="Quantity" value={mi.data.quantity} onChange={e => mi.setData('quantity', e.target.value)} required />
                                    <input className={C} placeholder="Dosage (e.g. 1+1+1)" value={mi.data.dosage} onChange={e => mi.setData('dosage', e.target.value)} />
                                </div>
                                <input className={C} placeholder="Prescribed By (Optional)" value={mi.data.prescribed_by} onChange={e => mi.setData('prescribed_by', e.target.value)} />
                                <input className={C} placeholder="Reason / Symptoms" value={mi.data.reason} onChange={e => mi.setData('reason', e.target.value)} />
                                <button disabled={mi.processing} className="w-full mt-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-70">Issue Medicine</button>
                            </form>
                        </Box>

                        <Box title="Emergency Guardian Alert" icon="alert-circle">
                            <form onSubmit={post(em, 'admin.medical.emergency')} className="space-y-3">
                                {personSelect(em)}
                                <select className={C} value={em.data.severity} onChange={e => em.setData('severity', e.target.value)}>
                                    <option value="moderate">Moderate</option>
                                    <option value="serious">Serious</option>
                                    <option value="critical">Critical</option>
                                </select>
                                <textarea className={`${C} resize-none`} rows="2" required placeholder="Describe the emergency..." value={em.data.message} onChange={e => em.setData('message', e.target.value)} />
                                <input className={C} placeholder="Current Location" value={em.data.location} onChange={e => em.setData('location', e.target.value)} />
                                <button disabled={em.processing} className="w-full mt-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                                    <Icon name="bell" className="w-4 h-4" /> Send Emergency SMS Alert
                                </button>
                            </form>
                        </Box>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-6">
                        <Box title="Book Doctor Appointment" icon="calendar">
                            <form onSubmit={post(ap, 'admin.medical.appointments')} className="space-y-3">
                                {personSelect(ap)}
                                <input className={C} required placeholder="Doctor Name" value={ap.data.doctor_name} onChange={e => ap.setData('doctor_name', e.target.value)} />
                                <input className={C} required type="datetime-local" value={ap.data.scheduled_at} onChange={e => ap.setData('scheduled_at', e.target.value)} />
                                <input className={C} placeholder="Location / Room" value={ap.data.location} onChange={e => ap.setData('location', e.target.value)} />
                                <textarea className={`${C} resize-none`} rows="2" placeholder="Reason for visit" value={ap.data.reason} onChange={e => ap.setData('reason', e.target.value)} />
                                <button disabled={ap.processing} className="w-full mt-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-colors disabled:opacity-70">Book Appointment</button>
                            </form>
                        </Box>

                        <Box title="Medical Consent (Guardian)" icon="file-text">
                            <form onSubmit={post(co, 'admin.medical.consent')} className="space-y-3">
                                <select className={C} value={co.data.student_id} onChange={e => co.setData('student_id', e.target.value)} required>
                                    <option value="" disabled>Select Student</option>
                                    {students.map(x => <option key={x.id} value={x.id}>{x.first_name} {x.last_name} ({x.admission_no})</option>)}
                                </select>
                                <select className={C} value={co.data.consent_type} onChange={e => co.setData('consent_type', e.target.value)}>
                                    <option value="general_treatment">General Treatment</option>
                                    <option value="medicine">Medicine Administration</option>
                                    <option value="emergency_transfer">Emergency Transfer</option>
                                    <option value="vaccination">Vaccination</option>
                                    <option value="procedure">Special Procedure</option>
                                </select>
                                <div className="grid grid-cols-2 gap-3">
                                    <input className={C} type="date" required title="Valid From" value={co.data.valid_from} onChange={e => co.setData('valid_from', e.target.value)} />
                                    <input className={C} type="date" title="Valid Until (Optional)" value={co.data.valid_until} onChange={e => co.setData('valid_until', e.target.value)} />
                                </div>
                                <input className={C} required placeholder="Guardian's Signed Name" value={co.data.signed_name} onChange={e => co.setData('signed_name', e.target.value)} />
                                <textarea className={`${C} resize-none`} rows="1" placeholder="Any Restrictions?" value={co.data.restrictions} onChange={e => co.setData('restrictions', e.target.value)} />
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-50 p-2 border rounded-xl cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" checked={co.data.is_granted} onChange={e => co.setData('is_granted', e.target.checked)} />
                                    Consent is Granted
                                </label>
                                <button disabled={co.processing} className="w-full mt-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-70">Save Consent</button>
                            </form>
                        </Box>
                    </div>

                    {/* Column 3 */}
                    <div className="space-y-6">
                        <Box title="Restricted Medical Profile" icon="user-check">
                            <form onSubmit={post(pr, 'admin.medical.profile')} className="space-y-3">
                                {personSelect(pr)}
                                <input className={C} placeholder="Blood Group (e.g. A+)" value={pr.data.blood_group} onChange={e => pr.setData('blood_group', e.target.value)} />
                                <input className={C} placeholder="Emergency Contact No." value={pr.data.emergency_contact} onChange={e => pr.setData('emergency_contact', e.target.value)} />
                                <textarea className={`${C} resize-none`} rows="2" placeholder="Allergies (if any)" value={pr.data.allergies} onChange={e => pr.setData('allergies', e.target.value)} />
                                <textarea className={`${C} resize-none`} rows="2" placeholder="Chronic Conditions" value={pr.data.chronic_conditions} onChange={e => pr.setData('chronic_conditions', e.target.value)} />
                                <textarea className={`${C} resize-none`} rows="2" placeholder="Emergency Instructions" value={pr.data.emergency_instructions} onChange={e => pr.setData('emergency_instructions', e.target.value)} />
                                <label className="flex items-center gap-2 text-sm font-bold text-rose-700 bg-rose-50 p-2 border border-rose-100 rounded-xl cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500" checked={pr.data.emergency_alert} onChange={e => pr.setData('emergency_alert', e.target.checked)} />
                                    Show Prominent Emergency Warning
                                </label>
                                <button disabled={pr.processing} className="w-full mt-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-70">Update Profile</button>
                            </form>
                        </Box>

                        <Box title="Secure Document Upload" icon="upload-cloud">
                            <form onSubmit={post(doc, 'admin.medical.documents')} className="space-y-3">
                                {personSelect(doc)}
                                <input className={C} required placeholder="Document Title" value={doc.data.title} onChange={e => doc.setData('title', e.target.value)} />
                                <select className={C} value={doc.data.visibility} onChange={e => doc.setData('visibility', e.target.value)}>
                                    <option value="medical_only">Medical Staff Only (Restricted)</option>
                                    <option value="guardian">Visible to Guardian</option>
                                    <option value="student">Visible to Student/Staff</option>
                                </select>
                                <input className={C} type="file" required accept=".pdf,.jpg,.jpeg,.png" onChange={e => doc.setData('file', e.target.files[0])} />
                                <button disabled={doc.processing} className="w-full mt-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-70 flex items-center justify-center gap-2">
                                    <Icon name="lock" className="w-4 h-4" /> Secure Upload
                                </button>
                            </form>
                        </Box>
                    </div>

                </div>

                {/* Bottom Report Tables */}
                <div className="grid gap-6 lg:grid-cols-2">
                    
                    <Box title="Today's Appointments" icon="calendar">
                        <div className="space-y-2">
                            {appointments.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">No appointments today.</p>}
                            {appointments.map(x => (
                                <div key={x.id} className="flex justify-between items-center rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
                                    <div>
                                        <b className="text-slate-800">{x.doctor_name}</b>
                                        <small className="block text-slate-500 font-mono mt-0.5">{new Date(x.scheduled_at).toLocaleString()} · {x.status.toUpperCase()}</small>
                                    </div>
                                    {x.status === 'scheduled' && (
                                        <button onClick={() => router.patch(route('admin.medical.appointments.status', x.id), { status: 'completed' }, { preserveScroll: true })} className="font-bold text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-200">
                                            Complete
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Box>

                    <Box title="Upcoming Vaccinations (Queue)" icon="shield">
                        <div className="space-y-2">
                            {vaccinations.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">No upcoming vaccinations.</p>}
                            {vaccinations.map(x => (
                                <div key={x.id} className="flex justify-between items-center rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
                                    <div>
                                        <b className="text-slate-800">{x.user?.name}</b>
                                        <small className="block text-slate-500 mt-0.5">{x.vaccine_name} {x.dose_number && `(${x.dose_number})`}</small>
                                    </div>
                                    <span className="font-bold text-amber-700 font-mono bg-amber-50 px-2 py-1 rounded">{new Date(x.next_due_date).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-xs font-semibold text-slate-400 flex gap-1.5 items-center">
                            <Icon name="info" className="w-3.5 h-3.5" /> SMS reminders are sent automatically 7 days before due date.
                        </p>
                    </Box>

                </div>

            </main>
        </AuthenticatedLayout>
    );
}