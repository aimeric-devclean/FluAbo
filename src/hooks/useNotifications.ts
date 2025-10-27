import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SubscriptionNotification, Subscription } from '../types';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SubscriptionNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('subscription_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('notification_date', { ascending: true });

      if (fetchError) throw fetchError;

      setNotifications(data || []);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scheduleNotifications = async (
    subscription: Subscription,
    participantUserIds: string[]
  ) => {
    if (!user) throw new Error('Non authentifié');

    try {
      const nextChargeDate = dayjs(subscription.nextCharge);

      // Calculer les 3 dates de notification
      const weekBefore = nextChargeDate.subtract(7, 'day');
      const threeDaysBefore = nextChargeDate.subtract(3, 'day');
      const dayOf = nextChargeDate;

      const notificationsToCreate = [];

      // Pour chaque participant, créer 3 notifications
      for (const userId of participantUserIds) {
        // Supprimer les anciennes notifications pour cet abonnement et cet utilisateur
        await supabase
          .from('subscription_notifications')
          .delete()
          .eq('user_id', userId)
          .eq('subscription_id', subscription.id);

        // 7 jours avant
        if (weekBefore.isAfter(dayjs())) {
          notificationsToCreate.push({
            user_id: userId,
            subscription_id: subscription.id,
            notification_type: 'week_before',
            notification_date: weekBefore.toISOString(),
            sent: false
          });
        }

        // 3 jours avant
        if (threeDaysBefore.isAfter(dayjs())) {
          notificationsToCreate.push({
            user_id: userId,
            subscription_id: subscription.id,
            notification_type: 'three_days_before',
            notification_date: threeDaysBefore.toISOString(),
            sent: false
          });
        }

        // Le jour J
        if (dayOf.isAfter(dayjs())) {
          notificationsToCreate.push({
            user_id: userId,
            subscription_id: subscription.id,
            notification_type: 'day_of',
            notification_date: dayOf.toISOString(),
            sent: false
          });
        }
      }

      if (notificationsToCreate.length > 0) {
        const { error } = await supabase
          .from('subscription_notifications')
          .insert(notificationsToCreate);

        if (error) throw error;
      }

      await fetchNotifications();
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la planification des notifications');
    }
  };

  const checkAndSendPendingNotifications = async (subscriptions: Subscription[]) => {
    if (!user) return;

    try {
      const now = dayjs();

      // Récupérer les notifications non envoyées dont la date est passée
      const { data: pending, error: fetchError } = await supabase
        .from('subscription_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('sent', false)
        .lte('notification_date', now.toISOString());

      if (fetchError) throw fetchError;

      // Envoyer chaque notification
      for (const notification of pending || []) {
        const subscription = subscriptions.find(s => s.id === notification.subscription_id);
        if (!subscription) continue;

        let message = '';
        let title = '';

        switch (notification.notification_type) {
          case 'week_before':
            title = '🔔 Rappel de paiement';
            message = `Votre abonnement ${subscription.name} sera débité dans 7 jours`;
            break;
          case 'three_days_before':
            title = '⚠️ Paiement imminent';
            message = `Rappel : ${subscription.name} sera débité dans 3 jours`;
            if (subscription.familial && subscription.rotation) {
              const currentPayer = subscription.rotation.order[subscription.rotation.currentIndex];
              message += ` - C'est au tour de ${currentPayer}`;
            }
            break;
          case 'day_of':
            title = '💳 Paiement aujourd\'hui';
            message = `Aujourd'hui : Paiement de ${subscription.name}`;
            if (subscription.familial && subscription.rotation) {
              const currentPayer = subscription.rotation.order[subscription.rotation.currentIndex];
              message += ` par ${currentPayer}`;
            }
            break;
        }

        // Envoyer la notification (via browser notification API)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: notification.id
          });
        }

        // Marquer comme envoyée
        await supabase
          .from('subscription_notifications')
          .update({ sent: true })
          .eq('id', notification.id);
      }

      await fetchNotifications();
    } catch (err: any) {
      console.error('Error checking notifications:', err);
    }
  };

  const getNotificationsForSubscription = (subscriptionId: string) => {
    return notifications.filter(n => n.subscription_id === subscriptionId);
  };

  const getPendingNotifications = () => {
    const now = dayjs();
    return notifications.filter(n => !n.sent && dayjs(n.notification_date).isAfter(now));
  };

  const deleteNotificationsForSubscription = async (subscriptionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('subscription_notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('subscription_id', subscriptionId);

      if (error) throw error;

      await fetchNotifications();
    } catch (err: any) {
      console.error('Error deleting notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Subscribe to realtime changes
      const channel = supabase
        .channel('notifications_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscription_notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    notifications,
    loading,
    error,
    scheduleNotifications,
    checkAndSendPendingNotifications,
    getNotificationsForSubscription,
    getPendingNotifications,
    deleteNotificationsForSubscription,
    refetch: fetchNotifications
  };
};
