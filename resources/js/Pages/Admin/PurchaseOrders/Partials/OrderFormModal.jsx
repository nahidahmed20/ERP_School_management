import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function OrderFormModal({ item, vendors, purchase_requests, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    vendor_id: item?.vendor_id ?? '',
    purchase_request_id: item?.purchase_request_id ?? '',
    order_number: item?.order_number ?? `PO-${new Date().getFullYear()}-`, 
    order_date: item?.order_date ?? new Date().toISOString().split('T')[0],
    delivery_date: item?.delivery_date ?? '',
    total_amount: item?.total_amount ?? '',
    status: item?.status ?? 'Pending',
    shipping_address: item?.shipping_address ?? 'Campus Main Store',
    notes: item?.notes ?? '',
  });

  const handleRequestChange = (e) => {
    const reqId = e.target.value;
    const req = purchase_requests.find(r => r.id == reqId);
    setData(data => ({
      ...data,
      purchase_request_id: reqId,
      total_amount: req ? req.estimated_amount : data.total_amount
    }));
  };

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.purchase.orders.update', item.id), options);
    else post(route('admin.purchase.orders.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Purchase Order' : 'Create Purchase Order'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Campus *</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin} required>
                <option value="" disabled>Select Campus</option>
                {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
              </select>
              {errors.campus_id && <em>{errors.campus_id}</em>}
            </label>

            <label>
              <span>PO Number *</span>
              <input value={data.order_number} onChange={(e) => setData('order_number', e.target.value)} autoFocus required placeholder="e.g. PO-2026-001" />
              {errors.order_number && <em>{errors.order_number}</em>}
            </label>

            <label>
              <span>Select Vendor *</span>
              <select value={data.vendor_id} onChange={(e) => setData('vendor_id', e.target.value)} required>
                <option value="" disabled>Select Vendor...</option>
                {vendors?.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              {errors.vendor_id && <em>{errors.vendor_id}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Link with Purchase Request (Optional)</span>
              <select value={data.purchase_request_id} onChange={handleRequestChange}>
                <option value="">-- No Request Linked --</option>
                {purchase_requests?.map(r => <option key={r.id} value={r.id}>{r.title} (৳ {r.estimated_amount})</option>)}
              </select>
            </label>

            <label>
              <span>Order Date *</span>
              <input type="date" value={data.order_date} onChange={(e) => setData('order_date', e.target.value)} required />
              {errors.order_date && <em>{errors.order_date}</em>}
            </label>

            <label>
              <span>Delivery Date</span>
              <input type="date" value={data.delivery_date || ''} onChange={(e) => setData('delivery_date', e.target.value)} />
            </label>

            <label>
              <span>Total Amount (৳) *</span>
              <input type="number" value={data.total_amount} onChange={(e) => setData('total_amount', e.target.value)} min="0" required />
              {errors.total_amount && <em>{errors.total_amount}</em>}
            </label>

            <label>
              <span>Order Status</span>
              <select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="Ordered">Ordered (Sent to Vendor)</option>
                <option value="Received">Received (Delivered)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Shipping Address</span>
              <textarea rows="2" value={data.shipping_address} onChange={(e) => setData('shipping_address', e.target.value)} />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Terms & Notes</span>
              <textarea rows="2" value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder="Any special instructions for the vendor..." />
            </label>

          </div>

          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : (isEdit ? 'Update' : 'Save Order')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
