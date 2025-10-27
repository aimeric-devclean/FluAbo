import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Friend {
  id: string;
  username: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  avatar_preset: string | null;
  status: 'pending' | 'accepted' | 'blocked';
  friendship_id: string;
  is_requester: boolean;
  created_at?: string;
}

export const useFriends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;

    try {
      const { data: friendshipsData, error } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          friend:user_profiles!friendships_friend_id_fkey(id, username, email, display_name, avatar_url, avatar_preset),
          requester:user_profiles!friendships_user_id_fkey(id, username, email, display_name, avatar_url, avatar_preset)
        `)
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (error) throw error;

      const friendsList: Friend[] = friendshipsData?.map((f: any) => {
        const isRequester = f.user_id === user.id;
        const friendProfile = isRequester ? f.friend : f.requester;

        return {
          id: friendProfile.id,
          username: friendProfile.username,
          email: friendProfile.email,
          display_name: friendProfile.display_name,
          avatar_url: friendProfile.avatar_url,
          avatar_preset: friendProfile.avatar_preset,
          status: f.status,
          friendship_id: f.id,
          is_requester: isRequester,
          created_at: f.created_at,
        };
      }) || [];

      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendIdentifier: string) => {
    if (!user) return;

    try {
      const identifier = friendIdentifier.trim().toLowerCase();

      const { data: friendProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .or(`username.ilike.${identifier},email.ilike.${identifier}`)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!friendProfile) throw new Error('Aucun utilisateur trouvé avec ce pseudo ou email');
      if (friendProfile.id === user.id) throw new Error('Vous ne pouvez pas vous ajouter vous-même');

      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendProfile.id,
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('Cette demande existe déjà');
        }
        throw error;
      }

      await loadFriends();
    } catch (error: any) {
      throw error;
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;
      await loadFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      await loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  };

  return {
    friends,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    refresh: loadFriends,
  };
};
