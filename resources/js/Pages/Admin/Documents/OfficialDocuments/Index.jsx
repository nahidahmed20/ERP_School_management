import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import Icon from '@/Components/Icons';

const boxClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 outline-none';
const labelClass = 'block text-sm font-semibold text-slate-700';

function Modal({ close, title, children }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={close}>
            <div onClick={e => e.stopPropagation()} className="max-h-[90vh] w-full max-w-3xl flex flex-col rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                    <button onClick={close} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors bg-white border border-slate-200 shadow-sm"><Icon name="close" className="w-4 h-4" /></button>
                </div>
                <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                   {children}
                </div>
            </div>
        </div>
    );
}

function Actions({ close, processing, label }) {
    return (
        <div className="flex justify-end gap-3 sm:col-span-2 pt-4 border-t border-slate-100 mt-2">
            <button type="button" onClick={close} disabled={processing} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button disabled={processing} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-70 flex items-center gap-2">
                {processing ? 'Processing...' : <><Icon name="save" className="w-4 h-4" /> {label}</>}
            </button>
        </div>
    );
}

function Issue({ templates, students, staff, close }) {
    const { data, setData, post, processing, errors } = useForm({
        official_document_template_id: '',
        recipient_type: 'student',
        recipient_id: '',
        issue_date: new Date().toISOString().slice(0, 10),
        purpose: '',
        remarks: ''
    });
    
    const people = data.recipient_type === 'student' ? students : staff;
    
    const submit = (e) => {
        e.preventDefault();
        post(route('admin.documents.official.store'), { onSuccess: close });
    };

    return (
        <Modal close={close} title="Issue Official Document">
            <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
                
                <div className="sm:col-span-2">
                    <label className={labelClass}>Select Document Template <span className="text-rose-500">*</span></label>
                    <select value={data.official_document_template_id} onChange={e => setData('official_document_template_id', e.target.value)} className={`${boxClass} bg-white`} required>
                        <option value="">-- Choose Template --</option>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    {errors.official_document_template_id && <small className="text-rose-600 mt-1 block">{errors.official_document_template_id}</small>}
                </div>

                <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                    <div>
                        <label className={labelClass}>Recipient Type</label>
                        {/* 🟢 FIX: Safe update using callback to prevent state bugs */}
                        <select value={data.recipient_type} onChange={e => setData(prev => ({ ...prev, recipient_type: e.target.value, recipient_id: '' }))} className={`${boxClass} bg-white`}>
                            <option value="student">Student</option>
                            <option value="staff">Teacher / Staff</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Issue Date <span className="text-rose-500">*</span></label>
                        <input type="date" value={data.issue_date} onChange={e => setData('issue_date', e.target.value)} className={boxClass} required />
                    </div>
                </div>

                <div className="sm:col-span-2">
                    <label className={labelClass}>Select Recipient <span className="text-rose-500">*</span></label>
                    <select value={data.recipient_id} onChange={e => setData('recipient_id', e.target.value)} className={`${boxClass} bg-white`} required>
                        <option value="">-- Search and Select --</option>
                        {people.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.admission_no || p.staff_id_no})</option>)}
                    </select>
                    {errors.recipient_id && <small className="text-rose-600 mt-1 block">{errors.recipient_id}</small>}
                </div>

                <div className="sm:col-span-2">
                    <label className={labelClass}>Purpose (Optional)</label>
                    <input value={data.purpose} onChange={e => setData('purpose', e.target.value)} placeholder="e.g. Visa application, Transfer" className={boxClass} />
                </div>

                <div className="sm:col-span-2">
                    <label className={labelClass}>Remarks (Optional)</label>
                    <textarea rows="3" value={data.remarks} onChange={e => setData('remarks', e.target.value)} placeholder="Any extra notes..." className={`${boxClass} resize-none`} />
                </div>

                <Actions close={close} processing={processing} label="Issue Document" />
            </form>
        </Modal>
    );
}

