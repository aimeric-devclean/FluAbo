import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';
import { Subscription } from '../types';

export const useSubscriptionsSync = () => {
  const { user } = useAuth();
  const { setSubscriptions, addSubscription, updateSubscription, deleteSubscription } = useStore();
  const isInitialLoad = useRef(true);
  const isSyncing = useRef(false);

  useEffect(() => {
    if (!user) {
      console.log('[Sync] No user, clearing subscriptions');
      setSubscriptions([]);
      return;
    }

    console.log('[Sync] User detected, loading subscriptions...');

    const loadSubscriptionsFromSupabase = async () => {
      if (isSyncing.current) {
        console.log('[Sync] Already syncing, skipping...');
        return;
      }
      isSyncing.current = true;

      try {
        console.log('[Sync] Loading subscriptions for user:', user.id);

        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('owner_id', user.id);

        if (error) {
          console.error('[Sync] Error loading subscriptions:', error);
          throw error;
        }

        console.log('[Sync] Loaded subscriptions:', data?.length || 0);

        const mappedSubscriptions: Subscription[] = (data || []).map(sub => ({
          id: sub.id.toString(),
          name: sub.name,
          providerId: sub.provider_id,
          price: parseFloat(sub.price),
          currency: sub.currency || 'EUR',
          billing: sub.billing === 'yearly' ? 'annual' : sub.billing,
          nextCharge: sub.next_charge,
          category: sub.category,
          isPaused: sub.is_paused || false,
          familial: sub.familial || false,
          participants: sub.participants || undefined,
          paymentMode: sub.payment_mode || undefined,
          shares: sub.shares || undefined,
          rotation: sub.rotation || undefined,
          history: sub.history || undefined,
          notes: sub.notes || undefined,
        }));

        console.log('[Sync] Setting subscriptions in store:', mappedSubscriptions);
        setSubscriptions(mappedSubscriptions);
        console.log('[Sync] Subscriptions set successfully');
      } catch (error) {
        console.error('[Sync] Error loading subscriptions:', error);
      } finally {
        isSyncing.current = false;
        isInitialLoad.current = false;
      }
    };

    loadSubscriptionsFromSupabase();

    // Realtime subscription
    const channel = supabase
      .channel('subscriptions_sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `owner_id=eq.${user.id}`
        },
        async (payload) => {
          if (isSyncing.current) return;

          console.log('[Sync] Realtime event:', payload.eventType);

          if (payload.eventType === 'INSERT') {
            const sub = payload.new;
            const mapped: Subscription = {
              id: sub.id.toString(),
              name: sub.name,
              providerId: sub.provider_id,
              price: parseFloat(sub.price),
              currency: sub.currency || 'EUR',
              billing: sub.billing === 'yearly' ? 'annual' : sub.billing,
              nextCharge: sub.next_charge,
              category: sub.category,
              isPaused: sub.is_paused || false,
              familial: sub.familial || false,
              participants: sub.participants,
              paymentMode: sub.payment_mode,
              shares: sub.shares,
              rotation: sub.rotation,
              history: sub.history,
              notes: sub.notes,
            };
            addSubscription(mapped);
          } else if (payload.eventType === 'UPDATE') {
            const sub = payload.new;
            const mapped: Subscription = {
              id: sub.id.toString(),
              name: sub.name,
              providerId: sub.provider_id,
              price: parseFloat(sub.price),
              currency: sub.currency || 'EUR',
              billing: sub.billing === 'yearly' ? 'annual' : sub.billing,
              nextCharge: sub.next_charge,
              category: sub.category,
              isPaused: sub.is_paused || false,
              familial: sub.familial || false,
              participants: sub.participants,
              paymentMode: sub.payment_mode,
              shares: sub.shares,
              rotation: sub.rotation,
              history: sub.history,
              notes: sub.notes,
            };
            updateSubscription(sub.id.toString(), mapped);
          } else if (payload.eventType === 'DELETE') {
            deleteSubscription(payload.old.id.toString());
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {};
};
