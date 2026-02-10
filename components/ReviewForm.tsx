import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import StarRating from './StarRating';
import { Loader2, Send } from 'lucide-react';

interface ReviewFormProps {
    areaSlug: string;
    onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ areaSlug, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (rating === 0) {
            setMessage({ type: 'error', text: 'Selecteer minimaal 1 ster.' });
            return;
        }

        if (!userName.trim()) {
            setMessage({ type: 'error', text: 'Vul alsjeblieft je naam in.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.from('reviews').insert({
                area_slug: areaSlug,
                rating,
                comment,
                user_name: userName // New field
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Bedankt! Je review is geplaatst.' });
            setRating(0);
            setComment('');
            setUserName('');

            setTimeout(() => {
                onReviewSubmitted();
            }, 500);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Kon review niet plaatsen.';
            setMessage({ type: 'error', text: message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-sky-100 p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
                Deel jouw ervaring
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset>
                    <legend className="block text-sm font-bold text-slate-700 mb-2">
                        Hoeveel sterren geef je?
                    </legend>
                    <div className="flex justify-center md:justify-start">
                        <StarRating rating={rating} onRate={setRating} size={36} />
                    </div>
                </fieldset>

                <div>
                    <label htmlFor="userName" className="block text-sm font-bold text-slate-700 mb-2">
                        Jouw naam
                    </label>
                    <input
                        type="text"
                        id="userName"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium placeholder:text-slate-400"
                        placeholder="Jouw naam"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="comment" className="block text-sm font-bold text-slate-700 mb-2">
                        Jouw ervaring / tips
                    </label>
                    <textarea
                        id="comment"
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium resize-none placeholder:text-slate-400"
                        placeholder="Was het druk? Is de omheining goed? Is er water in de buurt?..."
                    />
                </div>

                {message && (
                    <div
                        className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <>
                            Review plaatsen <Send size={18} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
