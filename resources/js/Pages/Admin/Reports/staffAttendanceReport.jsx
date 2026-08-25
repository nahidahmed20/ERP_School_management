import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function Report({ staffs, reportData, reportType, filters }) {
  const { data, setData, post, processing } = useForm({
    report_type: filters?.report_type || 'single',
    staff_id: filters?.staff_id || '',
    from_date: filters?.from_date || '',
    to_date: filters?.to_date || '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('attendance-report.generate'));
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Export Functions ---
  const exportToCSV = () => {
    if (!reportData || (reportType === 'single' && reportData.length === 0) || (reportType === 'all' && Object.keys(reportData).length === 0)) {
      return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (reportType === 'single') {
      csvContent += "Date,Status,In Time,Out Time,Remarks\n";
      reportData.forEach(record => {
        csvContent += `${record.date},${record.status},${record.in_time || '--'},${record.out_time || '--'},"${record.note || ''}"\n`;
      });
    } else {
      csvContent += "Staff Name,Staff ID,Date,Status,In Time,Out Time\n";
      Object.entries(reportData).forEach(([staffId, records]) => {
        const staffName = `${records[0].staff.first_name} ${records[0].staff.last_name}`;
        const staffCode = records[0].staff.staff_id_no;
        records.forEach(record => {
          csvContent += `"${staffName}",${staffCode},${record.date},${record.status},${record.in_time || '--'},${record.out_time || '--'}\n`;
        });
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Staff_Attendance_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!reportData || (reportType === 'single' && reportData.length === 0)) return;
    let text = "Date\tStatus\tIn Time\tOut Time\tRemarks\n";
    if (reportType === 'single') {
      reportData.forEach(record => {
        text += `${record.date}\t${record.status}\t${record.in_time || '--'}\t${record.out_time || '--'}\t${record.note || '--'}\n`;
      });
    } else {
      text = "Staff ID\tStaff Name\tDate\tStatus\tIn Time\tOut Time\n";
      Object.entries(reportData).forEach(([staffId, records]) => {
        const sName = `${records[0].staff.first_name} ${records[0].staff.last_name}`;
        records.forEach(r => {
          text += `${records[0].staff.staff_id_no}\t${sName}\t${r.date}\t${r.status}\t${r.in_time || '--'}\t${r.out_time || '--'}\n`;
        });
      });
    }
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  // 🎨 Premium Status Badges
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'present' || s === 'p') {
      return <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Present</span>;
    }
    if (s === 'absent' || s === 'a') {
      return <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-rose-50 text-rose-700 border border-rose-200">Absent</span>;
    }
    if (s === 'late' || s === 'l') {
      return <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-amber-50 text-amber-700 border border-amber-200">Late</span>;
    }
    if (s === 'half_day' || s === 'hd') {
      return <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200">Half Day</span>;
    }
    return <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
  };

  return (
    <AuthenticatedLayout>
      <Head title="Staff Attendance Report" />

      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, aside, header, .no-print, button, a, select, input { display: none !important; }
          body, html { background: #fff !important; color: #000 !important; }
          .printable-area { width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
          .print-header { display: block !important; }
          table th, table td { border-bottom: 1px solid #e2e8f0 !important; color: #000 !important; }
          .page-break-inside-avoid { page-break-inside: avoid; }
        }
      `}} />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Human Resources</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Staff Attendance Report</h1>
            <p className="text-sm text-slate-500 mt-1">শিক্ষক ও কর্মচারীদের দৈনিক উপস্থিতির বিস্তারিত রিপোর্ট।</p>
          </div>
        </div>

        {/* 🎛️ Filter Section - Unified Modern Toolbar style */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-indigo-600 no-print">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-end">

            {/* Report Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Report Type <span className="text-rose-500">*</span></label>
              <select
                value={data.report_type}
                onChange={e => { setData('report_type', e.target.value); if(e.target.value === 'all') setData('staff_id', ''); }}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="single">Single Staff</option>
                <option value="all">All Staff</option>
              </select>
            </div>

            {/* Select Staff (Conditional) */}
            {data.report_type === 'single' ? (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Staff <span className="text-rose-500">*</span></label>
                <select
                  value={data.staff_id}
                  onChange={e => setData('staff_id', e.target.value)}
                  required
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  <option value="" disabled>-- Choose Staff --</option>
                  {staffs?.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.first_name} {staff.last_name} ({staff.staff_id_no})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="hidden lg:block"></div>
            )}

            {/* From Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">From Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                value={data.from_date}
                onChange={e => setData('from_date', e.target.value)}
                required
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">To Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                value={data.to_date}
                onChange={e => setData('to_date', e.target.value)}
                required
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={processing}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? 'Generating...' : 'Generate'}
              </button>
            </div>

          </form>
        </div>

        {/* Export Actions Toolbar */}
        {reportData && (
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
        )}

        {/* 📄 Report Display Section (Printable Area) */}
        {reportData && (
          <div className="printable-area bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
            
            {/* Print Header (Visible only when printing) */}
            <div className="hidden print-header text-center py-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Staff Attendance Report</h2>
              <p className="text-slate-600 mt-1">Date Range: <span className="font-semibold">{data.from_date}</span> to <span className="font-semibold">{data.to_date}</span></p>
              <p className="text-slate-600">Report Type: <span className="font-semibold capitalize">{reportType}</span></p>
            </div>

            {reportType === 'single' ? (
              // 🧑‍💼 Single Staff Report Table
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">In Time</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Out Time</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.length > 0 ? reportData.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-800 font-mono">{record.date}</td>
                        <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">{record.in_time || '--:--'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">{record.out_time || '--:--'}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 italic">{record.note || '--'}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <Icon name="search" className="h-12 w-12 mb-3 text-slate-300" />
                            <p className="text-base font-bold text-slate-700">কোনো রেকর্ড পাওয়া যায়নি</p>
                            <p className="text-sm text-slate-500 mt-1">দয়া করে তারিখ পরিবর্তন করে আবার চেষ্টা করুন।</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              // 👥 All Staff Report Display
              <div className="p-6 space-y-8">
                {Object.entries(reportData).map(([staffId, records]) => (
                  <div key={staffId} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm page-break-inside-avoid">
                    
                    {/* Staff Profile Header */}
                    <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-lg shadow-sm">
                          {records[0].staff.first_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            {records[0].staff.first_name} {records[0].staff.last_name}
                          </h3>
                          <p className="text-xs font-semibold text-indigo-600 mt-0.5">ID: {records[0].staff.staff_id_no}</p>
                        </div>
                      </div>
                    </div>

                    {/* Staff Data Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/50">
                            <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Date</th>
                            <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Status</th>
                            <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">In Time</th>
                            <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Out Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {records.map(record => (
                            <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-6 py-3.5 text-sm font-bold text-slate-800 font-mono">{record.date}</td>
                              <td className="px-6 py-3.5">{getStatusBadge(record.status)}</td>
                              <td className="px-6 py-3.5 text-sm text-slate-600 font-mono">{record.in_time || '--:--'}</td>
                              <td className="px-6 py-3.5 text-sm text-slate-600 font-mono">{record.out_time || '--:--'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {Object.keys(reportData).length === 0 && (
                  <div className="py-16 text-center flex flex-col items-center justify-center text-slate-400">
                    <Icon name="search" className="h-12 w-12 mb-3 text-slate-300" />
                    <p className="text-base font-bold text-slate-700">কোনো রেকর্ড পাওয়া যায়নি</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}