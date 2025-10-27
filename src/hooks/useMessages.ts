import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FriendMessage } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useMessages = (friendUserId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<FriendMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('friend_messages')
        .select(`
          *,
          sender_profile:user_profiles!friend_messages_sender_id_fkey(username, display_name, avatar_preset)
        `)
        .order('created_at', { ascending: false });

      if (friendUserId) {
        query = query.or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendUserId}),and(sender_id.eq.${friendUserId},receiver_id.eq.${user.id})`);
      } else {
        query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedMessages = (data || []).map((msg: any) => ({
        ...msg,
        sender_profile: msg.sender_profile
      }));

      setMessages(formattedMessages);

      // Compter les messages non lus
      const unread = formattedMessages.filter(
        (msg: FriendMessage) => msg.receiver_id === user.id && !msg.read
      ).length;
      setUnreadCount(unread);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (
    receiverId: string,
    message: string,
    messageType: 'payment_reminder' | 'general' | 'invitation' = 'general',
    subscriptionId?: string
  ) => {
    if (!user) throw new Error('Non authentifié');
    if (!message.trim()) throw new Error('Le message ne peut pas être vide');

    try {
      const { error } = await supabase.from('friend_messages').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message: message.trim(),
        message_type: messageType,
        subscription_id: subscriptionId,
        read: false
      });

      if (error) throw error;

      await fetchMessages();
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de l\'envoi du message');
    }
  };

  const sendPaymentReminder = async (
    receiverId: string,
    subscriptionName: string,
    subscriptionId: string
  ) => {
    const message = `💰 Rappel : N'oublie pas le paiement pour ${subscriptionName} !`;
    await sendMessage(receiverId, message, 'payment_reminder', subscriptionId);
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friend_messages')
        .update({ read: true })
        .eq('id', messageId)
        .eq('receiver_id', user.id);

      if (error) throw error;

      await fetchMessages();
    } catch (err: any) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async (senderId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friend_messages')
        .update({ read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id)
        .eq('read', false);

      if (error) throw error;

      await fetchMessages();
    } catch (err: any) {
      console.error('Error marking all as read:', err);
    }
  };

  const getConversationWith = (friendId: string) => {
    return messages.filter(
      msg =>
        (msg.sender_id === user?.id && msg.receiver_id === friendId) ||
        (msg.sender_id === friendId && msg.receiver_id === user?.id)
    );
  };

  const getUnreadCountFrom = (friendId: string) => {
    return messages.filter(
      msg => msg.sender_id === friendId && msg.receiver_id === user?.id && !msg.read
    ).length;
  };

  useEffect(() => {
    if (user) {
      fetchMessages();

      // Subscribe to realtime changes
      const channel = supabase
        .channel('messages_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'friend_messages',
            filter: `receiver_id=eq.${user.id}`
          },
          () => {
            fetchMessages();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'friend_messages',
            filter: `sender_id=eq.${user.id}`
          },
          () => {
            fetchMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, friendUserId]);

  return {
    messages,
    loading,
    error,
    unreadCount,
    sendMessage,
    sendPaymentReminder,
    markAsRead,
    markAllAsRead,
    getConversationWith,
    getUnreadCountFrom,
    refetch: fetchMessages
  };
};
