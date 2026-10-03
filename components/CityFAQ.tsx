import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { City } from '../types.ts';
import { buildCityFAQEntries } from '../utils/cityFaq.ts';

interface CityFAQProps {
  city: City;
}

const CityFAQ: React.FC<CityFAQProps> = ({ city }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqEntries = useMemo(() => buildCityFAQEntries(city), [city]);

  return (
    <section className="city-section city-faq" aria-labelledby="city-faq-title">
      <div className="city-shell">
        <div className="city-section-heading">
          <h2 id="city-faq-title" className="city-section-title">
            Veelgestelde vragen over {city.name}
          </h2>
          <p className="city-body-copy">
            Nog iets weten voor je vertrekt? Hier vind je de antwoorden voor jouw bestemming.
          </p>
        </div>

        <div className="city-faq-list">
          {faqEntries.map((entry, index) => {
            const isOpen = openIndex === index;

            return (
              <article key={entry.question} className="city-faq-item">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="city-faq-question"
                  aria-expanded={isOpen}
                  aria-controls={`city-faq-answer-${index}`}
                >
                  <span className="flex-1">{entry.question}</span>
                  <ChevronDown
                    size={22}
                    className={`mt-0.5 shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                  <div id={`city-faq-answer-${index}`} hidden={!isOpen} className="city-faq-answer">
                    {entry.answer}
                  </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CityFAQ;
