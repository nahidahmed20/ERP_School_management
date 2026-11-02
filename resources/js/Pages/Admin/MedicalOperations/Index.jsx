import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Index({ rooms, medicineStocks, alerts, appointments, issues, students }) {
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState('overview');

    const medicineForm = useForm({
        medicine_stock_id: '',
        user_id: '',
        quantity: '1',
        dosage: '',
        reason: ''
    });

    const appointmentForm = useForm({
        user_id: '',
        doctor_name: '',
        scheduled_at: '',
        location: '',
        reason: ''
    });

    const emergencyForm = useForm({
        user_id: '',
        severity: 'medium',
        message: '',
        location: ''
    });

    const submitMedicine = (e) => {
        e.preventDefault();
        medicineForm.post(route('medical.issue-medicine'), {
            onSuccess: () => medicineForm.reset(),
        });
    };

    const submitAppointment = (e) => {
        e.preventDefault();
        appointmentForm.post(route('medical.book-appointment'), {
            onSuccess: () => appointmentForm.reset(),
        });
    };

    const submitEmergency = (e) => {
        e.preventDefault();
        emergencyForm.post(route('medical.report-emergency'), {
            onSuccess: () => emergencyForm.reset(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Medical Operations</h2>}
        >
            <Head title="Medical Operations" />

            <div className="w-full space-y-5 px-3 py-4 sm:space-y-6 sm:px-5 sm:py-6 lg:px-8">
                <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <header className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-5 py-6 sm:px-7">
                        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">Medical Center</span>
                        <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Medical Operations</h1>
                        <p className="mt-1 text-sm text-slate-600">Monitor medical alerts, issue medicine, and manage appointments.</p>
                    </header>
                    <div className="p-4 sm:p-6">
                        
                        {/* Tabs */}
                        <div className="mb-6 flex overflow-x-auto border-b border-slate-200">
                            <button onClick={() => setActiveTab('overview')} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'overview' ? 'border-emerald-700 bg-emerald-50/60 text-emerald-800' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Overview</button>
                            <button onClick={() => setActiveTab('issue-medicine')} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'issue-medicine' ? 'border-emerald-700 bg-emerald-50/60 text-emerald-800' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Issue Medicine</button>
                            <button onClick={() => setActiveTab('appointment')} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'appointment' ? 'border-emerald-700 bg-emerald-50/60 text-emerald-800' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Book Appointment</button>
                            <button onClick={() => setActiveTab('emergency')} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'emergency' ? 'border-red-600 bg-red-50 text-red-700' : 'border-transparent text-red-600 hover:bg-red-50/60'}`}>Report Emergency</button>
                        </div>

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div>
                                <h3 className="mb-4 text-lg font-bold text-slate-900">Recent Emergency Alerts</h3>
                                <div className="mb-8 overflow-x-auto rounded-xl border border-rose-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-red-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase">Student</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase">Severity</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase">Message</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {alerts.length > 0 ? alerts.map(a => (
                                                <tr key={a.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">{a.user?.name || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-red-600 uppercase">{a.severity}</td>
                                                    <td className="px-6 py-4">{a.message}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(a.occurred_at).toLocaleString()}</td>
                                                </tr>
                                            )) : <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No emergency alerts.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="mb-4 text-lg font-bold text-slate-900">Recent Appointments</h3>
                                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {appointments.length > 0 ? appointments.map(a => (
                                                        <tr key={a.id}>
                                                            <td className="px-4 py-4 whitespace-nowrap">{a.user?.name || 'N/A'}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{a.doctor_name}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{new Date(a.scheduled_at).toLocaleDateString()}</td>
                                                        </tr>
                                                    )) : <tr><td colSpan="3" className="px-4 py-4 text-center text-gray-500">No appointments.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="mb-4 text-lg font-bold text-slate-900">Recent Medicine Issued</h3>
                                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {issues.length > 0 ? issues.map(i => (
                                                        <tr key={i.id}>
                                                            <td className="px-4 py-4 whitespace-nowrap">{i.user?.name || 'N/A'}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{i.medicineStock?.medicine_name || 'N/A'}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{i.quantity}</td>
                                                        </tr>
                                                    )) : <tr><td colSpan="3" className="px-4 py-4 text-center text-gray-500">No medicine issued recently.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Issue Medicine Tab */}
                        {activeTab === 'issue-medicine' && (
                            <form onSubmit={submitMedicine} className="grid max-w-4xl gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2 sm:p-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Select Student</label>
                                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={medicineForm.user_id} onChange={e => medicineForm.setData('user_id', e.target.value)} required>
                                        <option value="">-- Select Student --</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Select Medicine</label>
                                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={medicineForm.medicine_stock_id} onChange={e => medicineForm.setData('medicine_stock_id', e.target.value)} required>
                                        <option value="">-- Select Medicine --</option>
                                        {medicineStocks.map(m => <option key={m.id} value={m.id}>{m.medicine_name} (In Stock: {m.quantity})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                    <input type="number" min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={medicineForm.quantity} onChange={e => medicineForm.setData('quantity', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Dosage Instructions</label>
                                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={medicineForm.dosage} onChange={e => medicineForm.setData('dosage', e.target.value)} placeholder="e.g. 1 tablet after meal" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reason</label>
                                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={medicineForm.reason} onChange={e => medicineForm.setData('reason', e.target.value)} />
                                </div>
                                <button type="submit" disabled={medicineForm.processing} className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">Issue Medicine</button>
                            </form>
                        )}

                        {/* Book Appointment Tab */}
                        {activeTab === 'appointment' && (
                            <form onSubmit={submitAppointment} className="grid max-w-4xl gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2 sm:p-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Select Student</label>
                                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={appointmentForm.user_id} onChange={e => appointmentForm.setData('user_id', e.target.value)} required>
                                        <option value="">-- Select Student --</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Doctor Name</label>
                                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={appointmentForm.doctor_name} onChange={e => appointmentForm.setData('doctor_name', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                                    <input type="datetime-local" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={appointmentForm.scheduled_at} onChange={e => appointmentForm.setData('scheduled_at', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reason</label>
                                    <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={appointmentForm.reason} onChange={e => appointmentForm.setData('reason', e.target.value)}></textarea>
                                </div>
                                <button type="submit" disabled={appointmentForm.processing} className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">Book Appointment</button>
                            </form>
                        )}

                        {/* Emergency Tab */}
                        {activeTab === 'emergency' && (
                            <form onSubmit={submitEmergency} className="grid max-w-4xl gap-4 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 sm:grid-cols-2 sm:p-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Select Student</label>
                                    <select className="mt-1 block w-full rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500" value={emergencyForm.user_id} onChange={e => emergencyForm.setData('user_id', e.target.value)} required>
                                        <option value="">-- Select Student --</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                                    <select className="mt-1 block w-full rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500" value={emergencyForm.severity} onChange={e => emergencyForm.setData('severity', e.target.value)} required>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Emergency Message / Incident Details</label>
                                    <textarea className="mt-1 block w-full rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500" value={emergencyForm.message} onChange={e => emergencyForm.setData('message', e.target.value)} required rows="3"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Location (Optional)</label>
                                    <input type="text" className="mt-1 block w-full rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500" value={emergencyForm.location} onChange={e => emergencyForm.setData('location', e.target.value)} placeholder="e.g. Playground, Room 101" />
                                </div>
                                <button type="submit" disabled={emergencyForm.processing} className="w-full bg-red-600 text-white font-bold px-4 py-3 rounded shadow hover:bg-red-700">REPORT EMERGENCY</button>
                            </form>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
