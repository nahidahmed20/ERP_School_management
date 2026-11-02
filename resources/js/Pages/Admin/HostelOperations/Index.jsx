import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Index({ allocations, roomChanges, attendances, visitors, clearances }) {
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState('overview');

    const roomChangeForm = useForm({
        hostel_allocation_id: '',
        to_room_id: '',
        to_bed_id: '',
        changed_at: new Date().toISOString().split('T')[0],
        reason: ''
    });

    const visitorForm = useForm({
        hostel_allocation_id: '',
        visitor_name: '',
        phone: '',
        relation: '',
        id_number: '',
        check_in_at: new Date().toISOString().slice(0, 16),
        purpose: ''
    });

    const submitRoomChange = (e) => {
        e.preventDefault();
        roomChangeForm.post(route('hostel.change-room'), {
            onSuccess: () => roomChangeForm.reset(),
        });
    };

    const submitVisitor = (e) => {
        e.preventDefault();
        visitorForm.post(route('hostel.visitor'), {
            onSuccess: () => visitorForm.reset(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Hostel Operations</h2>}
        >
            <Head title="Hostel Operations" />

            <div className="w-full space-y-5 px-3 py-4 sm:space-y-6 sm:px-5 sm:py-6 lg:px-8">
                <div className="w-full">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <header className="flex flex-col gap-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                            <div><span className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">Residence Management</span><h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Hostel Operations</h1><p className="mt-1 text-sm text-slate-600">Room changes, resident check-ins and visitor records.</p></div>
                            <div className="flex gap-2 text-xs font-bold"><span className="rounded-full bg-white px-3 py-1.5 text-slate-700 shadow-sm">{allocations.length} residents</span><span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-900">{visitors.length} recent visitors</span></div>
                        </header>
                        <div className="p-4 sm:p-6">
                        
                        {/* Tabs */}
                        <div className="mb-6 flex overflow-x-auto border-b border-slate-200">
                            <button onClick={() => setActiveTab('overview')} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'overview' ? 'border-emerald-700 bg-emerald-50/60 text-emerald-800' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Overview</button>
                            <button onClick={() => setActiveTab('change-room')} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'change-room' ? 'border-emerald-700 bg-emerald-50/60 text-emerald-800' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Change Room</button>
                            <button onClick={() => setActiveTab('visitor')} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'visitor' ? 'border-emerald-700 bg-emerald-50/60 text-emerald-800' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Visitor Log</button>
                        </div>

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div>
                                <h3 className="mb-4 text-lg font-bold text-slate-900">Recent Room Changes</h3>
                                <div className="mb-8 overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="min-w-full divide-y divide-slate-100">
                                        <thead className="bg-slate-50/70">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {roomChanges.length > 0 ? roomChanges.map(change => (
                                                <tr key={change.id} className="transition-colors hover:bg-slate-50/70">
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-800">{change.hostel_allocation?.user?.name || 'N/A'}</td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{new Date(change.changed_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">{change.reason}</td>
                                                </tr>
                                            )) : <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No recent room changes.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>

                                <h3 className="mb-4 text-lg font-bold text-slate-900">Recent Visitors</h3>
                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="min-w-full divide-y divide-slate-100">
                                        <thead className="bg-slate-50/70">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {visitors.length > 0 ? visitors.map(v => (
                                                <tr key={v.id} className="transition-colors hover:bg-slate-50/70">
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-800">{v.visitor_name} ({v.relation})</td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{v.hostel_allocation?.user?.name || 'N/A'}</td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{new Date(v.check_in_at).toLocaleString()}</td>
                                                </tr>
                                            )) : <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No recent visitors.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Room Change Tab */}
                        {activeTab === 'change-room' && (
                            <form onSubmit={submitRoomChange} className="grid max-w-3xl gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Select Allocation</label>
                                    <select 
                                        className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 shadow-sm transition focus:border-emerald-600 focus:ring-emerald-600/20"
                                        value={roomChangeForm.hostel_allocation_id}
                                        onChange={e => roomChangeForm.setData('hostel_allocation_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select --</option>
                                        {allocations.map(a => (
                                            <option key={a.id} value={a.id}>{a.user?.name} (Current: Room {a.room?.room_number})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">New Room ID</label>
                                    <input type="text" className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 shadow-sm transition focus:border-emerald-600 focus:ring-emerald-600/20" value={roomChangeForm.to_room_id} onChange={e => roomChangeForm.setData('to_room_id', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">New Bed ID</label>
                                    <input type="text" className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 shadow-sm transition focus:border-emerald-600 focus:ring-emerald-600/20" value={roomChangeForm.to_bed_id} onChange={e => roomChangeForm.setData('to_bed_id', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Date</label>
                                    <input type="date" className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 shadow-sm transition focus:border-emerald-600 focus:ring-emerald-600/20" value={roomChangeForm.changed_at} onChange={e => roomChangeForm.setData('changed_at', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Reason</label>
                                    <textarea className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 shadow-sm transition focus:border-emerald-600 focus:ring-emerald-600/20" value={roomChangeForm.reason} onChange={e => roomChangeForm.setData('reason', e.target.value)}></textarea>
                                </div>
                                <button type="submit" disabled={roomChangeForm.processing} className="self-end rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
                                    {roomChangeForm.processing ? 'Saving…' : 'Change Room'}
                                </button>
                            </form>
                        )}

                        {/* Visitor Tab */}
                        {activeTab === 'visitor' && (
                            <form onSubmit={submitVisitor} className="grid max-w-3xl gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Select Student (Allocation)</label>
                                    <select 
                                        className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 shadow-sm transition focus:border-emerald-600 focus:ring-emerald-600/20"
                                        value={visitorForm.hostel_allocation_id}
                                        onChange={e => visitorForm.setData('hostel_allocation_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select --</option>
                                        {allocations.map(a => (
                                            <option key={a.id} value={a.id}>{a.user?.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Visitor Name</label>
                                    <input type="text" className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 shadow-sm transition focus:border-emerald-600 focus:ring-emerald-600/20" value={visitorForm.visitor_name} onChange={e => visitorForm.setData('visitor_name', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Relation</label>
                                    <input type="text" className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 shadow-sm transition focus:border-emerald-600 focus:ring-emerald-600/20" value={visitorForm.relation} onChange={e => visitorForm.setData('relation', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Check In Time</label>
                                    <input type="datetime-local" className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 shadow-sm transition focus:border-emerald-600 focus:ring-emerald-600/20" value={visitorForm.check_in_at} onChange={e => visitorForm.setData('check_in_at', e.target.value)} required />
                                </div>
                                <button type="submit" disabled={visitorForm.processing} className="self-end rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
                                    {visitorForm.processing ? 'Saving…' : 'Record Visitor'}
                                </button>
                            </form>
                        )}

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
