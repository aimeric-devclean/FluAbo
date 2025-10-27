import React, { useEffect, useState } from 'react';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DynamicBackground } from '../components/DynamicBackground';
import { Modal } from '../components/Modal';
import { supabase } from '../lib/supabase';
import { translateAuthError } from '../utils/authErrors';

export const Login: React.FC = () => {
    const { signInWithEmail } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [pwdVisible, setPwdVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [awaitingVerification, setAwaitingVerification] = useState(false);

    // 🔒 Lock total de la page (iOS + Android) pendant le Login
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;

        const prevHtml = html.style.cssText;
        const prevBody = body.style.cssText;

        html.style.height = '100%';
        html.style.overflow = 'hidden';
        (html.style as any).overscrollBehaviorY = 'none';
        (html.style as any).overscrollBehavior = 'none';

        body.style.height = '100%';
        body.style.overflow = 'hidden';
        (body.style as any).touchAction = 'none';

        // 👉 NE bloque PAS les scrolls venant d'une zone "data-scrollable" (ex: ton Modal)
        const allowScrollInScrollable = (e: TouchEvent) => {
            let el = e.target as HTMLElement | null;
            while (el && el !== document.body) {
                if (el.hasAttribute('data-scrollable')) return; // autorisé
                const cs = window.getComputedStyle(el);
                const canScrollY =
                    (cs.overflowY === 'auto' || cs.overflowY === 'scroll') &&
                    el.scrollHeight > el.clientHeight;
                if (canScrollY) return; // autorisé
                el = el.parentElement;
            }
            // Sinon : on bloque (empêche le rubber-band de la page)
            e.preventDefault();
        };

        document.addEventListener('touchmove', allowScrollInScrollable, { passive: false });

        return () => {
            document.removeEventListener('touchmove', allowScrollInScrollable);
            html.style.cssText = prevHtml;
            body.style.cssText = prevBody;
        };
    }, []);

    // 👉 Assure-toi d’avoir ça dans index.html :
    // <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: window.location.origin },
            });
            if (error) throw error;

            if (data.user && !data.session) {
                setSuccess('Vérifiez votre email pour confirmer votre compte.');
                setAwaitingVerification(true);
            } else if (data.session) {
                setSuccess('Compte créé avec succès !');
                setAwaitingVerification(true);
            }
        } catch (err: any) {
            setError(translateAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: verificationCode,
                type: 'signup',
            });
            if (error) throw error;
        } catch (err: any) {
            setError(translateAuthError(err));
            setLoading(false);
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            await signInWithEmail(email, password);
        } catch (err: any) {
            setError(translateAuthError(err));
            setLoading(false);
        }
    };

    return (
        <>
            <DynamicBackground />

            {/* Écran plein, safe-areas, zéro scroll, centré */}
            <div
                className="
          fixed inset-0
          h-[100svh] w-screen
          pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]
          pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]
          overflow-hidden
        "
            >
                <div className="h-full w-full grid place-items-center px-4">
                    <div className="w-full max-w-md select-none">
                        {/* Brand */}
                        <div className="text-center mb-5">
                            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-violet-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">
                                Fluxy
                            </h1>
                            <p className="mt-1.5 text-sm text-gray-600 dark:text-slate-400">
                                Gérez vos abonnements en famille
                            </p>
                        </div>

                        {/* Card compacte */}
                        <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-900/55 backdrop-blur-xl border border-white/30 dark:border-white/10 p-5 shadow-xl">
                            <div className="absolute -top-24 -right-24 w-56 h-56 bg-gradient-to-br from-violet-500/15 via-blue-500/10 to-pink-500/15 rounded-full blur-3xl" />
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {awaitingVerification ? 'Vérification' : isSignUp ? 'Inscription' : 'Connexion'}
                                    </h2>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10">
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}
                                {success && (
                                    <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/10">
                                        <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
                                    </div>
                                )}

                                {/* ÉTAT : en attente de vérification */}
                                {awaitingVerification ? (
                                    <div className="space-y-4 text-center py-2">
                                        <Mail className="w-12 h-12 mx-auto text-violet-500" />
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                                                Compte créé avec succès !
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                                Vérifiez votre boîte mail puis connectez-vous.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setAwaitingVerification(false);
                                                setIsSignUp(false);
                                                setSuccess('');
                                            }}
                                            className="w-full px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 hover:from-violet-600 hover:via-blue-600 hover:to-pink-600 shadow-lg active:scale-[0.98] transition"
                                        >
                                            Se connecter
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Form principal */}
                                        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-3">
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                                    Email
                                                </label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-gray-200/60 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition"
                                                    placeholder="Votre email"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                                    Mot de passe
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        id="password"
                                                        type={pwdVisible ? 'text' : 'password'}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                        minLength={6}
                                                        className="w-full px-3 py-2.5 pr-10 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-gray-200/60 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition"
                                                        placeholder="Votre mot de passe"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setPwdVisible(!pwdVisible)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                                                        aria-label={pwdVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                                    >
                                                        {pwdVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 hover:from-violet-600 hover:via-blue-600 hover:to-pink-600 shadow-lg active:scale-[0.98] transition disabled:opacity-60"
                                            >
                                                {loading ? 'Chargement…' : isSignUp ? 'Créer un compte' : 'Se connecter'}
                                            </button>

                                            <div className="flex items-center justify-between text-sm pt-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsSignUp(!isSignUp);
                                                        setError('');
                                                        setSuccess('');
                                                    }}
                                                    className="font-medium bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent hover:opacity-80"
                                                >
                                                    {isSignUp ? 'Se connecter' : "S'inscrire"}
                                                </button>
                                                <span className="text-gray-500 dark:text-slate-400 opacity-70">v1.0</span>
                                            </div>
                                        </form>

                                        {/* Vérif code (désactivée par défaut) */}
                                        {false && (
                                            <form onSubmit={handleVerifyCode} className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                                                    Code de vérification
                                                </label>
                                                <input
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                    className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-gray-200/60 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition"
                                                    placeholder="123456"
                                                />
                                                <button
                                                    type="submit"
                                                    className="w-full px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 hover:from-violet-600 hover:via-blue-600 hover:to-pink-600 shadow"
                                                >
                                                    Vérifier
                                                </button>
                                            </form>
                                        )}
                                    </>
                                )}

                                <p className="text-xs text-center text-gray-500 dark:text-slate-500 pt-1">
                                    En continuant, vous acceptez nos{' '}
                                    <button
                                        onClick={() => setShowTerms(true)}
                                        className="font-medium bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent hover:opacity-80"
                                    >
                                        conditions
                                    </button>
                                    .
                                </p>
                            </div>
                        </div>

                        {/* Badges compacts */}
                        <div className="mt-4 flex items-center justify-center gap-6 text-[11px] text-gray-600 dark:text-slate-400">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                Cloud
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                                Familial
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={showTerms}
                onClose={() => setShowTerms(false)}
                title="Conditions d'utilisation"
                size="xl"
            >
                <div className="space-y-6 text-gray-700 dark:text-slate-300">
                    {/* … tes sections … */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">1. Acceptation des conditions</h3>
                        <p className="text-sm leading-relaxed">
                            En accédant et en utilisant Fluxy, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre application.
                        </p>
                    </section>
                    {/* … etc … */}
                    <div className="pt-4 border-t border-gray-200 dark:border-slate-700 text-xs text-gray-500 dark:text-slate-500">
                        <p>Dernière mise à jour : Octobre 2025</p>
                        <p className="mt-1">Version 1.0</p>
                    </div>
                </div>
            </Modal>
        </>
    );
};
