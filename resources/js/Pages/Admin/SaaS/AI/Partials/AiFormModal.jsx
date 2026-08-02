import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AiFormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, reset, errors } = useForm({
    name: item?.name ?? '',
    provider: item?.provider ?? 'OpenAI',
    model_name: item?.model_name ?? 'gpt-4o',
    system_prompt: item?.system_prompt ?? '',
    is_active: item?.is_active ?? true,
  });

  // Suggest default models based on provider selection
  const handleProviderChange = (e) => {
    const newProvider = e.target.value;
    setData('provider', newProvider);
    if (newProvider === 'OpenAI') setData('model_name', 'gpt-4o');
    if (newProvider === 'Gemini') setData('model_name', 'gemini-1.5-pro');
    if (newProvider === 'Claude') setData('model_name', 'claude-3-opus');
  };

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.saas.ai.update', item.id), options);
    else post(route('admin.saas.ai.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Configure AI Assistant' : 'Create AI Assistant'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}><span>Tool / Assistant Name *</span>
              <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="e.g. MCQ Question Generator" />
              {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
            </label>

            <label><span>AI Provider *</span>
              <select value={data.provider} onChange={handleProviderChange}>
                <option value="OpenAI">OpenAI (ChatGPT)</option>
                <option value="Gemini">Google Gemini</option>
                <option value="Claude">Anthropic Claude</option>
              </select>
            </label>

            <label><span>Model Engine *</span>
              <input type="text" value={data.model_name} onChange={e => setData('model_name', e.target.value)} required placeholder="e.g. gpt-4o" />
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>System Prompt (Instructions) *</span>
              <textarea
                rows="6"
                value={data.system_prompt}
                onChange={e => setData('system_prompt', e.target.value)}
                placeholder="You are an expert high school teacher. When the user gives a topic, generate 10 multiple choice questions..."
              ></textarea>
              <span style={{ fontSize: '11px', color: '#64748b' }}>This prompt tells the AI how to behave and what output format to use.</span>
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Enable this AI tool
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing} style={{ background: '#4f46e5' }}>
              <Icon name="sparkles" /> {processing ? 'Saving Config...' : (isEdit ? 'Update Assistant' : 'Create Assistant')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
