import React, { useState } from 'react';
import { ArrowUpRight, Images } from 'lucide-react';
import ImageModal from '../ImageModal';
import { getPlaceImages, type Place } from '../../utils/placePresentation';

export default function PlaceGallery({ place }: { place: Place }) {
  const images = getPlaceImages(place);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const open = (index: number) => setSelectedImage(index);
  return <>
    <div id="fotos" data-place-gallery className="scroll-mt-28">
      <button type="button" onClick={() => open(0)} aria-label={`Bekijk de foto${images.length > 1 ? "'s" : ''} van ${place.name}`} className="group relative block h-[280px] w-full overflow-hidden rounded-xl bg-slate-200 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700 sm:h-[400px] lg:h-[520px]">
        <img src={images[0]} alt={place.name} width={1200} height={900} fetchPriority="high" decoding="async" className="h-full w-full object-cover" style={{ objectPosition: place.imagePosition || 'center' }} />
        <span className="absolute bottom-4 right-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm"><Images size={17} aria-hidden="true" />{images.length > 1 ? `${images.length} foto's` : 'Bekijk foto'}<ArrowUpRight size={16} aria-hidden="true" /></span>
      </button>
      {images.length > 1 && <div className="mt-3 grid grid-cols-3 gap-3">
        {images.slice(1, 4).map((image, index) => <button key={image} type="button" onClick={() => open(index + 1)} aria-label={`Bekijk foto ${index + 2} van ${place.name}`} className="relative overflow-hidden rounded-lg bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700">
          <img src={image} alt={`${place.name}, foto ${index + 2}`} width={400} height={240} loading="lazy" decoding="async" className="h-20 w-full object-cover sm:h-28" style={{ objectPosition: place.imagePosition || 'center' }} />
          {index === 2 && images.length > 4 && <span className="absolute inset-0 flex items-center justify-center bg-slate-950/60 text-lg font-semibold text-white">+{images.length - 4}</span>}
        </button>)}
      </div>}
    </div>
    <ImageModal images={images} altText={place.name} isOpen={selectedImage !== null} initialIndex={selectedImage ?? 0} onClose={() => setSelectedImage(null)} />
  </>;
}
