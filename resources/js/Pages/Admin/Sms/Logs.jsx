import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Logs({ logs }) {
  return (
    <AuthenticatedLayout header={
      <div>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-100 px-2 py-1 rounded-md">Reports</span>
        <h1 className="text-2xl font-extrabold text-gray-900 mt-2">SMS Logs History</h1>
      </div>
    }>
      <Head title="SMS Logs" />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          <div className="px-6 py-4 border-b border-gray-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800">Sent SMS History</h3>
            <span className="text-sm font-bold text-gray-500">Total Sent: {logs.total}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left font-extrabold text-slate-500 uppercase">Phone Number</th>
                  <th className="px-6 py-3 text-left font-extrabold text-slate-500 uppercase">Message Content</th>
                  <th className="px-6 py-3 text-center font-extrabold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right font-extrabold text-slate-500 uppercase">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {logs.data.length > 0 ? logs.data.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
                      {log.phone}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-md truncate" title={log.message}>
                      {log.message}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase ${log.status === 'Success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 text-xs whitespace-nowrap font-medium">
                      {new Date(log.created_at).toLocaleString('en-GB')}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-400 font-bold">No SMS history found!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Links */}
          {logs.links && logs.links.length > 3 && (
            <div className="p-4 bg-slate-50 border-t border-gray-200 flex justify-center gap-1">
              {logs.links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.url || '#'}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${link.active ? 'bg-indigo-600 text-white shadow' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'} ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </AuthenticatedLayout>
  );
}