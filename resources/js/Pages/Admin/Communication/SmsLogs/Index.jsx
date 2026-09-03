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
  const campaign = useForm({ type:'absent', date:new Date().toISOString().slice(0,10), exam_id:'', class_id:'', section_id:'', message:'' });
  const selectedClass = classes.find(c => String(c.id) === String(campaign.data.class_id));
  const campaignText = {notice:'সম্মানিত অভিভাবক, {student}-এর জন্য গুরুত্বপূর্ণ নোটিশ: ',emergency:'জরুরি বিজ্ঞপ্তি: ',homework:'সম্মানিত অভিভাবক, {student}-এর নতুন homework দেওয়া হয়েছে।',meeting:'সম্মানিত অভিভাবক, parent-teacher meeting সংক্রান্ত বিজ্ঞপ্তি: ',holiday:'আগামী ছুটি সংক্রান্ত বিজ্ঞপ্তি: '}[campaign.data.type];

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.sms-logs.index'), { 
      search, per_page: perPage, ...overrides 
    }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10')) {
      applyFilters({ per_page: perPage });
    }
  }, [perPage]);

  // Format Date
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
    logs.data.forEach(item => {
      text += `${item.phone_number}\t${item.recipient_name || '-'}\t${item.message}\t${displayDate(item.created_at)}\t${item.status}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="SMS Logs" />

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

      <div className="print-title">SMS Logs Directory - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">
        <section className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5">
          <h2 className="text-lg font-black text-indigo-950">Guardian SMS Campaign</h2><p className="mb-4 text-sm text-indigo-700">Absent, exam result, fee due অথবা announcement একসঙ্গে পাঠান। Gateway না থাকলে log-mode simulation হবে।</p>
          <form onSubmit={e=>{e.preventDefault();campaign.post(route('admin.sms-logs.campaign'));}} className="grid gap-3 md:grid-cols-4">
            <select value={campaign.data.type} onChange={e=>campaign.setData({type:e.target.value,date:campaign.data.date,exam_id:'',class_id:'',section_id:'',message:''})} className="rounded-xl border-slate-300"><option value="absent">Absent students</option><option value="exam_result">Exam marks/results</option><option value="fee_due">Fee due reminder</option><option value="notice">School notice</option><option value="emergency">Emergency</option><option value="homework">Homework reminder</option><option value="meeting">Parent meeting</option><option value="holiday">Holiday notice</option></select>
            {campaign.data.type==='absent'&&<input type="date" value={campaign.data.date} onChange={e=>campaign.setData('date',e.target.value)} required className="rounded-xl border-slate-300"/>}
            {campaign.data.type==='exam_result'&&<select value={campaign.data.exam_id} onChange={e=>campaign.setData('exam_id',e.target.value)} required className="rounded-xl border-slate-300"><option value="">Select exam</option>{exams.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>}
            {!['exam_result','fee_due'].includes(campaign.data.type)&&<select value={campaign.data.class_id} onChange={e=>campaign.setData('class_id',e.target.value)} className="rounded-xl border-slate-300"><option value="">All classes</option>{classes.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>}
            {campaign.data.type==='absent'&&campaign.data.class_id&&<select value={campaign.data.section_id} onChange={e=>campaign.setData('section_id',e.target.value)} className="rounded-xl border-slate-300"><option value="">All sections</option>{selectedClass?.sections?.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>}
            {!['absent','exam_result','fee_due'].includes(campaign.data.type)&&<textarea value={campaign.data.message} onChange={e=>campaign.setData('message',e.target.value)} placeholder={`${campaignText} ({student} ও {date} ব্যবহার করা যাবে)`} required className="rounded-xl border-slate-300 md:col-span-2"/>}
            <button disabled={campaign.processing} className="rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white">{campaign.processing?'Processing…':'Send campaign'}</button>
            {Object.values(campaign.errors).map((x,i)=><p key={i} className="text-xs text-red-600">{x}</p>)}
          </form>
        </section>
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Communication</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">SMS Logs</h1>
            <p className="text-sm text-slate-500 mt-1">প্রেরিত এসএমএস এর হিস্টোরি এবং কাস্টম এসএমএস ম্যানেজ করুন।</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <Icon name="send" className="w-4 h-4" /> Send Custom SMS
          </button>
        </div>

        {/* Unified Modern Toolbar */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            
            {/* Per Page */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Show</span>
              <select
                value={perPage}
                onChange={e => setPerPage(e.target.value)}
                className="appearance-none bg-none pr-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-center font-mono"
                style={{ backgroundImage: 'none' }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="500">500</option>
                <option value="All">All</option>
              </select>
              <span className="text-xs font-semibold text-slate-500">entries</span>
            </div>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search number or text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={() => applyFilters()}
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Search
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
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <Icon name="send" className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">No SMS logs found.</p>
                      <p className="text-xs text-slate-400 mt-1">Try sending a custom SMS</p>
                    </td>
                  </tr>
                ) : (
                  logs.data.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-500 font-mono">
                        {(logs.from ?? 1) + index}
                      </td>
                      <td className="px-6 py-4">
                        <strong className="text-sm font-bold text-slate-900 font-mono block">{item.phone_number}</strong>
                        <span className="text-xs text-slate-500 block mt-0.5">{item.recipient_name || 'Unknown'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 leading-relaxed">
                        <p className="line-clamp-2">{item.message}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600 font-mono">
                        {displayDate(item.created_at)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border ${
                          item.status === 'Sent' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <button onClick={() => setDeletingItem(item)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Log">
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="no-print border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
            <Pagination meta={logs} />
          </div>
        </div>
      </div>

      {isFormOpen && <SmsFormModal campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}

      {deletingItem && (
        <ConfirmDeleteModal 
          item={{ name: `Log for ${deletingItem.phone_number}` }} 
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => {
            router.delete(route('admin.sms-logs.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }} 
        />
      )}
    </AuthenticatedLayout>
  );
}
