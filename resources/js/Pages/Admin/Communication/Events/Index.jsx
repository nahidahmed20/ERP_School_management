import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import EventFormModal from './Partials/EventFormModal';
import Swal from 'sweetalert2';

export default function Index({ events, classrooms, filters }) {
  const { flash, auth } = usePage().props;
  const [type, setType] = useState(filters.type ?? '');
  const [filter, setFilter] = useState(filters.filter ?? 'upcoming');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.communication.calendar.index'), { 
      type, filter, per_page: perPage, ...overrides 
    }, { preserveState: true, replace: true });
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!events.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Event Title', 'Type', 'Starts At', 'Ends At', 'Location / Room'];
    const rows = events.data.map(item => [
      item.title || 'N/A', 
      item.type || 'Event', 
      formatDate(item.start_datetime), 
      formatDate(item.end_datetime), 
      item.classroom?.room_number || 'Not Assigned'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Calendar_Events_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!events.data.length) return;
    let text = "Title\tType\tStarts\tEnds\tLocation\n";
    events.data.forEach(item => {
      text += `${item.title}\t${item.type}\t${formatDate(item.start_datetime)}\t${formatDate(item.end_datetime)}\t${item.classroom?.room_number || '-'}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Events & Meetings" />

      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, aside, header, .no-print, button, a, select, input { display: none !important; }
          body, html { background: #f8fafc !important; }
          .print-table-wrapper { width: 100% !important; border: none !important; box-shadow: none !important; }
          .print-title { display: block !important; font-size: 24px !important; font-weight: bold !important; margin-bottom: 20px !important; }
        }
        @media screen { .print-title { display: none; } }
      `}} />

      <div className="print-title">Calendar &amp; Events Directory - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Communication</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Calendar &amp; Events</h1>
            <p className="text-sm text-slate-500 mt-1">স্কুলের মিটিং, ছুটির দিন এবং ইভেন্ট ম্যানেজমেন্ট।</p>
          </div>
          <button
            onClick={() => { setEditingItem(null); setFormOpen(true); }}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <Icon name="plus" className="w-4 h-4" /> Add Event
          </button>
        </div>

        {/* Unified Modern Toolbar */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            
            {/* Per Page */}
            <select
              value={perPage}
              onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}
              className="appearance-none bg-none pr-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-center font-mono"
              style={{ backgroundImage: 'none' }}
            >
              <option value="10">10 / Page</option>
              <option value="20">20 / Page</option>
              <option value="50">50 / Page</option>
              <option value="all">All</option>
            </select>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            {/* Type Filter */}
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); applyFilters({ type: e.target.value }); }}
              className="w-full sm:w-40 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="Event">Event</option>
              <option value="Meeting">Meeting</option>
              <option value="Holiday">Holiday</option>
            </select>

            {/* Time Filter */}
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); applyFilters({ filter: e.target.value }); }}
              className="w-full sm:w-44 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="upcoming">Upcoming Events</option>
              <option value="all">All Events</option>
            </select>

            {/* Apply Button */}
            <button
              onClick={() => applyFilters()}
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Filter
            </button>
          </div>

          {/* Export Actions */}
          <div className="flex items-center justify-end gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl w-full xl:w-auto shadow-sm shrink-0 ml-auto">
            <button onClick={copyToClipboard} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Copy to Clipboard">
              Copy
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={exportToCSV} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export CSV">
              CSV
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend Excel plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export Excel">
              Excel
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend PDF plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export PDF">
              PDF
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Print List">
              Print
            </button>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 print-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Event / Meeting Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location / Room</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <Icon name="calendar" className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">কোনো ইভেন্ট পাওয়া যায়নি</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting filters or add a new event</p>
                    </td>
                  </tr>
                ) : (
                  events.data.map((item) => {
                    const isHoliday = item.type === 'Holiday';
                    const isMeeting = item.type === 'Meeting';
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0 mt-0.5">
                              <Icon name="calendar" className="w-5 h-5" />
                            </div>
                            <div>
                              <strong className="text-sm font-bold text-slate-900 block">{item.title}</strong>
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase mt-1 border ${
                                isHoliday ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                isMeeting ? 'bg-sky-50 text-sky-700 border-sky-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {item.type}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono space-y-1">
                          <div className="text-slate-700 font-semibold"><span className="text-slate-400 font-sans font-normal">Starts:</span> {formatDate(item.start_datetime)}</div>
                          <div className="text-slate-600"><span className="text-slate-400 font-sans font-normal">Ends:</span> {formatDate(item.end_datetime)}</div>
                        </td>
                        <td className="px-6 py-4">
                          {item.classroom ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              <Icon name="home" className="w-3.5 h-3.5 text-slate-400" /> Room: {item.classroom.room_number}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Not Assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right no-print">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => { setEditingItem(item); setFormOpen(true); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Event">
                              <Icon name="edit" className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeletingItem(item)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Event">
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="no-print border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
            <Pagination meta={events} />
          </div>
        </div>
      </div>

      {formOpen && <EventFormModal item={editingItem} classrooms={classrooms} activeCampusId={auth?.active_campus_id} onClose={() => setFormOpen(false)} />}
      
      {deletingItem && (
        <ConfirmDeleteModal 
          item={deletingItem} 
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => {
            router.delete(route('admin.communication.calendar.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }} 
        />
      )}
    </AuthenticatedLayout>
  );
}