import React from 'react';
import { ArrowDownRight } from 'lucide-react';
import Breadcrumb, { type BreadcrumbItem } from './Breadcrumb.tsx';
import './DirectoryHero.css';

const content = {
  hotspots: {
    breadcrumb: 'Hotspots',
    eyebrow: 'Hondvriendelijke hotspots',
    title: 'Fijne plekjes,',
    emphasis: 'voor jullie allebei.',
    description: 'Van koffie na een strandwandeling tot samen uit eten of een nachtje weg. Ontdek plekken aan de Belgische kust waar je hond welkom is.',
    action: 'Ontdek de hotspots',
    target: 'hotspot-filters',
    countLabel: 'plekjes aan de kust',
    image: '/images/heroes/hotspots-1024.webp',
    srcSet: '/images/heroes/hotspots-480.webp 480w, /images/heroes/hotspots-800.webp 800w, /images/heroes/hotspots-1024.webp 1024w',
    width: 1024,
    height: 650,
    alt: 'Een hond kijkt vrolijk over de tafel van een café, naast een bordje gebak.',
  },
  diensten: {
    breadcrumb: 'Diensten',
    eyebrow: 'Diensten voor je hond',
    title: 'Goed geregeld,',
    emphasis: 'zorgeloos op pad.',
    description: 'Een dierenarts in de buurt of een dierenwinkel voor die vergeten riem. Vind praktische adressen aan de Belgische kust, zodat jullie weer verder kunnen.',
    action: 'Vind een dienst',
    target: 'service-filters',
    countLabel: 'praktische adressen',
    image: '/images/heroes/diensten-1440.webp',
    srcSet: '/images/heroes/diensten-480.webp 480w, /images/heroes/diensten-960.webp 960w, /images/heroes/diensten-1440.webp 1440w',
    width: 1476,
    height: 583,
    alt: 'Een ontspannen hond in het gras, met een blauwe bal bij zijn poten.',
  },
  losloopzones: {
    breadcrumb: 'Losloopzones',
    eyebrow: 'Losloopzones aan zee',
    title: 'Even lekker los,',
    emphasis: 'voluit hond zijn.',
    description: 'Rennen, snuffelen en nieuwe vriendjes maken. Ontdek losloopweides en hondenbossen aan de Belgische kust, met praktische info voor jullie volgende uitstap.',
    action: 'Bekijk de losloopzones',
    target: 'offleash-filters',
    countLabel: 'losloopzones aan de kust',
    image: '/images/heroes/losloopzones-1000.webp',
    srcSet: '/images/heroes/losloopzones-480.webp 480w, /images/heroes/losloopzones-800.webp 800w, /images/heroes/losloopzones-1000.webp 1000w',
    width: 1000,
    height: 667,
    alt: 'Twee honden rennen samen door het gras, waarvan één met een bal.',
  },
} as const;

interface DirectoryHeroProps {
  kind: keyof typeof content;
  count: number;
  breadcrumbItems?: BreadcrumbItem[];
}

const DirectoryHero: React.FC<DirectoryHeroProps> = ({ kind, count, breadcrumbItems }) => {
  const hero = content[kind];
  return (
    <header className={`directory-hero directory-hero--${kind}`} data-directory-hero={kind}>
      <div className="site-shell">
        <Breadcrumb className="directory-hero__breadcrumb" items={breadcrumbItems || [{ label: 'Home', to: '/' }, { label: hero.breadcrumb }]} />
        <div className="directory-hero__layout">
          <div className="directory-hero__copy">
            <p className="directory-hero__eyebrow">{hero.eyebrow}</p>
            <h1 className="directory-hero__title">
              <span>{hero.title}</span>{' '}
              <em>{hero.emphasis}</em>
            </h1>
            <p className="directory-hero__description">{hero.description}</p>
            <div className="directory-hero__actions">
              <a href={`#${hero.target}`} className="directory-hero__action">
                {hero.action}<ArrowDownRight size={19} aria-hidden="true" />
              </a>
              <span className="directory-hero__count">{count} {hero.countLabel}</span>
            </div>
          </div>
          <figure className="directory-hero__photo">
            <img
              src={hero.image}
              srcSet={hero.srcSet}
              sizes="(min-width: 1664px) 760px, (min-width: 1024px) 47vw, (min-width: 640px) 85vw, calc(100vw - 3rem)"
              width={hero.width}
              height={hero.height}
              alt={hero.alt}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </figure>
        </div>
      </div>
    </header>
  );
};

export default DirectoryHero;
