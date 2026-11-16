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
      <div className="w-full space-y-5 px-3 py-4 sm:space-y-6 sm:px-5 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-5 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">Fleet Management</span>
            <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Student Boarding History</h1>
            <p className="mt-1 text-sm text-slate-600">Track daily student pickups, drop-offs and boarding status.</p>
          </div>
          <div className="rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">History records</p><p className="mt-1 text-2xl font-black text-emerald-800">{boardings.total ?? boardings.data.length}</p></div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6"><h2 className="text-sm font-bold text-slate-900">Boarding events</h2><p className="mt-0.5 text-xs text-slate-500">Passenger, route and trip activity</p></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50/70">
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
                  <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <b className="block text-slate-900">{item.passenger_name}</b>
                      <span className="text-xs text-slate-500">{item.pickup_point}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{item.vehicle_number}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      {item.trip_date}<br/><span className="uppercase text-xs font-bold text-emerald-700">{item.trip_type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{new Date(item.event_at).toLocaleTimeString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase border ${getEventBadge(item.event)}`}>{item.event}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteRecord(item.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-700" title="Delete boarding record"><Icon name="trash" className="w-4 h-4" /></button>
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
