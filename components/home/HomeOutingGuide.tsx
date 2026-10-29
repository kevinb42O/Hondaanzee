import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, CalendarDays, Coffee, PawPrint, Waves } from 'lucide-react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import './HomeOutingGuide.css';

const chapters = [
  {
    id: 'strand', label: 'Naar het strand', icon: Waves,
    title: 'Zilte lucht.', emphasis: 'Vier poten in het zand.',
    description: 'Een frisse neus halen aan de waterlijn. Bekijk vooraf waar je hond welkom is en welke uren, zones en leibandregels er gelden.',
    detail: 'Strandregels verschillen per gemeente en periode.',
    action: 'Kies je badstad', href: '/#steden',
    image: '/happy-dog-strand.webp', srcSet: '/happy-dog-strand-640w.webp 640w, /happy-dog-strand.webp 1024w',
    alt: 'Een hond rent door het ondiepe water aan het strand.', tone: 'sea', position: 'center',
  },
  {
    id: 'loslopen', label: 'Vrij rondlopen', icon: PawPrint,
    title: 'Even de riem af.', emphasis: 'En de neus achterna.',
    description: 'Ruimte om te rennen, te snuffelen en samen te spelen. Vind een losloopweide of hondenbos aan de kust en bekijk de praktische info voor je vertrekt.',
    detail: 'Controleer de omheining en de regels van de zone.',
    action: 'Vind een losloopzone', href: '/losloopzones',
    image: '/images/heroes/losloopzones-1000.webp', srcSet: '/images/heroes/losloopzones-480.webp 480w, /images/heroes/losloopzones-800.webp 800w, /images/heroes/losloopzones-1000.webp 1000w',
    alt: 'Twee honden rennen samen door het gras, één met een bal.', tone: 'dune', position: 'center',
  },
  {
    id: 'hotspots', label: 'Samen pauzeren', icon: Coffee,
    title: 'Koffie voor jou.', emphasis: 'Een plekje voor je hond.',
    description: 'Na de wandeling samen op adem komen. Ontdek cafés, restaurants en andere fijne adressen waar je viervoeter mee welkom is.',
    detail: 'Bekijk de informatie en voorwaarden van de zaak.',
    action: 'Ontdek de hotspots', href: '/hotspots',
    image: '/images/heroes/hotspots-1024.webp', srcSet: '/images/heroes/hotspots-480.webp 480w, /images/heroes/hotspots-800.webp 800w, /images/heroes/hotspots-1024.webp 1024w',
    alt: 'Een hond kijkt over een cafétafel naast een bordje gebak.', tone: 'sand', position: 'center',
  },
  {
    id: 'agenda', label: 'Iets beleven', icon: CalendarDays,
    title: 'Een dagje samen.', emphasis: 'Iets om naar uit te kijken.',
    description: 'Een georganiseerde wandeling of een evenement met je hond erbij. Bekijk wat er op de agenda staat, aan zee en daarbuiten.',
    detail: 'Bekijk bij elk evenement de locatie en praktische info.',
    action: 'Bekijk de agenda', href: '/agenda',
    image: '/images/heroes/agenda-900.webp', srcSet: '/images/heroes/agenda-480.webp 480w, /images/heroes/agenda-800.webp 800w, /images/heroes/agenda-900.webp 900w',
    alt: 'Bezoekers met hun honden op het gras bij Dogs & Friends in La Hulpe.', tone: 'meadow', position: 'center 65%',
  },
] as const;

