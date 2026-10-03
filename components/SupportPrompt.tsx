import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { trackSupportAction } from '../utils/supportAnalytics.ts';

export default function SupportPrompt({ cityName }: { cityName: string }) {
  return <aside aria-label="Help de gids onderhouden">
    <p className="city-eyebrow"><Heart size={15} aria-hidden="true" />Help de gids onderhouden</p>
    <h2 className="city-small-title">Geholpen met je uitstap naar {cityName}?</h2>
    <p className="city-body-copy">Met een bijdrage help je me HondAanZee te blijven bijhouden, zodat jij en je hond met een gerust hart op pad kunnen.</p>
    <Link to="/steun-ons" onClick={() => trackSupportAction('steunvraag')} className="city-text-link">
      Help de gids bijhouden <ArrowRight size={16} aria-hidden="true" />
    </Link>
  </aside>;
}
