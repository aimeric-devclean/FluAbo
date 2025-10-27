import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, ChevronRight, Users as UsersIcon, Calendar, TrendingUp } from 'lucide-react';
import { Header } from '../components/Header';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { Modal } from '../components/Modal';
import { useStore } from '../store/useStore';
import { calculateBalances, toMonthlyEquivalent, getCurrentPayer } from '../utils/calculations';
import dayjs from 'dayjs';
import { getCurrencySymbol } from '../utils/currency';
import { SwipeableCard, SwipeAction } from '../components/SwipeableCard';

export const Family: React.FC = () => {
  const navigate = useNavigate();
  const {
    members,
    subscriptions,
    deleteMember,
    currency,
  } = useStore();

  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const balances = calculateBalances(subscriptions, members);
  const familialSubscriptions = subscriptions.filter((s) => s.familial);

  const openEditMember = (member: Member) => {
    navigate(`/member/edit?id=${member.id}`);
  };

  const handleDeleteMember = () => {
    if (deletingMemberId) {
      deleteMember(deletingMemberId);
      setDeletingMemberId(null);
    }
  };

  const memberToDelete = members.find((m) => m.id === deletingMemberId);

  const activeCount = members.length;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-pink-50/20 dark:from-gray-950 dark:via-violet-950/10 dark:to-pink-950/10 animate-slide-up">
        <div className="px-4 pt-20 pb-40 max-w-2xl mx-auto">
          {/* Header compact cohérent */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Famille & partage
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {activeCount} membre{activeCount > 1 ? 's' : ''} • {familialSubscriptions.length} abo familiaux
              </p>
            </div>
          </div>

          {/* Stat mini-cards (match dashboard look) */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="relative overflow-hidden bg-white/80 dark:bg-gray-900/50 backdrop-blur rounded-xl p-3 border border-violet-200/30 dark:border-violet-800/20">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-blue-500/5 to-transparent" />
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Membres</p>
                  <p className="text-lg font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                    {members.length}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 flex items-center justify-center">
                  <UsersIcon size={14} className="text-violet-600" />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-white/80 dark:bg-gray-900/50 backdrop-blur rounded-xl p-3 border border-blue-200/30 dark:border-blue-800/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-pink-500/5 to-transparent" />
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Familiaux</p>
                  <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                    {familialSubscriptions.length}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-pink-500/10 flex items-center justify-center">
                  <TrendingUp size={14} className="text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Membres */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/15 via-blue-500/15 to-pink-500/15 dark:from-violet-500/25 dark:via-blue-500/25 dark:to-pink-500/25 flex items-center justify-center">
                <UsersIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" strokeWidth={2} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Membres</h2>
            </div>

            <div className="space-y-1.5">
              {members.map((member) => {
                const balance = balances[member.id];
                const isPositive = (balance?.balance ?? 0) > 0;
                const isNegative = (balance?.balance ?? 0) < 0;
                const hasRotationSubs = familialSubscriptions.some(
                  (s) => s.paymentMode === 'rotation' || !s.paymentMode
                );

                const memberSwipeActions: SwipeAction[] = [
                  {
                    icon: <Edit2 size={22} className="text-white" />,
                    label: 'Modifier',
                    color: '#3b82f6',
                    onClick: () => openEditMember(member),
                  },
                  {
                    icon: <Trash2 size={22} className="text-white" />,
                    label: 'Suppr.',
                    color: '#ef4444',
                    onClick: () => setDeletingMemberId(member.id),
                  },
                ];

                return (
                  <SwipeableCard
                    key={member.id}
                    actions={memberSwipeActions}
                    onTap={() => openEditMember(member)}
                    className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/50 backdrop-blur rounded-xl border border-gray-200/50 dark:border-gray-800 active:scale-[0.985] transition-all duration-200 shadow-sm"
                  >
                    <div className="relative z-10 flex items-center gap-3 p-3">
                      <div className="relative flex-shrink-0">
                        {member.avatarType === 'photo' && member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-11 h-11 rounded-xl object-cover shadow-md"
                          />
                        ) : (
                          <div
                            className="relative w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-md"
                            style={{ backgroundColor: member.color }}
                          >
                            {member.emoji || '👨'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white">
                          {member.name}
                        </h3>
                        {balance && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-medium">
                            {hasRotationSubs
                              ? `${balance.paymentCount} paiement${balance.paymentCount > 1 ? 's' : ''}`
                              : `${balance.paid.toFixed(0)}${getCurrencySymbol(currency)} payé • ${balance.owed.toFixed(0)}${getCurrencySymbol(currency)} dû`}
                          </p>
                        )}
                      </div>
                      {balance && (
                        <div className="text-right flex-shrink-0">
                          {hasRotationSubs ? (
                            <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{balance.paymentCount}x</p>
                          ) : (
                            <p
                              className={`text-[15px] font-bold ${
                                isPositive
                                  ? 'text-green-600 dark:text-green-400'
                                  : isNegative
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {balance.balance > 0 ? '+' : ''}
                              {balance.balance.toFixed(0)}
                              {getCurrencySymbol(currency)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </SwipeableCard>
                );
              })}
            </div>
          </div>

          {/* Abonnements familiaux */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/15 via-violet-500/15 to-pink-500/15 dark:from-blue-500/25 dark:via-violet-500/25 dark:to-pink-500/25 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Abonnements familiaux</h2>
            </div>

            {familialSubscriptions.length === 0 ? (
              <div className="relative overflow-hidden rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur p-8 text-center border border-gray-200/50 dark:border-gray-800 shadow-sm">
                <p className="text-gray-600 dark:text-slate-400 font-medium text-sm">Aucun abonnement familial</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {familialSubscriptions.map((sub) => {
                  const currentPayer = getCurrentPayer(sub);
                  const currentPayerMember = currentPayer ? members.find((m) => m.id === currentPayer) : null;
                  const monthlyPrice = toMonthlyEquivalent(sub.price, sub.billing);

                  return (
                    <div
                      key={sub.id}
                      className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/50 backdrop-blur rounded-xl border border-gray-200/50 dark:border-gray-800 active:scale-[0.985] transition-all duration-200 cursor-pointer shadow-sm"
                      onClick={() => navigate(`/rotation?id=${sub.id}`)}
                    >
                      <div className="relative z-10 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white">{sub.name}</h3>
                          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500 transition-transform duration-200" strokeWidth={2} />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-400 mb-2 font-medium flex-wrap">
                          <span className="flex items-center gap-1">
                            <span className="text-sm font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                              {monthlyPrice.toFixed(0)}{getCurrencySymbol(currency)}
                            </span>
                            <span>/mois</span>
                          </span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full" />
                          <span>{sub.participants?.length || 0} participant{(sub.participants?.length || 0) > 1 ? 's' : ''}</span>
                          <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-pink-500/20 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-500/30 dark:border-blue-500/30">
                            {sub.paymentMode === 'shared' ? 'Partage' : 'Rotation'}
                          </span>
                        </div>
                        {currentPayerMember && (
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: currentPayerMember.color }} />
                            <span
                              className="text-xs font-medium px-2 py-0.5 rounded-md"
                              style={{ backgroundColor: `${currentPayerMember.color}20`, color: currentPayerMember.color }}
                            >
                              {currentPayerMember.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Delete Modal */}
          <Modal isOpen={!!deletingMemberId} onClose={() => setDeletingMemberId(null)} title="Confirmer la suppression">
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-slate-300">
                Supprimer <span className="font-bold">"{memberToDelete?.name}"</span> ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingMemberId(null)}
                  className="flex-1 px-4 py-3 bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800 dark:text-gray-900 dark:text-white rounded-2xl font-bold transition-all duration-300 active:scale-95"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteMember}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold transition-all duration-300 active:scale-95 shadow-xl"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>

      <FloatingActionButton
        onClick={() => navigate('/member/new')}
      />
    </>
  );
};