function Chapter({ index, phase, pinned, active }: { index: number; phase: MotionValue<number>; pinned: boolean; active: number }) {
  const chapter = chapters[index];
  const imageOpacity = useTransform(phase, value => Math.max(0, 1 - Math.abs(value - index)));
  const copyOpacity = useTransform(phase, value => Math.max(0, Math.min(1, (0.48 - Math.abs(value - index)) / .3)));
  const copyY = useTransform(phase, value => Math.max(-1, Math.min(1, index - value)) * 24);
  const scale = useTransform(phase, value => 1 + Math.min(1, Math.abs(value - index)) * .04);
  return <article
    id={`uitstap-${chapter.id}`}
    className={`outing-guide__chapter outing-guide__chapter--${chapter.tone}`}
    aria-labelledby={`uitstap-title-${chapter.id}`}
    aria-hidden={pinned && active !== index ? true : undefined}
    inert={pinned && active !== index ? true : undefined}
  >
    <motion.figure className="outing-guide__visual" style={pinned ? { opacity: imageOpacity } : undefined}>
      <div className="outing-guide__image-crop">
        <motion.img src={chapter.image} srcSet={chapter.srcSet} sizes="(min-width: 1000px) 52vw, 100vw" width={1024} height={760} alt={chapter.alt} loading="lazy" decoding="async" style={{ objectPosition: chapter.position, ...(pinned ? { scale } : {}) }} />
      </div>
      <figcaption>
        <span><chapter.icon size={17} aria-hidden="true" />{chapter.label}</span>
        {chapter.id === 'agenda' && <a href="https://dogsandfriends.be/index-nl.php" target="_blank" rel="noopener noreferrer">Foto: Dogs &amp; Friends</a>}
      </figcaption>
    </motion.figure>
    <motion.div className="outing-guide__copy" style={pinned ? { opacity: copyOpacity, y: copyY } : undefined}>
      <h3 id={`uitstap-title-${chapter.id}`}>{chapter.title}<em>{chapter.emphasis}</em></h3>
      <p>{chapter.description}</p>
      <p className="outing-guide__detail">{chapter.detail}</p>
      {chapter.id === 'strand'
        ? <a href="#steden" className="outing-guide__action">{chapter.action}<ArrowRight size={19} aria-hidden="true" /></a>
        : <Link to={chapter.href} className="outing-guide__action">{chapter.action}<ArrowRight size={19} aria-hidden="true" /></Link>}
    </motion.div>
  </article>;
}

export default function HomeOutingGuide() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [fits, setFits] = useState(false);
  const [active, setActive] = useState(0);
  const pinned = fits && !reducedMotion;
  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end end'] });
  const phase = useTransform(scrollYProgress, value => Math.max(0, Math.min(3, value * 3)));
  useMotionValueEvent(phase, 'change', value => setActive(Math.round(value)));

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1000px) and (min-height: 760px)');
    const measure = () => {
      const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      setFits(media.matches && window.innerWidth >= fontSize * 62.5 && window.innerHeight >= fontSize * 47.5);
    };
    media.addEventListener('change', measure);
    window.addEventListener('resize', measure);
    const observer = new MutationObserver(measure);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });
    measure();
    return () => { media.removeEventListener('change', measure); window.removeEventListener('resize', measure); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (window.location.hash !== '#uitstap-inspiratie') return;
    let disposed = false;
    let frame = 0;
    // Align after the homepage's mount reset and the measured sticky layout.
    document.fonts.ready.then(() => {
      if (disposed) return;
      frame = requestAnimationFrame(() => root.current?.scrollIntoView({ behavior: 'instant', block: 'start' }));
    });
    return () => { disposed = true; cancelAnimationFrame(frame); };
  }, [pinned]);

  const navigate = (index: number) => {
    if (!root.current || !stage.current) return;
    if (pinned) {
      const start = root.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: start + index / 3 * (root.current.offsetHeight - stage.current.offsetHeight), behavior: 'smooth' });
    } else {
      document.getElementById(`uitstap-${chapters[index].id}`)?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
    }
  };

  return <section ref={root} id="uitstap-inspiratie" className={`outing-guide${pinned ? ' outing-guide--pinned' : ''}`} aria-labelledby="outing-guide-title" data-outing-guide={pinned ? 'pinned' : 'flow'}>
    <div ref={stage} className="outing-guide__stage site-shell">
      <header className="outing-guide__heading">
        <h2 id="outing-guide-title">Wat wil je <em>doen?</em></h2>
        <p>Een hele dag buiten. Of gewoon even samen weg.</p>
        {pinned && <span className="outing-guide__hint">Scroll en ontdek<ArrowDown size={16} aria-hidden="true" /></span>}
      </header>
      <nav className="outing-guide__navigation" aria-label="Kies je uitstap">
        {chapters.map((chapter, index) => <button key={chapter.id} type="button" aria-controls={`uitstap-${chapter.id}`} aria-current={pinned && active === index ? 'step' : undefined} onClick={() => navigate(index)}><chapter.icon size={18} aria-hidden="true" /><span>{chapter.label}</span><ArrowRight size={16} aria-hidden="true" /></button>)}
      </nav>
      <div className="outing-guide__chapters">{chapters.map((chapter, index) => <Chapter key={chapter.id} index={index} phase={phase} pinned={pinned} active={active} />)}</div>
    </div>
  </section>;
}
