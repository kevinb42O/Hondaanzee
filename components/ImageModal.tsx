
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageModalProps {
    images: string[];
    altText: string;
    isOpen: boolean;
    onClose: () => void;
    initialIndex?: number;
}

const ImageModal: React.FC<ImageModalProps> = ({
    images,
    altText,
    isOpen,
    onClose,
    initialIndex = 0
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Reset to initial index when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
        }
    }, [isOpen, initialIndex]);

    // Open/close native dialog
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen && images.length > 0) {
            if (!dialog.open) dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
        }
    }, [isOpen, images.length]);

    // Handle native close event (ESC key)
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const handleClose = () => onClose();
        dialog.addEventListener('close', handleClose);
        return () => dialog.removeEventListener('close', handleClose);
    }, [onClose]);

    const handlePrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    // Arrow key navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrevious();
            else if (e.key === 'ArrowRight') handleNext();
        };
        globalThis.addEventListener('keydown', handleKeyPress);
        return () => globalThis.removeEventListener('keydown', handleKeyPress);
    }, [isOpen, handlePrevious, handleNext]);

    if (!isOpen || images.length === 0) return null;

    const showNavigation = images.length > 1;

    return createPortal(
        <dialog
            ref={dialogRef}
            className="fixed inset-0 z-[9999] m-auto p-4 bg-transparent backdrop:bg-slate-900/90 backdrop:backdrop-blur-sm max-w-7xl w-full overflow-visible"
            aria-label={`${altText} - Afbeeldingen`}
            onClick={(e) => {
                if (e.target === dialogRef.current) onClose();
            }}
            onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
            }}
        >
            <div className="relative flex items-center justify-center min-h-[50vh]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-0 right-0 z-10 bg-white/95 backdrop-blur rounded-full p-3 shadow-lg hover:bg-white transition-colors active:scale-95"
                    aria-label="Sluit afbeelding"
                >
                    <X size={24} className="text-slate-700" />
                </button>

                {/* Previous Button */}
                {showNavigation && (
                    <button
                        onClick={handlePrevious}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur rounded-full p-4 shadow-lg hover:bg-white hover:scale-110 transition-all active:scale-95 group"
                        aria-label="Vorige afbeelding"
                    >
                        <ChevronLeft size={28} className="text-slate-700 group-hover:text-sky-600 transition-colors" />
                    </button>
                )}

                {/* Next Button */}
                {showNavigation && (
                    <button
                        onClick={handleNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur rounded-full p-4 shadow-lg hover:bg-white hover:scale-110 transition-all active:scale-95 group"
                        aria-label="Volgende afbeelding"
                    >
                        <ChevronRight size={28} className="text-slate-700 group-hover:text-sky-600 transition-colors" />
                    </button>
                )}

                {/* Image */}
                <div className="relative max-w-full animate-scaleIn">
                    <img
                        key={currentIndex}
                        src={images[currentIndex]}
                        alt={`${altText} - Afbeelding ${currentIndex + 1} van ${images.length}`}
                        className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-2xl shadow-2xl"
                        width={1200}
                        height={800}
                        loading="eager"
                        decoding="async"
                    />

                    {/* Caption */}
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
                </div>

                {/* Thumbnail Indicators */}
                {showNavigation && images.length <= 5 && (
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((img, index) => (
                            <button
                                key={img}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                                        ? 'bg-white scale-125'
                                        : 'bg-white/50 hover:bg-white/75'
                                    }`}
                                aria-label={`Ga naar afbeelding ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
        </dialog>,
        document.body
    );
};

export default ImageModal;
