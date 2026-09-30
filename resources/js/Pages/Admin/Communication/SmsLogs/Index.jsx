import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import SmsFormModal from './Partials/SmsFormModal';
import Swal from 'sweetalert2';

export default function Index({ logs, campuses, activeCampusId, filters, classes = [], exams = [] }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  const campaign = useForm({ 
    type: 'absent', 
    date: new Date().toISOString().slice(0,10), 
    exam_id: '', 
    class_id: '', 
    section_id: '', 
    message: '' 
  });

  const selectedClass = classes.find(c => String(c.id) === String(campaign.data.class_id));
  const campaignText = {
    notice: 'সম্মানিত অভিভাবক, {student}-এর জন্য গুরুত্বপূর্ণ নোটিশ: ',
    emergency: 'জরুরি বিজ্ঞপ্তি: ',
    homework: 'সম্মানিত অভিভাবক, {student}-এর নতুন homework দেওয়া হয়েছে। ',
    meeting: 'সম্মানিত অভিভাবক, parent-teacher meeting সংক্রান্ত বিজ্ঞপ্তি: ',
    holiday: 'আগামী ছুটি সংক্রান্ত বিজ্ঞপ্তি: '
  }[campaign.data.type];

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.sms-logs.index'), { search, per_page: perPage, ...overrides }, { preserveState: true, replace: true });
  }

  const displayDate = (dt) => new Date(dt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  // --- Export Functions ---
  const handlePrint = () => window.print();
  const exportToCSV = () => {
    if (!logs.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Phone Number', 'Recipient Name', 'Message', 'Date & Time', 'Status'];
    const rows = logs.data.map(item => [
      item.phone_number || 'N/A', 
      item.recipient_name || 'Unknown', 
      item.message ? item.message.replace(/(\r\n|\n|\r)/gm, " ") : 'N/A', 
      displayDate(item.created_at), 
      item.status || 'Sent'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `SMS_Logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const copyToClipboard = () => {
    if (!logs.data.length) return;
    let text = "Phone Number\tRecipient\tMessage\tDate & Time\tStatus\n";
    logs.data.forEach(item => { text += `${item.phone_number}\t${item.recipient_name || '-'}\t${item.message.replace(/(\r\n|\n|\r)/gm, " ")}\t${displayDate(item.created_at)}\t${item.status}\n`; });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  const inputClass = "block w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";

  return (
    <AuthenticatedLayout>
      <Head title="SMS Logs & Campaigns" />

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, aside, header, .no-print, button, a, select, input, textarea, section { display: none !important; }
          body, html { background: #f8fafc !important; }
          .print-table-wrapper { width: 100% !important; border: none !important; box-shadow: none !important; }
          .print-title { display: block !important; font-size: 24px !important; font-weight: bold !important; margin-bottom: 20px !important; }
        }
        @media screen { .print-title { display: none; } }
      `}} />

      <div className="print-title">SMS Logs Directory - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">
        
        {/* Premium Campaign Box */}
        <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
              <Icon name="message-circle" className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-indigo-950 tracking-tight">Bulk SMS Campaign</h2>
              <p className="text-sm text-indigo-700/80 font-medium">Send bulk notices, exam results, or attendance alerts to parents & students.</p>
            </div>
          </div>
          
          <form onSubmit={e => { e.preventDefault(); campaign.post(route('admin.sms-logs.campaign')); }} className="grid gap-4 mt-6 md:grid-cols-4 items-end">
            
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-indigo-900/70 uppercase tracking-wider mb-1.5">Campaign Type</label>
              <select value={campaign.data.type} onChange={e => campaign.setData({type: e.target.value, date: campaign.data.date, exam_id: '', class_id: '', section_id: '', message: ''})} className={inputClass}>
                <option value="absent">Daily Absent Alert</option>
                <option value="exam_result">Exam Results</option>
                <option value="fee_due">Fee Due Reminder</option>
                <option value="notice">General Notice</option>
                <option value="emergency">Emergency Alert</option>
                <option value="homework">Homework Update</option>
                <option value="meeting">Parent Meeting</option>
                <option value="holiday">Holiday Notice</option>
              </select>
            </div>

            {campaign.data.type === 'absent' && (
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-indigo-900/70 uppercase tracking-wider mb-1.5">Target Date</label>
                <input type="date" value={campaign.data.date} onChange={e => campaign.setData('date', e.target.value)} required className={inputClass} />
              </div>
            )}

            {campaign.data.type === 'exam_result' && (
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-indigo-900/70 uppercase tracking-wider mb-1.5">Select Exam</label>
                <select value={campaign.data.exam_id} onChange={e => campaign.setData('exam_id', e.target.value)} required className={inputClass}>
                  <option value="">-- Choose Exam --</option>
                  {exams.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
            )}

            {!['exam_result', 'fee_due'].includes(campaign.data.type) && (
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-indigo-900/70 uppercase tracking-wider mb-1.5">Target Class</label>
                <select value={campaign.data.class_id} onChange={e => campaign.setData('class_id', e.target.value)} className={inputClass}>
                  <option value="">All Classes</option>
                  {classes.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
            )}

            {campaign.data.type === 'absent' && campaign.data.class_id && (
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-indigo-900/70 uppercase tracking-wider mb-1.5">Target Section</label>
                <select value={campaign.data.section_id} onChange={e => campaign.setData('section_id', e.target.value)} className={inputClass}>
                  <option value="">All Sections</option>
                  {selectedClass?.sections?.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
            )}

            {!['absent', 'exam_result', 'fee_due'].includes(campaign.data.type) && (
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-indigo-900/70 uppercase tracking-wider mb-1.5">Message Content</label>
                <textarea 
                  value={campaign.data.message} 
                  onChange={e => campaign.setData('message', e.target.value)} 
                  placeholder={`${campaignText} (You can use {student} and {date} tags)`} 
                  required 
                  rows="2"
                  className={`${inputClass} resize-none font-mono text-xs`} 
                />
              </div>
            )}

            <div className="md:col-span-1">
              <button disabled={campaign.processing} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 font-bold text-white transition-all shadow-md active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2">
                <Icon name="send" className="w-4 h-4" /> {campaign.processing ? 'Processing…' : 'Send Campaign'}
              </button>
            </div>
            
            {Object.values(campaign.errors).length > 0 && (
              <div className="md:col-span-4 mt-2">
                {Object.values(campaign.errors).map((x, i) => <p key={i} className="text-xs font-semibold text-rose-600 flex items-center gap-1"><Icon name="alert-circle" className="w-3 h-3"/> {x}</p>)}
              </div>
            )}
          </form>
        </section>
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">History</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">SMS Delivery Logs</h1>
          </div>
          <button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95">
            <Icon name="edit" className="w-4 h-4" /> Custom SMS
          </button>
        </div>

        {/* Toolbar & 5 Export Buttons */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Show</span>
              <select value={perPage} onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }} className="appearance-none bg-none pr-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-center font-mono">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="All">All</option>
              </select>
            </div>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            <div className="relative flex-1 min-w-[200px] sm:w-80">
              <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input type="text" placeholder="Search number or text..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>

            <button onClick={() => applyFilters()} className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              Search
            </button>
          </div>

          <div className="flex items-center justify-end gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl w-full xl:w-auto shadow-sm shrink-0 ml-auto">
            <button onClick={copyToClipboard} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg transition-all">Copy</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={exportToCSV} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg transition-all">CSV</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => Swal.fire('Info', 'Backend Excel plugin needed', 'info')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg transition-all">Excel</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => Swal.fire('Info', 'Backend PDF plugin needed', 'info')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg transition-all">PDF</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg transition-all">Print</button>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 print-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">SL</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipient</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[40%]">Message</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date &amp; Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100"><Icon name="send" className="w-8 h-8 text-slate-300" /></div>
                      <p className="text-sm font-semibold text-slate-600">No SMS logs found.</p>
                    </td>
                  </tr>
                ) : (
                  logs.data.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-500 font-mono">{(logs.from ?? 1) + index}</td>
                      <td className="px-6 py-4">
                        <strong className="text-sm font-bold text-slate-900 font-mono block">{item.phone_number}</strong>
                        <span className="text-xs text-slate-500 block mt-0.5">{item.recipient_name || 'Unknown'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 leading-relaxed"><p className="line-clamp-2">{item.message}</p></td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600 font-mono">{displayDate(item.created_at)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border ${item.status === 'Sent' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{item.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <button onClick={() => setDeletingItem(item)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Icon name="trash" className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="no-print border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl"><Pagination meta={logs} /></div>
        </div>
      </div>

      {isFormOpen && <SmsFormModal campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}
      {deletingItem && (
        <ConfirmDeleteModal item={{ name: `Log for ${deletingItem.phone_number}` }} onCancel={() => setDeletingItem(null)} onConfirm={() => { router.delete(route('admin.sms-logs.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) }); }} />
      )}
    </AuthenticatedLayout>
  );
}