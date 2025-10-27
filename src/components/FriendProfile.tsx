import React from 'react';
import { X, MessageCircle, UserPlus, Calendar } from 'lucide-react';
import { Modal } from './Modal';
import { FriendAvatar } from './FriendAvatar';
import { useStore } from '../store/useStore';
import dayjs from 'dayjs';

interface Friend {
  id: string;
  username: string;
  display_name: string;
  avatar_preset: string;
  friendship_id: string;
  created_at?: string;
}

interface FriendProfileProps {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: () => void;
  onInvite: () => void;
}

export const FriendProfile: React.FC<FriendProfileProps> = ({
  friend,
  isOpen,
  onClose,
  onSendMessage,
  onInvite
}) => {
  const { subscriptions } = useStore();

  if (!friend) return null;

  const sharedSubscriptions = subscriptions.filter(sub =>
    sub.familial && sub.participants?.includes(friend.display_name)
  );

  const totalSharedMonthly = sharedSubscriptions.reduce((sum, sub) => {
    if (sub.billing === 'monthly') return sum + sub.price;
    if (sub.billing === 'annual') return sum + (sub.price / 12);
    if (sub.billing === 'weekly') return sum + (sub.price * 4);
    return sum;
  }, 0);

  const friendshipDuration = friend.created_at ? dayjs().diff(dayjs(friend.created_at), 'day') : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center pt-2 pb-4">
          <FriendAvatar
            avatarPreset={friend.avatar_preset}
            displayName={friend.display_name}
            size="xl"
          />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
            {friend.display_name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            @{friend.username}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            <Calendar size={12} className="inline mr-1" />
            Amis depuis {friendshipDuration} jour{friendshipDuration > 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-pink-500/10 rounded-xl p-3 text-center border border-gray-200/30 dark:border-slate-700/30">
            <p className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              {sharedSubscriptions.length}
            </p>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 font-semibold mt-1">
              Abonnements
            </p>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-pink-500/10 rounded-xl p-3 text-center border border-gray-200/30 dark:border-slate-700/30">
            <p className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              {totalSharedMonthly.toFixed(0)}€
            </p>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 font-semibold mt-1">
              Par mois
            </p>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-pink-500/10 rounded-xl p-3 text-center border border-gray-200/30 dark:border-slate-700/30">
            <p className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              {(totalSharedMonthly / 2).toFixed(0)}€
            </p>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 font-semibold mt-1">
              Économisés
            </p>
          </div>
        </div>

        {sharedSubscriptions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
              Abonnements partagés
            </h3>
            <div className="space-y-2">
              {sharedSubscriptions.map(sub => (
                <div
                  key={sub.id}
                  className="relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-lg p-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {sub.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {sub.price}€ / {sub.billing === 'monthly' ? 'mois' : sub.billing === 'annual' ? 'an' : 'semaine'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-violet-600">
                        {(sub.price / (sub.participants?.length || 1)).toFixed(2)}€
                      </p>
                      <p className="text-[10px] text-gray-500">
                        par personne
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onSendMessage}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            Message
          </button>
          <button
            onClick={onInvite}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 hover:from-violet-600 hover:via-blue-600 hover:to-pink-600 text-white rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            <UserPlus size={18} />
            Inviter
          </button>
        </div>
      </div>
    </Modal>
  );
};
