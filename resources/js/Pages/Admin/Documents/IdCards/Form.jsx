import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';
import IdCardPreview from "./Partials/IdCardShowModal";
import { CARD_TEMPLATES, CARD_SIZE, FIELD_LABEL_DEFAULTS } from './Partials/idCardTemplates';

const MAX_IMAGE_MB = 2;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const BACK_CONTENT_LIMIT = 220;
const THUMB_WIDTH = 96;

const THEME_PRESETS = [
  { name: 'Forest Green', value: '#1B4332' },
  { name: 'Emerald', value: '#166534' },
  { name: 'Gold', value: '#B8860B' },
  { name: 'Slate Navy', value: '#1e293b' },
  { name: 'Maroon', value: '#7f1d1d' },
  { name: 'Royal Blue', value: '#1e3a8a' },
];

function FieldError({ message }) {
  if (!message) return null;
  return <div className="mm-field-error">{message}</div>;
}

function AlignPicker({ value, onChange }) {
  return (
    <div className="mm-align-picker">
      {['left', 'center', 'right'].map((opt) => (
        <button
          type="button"
          key={opt}
          className={`mm-align-btn${value === opt ? ' active' : ''}`}
          onClick={() => onChange(opt)}
        >
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  );
}

function thumbGeometry(template, layoutType) {
  const orientation = template.orientation === 'any' ? layoutType : template.orientation;
  const size = CARD_SIZE[orientation] ?? CARD_SIZE.Portrait;
  const scale = THUMB_WIDTH / size.width;
  return { width: size.width, height: size.height, scale, thumbHeight: size.height * scale };
}

export default function IdCardForm({ item, campuses, activeCampusId }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin =
    auth?.user?.role === 'super_admin' || auth?.user?.roles?.some((r) => r.name === 'Super Admin');

  const { data, setData, post, processing, errors, reset, isDirty } = useForm({
    _method: isEdit ? 'put' : 'post', // For file uploads in Laravel update
    campus_id: item?.campus_id ?? activeCampusId,
    title: item?.title ?? 'Standard Student ID',
    layout_type: item?.layout_type ?? 'Portrait',
    theme_color: item?.theme_color ?? '#1e293b',
    design_template: item?.design_template ?? 'classic-solid',
    text_align: item?.text_align ?? 'center',
    photo_align: item?.photo_align ?? 'center',
    field_labels: { ...FIELD_LABEL_DEFAULTS, ...(item?.field_labels ?? {}) },
    show_blood_group: item?.show_blood_group ?? true,
    show_address: item?.show_address ?? false,
    show_phone: item?.show_phone ?? true,
    back_side_content: item?.back_side_content ?? 'If found, please return to the school administration.',
    is_active: item?.is_active ?? true,
    logo_image: null,
    signature_image: null,
    background_image: null,
    // Explicit deletion flags so the backend can tell "no change" from "please remove the saved file".
    remove_logo_image: false,
    remove_signature_image: false,
    remove_background_image: false,
  });

  // Local state for instant image previews
  const [logoPreview, setLogoPreview] = useState(item?.logo_image ? `/storage/${item.logo_image}` : null);
  const [sigPreview, setSigPreview] = useState(item?.signature_image ? `/storage/${item.signature_image}` : null);
  const [bgPreview, setBgPreview] = useState(item?.background_image ? `/storage/${item.background_image}` : null);
  const [imageErrors, setImageErrors] = useState({ logo: '', signature: '', background: '' });
  const [previewSide, setPreviewSide] = useState('front');

  const fileInputRefs = { logo: useRef(), signature: useRef(), background: useRef() };
  const objectUrls = useRef([]);

  useEffect(() => {
    return () => objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const currentCampusName =
    campuses?.find((c) => String(c.id) === String(data.campus_id))?.name || item?.campus?.name || 'Assigned Campus';

  function validateImage(file) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please choose a JPG, PNG, or WEBP image.';
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      return `Image must be smaller than ${MAX_IMAGE_MB}MB.`;
    }
    return '';
  }

  function handleImageChange(key, field, removeFlagField, file, setPreview) {
    if (!file) return;
    const error = validateImage(file);
    setImageErrors((prev) => ({ ...prev, [key]: error }));
    if (error) return;

    const url = URL.createObjectURL(file);
    objectUrls.current.push(url);
    setData((prevData) => ({ ...prevData, [field]: file, [removeFlagField]: false }));
    setPreview(url);
  }

  function removeImage(key, field, removeFlagField, setPreview, hadSavedFile) {
    setData((prevData) => ({ ...prevData, [field]: null, [removeFlagField]: hadSavedFile }));
    setPreview(null);
    setImageErrors((prev) => ({ ...prev, [key]: '' }));
    if (fileInputRefs[key].current) fileInputRefs[key].current.value = '';
  }

  function selectTemplate(template) {
    const nextLayout = template.orientation === 'any' ? data.layout_type : template.orientation;
    setData((prev) => ({ ...prev, design_template: template.key, layout_type: nextLayout }));
  }

  function submit(e) {
    e.preventDefault();
    if (Object.values(imageErrors).some(Boolean)) return;

    const options = {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: isEdit ? 'Template updated' : 'Template created',
          timer: 1500,
          showConfirmButton: false,
        });
        if (!isEdit) reset();
      },
      onError: () => {
        Swal.fire({
          icon: 'error',
          title: 'Please check the form',
          text: 'Some fields need your attention before this can be saved.',
        });
      },
    };

    if (isEdit) {
      post(route('admin.documents.idcards.update', item.id), options);
    } else {
      post(route('admin.documents.idcards.store'), options);
    }
  }

  const backLength = data.back_side_content?.length ?? 0;

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="eyebrow">Documents / ID Cards</span>
            <h1>{isEdit ? 'Edit ID Card Template' : 'Create Live ID Card Template'}</h1>
          </div>
          <Link href={route('admin.documents.idcards.index')} className="btn btn-outline">
            <Icon name="arrow-left" /> Back to List
          </Link>
        </div>
      }
    >
      <Head title={isEdit ? 'Edit ID Card' : 'Create ID Card'} />

      <div className="idcard-layout">
        {/* ================= LEFT SIDE: EDIT FORM ================= */}
        <div className="card mm-card">
          <div className="card-header" style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0 }}>Template Settings</h3>
          </div>

          <form onSubmit={submit} className="mm-form" style={{ padding: '20px' }} noValidate>
            {/* ---------- Design Gallery ---------- */}
            <div className="mm-section">
              <div className="mm-section-title">Design</div>
              <div className="idcard-gallery-grid">
                {CARD_TEMPLATES.map((tpl) => {
                  const geo = thumbGeometry(tpl, data.layout_type);
                  return (
                    <button
                      type="button"
                      key={tpl.key}
                      className={`idcard-gallery-item${data.design_template === tpl.key ? ' active' : ''}`}
                      onClick={() => selectTemplate(tpl)}
                    >
                      <div className="idcard-gallery-thumb-wrap" style={{ width: THUMB_WIDTH, height: geo.thumbHeight }}>
                        <div style={{ transform: `scale(${geo.scale})`, transformOrigin: 'top left', width: geo.width, height: geo.height }}>
                          <IdCardPreview
                            side="front"
                            templateKey={tpl.key}
                            layoutType={data.layout_type}
                            themeColor={data.theme_color}
                            textAlign={data.text_align}
                            photoAlign={data.photo_align}
                            fieldLabels={data.field_labels}
                            showBloodGroup={data.show_blood_group}
                            showPhone={data.show_phone}
                            showAddress={data.show_address}
                            logoPreview={logoPreview}
                            sigPreview={sigPreview}
                            bgPreview={bgPreview}
                          />
                        </div>
                      </div>
                      <span className="idcard-gallery-name">{tpl.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mm-hint-text">More designs can be added to this gallery over time — pick whichever fits today.</div>
            </div>

            <div className="mm-form-grid">
              <label style={{ gridColumn: '1 / -1' }}>
                <span>Campus *</span>
                {isSuperAdmin ? (
                  <>
                    <select value={data.campus_id} onChange={(e) => setData('campus_id', e.target.value)} required>
                      <option value="" disabled>
                        Select Campus
                      </option>
                      {campuses?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <FieldError message={errors.campus_id} />
                  </>
                ) : (
                  <div className="mm-static-field">
                    <Icon name="building" /> {currentCampusName}
                  </div>
                )}
              </label>

              <label>
                <span>Template Title *</span>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  aria-invalid={!!errors.title}
                  maxLength={100}
                  required
                />
                <FieldError message={errors.title} />
              </label>

              <label>
                <span>Layout Orientation *</span>
                <select value={data.layout_type} onChange={(e) => setData('layout_type', e.target.value)}>
                  <option value="Portrait">Portrait (Vertical)</option>
                  <option value="Landscape">Landscape (Horizontal)</option>
                </select>
                <FieldError message={errors.layout_type} />
              </label>

              <label style={{ gridColumn: '1 / -1' }}>
                <span>Primary Theme Color *</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={data.theme_color}
                    onChange={(e) => setData('theme_color', e.target.value)}
                    style={{ width: '50px', height: '40px', padding: '2px' }}
                  />
                  <input
                    type="text"
                    value={data.theme_color}
                    onChange={(e) => setData('theme_color', e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
                <div className="mm-color-swatches">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.value}
                      title={preset.name}
                      className={`mm-swatch${data.theme_color?.toLowerCase() === preset.value.toLowerCase() ? ' active' : ''}`}
                      style={{ background: preset.value }}
                      onClick={() => setData('theme_color', preset.value)}
                    />
                  ))}
                </div>
                <FieldError message={errors.theme_color} />
              </label>

              {/* ---------- Alignment ---------- */}
              <label>
                <span>Photo / Logo Alignment</span>
                <AlignPicker value={data.photo_align} onChange={(v) => setData('photo_align', v)} />
              </label>

              <label>
                <span>Name &amp; Text Alignment</span>
                <AlignPicker value={data.text_align} onChange={(v) => setData('text_align', v)} />
              </label>

              <ImageField
                label="School Logo"
                inputRef={fileInputRefs.logo}
                preview={logoPreview}
                error={imageErrors.logo || errors.logo_image}
                onChange={(file) => handleImageChange('logo', 'logo_image', 'remove_logo_image', file, setLogoPreview)}
                onRemove={() => removeImage('logo', 'logo_image', 'remove_logo_image', setLogoPreview, !!item?.logo_image)}
              />

              <ImageField
                label="Authority Signature"
                inputRef={fileInputRefs.signature}
                preview={sigPreview}
                error={imageErrors.signature || errors.signature_image}
                onChange={(file) =>
                  handleImageChange('signature', 'signature_image', 'remove_signature_image', file, setSigPreview)
                }
                onRemove={() =>
                  removeImage('signature', 'signature_image', 'remove_signature_image', setSigPreview, !!item?.signature_image)
                }
              />

              <ImageField
                fullWidth
                label="Card Background / Watermark (Optional)"
                inputRef={fileInputRefs.background}
                preview={bgPreview}
                error={imageErrors.background || errors.background_image}
                onChange={(file) =>
                  handleImageChange('background', 'background_image', 'remove_background_image', file, setBgPreview)
                }
                onRemove={() =>
                  removeImage('background', 'background_image', 'remove_background_image', setBgPreview, !!item?.background_image)
                }
              />

              {/* ---------- Field Label Rename ---------- */}
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="mm-section-title">Field Labels</div>
                <div className="mm-field-labels-grid">
                  {Object.keys(FIELD_LABEL_DEFAULTS).map((key) => (
                    <label key={key}>
                      <span>{FIELD_LABEL_DEFAULTS[key]} label</span>
                      <input
                        type="text"
                        maxLength={24}
                        value={data.field_labels?.[key] ?? FIELD_LABEL_DEFAULTS[key]}
                        onChange={(e) => setData('field_labels', { ...data.field_labels, [key]: e.target.value })}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div
                style={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '20px',
                  padding: '15px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <label className="mm-checkbox">
                  <input
                    type="checkbox"
                    checked={data.show_blood_group}
                    onChange={(e) => setData('show_blood_group', e.target.checked)}
                  />{' '}
                  Show Blood Group
                </label>
                <label className="mm-checkbox">
                  <input
                    type="checkbox"
                    checked={data.show_phone}
                    onChange={(e) => setData('show_phone', e.target.checked)}
                  />{' '}
                  Show Phone
                </label>
                <label className="mm-checkbox">
                  <input
                    type="checkbox"
                    checked={data.show_address}
                    onChange={(e) => setData('show_address', e.target.checked)}
                  />{' '}
                  Show Address
                </label>
              </div>

              <label style={{ gridColumn: '1 / -1' }}>
                <span>Back Side Terms &amp; Conditions</span>
                <textarea
                  rows="3"
                  value={data.back_side_content}
                  maxLength={BACK_CONTENT_LIMIT}
                  onChange={(e) => setData('back_side_content', e.target.value)}
                ></textarea>
                <div className="mm-char-count">
                  {backLength}/{BACK_CONTENT_LIMIT}
                </div>
                <FieldError message={errors.back_side_content} />
              </label>

              <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
                <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />{' '}
                Set as Active Template
              </label>
            </div>

            <div
              className="mm-modal-foot mt-4"
              style={{
                paddingTop: '20px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span className="mm-dirty-hint">{isDirty ? 'You have unsaved changes' : ''}</span>
              <button type="submit" className="btn" disabled={processing}>
                <Icon name="save" /> {processing ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </form>
        </div>

        {/* ================= RIGHT SIDE: LIVE PREVIEW ================= */}
        <div className="idcard-preview-pane">
          <div className="mm-preview-toggle">
            <button
              type="button"
              className={`btn btn-outline${previewSide === 'front' ? ' active' : ''}`}
              onClick={() => setPreviewSide('front')}
            >
              Front
            </button>
            <button
              type="button"
              className={`btn btn-outline${previewSide === 'back' ? ' active' : ''}`}
              onClick={() => setPreviewSide('back')}
            >
              Back
            </button>
          </div>

          <IdCardPreview
            side={previewSide}
            templateKey={data.design_template}
            layoutType={data.layout_type}
            themeColor={data.theme_color}
            textAlign={data.text_align}
            photoAlign={data.photo_align}
            fieldLabels={data.field_labels}
            showBloodGroup={data.show_blood_group}
            showPhone={data.show_phone}
            showAddress={data.show_address}
            backContent={data.back_side_content}
            logoPreview={logoPreview}
            sigPreview={sigPreview}
            bgPreview={bgPreview}
          />

          <div className="mm-preview-hint">
            <Icon name="info" /> Preview uses sample student data — actual cards pull real student records.
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

function ImageField({ label, preview, error, onChange, onRemove, inputRef, fullWidth }) {
  return (
    <label style={fullWidth ? { gridColumn: '1 / -1' } : undefined}>
      <span>{label}</span>
      <div className="mm-image-field">
        {preview && (
          <div className="mm-image-thumb">
            <img src={preview} alt="" />
            <button type="button" className="mm-image-remove" onClick={onRemove} aria-label={`Remove ${label}`}>
              <Icon name="x" />
            </button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => onChange(e.target.files[0])}
        />
      </div>
      <div className="mm-hint-text">JPG, PNG, or WEBP — up to {MAX_IMAGE_MB}MB.</div>
      <FieldError message={error} />
    </label>
  );
}
