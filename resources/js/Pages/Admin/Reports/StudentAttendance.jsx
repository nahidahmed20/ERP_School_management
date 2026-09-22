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

    // 💡 FIX: রাউটের নাম ঠিক করা হয়েছে (admin.studentAttendance.report)
    router.get(route('admin.studentAttendance.report'), {
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
          table th, table td { border-bottom: 1px solid #e2e8f0 !important; color: #000 !important; }
          .print-badge { border: 1px solid #cbd5e1 !important; color: #0f172a !important; background: transparent !important; }
        }
      `}} />

      <div className="w-full space-y-8 sm:px-6 lg:px-8 py-8">
        
        {/* Modern Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-60"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-wider uppercase mb-2">
              <Icon name="chart" className="w-3.5 h-3.5" />
              Reports & Analytics
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Attendance Report</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">মাসিক ভিত্তিতে শিক্ষার্থীদের উপস্থিতির বিস্তারিত সামারি ও রেকর্ড।</p>
          </div>
        </div>

        {/* Premium Filter Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 border-t-4 border-t-indigo-600 no-print">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Icon name="filter" className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Report Parameters</h2>
          </div>
          
          <form onSubmit={applyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 items-end">
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Month <span className="text-rose-500">*</span></label>
              <div className="relative">
                <select 
                  value={month} 
                  onChange={e => setMonth(e.target.value)} 
                  required 
                  className="block w-full pl-4 pr-10 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all cursor-pointer appearance-none"
                  style={{ backgroundImage: 'none' }} // 💡 FIX: ডিফল্ট আইকন রিমুভ করা হলো
                >
                  <option value="" disabled>Select Month</option>
                  {monthNames.map((m, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <Icon name="chevron-down" className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Year <span className="text-rose-500">*</span></label>
              <div className="relative">
                <select 
                  value={year} 
                  onChange={e => setYear(e.target.value)} 
                  required 
                  className="block w-full pl-4 pr-10 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all cursor-pointer appearance-none"
                  style={{ backgroundImage: 'none' }} // 💡 FIX: ডিফল্ট আইকন রিমুভ করা হলো
                >
                  <option value="" disabled>Select Year</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <Icon name="chevron-down" className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class <span className="text-rose-500">*</span></label>
              <div className="relative">
                <select 
                  value={classId} 
                  onChange={e => { setClassId(e.target.value); setSectionId(''); }} 
                  required 
                  className="block w-full pl-4 pr-10 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all cursor-pointer appearance-none"
                  style={{ backgroundImage: 'none' }} // 💡 FIX: ডিফল্ট আইকন রিমুভ করা হলো
                >
                  <option value="" disabled>Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <Icon name="chevron-down" className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Section</label>
              <div className="relative">
                <select 
                  value={sectionId} 
                  onChange={e => setSectionId(e.target.value)} 
                  disabled={!classId} 
                  className="block w-full pl-4 pr-10 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundImage: 'none' }} // 💡 FIX: ডিফল্ট আইকন রিমুভ করা হলো
                >
                  <option value="">All Sections</option>
                  {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <Icon name="chevron-down" className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="xl:col-span-1 sm:col-span-2 lg:col-span-4 flex justify-end mt-2 xl:mt-0">
              <button type="submit" className="w-full xl:w-auto bg-slate-900 hover:bg-indigo-600 text-white px-3 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-slate-900/20 hover:shadow-indigo-500/30 active:scale-95 flex items-center justify-center gap-2.5">
                <Icon name="search" className="w-4 h-4" /> Generate Report
              </button>
            </div>
            
          </form>
        </div>

        {/* --- Beautiful Empty State --- */}
        {(!reportData || reportData.length === 0) && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[300px] no-print">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-4">
              <Icon name="calendar" className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Report Generated Yet</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">দয়া করে উপরের ফিল্টার থেকে মাস, বছর এবং ক্লাস সিলেক্ট করে 'Generate Report' বাটনে ক্লিক করুন।</p>
          </div>
        )}

        {/* --- Export Toolbar & Report Table --- */}
        {reportData && reportData.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex justify-end no-print">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
                <button onClick={copyToClipboard} className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all flex items-center gap-2" title="Copy to Clipboard">
                  <Icon name="clipboard" className="w-3.5 h-3.5" /> Copy
                </button>
                <div className="w-px h-5 bg-slate-200 mx-1"></div>
                <button onClick={exportToCSV} className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all flex items-center gap-2" title="Export CSV">
                  <Icon name="download" className="w-3.5 h-3.5" /> CSV
                </button>
                <div className="w-px h-5 bg-slate-200 mx-1"></div>
                <button onClick={handlePrint} className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md flex items-center gap-2" title="Print Report">
                  <Icon name="printer" className="w-3.5 h-3.5" /> Print
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 printable-area overflow-hidden">
              <div className="p-6 sm:p-8">
                
                {/* Modern Report Header */}
                <div className="text-center mb-8 pb-6 border-b border-slate-100">
                  <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase">Monthly Attendance Summary</h2>
                  <div className="inline-flex flex-wrap justify-center items-center gap-4 text-sm font-bold text-slate-600 bg-slate-50 px-6 py-2.5 rounded-2xl border border-slate-200">
                    <span className="flex items-center gap-1.5"><Icon name="calendar" className="w-4 h-4 text-indigo-500"/> <span className="text-indigo-600">{monthNames[parseInt(month) - 1]} {year}</span></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span className="flex items-center gap-1.5"><Icon name="home" className="w-4 h-4 text-emerald-500"/> <span className="text-slate-900">{selectedClass?.name}</span> {sectionId && <span className="text-slate-500 font-medium">({selectedClass.sections.find(s => s.id == sectionId)?.name})</span>}</span>
                  </div>
                </div>

                {/* Stunning Data Table */}
                <div className="rounded-2xl border border-slate-200 overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center w-16">Roll</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Student Info</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-emerald-600 text-center bg-emerald-50/50">Present</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-rose-600 text-center bg-rose-50/50">Absent</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-amber-600 text-center bg-amber-50/50">Late</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-blue-600 text-center bg-blue-50/50">Half Day</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-700 text-center bg-slate-100">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.map((data, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
                              {data.roll_no || '--'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <strong className="text-sm font-black text-slate-900">{data.name}</strong>
                              <span className="text-xs font-semibold text-slate-500 tracking-tight mt-0.5">ID: {data.admission_no || 'N/A'}</span>
                            </div>
                          </td>
                          
                          <td className="px-5 py-4 text-center bg-emerald-50/20">
                            <div className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-lg text-sm font-bold print-badge ${data.total_present > 0 ? 'bg-emerald-100 text-emerald-700' : 'text-slate-300'}`}>
                              {data.total_present}
                            </div>
                          </td>
                          
                          <td className="px-5 py-4 text-center bg-rose-50/20">
                            <div className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-lg text-sm font-bold print-badge ${data.total_absent > 0 ? 'bg-rose-100 text-rose-700' : 'text-slate-300'}`}>
                              {data.total_absent}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-center bg-amber-50/20">
                            <div className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-lg text-sm font-bold print-badge ${data.total_late > 0 ? 'bg-amber-100 text-amber-700' : 'text-slate-300'}`}>
                              {data.total_late}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-center bg-blue-50/20">
                            <div className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-lg text-sm font-bold print-badge ${data.total_half_day > 0 ? 'bg-blue-100 text-blue-700' : 'text-slate-300'}`}>
                              {data.total_half_day}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-center bg-slate-50/80">
                            <strong className="text-sm font-black text-slate-800">{data.total_working_days}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}