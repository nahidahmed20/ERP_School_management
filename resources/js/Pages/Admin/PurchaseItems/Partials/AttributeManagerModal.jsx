import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AttributeManagerModal({ sizes, colors, onClose }) {
    const sizeForm = useForm({ name: '' });
    const colorForm = useForm({ name: '' });

    const addSize = (e) => {
        e.preventDefault();
        sizeForm.post(route('admin.purchase.items.sizes.store'), {
            onSuccess: () => sizeForm.reset('name'),
        });
    };

    const addColor = (e) => {
        e.preventDefault();
        colorForm.post(route('admin.purchase.items.colors.store'), {
            onSuccess: () => colorForm.reset('name'),
        });
    };

    const deleteSize = (id) => router.delete(route('admin.purchase.items.sizes.destroy', id));
    const deleteColor = (id) => router.delete(route('admin.purchase.items.colors.destroy', id));

    return (
        <div className="mm-modal-overlay" onClick={onClose}>
            <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="mm-modal-head">
                    <h3>Manage Sizes & Colors</h3>
                    <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
                </div>
                <div className="mm-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>

                    {/* Sizes Section */}
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h4>Sizes</h4>
                        <form onSubmit={addSize} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <input value={sizeForm.data.name} onChange={(e) => sizeForm.setData('name', e.target.value)} placeholder="e.g. XL, 32" required style={{ flex: 1, padding: '8px' }} />
                            <button type="submit" className="btn" disabled={sizeForm.processing}>Add</button>
                        </form>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {sizes.map(s => (
                                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #cbd5e1' }}>
                                    <span>{s.name}</span>
                                    <button onClick={() => deleteSize(s.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}><Icon name="trash" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Colors Section */}
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h4>Colors</h4>
                        <form onSubmit={addColor} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <input value={colorForm.data.name} onChange={(e) => colorForm.setData('name', e.target.value)} placeholder="e.g. Red, Blue" required style={{ flex: 1, padding: '8px' }} />
                            <button type="submit" className="btn" disabled={colorForm.processing}>Add</button>
                        </form>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {colors.map(c => (
                                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #cbd5e1' }}>
                                    <span>{c.name}</span>
                                    <button onClick={() => deleteColor(c.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}><Icon name="trash" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
