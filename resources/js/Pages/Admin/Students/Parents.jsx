import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';

export default function Parents({ parents, filters }) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const applyFilters = (overrides = {}) => {
    router.get(route('admin.students.parents'), {
      search: search,
      per_page: perPage,
      ...overrides
    }, { preserveState: true, replace: true });
  };

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!parents.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Father Name', 'Father Phone', 'Mother Name', 'Mother Phone', 'Email', 'Address'];
    const rows = parents.data.map(p => [
      p.father_name || 'N/A', p.father_phone || 'N/A',
      p.mother_name || 'N/A', p.mother_phone || 'N/A',
      p.guardian_email || 'N/A', p.address ? p.address.replace(/\n/g, ' ') : 'N/A'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Parents_Directory_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!parents.data.length) return;
    let text = "Father's Name\tFather's Phone\tMother's Name\tMother's Phone\tEmail\tAddress\n";
    parents.data.forEach(p => {
      text += `${p.father_name || 'N/A'}\t${p.father_phone || 'N/A'}\t${p.mother_name || 'N/A'}\t${p.mother_phone || 'N/A'}\t${p.guardian_email || 'N/A'}\t${p.address ? p.address.replace(/\n/g, ' ') : 'N/A'}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Parents & Guardians" />

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

      <div className="print-title">Parents & Guardians Directory - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Directory</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Parents & Guardians</h1>
            <p className="text-sm text-slate-500 mt-1">স্কুলের সকল শিক্ষার্থীর অভিভাবকের তালিকা এবং যোগাযোগের তথ্য।</p>
          </div>
        </div>

        {/* Unified Modern Toolbar */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {/* Per Page */}
            <select
              value={perPage}
              onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}
              className="appearance-none bg-none pr-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-center"
              style={{ backgroundImage: 'none' }}
            >
              <option value="10">10 / Page</option>
              <option value="20">20 / Page</option>
              <option value="50">50 / Page</option>
              <option value="100">100 / Page</option>
              <option value="all">All</option>
            </select>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by Father/Mother Name or Phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={() => applyFilters()}
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Filter
            </button>
          </div>

          {/* Export Actions */}
          <div className="flex items-center justify-end gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl w-full xl:w-auto shadow-sm shrink-0">
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
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Father's Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mother's Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email & Address</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Children (Students)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parents.data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      কোনো অভিভাবকের তথ্য পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  parents.data.map((guardian) => (
                    <tr key={guardian.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* Father's Info */}
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm font-bold text-slate-900">{guardian.father_name || 'N/A'}</div>
                        <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-1.5">
                          <Icon name="phone" className="w-3.5 h-3.5 text-indigo-400" /> 
                          {guardian.father_phone || 'N/A'}
                        </div>
                      </td>

                      {/* Mother's Info */}
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm font-bold text-slate-900">{guardian.mother_name || 'N/A'}</div>
                        <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-1.5">
                          <Icon name="phone" className="w-3.5 h-3.5 text-indigo-400" /> 
                          {guardian.mother_phone || 'N/A'}
                        </div>
                      </td>

                      {/* Email & Address */}
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm font-medium text-slate-800 mb-1.5">
                          {guardian.guardian_email || <span className="italic text-slate-400">No Email Provided</span>}
                        </div>
                        <div className="text-xs text-slate-500 max-w-[250px] truncate" title={guardian.address}>
                          {guardian.address || 'N/A'}
                        </div>
                      </td>

                      {/* Children Info */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {guardian.students?.length > 0 ? (
                            guardian.students.map(student => (
                              <div key={student.id} className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex flex-col gap-1 transition-colors hover:bg-slate-100">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-sm font-bold text-slate-900">{student.first_name} {student.last_name || ''}</span>
                                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 whitespace-nowrap">
                                    ID: {student.admission_no}
                                  </span>
                                </div>
                                {student.current_enrollment && (
                                  <div className="text-xs font-medium text-slate-500">
                                    Class: {student.current_enrollment.schoolClass?.name} <span className="mx-1">•</span> Roll: {student.current_enrollment.roll_no}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <span className="inline-flex px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wide bg-rose-50 text-rose-700 border border-rose-100 w-fit">
                              No active students
                            </span>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="no-print border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
            <Pagination meta={parents} />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}