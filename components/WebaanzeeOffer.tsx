import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, Mail, MessageCircle } from 'lucide-react';
import { trackWebaanzeeAction, webaanzeeUrl, type WebaanzeeSource } from '../utils/webaanzeeAnalytics.ts';
import './WebaanzeeOffer.css';

const message = `Hallo, ik kom via HondAanZee en wil graag een gratis websitecheck met drie concrete verbeterpunten voor mijn zaak.

Naam zaak:
Website:
Waar ik tegenaan loop:
`;
const mailUrl = `mailto:kevin@webaanzee.be?subject=${encodeURIComponent('Gratis websitecheck via HondAanZee')}&body=${encodeURIComponent(message)}`;
const whatsappUrl = `https://wa.me/32494816714?text=${encodeURIComponent(message)}`;

const WebaanzeeOffer: React.FC<{ source: Exclude<WebaanzeeSource, 'footer'> }> = ({ source }) => {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        trackWebaanzeeAction(source, 'bekeken');
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [source]);

  return (
    <section ref={sectionRef} id="websitecheck" className="webaanzee-offer" aria-labelledby="websitecheck-title">
      <div className="webaanzee-offer__layout">
        <div className="webaanzee-offer__intro">
          <h2 id="websitecheck-title">Ook een website die<br /><em>jouw zaak vooruithelpt?</em></h2>
          <p>HondAanZee is gemaakt door Webaanzee. Vanuit de Belgische kust ontwerpen en bouwen we ook websites voor zelfstandigen, horeca, winkels en logies.</p>
          <a className="webaanzee-offer__examples" href={webaanzeeUrl(source)} target="_blank" rel="noopener noreferrer" onClick={() => trackWebaanzeeAction(source, 'voorbeelden-bekeken')}>Bekijk het werk van Webaanzee <ArrowUpRight size={17} aria-hidden="true" /></a>
        </div>
        <div className="webaanzee-offer__check">
          <h3>Wat kan er beter op jouw website?</h3>
          <p>Vraag een gratis websitecheck en ontvang drie concrete verbeterpunten voor de duidelijkheid, het gebruik op mobiel en de stap naar contact of reserveren.</p>
          <p className="webaanzee-offer__instruction">Stuur de link van je website mee en vertel kort waar je tegenaan loopt.</p>
          <div className="webaanzee-offer__actions">
            <a className="webaanzee-offer__button" href={mailUrl} onClick={() => trackWebaanzeeAction(source, 'email-geopend')}><Mail size={18} aria-hidden="true" /> Vraag een gratis websitecheck <ArrowUpRight size={17} aria-hidden="true" /></a>
            <a className="webaanzee-offer__whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackWebaanzeeAction(source, 'whatsapp-geopend')}><MessageCircle size={18} aria-hidden="true" /> Liever via WhatsApp?</a>
          </div>
          <p className="webaanzee-offer__note">Vrijblijvend, zonder aankoopverplichting.{source === 'zaak-aanmelden' && ' Je gratis vermelding op HondAanZee staat hier los van.'}</p>
        </div>
      </div>
    </section>
  );
};

export default WebaanzeeOffer;
