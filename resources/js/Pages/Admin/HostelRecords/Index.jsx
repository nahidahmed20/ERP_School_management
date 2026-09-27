import { Head, router, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';
import { useEffect } from 'react';

export default function Index({ records, tab }) {
  const { flash } = usePage().props;

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  const deleteRecord = (id) => {
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      router.delete(route('admin.hostel-records.destroy', { id, tab }), { preserveScroll: true });
    }
  };

  const TabButton = ({ name, label, icon }) => (
    <Link 
      href={route('admin.hostel-records.index', { tab: name })} 
      className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 ${tab === name ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
    >
      <Icon name={icon} className="w-4 h-4" /> {label}
    </Link>
  );

  return (
    <AuthenticatedLayout>
      <Head title="Hostel Logs & Records" />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hostel Logs & Records</h1>
          <p className="text-sm text-slate-500">Manage and delete incorrect entries for finance, attendance, meals, and visitors.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto custom-scrollbar">
            <TabButton name="ledger" label="Financial Ledger" icon="dollar-sign" />
            <TabButton name="attendance" label="Attendance" icon="check-square" />
            <TabButton name="meals" label="Meal Allocations" icon="coffee" />
            <TabButton name="visitors" label="Visitors Log" icon="users" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Resident Name</th>
                  {tab === 'ledger' && <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Charge Details</th>}
                  {tab === 'attendance' && <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date & Status</th>}
                  {tab === 'meals' && <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date & Meals</th>}
                  {tab === 'visitors' && <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Visitor Info</th>}
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.data.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-slate-400">No records found for {tab}.</td></tr>
                ) : records.data.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {item.resident_name} <br/>
                      <span className="text-xs font-normal text-slate-500">Alloc ID: #{item.hostel_allocation_id}</span>
                    </td>
                    
                    {/* Render specific columns based on selected Tab */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {tab === 'ledger' && (
                        <span>
                          <span className="font-mono font-bold text-rose-600">৳{item.amount}</span> - <span className="uppercase text-xs font-bold">{item.type.replace('_', ' ')}</span> <br/>
                          <small className="text-xs text-slate-400">Status: <span className={item.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}>{item.status}</span> | Ref: {item.reference || 'N/A'}</small>
                        </span>
                      )}
                      
                      {tab === 'attendance' && (
                        <span>
                          <span className="font-mono">{item.attendance_date}</span> <br/>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${item.status === 'present' ? 'bg-emerald-100 text-emerald-700' : item.status === 'absent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                            {item.status}
                          </span>
                        </span>
                      )}
                      
                      {tab === 'meals' && (
                        <span>
                          <span className="font-mono">{item.meal_date}</span> <br/>
                          <span className="text-xs font-semibold">
                            B: {item.breakfast ? '✅' : '❌'} | L: {item.lunch ? '✅' : '❌'} | D: {item.dinner ? '✅' : '❌'}
                          </span>
                        </span>
                      )}

                      {tab === 'visitors' && (
                        <span>
                          <b>{item.visitor_name}</b> ({item.relation || 'Guest'})<br/>
                          <small className="text-xs text-slate-400">In: {new Date(item.check_in_at).toLocaleString()} | Out: {item.check_out_at ? new Date(item.check_out_at).toLocaleString() : 'Still Inside'}</small>
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteRecord(item.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Delete Record">
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-white border-t border-slate-100"><Pagination meta={records} /></div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}