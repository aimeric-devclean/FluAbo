import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AvatarPreset {
  id: string;
  emoji: string;
  color: string;
}

interface FriendAvatarProps {
  avatarPreset: string | null;
  displayName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FriendAvatar: React.FC<FriendAvatarProps> = ({
  avatarPreset,
  displayName,
  size = 'md',
  className = '',
}) => {
  const [preset, setPreset] = useState<AvatarPreset | null>(null);

  useEffect(() => {
    if (avatarPreset) {
      loadPreset();
    }
  }, [avatarPreset]);

  const loadPreset = async () => {
    if (!avatarPreset) return;

    try {
      const { data, error } = await supabase
        .from('avatar_presets')
        .select('id, emoji, color')
        .eq('id', avatarPreset)
        .maybeSingle();

      if (error) throw error;
      if (data) setPreset(data);
    } catch (error) {
      console.error('Error loading avatar preset:', error);
    }
  };

  const sizeClasses = {
    sm: 'w-9 h-9 text-sm',
    md: 'w-11 h-11 text-lg',
    lg: 'w-16 h-16 text-2xl',
  };

  if (preset) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg flex items-center justify-center shadow-md flex-shrink-0 ${className}`}
        style={{ backgroundColor: preset.color }}
      >
        <span>{preset.emoji}</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 ${className}`}>
      {displayName.charAt(0).toUpperCase()}
    </div>
  );
};
