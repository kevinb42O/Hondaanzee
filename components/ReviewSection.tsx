import React, { useState } from 'react';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { MessageSquarePlus, X } from 'lucide-react';

interface ReviewSectionProps {
    areaSlug: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ areaSlug }) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isFormOpen, setIsFormOpen] = useState(false);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header Section */}
            <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-black text-slate-900">Reviews & Ervaringen</h3>
                    <p className="text-slate-500 text-sm mt-1">
                        Deel jouw ervaring en help andere hondeneigenaars.
                    </p>
                </div>

                <button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-sky-600/20 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
                >
                    <MessageSquarePlus size={20} />
                    Schrijf een review
                </button>
            </div>

            {/* Review Form (Collapsible/Modal-like inline) */}
            <div
                className={`bg-sky-50 transition-all duration-500 ease-in-out overflow-hidden ${isFormOpen ? 'max-h-[800px] opacity-100 border-b border-sky-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="p-6 md:p-8 relative">
                    <button
                        onClick={() => setIsFormOpen(false)}
                        className="absolute top-4 right-4 text-sky-400 hover:text-sky-700 transition-colors p-2 hover:bg-sky-100 rounded-full"
                        aria-label="Sluiten"
                    >
                        <X size={20} />
                    </button>

                    <div className="max-w-2xl mx-auto">
                        <h4 className="text-xl font-bold text-sky-900 mb-6 text-center">Jouw review delen</h4>
                        <ReviewForm
                            areaSlug={areaSlug}
                            onReviewSubmitted={() => {
                                setRefreshTrigger(prev => prev + 1);
                                setIsFormOpen(false);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="p-6 md:p-8 bg-white">
                <ReviewList areaSlug={areaSlug} refreshTrigger={refreshTrigger} />
            </div>
        </div>
    );
};

export default ReviewSection;
