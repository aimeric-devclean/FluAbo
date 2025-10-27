import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { ProviderIcon } from './ProviderIcon';
import { useStore } from '../store/useStore';
import { Subscription, BillingCycle, SubscriptionCategory, FamilyPaymentMode, ProviderCategory } from '../types';
import { providers } from '../data/providers';
import { Search, Calendar, Users, RotateCw, Split, ChevronLeft } from 'lucide-react';
import dayjs from 'dayjs';
import { toMonthlyEquivalent, toAnnualEquivalent } from '../utils/calculations';
import { getCurrencySymbol } from '../utils/currency';
import { generateUUID } from '../utils/uuid';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    subscription?: Subscription | null;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
    isOpen,
    onClose,
    subscription,
}) => {
    const { addSubscription, updateSubscription, members, currency } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ProviderCategory | 'Tous'>('Tous');
    const [selectedProvider, setSelectedProvider] = useState<string | undefined>(undefined);
    const [showProviderGrid, setShowProviderGrid] = useState(false); // true = mode auto (grille), false = saisie manuelle

    const [formData, setFormData] = useState({
        name: '',
        providerId: '',
        price: '',
        billing: 'monthly' as BillingCycle,
        nextCharge: dayjs().format('YYYY-MM-DD'),
        category: 'Streaming' as SubscriptionCategory,
        isPaused: false,
        familial: false,
        paymentMode: 'rotation' as FamilyPaymentMode,
        participants: [] as string[],
        shares: {} as Record<string, number>,
        notes: '',
    });

    const categoryOptions: SubscriptionCategory[] = Array.from(
        new Set([
            ...providers.map(p => p.category as SubscriptionCategory),
            'Autre' as SubscriptionCategory,
        ])
    ).sort() as SubscriptionCategory[];

    useEffect(() => {
        if (subscription) {
            setFormData({
                name: subscription.name,
                providerId: subscription.providerId || '',
                price: subscription.price.toString(),
                billing: subscription.billing,
                nextCharge: dayjs(subscription.nextCharge).format('YYYY-MM-DD'),
                category: subscription.category,
                isPaused: subscription.isPaused,
                familial: subscription.familial,
                paymentMode: subscription.paymentMode || 'rotation',
                participants: subscription.participants || [],
                shares: subscription.shares || {},
                notes: subscription.notes || '',
            });
            setSelectedProvider(subscription.providerId);
            setShowProviderGrid(false);
        } else {
            setFormData({
                name: '',
                providerId: '',
                price: '',
                billing: 'monthly',
                nextCharge: dayjs().format('YYYY-MM-DD'),
                category: 'Streaming',
                isPaused: false,
                familial: false,
                paymentMode: 'rotation',
                participants: [],
                shares: {},
                notes: '',
            });
            setSelectedProvider(undefined);
            setShowProviderGrid(true);
        }
    }, [subscription, isOpen]);

    const categories: (ProviderCategory | 'Tous')[] = [
        'Tous',
        ...Array.from(new Set(providers.map(p => p.category))).sort()
    ];

    const filteredProviders = providers.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleProviderSelect = (providerId: string) => {
        const provider = providers.find((p) => p.id === providerId);
        setSelectedProvider(providerId);
        setFormData(prev => ({
            ...prev,
            providerId,
            name: provider?.name || prev.name,
            category: (provider?.category as SubscriptionCategory) || prev.category,
        }));
        setShowProviderGrid(false); // on passe en saisie (mais le nom/catégorie restent auto-remplis)
    };

    const clearProvider = () => {
        setSelectedProvider(undefined);
        setFormData(prev => ({ ...prev, providerId: '' }));
        setShowProviderGrid(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(formData.price);
        if (isNaN(price) || price <= 0) {
            alert('Veuillez entrer un prix valide');
            return;
        }

        const newSubscription: Subscription = {
            id: subscription?.id || generateUUID(),
            name: formData.name.trim() || 'Abonnement',
            providerId: formData.providerId || undefined,
            price,
            currency: 'EUR',
            billing: formData.billing,
            nextCharge: dayjs(formData.nextCharge).toISOString(),
            category: formData.category,
            isPaused: formData.isPaused,
            familial: formData.familial,
            participants: formData.familial ? formData.participants : undefined,
            paymentMode: formData.familial ? formData.paymentMode : undefined,
            shares: formData.familial && formData.paymentMode === 'shared' ? formData.shares : undefined,
            rotation:
                formData.familial && formData.participants.length > 0
                    ? { order: formData.participants, startDate: dayjs().toISOString(), currentIndex: 0 }
                    : undefined,
            history: formData.familial ? [] : undefined,
            notes: formData.notes || undefined,
        };

        if (subscription) updateSubscription(subscription.id, newSubscription);
        else addSubscription(newSubscription);

        onClose();
    };

    const monthly = parseFloat(formData.price) || 0;
    const monthlyEquiv = toMonthlyEquivalent(monthly, formData.billing);
    const annualEquiv = toAnnualEquivalent(monthly, formData.billing);
    const selectedProviderData = providers.find(p => p.id === selectedProvider);

    // Titre du header + bouton retour si on est en saisie manuelle (pas en mode édition)
    const headerTitle: React.ReactNode = (
        <div className="flex items-center gap-2">
            {!subscription && !showProviderGrid && (
                <button
                    type="button"
                    onClick={() => setShowProviderGrid(true)}
                    className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg dark:transition"
                    aria-label="Retour"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>
            )}
            <span className="truncate">{subscription ? "Modifier l'abonnement" : 'Nouvel abonnement'}</span>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={headerTitle} size="lg">
            {/* fix overflow du date-picker natif */}
            <style>{`
        input[type="date"].no-overflow { box-sizing:border-box; min-width:0; }
        input[type="date"].no-overflow::-webkit-calendar-picker-indicator { margin:0; padding:0; }
        input[type="date"].no-overflow::-webkit-inner-spin-button,
        input[type="date"].no-overflow::-webkit-clear-button { display:none; }
      `}</style>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Mode grille plateformes */}
                {!subscription && showProviderGrid && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                Plateforme
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowProviderGrid(false)}
                                className="text-xs font-medium text-violet-600 hover:text-violet-700"
                            >
                                Saisir manuellement
                            </button>
                        </div>

                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une plateforme…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                            />
                        </div>

                        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                            {(['Tous', ...Array.from(new Set(providers.map(p => p.category))).sort()] as (ProviderCategory | 'Tous')[])
                                .map(category => (
                                    <button
                                        key={category}
                                        type="button"
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === category
                                                ? 'bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 text-white shadow-sm'
                                                : 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 dark:backdrop-blur'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                        </div>

                        {/* 2 colonnes pour afficher les titres complets */}
                        <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                            {filteredProviders.map((provider) => (
                                <button
                                    key={provider.id}
                                    type="button"
                                    onClick={() => handleProviderSelect(provider.id)}
                                    className="group relative p-3 rounded-xl border border-gray-200/60 dark:border-gray-800 bg-white/80 dark:bg-gray-900/50 backdrop-blur hover:border-violet-300 dark:hover:border-violet-700 transition-all hover:shadow-md"
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 mx-auto"
                                        style={{ backgroundColor: provider.color }}
                                    >
                                        <ProviderIcon icon={provider.icon} svg={provider.svg} size={22} className="text-white" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 text-center leading-tight">
                                        {provider.name}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bandeau plateforme sélectionnée */}
                {selectedProvider && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 dark:bg-gray-900/40 backdrop-blur border border-violet-200/40 dark:border-violet-800/30">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0"
                            style={{ backgroundColor: selectedProviderData?.color }}
                        >
                            <ProviderIcon icon={selectedProviderData?.icon || 'circle'} svg={selectedProviderData?.svg} size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{selectedProviderData?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{selectedProviderData?.category}</p>
                        </div>
                        <button type="button" onClick={clearProvider} className="text-xs text-violet-600 font-medium">
                            Changer
                        </button>
                    </div>
                )}

                {/* Infos éditables */}
                <div className="space-y-3">
                    {/* Nom + Catégorie */}
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                                Nom de l’abonnement
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder={selectedProviderData?.name || 'Ex: Netflix 4K, Partage coloc…'}
                                className="w-full px-3 py-2 text-sm rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                            />
                            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Auto depuis la plateforme, mais 100% modifiable.</p>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                                Catégorie
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value as SubscriptionCategory })}
                                className="w-full px-3 py-2 text-sm rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                            >
                                {categoryOptions.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Prix & Périodicité */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                                Prix
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-3 py-2 pr-8 text-sm rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{getCurrencySymbol(currency)}</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                                Périodicité
                            </label>
                            <select
                                value={formData.billing}
                                onChange={(e) => setFormData({ ...formData, billing: e.target.value as BillingCycle })}
                                className="w-full px-3 py-2 text-sm rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                            >
                                <option value="weekly">Hebdomadaire</option>
                                <option value="monthly">Mensuel</option>
                                <option value="annual">Annuel</option>
                            </select>
                        </div>
                    </div>

                    {/* équivalents */}
                    {formData.price && (
                        <div className="flex gap-2 text-xs">
                            <div className="flex-1 py-1.5 px-2.5 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-center">
                                <span className="text-gray-600 dark:text-gray-400">Mensuel: </span>
                                <span className="font-bold text-violet-600 dark:text-violet-400">
                                    {monthlyEquiv.toFixed(2)} {getCurrencySymbol(currency)}
                                </span>
                            </div>
                            <div className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                                <span className="text-gray-600 dark:text-gray-400">Annuel: </span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                    {annualEquiv.toFixed(2)} {getCurrencySymbol(currency)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Date de paiement (ex- Prochain débit) */}
                    <div>
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                            Date de paiement
                        </label>
                        <div className="relative overflow-hidden rounded-xl">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            <input
                                type="date"
                                required
                                value={formData.nextCharge}
                                onChange={(e) => setFormData({ ...formData, nextCharge: e.target.value })}
                                className="no-overflow block w-full min-w-0 pl-9 pr-12 py-2 text-sm bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500 rounded-xl"
                            />
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                                <Calendar size={16} className="text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Familial */}
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/70 dark:bg-gray-900/40 backdrop-blur border border-gray-200/50 dark:border-gray-800 cursor-pointer hover:border-violet-300 dark:hover:border-violet-600 transition-colors">
                        <input
                            type="checkbox"
                            checked={formData.familial}
                            onChange={(e) => setFormData({ ...formData, familial: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <Users size={16} className="text-violet-600" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Abonnement familial</span>
                    </label>

                    {formData.familial && (
                        <div className="space-y-3 p-3 rounded-xl bg-gradient-to-r from-violet-50/60 to-blue-50/60 dark:from-violet-900/10 dark:to-blue-900/10 border border-violet-200/50 dark:border-violet-800/50">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paymentMode: 'rotation' })}
                                    className={`p-2.5 rounded-lg border-2 transition-all ${formData.paymentMode === 'rotation' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                                >
                                    <RotateCw size={16} className={`mx-auto mb-1 ${formData.paymentMode === 'rotation' ? 'text-violet-600' : 'text-gray-400'}`} />
                                    <div className="text-xs font-medium text-gray-900 dark:text-white">Tour par tour</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paymentMode: 'shared' })}
                                    className={`p-2.5 rounded-lg border-2 transition-all ${formData.paymentMode === 'shared' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                                >
                                    <Split size={16} className={`mx-auto mb-1 ${formData.paymentMode === 'shared' ? 'text-violet-600' : 'text-gray-400'}`} />
                                    <div className="text-xs font-medium text-gray-900 dark:text-white">Partage</div>
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                {members.map((member) => {
                                    const isParticipant = formData.participants.includes(member.id);
                                    return (
                                        <label
                                            key={member.id}
                                            className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${isParticipant ? 'bg-white dark:bg-gray-800 shadow-sm' : 'dark:hover:bg-gray-800/50'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isParticipant}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({
                                                            ...formData,
                                                            participants: [...formData.participants, member.id],
                                                            shares: { ...formData.shares, [member.id]: 1 },
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            participants: formData.participants.filter(id => id !== member.id),
                                                            shares: Object.fromEntries(Object.entries(formData.shares).filter(([id]) => id !== member.id)),
                                                        });
                                                    }
                                                }}
                                                className="w-3.5 h-3.5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                            />
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: member.color }}>
                                                {member.name.charAt(0)}
                                            </div>
                                            <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{member.name}</span>
                                            {isParticipant && formData.paymentMode === 'shared' && (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={formData.shares[member.id] || 1}
                                                    onChange={(e) => setFormData({ ...formData, shares: { ...formData.shares, [member.id]: parseInt(e.target.value) || 1 } })}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-12 px-2 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-center"
                                                />
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                            Notes (optionnel)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 text-sm rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500 resize-none"
                            placeholder="Ex: penser à résilier avant le 28/02…"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800 dark:rounded-xl transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 hover:via-blue-600 rounded-xl transition-all shadow-lg active:scale-[0.99]"
                    >
                        {subscription ? 'Enregistrer' : 'Ajouter'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
