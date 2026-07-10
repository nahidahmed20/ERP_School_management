export default function ConfirmDeleteModal({ item, onCancel, onConfirm }) {
  return (
    <div className="mm-modal-overlay" onClick={onCancel}>
      <div className="mm-modal mm-modal-xs" onClick={(e) => e.stopPropagation()}>
        <h3>Delete "{item.label}"?</h3>
        <p className="mm-confirm-text">
          এই item ডিলিট করলে এর সব submenu-ও ডিলিট হয়ে যাবে। এই কাজটি ফেরানো যাবে না।
        </p>
        <div className="mm-modal-foot">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
