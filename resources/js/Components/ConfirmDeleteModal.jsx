export default function ConfirmDeleteModal({ item, onCancel, onConfirm }) {
  const itemName = item?.name || item?.label || 'এই item';

  return (
    <div className="mm-modal-overlay" onClick={onCancel}>
      <div className="mm-modal mm-modal-xs" onClick={(e) => e.stopPropagation()}>
        <h3>Delete "{itemName}"?</h3>
        <p className="mm-confirm-text">
          আপনি কি নিশ্চিত যে আপনি এটি ডিলিট করতে চান? এই কাজটি ফেরানো যাবে না।
        </p>
        <div className="mm-modal-foot">
          <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
