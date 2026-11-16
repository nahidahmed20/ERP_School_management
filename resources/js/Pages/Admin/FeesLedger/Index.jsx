import { useState, useEffect } from 'react';
import { useForm, Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';

// --- Safe Inline SVG Icons for Stats ---
const StatIcon = {
  Income: () => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
  Expense: () => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
    </svg>
  ),
  Balance: () => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  )
};

export default function Index({ totalIncome, totalExpense, netProfit, expenses }) {
  const [editingId, setEditingId] = useState(null);

  const { data, setData, post, put, processing, reset } = useForm({
    expense_head: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const submitExpense = (e) => {
    e.preventDefault();

    if (editingId) {
      put(route('admin.fees.ledger.update', editingId), {
        onSuccess: () => {
          setEditingId(null);
          reset();
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'খরচ আপডেট হয়েছে!', showConfirmButton: false, timer: 3000, timerProgressBar: true });
        }
      });
    } else {
      post(route('admin.fees.ledger.store'), {
        onSuccess: () => {
          reset();
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'খরচ যুক্ত হয়েছে!', showConfirmButton: false, timer: 3000, timerProgressBar: true });
        }
      });
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setData({
      expense_head: expense.expense_head,
      amount: expense.amount,
      expense_date: expense.expense_date,
      description: expense.description || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: "এই ডাটা মুছে ফেললে আর ফেরত পাওয়া যাবে না!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'হ্যাঁ, ডিলিট করুন!'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin.fees.ledger.destroy', id), {
          onSuccess: () => {
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'খরচ ডিলিট হয়েছে!', showConfirmButton: false, timer: 3000, timerProgressBar: true });
          }
        });
      }
    });
  };

  // Shared Design Classes
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";
  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";

  return (
    <AuthenticatedLayout>
      <Head title="Ledger" />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Finance &amp; Accounts</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Income / Expense Ledger</h1>
            <p className="text-sm text-slate-500 mt-1">স্কুলের মোট আয়, ব্যয় এবং লাভের হিসাব।</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-emerald-50/80 rounded-2xl p-6 border border-emerald-200 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 shadow-sm">
              <StatIcon.Income />
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Income (Fees)</p>
              <h4 className="text-2xl font-black text-emerald-700 font-mono">৳{Number(totalIncome).toLocaleString()}</h4>
            </div>
          </div>

          <div className="bg-rose-50/80 rounded-2xl p-6 border border-rose-200 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 shadow-sm">
              <StatIcon.Expense />
            </div>
            <div>
              <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1">Total Expense</p>
              <h4 className="text-2xl font-black text-rose-700 font-mono">৳{Number(totalExpense).toLocaleString()}</h4>
            </div>
          </div>

          <div className="bg-indigo-50/80 rounded-2xl p-6 border border-indigo-200 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200 shadow-sm">
              <StatIcon.Balance />
            </div>
            <div>
              <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Net Balance</p>
              <h4 className="text-2xl font-black text-indigo-700 font-mono">৳{Number(netProfit).toLocaleString()}</h4>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Form (Left) + Table (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Add/Edit Expense Form */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Expense Record' : 'Add New Expense'}
              </h3>
            </div>

            <form onSubmit={submitExpense} className="p-6 space-y-5">
              <div>
                <label className={labelClass}>Expense Head (e.g. Salary) <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={data.expense_head} 
                  onChange={e => setData('expense_head', e.target.value)} 
                  required 
                  placeholder="খরচের খাত"
                  className={inputClass} 
                  autoFocus={!!editingId}
                />
              </div>

              <div>
                <label className={labelClass}>Amount (৳) <span className="text-rose-500">*</span></label>
                <input 
                  type="number" 
                  value={data.amount} 
                  onChange={e => setData('amount', e.target.value)} 
                  required 
                  placeholder="0.00"
                  className={`${inputClass} font-mono text-lg font-bold text-rose-600`} 
                />
              </div>

              <div>
                <label className={labelClass}>Date <span className="text-rose-500">*</span></label>
                <input 
                  type="date" 
                  value={data.expense_date} 
                  onChange={e => setData('expense_date', e.target.value)} 
                  required 
                  className={`${inputClass} font-mono`} 
                />
              </div>

              <div>
                <label className={labelClass}>Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                <textarea 
                  value={data.description} 
                  onChange={e => setData('description', e.target.value)} 
                  rows="3" 
                  placeholder="খরচের বিস্তারিত..."
                  className={`${inputClass} resize-none`}
                />
              </div>
              
              <div className="pt-2 flex flex-col gap-3">
                <button 
                  type="submit" 
                  disabled={processing} 
                  className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
                    editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                  } ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <Icon name="save" className="w-4 h-4" />
                  {processing ? 'Saving...' : (editingId ? 'Update Expense' : 'Record Expense')}
                </button>
                
                {editingId && (
                  <button 
                    type="button" 
                    onClick={cancelEdit} 
                    className="w-full py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Expense List Table */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Recent Expenses</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expense Head & Desc.</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.data.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                          <Icon name="folder" className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-600">No expense records found</p>
                      </td>
                    </tr>
                  ) : (
                    expenses.data.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-700 font-mono block">{exp.expense_date}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900 block">{exp.expense_head}</span>
                          {exp.description && (
                            <span className="text-xs text-slate-500 font-medium block mt-0.5 max-w-sm truncate" title={exp.description}>
                              {exp.description}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-[15px] font-black text-rose-600 font-mono bg-rose-50 px-2 py-1 rounded-lg">
                            ৳{exp.amount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handleEdit(exp)} 
                              title="Edit Expense"
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <Icon name="edit" className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(exp.id)} 
                              title="Delete Expense"
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
              <Pagination meta={expenses} />
            </div>

          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}