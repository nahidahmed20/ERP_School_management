import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';
import { useEffect } from 'react';

export default function Index({ boardings }) {
  const { flash } = usePage().props;

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  const deleteRecord = (id) => {
    if (confirm('Delete this boarding record?')) {
      router.delete(route('admin.transport-boarding.destroy', id), { preserveScroll: true });
    }
  };

  const getEventBadge = (event) => {
    if (event === 'boarded') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (event === 'dropped') return 'bg-sky-50 text-sky-700 border-sky-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <AuthenticatedLayout>
      <Head title="Boarding History" />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Boarding History</h1>
          <p className="text-sm text-slate-500">Track daily student pickups and drop-offs.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Passenger / Point</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Vehicle</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date & Trip</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Event Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {boardings.data.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-slate-400">No records found.</td></tr> : boardings.data.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <b className="block text-slate-900">{item.passenger_name}</b>
                      <span className="text-xs text-slate-500">{item.pickup_point}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{item.vehicle_number}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      {item.trip_date}<br/><span className="uppercase text-xs font-bold text-indigo-500">{item.trip_type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{new Date(item.event_at).toLocaleTimeString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase border ${getEventBadge(item.event)}`}>{item.event}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteRecord(item.id)} className="p-2 text-slate-400 hover:text-rose-600"><Icon name="trash" className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-white border-t border-slate-100"><Pagination meta={boardings} /></div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}