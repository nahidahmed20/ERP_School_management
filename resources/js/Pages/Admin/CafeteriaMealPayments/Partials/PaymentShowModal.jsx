import React from 'react';
import Icon from '@/Components/Icons';

export default function PaymentShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-white print:backdrop-blur-none" onClick={onClose}>
      
      {/* 🟢 Print CSS for Thermal POS Style */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #pos-receipt, #pos-receipt * { visibility: visible; }
          #pos-receipt { 
            position: absolute; left: 0; top: 0; 
            width: 80mm; /* Standard POS printer width */
            padding: 10mm;
            border: none; box-shadow: none; border-radius: 0;
            color: #000; font-family: monospace;
          }
          .no-print { display: none !important; }
        }
      `}} />

      <div
        id="pos-receipt"
        className="w-full max-w-sm bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:max-h-max print:overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-50 px-5 py-4 border-b flex items-center justify-between shrink-0 no-print">
          <h3 className="font-bold text-slate-800">Print Receipt</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><Icon name="close" className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar print:overflow-visible print:p-0">
          
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wider">SMART SCHOOL</h2>
            <p className="text-xs text-slate-500">Cafeteria Top-up Service</p>
            <p className="text-xs text-slate-500 font-mono">Date: {new Date(item.created_at).toLocaleString()}</p>
            <div className="border-b-2 border-dashed border-slate-300 my-4 w-full"></div>
          </div>

          <div className="text-center mb-4">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-600">Wallet Recharge</p>
            <h1 className="text-4xl font-black text-slate-900 font-mono mt-1">৳ {Number(item.amount).toFixed(2)}</h1>
            <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-bold uppercase rounded border">Successful</span>
          </div>

          <div className="border-b-2 border-dashed border-slate-300 w-full mb-4"></div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">User:</span>
              <strong className="text-slate-900 text-right">{item.wallet?.user?.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Method:</span>
              <strong className="text-slate-900 uppercase">{item.payment_method}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Txn ID:</span>
              <strong className="text-slate-900 font-mono text-xs">{item.reference_no || `TRX-${item.id}`}</strong>
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-bold">New Balance:</span>
              <strong className="text-slate-900 font-mono font-bold">৳ {Number(item.balance_after).toFixed(2)}</strong>
            </div>
          </div>

          <div className="border-b-2 border-dashed border-slate-300 w-full mt-4 mb-4"></div>

          {/* Barcode Placeholder & Footer */}
          <div className="text-center space-y-3">
            {/* Fake Barcode using text styling */}
            <div className="font-barcode text-4xl tracking-tighter text-slate-800 opacity-80" style={{ fontFamily: "'Libre Barcode 39', cursive, monospace" }}>
              ||||| ||| || |||| ||||
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">{item.reference_no || `TRX-${item.id}`}</p>
            <p className="text-[10px] text-slate-400">Thank you for using our service!<br/>Powered by Smart ERP</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t bg-slate-50 flex gap-3 no-print">
          <button type="button" className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl" onClick={onClose}>Close</button>
          <button type="button" onClick={() => window.print()} className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 shadow-md transition-colors">
            <Icon name="printer" className="w-4 h-4" /> Print POS
          </button>
        </div>
      </div>
    </div>
  );
}