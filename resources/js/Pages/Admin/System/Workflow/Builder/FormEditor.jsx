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

  const inputClass = "block w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";

  return (
    <AuthenticatedLayout>
      <Head title="Form Editor" />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">System / Workflow & Forms</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">{isEdit ? 'Edit Form' : 'Build Form'}</h1>
          </div>
          <Link href={route('admin.workflow-builder.index')} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
            <Icon name="arrow-left" className="w-4 h-4" /> Back to List
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ================= LEFT SIDE: BUILDER CONTROLS ================= */}
          <div className="w-full lg:w-[55%] xl:w-[60%] shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

            {/* Top Form Details */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Form Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Form Title <span className="text-rose-500">*</span></label>
                  <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                  <textarea rows="2" value={data.description} onChange={e => setData('description', e.target.value)} className={`${inputClass} resize-none`}></textarea>
                </div>
              </div>
            </div>

            {/* Field Builder */}
            <div className="p-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <h3 className="text-lg font-bold text-slate-900">Add Fields</h3>
              </div>

              {/* Add Buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button type="button" onClick={() => addField('text')} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
                  <Icon name="type" className="w-3.5 h-3.5" /> Text
                </button>
                <button type="button" onClick={() => addField('email')} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
                  <Icon name="mail" className="w-3.5 h-3.5" /> Email
                </button>
                <button type="button" onClick={() => addField('number')} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
                  <Icon name="hash" className="w-3.5 h-3.5" /> Number
                </button>
                <button type="button" onClick={() => addField('select')} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
                  <Icon name="chevron-down" className="w-3.5 h-3.5" /> Dropdown
                </button>
                <button type="button" onClick={() => addField('radio')} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
                  <Icon name="disc" className="w-3.5 h-3.5" /> Radio
                </button>
                <button type="button" onClick={() => addField('checkbox')} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
                  <Icon name="check-square" className="w-3.5 h-3.5" /> Checkbox
                </button>
              </div>

              {/* List of Added Fields (Editor) */}
              <div className="space-y-4">
                {data.form_schema.map((field, index) => (
                  <div key={field.id} className="relative bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">

                    {/* Delete Field Button */}
                    <button type="button" onClick={() => removeField(field.id)} className="absolute top-3 right-3 text-rose-500 hover:bg-rose-100 p-1.5 rounded-lg transition-colors" title="Remove Field">
                      <Icon name="trash" className="w-4 h-4" />
                    </button>

                    <div className="pr-8">
                      <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Field {index + 1}</span>
                        <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase bg-white border border-slate-200 text-slate-600 shadow-sm">
                          {field.type}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Field Label (Question)</label>
                          <input type="text" value={field.label} onChange={e => updateField(field.id, 'label', e.target.value)} className={`${inputClass} text-xs py-2`} />
                        </div>

                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2 cursor-pointer group w-max">
                            <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, 'required', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Required Field</span>
                          </label>
                        </div>
                      </div>

                      {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                        <div className="mt-4">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Options (Comma separated)</label>
                          <input type="text" value={field.options} onChange={e => updateField(field.id, 'options', e.target.value)} placeholder="e.g. Red, Green, Blue" className={`${inputClass} text-xs py-2`} />
                        </div>
                      )}
                    </div>

                  </div>
                ))}

                {data.form_schema.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
                    <Icon name="list" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-slate-500">No fields added yet.</p>
                    <p className="text-xs mt-1">Click the buttons above to start building.</p>
                  </div>
                )}
              </div>

            </div>

            {/* Save Action */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group w-max">
                <input type="checkbox" checked={data.is_published} onChange={(e) => setData('is_published', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" />
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Publish Form</span>
              </label>

              <button type="button" onClick={submit} disabled={processing} className="flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
                <Icon name="save" className="w-4 h-4" />
                {processing ? 'Saving...' : 'Save Form'}
              </button>
            </div>

          </div>

          {/* ================= RIGHT SIDE: LIVE PREVIEW ================= */}
          <div className="w-full lg:flex-1 lg:sticky lg:top-24 flex flex-col items-center">

            <div className="w-full flex items-center justify-center gap-2 mb-4 bg-slate-900 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Form Preview
            </div>

            <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-8 flex flex-col pointer-events-none opacity-90 ring-8 ring-slate-50">

              <div className="border-b-2 border-indigo-500 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{data.title || 'Untitled Form'}</h2>
                {data.description && <p className="text-sm text-slate-500 mt-2">{data.description}</p>}
              </div>

              <div className="flex flex-col gap-6">
                {data.form_schema.map(field => (
                  <div key={field.id} className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-800">
                      {field.label} {field.required && <span className="text-rose-500 ml-1">*</span>}
                    </label>

                    {/* Text / Email / Number */}
                    {(field.type === 'text' || field.type === 'email' || field.type === 'number') && (
                      <input type={field.type} placeholder={`Enter ${field.label.toLowerCase()}`} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 shadow-inner" readOnly />
                    )}

                    {/* Select */}
                    {field.type === 'select' && (
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 shadow-inner" readOnly>
                        <option value="">Select an option</option>
                        {field.options?.split(',').map((opt, i) => <option key={i}>{opt.trim()}</option>)}
                      </select>
                    )}

                    {/* Radio */}
                    {field.type === 'radio' && (
                      <div className="flex flex-wrap gap-4 mt-1">
                        {field.options?.split(',').map((opt, i) => (
                          <label key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="radio" className="w-4 h-4 border-slate-300 text-indigo-600" readOnly /> {opt.trim()}
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Checkbox */}
                    {field.type === 'checkbox' && (
                      <div className="flex flex-wrap gap-4 mt-1">
                        {field.options?.split(',').map((opt, i) => (
                          <label key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600" readOnly /> {opt.trim()}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {data.form_schema.length > 0 ? (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <button type="button" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-500 rounded-xl shadow-md opacity-70" readOnly>
                      <Icon name="check" className="w-4 h-4" /> Submit Form
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-sm font-medium italic">
                    Add fields to see preview
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}
