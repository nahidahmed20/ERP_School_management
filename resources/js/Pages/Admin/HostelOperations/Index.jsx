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

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Tabs */}
                        <div className="flex border-b mb-6">
                            <button onClick={() => setActiveTab('overview')} className={`py-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}>Overview</button>
                            <button onClick={() => setActiveTab('change-room')} className={`py-2 px-4 ${activeTab === 'change-room' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}>Change Room</button>
                            <button onClick={() => setActiveTab('visitor')} className={`py-2 px-4 ${activeTab === 'visitor' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}>Visitor Log</button>
                        </div>

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Room Changes</h3>
                                <div className="overflow-x-auto mb-8">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {roomChanges.length > 0 ? roomChanges.map(change => (
                                                <tr key={change.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">{change.hostel_allocation?.user?.name || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(change.changed_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">{change.reason}</td>
                                                </tr>
                                            )) : <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No recent room changes.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>

                                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Visitors</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {visitors.length > 0 ? visitors.map(v => (
                                                <tr key={v.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">{v.visitor_name} ({v.relation})</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{v.hostel_allocation?.user?.name || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(v.check_in_at).toLocaleString()}</td>
                                                </tr>
                                            )) : <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No recent visitors.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Room Change Tab */}
                        {activeTab === 'change-room' && (
                            <form onSubmit={submitRoomChange} className="space-y-4 max-w-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Select Allocation</label>
                                    <select 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                                    <label className="block text-sm font-medium text-gray-700">New Room ID</label>
                                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={roomChangeForm.to_room_id} onChange={e => roomChangeForm.setData('to_room_id', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">New Bed ID</label>
                                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={roomChangeForm.to_bed_id} onChange={e => roomChangeForm.setData('to_bed_id', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date</label>
                                    <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={roomChangeForm.changed_at} onChange={e => roomChangeForm.setData('changed_at', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reason</label>
                                    <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={roomChangeForm.reason} onChange={e => roomChangeForm.setData('reason', e.target.value)}></textarea>
                                </div>
                                <button type="submit" disabled={roomChangeForm.processing} className="bg-indigo-600 text-white px-4 py-2 rounded">
                                    Change Room
                                </button>
                            </form>
                        )}

                        {/* Visitor Tab */}
                        {activeTab === 'visitor' && (
                            <form onSubmit={submitVisitor} className="space-y-4 max-w-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Select Student (Allocation)</label>
                                    <select 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                                    <label className="block text-sm font-medium text-gray-700">Visitor Name</label>
                                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={visitorForm.visitor_name} onChange={e => visitorForm.setData('visitor_name', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Relation</label>
                                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={visitorForm.relation} onChange={e => visitorForm.setData('relation', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Check In Time</label>
                                    <input type="datetime-local" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={visitorForm.check_in_at} onChange={e => visitorForm.setData('check_in_at', e.target.value)} required />
                                </div>
                                <button type="submit" disabled={visitorForm.processing} className="bg-indigo-600 text-white px-4 py-2 rounded">
                                    Record Visitor
                                </button>
                            </form>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
