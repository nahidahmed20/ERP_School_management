import React from 'react';
import Icon from '@/Components/Icons';
import { usePage } from '@inertiajs/react';

export default function TranscriptShowModal({ item, onClose }) {
  const { auth, global_settings } = usePage().props;

  if (!item) return null;

  // ================= ডায়নামিক ভ্যালু সেটআপ ================= //
  
  // ১. স্কুলের নাম
  const schoolName = item?.campus?.name || auth?.user?.campus?.name || global_settings?.school_name || 'YOUR SCHOOL NAME';

  // ২. স্টুডেন্ট ইনফরমেশন (ডাটা থাকলে সেটা নিবে, না থাকলে ডামি দেখাবে)
  const studentName = item?.student?.name || '[ Student Name ]';
  const studentId = item?.student?.admission_no || item?.student?.student_id || '[ ID Number ]';
  const className = item?.student?.currentEnrollment?.schoolClass?.name || '[ Class Name ]';
  const cgpa = item?.cgpa || '4.67';

  // ৩. রেজাল্ট/মার্কস (ব্যাকএন্ড থেকে results আসলে সেটা নিবে, না হলে ডামি)
  const academicResults = item?.results || [
    { id: 1, subject: 'Advanced Mathematics', marks: 85, grade: 'A+', gpa: '5.00' },
    { id: 2, subject: 'English Literature', marks: 78, grade: 'A', gpa: '4.00' },
    { id: 3, subject: 'Applied Physics', marks: 92, grade: 'A+', gpa: '5.00' },
  ];

  // ========================================================= //

  return (
    // Responsive Overlay - Hidden background on print
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm transition-all print:absolute print:inset-0 print:p-0 print:bg-transparent print:backdrop-blur-none" onClick={onClose}>
      
      {/* Print Specific Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
          ::-webkit-scrollbar { display: none; }
        }
      `}} />

      {/* Responsive Modal Box */}
      <div 
        className="w-full max-w-[850px] bg-slate-100 print:bg-white rounded-2xl print:rounded-none shadow-2xl print:shadow-none flex flex-col max-h-[90vh] print:max-h-max overflow-hidden print:overflow-visible transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (Screen Only) */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 shadow-sm z-10 print:hidden">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Transcript Print Preview</h3>
            <p className="text-xs font-semibold text-indigo-600 mt-0.5">{item.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors bg-slate-50 border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        {/* Modal Body (Scrollable Preview Area) */}
        <div className="p-4 sm:p-8 overflow-y-auto print:overflow-visible flex-1 flex justify-center custom-scrollbar print:p-0 print:block">
          
          {/* A4 Paper Simulation (Official Transcript Look) */}
          <div className="w-full max-w-[210mm] min-h-[297mm] bg-white relative shadow-xl print:shadow-none border border-slate-200 print:border-none flex flex-col font-serif text-slate-900 px-10 py-12 sm:px-14 sm:py-16 mx-auto box-border" style={{ aspectRatio: '1 / 1.414' }}>
            
            {/* Watermark Overlay */}
            {item.watermark_image && (
              <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-10">
                <img src={`/storage/${item.watermark_image}`} alt="Watermark" className="w-[50%] max-w-[300px] object-contain grayscale" />
              </div>
            )}

            {/* Header Section */}
            <div className="w-full text-center border-double border-b-4 border-slate-800 pb-5 mb-8 z-10">
              
              {/* ডায়নামিক স্কুলের নাম */}
              <h2 className="m-0 text-xl font-bold uppercase tracking-widest text-slate-900 print:text-black relative z-20 mb-2">
                {schoolName}
              </h2>
              
              <h1 className="m-0 text-3xl sm:text-4xl font-black uppercase tracking-widest text-slate-900 print:text-black mb-2">{item.title || 'Academic Transcript'}</h1>
              <h3 className="m-0 text-sm sm:text-base text-slate-800 print:text-black font-semibold tracking-wider uppercase">{item.header_text || 'Official Record of Student Progress'}</h3>
            </div>

            {/* Student Info Grid */}
            <div className="w-full grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-8 z-10 font-medium">
              <div className="border-b border-slate-300 pb-1 flex justify-between">
                <span className="font-bold text-slate-700 print:text-black uppercase text-[10px] tracking-wider">Student Name:</span> 
                {/* ডায়নামিক স্টুডেন্ট নাম */}
                <span className="text-slate-900 print:text-black font-bold font-sans">{studentName}</span>
              </div>
              <div className="border-b border-slate-300 pb-1 flex justify-between">
                <span className="font-bold text-slate-700 print:text-black uppercase text-[10px] tracking-wider">Student ID:</span> 
                {/* ডায়নামিক স্টুডেন্ট আইডি */}
                <span className="text-slate-900 print:text-black font-bold font-sans">{studentId}</span>
              </div>
              <div className="border-b border-slate-300 pb-1 flex justify-between">
                <span className="font-bold text-slate-700 print:text-black uppercase text-[10px] tracking-wider">Program / Class:</span> 
                {/* ডায়নামিক ক্লাস */}
                <span className="text-slate-900 print:text-black font-bold font-sans">{className}</span>
              </div>
              <div className="border-b border-slate-300 pb-1 flex justify-between items-center">
                <span className="font-bold text-slate-700 print:text-black uppercase text-[10px] tracking-wider">Grading System:</span> 
                <span className="text-slate-900 print:text-black font-bold bg-slate-100 print:bg-transparent print:border print:border-slate-300 px-2 py-0.5 rounded text-xs">{item.grading_system}</span>
              </div>
            </div>

            {/* Academic Grades Table (ডায়নামিক লুপ) */}
            <div className="flex-1 z-10">
              <table className="w-full border-collapse text-sm mb-2 shadow-sm print:shadow-none">
                <thead>
                  <tr>
                    <th className="border-2 border-slate-800 bg-slate-100 print:bg-slate-50 p-3 text-left text-slate-900 print:text-black font-bold uppercase tracking-wider text-[11px]">Subject / Course Title</th>
                    <th className="border-2 border-slate-800 bg-slate-100 print:bg-slate-50 p-3 text-center text-slate-900 print:text-black font-bold uppercase tracking-wider text-[11px] w-24">Marks</th>
                    <th className="border-2 border-slate-800 bg-slate-100 print:bg-slate-50 p-3 text-center text-slate-900 print:text-black font-bold uppercase tracking-wider text-[11px] w-24">Grade</th>
                    <th className="border-2 border-slate-800 bg-slate-100 print:bg-slate-50 p-3 text-center text-slate-900 print:text-black font-bold uppercase tracking-wider text-[11px] w-24">Grade Point</th>
                  </tr>
                </thead>
                <tbody className="font-sans">
                  {academicResults.map((result) => (
                    <tr key={result.id}>
                      <td className="border border-slate-400 p-2.5 font-semibold text-slate-900 print:text-black">{result.subject}</td>
                      <td className="border border-slate-400 p-2.5 text-center font-mono text-slate-900 print:text-black">{result.marks}</td>
                      <td className="border border-slate-400 p-2.5 text-center font-bold text-slate-900 print:text-black">{result.grade}</td>
                      <td className="border border-slate-400 p-2.5 text-center font-bold font-mono text-slate-900 print:text-black">{result.gpa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* CGPA Summary Box */}
              <div className="w-full flex justify-end mt-4">
                <div className="bg-slate-50 print:bg-transparent border-2 border-slate-800 px-6 py-2 flex items-center gap-6">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-slate-800 print:text-black">Cumulative GPA</span>
                  {/* ডায়নামিক CGPA */}
                  <span className="text-xl font-black font-mono text-slate-900 print:text-black">{cgpa}</span>
                </div>
              </div>
            </div>

            {/* Signatures & Footer */}
            <div className="w-full mt-12 z-10">
              <div className="flex justify-between items-end mb-6 px-4">
                {/* Left Signature */}
                <div className="w-[180px] text-center">
                  <div className="border-t border-slate-800 pt-2 text-[10px] font-bold text-slate-900 print:text-black uppercase tracking-wider">
                    Prepared By
                  </div>
                </div>

                {/* Right Official Signature */}
                <div className="w-[200px] text-center flex flex-col items-center">
                  {item.authorized_signature_image ? (
                    <img src={`/storage/${item.authorized_signature_image}`} alt="Signature" className="h-12 object-contain mb-1 mix-blend-multiply" />
                  ) : (
                    <div className="h-12 mb-1"></div>
                  )}
                  <div className="border-t border-slate-800 pt-2 text-[10px] font-bold text-slate-900 print:text-black w-full uppercase tracking-wider">
                    {item.authorized_signature_title || 'Authorized Signature'}
                  </div>
                </div>
              </div>

              {/* Footer text */}
              <div className="w-full text-center text-[10px] text-slate-600 print:text-black border-t border-dashed border-slate-400 pt-3 font-semibold tracking-wide font-sans">
                {item.footer_text || 'This academic transcript is invalid without the official institution seal and signature.'}
              </div>
            </div>

          </div>
        </div>

        {/* Modal Action Footer (Screen Only) */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 z-10 shadow-sm print:hidden">
          <button type="button" className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-all shadow-sm active:scale-95" onClick={onClose}>
            Close
          </button>
          <button type="button" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md active:scale-95" onClick={() => window.print()}>
            <Icon name="printer" className="w-4 h-4" /> Print Document
          </button>
        </div>
      </div>
    </div>
  );
}