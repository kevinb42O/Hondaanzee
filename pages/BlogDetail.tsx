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
    ogImage: post?.ogImage ? `https://hondaanzee.be${post.ogImage}` : post?.image ? `https://hondaanzee.be${post.image}` : undefined,
    ogType: 'article',
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
        ...(post.ogImage ? { "image": { "@type": "ImageObject", "url": `https://hondaanzee.be${post.ogImage}`, "width": 1200, "height": 630 } } : post.image ? { "image": { "@type": "ImageObject", "url": `https://hondaanzee.be${post.image}`, "width": 1200, "height": 800 } } : {}),
        "publisher": {
          "@type": "Organization",
          "name": "HondAanZee.be",
          "url": "https://hondaanzee.be",
          "logo": {
            "@type": "ImageObject",
            "url": "https://hondaanzee.be/og-imagefinal.webp"
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
      case 'paragraph': {
        if (section.links && section.links.length > 0 && section.text) {
          const parts: React.ReactNode[] = [];
          let remaining = section.text;
          section.links.forEach((link) => {
            const idx = remaining.indexOf(link.text);
            if (idx !== -1) {
              if (idx > 0) parts.push(remaining.slice(0, idx));
              parts.push(
                <a key={link.text} href={link.url} className="text-blue-600 hover:text-blue-800 underline font-medium" target="_blank" rel="noopener noreferrer">{link.text}</a>
              );
              remaining = remaining.slice(idx + link.text.length);
            }
          });
          if (remaining) parts.push(remaining);
          return (
            <p key={index} className="text-slate-700 leading-relaxed mb-4 text-lg">
              {parts}
            </p>
          );
        }
        return (
          <p key={index} className="text-slate-700 leading-relaxed mb-4 text-lg">
            {section.text}
          </p>
        );
      }
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
      case 'cta-callout':
        return (
          <div key={index} className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Info size={20} className="text-sky-600" />
              <span className="font-black text-sky-800">{section.title}</span>
            </div>
            <p className="text-sky-900/80 leading-relaxed mb-6">{section.text}</p>
            <div className="text-center">
              <a
                href={section.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-blue-700 transition-all duration-200 text-lg"
              >
                {section.ctaText}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
              <div className="mt-4 flex flex-col items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500 animate-bounce">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
                <a
                  href={section.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-sky-600 hover:text-sky-700 underline decoration-dotted font-medium"
                >
                  {section.url}
                </a>
              </div>
            </div>
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
          <div key={index} className="text-center my-8">
            <a
              href={section.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-blue-700 transition-all duration-200 text-lg"
            >
              {section.text}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            <div className="mt-4 flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500 animate-bounce">
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
              <a
                href={section.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-sky-600 hover:text-sky-700 underline decoration-dotted font-medium"
              >
                {section.url}
              </a>
            </div>
          </div>
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
      case 'spotify': {
        const spotifyMatch = section.url ? /episode\/([a-zA-Z0-9]+)/.exec(section.url) : undefined;
        const episodeId = spotifyMatch?.[1];
        return episodeId ? (
          <div key={index} className="my-10">
            {section.title && (
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#1DB954] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                {section.title}
              </h3>
            )}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <iframe
                src={`https://open.spotify.com/embed/episode/${episodeId}?utm_source=generator&theme=0`}
                width="100%"
                height="352"
                style={{ border: 0 }}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title={section.title || 'Spotify podcast'}
                className="rounded-2xl"
              />
            </div>
          </div>
        ) : null;
      }
      case 'social': {
        return (
          <div key={index} className="my-10 bg-gradient-to-br from-slate-50 to-sky-50 border-2 border-slate-200 rounded-2xl p-6 sm:p-8">
            {section.title && (
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 text-center">{section.title}</h3>
            )}
            {section.text && (
              <p className="text-slate-600 text-center mb-6 leading-relaxed">{section.text}</p>
            )}
            <div className="flex flex-wrap justify-center gap-4">
              {section.socialLinks?.map((link) => {
                const isInstagram = link.platform === 'instagram';
                const isFacebook = link.platform === 'facebook';
                const bgClass = isInstagram
                  ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500'
                  : isFacebook
                  ? 'bg-[#1877F2] hover:bg-[#166FE5]'
                  : 'bg-slate-700 hover:bg-slate-800';
                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 ${bgClass}`}
                  >
                    {isInstagram && (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    )}
                    {isFacebook && (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    )}
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>
        );
      }
      case 'image':
        return (
          <figure key={index} className="my-8">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src={section.imageSrc}
                alt={section.imageAlt || ''}
                className="w-full h-auto object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            {section.text && (
              <figcaption className="text-center text-sm text-slate-500 mt-3 italic">
                {section.text}
              </figcaption>
            )}
          </figure>
        );
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
                  width={1200}
                  height={630}
                  decoding="async"
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
