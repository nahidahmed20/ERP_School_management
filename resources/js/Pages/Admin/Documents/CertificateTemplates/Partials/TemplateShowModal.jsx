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

export default function TemplateShowModal({ item, onClose }) {
  if (!item) return null;

  const bgPreview = item.background_image ? `/storage/${item.background_image}` : null;
  const sig1Preview = item.signature_1_image ? `/storage/${item.signature_1_image}` : null;
  const sig2Preview = item.signature_2_image ? `/storage/${item.signature_2_image}` : null;
  const customBg = bgPreview ? { backgroundImage: `url(${bgPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};
  const style = item.design_style ?? 'orange_bevel';

  // ডাইনামিক ডিজাইন রেন্ডারিং
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
              <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest mt-0.5">Institute Name Here</p>
              <h1 className="text-2xl font-black text-zinc-900 tracking-wider font-serif uppercase mt-0.5">{item.title}</h1>
              <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Of Achievement</p>
            </div>
            <div className="my-auto relative z-10">
              <p className="text-[8px] font-bold text-zinc-600 tracking-widest uppercase mb-1">This Certificate is Proudly Presented To</p>
              <div className="text-2xl font-serif italic text-zinc-900 border-b border-zinc-400 pb-0.5 px-6 inline-block min-w-[200px]">Name Here</div>
              <div dangerouslySetInnerHTML={{ __html: item.content_body }} className="text-[8px] text-zinc-600 max-w-md mx-auto leading-relaxed mt-2 px-4" />
            </div>
            <div className="relative z-10 pb-0.5">
              <div className="flex justify-between items-end px-10 mb-1">
                <div className="w-28 text-center border-b border-zinc-400 pb-0.5">
                  <SigImg src={sig1Preview} />
                  <p className="text-[8px] text-zinc-600 font-medium mt-0.5">{item.signature_1_title}</p>
                </div>
                <div className="w-28 text-center border-b border-zinc-400 pb-0.5">
                  <SigImg src={sig2Preview} />
                  <p className="text-[8px] text-zinc-600 font-medium mt-0.5">{item.signature_2_title}</p>
                </div>
              </div>
              <FiligreeHeader />
            </div>
          </div>
        </div>
      );
    }

    if (style === 'green_gold') {
      return (
        <div className="w-full aspect-[1.414/1] bg-white relative overflow-hidden p-5 flex flex-col justify-between text-center" style={customBg}>
          <div className="absolute -bottom-8 -left-8 w-40 h-64 bg-emerald-900 rounded-full mix-blend-multiply opacity-90 transform rotate-45 pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-2 w-36 h-64 bg-amber-500 rounded-full transform rotate-45 pointer-events-none"></div>
          <div className="absolute -bottom-8 -right-8 w-40 h-64 bg-emerald-900 rounded-full mix-blend-multiply opacity-90 transform -rotate-45 pointer-events-none"></div>
          <div className="absolute -bottom-10 -right-2 w-36 h-64 bg-amber-500 rounded-full transform -rotate-45 pointer-events-none"></div>
          <div className="absolute inset-3 border border-amber-500/60 pointer-events-none"></div>
          <div className="absolute inset-4 border-[1.5px] border-emerald-900/80 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col justify-between h-full py-1">
            <div>
              <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest mt-1">Company Name</p>
              <h1 className="text-2xl font-black text-emerald-900 tracking-wider uppercase font-sans">{item.title}</h1>
              <p className="text-[10px] font-extrabold text-zinc-800 tracking-widest uppercase">Of Achievement</p>
            </div>
            <div className="my-auto">
              <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-white text-[8px] font-bold tracking-widest uppercase py-0.5 px-5 inline-block rounded-xs shadow-xs mb-1.5">The Certificate Proudly Presented To</div>
              <h2 className="text-2xl font-serif italic text-emerald-950 my-0.5">Itsname Surname</h2>
              <div className="w-1/2 h-[1px] bg-zinc-300 mx-auto my-1.5"></div>
              <div dangerouslySetInnerHTML={{ __html: item.content_body }} className="text-[8px] text-zinc-600 italic max-w-sm mx-auto leading-relaxed px-2" />
            </div>
            <div className="flex justify-between items-end px-12 relative z-10">
              <div className="w-24 text-center border-b border-zinc-700 pb-0.5">
                <SigImg src={sig1Preview} />
                <p className="text-[8px] font-bold text-zinc-800 uppercase mt-0.5">{item.signature_1_title}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-amber-500 border-2 border-amber-300 shadow flex items-center justify-center -mb-1">
                <Icon name="star" className="w-4 h-4 fill-white text-white" />
              </div>
              <div className="w-24 text-center border-b border-zinc-700 pb-0.5">
                <SigImg src={sig2Preview} />
                <p className="text-[8px] font-bold text-zinc-800 uppercase mt-0.5">{item.signature_2_title}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (style === 'classic_gold') {
      return (
        <div className="w-full aspect-[1.414/1] bg-[#fdfbf7] relative p-5 flex flex-col justify-between text-center overflow-hidden" style={customBg}>
          <div className="absolute inset-3 border-[1px] border-amber-600/70 pointer-events-none"></div>
          <div className="absolute inset-4 border-[0.5px] border-amber-600/40 pointer-events-none"></div>
          <CornerFiligree className="absolute top-3 left-3" />
          <CornerFiligree className="absolute top-3 right-3 transform scale-x-[-1]" />
          <CornerFiligree className="absolute bottom-3 left-3 transform scale-y-[-1]" />
          <CornerFiligree className="absolute bottom-3 right-3 transform scale-x-[-1] scale-y-[-1]" />
          <div className="relative z-10 flex flex-col justify-between h-full py-2">
            <div>
              <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-widest uppercase">{item.title}</h1>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mt-0.5">of achievement</p>
              <div className="flex items-center justify-center gap-2 my-1">
                <div className="w-10 h-[1px] bg-amber-600"></div>
                <div className="w-1 h-1 rotate-45 bg-amber-600"></div>
                <div className="w-10 h-[1px] bg-amber-600"></div>
              </div>
            </div>
            <div className="my-auto">
              <p className="text-[9px] text-zinc-700 font-serif mb-0.5">This certificate is proudly presented to</p>
              <h2 className="text-2xl font-serif italic text-amber-800 my-0.5">Michael Sprague</h2>
              <div dangerouslySetInnerHTML={{ __html: item.content_body }} className="text-[8px] text-zinc-600 max-w-xs mx-auto leading-relaxed my-1.5 px-4" />
            </div>
            <div className="flex justify-between items-end px-10">
              <div className="flex items-center gap-1">
                <div className="w-9 h-9 rounded-full bg-amber-600 border border-amber-300 shadow flex items-center justify-center text-[6px] font-bold text-white uppercase text-center leading-tight">Best<br />Award</div>
              </div>
              <div className="flex gap-8">
                <div className="w-20 text-center border-b border-zinc-400 pb-0.5">
                  <SigImg src={sig1Preview} />
                  <p className="text-[7px] text-zinc-600 mt-0.5">{item.signature_1_title}</p>
                </div>
                <div className="w-20 text-center border-b border-zinc-400 pb-0.5">
                  <SigImg src={sig2Preview} />
                  <p className="text-[7px] text-zinc-600 mt-0.5">{item.signature_2_title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (style === 'academic_navy') {
      return (
        <div className="w-full aspect-[1.414/1] bg-slate-50 relative p-5 flex flex-col justify-between overflow-hidden" style={customBg}>
          <div className="absolute top-0 left-0 w-1/3 h-1/2 bg-blue-950 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
          <div className="absolute top-0 left-0 w-1/3 h-1/2 bg-amber-500 pointer-events-none" style={{ clipPath: 'polygon(0 0, 104% 0, 0 104%)', zIndex: -1 }}></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-950 pointer-events-none" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-amber-500 pointer-events-none opacity-80" style={{ clipPath: 'polygon(100% 8%, 100% 100%, 8% 100%)' }}></div>
          <div className="absolute inset-4 border-[1px] border-amber-600/80 pointer-events-none"></div>
          <div className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-amber-500 border border-blue-950 flex items-center justify-center shadow-xs">
            <Icon name="academic-cap" className="w-4 h-4 text-blue-950" />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full py-1 text-center">
            <div className="mt-1">
              <h1 className="text-2xl font-black text-blue-950 tracking-wider uppercase font-sans">{item.title}</h1>
              <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest">Of High School Graduation</p>
              <div className="w-1/3 h-[1.5px] bg-amber-500 mx-auto mt-1"></div>
            </div>
            <div className="my-auto">
              <p className="text-[8px] font-bold text-zinc-800 uppercase tracking-wider mb-0.5">Proudly Present To:</p>
              <h2 className="text-2xl font-serif italic text-zinc-900 my-0.5">Name Surname</h2>
              <div dangerouslySetInnerHTML={{ __html: item.content_body }} className="text-[7.5px] font-semibold text-zinc-600 uppercase max-w-xs mx-auto leading-relaxed mt-1" />
            </div>
            <div className="flex justify-around items-end px-10 mb-1">
              <div className="w-24 text-center border-b border-blue-950 pb-0.5">
                <SigImg src={sig1Preview} />
                <p className="text-[7.5px] font-bold text-blue-950 uppercase mt-0.5">{item.signature_1_title}</p>
              </div>
              <div className="w-24 text-center border-b border-blue-950 pb-0.5">
                <SigImg src={sig2Preview} />
                <p className="text-[7.5px] font-bold text-blue-950 uppercase mt-0.5">{item.signature_2_title}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full aspect-[1.414/1] bg-white relative p-4 flex flex-col justify-between overflow-hidden" style={customBg}>
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500"></div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500"></div>
        <div className="absolute top-0 right-0 w-32 h-28 bg-sky-900 rounded-bl-full opacity-90 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-36 h-32 bg-sky-900 rounded-tr-full opacity-90 pointer-events-none"></div>
        <div className="absolute top-0 left-8 w-3 h-20 bg-sky-900 z-10"></div>
        <div className="absolute top-10 left-4 z-20 w-11 h-11 rounded-full bg-sky-950 border-2 border-amber-500 flex flex-col items-center justify-center text-amber-400 font-bold shadow">
          <span className="text-[8px] leading-tight">2030</span>
          <span className="text-[5px] tracking-tighter uppercase">Award</span>
        </div>
        <div className="absolute bottom-3 left-3 z-10 text-[7px] font-bold text-white uppercase tracking-wider">Logo Here</div>
        <div className="relative z-10 pl-20 pr-4 py-3 flex flex-col justify-between h-full">
          <div>
            <h1 className="text-2xl font-serif font-bold text-amber-600 tracking-wide">{item.title}</h1>
            <p className="text-[9px] font-bold text-zinc-700 tracking-widest uppercase">Of Appreciation</p>
          </div>
          <div className="my-auto">
            <h2 className="text-2xl font-serif italic text-sky-950 mb-0.5">Name Surname</h2>
            <div className="w-full h-[1px] bg-amber-500 mb-1.5"></div>
            <div dangerouslySetInnerHTML={{ __html: item.content_body }} className="text-[7.5px] text-zinc-500 leading-relaxed mt-1 max-w-xs" />
          </div>
          <div className="flex justify-end gap-8 items-end mb-1">
            <div className="w-20 text-center border-b border-amber-500 pb-0.5">
              <SigImg src={sig1Preview} />
              <p className="text-[7px] text-zinc-700 mt-0.5">{item.signature_1_title}</p>
            </div>
            <div className="w-20 text-center border-b border-amber-500 pb-0.5">
              <SigImg src={sig2Preview} />
              <p className="text-[7px] text-zinc-700 mt-0.5">{item.signature_2_title}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Certificate Preview</h3>
            <p className="text-sm text-slate-500 mt-0.5">{item.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-6 bg-slate-100 overflow-y-auto flex-1 flex justify-center items-center custom-scrollbar">
          <div className="w-full max-w-3xl bg-white shadow-2xl rounded-lg overflow-hidden">
            {renderCertificateContent()}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col-reverse sm:flex-row items-center justify-end gap-3 rounded-b-2xl shrink-0">
          <button type="button" className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm active:scale-95" onClick={onClose}>
            Close
          </button>
          <button type="button" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95" onClick={() => window.print()}>
            <Icon name="printer" className="w-4 h-4" /> Print Preview
          </button>
        </div>
      </div>
    </div>
  );
}