import { useForm, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';

export default function Index({ totalIncome, totalExpense, netProfit, expenses }) {
  const { data, setData, post, processing, reset } = useForm({
    expense_head: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const submitExpense = (e) => {
    e.preventDefault();
    post(route('admin.fees.ledger.store'), {
      onSuccess: () => {
        reset();
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'খরচ যুক্ত হয়েছে!', showConfirmButton: false, timer: 3000 });
      }
    });
  };

  return (
    <AuthenticatedLayout header={<div className="page-head"><h1>Income / Expense Ledger</h1><p>স্কুলের মোট আয়, ব্যয় এবং লাভের হিসাব।</p></div>}>
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
        {/* Add Expense Form */}
        <div className="card mm-card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>Add New Expense</h3>
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
            <button type="submit" disabled={processing} className="btn" style={{ background: '#ef4444', color: '#fff', padding: '12px', borderRadius: '6px', border: 'none' }}>
              {processing ? 'Saving...' : 'Record Expense'}
            </button>
          </form>
        </div>

        {/* Expense List */}
        <div className="card mm-card" style={{ padding: '0' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}><h3>Recent Expenses</h3></div>
          <table className="mm-table" style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Expense Head</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.data.map(exp => (
                <tr key={exp.id}>
                  <td>{exp.expense_date}</td>
                  <td style={{ fontWeight: 'bold' }}>{exp.expense_head}</td>
                  <td>{exp.description || '--'}</td>
                  <td style={{ color: '#dc2626', fontWeight: 'bold' }}>৳{exp.amount}</td>
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
