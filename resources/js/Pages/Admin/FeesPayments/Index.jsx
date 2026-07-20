import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function Index({ student, filters }) {
  const { flash, errors: pageErrors } = usePage().props;

  const [admissionNo, setAdmissionNo] = useState(filters.admission_no ?? '');

  // Form State for Payment
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    fee_assignment_id: '',
    student_id: student?.id || '',
    amount_paid: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Cash',
    transaction_id: '',
    remarks: ''
  });

  // --- Beautiful Error & Success Handling ---
  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
      reset('amount_paid', 'transaction_id', 'remarks', 'fee_assignment_id');
      clearErrors();
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
    }

    if (Object.keys(pageErrors).length > 0) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'দুঃখিত! ফর্মে কিছু ভুল আছে, চেক করুন।',
        background: '#fef2f2',
        color: '#991b1b',
        showConfirmButton: false,
        timer: 4000
      });
    }
  }, [flash, pageErrors]);

  const searchStudent = (e) => {
    e.preventDefault();
    if (!admissionNo) return;
    router.get(route('admin.fees.payments'), { admission_no: admissionNo }, { preserveState: true });
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!data.fee_assignment_id) {
      Swal.fire({ icon: 'warning', title: 'Oops', text: 'দয়া করে একটি ফি সিলেক্ট করুন!' });
      return;
    }
    post(route('admin.fees.payments.store'));
  };

  const handleFeeSelect = (e) => {
    const assignId = e.target.value;
    setData('fee_assignment_id', assignId);

    const selectedFee = student?.fee_assignments?.find(fa => fa.id == assignId);
    if (selectedFee) {
      const totalAmount = selectedFee.fee_group?.fee_types?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      setData('amount_paid', totalAmount);
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Finance & Accounts</span>
            <h1>Receive Payment</h1>
            <p className="desc">শিক্ষার্থীর অ্যাডমিশন নম্বর দিয়ে বকেয়া ফি খুঁজুন এবং পেমেন্ট রিসিভ করুন।</p>
          </div>
        </div>
      }
    >
      <Head title="Receive Payment" />

      {/* Step 1: Search Student */}
      <div className="card mm-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '24px', borderTop: '4px solid #0f172a' }}>
        <form onSubmit={searchStudent} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', maxWidth: '400px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
              Student Admission Number <span style={{color:'#ef4444'}}>*</span>
            </label>
            <div className="search" style={{ position: 'relative' }}>
              <Icon name="search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="e.g. STU-2025-0001"
                value={admissionNo}
                onChange={e => setAdmissionNo(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn" style={{ padding: '12px 24px', background: '#0f172a', color: '#fff', borderRadius: '8px', fontWeight: '600' }}>
            Search Details
          </button>
        </form>
      </div>

      {/* Step 2: Student Details & Payment Form */}
      {student && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

          {/* Left Column: Student Profile & Pending Fees */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Profile Info */}
            <div className="card mm-card" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontSize: '24px', fontWeight: 'bold' }}>
                  {student.first_name[0]}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a' }}>{student.first_name} {student.last_name || ''}</h3>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Class: {student.current_enrollment?.school_class?.name} | Roll: {student.current_enrollment?.roll_no}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#334155' }}>
                <div><strong>Guardian:</strong> {student.guardian?.father_name} ({student.guardian?.father_phone})</div>
                <div><strong>Admission:</strong> {student.admission_no}</div>
              </div>
            </div>

            {/* Pending Fees List */}
            <div className="card mm-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="warning" /> Pending Fees
              </h4>
              {student.fee_assignments?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {student.fee_assignments.map(assign => {
                    const totalAmount = assign.fee_group?.fee_types?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
                    return (
                      <div key={assign.id} style={{ padding: '12px', borderRadius: '8px', border: '1px dashed #f87171', background: '#fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ display: 'block', color: '#991b1b', fontSize: '14px' }}>{assign.fee_group?.name}</strong>
                          <span style={{ fontSize: '12px', color: '#b91c1c' }}>Due: {assign.due_date}</span>
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#dc2626' }}>৳ {totalAmount}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '16px', background: '#f0fdf4', color: '#16a34a', borderRadius: '8px', textAlign: 'center', fontWeight: '600' }}>
                  এই শিক্ষার্থীর কোনো বকেয়া ফি নেই!
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Payment Receive Form */}
          <div className="card mm-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', borderTop: '4px solid #4f46e5', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              Process Payment
            </h3>

            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Select Fee */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Select Fee to Pay <span style={{color:'red'}}>*</span></label>
                <select
                  value={data.fee_assignment_id}
                  onChange={handleFeeSelect}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: errors.fee_assignment_id ? '1px solid #ef4444' : '1px solid #cbd5e1', background: '#f8fafc' }}
                >
                  <option value="">-- বকেয়া ফি সিলেক্ট করুন --</option>
                  {student.fee_assignments?.map(assign => (
                    <option key={assign.id} value={assign.id}>{assign.fee_group?.name}</option>
                  ))}
                </select>
                {/* Beautiful Inline Error */}
                {errors.fee_assignment_id && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', background: '#fef2f2', padding: '4px 8px', borderRadius: '4px' }}><Icon name="warning" style={{ fontSize: '12px' }}/> {errors.fee_assignment_id}</div>}
              </div>

              {/* Amount & Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Amount Paid (৳) <span style={{color:'red'}}>*</span></label>
                  <input
                    type="number"
                    value={data.amount_paid}
                    onChange={e => setData('amount_paid', e.target.value)}
                    placeholder="e.g. 500"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: errors.amount_paid ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '16px', fontWeight: 'bold', color: '#16a34a' }}
                  />
                  {errors.amount_paid && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', background: '#fef2f2', padding: '4px 8px', borderRadius: '4px' }}><Icon name="warning" style={{ fontSize: '12px' }}/> {errors.amount_paid}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Payment Date <span style={{color:'red'}}>*</span></label>
                  <input
                    type="date"
                    value={data.payment_date}
                    onChange={e => setData('payment_date', e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: errors.payment_date ? '1px solid #ef4444' : '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Payment Method <span style={{color:'red'}}>*</span></label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['Cash', 'Bank', 'Bkash/Nagad'].map(method => (
                    <label key={method} style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: data.payment_method === method ? '#e0e7ff' : '#f8fafc', border: data.payment_method === method ? '2px solid #4f46e5' : '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: data.payment_method === method ? '700' : '500', color: data.payment_method === method ? '#4f46e5' : '#475569', transition: 'all 0.2s' }}>
                      <input type="radio" name="method" value={method} checked={data.payment_method === method} onChange={e => setData('payment_method', e.target.value)} style={{ display: 'none' }} />
                      {method}
                    </label>
                  ))}
                </div>
              </div>

              {/* Transaction ID & Remarks */}
              {data.payment_method !== 'Cash' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Transaction / Check ID</label>
                  <input type="text" value={data.transaction_id} onChange={e => setData('transaction_id', e.target.value)} placeholder="Enter TrxID" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Remarks (Optional)</label>
                <textarea rows="2" value={data.remarks} onChange={e => setData('remarks', e.target.value)} placeholder="Any notes regarding this payment..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              {/* Submit Button */}
              <div style={{ marginTop: '12px' }}>
                <button type="submit" disabled={processing || student.fee_assignments?.length === 0} className="btn" style={{ width: '100%', padding: '14px', background: '#16a34a', color: '#fff', borderRadius: '8px', fontWeight: '700', fontSize: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.4)' }}>
                  {processing ? 'Processing Payment...' : 'Collect Payment & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AuthenticatedLayout>
  );
}
