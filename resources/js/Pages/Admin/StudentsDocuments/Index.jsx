import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function Index({ student, filters }) {
  const { flash, errors: pageErrors } = usePage().props;
  const [admissionNo, setAdmissionNo] = useState(filters.admission_no ?? '');

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    student_id: student?.id || '',
    document_type: '',
    file: null,
    remarks: ''
  });

  useEffect(() => {
    if (student?.id) setData('student_id', student.id);
  }, [student]);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
      reset('document_type', 'file', 'remarks');
      clearErrors();
      // Reset file input element visually
      document.getElementById('fileUpload').value = '';
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
    }
  }, [flash, pageErrors]);

  const searchStudent = (e) => {
    e.preventDefault();
    if (!admissionNo) return;
    router.get(route('admin.students.documents.index'), { admission_no: admissionNo }, { preserveState: true });
  };

  const handleUpload = (e) => {
    e.preventDefault();
    post(route('admin.students.documents.store'));
  };

  const handleDelete = (docId) => {
    if(confirm('আপনি কি নিশ্চিত যে এই ফাইলটি মুছে ফেলতে চান?')) {
      router.delete(route('admin.students.documents.destroy', docId));
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Students</span>
            <h1>Student Documents</h1>
            <p className="desc">শিক্ষার্থীদের জন্ম নিবন্ধন, ছাড়পত্র ও অন্যান্য প্রয়োজনীয় কাগজপত্র সংরক্ষণ করুন।</p>
          </div>
        </div>
      }
    >
      <Head title="Student Documents" />

      {/* Step 1: Search Student */}
      <div className="card mm-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '24px', borderTop: '4px solid #0f172a' }}>
        <form onSubmit={searchStudent} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', maxWidth: '400px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Student Admission Number *</label>
            <div className="search" style={{ position: 'relative' }}>
              <Icon name="search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="e.g. STU-2025-0001"
                value={admissionNo}
                onChange={e => setAdmissionNo(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn" style={{ padding: '12px 24px', background: '#0f172a', color: '#fff' }}>Search</button>
        </form>
      </div>

      {/* Step 2: Student Profile & Documents */}
      {student && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Left Column: Upload Form */}
          <div className="card mm-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', borderTop: '4px solid #4f46e5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
               <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontSize: '20px', fontWeight: 'bold' }}>
                  {student.first_name[0]}
               </div>
               <div>
                 <h3 style={{ margin: 0, fontSize: '16px' }}>{student.first_name} {student.last_name || ''}</h3>
                 <div style={{ fontSize: '12px', color: '#64748b' }}>Class: {student.current_enrollment?.school_class?.name} | Adm: {student.admission_no}</div>
               </div>
            </div>

            <h4 style={{ marginBottom: '16px', fontSize: '15px' }}>Upload New Document</h4>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Document Type *</label>
                <select value={data.document_type} onChange={e => setData('document_type', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} required>
                  <option value="">-- Select Type --</option>
                  <option value="Birth Certificate">Birth Certificate</option>
                  <option value="Transfer Certificate">Transfer Certificate (TC)</option>
                  <option value="Parent NID">Parent NID</option>
                  <option value="Medical Report">Medical Report</option>
                  <option value="Other">Other</option>
                </select>
                {errors.document_type && <div style={{color:'red', fontSize:'12px'}}>{errors.document_type}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Select File (PDF, JPG, PNG) *</label>
                <input id="fileUpload" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setData('file', e.target.files[0])} style={{ width: '100%', padding: '8px', border: '1px dashed #94a3b8', borderRadius: '6px', background: '#f8fafc' }} required />
                {errors.file && <div style={{color:'red', fontSize:'12px'}}>{errors.file}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Remarks (Optional)</label>
                <input type="text" value={data.remarks} onChange={e => setData('remarks', e.target.value)} placeholder="Any notes..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>

              <button type="submit" disabled={processing} className="btn" style={{ background: '#16a34a', color: '#fff', width: '100%', padding: '12px' }}>
                {processing ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>
          </div>

          {/* Right Column: Uploaded Documents List */}
          <div className="card mm-card" style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
              <Icon name="folder" /> Uploaded Documents ({student.documents?.length || 0})
            </h4>

            {student.documents?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {student.documents.map(doc => (
                  <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{doc.document_type}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{doc.remarks || 'No remarks'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a href={`/storage/${doc.file_path}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '12px' }}>
                        View
                      </a>
                      <button onClick={() => handleDelete(doc.id)} className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '12px', color: '#dc2626', borderColor: '#fca5a5' }}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', border: '2px dashed #cbd5e1', borderRadius: '8px' }}>
                No documents uploaded yet.
              </div>
            )}
          </div>

        </div>
      )}

    </AuthenticatedLayout>
  );
}