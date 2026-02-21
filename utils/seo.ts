import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  structuredData?: object;
}

export const useSEO = ({
  title,
  description,
  keywords,
  ogImage = 'https://hondaanzee.be/og-image.jpg',
  canonical,
  structuredData
}: SEOProps) => {
  const location = useLocation();

  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMeta('description', description);
    if (keywords) updateMeta('keywords', keywords);

    // Open Graph
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:url', canonical || `https://hondaanzee.be${location.pathname}`, true);

    // Twitter Card
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);

    // Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonical || `https://hondaanzee.be${location.pathname}`);

    // Structured Data
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"][data-dynamic]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        (script as HTMLElement).dataset.dynamic = 'true';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function
    return () => {
      // Reset to default on unmount if needed
    };
  }, [title, description, keywords, ogImage, canonical, structuredData, location]);
};

const YEAR = new Date().getFullYear();

// SEO Metadata for each page type
export const SEO_DATA = {
  home: {
    title: `Honden aan Zee België ${YEAR} | Strandregels, Losloopzones & Hondvriendelijke Plekken aan de Belgische Kust`,
    description: `✓ Actuele strandregels voor honden ✓ Losloopzones en hondenweides ✓ Hondvriendelijke cafés, restaurants & hotels ✓ Alle badsteden van De Panne tot Knokke ✓ Gratis & up-to-date info ${YEAR}`,
    keywords: `hond strand belgië, hond aan zee, hondenstrand belgië, losloopzone hond kust, hondvriendelijk strand, strand met hond belgie, wandelen hond zee, hondvriendelijk restaurant kust, strandregels honden ${YEAR}`
  },

  hotspots: {
    title: 'Hondvriendelijke Hotspots Belgische Kust | Cafés, Restaurants & Hotels waar Honden Welkom Zijn',
    description: 'Ontdek de beste hondvriendelijke cafés, restaurants en hotels aan de Belgische kust. Van Oostende tot Knokke - waar je hond écht welkom is. Filter op stad en type.',
    keywords: 'hondvriendelijk restaurant belgië kust, hondvriendelijk café aan zee, hotel honden toegelaten kust, hondvriendelijk terras zee, hond welkom restaurant, hond toegestaan café, hondvriendelijke horeca kust',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
        { "@type": "ListItem", "position": 2, "name": "Hotspots", "item": "https://hondaanzee.be/hotspots" }
      ]
    }
  },

  diensten: {
    title: 'Dierenartsen & Dierenwinkels Belgische Kust | Praktische Diensten voor Hondenbezitters',
    description: 'Vind de beste dierenartsen en dierenwinkels aan de Belgische kust. Van Oostende tot Knokke - alle praktische diensten voor je hond op één plek. Filter op stad en type.',
    keywords: 'dierenarts aan zee belgië, dierenwinkel kust belgië, dierenspeciaalzaak strand, dierenarts oostende, petshop aan zee, hondentrimsalon kust, dierenarts knokke, dierenwinkel blankenberge',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
        { "@type": "ListItem", "position": 2, "name": "Diensten", "item": "https://hondaanzee.be/diensten" }
      ]
    }
  },

  losloopzones: {
    title: 'Losloopzones Belgische Kust | Overzicht Hondenweides & Losloopgebieden aan Zee',
    description: 'Interactieve kaart met alle losloopzones en hondenweides aan de Belgische kust. Van De Panne tot Knokke - vind de perfecte plek waar je hond vrij kan loslopen. Met ratings, foto\'s en routebeschrijvingen.',
    keywords: 'losloopzone hond kust belgië, hondenweide aan zee, hondenlosloopgebied strand, vrij loslopen hond zee, omheinde hondenweide kust, losloopzone oostende, hondenweide knokke, losloopgebied de haan',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
        { "@type": "ListItem", "position": 2, "name": "Losloopzones", "item": "https://hondaanzee.be/losloopzones" }
      ]
    }
  },

  privacy: {
    title: 'Privacybeleid | HondAanZee.be',
    description: 'Privacybeleid van HondAanZee.be - Hoe wij omgaan met je gegevens volgens AVG/GDPR',
    keywords: ''
  },

  terms: {
    title: 'Algemene Voorwaarden | HondAanZee.be',
    description: 'Algemene voorwaarden voor het gebruik van HondAanZee.be',
    keywords: ''
  },

  cookies: {
    title: 'Cookiebeleid | HondAanZee.be',
    description: 'Cookiebeleid van HondAanZee.be - Welke cookies we gebruiken en waarom',
    keywords: ''
  },

  agenda: {
    title: 'Hondvriendelijke Evenementen Belgische Kust 2026 | Agenda & Events – HondAanZee.be',
    description: 'Ontdek alle hondvriendelijke evenementen aan de Belgische kust in 2026: Kwispelfestival De Panne, Groot Oostends Hondenfestival & Grote Hondenwandeling Bredene. Festivals, wandelingen & meer voor jou en je viervoeter!',
    keywords: 'hondenevenement belgische kust 2026, hondenfestival aan zee, kwispelfestival de panne 2026, groot oostends hondenfestival 2026, hondenwandeling bredene, hondvriendelijk event kust, hondendag strand belgie, hondenwandeling aan zee, pinksterweekend honden oostende, losloopzone festival, evenementen honden belgie 2026, hondenfestival gratis',
    canonical: 'https://hondaanzee.be/agenda',
    ogImage: 'https://hondaanzee.be/kwispelfestival.webp',
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
          { "@type": "ListItem", "position": 2, "name": "Agenda", "item": "https://hondaanzee.be/agenda" }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Hondvriendelijke Evenementen Belgische Kust 2026",
        "description": "Overzicht van alle hondvriendelijke evenementen aan de Belgische kust",
        "url": "https://hondaanzee.be/agenda",
        "numberOfItems": 3,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "Event",
              "name": "Kwispelfestival De Panne",
              "description": "Hét jaarlijkse feest voor hond & baasje aan de Belgische kust. Wandeltocht, workshops, hondenfotografie, hondenmarkt en demonstraties.",
              "startDate": "2026-05-17T11:00:00+02:00",
              "endDate": "2026-05-17T17:00:00+02:00",
              "eventStatus": "https://schema.org/EventScheduled",
              "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
              "location": {
                "@type": "Place",
                "name": "Leopold I-Esplanade",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "Zeelaan 21",
                  "addressLocality": "De Panne",
                  "postalCode": "8660",
                  "addressCountry": "BE"
                }
              },
              "image": "https://hondaanzee.be/kwispelfestival.webp",
              "url": "https://hondaanzee.be/agenda",
              "isAccessibleForFree": true,
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock",
                "url": "https://hondaanzee.be/agenda"
              },
              "organizer": {
                "@type": "Organization",
                "name": "Visit De Panne",
                "url": "https://www.visitdepanne.be"
              }
            }
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@type": "Event",
              "name": "Groot Oostends Hondenfestival",
              "description": "Tweedaags hondenfestival op 12.000 m² met losloopzone, demonstraties, hondenboetiekjes en food corner aan zee in Oostende.",
              "startDate": "2026-05-23T10:00:00+02:00",
              "endDate": "2026-05-24T18:00:00+02:00",
              "eventStatus": "https://schema.org/EventScheduled",
              "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
              "location": {
                "@type": "Place",
                "name": "Domein Duin & Zee",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "Fortstraat 128",
                  "addressLocality": "Oostende",
                  "postalCode": "8400",
                  "addressCountry": "BE"
                }
              },
              "image": "https://hondaanzee.be/oostendshondenfestival.webp",
              "url": "https://hondaanzee.be/agenda",
              "isAccessibleForFree": true,
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock",
                "url": "https://hondaanzee.be/agenda"
              },
              "organizer": {
                "@type": "Organization",
                "name": "Pooches.be & vzw Hondenfestival",
                "url": "https://www.pooches.be"
              }
            }
          },
          {
            "@type": "ListItem",
            "position": 3,
            "item": {
              "@type": "Event",
              "name": "Grote Hondenwandeling Bredene",
              "description": "Jaarlijkse bewegwijzerde hondenwandeling door de Bredense duinen en langs het strand. Verkorte route beschikbaar voor oudere honden.",
              "startDate": "2026-05-24T11:00:00+02:00",
              "endDate": "2026-05-24T17:00:00+02:00",
              "eventStatus": "https://schema.org/EventScheduled",
              "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
              "location": {
                "@type": "Place",
                "name": "Jeugdhuis Creatuur",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "Kerkstraat 9",
                  "addressLocality": "Bredene",
                  "postalCode": "8450",
                  "addressCountry": "BE"
                }
              },
              "image": "https://hondaanzee.be/hondenbredene.webp",
              "url": "https://hondaanzee.be/agenda",
              "isAccessibleForFree": false,
              "offers": {
                "@type": "Offer",
                "price": "5",
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock",
                "url": "https://hondaanzee.be/agenda"
              },
              "organizer": {
                "@type": "Organization",
                "name": "SOS Reptiel - Reptile Rescue Center Belgium",
                "url": "https://www.sosreptiel.be"
              }
            }
          }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Hondvriendelijke Evenementen Belgische Kust 2026",
        "description": "Overzicht van alle hondvriendelijke evenementen, festivals en wandelingen aan de Belgische kust in 2026",
        "url": "https://hondaanzee.be/agenda",
        "inLanguage": "nl-BE",
        "isPartOf": {
          "@type": "WebSite",
          "name": "HondAanZee.be",
          "url": "https://hondaanzee.be"
        },
        "publisher": {
          "@type": "Organization",
          "name": "HondAanZee.be",
          "url": "https://hondaanzee.be",
          "logo": {
            "@type": "ImageObject",
            "url": "https://hondaanzee.be/zee-hond2.avif"
          }
        }
      }
    ]
  },

  about: {
    title: 'Over HondAanZee.be | Ons Verhaal & Missie – De Belgische Kust voor Hondenbezitters',
    description: 'Leer het team achter HondAanZee.be kennen. Onze missie: de meest complete, gratis gids voor hondeneigenaars aan de Belgische kust. Van De Panne tot Knokke.',
    keywords: 'over hondaanzee, hondaanzee team, hondvriendelijke kust belgie, missie hondaanzee',
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
          { "@type": "ListItem", "position": 2, "name": "Over ons", "item": "https://hondaanzee.be/over-ons" }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "Over HondAanZee.be",
        "url": "https://hondaanzee.be/over-ons",
        "description": "De meest complete en actuele gids voor hondeneigenaars die de Belgische kust bezoeken.",
        "publisher": {
          "@type": "Organization",
          "name": "HondAanZee.be",
          "url": "https://hondaanzee.be"
        }
      }
    ]
  },

  kaart: {
    title: 'Interactieve Kaart Belgische Kust | Alle Hondvriendelijke Locaties op de Kaart – HondAanZee.be',
    description: 'Bekijk alle hondvriendelijke stranden, losloopzones, cafés, restaurants en dierenartsen op onze interactieve kaart van de Belgische kust. Van De Panne tot Knokke.',
    keywords: 'kaart hondvriendelijk strand belgie, interactieve kaart belgische kust hond, hondenstrand kaart, losloopzone kaart kust',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
        { "@type": "ListItem", "position": 2, "name": "Kaart", "item": "https://hondaanzee.be/kaart" }
      ]
    }
  },

  steunOns: {
    title: 'Steun HondAanZee.be | Trakteer ons op een Hondenkoekje 🐾',
    description: 'HondAanZee.be is 100% gratis. Steun ons werk en help ons de leukste plekken aan de Belgische kust te blijven delen voor hondenbezitters.',
    keywords: 'steun hondaanzee, donatie hondaanzee, hondaanzee ondersteunen',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
        { "@type": "ListItem", "position": 2, "name": "Steun ons", "item": "https://hondaanzee.be/steun-ons" }
      ]
    }
  },

  community: {
    title: 'Kusthonden Community 📸 | Topper van de Week — HondAanZee.be',
    description: 'Word deel van de HondAanZee community! Stuur je mooiste hondenfotos aan de Belgische kust via WhatsApp. Elke week een nieuwe topper, elke gemeente een Wall of Fame.',
    keywords: 'hondenfoto kust, community hondaanzee, topper van de week hond zee, hondenfoto belgische kust, kusthonden community, wall of fame hond strand',
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
          { "@type": "ListItem", "position": 2, "name": "Community", "item": "https://hondaanzee.be/community" }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Kusthonden Community",
        "url": "https://hondaanzee.be/community",
        "description": "Community pagina waar hondeneigenaars hun mooiste fotos aan de Belgische kust delen",
        "publisher": {
          "@type": "Organization",
          "name": "HondAanZee.be",
          "url": "https://hondaanzee.be"
        }
      }
    ]
  },

  blog: {
    title: 'Blog | HondAanZee.be — Tips, Natuur & Nieuws over Honden aan de Belgische Kust',
    description: 'Lees onze blogs over honden aan de Belgische kust: van zeehonden op het strand tot opruimacties. Nuttige info, tips en achtergronden voor elke hondenbezitter.',
    keywords: 'blog hondaanzee, zeehonden belgische kust hond, opruimacties strand, proper strand lopers, hond aan zee blog, natuur belgische kust, strand opruimen hond',
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://hondaanzee.be/blog" }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "HondAanZee Blog",
        "url": "https://hondaanzee.be/blog",
        "description": "Blog over honden aan de Belgische kust: natuur, veiligheid en duurzaamheid",
        "publisher": {
          "@type": "Organization",
          "name": "HondAanZee.be",
          "url": "https://hondaanzee.be"
        }
      }
    ]
  }
};

