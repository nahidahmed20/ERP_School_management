import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Index({ outlets, orders, refundRequests, cashClosings }) {
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState('overview');

    const refundForm = useForm({
        cafeteria_order_id: '',
        type: 'partial',
        amount: '',
        reason: ''
    });

    const cashClosingForm = useForm({
        cafeteria_outlet_id: '',
        business_date: new Date().toISOString().split('T')[0],
        opening_cash: '0',
        cash_sales: '0',
        refunds: '0',
        expected_cash: '0',
        counted_cash: '',
        notes: ''
    });

    const calculateExpected = (opening, sales, refunds) => {
        const o = parseFloat(opening) || 0;
        const s = parseFloat(sales) || 0;
        const r = parseFloat(refunds) || 0;
        return (o + s - r).toFixed(2);
    };

    const handleCashInput = (field, value) => {
        const updatedForm = { ...cashClosingForm.data, [field]: value };
        const expected = calculateExpected(updatedForm.opening_cash, updatedForm.cash_sales, updatedForm.refunds);
        cashClosingForm.setData({ ...updatedForm, expected_cash: expected });
    };

    const submitRefund = (e) => {
        e.preventDefault();
        refundForm.post(route('cafeteria.pos.refund'), {
            onSuccess: () => refundForm.reset(),
        });
    };

    const submitCashClosing = (e) => {
        e.preventDefault();
        cashClosingForm.post(route('cafeteria.pos.close-cash'), {
            onSuccess: () => cashClosingForm.reset(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Cafeteria POS Operations</h2>}
        >
            <Head title="Cafeteria POS" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">

                        {/* Tabs */}
                        <div className="flex border-b mb-6 space-x-4">
                            <button onClick={() => setActiveTab('overview')} className={`py-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}>Overview</button>
                            <button onClick={() => setActiveTab('refunds')} className={`py-2 px-4 ${activeTab === 'refunds' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}>Request Refund</button>
                            <button onClick={() => setActiveTab('cash-closing')} className={`py-2 px-4 ${activeTab === 'cash-closing' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}>Cash Closing</button>
                        </div>

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Refund Requests</h3>
                                <div className="overflow-x-auto mb-8">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {refundRequests.length > 0 ? refundRequests.map(req => (
                                                <tr key={req.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">#{req.cafeteria_order_id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">৳{req.amount} ({req.type})</td>
                                                    <td className="px-6 py-4">{req.reason}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-800' : req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )) : <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No refund requests found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>

                                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Cash Closings</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outlet</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Cash</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Counted Cash</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {cashClosings.length > 0 ? cashClosings.map(cc => (
                                                <tr key={cc.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">{cc.outlet?.name || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(cc.business_date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">৳{cc.expected_cash}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">৳{cc.counted_cash}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-red-600">৳{cc.variance}</td>
                                                </tr>
                                            )) : <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No cash closings recorded.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Refunds Tab */}
                        {activeTab === 'refunds' && (
                            <form onSubmit={submitRefund} className="space-y-4 max-w-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Select Order</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        value={refundForm.cafeteria_order_id}
                                        onChange={e => refundForm.setData('cafeteria_order_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select Order --</option>
                                        {orders.map(o => (
                                            <option key={o.id} value={o.id}>Order #{o.id} - ৳{o.total_amount}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Refund Type</label>
                                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={refundForm.type} onChange={e => refundForm.setData('type', e.target.value)}>
                                        <option value="partial">Partial</option>
                                        <option value="full">Full</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount (৳)</label>
                                    <input type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={refundForm.amount} onChange={e => refundForm.setData('amount', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reason</label>
                                    <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={refundForm.reason} onChange={e => refundForm.setData('reason', e.target.value)} required></textarea>
                                </div>
                                <button type="submit" disabled={refundForm.processing} className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">
                                    Submit Request
                                </button>
                            </form>
                        )}

                        {/* Cash Closing Tab */}
                        {activeTab === 'cash-closing' && (
                            <form onSubmit={submitCashClosing} className="space-y-4 max-w-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cafeteria Outlet</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        value={cashClosingForm.cafeteria_outlet_id}
                                        onChange={e => cashClosingForm.setData('cafeteria_outlet_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select Outlet --</option>
                                        {outlets.map(o => (
                                            <option key={o.id} value={o.id}>{o.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Business Date</label>
                                    <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={cashClosingForm.business_date} onChange={e => cashClosingForm.setData('business_date', e.target.value)} required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Opening Cash (৳)</label>
                                        <input type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={cashClosingForm.opening_cash} onChange={e => handleCashInput('opening_cash', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Cash Sales (৳)</label>
                                        <input type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={cashClosingForm.cash_sales} onChange={e => handleCashInput('cash_sales', e.target.value)} required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Refunds Given (৳)</label>
                                        <input type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={cashClosingForm.refunds} onChange={e => handleCashInput('refunds', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 font-bold">Expected Cash (৳)</label>
                                        <input type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100" value={cashClosingForm.expected_cash} readOnly />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 font-bold text-blue-600">Actual Counted Cash In Drawer (৳)</label>
                                    <input type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={cashClosingForm.counted_cash} onChange={e => cashClosingForm.setData('counted_cash', e.target.value)} required />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Notes / Reasons for Variance</label>
                                    <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={cashClosingForm.notes} onChange={e => cashClosingForm.setData('notes', e.target.value)}></textarea>
                                </div>
                                <button type="submit" disabled={cashClosingForm.processing} className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">
                                    Finalize Cash Closing
                                </button>
                            </form>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

