import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Search, Calendar, Users, RotateCw, Split, Check, Upload, Image as ImageIcon } from 'lucide-react';
import { ProviderIcon } from '../components/ProviderIcon';
import { useStore } from '../store/useStore';
import { Subscription, BillingCycle, SubscriptionCategory, FamilyPaymentMode, ProviderCategory } from '../types';
import { providers } from '../data/providers';
import dayjs from 'dayjs';
import { toMonthlyEquivalent, toAnnualEquivalent } from '../utils/calculations';
import { getCurrencySymbol } from '../utils/currency';
import { generateUUID } from '../utils/uuid';

export const SubscriptionForm: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    const { addSubscription, updateSubscription, subscriptions, members, currency } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ProviderCategory | 'Tous'>('Tous');
    const [selectedProvider, setSelectedProvider] = useState<string | undefined>(undefined);
    const [showProviderGrid, setShowProviderGrid] = useState(false);
    const [isManual, setIsManual] = useState(false);
    const [customIcon, setCustomIcon] = useState<string>('');
    const [customColor, setCustomColor] = useState('#6B7280');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const subscription = editId ? subscriptions.find(s => s.id === editId) : null;

    const [formData, setFormData] = useState({
        name: '',
        providerId: '',
        price: '',
        billing: 'monthly' as BillingCycle,
        nextCharge: dayjs().format('YYYY-MM-DD'),
        category: 'Streaming Vidéo' as SubscriptionCategory,
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
            if (subscription.customIcon) {
                setCustomIcon(subscription.customIcon);
                setCustomColor(subscription.customColor || '#6B7280');
                setIsManual(true);
            }
            setShowProviderGrid(false);
        } else {
            setShowProviderGrid(true);
        }
    }, [subscription]);

    const categories: (ProviderCategory | 'Tous')[] = [
        'Tous',
        ...Array.from(new Set(providers.map(p => p.category))).sort()
    ];

    const filteredProviders = providers.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const selectedProviderData = providers.find((p) => p.id === selectedProvider);

    const handleProviderSelect = (providerId: string) => {
        const provider = providers.find((p) => p.id === providerId);
        if (provider) {
            setSelectedProvider(providerId);
            setIsManual(false);
            setCustomIcon('');
            setFormData((prev) => ({
                ...prev,
                providerId,
                name: provider.name,
                category: provider.category as SubscriptionCategory,
            }));
            setShowProviderGrid(false);
        }
    };

    const handleManualSelect = () => {
        setSelectedProvider(undefined);
        setIsManual(true);
        setShowProviderGrid(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('L\'image est trop volumineuse (max 5MB)');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomIcon(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.price) {
            return;
        }

        if (isManual && !customIcon) {
            alert('Veuillez ajouter une icône pour votre abonnement');
            return;
        }

        const newSubscription: Subscription = {
            id: subscription?.id || generateUUID(),
            name: formData.name,
            providerId: isManual ? undefined : formData.providerId,
            customIcon: isManual ? customIcon : undefined,
            customColor: isManual ? customColor : undefined,
            price: parseFloat(formData.price),
            currency: currency,
            billing: formData.billing,
            nextCharge: formData.nextCharge,
            category: formData.category,
            isPaused: formData.isPaused,
            familial: formData.familial,
            paymentMode: formData.paymentMode,
            participants: formData.participants,
            shares: formData.shares,
            notes: formData.notes,
        };

        if (subscription) {
            updateSubscription(subscription.id, newSubscription);
        } else {
            addSubscription(newSubscription);
        }

        navigate('/');
    };

    const monthlyPrice = formData.price ? toMonthlyEquivalent(parseFloat(formData.price), formData.billing) : 0;
    const annualPrice = formData.price ? toAnnualEquivalent(parseFloat(formData.price), formData.billing) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-pink-50/20 dark:from-gray-950 dark:via-violet-950/10 dark:to-pink-950/10">
            <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                        {subscription ? 'Modifier' : 'Nouvel'} Abonnement
                    </h1>
                    <button
                        onClick={() => navigate('/')}
                        className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center  transition-transform"
                    >
                        <X size={20} className="text-gray-700 dark:text-gray-300" />
                    </button>
                </div>

                {showProviderGrid ? (
                    <div className="space-y-4 animate-slide-up">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Rechercher un service..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl glass-effect text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 transition-all"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                                        selectedCategory === cat
                                            ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg'
                                            : 'glass-effect text-gray-700 dark:text-gray-300 '
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {filteredProviders.map((provider) => (
                                <button
                                    key={provider.id}
                                    onClick={() => handleProviderSelect(provider.id)}
                                    className="group glass-effect rounded-2xl p-4  transition-all flex flex-col items-center gap-2"
                                >
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md group- transition-transform"
                                        style={{ backgroundColor: provider.color }}
                                    >
                                        <ProviderIcon icon={provider.icon} svg={provider.svg} size={24} className="text-white" />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">
                                        {provider.name}
                                    </span>
                                </button>
                            ))}
                            <button
                                onClick={handleManualSelect}
                                className="glass-effect rounded-2xl p-4  transition-all flex flex-col items-center gap-2"
                            >
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center shadow-md">
                                    <Upload size={24} className="text-white" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">
                                    Personnalisé
                                </span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-slide-up">
                        {isManual ? (
                            <div className="glass-effect rounded-2xl p-4">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Abonnement personnalisé</h3>

                                <div className="flex gap-4 items-start">
                                    <div className="flex-shrink-0">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="relative w-20 h-20 rounded-xl overflow-hidden shadow-lg  transition-all group"
                                            style={{ backgroundColor: customColor }}
                                        >
                                            {customIcon ? (
                                                <img src={customIcon} alt="Icon" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon size={32} className="text-white opacity-70 transition-opacity" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black opacity-0 transition-opacity flex items-center justify-center">
                                                <Upload size={20} className="text-white" />
                                            </div>
                                        </button>
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                Couleur de fond
                                            </label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="color"
                                                    value={customColor}
                                                    onChange={(e) => setCustomColor(e.target.value)}
                                                    className="w-12 h-12 rounded-xl cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                                                />
                                                <div className="flex-1 px-3 py-2 rounded-xl glass-effect text-sm font-mono text-gray-700 dark:text-gray-300">
                                                    {customColor}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Cliquez sur l'icône pour uploader une image depuis votre galerie (max 5MB)
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowProviderGrid(true)}
                                    className="mt-4 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                                >
                                    Choisir un service prédéfini
                                </button>
                            </div>
                        ) : selectedProviderData && (
                            <div className="glass-effect rounded-2xl p-4 flex items-center gap-4">
                                <div
                                    className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
                                    style={{ backgroundColor: selectedProviderData.color }}
                                >
                                    <ProviderIcon icon={selectedProviderData.icon} svg={selectedProviderData.svg} size={28} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selectedProviderData.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedProviderData.category}</p>
                                </div>
                                <button
                                    onClick={() => setShowProviderGrid(true)}
                                    className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                                >
                                    Changer
                                </button>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Nom de l'abonnement
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl glass-effect text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-all"
                                placeholder="Ex: Netflix Premium"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Prix
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl glass-effect text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-all"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                                        {getCurrencySymbol(currency)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Fréquence
                                </label>
                                <select
                                    value={formData.billing}
                                    onChange={(e) => setFormData({ ...formData, billing: e.target.value as BillingCycle })}
                                    className="w-full px-4 py-3 rounded-xl glass-effect text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-all"
                                >
                                    <option value="monthly">Mensuel</option>
                                    <option value="annual">Annuel</option>
                                </select>
                            </div>
                        </div>

                        {formData.price && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="glass-effect rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Par mois</p>
                                    <p className="text-lg font-black bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                                        {getCurrencySymbol(currency)}{monthlyPrice.toFixed(2)}
                                    </p>
                                </div>
                                <div className="glass-effect rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Par an</p>
                                    <p className="text-lg font-black bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                                        {getCurrencySymbol(currency)}{annualPrice.toFixed(0)}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Prochain prélèvement
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    value={formData.nextCharge}
                                    onChange={(e) => setFormData({ ...formData, nextCharge: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl glass-effect text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Catégorie
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value as SubscriptionCategory })}
                                className="w-full px-4 py-3 rounded-xl glass-effect text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-all"
                            >
                                {categoryOptions.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="glass-effect rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Users size={20} className="text-violet-600" />
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Abonnement familial
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newFamilial = !formData.familial;
                                        setFormData({
                                            ...formData,
                                            familial: newFamilial,
                                            participants: newFamilial ? (members.length > 0 ? [members[0].id] : []) : [],
                                        });
                                    }}
                                    className={`relative w-14 h-8 rounded-full transition-all ${
                                        formData.familial
                                            ? 'bg-gradient-to-r from-violet-600 to-blue-600'
                                            : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                >
                                    <div
                                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                                            formData.familial ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {formData.familial && (
                                <div className="space-y-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                                    {members.length === 0 ? (
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Ajoutez des membres dans la section Famille pour gérer les abonnements partagés.
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                    Mode de paiement
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, paymentMode: 'rotation' })}
                                                        className={`p-3 rounded-xl font-semibold text-sm transition-all ${
                                                            formData.paymentMode === 'rotation'
                                                                ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md'
                                                                : 'glass-effect text-gray-700 dark:text-gray-300'
                                                        }`}
                                                    >
                                                        <RotateCw size={16} className="mx-auto mb-1" />
                                                        Rotation
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, paymentMode: 'shared' })}
                                                        className={`p-3 rounded-xl font-semibold text-sm transition-all ${
                                                            formData.paymentMode === 'shared'
                                                                ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md'
                                                                : 'glass-effect text-gray-700 dark:text-gray-300'
                                                        }`}
                                                    >
                                                        <Split size={16} className="mx-auto mb-1" />
                                                        Partage
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                    Participants
                                                </label>
                                                <div className="space-y-2">
                                                    {members.map((member) => (
                                                        <label
                                                            key={member.id}
                                                            className="flex items-center justify-between p-3 rounded-xl glass-effect cursor-pointer"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className="w-8 h-8 rounded-full"
                                                                    style={{ backgroundColor: member.color }}
                                                                />
                                                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                                    {member.name}
                                                                </span>
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.participants.includes(member.id)}
                                                                onChange={(e) => {
                                                                    const participants = e.target.checked
                                                                        ? [...formData.participants, member.id]
                                                                        : formData.participants.filter((id) => id !== member.id);
                                                                    setFormData({ ...formData, participants });
                                                                }}
                                                                className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                                            />
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Notes (optionnel)
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl glass-effect text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-all resize-none"
                                rows={3}
                                placeholder="Ajouter des notes..."
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex-1 py-3 rounded-xl glass-effect text-gray-700 dark:text-gray-300 font-bold  transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.name || !formData.price}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold shadow-lg  disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={20} />
                                {subscription ? 'Modifier' : 'Créer'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
