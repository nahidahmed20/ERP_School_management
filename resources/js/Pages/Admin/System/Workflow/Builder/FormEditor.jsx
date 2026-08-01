import React, { useState } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

export default function FormEditor({ item, campuses, activeCampusId }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin';

  const { data, setData, post, put, processing } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    title: item?.title ?? 'Untitled Form',
    description: item?.description ?? '',
    form_schema: item?.form_schema ?? [],
    is_published: item?.is_published ?? true,
  });

  // Add a new dynamic field
  const addField = (type) => {
    const newField = {
      id: Date.now().toString(),
      type: type, // text, email, number, select, radio, checkbox, textarea
      label: 'New ' + type + ' field',
      required: false,
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? 'Option 1, Option 2' : '', // Comma separated
    };
    setData('form_schema', [...data.form_schema, newField]);
  };

  // Update a specific field's property
  const updateField = (id, key, value) => {
    const updatedSchema = data.form_schema.map(field => field.id === id ? { ...field, [key]: value } : field);
    setData('form_schema', updatedSchema);
  };

  // Remove a field
  const removeField = (id) => {
    setData('form_schema', data.form_schema.filter(field => field.id !== id));
  };

  const submit = (e) => {
    e.preventDefault();
    if (isEdit) put(route('admin.workflow-builder.update', item.id));
    else post(route('admin.workflow-builder.store'));
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div><span className="eyebrow">System / Workflow & Forms</span><h1>{isEdit ? 'Edit Form' : 'Build Form'}</h1></div>
          <Link href={route('admin.workflow-builder.index')} className="btn btn-outline"><Icon name="arrow-left" /> Back</Link>
        </div>
      }
    >
      <Head title="Form Editor" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ================= LEFT SIDE: BUILDER CONTROLS ================= */}
        <div className="card mm-card" style={{ padding: '20px' }}>
          <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>Form Details</h3>

          <div className="mm-form-grid">
            <label style={{ gridColumn: '1 / -1' }}><span>Form Title *</span>
              <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} required />
            </label>
            <label style={{ gridColumn: '1 / -1' }}><span>Description</span>
              <textarea rows="2" value={data.description} onChange={e => setData('description', e.target.value)}></textarea>
            </label>
          </div>

          <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', margin: '20px 0 15px' }}>Add Fields</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => addField('text')}><Icon name="plus" /> Text</button>
            <button type="button" className="btn btn-outline" onClick={() => addField('email')}><Icon name="plus" /> Email</button>
            <button type="button" className="btn btn-outline" onClick={() => addField('number')}><Icon name="plus" /> Number</button>
            <button type="button" className="btn btn-outline" onClick={() => addField('select')}><Icon name="plus" /> Dropdown</button>
            <button type="button" className="btn btn-outline" onClick={() => addField('radio')}><Icon name="plus" /> Radio</button>
            <button type="button" className="btn btn-outline" onClick={() => addField('checkbox')}><Icon name="plus" /> Checkbox</button>
          </div>

          {/* List of Added Fields (Editor) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {data.form_schema.map((field, index) => (
              <div key={field.id} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative' }}>
                <button type="button" onClick={() => removeField(field.id)} style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="trash" /></button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  <label><span>Field Label (Question)</span>
                    <input type="text" value={field.label} onChange={e => updateField(field.id, 'label', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '25px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, 'required', e.target.checked)} /> Required Field
                    </label>
                  </div>
                </div>

                {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                  <label style={{ display: 'block', marginTop: '10px' }}><span>Options (Comma separated)</span>
                    <input type="text" value={field.options} onChange={e => updateField(field.id, 'options', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="e.g. Red, Green, Blue" />
                  </label>
                )}
              </div>
            ))}
            {data.form_schema.length === 0 && <div style={{ color: '#64748b', fontSize: '14px' }}>No fields added yet. Click above buttons to add.</div>}
          </div>

          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <button className="btn" onClick={submit} disabled={processing}><Icon name="save" /> Save Form</button>
          </div>
        </div>

        {/* ================= RIGHT SIDE: LIVE PREVIEW ================= */}
        <div style={{ position: 'sticky', top: '20px' }}>
          <div style={{ color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px', marginBottom: '10px', textAlign: 'center' }}>Live Form Preview</div>

          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#0f172a' }}>{data.title || 'Form Title'}</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>{data.description}</p>

            <form className="mm-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} onSubmit={e => e.preventDefault()}>
              {data.form_schema.map(field => (
                <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#334155' }}>
                    {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                  </label>

                  {/* Render based on field type */}
                  {(field.type === 'text' || field.type === 'email' || field.type === 'number') && (
                    <input type={field.type} placeholder={`Enter ${field.label.toLowerCase()}`} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} disabled />
                  )}

                  {field.type === 'select' && (
                    <select style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} disabled>
                      <option value="">Select an option</option>
                      {field.options?.split(',').map((opt, i) => <option key={i} value={opt.trim()}>{opt.trim()}</option>)}
                    </select>
                  )}

                  {field.type === 'radio' && (
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                      {field.options?.split(',').map((opt, i) => (
                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <input type="radio" name={field.id} disabled /> {opt.trim()}
                        </label>
                      ))}
                    </div>
                  )}

                  {field.type === 'checkbox' && (
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                      {field.options?.split(',').map((opt, i) => (
                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <input type="checkbox" disabled /> {opt.trim()}
                        </label>
                      ))}
                    </div>
                  )}

                </div>
              ))}

              {data.form_schema.length > 0 && (
                <button type="button" className="btn" style={{ marginTop: '10px', alignSelf: 'flex-start' }} disabled>
                    <Icon name="check" /> Submit Form
                </button>
                )}
            </form>
          </div>
        </div>

      </div>
    </AuthenticatedLayout>
  );
}
