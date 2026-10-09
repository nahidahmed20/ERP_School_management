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

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Tabs */}
                        <div className="flex border-b mb-6 space-x-4 overflow-x-auto">
                            <button onClick={() => setActiveTab('overview')} className={`py-2 px-4 whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}>Overview</button>
                            <button onClick={() => setActiveTab('issue-medicine')} className={`py-2 px-4 whitespace-nowrap ${activeTab === 'issue-medicine' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}>Issue Medicine</button>
                            <button onClick={() => setActiveTab('appointment')} className={`py-2 px-4 whitespace-nowrap ${activeTab === 'appointment' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}>Book Appointment</button>
                            <button onClick={() => setActiveTab('emergency')} className={`py-2 px-4 whitespace-nowrap ${activeTab === 'emergency' ? 'border-b-2 border-red-500 text-red-600 font-bold' : 'text-red-500'}`}>Report Emergency</button>
                        </div>

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Emergency Alerts</h3>
                                <div className="overflow-x-auto mb-8 border border-red-200 rounded-md">
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
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Appointments</h3>
                                        <div className="overflow-x-auto border rounded-md">
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
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Medicine Issued</h3>
                                        <div className="overflow-x-auto border rounded-md">
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
                            <form onSubmit={submitMedicine} className="space-y-4 max-w-lg">
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
                            <form onSubmit={submitAppointment} className="space-y-4 max-w-lg">
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
                            <form onSubmit={submitEmergency} className="space-y-4 max-w-lg bg-red-50 p-6 rounded-md border border-red-200">
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