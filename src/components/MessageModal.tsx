import React, { useState, useEffect, useRef } from 'react';
import { X, Send, DollarSign } from 'lucide-react';
import { Modal } from './Modal';
import { FriendAvatar } from './FriendAvatar';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

interface Friend {
  id: string;
  username: string;
  display_name: string;
  avatar_preset: string;
}

interface MessageModalProps {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({
  friend,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { messages, sendMessage, markAllAsRead, getConversationWith } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = friend ? getConversationWith(friend.id) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && friend) {
      markAllAsRead(friend.id);
      scrollToBottom();
    }
  }, [isOpen, friend, conversation.length]);

  const handleSend = async () => {
    if (!friend || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(friend.id, newMessage, 'general');
      setNewMessage('');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!friend) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="flex flex-col h-[500px]">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <FriendAvatar
              avatarPreset={friend.avatar_preset}
              displayName={friend.display_name}
              size="sm"
            />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {friend.display_name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                @{friend.username}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {conversation.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aucun message pour le moment
              </p>
            </div>
          ) : (
            conversation.map(msg => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] ${
                      isMine
                        ? 'bg-gradient-to-br from-violet-500 via-blue-500 to-pink-500 text-white'
                        : 'bg-white/60 dark:bg-slate-800/60 text-gray-900 dark:text-white'
                    } rounded-2xl px-3 py-2 shadow-sm`}
                  >
                    {msg.message_type === 'payment_reminder' && (
                      <div className="flex items-center gap-1 mb-1 text-xs opacity-80">
                        <DollarSign size={12} />
                        <span>Rappel de paiement</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isMine ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {dayjs(msg.created_at).format('HH:mm')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="pt-3 border-t border-gray-200/50 dark:border-slate-700/50">
          <div className="flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Écrire un message..."
              rows={2}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200/50 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all text-sm resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="px-4 bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 hover:from-violet-600 hover:via-blue-600 hover:to-pink-600 text-white rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
