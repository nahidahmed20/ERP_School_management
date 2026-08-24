import React, { useState } from 'react';
import Icon from '@/Components/Icons';
import IdCardPreview from './IdCardPreview'; 

export default function IdCardShowModal({ item, onClose }) {
  const [previewSide, setPreviewSide] = useState('front');
  if (!item) return null;

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      
      {/* Responsive Modal Box */}
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">ID Card Preview</h3>
            <p className="text-sm font-semibold text-indigo-600 mt-0.5">{item.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 bg-slate-200/50 overflow-y-auto flex-1 flex flex-col items-center custom-scrollbar">
          
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4 shadow-sm border border-slate-200 w-fit">
            <button type="button" className={`px-5 py-1.5 text-xs font-bold rounded-lg transition-all ${previewSide === 'front' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setPreviewSide('front')}>Front</button>
            <button type="button" className={`px-5 py-1.5 text-xs font-bold rounded-lg transition-all ${previewSide === 'back' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setPreviewSide('back')}>Back</button>
          </div>

          <div className="shadow-2xl rounded-xl overflow-hidden ring-1 ring-slate-900/5 bg-white">
            <IdCardPreview
              side={previewSide}
              templateKey={item.design_template}
              layoutType={item.layout_type}
              themeColor={item.theme_color}
              textAlign={item.text_align}
              photoAlign={item.photo_align}
              fieldLabels={item.field_labels}
              showBloodGroup={item.show_blood_group}
              showPhone={item.show_phone}
              showAddress={item.show_address}
              backContent={item.back_side_content}
              logoPreview={item.logo_image ? `/storage/${item.logo_image}` : null}
              sigPreview={item.signature_image ? `/storage/${item.signature_image}` : null}
              bgPreview={item.background_image ? `/storage/${item.background_image}` : null}
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-end rounded-b-2xl shrink-0">
          <button type="button" className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm active:scale-95" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}