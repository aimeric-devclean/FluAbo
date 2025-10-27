import React, { useState } from 'react';
import { Bell, Check, X, Users, Gift } from 'lucide-react';
import { Header } from '../components/Header';
import { useInvitations } from '../hooks/useInvitations';
import { useMessages } from '../hooks/useMessages';
import { FriendAvatar } from '../components/FriendAvatar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';

dayjs.extend(relativeTime);
dayjs.locale('fr');

export const Notifications: React.FC = () => {
  const { invitations, respondToInvitation, getPendingInvitations } = useInvitations();
  const { messages, getUnreadCountFrom } = useMessages();
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const pendingInvitations = getPendingInvitations();

  const unreadMessages = messages.filter(msg => !msg.read);

  const handleRespond = async (invitationId: string, accept: boolean) => {
    setRespondingTo(invitationId);
    try {
      await respondToInvitation(invitationId, accept);
    } catch (error) {
      console.error('Error responding to invitation:', error);
    } finally {
      setRespondingTo(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
      <Header />

      <div className="max-w-2xl mx-auto px-4 pt-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {pendingInvitations.length + unreadMessages.length} nouvelle(s)
            </p>
          </div>
        </div>

        {/* Invitations aux abonnements */}
        {pendingInvitations.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Invitations aux abonnements
              </h2>
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-medium rounded-full">
                {pendingInvitations.length}
              </span>
            </div>

            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                >
                  <div className="flex items-start gap-3">
                    <FriendAvatar
                      preset={invitation.inviter_profile?.avatar_preset || 'default'}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white">
                            {invitation.inviter_profile?.display_name || 'Un ami'}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            @{invitation.inviter_profile?.username || 'inconnu'}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {dayjs(invitation.created_at).fromNow()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                        Vous invite à rejoindre un abonnement partagé
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleRespond(invitation.id, true)}
                          disabled={respondingTo === invitation.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Accepter
                        </button>
                        <button
                          onClick={() => handleRespond(invitation.id, false)}
                          disabled={respondingTo === invitation.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Refuser
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages non lus */}
        {unreadMessages.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Messages non lus
              </h2>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                {unreadMessages.length}
              </span>
            </div>

            <div className="space-y-3">
              {unreadMessages.map((message) => (
                <div
                  key={message.id}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                >
                  <div className="flex items-start gap-3">
                    <FriendAvatar
                      preset={message.sender_profile?.avatar_preset || 'default'}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white">
                            {message.sender_profile?.display_name || 'Un ami'}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            @{message.sender_profile?.username || 'inconnu'}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {dayjs(message.created_at).fromNow()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                        {message.message}
                      </p>
                      {message.message_type === 'invitation' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-medium mt-2">
                          <Gift className="w-3 h-3" />
                          Invitation
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* État vide */}
        {pendingInvitations.length === 0 && unreadMessages.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              <Bell className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Aucune notification
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Vous êtes à jour !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
