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

  // Update student_id in form state when student prop changes
  useEffect(() => {
    if (student?.id) {
      setData('student_id', student.id);
    }
  }, [student]);

  // --- Beautiful Error & Success Handling ---
  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
      reset('amount_paid', 'transaction_id', 'remarks', 'fee_assignment_id');
      clearErrors();
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
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
        timer: 4000,
        timerProgressBar: true
      });
    }
  }, [flash, pageErrors]);

  const searchStudent = (e) => {
    e.preventDefault();
    if (!admissionNo) return;
    router.get(route('admin.fees.payments.create'), { search: admissionNo }, { preserveState: true });
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!data.fee_assignment_id) {
      Swal.fire({ icon: 'warning', title: 'Oops', text: 'দয়া করে একটি ফি সিলেক্ট করুন!' });
      return;
    }
    post(route('admin.fees.payments.store'));
  };

  const handleFeeSelect = (e) => {
    const assignId = e.target.value;
    setData('fee_assignment_id', assignId);

    const selectedFee = student?.fee_assignments?.find(fa => fa.id == assignId);
    if (selectedFee) {
      const totalAmount = Number(selectedFee.outstanding_amount ?? selectedFee.fee_group?.fee_types?.reduce((sum, item) => sum + Number(item.amount), 0) ?? 0);
      setData('amount_paid', totalAmount);
    }
  };

  // Shared Design Classes
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";
  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";

  return (
    <AuthenticatedLayout>
      <Head title="Receive Payment" />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Finance &amp; Accounts</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Receive Payment</h1>
            <p className="text-sm text-slate-500 mt-1">শিক্ষার্থীর অ্যাডমিশন নম্বর দিয়ে বকেয়া ফি খুঁজুন এবং পেমেন্ট রিসিভ করুন।</p>
          </div>
        </div>

        {/* Step 1: Search Student */}
        <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1 bg-slate-800" />
          
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
              <Icon name="search" className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-900">১. শিক্ষার্থী খুঁজুন</h3>
          </div>

          <form onSubmit={searchStudent} className="flex flex-col sm:flex-row items-end gap-4 max-w-2xl">
            <div className="w-full">
              <label className={labelClass}>Student Admission Number <span className="text-rose-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="search" className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. STU-2025-0001"
                  value={admissionNo}
                  onChange={e => setAdmissionNo(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[15px] font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full sm:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-md active:scale-95 transition-all shrink-0"
            >
              Search Details
            </button>
          </form>
        </div>

        {/* Step 2: Student Details & Payment Form */}
        {student && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column: Student Profile & Pending Fees */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-5">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl font-bold border border-indigo-100 shrink-0">
                    {student.first_name[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{student.first_name} {student.last_name || ''}</h3>
                    <div className="text-sm font-medium text-slate-500 mt-1">
                      Class: {student.current_enrollment?.school_class?.name} | Roll: {student.current_enrollment?.roll_no}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Guardian:</span>
                    <span className="font-semibold">{student.guardian?.father_name} <br/> <span className="font-mono text-xs">{student.guardian?.father_phone}</span></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Admission No:</span>
                    <span className="font-bold font-mono text-indigo-700">#{student.admission_no}</span>
                  </div>
                </div>
              </div>

              {/* Pending Fees List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h4 className="text-base font-bold text-rose-600 flex items-center gap-2 mb-5">
                  <Icon name="warning" className="w-5 h-5" /> Pending Fees
                </h4>
                
                {student.fee_assignments?.length > 0 ? (
                  <div className="space-y-3">
                    {student.fee_assignments.map(assign => {
                      const totalAmount = Number(assign.outstanding_amount ?? assign.fee_group?.fee_types?.reduce((sum, item) => sum + Number(item.amount), 0) ?? 0);
                      return (
                        <div key={assign.id} className="p-4 rounded-xl border border-rose-200 bg-rose-50 flex justify-between items-center gap-4">
                          <div>
                            <strong className="block text-sm font-bold text-rose-800">{assign.fee_group?.name}</strong>
                            <span className="text-xs font-semibold text-rose-600/80 mt-0.5 block">Due: {assign.due_date}</span>
                          </div>
                          <div className="text-lg font-black text-rose-600 font-mono">
                            ৳{totalAmount}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-center font-bold text-sm">
                    এই শিক্ষার্থীর কোনো বকেয়া ফি নেই!
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Payment Receive Form */}
            <div className="lg:col-span-7">
              <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 overflow-hidden">
                <div className="absolute left-0 top-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-600" />
                
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">
                  ২. Process Payment
                </h3>

                <form onSubmit={handlePaymentSubmit} className="space-y-5">
                  
                  {/* Select Fee */}
                  <div>
                    <label className={labelClass}>Select Fee to Pay <span className="text-rose-500">*</span></label>
                    <select
                      value={data.fee_assignment_id}
                      onChange={handleFeeSelect}
                      className={`${inputClass} ${errors.fee_assignment_id ? 'border-rose-500 ring-rose-200' : ''}`}
                    >
                      <option value="">-- বকেয়া ফি সিলেক্ট করুন --</option>
                      {student.fee_assignments?.map(assign => (
                        <option key={assign.id} value={assign.id}>{assign.fee_group?.name}</option>
                      ))}
                    </select>
                    {errors.fee_assignment_id && (
                      <p className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg w-max">
                        <Icon name="warning" className="w-3.5 h-3.5" /> {errors.fee_assignment_id}
                      </p>
                    )}
                  </div>

                  {/* Amount & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Amount Paid (৳) <span className="text-rose-500">*</span></label>
                      <input
                        type="number"
                        value={data.amount_paid}
                        onChange={e => setData('amount_paid', e.target.value)}
                        placeholder="e.g. 500"
                        className={`${inputClass} font-mono text-lg font-bold text-emerald-600 ${errors.amount_paid ? 'border-rose-500 ring-rose-200' : ''}`}
                      />
                      {errors.amount_paid && (
                        <p className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg w-max">
                          <Icon name="warning" className="w-3.5 h-3.5" /> {errors.amount_paid}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Payment Date <span className="text-rose-500">*</span></label>
                      <input
                        type="date"
                        value={data.payment_date}
                        onChange={e => setData('payment_date', e.target.value)}
                        className={`${inputClass} font-mono ${errors.payment_date ? 'border-rose-500 ring-rose-200' : ''}`}
                      />
                      {errors.payment_date && (
                        <p className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg w-max">
                          <Icon name="warning" className="w-3.5 h-3.5" /> {errors.payment_date}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment Method - Radio Cards */}
                  <div>
                    <label className={labelClass}>Payment Method <span className="text-rose-500">*</span></label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Cash', 'Bank', 'Bkash/Nagad'].map(method => (
                        <label 
                          key={method} 
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer font-bold text-sm transition-all ${
                            data.payment_method === method 
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-500/20' 
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="method" 
                            value={method} 
                            checked={data.payment_method === method} 
                            onChange={e => setData('payment_method', e.target.value)} 
                            className="hidden" 
                          />
                          {method}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Transaction ID & Remarks */}
                  {data.payment_method !== 'Cash' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className={labelClass}>Transaction / Check ID</label>
                      <input 
                        type="text" 
                        value={data.transaction_id} 
                        onChange={e => setData('transaction_id', e.target.value)} 
                        placeholder="Enter TrxID" 
                        className={`${inputClass} font-mono`} 
                      />
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>Remarks (Optional)</label>
                    <textarea 
                      rows="2" 
                      value={data.remarks} 
                      onChange={e => setData('remarks', e.target.value)} 
                      placeholder="Any notes regarding this payment..." 
                      className={`${inputClass} resize-none`} 
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={processing || student.fee_assignments?.length === 0} 
                      className={`w-full py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                        processing || student.fee_assignments?.length === 0
                          ? 'bg-slate-300 text-white cursor-not-allowed shadow-none'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30'
                      }`}
                    >
                      <Icon name="check" className="w-5 h-5" />
                      {processing ? 'Processing Payment...' : 'Collect Payment & Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        )}

      </div>
    </AuthenticatedLayout>
  );
}
