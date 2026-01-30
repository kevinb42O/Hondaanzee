import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { User, MessageSquare } from 'lucide-react';

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    user_name: string; // Changed from profiles relation to direct column
}

interface ReviewListProps {
    areaSlug: string;
    // Trigger to reload reviews
    refreshTrigger: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ areaSlug, refreshTrigger }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, [areaSlug, refreshTrigger]);

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('reviews')
            .select(`
        id,
        rating,
        comment,
        created_at,
        user_name
      `)
            .eq('area_slug', areaSlug)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setReviews(data as any);
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="py-8 text-center text-slate-400">Reviews laden...</div>;
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <MessageSquare size={32} />
                </div>
                <p className="text-slate-500 font-medium">Nog geen reviews.</p>
                <p className="text-slate-400 text-sm">Wees de eerste die een ervaring deelt!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Reviews <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{reviews.length}</span>
            </h3>

            <div className="grid gap-4">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-sky-100 rounded-full flex items-center justify-center text-indigo-600">
                                    <User size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">
                                        {review.user_name || 'Hondenliefhebber'}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: nl })}
                                    </div>
                                </div>
                            </div>
                            <StarRating rating={review.rating} size={16} readOnly />
                        </div>

                        {review.comment && (
                            <p className="text-slate-600 leading-relaxed text-sm md:text-base pl-12 md:pl-14">
                                "{review.comment}"
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewList;
