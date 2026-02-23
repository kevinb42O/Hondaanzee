import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Calendar, Clock, BookOpen,
  Lightbulb, AlertTriangle, Quote, Info,
  Share2, ChevronRight
} from 'lucide-react';
import { useSEO } from '../utils/seo.ts';
import { blogPosts, BlogSection } from '../data/blogs.ts';

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug);

  useSEO({
    title: post ? `${post.title} | HondAanZee.be Blog` : 'Blog niet gevonden | HondAanZee.be',
    description: post?.excerpt || 'Dit blogartikel werd niet gevonden.',
    keywords: post ? `${post.category}, ${post.slug.split('-').join(', ')}, hondaanzee blog, belgische kust hond, hond aan zee` : '',
    ogImage: post?.image ? `https://hondaanzee.be${post.image}` : undefined,
    canonical: post ? `https://hondaanzee.be/blog/${post.slug}` : undefined,
    structuredData: post ? [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "datePublished": post.date,
        "dateModified": post.date,
        "url": `https://hondaanzee.be/blog/${post.slug}`,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://hondaanzee.be/blog/${post.slug}`
        },
        ...(post.image ? { "image": { "@type": "ImageObject", "url": `https://hondaanzee.be${post.image}`, "width": 1200, "height": 800 } } : {}),
        "publisher": {
          "@type": "Organization",
          "name": "HondAanZee.be",
          "url": "https://hondaanzee.be",
          "logo": {
            "@type": "ImageObject",
            "url": "https://hondaanzee.be/og-image.jpg"
          }
        },
        "author": {
          "@type": "Organization",
          "name": "HondAanZee.be"
        },
        "wordCount": post.content.reduce((acc, s) => acc + (s.text?.split(' ').length || 0) + (s.items?.join(' ').split(' ').length || 0), 0),
        "articleSection": post.category,
        "inLanguage": "nl-BE"
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://hondaanzee.be/blog" },
          { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://hondaanzee.be/blog/${post.slug}` }
        ]
      }
    ] : undefined
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleShare = async () => {
    const url = `https://hondaanzee.be/blog/${post.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url });
      } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch { /* clipboard access denied */ }
    }
  };

  const otherPosts = blogPosts.filter(p => p.slug !== slug);

  const renderSection = (section: BlogSection, index: number) => {
    switch (section.type) {
      case 'heading':
        return (
          <h2 key={index} className="text-2xl sm:text-3xl font-black text-slate-900 mt-10 mb-4 leading-tight">
            {section.text}
          </h2>
        );
      case 'subheading':
        return (
          <h3 key={index} className="text-xl sm:text-2xl font-bold text-slate-800 mt-8 mb-3 leading-tight">
            {section.text}
          </h3>
        );
      case 'paragraph':
        return (
          <p key={index} className="text-slate-700 leading-relaxed mb-4 text-lg">
            {section.text}
          </p>
        );
      case 'list':
        return (
          <ul key={index} className="space-y-2.5 mb-6 ml-1">
            {section.items?.map((item) => (
              <li key={item.slice(0, 40)} className="flex items-start gap-3 text-slate-700 text-lg leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 bg-sky-500 rounded-full shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
      case 'tip':
        return (
          <div key={index} className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={20} className="text-emerald-600" />
              <span className="font-black text-emerald-800">{section.title}</span>
            </div>
            <p className="text-emerald-900/80 leading-relaxed">{section.text}</p>
          </div>
        );
      case 'warning':
        return (
          <div key={index} className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-amber-600" />
              <span className="font-black text-amber-800">{section.title}</span>
            </div>
            <p className="text-amber-900/80 leading-relaxed">{section.text}</p>
          </div>
        );
      case 'callout':
        return (
          <div key={index} className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Info size={20} className="text-sky-600" />
              <span className="font-black text-sky-800">{section.title}</span>
            </div>
            <p className="text-sky-900/80 leading-relaxed">{section.text}</p>
          </div>
        );
      case 'quote':
        return (
          <blockquote key={index} className="border-l-4 border-sky-400 pl-6 py-2 my-8 bg-sky-50/50 rounded-r-xl pr-6">
            <div className="flex gap-3">
              <Quote size={24} className="text-sky-400 shrink-0 mt-1" />
              <p className="text-slate-700 italic text-lg leading-relaxed">{section.text}</p>
            </div>
          </blockquote>
        );
      case 'cta':
        return (
          <a
            key={index}
            href={section.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-blue-700 transition-all duration-200 mb-6 text-lg"
          >
            {section.text}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        );
      case 'youtube': {
        const videoId = section.url ? /(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/.exec(section.url)?.[1] : undefined;
        return videoId ? (
          <div key={index} className="my-10">
            {section.title && (
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-red-500 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                {section.title}
              </h3>
            )}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={section.title || 'YouTube video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        ) : null;
      }
      default:
        return null;
    }
  };

  const categoryStyles: Record<string, string> = {
    'emerald': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'sky': 'bg-sky-50 text-sky-700 border-sky-200',
    'green': 'bg-green-50 text-green-700 border-green-200',
    'amber': 'bg-amber-50 text-amber-700 border-amber-200',
    'blue': 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-sky-50 to-slate-50">
      <div className="max-w-3xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
          <Link to="/" className="hover:text-sky-600 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/blog" className="hover:text-sky-600 transition-colors">Blog</Link>
          <ChevronRight size={14} />
          <span className="text-slate-600 font-medium truncate">{post.title}</span>
        </nav>

        {/* Back link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sky-600 font-bold hover:text-sky-700 mb-8 group transition-colors"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Terug naar alle blogs
        </Link>

        {/* Article Header */}
        <article>
          <header className="mb-10">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-4 ${categoryStyles[post.categoryColor]}`}>
              {post.category}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight tracking-tight">
              {post.title}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed mb-6">
              {post.subtitle}
            </p>

            {/* Hero image */}
            {post.image && (
              <div className="relative w-full rounded-2xl overflow-hidden mb-6 shadow-lg">
                <img
                  src={post.image}
                  alt={post.imageAlt || post.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 pb-6 border-b border-slate-200">
              <span className="flex items-center gap-1.5">
                <Calendar size={15} />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={15} />
                {post.readTime} leestijd
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-sky-600 hover:text-sky-700 font-semibold transition-colors ml-auto"
              >
                <Share2 size={15} />
                Delen
              </button>
            </div>
          </header>

          {/* Article Content */}
          <div className="prose-custom">
            {post.content.map((section, index) => renderSection(section, index))}
          </div>
        </article>

        {/* Other Posts */}
        {otherPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200">
            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <BookOpen size={24} className="text-sky-600" />
              Lees ook
            </h3>
            <div className="space-y-4">
              {otherPosts.map(otherPost => (
                <Link
                  key={otherPost.slug}
                  to={`/blog/${otherPost.slug}`}
                  className="group relative block bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-100 hover:border-sky-200 p-6 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden"
                >
                  {/* Animated accent bar */}
                  <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-gradient-to-b from-sky-400 to-blue-500 transition-all duration-500 rounded-l-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-50/0 to-blue-50/0 group-hover:from-sky-50/40 group-hover:to-blue-50/20 transition-all duration-500 rounded-2xl pointer-events-none" />
                  <span className={`relative inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-3 transition-transform duration-300 group-hover:scale-105 ${categoryStyles[otherPost.categoryColor]}`}>
                    {otherPost.category}
                  </span>
                  <h4 className="relative text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors duration-300 mb-2">
                    {otherPost.title}
                  </h4>
                  <p className="relative text-sm text-slate-500 line-clamp-2">{otherPost.excerpt}</p>
                  <div className="relative flex items-center gap-1 mt-3 text-sky-600 font-bold text-sm group-hover:gap-2.5 transition-all duration-300">
                    Lees meer
                    <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;
