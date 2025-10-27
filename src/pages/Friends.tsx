import React, { useState } from 'react';
import { UserPlus, Check, X, Users as UsersIcon, Mail, MessageCircle, Send } from 'lucide-react';
import { Header } from '../components/Header';
import { useFriends, Friend } from '../hooks/useFriends';
import { useMessages } from '../hooks/useMessages';
import { Modal } from '../components/Modal';
import { FriendAvatar } from '../components/FriendAvatar';
import { FriendProfile } from '../components/FriendProfile';
import { MessageModal } from '../components/MessageModal';
import { InvitationModal } from '../components/InvitationModal';

export const Friends: React.FC = () => {
  const { friends, loading, sendFriendRequest, acceptFriendRequest, removeFriend } = useFriends();
  const { getUnreadCountFrom } = useMessages();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const pendingRequests = friends.filter(f => f.status === 'pending' && !f.is_requester);
  const sentRequests = friends.filter(f => f.status === 'pending' && f.is_requester);

  const handleAddFriend = async () => {
    if (!friendEmail.trim()) return;

    setAddError('');
    setAddLoading(true);

    try {
      await sendFriendRequest(friendEmail);
      setFriendEmail('');
      setIsAddModalOpen(false);
    } catch (error: any) {
      setAddError(error.message || 'Erreur lors de l\'ajout');
    } finally {
      setAddLoading(false);
    }
  };

  const handleAccept = async (friendshipId: string) => {
    try {
      await acceptFriendRequest(friendshipId);
    } catch (error) {
      console.error('Error accepting:', error);
    }
  };

  const handleRemove = async (friendshipId: string) => {
    if (confirm('Supprimer cet ami ?')) {
      try {
        await removeFriend(friendshipId);
      } catch (error) {
        console.error('Error removing:', error);
      }
    }
  };

  const openProfile = (friend: Friend) => {
    setSelectedFriend(friend);
    setIsProfileOpen(true);
  };

  const openMessage = (friend: Friend) => {
    setSelectedFriend(friend);
    setIsMessageOpen(true);
  };

  const openInvite = (friend: Friend) => {
    setSelectedFriend(friend);
    setIsInviteOpen(true);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-pink-50/20 dark:from-gray-950 dark:via-violet-950/10 dark:to-pink-950/10">
        <div className="px-4 pt-20 pb-28 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Mes amis
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {acceptedFriends.length} ami{acceptedFriends.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRequests(!showRequests)}
                className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 hover:from-violet-500/30 hover:to-pink-500/30 flex items-center justify-center transition-all duration-200 active:scale-95"
              >
                <Mail size={16} className="text-violet-600" strokeWidth={2} />
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 via-blue-500 to-pink-500 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <UserPlus size={18} className="text-white" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-violet-500 border-t-transparent" />
            </div>
          ) : (
            <>
              {showRequests && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-pink-500/10 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-violet-600" strokeWidth={2} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Demandes reçues
                    </h3>
                  </div>
                  {pendingRequests.length === 0 ? (
                    <div className="relative overflow-hidden rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-8 text-center border border-gray-200/30 dark:border-slate-700/30 shadow-sm">
                      <p className="text-gray-600 dark:text-slate-400 text-sm">
                        Aucune demande en attente
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingRequests.map((friend) => (
                        <div
                          key={friend.friendship_id}
                          className="relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-3 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <FriendAvatar
                              avatarPreset={friend.avatar_preset}
                              displayName={friend.display_name}
                              size="md"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                {friend.display_name}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                @{friend.username}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleAccept(friend.friendship_id)}
                                className="w-8 h-8 rounded-lg bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-all duration-200 active:scale-95"
                              >
                                <Check size={16} strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={() => handleRemove(friend.friendship_id)}
                                className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all duration-200 active:scale-95"
                              >
                                <X size={16} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!showRequests && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-pink-500/10 flex items-center justify-center">
                      <UsersIcon className="w-4 h-4 text-violet-600" strokeWidth={2} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Amis ({acceptedFriends.length})
                    </h3>
                  </div>

                  {acceptedFriends.length === 0 ? (
                    <div className="relative overflow-hidden rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-12 text-center border border-gray-200/30 dark:border-slate-700/30 shadow-sm">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-pink-500/10 flex items-center justify-center">
                        <UsersIcon size={20} className="text-violet-600" />
                      </div>
                      <p className="text-gray-600 dark:text-slate-400 text-sm mb-3">
                        Aucun ami pour le moment
                      </p>
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 hover:from-violet-600 hover:via-blue-600 hover:to-pink-600 text-white text-sm font-bold rounded-full transition-all active:scale-95 shadow-lg"
                      >
                        Ajouter un ami
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {acceptedFriends.map((friend) => {
                        const unreadCount = getUnreadCountFrom(friend.id);
                        return (
                          <div
                            key={friend.friendship_id}
                            onClick={() => openProfile(friend)}
                            className="group relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-3 shadow-sm hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <FriendAvatar
                                  avatarPreset={friend.avatar_preset}
                                  displayName={friend.display_name}
                                  size="md"
                                />
                                {unreadCount > 0 && (
                                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                                    {unreadCount}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                  {friend.display_name}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  @{friend.username}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openMessage(friend);
                                  }}
                                  className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-600 flex items-center justify-center transition-all duration-200 active:scale-95 opacity-0 group-hover:opacity-100"
                                >
                                  <MessageCircle size={16} strokeWidth={2} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(friend.friendship_id);
                                  }}
                                  className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-red-500 dark:hover:bg-red-600 hover:text-white text-gray-600 dark:text-slate-400 flex items-center justify-center transition-all duration-200 active:scale-95 opacity-0 group-hover:opacity-100"
                                >
                                  <X size={16} strokeWidth={2} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {!showRequests && sentRequests.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-500 dark:text-slate-500 mb-2 uppercase tracking-wider">
                    En attente ({sentRequests.length})
                  </h3>
                  <div className="space-y-2">
                    {sentRequests.map((friend) => (
                      <div
                        key={friend.friendship_id}
                        className="relative overflow-hidden bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-2.5 shadow-sm opacity-60"
                      >
                        <div className="flex items-center gap-2.5">
                          <FriendAvatar
                            avatarPreset={friend.avatar_preset}
                            displayName={friend.display_name}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {friend.display_name}
                            </h4>
                            <p className="text-[10px] text-gray-500 dark:text-gray-500 truncate">
                              En attente...
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemove(friend.friendship_id)}
                            className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-95 text-gray-600 dark:text-slate-400"
                          >
                            <X size={14} strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFriendEmail('');
          setAddError('');
        }}
        title="Ajouter un ami"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
              Pseudo ou email
            </label>
            <input
              type="text"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder="pseudo ou email"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200/50 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
            />
            {addError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">{addError}</p>
            )}
          </div>
          <button
            onClick={handleAddFriend}
            disabled={addLoading || !friendEmail.trim()}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 hover:from-violet-600 hover:via-blue-600 hover:to-pink-600 text-white rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {addLoading ? 'Envoi...' : (
              <>
                <Send size={16} />
                Envoyer la demande
              </>
            )}
          </button>
        </div>
      </Modal>

      <FriendProfile
        friend={selectedFriend}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSendMessage={() => {
          setIsProfileOpen(false);
          setIsMessageOpen(true);
        }}
        onInvite={() => {
          setIsProfileOpen(false);
          setIsInviteOpen(true);
        }}
      />

      <MessageModal
        friend={selectedFriend}
        isOpen={isMessageOpen}
        onClose={() => setIsMessageOpen(false)}
      />

      <InvitationModal
        friend={selectedFriend}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </>
  );
};
