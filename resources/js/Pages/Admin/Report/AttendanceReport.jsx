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

  // স্ট্যাটাসের উপর ভিত্তি করে ব্যাজ (Badge) কালার রিটার্ন করার ফাংশন
  const getStatusBadge = (status) => {
    const isPresent = status.toLowerCase() === 'present';
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
        isPresent ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
      }`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Reports</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Staff Attendance Report</h1>
          </div>
        </div>
      }
    >
      <Head title="Attendance Report" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Filter Section - Modern Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 transition-all hover:shadow-md">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">

            {/* Report Type */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-gray-700">Report Type</label>
              <select
                value={data.report_type}
                onChange={e => setData('report_type', e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              >
                <option value="single">Single Staff</option>
                <option value="all">All Staff</option>
              </select>
            </div>

            {/* Select Staff (Conditional) */}
            {data.report_type === 'single' && (
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Select Staff</label>
                <select
                  value={data.staff_id}
                  onChange={e => setData('staff_id', e.target.value)}
                  required
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                >
                  <option value="">-- Choose Staff --</option>
                  {staffs.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.first_name} {staff.last_name} ({staff.staff_id_no})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* From Date */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-gray-700">From Date</label>
              <input
                type="date"
                value={data.from_date}
                onChange={e => setData('from_date', e.target.value)}
                required
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-gray-700">To Date</label>
              <input
                type="date"
                value={data.to_date}
                onChange={e => setData('to_date', e.target.value)}
                required
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className={`flex flex-col ${data.report_type === 'all' ? 'lg:col-span-2' : ''}`}>
              <button
                type="submit"
                disabled={processing}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Generating...</span>
                  </span>
                ) : (
                  'Generate Report'
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Report Display Section */}
        {reportData && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {reportType === 'single' ? (
              // Single Staff Report Table
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">In Time</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Out Time</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Note</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.length > 0 ? reportData.map((record, index) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.in_time || '--'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.out_time || '--'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">{record.note || '--'}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <Icon name="search" className="h-10 w-10 text-gray-300 mb-3" />
                            <p className="text-base font-medium">No attendance records found</p>
                            <p className="text-sm text-gray-400">Try adjusting your date range.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              // All Staff Report Display
              <div className="p-6 space-y-8">
                {Object.entries(reportData).map(([staffId, records]) => (
                  <div key={staffId} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Staff Header */}
                    <div className="bg-indigo-50/50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                          {records[0].staff.first_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            {records[0].staff.first_name} {records[0].staff.last_name}
                          </h3>
                          <p className="text-xs font-medium text-indigo-600">ID: {records[0].staff.staff_id_no}</p>
                        </div>
                      </div>
                    </div>

                    {/* Staff Data Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">In Time</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Out Time</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {records.map(record => (
                            <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{record.date}</td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm">
                                {getStatusBadge(record.status)}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">{record.in_time || '--'}</td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">{record.out_time || '--'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {Object.keys(reportData).length === 0 && (
                  <div className="py-12 text-center flex flex-col items-center justify-center">
                    <p className="text-base font-medium text-gray-500">No attendance records found for any staff in this date range.</p>
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
