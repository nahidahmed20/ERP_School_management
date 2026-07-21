import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

export default function Report({ staffs, reportData, reportType, filters }) {
  const { data, setData, post, processing } = useForm({
    report_type: filters?.report_type || 'single',
    staff_id: filters?.staff_id || '',
    from_date: filters?.from_date || '',
    to_date: filters?.to_date || '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('admin.attendance-report.generate'));
  };

  const handlePrint = () => {
    window.print();
  };

  // 🎨 Premium Status Badges
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'present' || s === 'p') {
      return <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Present</span>;
    }
    if (s === 'absent' || s === 'a') {
      return <span className="bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Absent</span>;
    }
    if (s === 'late' || s === 'l') {
      return <span className="bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Late</span>;
    }
    if (s === 'half_day' || s === 'hd') {
      return <span className="bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Half Day</span>;
    }
    return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">{status}</span>;
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Human Resources</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Staff Attendance Report</h1>
            <p className="text-sm text-gray-500 mt-1">শিক্ষক ও কর্মচারীদের দৈনিক উপস্থিতির বিস্তারিত রিপোর্ট।</p>
          </div>
        </div>
      }
    >
      <Head title="Staff Attendance Report" />

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* 🎛️ Filter Section - Premium Card (Hidden in Print) */}
        <div className="bg-white rounded-2xl shadow-sm border-t-4 border-indigo-600 p-6 sm:p-8 no-print">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">

            {/* Report Type */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-bold text-gray-700">Report Type <span className="text-rose-500">*</span></label>
              <select
                value={data.report_type}
                onChange={e => { setData('report_type', e.target.value); if(e.target.value === 'all') setData('staff_id', ''); }}
                className="block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors py-2.5"
              >
                <option value="single">Single Staff</option>
                <option value="all">All Staff</option>
              </select>
            </div>

            {/* Select Staff (Conditional) */}
            {data.report_type === 'single' ? (
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-bold text-gray-700">Select Staff <span className="text-rose-500">*</span></label>
                <select
                  value={data.staff_id}
                  onChange={e => setData('staff_id', e.target.value)}
                  required
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors py-2.5"
                >
                  <option value="">-- Choose Staff --</option>
                  {staffs?.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.first_name} {staff.last_name} ({staff.staff_id_no})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="hidden lg:block"></div> /* Empty div to maintain grid layout */
            )}

            {/* From Date */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-bold text-gray-700">From Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                value={data.from_date}
                onChange={e => setData('from_date', e.target.value)}
                required
                className="block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors py-2.5"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-bold text-gray-700">To Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                value={data.to_date}
                onChange={e => setData('to_date', e.target.value)}
                required
                className="block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors py-2.5"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={processing}
                className="flex-1 flex justify-center items-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
              >
                {processing ? 'Generating...' : 'Generate'}
              </button>
              
              {reportData && (
                <button
                  type="button"
                  onClick={handlePrint}
                  title="Print Report"
                  className="flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all"
                >
                  <Icon name="printer" className="w-5 h-5" />
                </button>
              )}
            </div>

          </form>
        </div>

        {/* 📄 Report Display Section (Printable Area) */}
        {reportData && (
          <div className="printable-area bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Print Header (Visible only when printing) */}
            <div className="hidden print-header text-center py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Staff Attendance Report</h2>
              <p className="text-gray-600 mt-1">Date Range: <span className="font-semibold">{data.from_date}</span> to <span className="font-semibold">{data.to_date}</span></p>
              <p className="text-gray-600">Report Type: <span className="font-semibold capitalize">{reportType}</span></p>
            </div>

            {reportType === 'single' ? (
              // 🧑‍💼 Single Staff Report Table
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">In Time</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Out Time</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {reportData.length > 0 ? reportData.map((record) => (
                      <tr key={record.id} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">{record.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{record.in_time || '--:--'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{record.out_time || '--:--'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">{record.note || '--'}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <Icon name="search" className="h-12 w-12 mb-3 text-gray-300" />
                            <p className="text-lg font-medium text-gray-500">কোনো রেকর্ড পাওয়া যায়নি</p>
                            <p className="text-sm">দয়া করে তারিখ পরিবর্তন করে আবার চেষ্টা করুন।</p>
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
                  <div key={staffId} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm page-break-inside-avoid">
                    
                    {/* Staff Profile Header */}
                    <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                          {records[0].staff.first_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {records[0].staff.first_name} {records[0].staff.last_name}
                          </h3>
                          <p className="text-sm font-medium text-indigo-600">ID: {records[0].staff.staff_id_no}</p>
                        </div>
                      </div>
                    </div>

                    {/* Staff Data Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">In Time</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Out Time</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {records.map(record => (
                            <tr key={record.id} className="hover:bg-indigo-50/50 transition-colors">
                              <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-gray-700">{record.date}</td>
                              <td className="px-6 py-3 whitespace-nowrap">
                                {getStatusBadge(record.status)}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 font-medium">{record.in_time || '--:--'}</td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 font-medium">{record.out_time || '--:--'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {Object.keys(reportData).length === 0 && (
                  <div className="py-12 text-center flex flex-col items-center justify-center text-gray-400">
                    <Icon name="search" className="h-12 w-12 mb-3 text-gray-300" />
                    <p className="text-lg font-medium text-gray-500">কোনো রেকর্ড পাওয়া যায়নি</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🖨️ Print Specific CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; }
          .no-print { display: none !important; }
          .print-header { display: block !important; }
          .page-break-inside-avoid { page-break-inside: avoid; }
        }
      `}</style>
    </AuthenticatedLayout>
  );
}