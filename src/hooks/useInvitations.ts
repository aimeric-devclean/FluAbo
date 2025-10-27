import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SubscriptionInvitation } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useInvitations = () => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<SubscriptionInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Récupérer les invitations reçues avec les infos de l'inviteur
      const { data: received, error: receivedError } = await supabase
        .from('subscription_invitations')
        .select(`
          *,
          inviter_profile:user_profiles!subscription_invitations_inviter_id_fkey(username, display_name, avatar_preset)
        `)
        .eq('invited_user_id', user.id)
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;

      // Récupérer les invitations envoyées
      const { data: sent, error: sentError } = await supabase
        .from('subscription_invitations')
        .select('*')
        .eq('inviter_id', user.id)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      const allInvitations = [
        ...(received || []).map((inv: any) => ({
          ...inv,
          inviter_profile: inv.inviter_profile
        })),
        ...(sent || [])
      ];

      setInvitations(allInvitations);
    } catch (err: any) {
      console.error('Error fetching invitations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (
    subscriptionId: string,
    friendUserId: string,
    subscriptionName?: string
  ) => {
    if (!user) throw new Error('Non authentifié');

    try {
      // Vérifier si une invitation existe déjà
      const { data: existing } = await supabase
        .from('subscription_invitations')
        .select('id')
        .eq('subscription_id', subscriptionId)
        .eq('inviter_id', user.id)
        .eq('invited_user_id', friendUserId)
        .eq('status', 'pending')
        .maybeSingle();

      if (existing) {
        throw new Error('Une invitation est déjà en attente pour cet ami');
      }

      const { error } = await supabase
        .from('subscription_invitations')
        .insert({
          subscription_id: subscriptionId,
          inviter_id: user.id,
          invited_user_id: friendUserId,
          status: 'pending'
        });

      if (error) throw error;

      // Envoyer un message de notification
      await supabase.from('friend_messages').insert({
        sender_id: user.id,
        receiver_id: friendUserId,
        subscription_id: subscriptionId,
        message: `Vous a invité à rejoindre l'abonnement ${subscriptionName || 'un abonnement'}`,
        message_type: 'invitation',
        read: false
      });

      await fetchInvitations();
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de l\'envoi de l\'invitation');
    }
  };

  const respondToInvitation = async (invitationId: string, accept: boolean) => {
    if (!user) throw new Error('Non authentifié');

    try {
      const { error } = await supabase
        .from('subscription_invitations')
        .update({
          status: accept ? 'accepted' : 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', invitationId)
        .eq('invited_user_id', user.id);

      if (error) throw error;

      await fetchInvitations();
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la réponse');
    }
  };

  const getInvitationsForSubscription = (subscriptionId: string) => {
    return invitations.filter(inv => inv.subscription_id === subscriptionId);
  };

  const getPendingInvitations = () => {
    return invitations.filter(
      inv => inv.status === 'pending' && inv.invited_user_id === user?.id
    );
  };

  const getSentInvitations = () => {
    return invitations.filter(
      inv => inv.status === 'pending' && inv.inviter_id === user?.id
    );
  };

  useEffect(() => {
    if (user) {
      fetchInvitations();

      // Subscribe to realtime changes
      const channel = supabase
        .channel('invitations_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscription_invitations',
            filter: `invited_user_id=eq.${user.id}`
          },
          () => {
            fetchInvitations();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscription_invitations',
            filter: `inviter_id=eq.${user.id}`
          },
          () => {
            fetchInvitations();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    invitations,
    loading,
    error,
    sendInvitation,
    respondToInvitation,
    getInvitationsForSubscription,
    getPendingInvitations,
    getSentInvitations,
    refetch: fetchInvitations
  };
};
