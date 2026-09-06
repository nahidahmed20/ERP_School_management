import { Head, Link } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';

const imageUrl = (path) => path ? (path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`) : null;

export default function BlogShow({ article }) {
    return <SiteLayout activePage="blog"><Head title={article.title} />
        <section className="sf-page-hero sf-article-hero"><div className="sf-shell"><span>{article.content_type} · {article.campus?.name || 'All campuses'}</span><h1>{article.title}</h1><p>{new Date(article.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p></div></section>
        <article className="sf-article sf-shell">{imageUrl(article.featured_image) && <img src={imageUrl(article.featured_image)} alt="" />}<div className="sf-article-body">{article.content_body}</div><Link href={route('site.blogs')}>&larr; Back to all stories</Link></article>
    </SiteLayout>;
}
