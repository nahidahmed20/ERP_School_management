import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function DeviceFormModal({ item, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin';

  const { data, setData, post, put, processing, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    name: item?.name ?? '',
    ip_address: item?.ip_address ?? '',
    port: item?.port ?? '4370', // 4370 is standard for ZKTeco devices
    serial_number: item?.serial_number ?? '',
    status: item?.status ?? 'Offline',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.biometric-devices.update', item.id), options);
    else post(route('admin.biometric-devices.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Device' : 'Register New Device'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}><span>Campus Assignment</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin}>
                <option value="">Global (All Campuses)</option>
                {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Device Name / Location *</span>
              <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="e.g. Main Gate Entrance" />
            </label>

            <label><span>IP Address *</span>
              <input type="text" value={data.ip_address} onChange={e => setData('ip_address', e.target.value)} required placeholder="e.g. 192.168.1.201" />
            </label>

            <label><span>Port *</span>
              <input type="text" value={data.port} onChange={e => setData('port', e.target.value)} required placeholder="Default: 4370" />
            </label>

            <label><span>Serial Number (S/N) *</span>
              <input type="text" value={data.serial_number} onChange={e => setData('serial_number', e.target.value)} required placeholder="Check back of the device" />
            </label>

            <label><span>Current Status</span>
              <select value={data.status} onChange={e => setData('status', e.target.value)}>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>

            {/* Save Button with Dynamic Processing Text */}
            <button type="submit" className="btn" disabled={processing}>
              <Icon name="save" /> {processing ? 'Saving...' : (isEdit ? 'Update Device' : 'Register Device')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
