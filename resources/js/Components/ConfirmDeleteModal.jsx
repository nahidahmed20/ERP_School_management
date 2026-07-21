import { useEffect } from 'react';
import Icon from '@/Components/Icons';

export default function ConfirmDeleteModal({ item, onCancel, onConfirm }) {
  const itemName = item?.name || item?.label || item?.title || 'এই item';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 transition-opacity p-4 animate__animated animate__fadeIn animate__faster" 
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full p-6 sm:p-8 transform transition-all animate__animated animate__zoomIn animate__faster overflow-hidden relative" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Warning Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-50 text-rose-600 mb-5 border-4 border-rose-50/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-2 mb-8">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Delete <span className="text-rose-600 truncate max-w-[250px] inline-block align-bottom">"{itemName}"</span>?
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed px-2">
            আপনি কি নিশ্চিত যে আপনি এটি ডিলিট করতে চান? এই কাজটি একবার সম্পন্ন হলে তা আর ফেরানো যাবে না।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-gray-300 font-bold text-sm shadow-sm transition-all"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 font-bold text-sm shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}