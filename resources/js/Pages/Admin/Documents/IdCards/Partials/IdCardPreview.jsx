import React from 'react';
import Icon from '@/Components/Icons';
import { CARD_SIZE, FIELD_LABEL_DEFAULTS, accentStyle, isFilledAccent, findTemplate } from './idCardTemplates';

const ALIGN_TO_FLEX = { left: 'items-start', center: 'items-center', right: 'items-end' };
const ALIGN_TO_ROW = { left: 'justify-start', center: 'justify-center', right: 'justify-end' };
const ALIGN_TEXT = { left: 'text-left', center: 'text-center', right: 'text-right' };

export default function IdCardPreview({
  side = 'front',
  templateKey = 'classic-solid',
  layoutType = 'Portrait',
  themeColor = '#1e293b',
  textAlign = 'center',
  photoAlign = 'center',
  fieldLabels,
  showBloodGroup = true,
  showPhone = true,
  showAddress = false,
  backContent = '',
  logoPreview,
  sigPreview,
  bgPreview,
}) {
  const template = findTemplate(templateKey);
  const effectiveOrientation = template.orientation === 'any' ? layoutType : template.orientation;
  const size = CARD_SIZE[effectiveOrientation] ?? CARD_SIZE.Portrait;
  const accent = accentStyle(template.accent, themeColor);
  const filled = isFilledAccent(template.accent);
  const labels = { ...FIELD_LABEL_DEFAULTS, ...(fieldLabels || {}) };

  const cardStyle = {
    width: size.width,
    height: size.height,
    background: bgPreview ? `url(${bgPreview}) center/cover` : '#fff',
  };

  if (side === 'back') {
    return (
      <div className="relative overflow-hidden bg-white shadow-sm flex flex-col font-sans" style={cardStyle}>
        <div className="flex items-center justify-center shrink-0 w-full z-10" style={{ height: 32, color: filled ? '#fff' : themeColor, ...accent }}>
          <span className="text-[10px] font-bold uppercase tracking-wider">Terms &amp; Conditions</span>
        </div>
        <div className="flex-1 flex flex-col p-4 z-10">
          <p className="text-[10px] text-slate-700 leading-relaxed text-center">{backContent || 'No back side content added yet.'}</p>
          <div className="mt-auto pt-4 text-center font-mono text-xs font-bold text-slate-800 tracking-widest border-t border-slate-200">
            STU-2024-001
          </div>
        </div>
        <div className="w-full shrink-0 z-10" style={{ height: 6, ...accent }} />
      </div>
    );
  }

  const headerTextColor = filled ? '#fff' : themeColor;

  const logoBlock = logoPreview ? (
    <img src={logoPreview} alt="School logo" className="h-8 object-contain max-w-[120px]" />
  ) : (
    <span className="font-bold text-sm uppercase tracking-wider">SCHOOL NAME</span>
  );

  const avatar = (square) => (
    <div className={`w-20 h-20 bg-slate-100 flex items-center justify-center overflow-hidden border-2 shadow-sm ${square ? 'rounded-lg' : 'rounded-full'}`} style={{ borderColor: themeColor }}>
      <Icon name="user" className="w-8 h-8 text-slate-300" />
    </div>
  );

  const nameBlock = (
    <div className={ALIGN_TEXT[textAlign]}>
      <strong className="text-[17px] font-bold text-slate-900 block leading-tight">John Doe</strong>
      <div className="text-[10px] text-slate-500 font-semibold mb-2 mt-0.5">
        {labels.class}: 10 <span className="mx-1">|</span> {labels.roll}: 12
      </div>
    </div>
  );

  const detailRows = (
    <div className={`text-[10px] text-slate-700 space-y-1 w-full ${ALIGN_TEXT[textAlign]}`}>
      <div className={`flex items-center gap-2 ${ALIGN_TO_ROW[textAlign]}`}>
        <span><strong>{labels.id}:</strong> STU-001</span>
        {showBloodGroup && (
          <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded border border-rose-100">
            {labels.blood}: O+
          </span>
        )}
      </div>
      <div><strong>{labels.dob}:</strong> 12-05-2005</div>
      {showPhone && <div><strong>{labels.phone}:</strong> +880 1234 56789</div>}
      {showAddress && <div className="leading-tight"><strong>{labels.address}:</strong> 123 School Rd, Dhaka</div>}
    </div>
  );

  const signatureBlock = (
    <div className="mt-auto pt-2 pb-2 w-full flex flex-col items-center z-10">
      <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-1">Holder's Signature</div>
      <div className="flex flex-col items-center">
        {sigPreview ? <img src={sigPreview} alt="Signature" className="h-5 object-contain" /> : <div className="h-5" />}
        <div className="border-t border-slate-400 text-[9px] text-slate-600 pt-0.5 mt-1 font-semibold w-24 text-center">Principal</div>
      </div>
    </div>
  );

  // ---------------- Split ----------------
  if (template.shape === 'split') {
    const reverse = photoAlign === 'right';
    return (
      <div className={`relative overflow-hidden bg-white shadow-sm flex font-sans ${reverse ? 'flex-row-reverse' : 'flex-row'}`} style={cardStyle}>
        {bgPreview && <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${bgPreview})` }} />}
        <div className="w-[35%] flex flex-col items-center py-4 px-2 justify-between z-10 shrink-0" style={{ color: '#fff', ...accent }}>
          {avatar(false)}
          <div className="mt-4">{logoBlock}</div>
        </div>
        <div className={`flex-1 flex flex-col p-4 z-10 ${ALIGN_TO_FLEX[textAlign]}`}>
          <div className="w-full">{nameBlock}</div>
          {detailRows}
          <div className="mt-auto flex flex-col items-center">
            {sigPreview ? <img src={sigPreview} alt="Signature" className="h-4 object-contain" /> : <div className="h-4" />}
            <div className="border-t border-slate-400 text-[8px] text-slate-600 pt-0.5 mt-1 font-semibold w-20 text-center">Principal</div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- Banner ----------------
  if (template.shape === 'banner') {
    return (
      <div className="relative overflow-hidden bg-white shadow-sm flex flex-col font-sans" style={cardStyle}>
        {bgPreview && <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${bgPreview})` }} />}
        <div className={`flex items-center p-3 shrink-0 z-10 h-14 ${ALIGN_TO_ROW[photoAlign]}`} style={{ color: headerTextColor, ...accent }}>
          {logoBlock}
        </div>
        <div className={`flex w-full px-4 -mt-8 z-20 ${ALIGN_TO_ROW[photoAlign]}`}>
          {avatar(false)}
        </div>
        <div className={`flex-1 flex flex-col px-4 pt-2 z-10 ${ALIGN_TO_FLEX[textAlign]}`}>
          <div className="w-full">{nameBlock}</div>
          {detailRows}
        </div>
        {signatureBlock}
        <div className="h-2 w-full mt-auto shrink-0 z-10" style={accent} />
      </div>
    );
  }

  // ---------------- Framed ----------------
  if (template.shape === 'framed') {
    return (
      <div className="relative overflow-hidden bg-white shadow-sm flex flex-col p-3 font-sans" style={{ ...cardStyle, border: `2px solid ${themeColor}` }}>
        {bgPreview && <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${bgPreview})` }} />}
        <span className="absolute w-2 h-2 border-t-2 border-l-2 top-1 left-1 z-10" style={{ borderColor: themeColor }} />
        <span className="absolute w-2 h-2 border-t-2 border-r-2 top-1 right-1 z-10" style={{ borderColor: themeColor }} />
        <span className="absolute w-2 h-2 border-b-2 border-l-2 bottom-1 left-1 z-10" style={{ borderColor: themeColor }} />
        <span className="absolute w-2 h-2 border-b-2 border-r-2 bottom-1 right-1 z-10" style={{ borderColor: themeColor }} />
        
        <div className={`flex items-center py-2 shrink-0 z-10 ${ALIGN_TO_ROW[photoAlign]}`} style={{ color: headerTextColor, ...accent }}>
          {logoBlock}
        </div>
        <div className={`flex w-full my-2 z-10 ${ALIGN_TO_ROW[photoAlign]}`}>
          {avatar(true)}
        </div>
        <div className={`flex-1 flex flex-col z-10 ${ALIGN_TO_FLEX[textAlign]}`}>
          <div className="w-full">{nameBlock}</div>
          {detailRows}
        </div>
      </div>
    );
  }

  // ---------------- Minimal ----------------
  if (template.shape === 'minimal') {
    return (
      <div className="relative overflow-hidden bg-white shadow-sm flex flex-col font-sans px-4 py-3" style={cardStyle}>
        {bgPreview && <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${bgPreview})` }} />}
        <div className="h-1 w-full shrink-0 z-10 rounded-full mb-3" style={{ background: filled ? accent.background : themeColor }} />
        <div className={`flex items-center shrink-0 z-10 ${ALIGN_TO_ROW[photoAlign]}`}>
          {logoBlock}
        </div>
        <div className={`flex w-full my-3 z-10 ${ALIGN_TO_ROW[photoAlign]}`}>
          {avatar(true)}
        </div>
        <div className={`flex-1 flex flex-col z-10 ${ALIGN_TO_FLEX[textAlign]}`}>
          <div className="w-full">{nameBlock}</div>
          {detailRows}
        </div>
        <div className="h-1 w-full mt-auto shrink-0 z-10 rounded-full" style={{ background: filled ? accent.background : themeColor }} />
      </div>
    );
  }

  // ---------------- Classic (Default) ----------------
  return (
    <div className="relative overflow-hidden bg-white shadow-sm flex flex-col font-sans" style={cardStyle}>
      {bgPreview && <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${bgPreview})` }} />}
      <div className={`flex items-center px-4 shrink-0 z-10 ${ALIGN_TO_ROW[photoAlign]}`} style={{ height: effectiveOrientation === 'Portrait' ? 70 : 50, color: headerTextColor, ...accent }}>
        {logoBlock}
      </div>
      <div className={`flex-1 flex flex-col px-4 py-3 z-10 ${ALIGN_TO_FLEX[textAlign]}`}>
        <div className={`flex w-full mb-3 ${ALIGN_TO_ROW[photoAlign]}`}>
          {avatar(false)}
        </div>
        <div className="w-full">{nameBlock}</div>
        {detailRows}
      </div>
      {signatureBlock}
      <div className="h-2 w-full mt-auto shrink-0 z-10" style={accent} />
    </div>
  );
}