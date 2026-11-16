import React from 'react';
import Icon from '@/Components/Icons';

export default function ItemShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div 
        className="mm-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ padding: 0, overflow: 'hidden', maxWidth: '600px', width: '100%' }}
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Item Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Full specification and stock overview.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          <div className="flex flex-col sm:flex-row gap-5 border-b border-slate-100 pb-5">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
              <Icon name="box" className="w-8 h-8 text-slate-400" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
              <div className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-2">
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 font-mono text-xs">Code: {item.item_code}</span>
                <span>•</span>
                <span>{item.category}</span>
              </div>
            </div>

            <div className="text-left sm:text-right mt-2 sm:mt-0">
              <span className={`inline-flex px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border mt-1 ${
                item.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                {item.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <span className="block font-bold text-emerald-600/70 uppercase text-xs mb-1">Current Stock</span>
              <div className="flex items-end gap-1.5">
                <span className={`font-black text-2xl font-mono ${item.quantity <= 5 ? 'text-rose-600' : 'text-emerald-700'}`}>{item.quantity}</span>
                <span className="font-bold text-emerald-600 mb-1">{item.unit}</span>
              </div>
              {item.quantity <= 5 && <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wide mt-1 block">Low Stock Warning</span>}
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col justify-center">
              <span className="block font-bold text-amber-600/70 uppercase text-xs mb-1">Selling Price</span>
              <span className="font-black text-xl text-amber-700 font-mono">৳ {item.selling_price}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="block font-bold text-slate-400 uppercase text-xs mb-3">Available Variants</span>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="text-xs font-semibold text-slate-500 w-12 pt-1">Sizes:</span>
                <div className="flex flex-wrap gap-1.5">
                  {item.size && item.size.length > 0 ? item.size.map(s => (
                    <span key={s} className="bg-white border border-slate-200 px-2.5 py-1 rounded text-xs font-bold text-slate-700">{s}</span>
                  )) : <span className="text-sm font-medium text-slate-400 italic">N/A</span>}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xs font-semibold text-slate-500 w-12 pt-1">Colors:</span>
                <div className="flex flex-wrap gap-1.5">
                  {item.color && item.color.length > 0 ? item.color.map(c => (
                    <span key={c} className="bg-white border border-slate-200 px-2.5 py-1 rounded text-xs font-bold text-slate-700">{c}</span>
                  )) : <span className="text-sm font-medium text-slate-400 italic">N/A</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Purchase Price (Cost)</span>
              <span className="font-semibold text-slate-800 font-mono">৳ {item.purchase_price || '0.00'}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Campus</span>
              <span className="font-medium text-slate-800">{item.campus?.name || 'All Campuses'}</span>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Description</span>
            <div className="text-sm text-slate-700 bg-slate-50/50 border border-slate-200 p-4 rounded-xl min-h-[60px] whitespace-pre-wrap leading-relaxed">
              {item.description || <span className="text-slate-400 italic">No description provided.</span>}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end rounded-b-2xl">
          <button type="button" className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}