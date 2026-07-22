import { useEffect } from 'react';

export default function ConfirmDeleteModal({ item, onCancel, onConfirm }) {
  const itemName = item?.name || item?.label || item?.title || 'এই আইটেমটি';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50  transition-opacity p-4 animate__animated animate__fadeIn animate__faster" 
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-sm sm:max-w-md w-full p-8 text-center transform transition-all animate__animated animate__fadeInDown animate__faster relative" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* SweetAlert Warning Icon */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full border-[3px] border-rose-200 text-rose-500 mb-5 relative">
          <span className="absolute w-[6px] h-8 bg-rose-500 rounded-full top-4"></span>
          <span className="absolute w-[7px] h-[7px] bg-rose-500 rounded-full bottom-3"></span>
        </div>

        {/* Title & Description */}
        <h3 className="text-[#1e293b] font-[800] text-[1.5rem] mb-2 tracking-tight">
          Are you sure?
        </h3>
        
        <p className="text-[#64748b] text-[0.95rem] leading-relaxed mb-8 px-2">
          আপনি কি নিশ্চিত যে আপনি <span className="font-bold text-slate-800">"{itemName}"</span> ডিলিট করতে চান?
          <br />
          <strong className="text-rose-500 mt-1.5 inline-block">This action cannot be undone.</strong>
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button 
            type="button" 
            onClick={onConfirm}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl shadow-lg shadow-rose-200 transition-all font-semibold text-sm flex items-center gap-2"
          >
            Yes, Delete
          </button>
          
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-semibold text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}