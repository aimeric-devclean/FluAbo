import React, { useState } from 'react';
import { Pause, Play, Copy, Trash2, Users as UsersIcon } from 'lucide-react';
import { Subscription } from '../types';
import { useStore } from '../store/useStore';
import { providers } from '../data/providers';
import { toMonthlyEquivalent, getDaysUntilNextCharge, getCurrentPayer } from '../utils/calculations';
import dayjs from 'dayjs';
import { ProviderIcon } from './ProviderIcon';
import { getCurrencySymbol } from '../utils/currency';
import { SwipeableCard, SwipeAction } from './SwipeableCard';
import { Modal } from './Modal';

interface SubscriptionCardProps {
    subscription: Subscription;
    onEdit: (subscription: Subscription) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onEdit }) => {
    const { togglePause, duplicateSubscription, deleteSubscription, members, currency } = useStore();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const provider = providers.find((p) => p.id === subscription.providerId);
    const monthlyPrice = toMonthlyEquivalent(subscription.price, subscription.billing);
    const daysUntil = getDaysUntilNextCharge(subscription.nextCharge);

    const currentPayer = getCurrentPayer(subscription);
    const currentPayerMember = currentPayer ? members.find((m) => m.id === currentPayer) : null;

    const handleDelete = () => {
        deleteSubscription(subscription.id);
        setShowDeleteModal(false);
    };

    // Progress ~ basique 0–30j
    const totalDays = 30;
    const progressPercentage = Math.max(0, Math.min(100, ((totalDays - daysUntil) / totalDays) * 100));

    const swipeActions: SwipeAction[] = [
        {
            icon: subscription.isPaused ? <Play size={24} className="text-white" /> : <Pause size={24} className="text-white" />,
            label: subscription.isPaused ? 'Relancer' : 'Pause',
            color: subscription.isPaused ? '#10b981' : '#f59e0b',
            onClick: () => togglePause(subscription.id),
        },
        {
            icon: <Copy size={24} className="text-white" />,
            label: 'Copier',
            color: '#3b82f6',
            onClick: () => duplicateSubscription(subscription.id),
        },
        {
            icon: <Trash2 size={24} className="text-white" />,
            label: 'Suppr.',
            color: '#ef4444',
            onClick: () => setShowDeleteModal(true),
        },
    ];

    return (
        <>
            <SwipeableCard
                actions={swipeActions}
                onTap={() => onEdit(subscription)}
                className={`group relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl ${subscription.isPaused ? 'opacity-60' : ''
                    } active:scale-[0.98] transition-all duration-200 shadow-sm`}
            >
                <div className="relative z-10 flex items-center gap-3 p-3">
                    <div className="relative flex-shrink-0">
                        <div
                            className="relative w-11 h-11 rounded-lg flex items-center justify-center shadow-md"
                            style={{ backgroundColor: provider?.color || '#6B7280' }}
                        >
                            <ProviderIcon icon={provider?.icon || 'circle'} svg={provider?.svg} size={22} className="text-white" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                                {subscription.name}
                            </h3>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                {subscription.familial && (
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-violet-500/20 via-blue-500/20 to-violet-500/20 text-blue-700 dark:text-blue-300 border border-violet-500/30">
                                        <UsersIcon size={12} strokeWidth={2.5} />
                                    </span>
                                )}
                                {subscription.isPaused && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/30">
                                        Pause
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 mb-2">
                            {/* PRIX — texte dégradé comme les titres de l’app */}
                            <div className="leading-none">
                                <p className="text-xl font-extrabold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                                    {monthlyPrice.toFixed(2)} {getCurrencySymbol(currency)}
                                </p>
                                <span className="text-xs font-medium text-gray-500 dark:text-slate-500">/mois</span>
                            </div>

                            <div className="text-right flex-shrink-0">
                                <p className="text-xs font-medium text-gray-900 dark:text-white">
                                    {dayjs(subscription.nextCharge).format('DD MMM')}
                                </p>
                                {/* J± — même dégradé */}
                                <p className="text-[10px] font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                                    J{daysUntil > 0 ? `-${daysUntil}` : daysUntil}
                                </p>
                            </div>
                        </div>

                        {/* PROGRESS — même gradient que titres */}
                        <div className="relative w-full h-1.5 bg-gray-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
                            <div
                                className="absolute left-0 top-0 h-full rounded-full transition-all duration-500 bg-gradient-to-r from-violet-500 to-blue-600"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>

                        {subscription.familial && currentPayerMember && (
                            <div className="mt-2 flex items-center gap-1.5">
                                <div
                                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                                    style={{ backgroundColor: currentPayerMember.color }}
                                />
                                <span
                                    className="text-xs font-medium px-2 py-0.5 rounded-md"
                                    style={{
                                        backgroundColor: `${currentPayerMember.color}20`,
                                        color: currentPayerMember.color,
                                    }}
                                >
                                    {currentPayerMember.name}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </SwipeableCard>

            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirmer la suppression">
                <div className="space-y-4">
                    <p className="text-gray-700 dark:text-slate-300">
                        Êtes-vous sûr de vouloir supprimer <span className="font-bold">"{subscription.name}"</span> ?
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 px-4 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-2xl font-bold transition-all duration-300 active:scale-95"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-bold transition-all duration-300 active:scale-95 shadow-xl"
                        >
                            Supprimer
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};
