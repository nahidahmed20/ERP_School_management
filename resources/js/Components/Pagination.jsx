import { Link } from '@inertiajs/react';

export default function Pagination({ meta }) {
  if (!meta || !meta.links || meta.links.length <= 3) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      
      <div className="text-sm text-slate-500">
        Showing <span className="font-bold text-slate-900">{meta.from ?? 0}</span> to{' '}
        <span className="font-bold text-slate-900">{meta.to ?? 0}</span> of{' '}
        <span className="font-bold text-slate-900">{meta.total}</span> entries
      </div>

      <nav className="inline-flex items-center justify-center gap-1.5" aria-label="Pagination">
        {meta.links.map((link, index) => {
          const isPrevious = link.label.includes('Previous');
          const isNext = link.label.includes('Next');

          const isDisabled = link.url === null;

          const renderContent = () => {
            if (isPrevious) {
              return (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              );
            }
            if (isNext) {
              return (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              );
            }
            return <span dangerouslySetInnerHTML={{ __html: link.label }} />;
          };

          if (isDisabled) {
            return (
              <span
                key={index}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold text-slate-300 bg-slate-50 cursor-not-allowed border border-transparent"
              >
                {renderContent()}
              </span>
            );
          }

          return (
            <Link
              key={index}
              href={link.url}
              preserveScroll
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                link.active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' // Active Page Design
                  : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600 border border-transparent' // Normal Page Design
              }`}
            >
              {renderContent()}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}