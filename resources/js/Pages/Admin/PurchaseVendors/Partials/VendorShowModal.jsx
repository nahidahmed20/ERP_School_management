import React from 'react';
import Icon from '@/Components/Icons';

export default function VendorShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>

      {/* Responsive Modal Box */}
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Vendor Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Contact and company information.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">

          <div className="flex items-center gap-5 border-b border-slate-100 pb-5">
            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm text-indigo-600">
              <Icon name="briefcase" className="w-7 h-7" />
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
              <div className="text-sm font-medium text-slate-500 mt-1">
                Contact: <span className="font-semibold text-slate-700">{item.contact_person || 'N/A'}</span>
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-flex px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border mt-1 ${
                item.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                {item.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Phone Number</span>
              <span className="font-bold text-slate-800 font-mono text-base">{item.phone}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 overflow-hidden">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Email Address</span>
              <span className="font-medium text-slate-800 truncate block" title={item.email || ''}>{item.email || 'N/A'}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="block font-bold text-slate-400 uppercase text-xs mb-1">TIN / BIN Number</span>
            <span className="font-mono font-semibold text-slate-800">{item.tax_id || 'N/A'}</span>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Company Address</span>
            <div className="text-sm text-slate-700 bg-slate-50/50 border border-slate-200 p-4 rounded-xl min-h-[60px] whitespace-pre-wrap leading-relaxed">
              {item.address || <span className="text-slate-400 italic">Address not provided.</span>}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end rounded-b-2xl shrink-0">
          <button type="button" className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
