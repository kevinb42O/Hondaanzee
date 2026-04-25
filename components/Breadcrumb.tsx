import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  /** Omit `to` for the current page (rendered as plain text with aria-current). */
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Use `light` over dark hero backgrounds. */
  variant?: 'default' | 'light';
  className?: string;
}

/**
 * Accessible breadcrumb trail.
 * - Renders a semantic <nav aria-label="Kruimelpad"><ol> structure.
 * - Last item has aria-current="page" and is not a link.
 * - Truncates the last (current) crumb with ellipsis on narrow screens
 *   while keeping the full text available to assistive tech.
 *
 * The matching JSON-LD BreadcrumbList is emitted separately via utils/seo.ts.
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, variant = 'default', className = '' }) => {
  if (items.length === 0) return null;

  const isLight = variant === 'light';
  const linkClass = isLight
    ? 'text-slate-200 hover:text-white transition-colors font-semibold'
    : 'text-sky-600 hover:text-sky-700 transition-colors font-semibold';
  const currentClass = isLight ? 'text-white font-bold' : 'text-slate-700 font-bold';
  const separatorClass = isLight ? 'text-white/50' : 'text-slate-300';

  return (
    <nav
      aria-label="Kruimelpad"
      className={`text-xs sm:text-sm min-w-0 ${className}`}
    >
      <ol className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-1.5 sm:gap-2 min-w-0"
            >
              {item.to && !isLast ? (
                <Link to={item.to} className={`${linkClass} truncate max-w-[10rem] sm:max-w-none`}>
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`${currentClass} truncate max-w-[14rem] sm:max-w-none`}
                  aria-current={isLast ? 'page' : undefined}
                  title={item.label}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight size={14} className={`shrink-0 ${separatorClass}`} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
