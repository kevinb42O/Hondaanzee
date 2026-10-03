import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, type LucideIcon } from 'lucide-react';

export type LegalSection = { id: string; title: string; content: React.ReactNode };

export function LegalContact() {
  return <p><strong>Kevin Bourguignon · Hond aan Zee</strong><br />
    E-mail: <a href="mailto:info@hondaanzee.be">info@hondaanzee.be</a><br />
    WhatsApp: <a href="https://wa.me/32494816714">+32 494 81 67 14</a>
  </p>;
}

export default function LegalPage({ title, icon: Icon, intro, summary, sections, updatedAt = '2026-10-02' }: {
  title: string; icon: LucideIcon; intro: string; summary: React.ReactNode; sections: LegalSection[]; updatedAt?: string;
}) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return <div className="animate-in fade-in">
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-28 sm:pt-32 pb-12 sm:pb-16">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-300 font-bold hover:text-sky-400 mb-6 py-2"><ArrowLeft size={18} />Terug naar home</Link>
        <div className="flex items-start sm:items-center gap-4 mb-5">
          <div className="bg-sky-600 p-3 rounded-xl shrink-0"><Icon size={24} aria-hidden="true" /></div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">{title}</h1>
        </div>
        <p className="text-slate-300 leading-relaxed max-w-2xl mb-5">{intro}</p>
        <p className="text-slate-400 text-sm">Laatst bijgewerkt: <time dateTime={updatedAt}>{new Date(`${updatedAt}T12:00:00Z`).toLocaleDateString('nl-BE',{timeZone:'Europe/Brussels',day:'numeric',month:'long',year:'numeric'})}</time></p>
      </div>
    </div>
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 sm:py-14">
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 sm:p-7 mb-8 text-sky-950 leading-relaxed [&_p+p]:mt-3">
        <h2 className="font-bold text-lg mb-3">Wat je moet weten</h2>{summary}
      </div>
      <nav aria-label={`Inhoud van ${title}`} className="border border-slate-200 rounded-2xl p-5 sm:p-7 mb-10">
        <h2 className="font-bold text-slate-900 mb-4">Op deze pagina</h2>
        <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`} className="block py-1 text-slate-600 hover:text-sky-700 hover:underline">{index + 1}. {section.title}</a></li>)}
        </ol>
      </nav>
      <div className="text-slate-600 leading-relaxed [&_p]:mb-4 [&_a]:text-sky-700 [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_li]:mb-2 [&_strong]:text-slate-900">
        {sections.map((section, index) => <section id={section.id} key={section.id} className="mb-10 scroll-mt-28">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">{index + 1}. {section.title}</h2>{section.content}
        </section>)}
      </div>
      <nav aria-label="Andere beleidsdocumenten" className="flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-200 pt-6 text-sm font-bold text-sky-700">
        <Link to="/algemene-voorwaarden" className="hover:underline">Algemene voorwaarden</Link>
        <Link to="/privacy" className="hover:underline">Privacybeleid</Link>
        <Link to="/cookies" className="hover:underline">Cookiebeleid</Link>
      </nav>
    </div>
  </div>;
}
