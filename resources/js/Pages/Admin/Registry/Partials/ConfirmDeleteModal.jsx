import Icon from '@/Components/Icons';

export default function ConfirmDeleteModal({ item, onCancel, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box modal-box-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Delete Log Entry?</h2>
          <button className="icon-btn" onClick={onCancel}><Icon name="close" /></button>
        </div>
        <p className="modal-confirm-text">
          আপনি কি নিশ্চিত যে এই log entry-টি মুছে ফেলতে চান? এই কাজটি undo করা যাবে না।
        </p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
