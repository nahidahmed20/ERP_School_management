import { Head, Link } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';

const imageUrl = (path) => path ? (path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`) : null;
const excerpt = (content = '') => content.replace(/<[^>]*>/g, '').slice(0, 145);

export default function Blogs({ articles = {} }) {
    const records = articles.data || [];
    return <SiteLayout activePage="blog"><Head title="News & Blog" />
        <section className="sf-page-hero"><div className="sf-shell"><span>Stories and updates</span><h1>News from our learning community.</h1><p>Campus stories, student achievements, announcements and ideas from our educators.</p></div></section>
        <section className="sf-section"><div className="sf-shell">{records.length ? <div className="sf-blog-grid">{records.map((article) => <article key={article.id}>{imageUrl(article.featured_image) ? <img src={imageUrl(article.featured_image)} alt="" /> : <div className="sf-blog-placeholder">{article.content_type}</div>}<div><small>{article.campus?.name || 'All campuses'} · {new Date(article.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</small><h2>{article.title}</h2><p>{excerpt(article.content_body)}{article.content_body?.length > 145 ? '…' : ''}</p><Link href={route('site.blog.show', article.slug)}>Read story &rarr;</Link></div></article>)}</div> : <div className="sf-empty"><h2>No stories published yet.</h2><p>Create a published Blog, News or Article from the CMS module and it will appear here automatically.</p></div>}
            {articles.links?.length > 3 && <nav className="sf-pagination">{articles.links.map((link, index) => <Link key={index} href={link.url || '#'} className={`${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>}
        </div></section>
    </SiteLayout>;
}
