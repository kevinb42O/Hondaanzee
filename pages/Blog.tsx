import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Calendar, Clock, Leaf, Shield, Trees, Droplets, Brain } from 'lucide-react';
import { useSEO, SEO_DATA } from '../utils/seo.ts';
import { blogPosts } from '../data/blogs.ts';
import Breadcrumb from '../components/Breadcrumb.tsx';

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
  useSEO(SEO_DATA.blog);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Sort posts by date descending (newest first)
  const sortedPosts = [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const heroPost = sortedPosts[0];
  const gridPosts = sortedPosts.slice(1);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Breadcrumb
          className="mb-8"
          items={[
            { label: 'Home', to: '/' },
            { label: 'Blog' },
          ]}
        />

        {/* Header section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-end justify-between mb-12 border-b border-slate-200 pb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-sm font-bold tracking-wide uppercase mb-4 shadow-sm">
              <BookOpen size={14} /> Journal
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
              Nieuwste <span className="text-sky-600">Verhalen</span>
            </h1>
          </div>
          <p className="hidden md:block text-lg text-slate-500 max-w-sm text-right leading-relaxed font-medium">
            Diepgaande artikels, inzichten en tips over het kustleven met je viervoeter.
          </p>
        </motion.div>

        {/* Hero Post */}
        {heroPost && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <Link 
              to={`/blog/${heroPost.slug}`}
              className="group relative flex flex-col lg:flex-row bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl overflow-hidden transition-all duration-500 border border-slate-100"
            >
              {heroPost.image && (
                <div className="lg:w-[60%] relative overflow-hidden min-h-[400px] lg:min-h-[500px]">
                  <img
                    src={heroPost.image}
                    alt={heroPost.imageAlt || heroPost.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-slate-900/10 lg:to-slate-900/80" />
                </div>
              )}
              
              <div className="lg:w-[40%] flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative bg-white lg:bg-transparent lg:absolute lg:right-0 lg:inset-y-0 lg:max-w-xl z-10 lg:backdrop-blur-md lg:bg-white/90 border-l border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${categoryStyles[heroPost.categoryColor]}`}>
                    {categoryIcons[heroPost.categoryColor]}
                    {heroPost.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                    <Calendar size={14} />
                    {formatDate(heroPost.date)}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4 leading-[1.1] tracking-tight group-hover:text-sky-600 transition-colors duration-300">
                  {heroPost.title}
                </h2>
                
                <p className="text-lg text-slate-600 font-medium mb-6 italic">
                  {heroPost.subtitle}
                </p>

                <p className="text-slate-600 leading-relaxed mb-8 line-clamp-3 text-lg">
                  {heroPost.excerpt}
                </p>

                <div className="mt-auto flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-400">
                    <Clock size={16} />
                    {heroPost.readTime}
                  </span>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 text-white group-hover:bg-sky-600 transition-colors duration-300 shadow-md group-hover:shadow-sky-600/30">
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Grid Posts */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {gridPosts.map((post) => (
            <motion.div key={post.slug} variants={itemVariants}>
              <Link
                to={`/blog/${post.slug}`}
                className="group flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 hover:-translate-y-1"
              >
                {post.image && (
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.imageAlt || post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm backdrop-blur-md bg-white/90 ${categoryStyles[post.categoryColor].replace('bg-', 'bg-opacity-0 text-')}`}>
                         {categoryIcons[post.categoryColor]}
                         {post.category}
                       </span>
                    </div>
                  </div>
                )}

                <div className="p-6 sm:p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-sm text-slate-400 font-semibold mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatDate(post.date)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-3 leading-tight group-hover:text-sky-600 transition-colors duration-300 line-clamp-3">
                    {post.title}
                  </h3>

                  <p className="text-slate-600 leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto flex items-center text-sky-600 font-bold group-hover:gap-2 transition-all duration-300">
                    <span>Lees artikel</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300 ml-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
};

export default Blog;

