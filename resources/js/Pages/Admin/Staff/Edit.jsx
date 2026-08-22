import { useForm, usePage, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';
import { useEffect, useMemo, useRef, useState } from 'react';

const CheckMark = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Edit({ staff, departments, designations, roles, currentRole }) {
  const { flash } = usePage().props;

  const resolveRoleName = (role) => {
    if (!role) return '';
    return typeof role === 'object' ? (role.name || '') : role;
  };

  const { data, setData, post, processing, errors } = useForm({
    _method: 'PUT',
    department_id: staff.department_id || '',
    designation_id: staff.designation_id || '',
    role_name: resolveRoleName(currentRole),
    joining_date: staff.joining_date || '',
    basic_salary: staff.basic_salary || '',

    first_name: staff.first_name || '',
    last_name: staff.last_name || '',
    father_name: staff.father_name || '',
    mother_name: staff.mother_name || '',
    date_of_birth: staff.date_of_birth || '',
    gender: staff.gender || '',
    blood_group: staff.blood_group || '',
    marital_status: staff.marital_status || '',

    phone: staff.phone || '',
    emergency_phone: staff.emergency_phone || '',
    email: staff.email || '',
    present_address: staff.present_address || '',
    permanent_address: staff.permanent_address || '',

    qualification: staff.qualification || '',
    experience: staff.experience || '',

    is_active: staff.is_active === 1 || staff.is_active === true,
    photo: null
  });

  const initialPhoto = staff.photo ? `/storage/${staff.photo}` : null;
  const [photoPreview, setPhotoPreview] = useState(initialPhoto);

  useEffect(() => {
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }

    if (currentRole) {
      setData('role_name', resolveRoleName(currentRole));
    }
  }, [flash, currentRole]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('photo', file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const submit = (e) => {
    e.preventDefault();
    post(route('admin.staff.update', staff.id), { forceFormData: true });
  };

  const employmentComplete = !!(data.department_id && data.designation_id && data.joining_date && data.basic_salary);
  const personalComplete = !!(data.first_name && data.date_of_birth && data.gender);
  const contactComplete = !!(data.phone && data.present_address && data.permanent_address);

  const sections = useMemo(() => ([
    { id: 'section-employment', numeral: '01', label: 'Employment', complete: employmentComplete },
    { id: 'section-personal', numeral: '02', label: 'Personal', complete: personalComplete },
    { id: 'section-contact', numeral: '03', label: 'Contact', complete: contactComplete },
  ]), [employmentComplete, personalComplete, contactComplete]);

  const [activeSection, setActiveSection] = useState('section-employment');
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formattedJoiningDate = data.joining_date
    ? new Date(data.joining_date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">Personnel Register</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">{staff.staff_id_no} — {staff.first_name} {staff.last_name || ''}</h1>
            <p className="text-sm text-slate-500 mt-1">স্টাফ রেকর্ডের তথ্য পরিবর্তন ও আপডেট করুন।</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm">
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold">Joining Date</span>
              <strong className="text-slate-800 font-mono text-sm">{formattedJoiningDate}</strong>
            </div>
            <Link href={route('admin.staff.index')} className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
              <Icon name="list" className="w-4 h-4 text-slate-500" /> Staff Directory
            </Link>
          </div>
        </div>
      }
    >
      <Head title={`Edit Staff - ${staff.first_name}`} />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        <form onSubmit={submit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Sidebar Rail / Progress Navigation */}
            <div className="hidden lg:block lg:col-span-3 sticky top-8">
              <nav className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-2 ring-1 ring-slate-900/5">
                {sections.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => scrollToSection(s.id)}
                    className={`w-full flex items-center gap-3.5 p-3 rounded-xl text-left transition-all ${activeSection === s.id ? 'bg-indigo-50 border border-indigo-100 text-indigo-900' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 ${s.complete ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' : activeSection === s.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-100 text-slate-500'}`}>
                      {s.complete ? <CheckMark /> : s.numeral}
                    </div>
                    <div>
                      <span className="block text-sm font-bold leading-tight">{s.label}</span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">Section {s.numeral}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Form Content */}
            <div className="w-full lg:col-span-9 space-y-6">
              
              {/* 1. Employment Details */}
              <div id="section-employment" ref={el => sectionRefs.current['section-employment'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-7 scroll-mt-8 ring-1 ring-slate-900/5">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                    <Icon name="briefcase" className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Employment Details</h3>
                </div>

                {staff.user_id && (
                  <div className="mb-6 p-5 bg-slate-50 rounded-2xl border border-slate-200 max-w-md">
                    <label className={labelClass}>System Role (Permission) <span className="text-rose-500">*</span></label>
                    <select className={inputClass} value={data.role_name} onChange={e => setData('role_name', e.target.value)} required>
                      <option value="" disabled>-- Select System Role --</option>
                      {roles?.map(role => (
                        <option key={role.id} value={role.name}>
                          {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.role_name && <p className="text-rose-500 text-xs mt-1">{errors.role_name}</p>}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Department <span className="text-rose-500">*</span></label>
                    <select className={inputClass} value={data.department_id} onChange={e => setData('department_id', e.target.value)} required>
                      <option value="" disabled>-- Select Department --</option>
                      {departments?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    {errors.department_id && <p className="text-rose-500 text-xs mt-1">{errors.department_id}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Designation <span className="text-rose-500">*</span></label>
                    <select className={inputClass} value={data.designation_id} onChange={e => setData('designation_id', e.target.value)} required>
                      <option value="" disabled>-- Select Designation --</option>
                      {designations?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    {errors.designation_id && <p className="text-rose-500 text-xs mt-1">{errors.designation_id}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Joining Date <span className="text-rose-500">*</span></label>
                    <input className={`${inputClass} font-mono`} type="date" value={data.joining_date} onChange={e => setData('joining_date', e.target.value)} required />
                    {errors.joining_date && <p className="text-rose-500 text-xs mt-1">{errors.joining_date}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Basic Salary (Monthly) <span className="text-rose-500">*</span></label>
                    <input className={`${inputClass} font-mono`} type="number" step="0.01" min="0" value={data.basic_salary} onChange={e => setData('basic_salary', e.target.value)} required />
                    {errors.basic_salary && <p className="text-rose-500 text-xs mt-1">{errors.basic_salary}</p>}
                  </div>
                </div>
              </div>

              {/* 2. Personal Information */}
              <div id="section-personal" ref={el => sectionRefs.current['section-personal'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-7 scroll-mt-8 ring-1 ring-slate-900/5">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Icon name="user" className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Staff Personal Information</h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-200 mb-6">
                  <div className="relative w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-sm hover:border-indigo-500 transition-colors cursor-pointer group">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Icon name="camera" className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    )}
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" title="Update Photo" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-base font-bold text-slate-900 mb-1">Update Staff Photo</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Click the frame to upload a new image.<br />Max size: 2MB.</p>
                    {errors.photo && <p className="text-rose-500 text-xs mt-1">{errors.photo}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>First Name <span className="text-rose-500">*</span></label>
                    <input className={inputClass} type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)} required />
                    {errors.first_name && <p className="text-rose-500 text-xs mt-1">{errors.first_name}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input className={inputClass} type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)} />
                    {errors.last_name && <p className="text-rose-500 text-xs mt-1">{errors.last_name}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Father's Name</label>
                    <input className={inputClass} type="text" value={data.father_name} onChange={e => setData('father_name', e.target.value)} />
                    {errors.father_name && <p className="text-rose-500 text-xs mt-1">{errors.father_name}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Mother's Name</label>
                    <input className={inputClass} type="text" value={data.mother_name} onChange={e => setData('mother_name', e.target.value)} />
                    {errors.mother_name && <p className="text-rose-500 text-xs mt-1">{errors.mother_name}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Date of Birth <span className="text-rose-500">*</span></label>
                    <input className={`${inputClass} font-mono`} type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} required />
                    {errors.date_of_birth && <p className="text-rose-500 text-xs mt-1">{errors.date_of_birth}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Gender <span className="text-rose-500">*</span></label>
                    <select className={inputClass} value={data.gender} onChange={e => setData('gender', e.target.value)} required>
                      <option value="" disabled>-- Select --</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <p className="text-rose-500 text-xs mt-1">{errors.gender}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Blood Group</label>
                    <select className={inputClass} value={data.blood_group} onChange={e => setData('blood_group', e.target.value)}>
                      <option value="">-- Select --</option>
                      <option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option><option value="AB+">AB+</option>
                      <option value="A-">A-</option><option value="O-">O-</option><option value="B-">B-</option><option value="AB-">AB-</option>
                    </select>
                    {errors.blood_group && <p className="text-rose-500 text-xs mt-1">{errors.blood_group}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Marital Status</label>
                    <select className={inputClass} value={data.marital_status} onChange={e => setData('marital_status', e.target.value)}>
                      <option value="">-- Select --</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                    {errors.marital_status && <p className="text-rose-500 text-xs mt-1">{errors.marital_status}</p>}
                  </div>
                </div>
              </div>

              {/* 3. Contact & Qualifications */}
              <div id="section-contact" ref={el => sectionRefs.current['section-contact'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-7 scroll-mt-8 ring-1 ring-slate-900/5">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                    <Icon name="phone" className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Contact &amp; Qualifications</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Phone Number <span className="text-rose-500">*</span></label>
                    <input className={`${inputClass} font-mono`} type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} required />
                    {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Emergency Contact</label>
                    <input className={`${inputClass} font-mono`} type="text" value={data.emergency_phone} onChange={e => setData('emergency_phone', e.target.value)} />
                    {errors.emergency_phone && <p className="text-rose-500 text-xs mt-1">{errors.emergency_phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Email Address</label>
                    <input className={inputClass} type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                    {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Educational Qualifications</label>
                    <input className={inputClass} type="text" value={data.qualification} onChange={e => setData('qualification', e.target.value)} />
                    {errors.qualification && <p className="text-rose-500 text-xs mt-1">{errors.qualification}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Work Experience</label>
                    <input className={inputClass} type="text" value={data.experience} onChange={e => setData('experience', e.target.value)} />
                    {errors.experience && <p className="text-rose-500 text-xs mt-1">{errors.experience}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Present Address <span className="text-rose-500">*</span></label>
                    <textarea rows="3" className={`${inputClass} resize-none`} value={data.present_address} onChange={e => setData('present_address', e.target.value)} required />
                    {errors.present_address && <p className="text-rose-500 text-xs mt-1">{errors.present_address}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Permanent Address <span className="text-rose-500">*</span></label>
                    <textarea rows="3" className={`${inputClass} resize-none`} value={data.permanent_address} onChange={e => setData('permanent_address', e.target.value)} required />
                    {errors.permanent_address && <p className="text-rose-500 text-xs mt-1">{errors.permanent_address}</p>}
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer group w-max">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={e => setData('is_active', e.target.checked)}
                        className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors"
                      />
                      <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Account is Active (Current Employee)</span>
                  </label>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <Link href={route('admin.staff.index')} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
                  Cancel
                </Link>
                <button type="submit" disabled={processing} className="flex items-center gap-2 px-7 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
                  <CheckMark />
                  {processing ? 'Saving Changes...' : 'Update Record'}
                </button>
              </div>

            </div>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}