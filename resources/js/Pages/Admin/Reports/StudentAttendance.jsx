import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function StudentAttendance({ classes, reportData, filters }) {
  const [classId, setClassId] = useState(filters.class_id || '');
  const [sectionId, setSectionId] = useState(filters.section_id || '');
  const [month, setMonth] = useState(filters.month || '');
  const [year, setYear] = useState(filters.year || '');

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(5), (val, index) => currentYear - 2 + index);

  const applyFilters = (e) => {
    e?.preventDefault();
    if (!classId) {
      return Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'দয়া করে ক্লাস সিলেক্ট করুন!', showConfirmButton: false, timer: 3000 });
    }

    router.get(route('student_attendance.report'), {
      class_id: classId,
      section_id: sectionId,
      month: month,
      year: year
    }, { preserveState: true });
  };

  const selectedClass = classes.find(c => c.id == classId);

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!reportData || !reportData.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Roll No', 'Admission No', 'Student Name', 'Present (P)', 'Absent (A)', 'Late (L)', 'Half Day', 'Total Class'];
    const rows = reportData.map(data => [
      data.roll_no || '--',
      data.admission_no || 'N/A',
      data.name || 'N/A',
      data.total_present,
      data.total_absent,
      data.total_late,
      data.total_half_day,
      data.total_working_days
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Student_Attendance_${monthNames[parseInt(month) - 1]}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!reportData || !reportData.length) return;
    let text = "Roll\tAdm No\tStudent Name\tPresent\tAbsent\tLate\tHalf Day\tTotal\n";
    reportData.forEach(data => {
      text += `${data.roll_no || '--'}\t${data.admission_no || '-'}\t${data.name}\t${data.total_present}\t${data.total_absent}\t${data.total_late}\t${data.total_half_day}\t${data.total_working_days}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Student Attendance Report" />

      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, aside, header, .no-print, button, a, select, input { display: none !important; }
          body, html { background: #fff !important; color: #000 !important; }
          .printable-area { width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
          
          /* Force table borders for print */
          table th, table td { border-bottom: 1px solid #e2e8f0 !important; color: #000 !important; }
          
          /* Keep background colors for print */
          .print-bg-green { background-color: #f0fdf4 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-bg-red { background-color: #fef2f2 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-bg-slate { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}} />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Reports</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Student Attendance Report</h1>
            <p className="text-sm text-slate-500 mt-1">মাসিক ভিত্তিতে শিক্ষার্থীদের উপস্থিতির সামারি রিপোর্ট।</p>
          </div>
        </div>

        {/* --- Filter Section --- */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-slate-800 no-print">
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
            <Icon name="filter" className="w-5 h-5 text-slate-700" />
            <h2>Filter Report</h2>
          </div>
          
          <form onSubmit={applyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Month <span className="text-rose-500">*</span></label>
              <select 
                value={month} 
                onChange={e => setMonth(e.target.value)} 
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
              >
                {monthNames.map((m, i) => (
                  <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Year <span className="text-rose-500">*</span></label>
              <select 
                value={year} 
                onChange={e => setYear(e.target.value)} 
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class <span className="text-rose-500">*</span></label>
              <select 
                value={classId} 
                onChange={e => { setClassId(e.target.value); setSectionId(''); }} 
                required 
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
              >
                <option value="" disabled>-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Section</label>
              <select 
                value={sectionId} 
                onChange={e => setSectionId(e.target.value)} 
                disabled={!classId} 
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">-- All Sections --</option>
                {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="xl:col-span-1 sm:col-span-2 lg:col-span-4 flex justify-end">
              <button 
                type="submit" 
                className="w-full xl:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <Icon name="search" className="w-4 h-4" /> View Report
              </button>
            </div>
            
          </form>
        </div>

        {/* Export Actions Toolbar (Only visible if data exists) */}
        {reportData && reportData.length > 0 && (
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

        {/* --- Report Content Area --- */}
        {reportData && reportData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 printable-area overflow-hidden">
            
            <div className="p-6 sm:p-8">
              {/* Report Header (Visible mainly on print) */}
              <div className="text-center mb-8 pb-6 border-b-2 border-dashed border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Monthly Attendance Summary</h2>
                <div className="inline-flex items-center gap-3 text-sm font-semibold text-slate-600 bg-slate-50 px-5 py-2 rounded-full border border-slate-100">
                  <span>Month: <span className="text-indigo-600">{monthNames[parseInt(month) - 1]}, {year}</span></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span>Class: <span className="text-slate-900">{selectedClass?.name}</span> {sectionId && <span className="text-slate-500 font-normal">({selectedClass.sections.find(s => s.id == sectionId)?.name})</span>}</span>
                </div>
              </div>

              {/* Data Table */}
              <div className="rounded-xl border border-slate-200 overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-center border-r border-slate-700 w-16">Roll</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-slate-700">Admission No</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-slate-700">Student Name</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-center border-r border-slate-700 text-emerald-300">Present (P)</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-center border-r border-slate-700 text-rose-300">Absent (A)</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-center border-r border-slate-700 text-amber-300">Late (L)</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-center border-r border-slate-700 text-blue-300">Half Day</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-center">Total Class</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.map((data, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-center border-r border-slate-100">
                          <strong className="text-sm font-black text-slate-700">{data.roll_no || '--'}</strong>
                        </td>
                        <td className="px-4 py-3 border-r border-slate-100">
                          <code className="text-xs font-bold text-slate-500 font-mono tracking-tight">{data.admission_no}</code>
                        </td>
                        <td className="px-4 py-3 border-r border-slate-100">
                          <strong className="text-sm font-bold text-slate-900">{data.name}</strong>
                        </td>
                        
                        {/* Present Column */}
                        <td className={`px-4 py-3 text-center border-r border-slate-100 ${data.total_present > 0 ? 'bg-emerald-50/50 print-bg-green' : ''}`}>
                          <strong className={`text-base ${data.total_present > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                            {data.total_present}
                          </strong>
                        </td>
                        
                        {/* Absent Column */}
                        <td className={`px-4 py-3 text-center border-r border-slate-100 ${data.total_absent > 0 ? 'bg-rose-50/50 print-bg-red' : ''}`}>
                          <strong className={`text-base ${data.total_absent > 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                            {data.total_absent}
                          </strong>
                        </td>

                        {/* Late Column */}
                        <td className="px-4 py-3 text-center border-r border-slate-100">
                          <strong className={`text-sm ${data.total_late > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
                            {data.total_late}
                          </strong>
                        </td>

                        {/* Half Day Column */}
                        <td className="px-4 py-3 text-center border-r border-slate-100">
                          <strong className={`text-sm ${data.total_half_day > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                            {data.total_half_day}
                          </strong>
                        </td>

                        {/* Total Classes */}
                        <td className="px-4 py-3 text-center bg-slate-50/50 print-bg-slate">
                          <strong className="text-sm font-black text-slate-800">{data.total_working_days}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}