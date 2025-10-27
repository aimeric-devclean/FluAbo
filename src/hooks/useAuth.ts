import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

export const useAuth = () => {
  const setUserId = useStore((state) => state.setUserId);
  const userId = useStore((state) => state.userId);
  const loadSubscriptions = useStore((state) => state.loadSubscriptions);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    loadSubscriptions();

    return () => subscription.unsubscribe();
  }, [setUserId, loadSubscriptions]);

  return { userId };
};
