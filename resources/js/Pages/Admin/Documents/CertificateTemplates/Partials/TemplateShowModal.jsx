import React from 'react';
import Icon from '@/Components/Icons';

const SigImg = ({ src, height = 26 }) =>
  src ? <img src={src} alt="signature" style={{ height, objectFit: 'contain' }} className="mx-auto" /> : <div style={{ height }} className="border-b border-dashed border-slate-300 w-full mb-1" />;

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

export default function TemplateShowModal({ item, onClose, schoolName = "Your School Name" }) {
  if (!item) return null;

  const bgPreview = item.background_image ? `/storage/${item.background_image}` : null;
  const sig1Preview = item.signature_1_image ? `/storage/${item.signature_1_image}` : null;
  const sig2Preview = item.signature_2_image ? `/storage/${item.signature_2_image}` : null;
  const customBg = bgPreview ? { backgroundImage: `url(${bgPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};
  const style = item.design_style ?? 'classic_gold';

  const renderCertificateContent = () => {
    if (style === 'classic_gold') {
      return (
        <div className="w-full h-full aspect-[1.414/1] bg-[#faf9f6] relative p-8 flex flex-col justify-between text-center overflow-hidden border border-slate-200" style={customBg}>
          <div className="absolute inset-4 border-[4px] border-double border-amber-700/80 pointer-events-none"></div>
          <div className="absolute inset-7 border border-amber-600/30 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col justify-between h-full pt-6">
            <div>
              <p className="text-[12px] font-bold text-amber-800 uppercase tracking-[0.3em] mb-2">{schoolName}</p>
              <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-wider uppercase mb-2" style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.8)' }}>
                {item.title || 'CERTIFICATE'}
              </h1>
              <div className="w-32 h-0.5 bg-amber-600 mx-auto my-3 rounded-full"></div>
            </div>

            <div className="my-auto px-16">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-semibold">This is proudly presented to</p>
              <h2 className="text-4xl font-serif italic text-amber-900 my-4 border-b border-amber-900/30 pb-2 inline-block min-w-[350px]">Student Name Here</h2>
              <p className="text-xs text-slate-700 leading-relaxed mt-4 font-medium px-8">
                {item.content_body || 'Description text goes here...'}
              </p>
            </div>

            <div className="flex justify-between items-end px-16 pb-4 relative z-10">
              <div className="w-40 text-center">
                <SigImg src={sig1Preview} height={40} />
                <div className="w-full h-px bg-slate-400 mt-2"></div>
                <p className="text-[10px] text-slate-600 uppercase font-bold mt-1.5 tracking-wider">{item.signature_1_title || 'Signature 1'}</p>
              </div>

              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-[3px] border-white shadow-lg flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-full border border-amber-200 border-dashed flex items-center justify-center text-[9px] text-white font-bold uppercase text-center leading-tight">Seal<br/>Here</div>
              </div>

              <div className="w-40 text-center">
                <SigImg src={sig2Preview} height={40} />
                <div className="w-full h-px bg-slate-400 mt-2"></div>
                <p className="text-[10px] text-slate-600 uppercase font-bold mt-1.5 tracking-wider">{item.signature_2_title || 'Signature 2'}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (style === 'modern_blue') {
      return (
        <div className="w-full h-full aspect-[1.414/1] bg-white relative overflow-hidden flex flex-col justify-between text-left" style={customBg}>
          <div className="absolute top-0 left-0 w-1/2 h-full bg-blue-50/50 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 60% 100%, 0% 100%)' }}></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600 rounded-bl-full pointer-events-none opacity-90"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-500 rounded-tr-full pointer-events-none opacity-90"></div>

          <div className="relative z-10 flex flex-col justify-between h-full p-12">
            <div>
              <div className="w-16 h-16 bg-blue-600 rounded-2xl mb-6 flex items-center justify-center text-white shadow-lg"><Icon name="award" className="w-8 h-8" /></div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">{item.title || 'CERTIFICATE'}</h1>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{schoolName}</p>
            </div>

            <div className="my-auto pl-6 border-l-4 border-slate-200">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Presented To</p>
              <h2 className="text-4xl font-bold text-slate-800 mb-4">Student Name Here</h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
                {item.content_body || 'Description text goes here...'}
              </p>
            </div>

            <div className="flex justify-start gap-20 items-end">
              <div className="w-40">
                <SigImg src={sig1Preview} height={40} />
                <div className="w-full h-0.5 bg-slate-300 mt-2"></div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1.5">{item.signature_1_title || 'Signature 1'}</p>
              </div>
              <div className="w-40">
                <SigImg src={sig2Preview} height={40} />
                <div className="w-full h-0.5 bg-slate-300 mt-2"></div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1.5">{item.signature_2_title || 'Signature 2'}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (style === 'emerald_honor') {
        return (
          <div className="w-full h-full aspect-[1.414/1] bg-slate-50 relative overflow-hidden flex flex-col justify-between text-center border-[12px] border-emerald-900" style={customBg}>
            <div className="absolute inset-2 border-[2px] border-amber-500 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col justify-between h-full p-12">
              <div className="mt-4">
                <p className="text-xs font-black text-emerald-800 uppercase tracking-[0.4em] mb-2">{schoolName}</p>
                <h1 className="text-5xl font-serif font-bold text-amber-600 uppercase tracking-widest">{item.title || 'HONOR'}</h1>
              </div>

              <div className="my-auto px-20">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Presented Proudly To</p>
                <h2 className="text-4xl font-serif text-emerald-950 border-b border-emerald-900/20 pb-2 mb-4">Student Name Here</h2>
                <p className="text-sm text-slate-600 font-medium leading-relaxed px-4">
                  {item.content_body || 'Description text goes here...'}
                </p>
              </div>

              <div className="flex justify-between items-end px-10 relative z-10">
                <div className="w-40 text-center border-t border-slate-400 pt-2">
                  <div className="-mt-12"><SigImg src={sig1Preview} height={40} /></div>
                  <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">{item.signature_1_title}</p>
                </div>
                <div className="w-16 h-16 bg-amber-500 rounded-sm rotate-45 border-[3px] border-emerald-900 flex items-center justify-center shadow-inner">
                   <div className="-rotate-45 text-[8px] text-white font-bold uppercase text-center leading-tight">Honor<br/>Award</div>
                </div>
                <div className="w-40 text-center border-t border-slate-400 pt-2">
                  <div className="-mt-12"><SigImg src={sig2Preview} height={40} /></div>
                  <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">{item.signature_2_title}</p>
                </div>
              </div>
            </div>
          </div>
        );
      }

    return (
      <div className="w-full h-full aspect-[1.414/1] bg-white relative flex flex-col justify-between overflow-hidden" style={customBg}>
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-rose-500 to-orange-500 rounded-b-[50%] scale-110 -translate-y-6"></div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-r from-orange-500 to-rose-500 rounded-t-[50%] scale-110 translate-y-6 opacity-30"></div>

        <div className="relative z-10 flex flex-col justify-between h-full p-12 text-center pt-20">
          <div>
            <h1 className="text-4xl font-black text-rose-600 uppercase tracking-widest mb-2">{item.title || 'CERTIFICATE'}</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{schoolName}</p>
          </div>

          <div className="my-auto px-16">
            <h2 className="text-3xl font-bold text-slate-800 bg-slate-100 py-2 px-8 rounded-full inline-block mb-4">Student Name Here</h2>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {item.content_body || 'Description text goes here...'}
            </p>
          </div>

          <div className="flex justify-center gap-24 items-end mb-6 relative z-10">
            <div className="w-40 text-center">
              <SigImg src={sig1Preview} height={40} />
              <div className="w-full h-[1.5px] bg-slate-300 my-1.5"></div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{item.signature_1_title}</p>
            </div>
            <div className="w-40 text-center">
              <SigImg src={sig2Preview} height={40} />
              <div className="w-full h-[1.5px] bg-slate-300 my-1.5"></div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{item.signature_2_title}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 print:bg-white print:p-0" onClick={onClose}>

      {/* 🟢 BULLETPROOF PRINT CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: white !important; }

          /* Hide EVERYTHING in the background */
          body * { visibility: hidden; }

          /* Force the certificate to be visible and cover the A4 page perfectly */
          #certificate-print-area, #certificate-print-area * { visibility: visible !important; }
          #certificate-print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 999999 !important;
            transform: none !important;
            background-color: white !important;
          }

          /* Hide the modal wrapper styles that break print layouts */
          .modal-wrapper { transform: none !important; overflow: visible !important; }
          .no-print { display: none !important; }
        }
      `}} />

      <div
        className="modal-wrapper w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 print:shadow-none print:rounded-none print:border-none print:max-h-max"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 no-print">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Certificate Preview</h3>
            <p className="text-sm text-slate-500 mt-0.5">{item.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 bg-slate-200 overflow-y-auto flex-1 flex justify-center items-center custom-scrollbar print:p-0 print:bg-white print:overflow-visible">
          {/* 🟢 PRINT TARGET AREA */}
          <div id="certificate-print-area" className="w-full max-w-3xl bg-white shadow-2xl rounded-sm overflow-hidden print:shadow-none print:rounded-none">
            {renderCertificateContent()}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 no-print">
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
