import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, TrendingUp, Calendar, CreditCard, Filter, ChevronRight } from 'lucide-react';
import { Header } from '../components/Header';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { useStore } from '../store/useStore';
import { getTotalMonthly, getTotalAnnual } from '../utils/calculations';
import { Subscription, ProviderCategory } from '../types';
import { getCurrencySymbol } from '../utils/currency';
import { providers } from '../data/providers';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { subscriptions, sortBy, currency } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ProviderCategory | 'Tous'>('Tous');

    const totalMonthly = getTotalMonthly(subscriptions);
    const totalAnnual = getTotalAnnual(subscriptions);
    const activeCount = subscriptions.filter((s) => !s.isPaused).length;

    const categories: (ProviderCategory | 'Tous')[] = [
        'Tous',
        ...Array.from(new Set(providers.map(p => p.category))).sort()
    ];

    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Tous' || sub.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'price':
                return b.price - a.price;
            case 'nextCharge':
                return new Date(a.nextCharge).getTime() - new Date(b.nextCharge).getTime();
            default:
                return 0;
        }
    });

    const handleEdit = (subscription: Subscription) => {
        navigate(`/subscription/edit?edit=${subscription.id}`);
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-pink-50/20 dark:from-gray-950 dark:via-violet-950/10 dark:to-pink-950/10">
                <div className="px-4 pt-20 pb-40 max-w-2xl mx-auto">
                    {/* Header Section - Compact avec style fluide */}
                    <div className="flex items-center justify-between mb-6 animate-slide-up">
                        <div>
                            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 via-blue-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                                Mes Abonnements
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                        {activeCount} actif{activeCount > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <span className="text-gray-300 dark:text-gray-700">•</span>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    {subscriptions.length} total
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards - Design fluide et compact */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="relative overflow-hidden glass-effect rounded-2xl p-4 border border-violet-200/30 dark:border-violet-800/20 transition-all duration-300 active:scale-95 animate-bounce-in">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/10 rounded-full blur-2xl"></div>
                            <div className="relative flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-[11px] uppercase tracking-wider font-bold text-violet-600 dark:text-violet-400 mb-1 flex items-center gap-1">
                                        <Calendar size={12} className="animate-float" />
                                        Mensuel
                                    </p>
                                    <p className="text-2xl font-black bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                                        {getCurrencySymbol(currency)}{totalMonthly.toFixed(0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="relative overflow-hidden glass-effect rounded-2xl p-4 border border-blue-200/30 dark:border-blue-800/20 transition-all duration-300 active:scale-95 animate-bounce-in" style={{animationDelay: '0.1s'}}>
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>
                            <div className="relative flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-[11px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                                        <TrendingUp size={12} className="animate-float" />
                                        Annuel
                                    </p>
                                    <p className="text-2xl font-black bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                                        {getCurrencySymbol(currency)}{totalAnnual.toFixed(0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters - Style fluide */}
                    <div className="mb-4 space-y-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all"
                            />
                        </div>

                        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === category
                                            ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md'
                                            : 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 dark:backdrop-blur'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subscriptions List */}
                    <div className="space-y-1.5">
                        {filteredSubscriptions.length === 0 && subscriptions.length > 0 ? (
                            <div className="text-center py-12">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Aucun abonnement trouvé
                                </p>
                            </div>
                        ) : subscriptions.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-pink-500/10 flex items-center justify-center">
                                    <Plus size={20} className="text-violet-600" />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Aucun abonnement pour le moment
                                </p>
                                <button
                                    onClick={() => navigate('/subscription/new')}
                                    className="px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-lg"
                                >
                                    Ajouter un abonnement
                                </button>
                            </div>
                        ) : (
                            sortedSubscriptions.map((subscription) => (
                                <SubscriptionCard
                                    key={subscription.id}
                                    subscription={subscription}
                                    onEdit={handleEdit}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <FloatingActionButton
                onClick={() => navigate('/subscription/new')}
            />
        </>
    );
};