import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { trackSupportAction } from '../utils/supportAnalytics.ts';

export default function SupportPrompt({ cityName }: { cityName: string }) {
  return <aside aria-label="Help de gids onderhouden" className="mx-auto mt-6 max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
    <div className="flex items-start gap-3">
      <Heart size={18} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900">Geholpen met je uitstap naar {cityName}?</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">Ik ben Kevin en ik houd deze gids bij. Met een vrijwillige bijdrage help je me de info gratis en actueel te houden.</p>
        <Link to="/steun-ons" onClick={() => trackSupportAction('steunvraag')}
          className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-sky-700 hover:underline">
          Help de gids bijhouden <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  </aside>;
}
