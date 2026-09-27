import { Head, router, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';
import { useEffect } from 'react';

export default function Index({ logs, tab }) {
  const { flash } = usePage().props;

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  const deleteRecord = (id) => {
    if (confirm('Are you sure you want to delete this record?')) {
      router.delete(route('admin.vehicle-logs.destroy', { id, tab }), { preserveScroll: true });
    }
  };

  const TabButton = ({ name, label, icon }) => (
    <Link href={route('admin.vehicle-logs.index', { tab: name })} className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 ${tab === name ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
      <Icon name={icon} className="w-4 h-4" /> {label}
    </Link>
  );

  return (
    <AuthenticatedLayout>
      <Head title="Vehicle Logs & Expenses" />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vehicle Logs & Expenses</h1>
          <p className="text-sm text-slate-500">Track and manage fuel, maintenance, and other transport expenses.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <TabButton name="fuel" label="Fuel Logs" icon="droplet" />
            <TabButton name="maintenance" label="Maintenance" icon="tool" />
            <TabButton name="expense" label="Other Expenses" icon="dollar-sign" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Vehicle</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Details</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Amount/Cost</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.data.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-400">No records found.</td></tr> : logs.data.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-800">{item.vehicle_number}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{item.date || item.service_date || new Date(item.created_at).toISOString().split('T')[0]}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {tab === 'fuel' && <span>{item.litres}L @ ৳{item.unit_price} (Vendor: {item.vendor || 'N/A'})</span>}
                      {tab === 'maintenance' && <span>{item.type} <br/><small className="text-xs text-slate-400">{item.vendor} | Status: {item.status}</small></span>}
                      {tab === 'expense' && <span>{item.category} <br/><small className="text-xs text-slate-400">{item.notes || item.reference}</small></span>}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-800 font-mono">
                      ৳ {tab === 'fuel' ? (item.litres * item.unit_price).toFixed(2) : (item.cost || item.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteRecord(item.id)} className="p-2 text-slate-400 hover:text-rose-600"><Icon name="trash" className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-white border-t border-slate-100"><Pagination meta={logs} /></div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}