function TemplateForm({ item, close }) {
    const isEdit = !!item;
    const { data, setData, post, put, processing, errors } = useForm({
        name: item?.name ?? '',
        document_type: item?.document_type ?? 'custom',
        title: item?.title ?? '',
        body_template: item?.body_template ?? 'This is to certify that {{name}}, ID {{id}}, {{remarks}}',
        instructions: item?.instructions ?? '',
        signature_1: item?.signature_1 ?? 'Principal',
        signature_2: item?.signature_2 ?? 'Authorized Officer',
        orientation: item?.orientation ?? 'portrait',
        is_active: item?.is_active ?? true
    });

    const submit = (e) => {
        e.preventDefault();
        const options = { onSuccess: close };
        if (isEdit) put(route('admin.documents.official-templates.update', item.id), options);
        else post(route('admin.documents.official-templates.store'), options);
    };

    return (
        <Modal close={close} title={isEdit ? 'Edit Template' : 'Create Template'}>
            <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
                
                <div>
                    <label className={labelClass}>Template Name <span className="text-rose-500">*</span></label>
                    <input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="e.g. Character Certificate" className={boxClass} required />
                </div>

                <div>
                    <label className={labelClass}>Template Identifier / Key <span className="text-rose-500">*</span></label>
                    <input value={data.document_type} onChange={e => setData('document_type', e.target.value.replace(/\s/g, '_').toLowerCase())} placeholder="e.g. character_cert" className={boxClass} required />
                </div>

                <div className="sm:col-span-2">
                    <label className={labelClass}>Printed Document Title (Headline) <span className="text-rose-500">*</span></label>
                    <input value={data.title} onChange={e => setData('title', e.target.value)} placeholder="e.g. TO WHOM IT MAY CONCERN" className={boxClass} required />
                </div>

                <div className="sm:col-span-2">
                    <label className={labelClass}>Body Content Template <span className="text-rose-500">*</span></label>
                    <textarea rows="6" value={data.body_template} onChange={e => setData('body_template', e.target.value)} className={`${boxClass} resize-none font-mono text-[13px]`} required />
                    {errors.body_template && <small className="text-rose-600 mt-1 block">{errors.body_template}</small>}
                    <div className="mt-2 bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
                        <span className="text-xs font-bold text-indigo-800 mb-1 block">Available Placeholders:</span>
                        <div className="flex flex-wrap gap-2">
                           {['{{name}}', '{{id}}', '{{class}}', '{{designation}}', '{{date}}', '{{school_name}}', '{{purpose}}', '{{remarks}}'].map(p => (
                             <span key={p} className="bg-white px-2 py-0.5 rounded text-[10px] text-indigo-600 font-mono font-bold shadow-sm">{p}</span>
                           ))}
                        </div>
                    </div>
                </div>

                <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Left Signature Title</label>
                        <input value={data.signature_1} onChange={e => setData('signature_1', e.target.value)} placeholder="e.g. Class Teacher" className={boxClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Right Signature Title</label>
                        <input value={data.signature_2 || ''} onChange={e => setData('signature_2', e.target.value)} placeholder="e.g. Principal" className={boxClass} />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Print Orientation</label>
                    <select value={data.orientation} onChange={e => setData('orientation', e.target.value)} className={`${boxClass} bg-white`}>
                        <option value="portrait">Portrait (Vertical)</option>
                        <option value="landscape">Landscape (Horizontal)</option>
                    </select>
                </div>

                <div className="flex items-center justify-end h-full">
                    <label className="flex items-center gap-2 cursor-pointer mt-4">
                        <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-5 h-5" /> 
                        <span className="text-sm font-bold text-slate-700">Active Template</span>
                    </label>
                </div>

                <Actions close={close} processing={processing} label="Save Template" />
            </form>
        </Modal>
    );
}

function PrintPreview({ doc, site, close }) {
    const t = doc.template;
    if (!t) return null;
    const isLandscape = t.orientation === 'landscape';

    return (
        <div className="fixed inset-0 z-[100] flex justify-center bg-slate-900/80 p-4 animate-in fade-in duration-200 overflow-y-auto print:absolute print:inset-0 print:p-0 print:bg-white print:overflow-visible">
            
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { size: A4 ${t.orientation}; margin: 0; }
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: white !important; }
                    body * { visibility: hidden; }
                    #doc-print-area, #doc-print-area * { visibility: visible !important; }
                    #doc-print-area { 
                        position: fixed !important; left: 0 !important; top: 0 !important; 
                        width: ${isLandscape ? '297mm' : '210mm'} !important; 
                        height: ${isLandscape ? '210mm' : '297mm'} !important; 
                        margin: 0 !important; padding: 0 !important;
                        box-shadow: none !important; border: none !important;
                    }
                    .no-print { display: none !important; }
                }
            `}} />

            <div className="w-full flex flex-col items-center custom-scrollbar pb-10">
                {/* Actions (Screen Only) */}
                <div className="w-full max-w-[210mm] flex justify-end gap-3 mb-4 no-print sticky top-0 z-50 py-4 bg-slate-900/80 backdrop-blur">
                    <button onClick={close} className="rounded-xl border border-slate-600 bg-slate-800 text-white hover:bg-slate-700 px-6 py-2.5 text-sm font-bold shadow-sm transition-colors">Close</button>
                    <button onClick={() => window.print()} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-colors flex items-center gap-2"><Icon name="printer" className="w-4 h-4" /> Print Document</button>
                </div>

                {/* Print Target Area (A4 Simulation - Letterhead Style) */}
                <div id="doc-print-area" className={`bg-white shadow-2xl relative flex flex-col ${isLandscape ? 'w-[297mm] min-h-[210mm]' : 'w-[210mm] min-h-[297mm]'} print:shadow-none mx-auto box-border`}>
                    
                    {/* Top Decorative Border */}
                    <div className="h-4 w-full bg-slate-900 absolute top-0 left-0"></div>
                    
                    {/* Header */}
                    <div className="px-16 pt-16 pb-6 border-b-2 border-slate-200 text-center">
                        {site.logo && <img src={site.logo} className="mx-auto mb-3 h-20 object-contain" />}
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-widest">{site.school_name || 'YOUR SCHOOL NAME'}</h1>
                        <p className="text-sm text-slate-500 mt-2 font-medium tracking-wide">
                            {site.address || '123 School Avenue, Dhaka'} {site.primary_phone && ` | Ph: ${site.primary_phone}`}
                        </p>
                    </div>

                    {/* Meta Data */}
                    <div className="px-16 py-6 flex justify-between text-sm font-medium text-slate-600">
                        <span className="font-mono">Ref No: <b>{doc.document_no}</b></span>
                        <span className="font-mono">Date: <b>{new Date(doc.issue_date).toLocaleDateString('en-GB')}</b></span>
                    </div>

                    {/* Title */}
                    <div className="px-16 pt-6 pb-10 text-center">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 inline-block pb-1">{t.title}</h2>
                    </div>

                    {/* Body Content */}
                    <div className="px-16 flex-1 text-justify">
                        <p className="whitespace-pre-line text-slate-800 leading-[2.5rem] text-lg font-serif">
                            {doc.rendered_body}
                        </p>
                        
                        {t.instructions && (
                            <div className="mt-12 pt-4 border-t border-dashed border-slate-300">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Remarks / Note:</span>
                                <p className="text-sm text-slate-600 font-medium italic">{t.instructions}</p>
                            </div>
                        )}
                    </div>

                    {/* Signatures */}
                    <div className="px-16 pb-16 pt-24 flex justify-between items-end mt-auto">
                        <div className="w-48 text-center border-t border-slate-500 pt-2">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t.signature_1 || 'Signature 1'}</span>
                        </div>
                        {t.signature_2 && (
                            <div className="w-48 text-center border-t border-slate-500 pt-2">
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t.signature_2}</span>
                            </div>
                        )}
                    </div>

                    {/* Bottom Decorative Border */}
                    <div className="h-4 w-full bg-slate-900 absolute bottom-0 left-0"></div>
                </div>
            </div>
        </div>
    );
}

export default function Index({ documents, templates, students, staffList, siteSettings, filters }) {
    const [issueOpen, setIssueOpen] = useState(false);
    const [templateOpen, setTemplateOpen] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(null);

    return (
        <AuthenticatedLayout>
            <Head title="Official Document Studio" />
            
            <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
                
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Documents & Certificates</span>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Official Document Studio</h1>
                        <p className="text-sm text-slate-500 mt-1">Dynamic student/staff documents, placeholders, A4 preview and printing.</p>
                    </div>
                    <div className="flex w-full lg:w-auto gap-3">
                        <button onClick={() => setTemplateOpen({})} className="flex-1 lg:flex-none rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center gap-2">
                            <Icon name="file-plus" className="w-4 h-4" /> New Template
                        </button>
                        <button onClick={() => setIssueOpen(true)} className="flex-1 lg:flex-none rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all flex items-center justify-center gap-2">
                            <Icon name="check-circle" className="w-4 h-4" /> Issue Document
                        </button>
                    </div>
                </div>

                {/* Templates Quick Launch Bar */}
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {templates.map(t => (
                        <button key={t.id} onClick={() => setTemplateOpen(t)} className="min-w-48 bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-indigo-400 hover:shadow-md transition-all group shrink-0">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Icon name="file-text" className="w-4 h-4" />
                            </div>
                            <b className="block text-sm text-slate-900 mb-1">{t.name}</b>
                            {/* 🟢 FIX: Safe text replace */}
                            <small className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                {(t.document_type || '').replace(/_/g, ' ')}
                            </small>
                        </button>
                    ))}
                    {templates.length === 0 && <p className="text-sm text-slate-400 py-4 italic">No templates created yet.</p>}
                </div>

                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input 
                          defaultValue={filters.search || ''} 
                          onKeyDown={e => e.key === 'Enter' && router.get(route('admin.documents.official.index'), { search: e.currentTarget.value })} 
                          placeholder="Search document no or recipient..." 
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/50">
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Document No</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Recipient</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Template Type</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Issue Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {documents.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100"><Icon name="file" className="w-8 h-8 text-slate-300" /></div>
                                            <p className="text-sm font-semibold text-slate-600">No official documents issued yet.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    documents.data.map(d => (
                                        <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-sm text-indigo-700">{d.document_no}</td>
                                            <td className="px-6 py-4">
                                                <strong className="text-sm font-bold text-slate-900 block">{d.recipient_name}</strong>
                                                <small className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">{d.recipient_type}</small>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-700">{d.template?.name || 'Deleted Template'}</td>
                                            <td className="px-6 py-4 text-sm font-mono text-slate-600">{new Date(d.issue_date).toLocaleDateString('en-GB')}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => setPreviewOpen(d)} className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5"><Icon name="printer" className="w-3.5 h-3.5" /> View & Print</button>
                                                    <button onClick={() => confirm('Are you sure you want to delete this document?') && router.delete(route('admin.documents.official.destroy', d.id))} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Icon name="trash" className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl"><Pagination meta={documents} /></div>
                </div>
            </div>

            {issueOpen && <Issue templates={templates} students={students} staff={staffList} close={() => setIssueOpen(false)} />}
            {templateOpen && <TemplateForm item={templateOpen.id ? templateOpen : null} close={() => setTemplateOpen(null)} />}
            {previewOpen && <PrintPreview doc={previewOpen} site={siteSettings} close={() => setPreviewOpen(null)} />}
        </AuthenticatedLayout>
    );
}