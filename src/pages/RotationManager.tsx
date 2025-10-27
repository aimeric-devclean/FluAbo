import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, GripVertical, RotateCw, Users, Calendar, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Subscription } from '../types';
import { toMonthlyEquivalent, getCurrentPayer } from '../utils/calculations';
import { getCurrencySymbol } from '../utils/currency';
import dayjs from 'dayjs';

export const RotationManager: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const subscriptionId = searchParams.get('id');

    const { subscriptions, members, updateSubscription, currency } = useStore();
    const subscription = subscriptions.find(s => s.id === subscriptionId);

    const [rotationOrder, setRotationOrder] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    useEffect(() => {
        if (subscription?.rotation) {
            setRotationOrder(subscription.rotation.order);
            setCurrentIndex(subscription.rotation.currentIndex);
        } else if (subscription?.participants) {
            setRotationOrder(subscription.participants);
            setCurrentIndex(0);
        }
    }, [subscription]);

    if (!subscription || !subscriptionId) {
        navigate('/family');
        return null;
    }

    const getParticipantMembers = () => {
        return rotationOrder
            .map(id => members.find(m => m.id === id))
            .filter(Boolean);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newOrder = [...rotationOrder];
        const draggedItem = newOrder[draggedIndex];
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(index, 0, draggedItem);

        setRotationOrder(newOrder);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleNextPayer = () => {
        const newIndex = (currentIndex + 1) % rotationOrder.length;
        setCurrentIndex(newIndex);
    };

    const handleSave = () => {
        const updatedSubscription: Subscription = {
            ...subscription,
            rotation: {
                order: rotationOrder,
                currentIndex: currentIndex,
                lastRotation: subscription.rotation?.lastRotation || dayjs().toISOString(),
            },
        };
        updateSubscription(subscriptionId, updatedSubscription);
        navigate('/family');
    };

    const participantMembers = getParticipantMembers();
    const currentPayer = members.find(m => m.id === rotationOrder[currentIndex]);
    const nextPayer = members.find(m => m.id === rotationOrder[(currentIndex + 1) % rotationOrder.length]);
    const monthlyPrice = toMonthlyEquivalent(subscription.price, subscription.billing);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-violet-50/20 to-pink-50/20 dark:from-gray-950 dark:via-violet-950/10 dark:to-pink-950/10 z-50 overflow-y-auto pb-20">
            <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/family')}
                            className="w-11 h-11 rounded-2xl glass-effect flex items-center justify-center transition-all active:scale-95 shadow-sm"
                        >
                            <X size={22} className="text-gray-700 dark:text-gray-300" />
                        </button>
                        <div>
                            <h1 className="text-xl font-black bg-gradient-to-r from-violet-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                                Gestion de rotation
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{subscription.name}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="glass-effect rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg">
                                <RotateCw size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="font-bold text-gray-900 dark:text-white">Payeur actuel</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Prochain prélèvement le {dayjs(subscription.nextCharge).format('DD/MM/YYYY')}</p>
                            </div>
                        </div>

                        {currentPayer && (
                            <div className="glass-effect rounded-2xl p-4 mb-3 border border-violet-200/50 dark:border-violet-800/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg"
                                            style={{ backgroundColor: currentPayer.color }}
                                        >
                                            {currentPayer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-lg">{currentPayer.name}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                {getCurrencySymbol(currency)}{monthlyPrice.toFixed(2)}/mois
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleNextPayer}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold shadow-lg transition-all active:scale-95"
                                >
                                    Passer au suivant
                                </button>
                            </div>
                        )}

                        {nextPayer && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pl-2">
                                <ArrowRight size={16} />
                                <span>Prochain : <span className="font-bold text-gray-900 dark:text-white">{nextPayer.name}</span></span>
                            </div>
                        )}
                    </div>

                    <div className="glass-effect rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Users size={20} className="text-violet-600" />
                            <h2 className="font-bold text-gray-900 dark:text-white">Ordre de rotation</h2>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium">
                            Maintenez et faites glisser pour réorganiser
                        </p>

                        <div className="space-y-2">
                            {participantMembers.map((member, index) => {
                                if (!member) return null;
                                const isCurrent = index === currentIndex;
                                const isNext = index === (currentIndex + 1) % rotationOrder.length;

                                return (
                                    <div
                                        key={member.id}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`glass-effect rounded-2xl p-4 cursor-move transition-all shadow-sm ${
                                            draggedIndex === index ? 'opacity-50 scale-95' : ''
                                        } ${isCurrent ? 'ring-2 ring-violet-500 shadow-lg bg-violet-50/50 dark:bg-violet-900/20' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <GripVertical size={20} className="text-gray-400" />
                                            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-violet-700 dark:text-violet-400 font-black text-sm">
                                                {index + 1}
                                            </div>
                                            <div
                                                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                                                style={{ backgroundColor: member.color }}
                                            >
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 dark:text-white">{member.name}</p>
                                                {isCurrent && (
                                                    <p className="text-xs text-violet-600 dark:text-violet-400 font-bold">● En cours</p>
                                                )}
                                                {isNext && !isCurrent && (
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">→ Prochain</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="glass-effect rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar size={20} className="text-violet-600" />
                            <h2 className="font-bold text-gray-900 dark:text-white">Historique</h2>
                        </div>
                        <div className="space-y-2">
                            {rotationOrder.slice(0, 6).map((memberId, index) => {
                                const member = members.find(m => m.id === memberId);
                                if (!member) return null;

                                const isPast = index < currentIndex;
                                const isFuture = index > currentIndex;
                                const isCurrent = index === currentIndex;

                                return (
                                    <div
                                        key={`${member.id}-${index}`}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                            isPast
                                                ? 'glass-effect opacity-60'
                                                : isFuture
                                                ? 'glass-effect'
                                                : 'bg-violet-100 dark:bg-violet-900/30 ring-1 ring-violet-500/30'
                                        }`}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                                            style={{ backgroundColor: member.color }}
                                        >
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                            {member.name}
                                        </span>
                                        {isCurrent && (
                                            <span className="ml-auto px-3 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-bold shadow-md">
                                                Actuel
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white dark:from-gray-950 dark:via-gray-950 to-transparent">
                    <button
                        onClick={handleSave}
                        className="w-full max-w-2xl mx-auto py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-base font-bold shadow-2xl transition-all active:scale-95"
                    >
                        Enregistrer les modifications
                    </button>
                </div>
            </div>
        </div>
    );
};
