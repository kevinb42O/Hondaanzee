import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../utils/supabaseClient';
import { X, Mail, Loader2, LogIn } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        });

        if (error) {
            setMessage({ type: 'error', text: error.message || 'Er is een fout opgetreden bij het inloggen.' });
        } else {
            setMessage({ type: 'success', text: 'Check je email voor de inloglink!' });
        }
        setLoading(false);
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-600 transition-colors touch-target rounded-full"
                    aria-label="Sluiten"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LogIn size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Inloggen</h2>
                        <p className="text-slate-600 text-sm">
                            Log in om een review te plaatsen. We sturen een magische link naar je email.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1">
                                Emailadres
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    inputMode="email"
                                    autoComplete="email"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    autoFocus
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    aria-invalid={message?.type === 'error' ? true : false}
                                    aria-describedby={message ? 'auth-email-msg' : undefined}
                                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-900 min-h-[44px] ${message?.type === 'error' ? 'border-red-300' : 'border-slate-200'}`}
                                    placeholder="jouw@email.com"
                                />
                                <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
                            </div>
                        </div>

                        {message && (
                            <div
                                id="auth-email-msg"
                                role={message.type === 'error' ? 'alert' : 'status'}
                                aria-live="polite"
                                className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}
                            >
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full min-h-[48px] bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-sky-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Stuur inloglink'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-400">
                            Door in te loggen ga je akkoord met onze voorwaarden. Geen zorgen, we sturen geen spam.
                        </p>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AuthModal;
