import { useStore } from '../store/useStore';
import { Subscription } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const useSubscriptions = () => {
  const store = useStore();
  const { user } = useAuth();

  const addSubscription = async (subscription: Subscription) => {
    store.addSubscription(subscription);

    if (user) {
      try {
        console.log('[useSubscriptions] Adding subscription:', subscription.id);

        const { error } = await supabase.from('subscriptions').insert({
          id: subscription.id,
          owner_id: user.id,
          name: subscription.name,
          provider_id: subscription.providerId || '',
          price: subscription.price,
          currency: subscription.currency,
          billing: subscription.billing,
          next_charge: subscription.nextCharge,
          category: subscription.category,
          is_paused: subscription.isPaused,
          familial: subscription.familial,
          participants: subscription.participants,
          payment_mode: subscription.paymentMode,
          shares: subscription.shares,
          rotation: subscription.rotation,
          history: subscription.history,
          notes: subscription.notes,
        });

        if (error) {
          console.error('[useSubscriptions] Error adding subscription:', error);
          throw error;
        }

        console.log('[useSubscriptions] Subscription added successfully');
      } catch (error) {
        console.error('[useSubscriptions] Error syncing subscription to Supabase:', error);
        throw error;
      }
    }
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    store.updateSubscription(id, updates);

    if (user) {
      try {
        const subscription = store.subscriptions.find(s => s.id === id);
        if (!subscription) return;

        const merged = { ...subscription, ...updates };

        const { error } = await supabase
          .from('subscriptions')
          .update({
            name: merged.name,
            provider_id: merged.providerId || '',
            price: merged.price,
            currency: merged.currency,
            billing: merged.billing,
            next_charge: merged.nextCharge,
            category: merged.category,
            is_paused: merged.isPaused,
            familial: merged.familial,
            participants: merged.participants,
            payment_mode: merged.paymentMode,
            shares: merged.shares,
            rotation: merged.rotation,
            history: merged.history,
            notes: merged.notes,
          })
          .eq('id', id)
          .eq('owner_id', user.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating subscription in Supabase:', error);
      }
    }
  };

  const deleteSubscription = async (id: string) => {
    store.deleteSubscription(id);

    if (user) {
      try {
        await supabase
          .from('subscriptions')
          .delete()
          .eq('id', id)
          .eq('owner_id', user.id);
      } catch (error) {
        console.error('[useSubscriptions] Error deleting subscription from Supabase:', error);
      }
    }
  };

  const togglePause = async (id: string) => {
    const subscription = store.subscriptions.find(s => s.id === id);
    if (subscription) {
      await updateSubscription(id, { isPaused: !subscription.isPaused });
    }
  };

  const markAsPaid = (subscriptionId: string, month: string, paidBy: string) => {
    store.markAsPaid(subscriptionId, month, paidBy);

    const subscription = store.subscriptions.find(s => s.id === subscriptionId);
    if (subscription && user) {
      updateSubscription(subscriptionId, {
        history: subscription.history
      });
    }
  };

  const skipPayment = (subscriptionId: string) => {
    store.skipPayment(subscriptionId);

    const subscription = store.subscriptions.find(s => s.id === subscriptionId);
    if (subscription && user) {
      updateSubscription(subscriptionId, {
        nextCharge: subscription.nextCharge,
        rotation: subscription.rotation
      });
    }
  };

  const forcePayerThisMonth = (subscriptionId: string, memberId: string) => {
    store.forcePayerThisMonth(subscriptionId, memberId);

    const subscription = store.subscriptions.find(s => s.id === subscriptionId);
    if (subscription && user) {
      updateSubscription(subscriptionId, {
        rotation: subscription.rotation
      });
    }
  };

  const duplicateSubscription = async (id: string) => {
    store.duplicateSubscription(id);

    const duplicated = store.subscriptions[store.subscriptions.length - 1];
    if (duplicated && user) {
      await addSubscription(duplicated);
    }
  };

  return {
    ...store,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    togglePause,
    markAsPaid,
    skipPayment,
    forcePayerThisMonth,
    duplicateSubscription,
  };
};
