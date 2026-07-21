import { useState } from 'react';
import { useForm, Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';

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
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'খরচ আপডেট হয়েছে!', showConfirmButton: false, timer: 3000 });
        }
      });
    } else {
      post(route('admin.fees.ledger.store'), {
        onSuccess: () => {
          reset();
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'খরচ যুক্ত হয়েছে!', showConfirmButton: false, timer: 3000 });
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
      text: "এই ডাটা মুছে ফেললে আর ফেরত পাওয়া যাবে না!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'হ্যাঁ, ডিলিট করুন!'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin.fees.ledger.destroy', id), {
          onSuccess: () => {
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'খরচ ডিলিট হয়েছে!', showConfirmButton: false, timer: 3000 });
          }
        });
      }
    });
  };

  return (
    <AuthenticatedLayout header={<div className="page-head"><h1>Income / Expense Ledger</h1><p>স্কুলের মোট আয়, ব্যয় এবং লাভের হিসাব।</p></div>}>
      <Head title="Ledger" />

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
          <h3 style={{ margin: 0, color: '#16a34a', fontSize: '16px' }}>Total Income (Fees)</h3>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#15803d' }}>৳{Number(totalIncome).toLocaleString()}</h2>
        </div>
        <div className="card" style={{ padding: '20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px' }}>
          <h3 style={{ margin: 0, color: '#dc2626', fontSize: '16px' }}>Total Expense</h3>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#b91c1c' }}>৳{Number(totalExpense).toLocaleString()}</h2>
        </div>
        <div className="card" style={{ padding: '20px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px' }}>
          <h3 style={{ margin: 0, color: '#2563eb', fontSize: '16px' }}>Net Balance</h3>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#1d4ed8' }}>৳{Number(netProfit).toLocaleString()}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Add/Edit Expense Form */}
        <div className="card mm-card" style={{ padding: '20px', alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '20px' }}>
            {editingId ? 'Edit Expense' : 'Add New Expense'}
          </h3>
          <form onSubmit={submitExpense} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px' }}>Expense Head (e.g. Salary) *</label>
              <input type="text" value={data.expense_head} onChange={e => setData('expense_head', e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px' }}>Amount (৳) *</label>
              <input type="number" value={data.amount} onChange={e => setData('amount', e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px' }}>Date *</label>
              <input type="date" value={data.expense_date} onChange={e => setData('expense_date', e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px' }}>Description</label>
              <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows="2" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}></textarea>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={processing} className="btn" style={{ flex: 1, textAlign: 'center', display: 'flex', justifyContent: 'center',alignItems: 'center', background: editingId ? '#eab308' : '#ef4444', color: '#fff', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                {processing ? 'Saving...' : (editingId ? 'Update Expense' : 'Record Expense')}
              </button>
              
              {editingId && (
                <button type="button" onClick={cancelEdit} className="btn" style={{ background: '#64748b', color: '#fff', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Expense List */}
        <div className="card mm-card" style={{ padding: '0' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}><h3>Recent Expenses</h3></div>
          <table className="mm-table" style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Expense Head</th>
                <th style={{ padding: '12px' }}>Description</th>
                <th style={{ padding: '12px' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.data.map(exp => (
                <tr key={exp.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{exp.expense_date}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{exp.expense_head}</td>
                  <td style={{ padding: '12px' }}>{exp.description || '--'}</td>
                  <td style={{ padding: '12px', color: '#dc2626', fontWeight: 'bold' }}>৳{exp.amount}</td>
                  
                  {/* Edit & Delete Action Buttons */}
                  <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => handleEdit(exp)} 
                      title="Edit"
                      style={{ 
                        padding: '8px', 
                        background: '#fef08a', 
                        color: '#854d0e', 
                        border: '1px solid #fde047', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21l3.5-.5L19 8a2.1 2.1 0 10-3-3L3.5 17.5 3 21z"/>
                        <path d="M14 5l5 5"/>
                      </svg>
                    </button>

                    <button 
                      onClick={() => handleDelete(exp.id)} 
                      title="Delete"
                      style={{ 
                        padding: '8px', 
                        background: '#fecaca', 
                        color: '#b91c1c', 
                        border: '1px solid #fca5a5', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M8 6V4h8v2"/>
                        <path d="M6 6l1 14h10l1-14"/>
                        <path d="M10 10v6"/>
                        <path d="M14 10v6"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '20px' }}><Pagination meta={expenses} /></div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}