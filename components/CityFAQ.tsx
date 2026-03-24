import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { City } from '../types.ts';
import { buildCityFAQEntries } from '../utils/cityFaq.ts';

interface CityFAQProps {
  city: City;
}

const CityFAQ: React.FC<CityFAQProps> = ({ city }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqEntries = useMemo(() => buildCityFAQEntries(city), [city]);

  return (
    <section className="py-10 sm:py-12 md:py-16 bg-slate-50 border-y border-slate-200" aria-labelledby="city-faq-title">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 id="city-faq-title" className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Snelle FAQ voor {city.name}
          </h2>
          <p className="text-slate-600 mt-2 sm:mt-3 font-medium text-sm sm:text-base">
            Alle antwoorden hieronder komen rechtstreeks uit de gegevens op deze pagina.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqEntries.map((entry, index) => {
            const isOpen = openIndex === index;

            return (
              <article key={entry.question} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-start gap-3 sm:gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="text-slate-900 font-extrabold text-sm sm:text-base leading-relaxed flex-1">{entry.question}</span>
                  <ChevronDown
                    size={18}
                    className={`mt-0.5 shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-4 sm:pb-5 text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
                    {entry.answer}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CityFAQ;