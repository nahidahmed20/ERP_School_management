import React from 'react';
import Icon from '@/Components/Icons';

export default function AllocationShowModal({ item, onClose }) {
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
            <h3 className="text-xl font-bold text-slate-900">Room Allocation Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Occupant and room assignment breakdown.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">

          <div className="flex items-center gap-5 border-b border-slate-100 pb-5">
            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm text-indigo-600">
              <Icon name="user" className="w-7 h-7" />
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900">{item.user?.name}</h3>
              <div className="text-sm font-medium text-slate-500 mt-0.5 font-mono">
                {item.user?.email || 'N/A'}
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-flex px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border mt-1 ${
                item.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                {item.is_active ? 'Active' : 'Vacated'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Hostel Assigned</span>
              <span className="font-bold text-slate-800 text-base">{item.room?.hostel_name}</span>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <span className="block font-bold text-emerald-600/70 uppercase text-xs mb-1">Monthly Fee</span>
              <span className="font-black text-emerald-700 font-mono text-lg">৳ {item.monthly_fee}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Room Number</span>
              <span className="font-bold text-slate-800 font-mono">Room {item.room?.room_number}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Room Type</span>
              <span className="font-semibold text-slate-800">{item.room?.room_type}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Allocation Date</span>
            <span className="font-semibold text-slate-800 font-mono">{item.allocation_date}</span>
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
