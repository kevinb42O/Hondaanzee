import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Calendar, Clock, Leaf, Shield, Trees, Droplets, Brain, Star } from 'lucide-react';
import { useSEO } from '../utils/seo.ts';
import { blogPosts } from '../data/blogs.ts';

const categoryIcons: Record<string, React.ReactNode> = {
  'emerald': <Shield size={16} className="text-emerald-600" />,
  'sky': <Leaf size={16} className="text-sky-600" />,
  'green': <Trees size={16} className="text-green-600" />,
  'amber': <Droplets size={16} className="text-amber-600" />,
  'blue': <Brain size={16} className="text-blue-600" />,
};

const categoryStyles: Record<string, string> = {
  'emerald': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'sky': 'bg-sky-50 text-sky-700 border-sky-200',
  'green': 'bg-green-50 text-green-700 border-green-200',
  'amber': 'bg-amber-50 text-amber-700 border-amber-200',
  'blue': 'bg-blue-50 text-blue-700 border-blue-200',
};

const Blog: React.FC = () => {
  useSEO({
    title: 'Blog | HondAanZee.be — Tips, Natuur & Nieuws over Honden aan de Belgische Kust',
    description: 'Lees onze blogs over honden aan de Belgische kust: van zeehonden op het strand tot opruimacties. Nuttige info, tips en achtergronden voor elke hondenbezitter.',
    keywords: 'blog hondaanzee, zeehonden belgische kust hond, opruimacties strand, proper strand lopers, hond aan zee blog, natuur belgische kust',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "HondAanZee Blog",
      "url": "https://hondaanzee.be/blog",
      "description": "Blog over honden aan de Belgische kust: natuur, veiligheid en duurzaamheid",
      "publisher": {
        "@type": "Organization",
        "name": "HondAanZee.be",
        "url": "https://hondaanzee.be"
      }
    }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-sky-50 to-slate-50">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-sky-100 text-sky-600 rounded-2xl mb-6 shadow-sm">
            <BookOpen size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Onze{' '}
            <span className="text-sky-600 relative inline-block">
              Blog
              <svg className="absolute -bottom-1 sm:-bottom-2 md:-bottom-3 left-0 w-full h-3 sm:h-4 text-sky-600/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" />
              </svg>
            </span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Achtergronden, tips en verhalen over het leven met je hond aan de Belgische kust
          </p>
        </div>

        {/* Featured Blog Post */}
        {blogPosts.filter(p => p.featured).map((post) => (
          <div key={post.slug} className="mb-12">
            <Link
              to={`/blog/${post.slug}`}
              className="group relative block bg-white rounded-3xl shadow-xl hover:shadow-2xl border-2 border-amber-200 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-amber-300"
            >
              {/* Animated gold accent bar */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 rounded-l-3xl z-10" />

              {/* Subtle gold shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-yellow-50/20 group-hover:from-amber-50/60 group-hover:to-yellow-50/40 transition-all duration-500 rounded-3xl pointer-events-none" />

              {/* Aanrader badge */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-black rounded-full shadow-lg shadow-amber-200/50 animate-pulse">
                <Star size={14} fill="currentColor" />
                Aanrader
              </div>

              <div className="flex flex-col md:flex-row">
                {/* Hero image — larger for featured */}
                {post.image && (
                  <div className="relative w-full md:w-1/2 h-56 md:h-auto md:min-h-[320px] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.imageAlt || post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 md:bg-gradient-to-r md:from-transparent md:to-white/30" />
                  </div>
                )}

                {/* Content */}
                <div className="relative p-6 sm:p-8 md:p-10 flex flex-col justify-center md:w-1/2">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-transform duration-300 group-hover:scale-105 ${categoryStyles[post.categoryColor]}`}>
                      {categoryIcons[post.categoryColor]}
                      {post.category}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 leading-tight group-hover:text-amber-600 transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-base text-amber-700/70 font-semibold mb-3 italic">
                    {post.subtitle}
                  </p>

                  <p className="text-slate-600 leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {formatDate(post.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {post.readTime}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-amber-600 font-bold text-sm group-hover:gap-2.5 transition-all duration-300">
                      Lees meer
                      <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogPosts.filter(p => !p.featured).map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-slate-100 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-sky-200"
            >
              {/* Animated accent bar */}
              <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-gradient-to-b from-sky-400 to-blue-500 transition-all duration-500 rounded-l-3xl" />

              {/* Subtle shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-50/0 to-blue-50/0 group-hover:from-sky-50/50 group-hover:to-blue-50/30 transition-all duration-500 rounded-3xl pointer-events-none" />

              {/* Hero image */}
              {post.image && (
                <div className="relative w-full h-48 sm:h-56 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.imageAlt || post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                </div>
              )}

              {/* Category & Meta Header */}
              <div className="relative p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-transform duration-300 group-hover:scale-105 ${categoryStyles[post.categoryColor]}`}>
                    {categoryIcons[post.categoryColor]}
                    {post.category}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 leading-tight group-hover:text-sky-600 transition-colors">
                  {post.title}
                </h2>

                <p className="text-slate-600 leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatDate(post.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {post.readTime}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-sky-600 font-bold text-sm group-hover:gap-2.5 transition-all duration-300">
                    Lees meer
                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-3xl p-8 sm:p-12 border border-sky-100">
            <h3 className="text-2xl font-black text-slate-900 mb-3">Meer artikels volgen binnenkort!</h3>
            <p className="text-slate-600 max-w-lg mx-auto">
              We werken continu aan nieuwe, informatieve blogs over het leven met je hond aan de Belgische kust. Hou deze pagina in de gaten!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
