import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    max?: number;
    size?: number;
    onRate?: (rating: number) => void;
    readOnly?: boolean;
    className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    max = 5,
    size = 20,
    onRate,
    readOnly = false,
    className = '',
}) => {
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {[...Array(max)].map((_, index) => {
                const starValue = index + 1;
                const isActive = starValue <= (hoverRating ?? rating);

                return (
                    <button
                        key={index}
                        type="button"
                        disabled={readOnly}
                        onClick={() => onRate?.(starValue)}
                        onMouseEnter={() => !readOnly && setHoverRating(starValue)}
                        onMouseLeave={() => !readOnly && setHoverRating(null)}
                        className={`transition-all duration-200 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                            }`}
                    >
                        <Star
                            size={size}
                            className={`${isActive
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-slate-100 text-slate-300'
                                } transition-colors duration-200`}
                            strokeWidth={isActive ? 0 : 2}
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
