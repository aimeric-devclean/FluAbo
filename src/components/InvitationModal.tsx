import React, { useState } from 'react';
import { X, Send, UserPlus } from 'lucide-react';
import { Modal } from './Modal';
import { FriendAvatar } from './FriendAvatar';
import { useStore } from '../store/useStore';
import { useInvitations } from '../hooks/useInvitations';
import { Subscription } from '../types';

interface Friend {
  id: string;
  username: string;
  display_name: string;
  avatar_preset: string;
  friendship_id: string;
}

interface InvitationModalProps {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvitationModal: React.FC<InvitationModalProps> = ({
  friend,
  isOpen,
  onClose
}) => {
  const { subscriptions } = useStore();
  const { sendInvitation, getSentInvitations } = useInvitations();
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const sentInvitations = getSentInvitations();

  const familySubscriptions = subscriptions.filter(sub => sub.familial);

  const getInvitationStatus = (subId: string) => {
    if (!friend) return null;
    return sentInvitations.find(
      inv => inv.subscription_id === subId && inv.invited_user_id === friend.id
    );
  };

  const toggleSubscription = (subId: string) => {
    setSelectedSubs(prev =>
      prev.includes(subId)
        ? prev.filter(id => id !== subId)
        : [...prev, subId]
    );
  };

  const handleSendInvitations = async () => {
    if (!friend || selectedSubs.length === 0 || sending) return;

    setSending(true);
    try {
      for (const subId of selectedSubs) {
        const sub = subscriptions.find(s => s.id === subId);
        await sendInvitation(subId, friend.id, sub?.name);
      }
      setSelectedSubs([]);
      alert(`${selectedSubs.length} invitation(s) envoyée(s) à ${friend.display_name} !`);
      onClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSending(false);
    }
  };

  if (!friend) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-6 pt-2">
          <FriendAvatar
            avatarPreset={friend.avatar_preset}
            displayName={friend.display_name}
            size="md"
          />
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Inviter {friend.display_name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sélectionnez vos abonnements familiaux
            </p>
          </div>
        </div>

        {familySubscriptions.length === 0 ? (
          <div className="relative overflow-hidden rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-8 text-center border border-gray-200/30 dark:border-slate-700/30 shadow-sm mb-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-pink-500/10 flex items-center justify-center">
              <UserPlus size={20} className="text-violet-600" />
            </div>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              Vous n'avez pas d'abonnements familiaux
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Créez un abonnement familial pour inviter vos amis
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-6 max-h-[350px] overflow-y-auto">
              {familySubscriptions.map(sub => {
                const invitation = getInvitationStatus(sub.id);
                const isSelected = selectedSubs.includes(sub.id);
                const isPending = invitation?.status === 'pending';
                const isAccepted = invitation?.status === 'accepted';
                const isDisabled = isPending || isAccepted;

                return (
                  <button
                    key={sub.id}
                    onClick={() => !isDisabled && toggleSubscription(sub.id)}
                    disabled={isDisabled}
                    className={`w-full text-left relative overflow-hidden backdrop-blur-xl border rounded-xl p-3 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-violet-500/20 via-blue-500/20 to-pink-500/20 border-violet-500/50'
                        : isDisabled
                        ? 'bg-white/20 dark:bg-slate-800/20 border-gray-200/20 dark:border-slate-700/20 opacity-50 cursor-not-allowed'
                        : 'bg-white/40 dark:bg-slate-800/40 border-gray-200/30 dark:border-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          {sub.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {sub.price}€ / {sub.billing === 'monthly' ? 'mois' : sub.billing === 'annual' ? 'an' : 'semaine'}
                          {' • '}
                          {sub.participants?.length || 0} participant{(sub.participants?.length || 0) > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div>
                        {isPending && (
                          <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                            En attente
                          </span>
                        )}
                        {isAccepted && (
                          <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                            Accepté
                          </span>
                        )}
                        {!isDisabled && (
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? 'bg-violet-600 border-violet-600'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleSendInvitations}
              disabled={selectedSubs.length === 0 || sending}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 hover:from-violet-600 hover:via-blue-600 hover:to-pink-600 text-white rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                'Envoi...'
              ) : (
                <>
                  <Send size={18} />
                  Envoyer {selectedSubs.length > 0 && `(${selectedSubs.length})`}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};
