import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import TimeTableFormModal from './Partials/TimeTableFormModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ timeTables, campuses, classes, classrooms, filters }) {
  const { flash, auth } = usePage().props;

  const [classId, setClassId] = useState(filters.class_id ?? '');
  const [sectionId, setSectionId] = useState(filters.section_id ?? '');
  const [day, setDay] = useState(filters.day ?? '');

  const [formOpen, setFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const selectedClassForFilter = classes.find(c => c.id == classId);
  const isFilterApplied = classId && sectionId; 

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.time-tables.index'), { class_id: classId, section_id: sectionId, day, ...overrides }, { preserveState: true, replace: true });
  }

  function formatTime(timeString) {
    if (!timeString) return '';
    const [hourString, minute] = timeString.split(':');
    let hour = parseInt(hourString, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  }

  const getSubjectColor = (subjectName) => {
    const colors = [
      { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
      { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
      { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
      { bg: '#fdf4ff', text: '#c026d3', border: '#f5d0fe' },
      { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
      { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
    ];
    let hash = 0;
    for (let i = 0; i < subjectName.length; i++) hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const groupedRoutine = {};
  daysOfWeek.forEach(d => {
    groupedRoutine[d] = timeTables.data.filter(t => t.day_of_week === d);
  });

  const handleEditDay = (dayName, dayPeriods) => {
    const filteredPeriods = dayPeriods.filter(p => p.class_id == classId && p.section_id == sectionId);
    setEditingConfig({
      isEdit: true,
      day_of_week: dayName,
      class_id: classId,
      section_id: sectionId,
      periods: filteredPeriods
    });
    setFormOpen(true);
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Academics</span>
            <h1>Class Timetable</h1>
            <p className="desc">স্মার্ট রুটিন ম্যানেজমেন্ট - দিন অনুযায়ী ক্লাস সাজান এবং এডিট করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingConfig(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Routine
            </button>
          </div>
        </div>
      }
    >
      <Head title="Class Timetable" />

      {/* Filters */}
      <div className="card mm-card" style={{ marginBottom: '20px' }}>
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(''); }}>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}>
            <option value="">Select Section</option>
            {selectedClassForFilter?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={day} onChange={(e) => setDay(e.target.value)}>
            <option value="">All Days</option>
            {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button className="btn btn-outline" onClick={() => applyFilters()}>Search Routine</button>
          
          {!isFilterApplied && (
            <span style={{ fontSize: '12px', color: '#ef4444', marginLeft: '10px' }}>
              * পুরো দিনের রুটিন একসাথে এডিট করতে Class এবং Section সিলেক্ট করে Search করুন।
            </span>
          )}
        </div>
      </div>

      {/* Routine Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {timeTables.data.length === 0 ? (
          <div className="card mm-card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <Icon name="calendar" style={{ width: '40px', margin: '0 auto', color: '#cbd5e1' }} />
            <p style={{ marginTop: '10px' }}>কোনো রুটিন পাওয়া যায়নি। ক্লাস এবং সেকশন ফিল্টার করে খুঁজুন।</p>
          </div>
        ) : (
          daysOfWeek.map(d => {
            const dayPeriods = groupedRoutine[d];
            if (dayPeriods.length === 0) return null;

            return (
              <div key={d} className="card mm-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ background: '#f8fafc', padding: '12px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon name="calendar" style={{ width: '18px', color: '#64748b' }} /> {d}
                    </h3>
                  </div>

                  {isFilterApplied && (
                    <button 
                      onClick={() => handleEditDay(d, dayPeriods)}
                      style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '5px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: 500 }}
                    >
                      <Icon name="edit" style={{ width: '14px' }} /> Edit Day Routine
                    </button>
                  )}
                </div>
                
                <div style={{ padding: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  {dayPeriods.map((period, index) => {
                    const colors = getSubjectColor(period.subject?.name || 'Subject');
                    return (
                      <div key={period.id} style={{ 
                        flex: '1 1 200px', 
                        maxWidth: '280px', 
                        background: colors.bg, 
                        border: `1px solid ${colors.border}`, 
                        borderRadius: '8px', 
                        padding: '15px',
                        position: 'relative' 
                      }}>
                        
                        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                          <button 
                            onClick={() => setDeletingItem(period)} 
                            style={{ background: '#fff', border: `1px solid ${colors.border}`, color: '#ef4444', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex' }}
                            title="Delete this period"
                          >
                            <Icon name="trash" style={{ width: '14px' }} />
                          </button>
                        </div>

                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>PERIOD {index + 1}</div>
                        <h4 style={{ margin: '0 0 10px 0', color: colors.text, fontSize: '16px', fontWeight: 700 }}>{period.subject?.name}</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#475569' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon name="clock" style={{ width: '14px', opacity: 0.7 }} /><span>{formatTime(period.start_time)} - {formatTime(period.end_time)}</span></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon name="users" style={{ width: '14px', opacity: 0.7 }} /><span>{period.school_class?.name} (Sec: {period.section?.name})</span></div>
                          {period.classroom && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon name="home" style={{ width: '14px', opacity: 0.7 }} /><span>{period.classroom.room_number}</span></div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {formOpen && <TimeTableFormModal editingConfig={editingConfig} classes={classes} classrooms={classrooms} campuses={campuses} activeCampusId={auth?.active_campus_id} onClose={() => setFormOpen(false)} />}
      
      {deletingItem && <ConfirmDeleteModal item={deletingItem} onCancel={() => setDeletingItem(null)} onConfirm={() => { router.delete(route('admin.time-tables.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) }); }} />}
    </AuthenticatedLayout>
  );
}