// Generate city-specific SEO data
export const getCitySEO = (cityName: string, citySlug: string) => {
  const searchTerms = [
    `hond strand ${cityName.toLowerCase()}`,
    `hondenstrand ${cityName.toLowerCase()}`,
    `losloopzone ${cityName.toLowerCase()}`,
    `strandregels hond ${cityName.toLowerCase()}`,
    `hond toegestaan strand ${cityName.toLowerCase()}`,
    `wandelen hond ${cityName.toLowerCase()}`,
    `hondenweide ${cityName.toLowerCase()}`,
    `hondvriendelijk ${cityName.toLowerCase()}`
  ];

  return {
    title: `Hond Strand ${cityName} ${YEAR} | Strandregels, Losloopzones & Hondvriendelijke Plekken ${cityName}`,
    description: `✓ Actuele strandregels voor honden in ${cityName} ✓ Losloopzones en hondenweides ✓ Waar mag je hond vrij lopen? ✓ Seizoensregels winter & zomer ✓ Hondvriendelijke cafés en restaurants in ${cityName}`,
    keywords: searchTerms.join(', '),
    canonical: `https://hondaanzee.be/${citySlug}`,
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hondaanzee.be/" },
          { "@type": "ListItem", "position": 2, "name": cityName, "item": `https://hondaanzee.be/${citySlug}` }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "TouristDestination",
      "name": `${cityName} - Hondvriendelijk Strand`,
      "description": `Informatie over strandregels en faciliteiten voor honden in ${cityName} aan de Belgische kust`,
      "url": `https://hondaanzee.be/${citySlug}`,
      "isAccessibleForFree": true,
      "publicAccess": true,
      "geo": {
        "@type": "GeoCoordinates",
        "addressCountry": "BE"
      },
      "touristType": ["Pet Owner", "Dog Owner"],
      "amenityFeature": [
        {
          "@type": "LocationFeatureSpecification",
          "name": "Hondvriendelijk strand",
          "value": true
        }
      ]
    }
    ]
  };
};
