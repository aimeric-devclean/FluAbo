import React, { useState, useEffect } from 'react';
import { Camera, User, Save, Check } from 'lucide-react';
import { Header } from '../components/Header';
import { DynamicBackground } from '../components/DynamicBackground';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Modal } from '../components/Modal';

interface AvatarPreset {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const Profile: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatarPresets, setAvatarPresets] = useState<AvatarPreset[]>([]);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setDisplayName(profile.display_name || '');
      setSelectedAvatar(profile.avatar_preset || null);
    }
    loadAvatarPresets();
  }, [profile]);

  const loadAvatarPresets = async () => {
    try {
      const { data, error } = await supabase
        .from('avatar_presets')
        .select('*')
        .order('name');

      if (error) throw error;
      setAvatarPresets(data || []);
    } catch (error) {
      console.error('Error loading avatars:', error);
    }
  };

  const checkUsernameAvailability = async (newUsername: string) => {
    if (!newUsername || newUsername === profile?.username) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .ilike('username', newUsername)
        .maybeSingle();

      if (error) throw error;
      setUsernameAvailable(!data);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username && username !== profile?.username) {
        checkUsernameAvailability(username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSave = async () => {
    if (!user) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (username !== profile?.username && usernameAvailable === false) {
        throw new Error('Ce pseudo est déjà pris');
      }

      const updates: any = {
        display_name: displayName.trim() || username,
        avatar_preset: selectedAvatar,
      };

      if (username !== profile?.username) {
        updates.username = username.trim().toLowerCase();
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) {
        if (updateError.code === '23505') {
          throw new Error('Ce pseudo est déjà utilisé');
        }
        throw updateError;
      }

      await refreshProfile();
      setSuccess('Profil mis à jour avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const currentAvatarPreset = avatarPresets.find(a => a.id === selectedAvatar);

  return (
    <>
      <DynamicBackground />
      <Header />
      <div className="pb-28 px-4 pt-20 max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Mon Profil
          </h2>
        </div>

        <div className="space-y-4">
          <div className="group relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="relative group/avatar"
              >
                <div
                  className="w-28 h-28 rounded-2xl flex items-center justify-center text-5xl shadow-lg transition-all duration-200 group-hover/avatar:scale-105"
                  style={{ backgroundColor: currentAvatarPreset?.color || '#3B82F6' }}
                >
                  {currentAvatarPreset?.emoji || '👤'}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </button>
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Changer l'avatar
              </button>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-500/15 dark:from-blue-500/25 dark:to-blue-500/25 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Pseudo</h3>
                <p className="text-xs text-gray-600 dark:text-slate-400">Pour ajouter des amis</p>
              </div>
              {usernameAvailable === true && username !== profile?.username && (
                <Check className="w-5 h-5 text-green-500" />
              )}
              {checkingUsername && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="votre_pseudo"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {usernameAvailable === false && username !== profile?.username && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">Ce pseudo est déjà pris</p>
            )}
          </div>

          <div className="group relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/15 to-purple-500/15 dark:from-purple-500/25 dark:to-purple-500/25 flex items-center justify-center">
                <User className="w-4 h-4 text-purple-600 dark:text-purple-400" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Nom d'affichage</h3>
                <p className="text-xs text-gray-600 dark:text-slate-400">Optionnel</p>
              </div>
            </div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Votre nom complet"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="group relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-4 shadow-sm opacity-60">
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-600 dark:text-slate-400">Email:</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{profile?.email}</div>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="px-4 py-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl text-green-700 dark:text-green-300 text-sm">
              {success}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading || !username || (username !== profile?.username && usernameAvailable === false)}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <Modal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        title="Choisir un avatar"
        size="md"
      >
        <div className="grid grid-cols-4 gap-3">
          {avatarPresets.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => {
                setSelectedAvatar(avatar.id);
                setIsAvatarModalOpen(false);
              }}
              className={`relative aspect-square rounded-xl flex items-center justify-center text-3xl transition-all duration-200 hover:scale-105 ${
                selectedAvatar === avatar.id
                  ? 'ring-4 ring-blue-500 scale-105'
                  : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
              }`}
              style={{ backgroundColor: avatar.color }}
            >
              {avatar.emoji}
              {selectedAvatar === avatar.id && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
};
