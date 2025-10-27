import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { Family } from './pages/Family';
import { Analytics } from './pages/Analytics';
import { Calculator } from './pages/Calculator';
import { Settings } from './pages/Settings';
import { Budget } from './pages/Budget';
import { SubscriptionForm } from './pages/SubscriptionForm';
import { RotationManager } from './pages/RotationManager';
import { Onboarding } from './pages/Onboarding';
import { MemberForm } from './pages/MemberForm';
import { useTheme } from './hooks/useTheme';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import Splash from './components/Splash';

dayjs.extend(relativeTime);

dayjs.extend(localizedFormat);
dayjs.locale('fr');

/**
 * Gère les meta tags pour la status bar iOS (notch) + couleur dynamique.
 * - Ajoute/force viewport-fit=cover
 * - Met à jour <meta name="theme-color"> selon le thème actuel
 * - Fixe la couleur de fond html/body pour éviter tout flash blanc
 */
function ThemeColorManager() {
    React.useEffect(() => {
        // 1) viewport-fit=cover
        const vp =
            (document.querySelector('meta[name="viewport"]') as HTMLMetaElement) ||
            (() => {
                const m = document.createElement('meta');
                m.name = 'viewport';
                document.head.appendChild(m);
                return m;
            })();

        const base = vp.content || 'width=device-width, initial-scale=1';
        vp.content = base.includes('viewport-fit=cover')
            ? base
            : `${base}, viewport-fit=cover`;

        // 2) theme-color
        const themeMeta =
            (document.querySelector('meta[name="theme-color"]') as HTMLMetaElement) ||
            (() => {
                const m = document.createElement('meta');
                m.name = 'theme-color';
                document.head.appendChild(m);
                return m;
            })();

        const apply = () => {
            const isDark =
                document.documentElement.classList.contains('dark') ||
                window.matchMedia?.('(prefers-color-scheme: dark)').matches;

            // Cohérent avec nos headers en verre
            const color = isDark ? '#0b1020' /* slate-950-ish */ : '#ffffffcc';

            themeMeta.setAttribute('content', color);

            // Fond global pour éviter tout bandeau blanc autour du notch
            document.documentElement.style.backgroundColor = isDark ? '#0b1020' : '#ffffff';
            document.body.style.backgroundColor = isDark ? '#0b1020' : '#ffffff';

            // iOS PWA (si jamais) – status bar translucide
            const appleStatus =
                (document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement) ||
                (() => {
                    const m = document.createElement('meta');
                    m.name = 'apple-mobile-web-app-status-bar-style';
                    document.head.appendChild(m);
                    return m;
                })();
            appleStatus.setAttribute('content', 'black-translucent');
        };

        apply();

        // Observe changement de thème (classe 'dark' sur <html>)
        const obs = new MutationObserver(apply);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        // Observe changement de scheme système
        const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
        const handle = () => apply();
        mq?.addEventListener?.('change', handle);

        return () => {
            obs.disconnect();
            mq?.removeEventListener?.('change', handle);
        };
    }, []);

    return null;
}

function AppContent() {
    useTheme();
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(
        () => localStorage.getItem('fluxy_onboarding_completed') === 'true'
    );

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            <ThemeColorManager />
            <Routes>
                <Route
                    path="/onboarding"
                    element={
                        hasCompletedOnboarding ? (
                            <Navigate to="/" replace />
                        ) : (
                            <Onboarding onComplete={() => setHasCompletedOnboarding(true)} />
                        )
                    }
                />
                <Route
                    path="/"
                    element={
                        hasCompletedOnboarding ? (
                            <Dashboard />
                        ) : (
                            <Navigate to="/onboarding" replace />
                        )
                    }
                />
                <Route
                    path="/family"
                    element={
                        hasCompletedOnboarding ? (
                            <Family />
                        ) : (
                            <Navigate to="/onboarding" replace />
                        )
                    }
                />
                <Route
                    path="/analytics"
                    element={
                        hasCompletedOnboarding ? (
                            <Analytics />
                        ) : (
                            <Navigate to="/onboarding" replace />
                        )
                    }
                />
                <Route
                    path="/calculator"
                    element={
                        hasCompletedOnboarding ? (
                            <Calculator />
                        ) : (
                            <Navigate to="/onboarding" replace />
                        )
                    }
                />
                <Route
                    path="/settings"
                    element={
                        hasCompletedOnboarding ? (
                            <Settings />
                        ) : (
                            <Navigate to="/onboarding" replace />
                        )
                    }
                />
                <Route
                    path="/budget"
                    element={
                        hasCompletedOnboarding ? (
                            <Budget />
                        ) : (
                            <Navigate to="/onboarding" replace />
                        )
                    }
                />
                <Route
                    path="/subscription/new"
                    element={
                        hasCompletedOnboarding ? (
                            <SubscriptionForm />
                        ) : (
                            <Navigate to="/onboarding" replace />
                        )
                    }
                />
                <Route
                    path="/subscription/edit"
                    element={
                        hasCompletedOnboarding ? (
                            <SubscriptionForm />
                        ) : (
                            <Navigate to="/onboarding" replace />
                        )
                    }
                />
                <Route
                    path="/rotation"
                    element={
                        hasCompletedOnboarding ? (
                            <RotationManager />
                        ) : (
                            <Navigate to="/onboarding" replace />
                        )
                    }
                />
                <Route
                    path="/member/new"
                    element={
                        hasCompletedOnboarding ? (
                            <MemberForm />
                        ) : (
                            <Navigate to="/onboarding" replace />
                        )
                    }
                />
                <Route
                    path="/member/edit"
                    element={
                        hasCompletedOnboarding ? (
                            <MemberForm />
                        ) : (
                            <Navigate to="/onboarding" replace />
                        )
                    }
                />
            </Routes>
            {hasCompletedOnboarding && <BottomNav />}
        </div>
    );
}

function App() {
    const [showSplash, setShowSplash] = React.useState(
        () => !sessionStorage.getItem('fluxy_splash_seen')
    );

    React.useEffect(() => {
        if (!showSplash) return;
        const t = setTimeout(() => {
            sessionStorage.setItem('fluxy_splash_seen', '1');
            setShowSplash(false);
        }, 2200);
        return () => clearTimeout(t);
    }, [showSplash]);

    return (
        <BrowserRouter>
            {showSplash ? (
                <div className="animate-[fluxyFadeOut_0.4s_ease_1.8s_forwards]">
                    <Splash />
                </div>
            ) : (
                <AppContent />
            )}

            <style>{`
        @keyframes fluxyFadeOut { to { opacity: 0; visibility: hidden; } }
        /* Safe-area helpers (iOS) si besoin dans tes pages */
        .pt-safe { padding-top: max(env(safe-area-inset-top), 0px); }
        .pb-safe { padding-bottom: max(env(safe-area-inset-bottom), 0px); }
      `}</style>
        </BrowserRouter>
    );
}

export default App;
