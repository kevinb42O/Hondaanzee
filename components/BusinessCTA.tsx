import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const BusinessCTA: React.FC = () => (
  <section id="business" className="city-business scroll-mt-28" aria-labelledby="city-business-title">
    <div className="city-shell city-business-inner">
      <div>
        <h2 id="city-business-title" className="city-small-title">Een hondvriendelijke zaak aan de kust?</h2>
        <p className="city-body-copy">Meld je gratis aan en help hondeneigenaars jouw zaak te ontdekken.</p>
      </div>
      <Link to="/zaak-aanmelden" className="city-button">Meer over aanmelden <ArrowRight size={17} aria-hidden="true" /></Link>
    </div>
  </section>
);

export default BusinessCTA;
