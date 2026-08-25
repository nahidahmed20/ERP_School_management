import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function DueFees({ dueAssignments, totalDue, classes, filters }) {
  const [classId, setClassId] = useState(filters.class_id || '');
  const [sectionId, setSectionId] = useState(filters.section_id || '');
  const [dateUntil, setDateUntil] = useState(filters.date_until || '');

  const applyFilters = (e) => {
    e?.preventDefault();
    router.get(route('admin.reports.due_fees'), {
      class_id: classId,
      section_id: sectionId,
      date_until: dateUntil
    }, { preserveState: true });
  };

  const selectedClass = classes.find(c => c.id == classId);

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!dueAssignments.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Student Name', 'Admission No', 'Class', 'Section', 'Guardian Contact', 'Fee Group', 'Due Date', 'Due Amount'];
    const rows = dueAssignments.map(assignment => [
      `${assignment.student?.first_name || ''} ${assignment.student?.last_name || ''}`.trim() || 'N/A',
      assignment.student?.admission_no || 'N/A',
      assignment.student?.current_enrollment?.school_class?.name || 'N/A',
      assignment.student?.current_enrollment?.section?.name || 'N/A',
      assignment.student?.guardian?.father_phone || 'N/A',
      assignment.fee_group?.name || 'N/A',
      assignment.due_date || 'N/A',
      assignment.due_amount || '0'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Due_Fees_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!dueAssignments.length) return;
    let text = "Student\tAdm No\tClass\tContact\tFee Type\tDue Date\tAmount\n";
    dueAssignments.forEach(assignment => {
      let studentName = `${assignment.student?.first_name || ''} ${assignment.student?.last_name || ''}`.trim();
      let className = assignment.student?.current_enrollment?.school_class?.name || '-';
      text += `${studentName}\t${assignment.student?.admission_no || '-'}\t${className}\t${assignment.student?.guardian?.father_phone || '-'}\t${assignment.fee_group?.name}\t${assignment.due_date}\t${assignment.due_amount}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  const Taka = () => (
    <span className="font-sans font-normal mr-0.5">৳</span>
  );

  return (
    <AuthenticatedLayout>
      <Head title="Due Fees Report" />

      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, aside, header, .no-print, button, a, select, input { display: none !important; }
          body, html { background: #fff !important; color: #000 !important; }
          .printable-area { width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
          
          /* Adjust summary card for print to save ink */
          .summary-widget {
            background: #fff !important;
            color: #000 !important;
            border: 2px solid #cbd5e1 !important;
            box-shadow: none !important;
          }
          .summary-widget * { color: #000 !important; }
          .summary-widget svg, .summary-widget .bg-white\\/10 { display: none !important; }
          
          /* Force table borders for print */
          table th, table td { border-bottom: 1px solid #e2e8f0 !important; color: #000 !important; }
        }
      `}} />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
          <div>
            <span className="text-xs font-bold tracking-wider text-rose-600 uppercase">Reports</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Due Fees Report</h1>
            <p className="text-sm text-slate-500 mt-1">নির্দিষ্ট তারিখ পর্যন্ত শিক্ষার্থীদের বকেয়া ফি এর তালিকা।</p>
          </div>
        </div>

        {/* --- Filter Section --- */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-rose-500 no-print">
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
            <Icon name="filter" className="w-5 h-5 text-rose-500" />
            <h2>Filter Report</h2>
          </div>
          
          <form onSubmit={applyFilters} className="flex flex-col md:flex-row items-end gap-4 w-full">
            
            <div className="w-full md:flex-1">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                Class
              </label>
              <select 
                value={classId} 
                onChange={e => { setClassId(e.target.value); setSectionId(''); }} 
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-rose-500 outline-none transition-all cursor-pointer"
              >
                <option value="">All Classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="w-full md:flex-1">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                Section (Optional)
              </label>
              <select 
                value={sectionId} 
                onChange={e => setSectionId(e.target.value)} 
                disabled={!classId} 
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-rose-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">All Sections</option>
                {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="w-full md:flex-1">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                Due Date Until <span className="text-rose-500">*</span>
              </label>
              <input 
                type="date" 
                value={dateUntil} 
                onChange={e => setDateUntil(e.target.value)} 
                required 
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-rose-500 outline-none transition-all" 
              />
            </div>

            <div className="w-full md:w-auto">
              <button 
                type="submit" 
                className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <Icon name="search" className="w-4 h-4" /> Generate
              </button>
            </div>
          </form>
        </div>

        {/* Export Actions Toolbar */}
        <div className="flex justify-end no-print">
          <div className="flex items-center justify-end gap-1.5 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            <button onClick={copyToClipboard} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-1.5" title="Copy to Clipboard">Copy</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={exportToCSV} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all flex items-center gap-1.5" title="Export CSV">CSV</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend Excel plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all flex items-center gap-1.5" title="Export Excel">Excel</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend PDF plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all flex items-center gap-1.5" title="Export PDF">PDF</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all flex items-center gap-1.5" title="Print Report">Print</button>
          </div>
        </div>

        {/* --- Report Content Area --- */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 printable-area overflow-hidden">
          
          <div className="p-6 sm:p-8">
            {/* Report Header (Visible mainly on print) */}
            <div className="text-center mb-8 pb-6 border-b-2 border-dashed border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Due Fees Report <span className="text-lg text-slate-500 font-normal">(বকেয়া তালিকা)</span></h2>
              <div className="inline-flex items-center gap-3 text-sm font-semibold text-slate-600 bg-slate-50 px-5 py-2 rounded-full border border-slate-100 mt-2">
                <span>Calculated Until: <span className="text-rose-600">{dateUntil || 'N/A'}</span></span>
                <span className="w-px h-4 bg-slate-300"></span>
                <span>Class: <span className="text-slate-900">{classId ? classes.find(c => c.id == classId)?.name : 'All Classes'}</span> {sectionId && `(${selectedClass?.sections?.find(s => s.id == sectionId)?.name})`}</span>
              </div>
            </div>

            {/* Premium Summary Widget */}
            <div className="summary-widget relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 sm:p-8 mb-8 flex justify-between items-center text-white shadow-lg shadow-rose-500/30">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mt-10 -mr-10 blur-2xl"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="bg-white/20 p-4 rounded-full backdrop-blur-md shrink-0 hidden sm:flex">
                  <Icon name="wallet" className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-rose-100 uppercase tracking-wider mb-1">Total Pending Amount</div>
                  <div className="text-xs text-rose-200 mb-1.5 font-medium">মোট বকেয়া টাকার পরিমাণ</div>
                  <div className="text-4xl sm:text-5xl font-black tracking-tight">
                    <Taka />{Number(totalDue).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center">SL</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Guardian Contact</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Group</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Due Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Due Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dueAssignments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                        <div className="inline-block bg-emerald-50 text-emerald-600 px-6 py-3 rounded-full font-bold text-base border border-emerald-100 shadow-sm">
                          🎉 এই ফিল্টারে কোনো শিক্ষার্থীর বকেয়া নেই!
                        </div>
                      </td>
                    </tr>
                  ) : (
                    dueAssignments.map((assignment, index) => (
                      <tr key={assignment.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-500 text-center">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4">
                          <strong className="text-sm font-bold text-slate-900 block">
                            {assignment.student?.first_name} {assignment.student?.last_name}
                          </strong>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              Class {assignment.student?.current_enrollment?.school_class?.name}
                              {assignment.student?.current_enrollment?.section && ` (${assignment.student?.current_enrollment?.section?.name})`}
                            </span>
                            <span className="text-xs text-slate-500">
                              Roll: <strong className="text-slate-700">{assignment.student?.current_enrollment?.roll_no || '--'}</strong>
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-xs text-slate-500">
                              Adm: <strong className="text-slate-700">{assignment.student?.admission_no || '--'}</strong>
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <strong className="text-sm font-bold text-slate-800 block">
                            {assignment.student?.guardian?.father_name || 'N/A'}
                          </strong>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 mt-1">
                            <Icon name="phone" className="w-3.5 h-3.5" /> {assignment.student?.guardian?.father_phone || '--'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200">
                            {assignment.fee_group?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                            {assignment.due_date}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <strong className="text-base font-black text-rose-600 tracking-tight">
                            <Taka />{Number(assignment.due_amount).toLocaleString()}
                          </strong>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}