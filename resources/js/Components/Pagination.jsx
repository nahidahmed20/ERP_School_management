import { Link } from '@inertiajs/react';

export default function Pagination({ meta }) {
  if (!meta.links || meta.last_page <= 1) return null;

  return (
    <div className="mm-pagination">
      <span className="mm-pagination-info">
        {meta.from}–{meta.to} of {meta.total} items
      </span>
      <div className="mm-pagination-links">
        {meta.links.map((link, i) => (
          <Link
            key={i}
            href={link.url || '#'}
            preserveState
            className={`mm-page-link ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        ))}
      </div>
    </div>
  );
}
