import React from 'react';
import Icon from '@/Components/Icons';

const SigImg = ({ src, height = 26 }) =>
  src ? <img src={src} alt="signature" style={{ height, objectFit: 'contain' }} /> : <div style={{ height }} />;

const FiligreeHeader = () => (
  <svg width="110" height="18" viewBox="0 0 200 30" fill="none" className="mx-auto my-0.5">
    <path d="M100 20 C80 20, 70 5, 40 10 C20 15, 10 5, 0 15 C20 15, 35 25, 60 15 C80 5, 90 15, 100 20 Z" fill="#3f3f46" />
    <path d="M100 20 C120 20, 130 5, 160 10 C180 15, 190 5, 200 15 C180 15, 165 25, 140 15 C120 5, 110 15, 100 20 Z" fill="#3f3f46" />
    <circle cx="100" cy="10" r="3.5" fill="#3f3f46" />
  </svg>
);

const CornerFiligree = ({ className }) => (
  <svg width="45" height="45" viewBox="0 0 100 100" fill="#b45309" className={className}>
    <path d="M0,0 L40,0 C35,15 25,25 0,40 Z M10,0 C10,20 20,30 0,30" />
    <path d="M5,5 C25,5 35,15 35,35 C25,25 15,25 5,5 Z" opacity="0.6" />
    <circle cx="18" cy="18" r="2.5" />
  </svg>
);

export default function CertificatePrintModal({ item, onClose }) {
  if (!item) return null;

  const template = item.template || {};
  const bgPreview = template.background_image ? `/storage/${template.background_image}` : null;
  const sig1Preview = template.signature_1_image ? `/storage/${template.signature_1_image}` : null;
  const sig2Preview = template.signature_2_image ? `/storage/${template.signature_2_image}` : null;
  const customBg = bgPreview ? { backgroundImage: `url(${bgPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};
  const style = template.design_style ?? 'orange_bevel';

  const renderCertificateContent = () => {
    if (style === 'orange_bevel') {
      return (
        <div className="w-full aspect-[1.414/1] bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-4 relative overflow-hidden flex flex-col justify-between shadow-md" style={customBg}>
          <div className="w-full h-full bg-white relative p-5 flex flex-col justify-between text-center" style={{ clipPath: 'polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px)' }}>
            <div className="absolute inset-2 border-[1px] border-zinc-400 pointer-events-none" style={{ clipPath: 'polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)' }} />
            <div className="absolute top-2 left-2 z-10 flex flex-col items-center pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-300 to-amber-200 border border-amber-700 shadow-sm flex items-center justify-center font-bold text-[7px] text-zinc-900 uppercase">Gold</div>
              <div className="w-5 h-5 bg-amber-500 -mt-1.5 rotate-45 border-b border-r border-amber-700"></div>
            </div>
            <div className="relative z-10 pt-1">
              <FiligreeHeader />
              <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest mt-0.5">Certificate ID: {item.certificate_no}</p>
              <h1 className="text-2xl font-black text-zinc-900 tracking-wider font-serif uppercase mt-0.5">{template.title}</h1>
              <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Of Achievement</p>
            </div>
            <div className="my-auto relative z-10">
              <p className="text-[8px] font-bold text-zinc-600 tracking-widest uppercase mb-1">This Certificate is Proudly Presented To</p>
              <h2 className="text-2xl font-serif italic text-indigo-600 border-b border-zinc-400 pb-0.5 px-6 inline-block min-w-[200px]">{item.student?.name}</h2>
              <div dangerouslySetInnerHTML={{ __html: item.rendered_content }} className="text-[8px] text-zinc-600 max-w-md mx-auto leading-relaxed mt-2 px-4" />
            </div>
            <div className="relative z-10 pb-0.5">
              <div className="flex justify-between items-end px-10 mb-1">
                <div className="w-28 text-center border-b border-zinc-400 pb-0.5">
                  <span className="text-[8px] text-zinc-600 font-medium">{new Date(item.issue_date).toLocaleDateString()}</span>
                  <p className="text-[8px] text-zinc-500 mt-0.5">{template.signature_1_title || 'Date'}</p>
                </div>
                <div className="w-28 text-center border-b border-zinc-400 pb-0.5">
                  <SigImg src={sig1Preview} />
                  <p className="text-[8px] text-zinc-600 font-medium mt-0.5">{template.signature_2_title || 'Manager'}</p>
                </div>
              </div>
              <FiligreeHeader />
            </div>
          </div>
        </div>
      );
    }

    // ডিফল্ট fallback প্রিন্ট লেআউট
    return (
      <div className="w-full aspect-[1.414/1] bg-white relative p-6 flex flex-col justify-between items-center text-center font-serif border-[12px] border-slate-800" style={customBg}>
        <div className="w-full">
          <h4 className="text-slate-500 uppercase tracking-[4px] m-0 text-[12px] font-semibold">Certificate ID: {item.certificate_no}</h4>
          <h1 className="text-slate-900 mt-3 font-bold text-3xl leading-tight">{template.title}</h1>
        </div>
        <div className="w-full max-w-[80%] mx-auto text-slate-700 leading-relaxed">
          <p className="m-0 mb-3 italic">This is proudly presented to</p>
          <h2 className="text-indigo-600 border-b-2 border-slate-300 inline-block pb-1 mb-4 font-bold text-2xl px-8">{item.student?.name}</h2>
          <div dangerouslySetInnerHTML={{ __html: item.rendered_content }} className="mx-auto text-sm" />
        </div>
        <div className="flex justify-between items-end w-full px-8">
          <div className="border-t border-slate-400 w-36 pt-2 text-slate-600 text-xs">Issued: {new Date(item.issue_date).toLocaleDateString()}</div>
          <div className="border-t border-slate-400 w-36 pt-2 text-slate-600 text-xs">
            <SigImg src={sig1Preview} />
            {template.signature_1_title || 'Authorized Signature'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Certificate Print Preview</h3>
            <p className="text-sm font-mono font-semibold text-indigo-600 mt-0.5">ID: {item.certificate_no}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-6 bg-slate-200/50 overflow-y-auto flex-1 flex justify-center items-center custom-scrollbar">
          <div className="w-full max-w-3xl bg-white shadow-xl rounded-lg overflow-hidden">
            {renderCertificateContent()}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 rounded-b-2xl shrink-0">
          <button type="button" className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm active:scale-95" onClick={onClose}>
            Close
          </button>
          <button type="button" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95" onClick={() => window.print()}>
            <Icon name="printer" className="w-4 h-4" /> Print Certificate
          </button>
        </div>
      </div>
    </div>
  );
}