
import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageModalProps {
    images: string[]; // Array of image URLs
    altText: string;
    isOpen: boolean;
    onClose: () => void;
    initialIndex?: number; // Starting image index
}

const ImageModal: React.FC<ImageModalProps> = ({
    images,
    altText,
    isOpen,
    onClose,
    initialIndex = 0
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Reset to initial index when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
        }
    }, [isOpen, initialIndex]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close on ESC key, navigate with arrow keys
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                handlePrevious();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isOpen, currentIndex, images.length]);

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    if (!isOpen || images.length === 0) return null;

    const showNavigation = images.length > 1;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm animate-fadeIn" />

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur rounded-full p-3 shadow-lg hover:bg-white transition-colors active:scale-95"
                aria-label="Close image"
            >
                <X size={24} className="text-slate-700" />
            </button>

            {/* Previous Button */}
            {showNavigation && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePrevious();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur rounded-full p-4 shadow-lg hover:bg-white hover:scale-110 transition-all active:scale-95 group"
                    aria-label="Previous image"
                >
                    <ChevronLeft size={28} className="text-slate-700 group-hover:text-sky-600 transition-colors" />
                </button>
            )}

            {/* Next Button */}
            {showNavigation && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur rounded-full p-4 shadow-lg hover:bg-white hover:scale-110 transition-all active:scale-95 group"
                    aria-label="Next image"
                >
                    <ChevronRight size={28} className="text-slate-700 group-hover:text-sky-600 transition-colors" />
                </button>
            )}

            {/* Image Container */}
            <div
                className="relative max-w-7xl max-h-[90vh] animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    key={currentIndex} // Force re-render on image change
                    src={images[currentIndex]}
                    alt={`${altText} - Afbeelding ${currentIndex + 1} van ${images.length}`}
                    className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-2xl shadow-2xl"
                />

                {/* Caption with Image Counter */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-6 rounded-b-2xl">
                    <p className="text-white font-bold text-lg text-center drop-shadow-lg">
                        {altText}
                    </p>
                    {showNavigation && (
                        <p className="text-white/80 text-sm text-center mt-2 drop-shadow-lg">
                            {currentIndex + 1} / {images.length}
                        </p>
                    )}
                </div>

                {/* Thumbnail Indicators (optional, for multiple images) */}
                {showNavigation && images.length <= 5 && (
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentIndex(index);
                                }}
                                className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                                        ? 'bg-white scale-125'
                                        : 'bg-white/50 hover:bg-white/75'
                                    }`}
                                aria-label={`Go to image ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
        </div>
    );
};

export default ImageModal;
