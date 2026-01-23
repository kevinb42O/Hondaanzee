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
        script.setAttribute('data-dynamic', 'true');
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

// SEO Metadata for each page type
export const SEO_DATA = {
  home: {
    title: 'Honden aan Zee België 2026 | Strandregels, Losloopzones & Hondvriendelijke Plekken aan de Belgische Kust',
    description: '✓ Actuele strandregels voor honden ✓ Losloopzones en hondenweides ✓ Hondvriendelijke cafés, restaurants & hotels ✓ Alle badsteden van De Panne tot Knokke ✓ Gratis & up-to-date info 2026',
    keywords: 'hond strand belgië, hond aan zee, hondenstrand belgië, losloopzone hond kust, hondvriendelijk strand, strand met hond belgie, wandelen hond zee, hondvriendelijk restaurant kust, strandregels honden 2026'
  },
  
  hotspots: {
    title: 'Hondvriendelijke Hotspots Belgische Kust | Cafés, Restaurants & Hotels waar Honden Welkom Zijn',
    description: 'Ontdek de beste hondvriendelijke cafés, restaurants en hotels aan de Belgische kust. Van Oostende tot Knokke - waar je hond écht welkom is. Filter op stad en type.',
    keywords: 'hondvriendelijk restaurant belgië kust, hondvriendelijk café aan zee, hotel honden toegelaten kust, hondvriendelijk terras zee, hond welkom restaurant, hond toegestaan café, hondvriendelijke horeca kust'
  },
  
  diensten: {
    title: 'Dierenartsen & Dierenwinkels Belgische Kust | Praktische Diensten voor Hondenbezitters',
    description: 'Vind de beste dierenartsen en dierenwinkels aan de Belgische kust. Van Oostende tot Knokke - alle praktische diensten voor je hond op één plek. Filter op stad en type.',
    keywords: 'dierenarts aan zee belgië, dierenwinkel kust belgië, dierenspeciaalzaak strand, dierenarts oostende, petshop aan zee, hondentrimsalon kust, dierenarts knokke, dierenwinkel blankenberge'
  },

  losloopzones: {
    title: 'Losloopzones Belgische Kust | Overzicht Hondenweides & Losloopgebieden aan Zee',
    description: 'Interactieve kaart met alle losloopzones en hondenweides aan de Belgische kust. Van De Panne tot Knokke - vind de perfecte plek waar je hond vrij kan loslopen. Met ratings, foto\'s en routebeschrijvingen.',
    keywords: 'losloopzone hond kust belgië, hondenweide aan zee, hondenlosloopgebied strand, vrij loslopen hond zee, omheinde hondenweide kust, losloopzone oostende, hondenweide knokke, losloopgebied de haan'
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
    title: `Hond Strand ${cityName} 2026 | Strandregels, Losloopzones & Hondvriendelijke Plekken ${cityName}`,
    description: `✓ Actuele strandregels voor honden in ${cityName} ✓ Losloopzones en hondenweides ✓ Waar mag je hond vrij lopen? ✓ Seizoensregels winter & zomer ✓ Hondvriendelijke cafés en restaurants in ${cityName}`,
    keywords: searchTerms.join(', '),
    canonical: `https://hondaanzee.be/#/${citySlug}`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "TouristDestination",
      "name": `${cityName} - Hondvriendelijk Strand`,
      "description": `Informatie over strandregels en faciliteiten voor honden in ${cityName} aan de Belgische kust`,
      "url": `https://hondaanzee.be/#/${citySlug}`,
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
  };
};
