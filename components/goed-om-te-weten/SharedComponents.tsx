import React, { useState } from 'react';
import { ChevronDown, CircleAlert, CheckCircle2 } from 'lucide-react';

/* ─── Types ─── */
export interface AccordionItemProps {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  badge?: string;
  badgeColor?: string;
}

export interface KeyTakeawayProps {
  items: string[];
  variant?: 'danger' | 'warning' | 'info';
}

export interface FAQItemProps {
  question: string;
  answer: string;
}

/* ─── Reusable Components ─── */

export const KeyTakeaway: React.FC<KeyTakeawayProps> = ({ items, variant = 'danger' }) => {
  const styles = {
    danger: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    info: 'bg-sky-50 border-sky-200 text-sky-900',
  };
  const iconStyles = {
    danger: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-sky-500',
  };

  return (
    <div className={`rounded-2xl border-2 p-5 sm:p-6 ${styles[variant]} mt-6`}>
      <div className="flex items-center gap-2 mb-3">
        <CircleAlert size={18} className={iconStyles[variant]} strokeWidth={2.5} />
        <span className="text-xs font-black uppercase tracking-[0.15em]">Samenvatting — Onthoud dit</span>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={`takeaway-${item.substring(0, 20)}`} className="flex items-start gap-2.5 text-sm leading-relaxed font-medium">
            <CheckCircle2 size={16} className={`${iconStyles[variant]} mt-0.5 shrink-0`} strokeWidth={2.5} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const AccordionItem: React.FC<AccordionItemProps> = ({
  id, icon, iconBg, title, subtitle, children, isOpen, onToggle, badge, badgeColor
}) => (
  <article
    id={id}
    className={`rounded-3xl border-2 transition-all duration-300 overflow-hidden ${isOpen ? 'border-sky-200 shadow-xl shadow-sky-100/50 bg-white' : 'border-slate-100 shadow-md bg-white hover:border-sky-100 hover:shadow-lg'
      }`}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-4 p-5 sm:p-7 text-left group"
      id={`btn-${id}`}
      aria-expanded={isOpen}
      aria-controls={`content-${id}`}
    >
      <div className={`shrink-0 p-3 sm:p-4 rounded-2xl ${iconBg} transition-transform duration-300 ${isOpen ? 'scale-110' : 'group-hover:scale-105'}`}>
        {icon}
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{title}</h2>
          {badge && (
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${badgeColor || 'bg-red-100 text-red-700'}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-slate-500 text-sm mt-1 line-clamp-1">{subtitle}</p>
      </div>
      <div className={`shrink-0 p-2 rounded-xl transition-all duration-300 ${isOpen ? 'bg-sky-100 text-sky-600 rotate-180' : 'bg-slate-100 text-slate-400'}`}>
        <ChevronDown size={20} />
      </div>
    </button>
    <section
      id={`content-${id}`}
      aria-labelledby={`btn-${id}`}
      hidden={!isOpen}
      className={`transition-all duration-300 ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}
    >
      <div className="px-5 sm:px-7 pb-7 border-t border-slate-100 pt-6">
        {children}
      </div>
    </section>
  </article>
);

export const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 sm:py-5 text-left group"
        aria-expanded={open}
      >
        <span className="text-sm sm:text-base font-bold text-slate-800 pr-4 group-hover:text-sky-700 transition-colors" itemProp="name">{question}</span>
        <div className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown size={18} className="text-slate-400" />
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-[500px] pb-5' : 'max-h-0'}`}
        itemScope
        itemProp="acceptedAnswer"
        itemType="https://schema.org/Answer"
      >
        <p className="text-sm text-slate-600 leading-relaxed" itemProp="text">{answer}</p>
      </div>
    </div>
  );
};

export const SectionHeading: React.FC<{ icon: React.ReactNode; title: string; description?: string }> = ({ icon, title, description }) => (
  <div className="flex items-start gap-3 sm:gap-4 mb-5">
    <div className="shrink-0 mt-0.5">{icon}</div>
    <div>
      <h3 className="text-base sm:text-lg font-black text-slate-900">{title}</h3>
      {description && <p className="text-slate-500 text-sm mt-1">{description}</p>}
    </div>
  </div>
);

export const StepCard: React.FC<{ step: number; title: string; description: string; variant?: string }> = ({ step, title, description, variant }) => {
  const getBgClass = () => {
    if (variant === 'danger') return 'bg-red-50';
    if (variant === 'warning') return 'bg-amber-50';
    return 'bg-sky-50';
  };
  const getStepBgClass = () => {
    if (variant === 'danger') return 'bg-red-500';
    if (variant === 'warning') return 'bg-amber-500';
    return 'bg-sky-500';
  };
  return (
    <div className={`flex gap-4 items-start p-4 rounded-2xl ${getBgClass()}`}>
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white ${getStepBgClass()}`}>
      {step}
    </div>
    <div>
      <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
      <p className="text-slate-600 text-sm mt-1 leading-relaxed">{description}</p>
    </div>
  </div>
  );
};
