import React from 'react';
import Icon from '@/Components/Icons';
import { CARD_SIZE, FIELD_LABEL_DEFAULTS, accentStyle, isFilledAccent, findTemplate } from './idCardTemplates';

const ALIGN_TO_FLEX = { left: 'flex-start', center: 'center', right: 'flex-end' };
const ALIGN_TO_ROW = { left: 'flex-start', center: 'center', right: 'flex-end' };

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
      <div className="idcard-preview-card" style={cardStyle}>
        <div className="idcard-preview-header" style={{ height: 32, color: filled ? '#fff' : themeColor, ...accent }}>
          <span style={{ fontSize: '10px' }}>Terms &amp; Conditions</span>
        </div>
        <div className="idcard-preview-back-body">
          <p>{backContent || 'No back side content added yet.'}</p>
          <div className="idcard-preview-barcode">STU-2024-001</div>
        </div>
        <div className="idcard-preview-footer" style={{ height: 6, ...accent }} />
      </div>
    );
  }

  const headerTextColor = filled ? '#fff' : themeColor;

  const logoBlock = logoPreview ? (
    <img src={logoPreview} alt="School logo" className="idcard-preview-logo" />
  ) : (
    <span>SCHOOL NAME</span>
  );

  const avatar = (square) => (
    <div className={`idcard-preview-avatar${square ? ' idcard-avatar-square' : ''}`} style={{ borderColor: themeColor }}>
      <Icon name="user" style={{ fontSize: '30px' }} />
    </div>
  );

  const nameBlock = (
    <>
      <strong className="idcard-preview-name">John Doe</strong>
      <div className="idcard-preview-meta">
        {labels.class}: 10 | {labels.roll}: 12
      </div>
    </>
  );

  const detailRows = (
    <div className="idcard-preview-details" style={{ textAlign }}>
      <div className="idcard-preview-row">
        <span>
          <strong>{labels.id}:</strong> STU-2024-001
        </span>
        {showBloodGroup && (
          <span className="idcard-preview-blood">
            <strong>{labels.blood}:</strong> O+
          </span>
        )}
      </div>
      <div>
        <strong>{labels.dob}:</strong> 12-05-2005
      </div>
      {showPhone && (
        <div>
          <strong>{labels.phone}:</strong> +880 1234 56789
        </div>
      )}
      {showAddress && (
        <div className="idcard-preview-address">
          <strong>{labels.address}:</strong> 123 School Rd, Dhaka
        </div>
      )}
    </div>
  );

  const signatureBlock = (
    <div className="idcard-preview-sign">
      <div className="idcard-preview-sign-label">Holder's Signature</div>
      <div style={{ textAlign: 'center' }}>
        {sigPreview ? <img src={sigPreview} alt="Signature" className="idcard-preview-sig" /> : <div style={{ height: 20 }} />}
        <div className="idcard-preview-sig-line">Principal</div>
      </div>
    </div>
  );

  // ---------------- Split (left color panel + right details) ----------------
  if (template.shape === 'split') {
    const reverse = photoAlign === 'right';
    return (
      <div
        className="idcard-preview-card idcard-shape-split"
        style={{ ...cardStyle, flexDirection: reverse ? 'row-reverse' : 'row' }}
      >
        {bgPreview && <div className="idcard-preview-overlay" />}
        <div className="idcard-split-photo" style={{ color: '#fff', ...accent }}>
          {avatar(false)}
          <div className="idcard-split-logo">{logoBlock}</div>
        </div>
        <div className="idcard-split-info" style={{ alignItems: ALIGN_TO_FLEX[textAlign] }}>
          <div style={{ textAlign, width: '100%' }}>{nameBlock}</div>
          {detailRows}
          <div className="idcard-preview-sign-inline">
            {sigPreview ? <img src={sigPreview} alt="Signature" className="idcard-preview-sig" /> : <div style={{ height: 18 }} />}
            <div className="idcard-preview-sig-line">Principal</div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- Banner (diagonal header, overlapping avatar) ----------------
  if (template.shape === 'banner') {
    return (
      <div className="idcard-preview-card idcard-shape-banner" style={cardStyle}>
        {bgPreview && <div className="idcard-preview-overlay" />}
        <div className="idcard-banner-header" style={{ color: headerTextColor, justifyContent: ALIGN_TO_ROW[photoAlign], ...accent }}>
          {logoBlock}
        </div>
        <div className="idcard-banner-avatar-row" style={{ justifyContent: ALIGN_TO_ROW[photoAlign] }}>
          {avatar(false)}
        </div>
        <div className="idcard-preview-body-plain" style={{ alignItems: ALIGN_TO_FLEX[textAlign] }}>
          <div style={{ textAlign, width: '100%' }}>{nameBlock}</div>
          {detailRows}
        </div>
        {signatureBlock}
        <div className="idcard-preview-footer" style={accent} />
      </div>
    );
  }

  // ---------------- Framed (bordered card, corner ticks, no header band) ----------------
  if (template.shape === 'framed') {
    return (
      <div className="idcard-preview-card idcard-shape-framed" style={{ ...cardStyle, border: `2px solid ${themeColor}` }}>
        {bgPreview && <div className="idcard-preview-overlay" />}
        <span className="idcard-corner idcard-corner-tl" style={{ borderColor: themeColor }} />
        <span className="idcard-corner idcard-corner-tr" style={{ borderColor: themeColor }} />
        <span className="idcard-corner idcard-corner-bl" style={{ borderColor: themeColor }} />
        <span className="idcard-corner idcard-corner-br" style={{ borderColor: themeColor }} />
        <div className="idcard-framed-logo-row" style={{ color: headerTextColor, justifyContent: ALIGN_TO_ROW[photoAlign], ...accent }}>
          {logoBlock}
        </div>
        <div className="idcard-preview-body-plain" style={{ alignItems: ALIGN_TO_FLEX[photoAlign] }}>
          {avatar(true)}
        </div>
        <div className="idcard-preview-body-plain" style={{ alignItems: ALIGN_TO_FLEX[textAlign] }}>
          <div style={{ textAlign, width: '100%' }}>{nameBlock}</div>
          {detailRows}
        </div>
      </div>
    );
  }

  // ---------------- Minimal (thin accent lines, generous whitespace) ----------------
  if (template.shape === 'minimal') {
    return (
      <div className="idcard-preview-card idcard-shape-minimal" style={cardStyle}>
        {bgPreview && <div className="idcard-preview-overlay" />}
        <div className="idcard-minimal-topline" style={{ background: filled ? accent.background : themeColor }} />
        <div className="idcard-minimal-logo-row" style={{ justifyContent: ALIGN_TO_ROW[photoAlign] }}>
          {logoBlock}
        </div>
        <div className="idcard-preview-body-plain" style={{ alignItems: ALIGN_TO_FLEX[photoAlign] }}>
          {avatar(true)}
        </div>
        <div className="idcard-preview-body-plain" style={{ alignItems: ALIGN_TO_FLEX[textAlign] }}>
          <div style={{ textAlign, width: '100%' }}>{nameBlock}</div>
          {detailRows}
        </div>
        <div className="idcard-minimal-bottomline" style={{ background: filled ? accent.background : themeColor }} />
      </div>
    );
  }

  // ---------------- Classic (current/original design — header band + centered body) ----------------
  return (
    <div className="idcard-preview-card" style={cardStyle}>
      {bgPreview && <div className="idcard-preview-overlay" />}
      <div
        className="idcard-preview-header"
        style={{
          height: effectiveOrientation === 'Portrait' ? 70 : 50,
          color: headerTextColor,
          justifyContent: ALIGN_TO_ROW[photoAlign],
          ...accent,
        }}
      >
        {logoBlock}
      </div>
      <div className="idcard-preview-body">
        <div style={{ alignSelf: ALIGN_TO_FLEX[photoAlign] }}>{avatar(false)}</div>
        <div style={{ textAlign, width: '100%' }}>{nameBlock}</div>
        {detailRows}
      </div>
      {signatureBlock}
      <div className="idcard-preview-footer" style={accent} />
    </div>
  );
}
