import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, User, Palette, Save, Camera, Smile } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Member, AvatarType } from '../types';
import { generateUUID } from '../utils/uuid';

const COLOR_PALETTE = [
  { name: 'Bleu', value: '#3B82F6' },
  { name: 'Rose', value: '#EC4899' },
  { name: 'Vert', value: '#10B981' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Rouge', value: '#EF4444' },
  { name: 'Turquoise', value: '#14B8A6' },
  { name: 'Orange foncé', value: '#F97316' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Fuchsia', value: '#D946EF' },
];

const EMOJI_OPTIONS = [
  { emoji: '👨', color: '#3B82F6', name: 'Homme' },
  { emoji: '👩', color: '#EC4899', name: 'Femme' },
  { emoji: '👦', color: '#06B6D4', name: 'Garçon' },
  { emoji: '👧', color: '#F472B6', name: 'Fille' },
  { emoji: '👶', color: '#FCD34D', name: 'Bébé' },
  { emoji: '🧑', color: '#8B5CF6', name: 'Personne' },
  { emoji: '👴', color: '#9CA3AF', name: 'Grand-père' },
  { emoji: '👵', color: '#F59E0B', name: 'Grand-mère' },
  { emoji: '🤵', color: '#1F2937', name: 'Marié' },
  { emoji: '👰', color: '#FFFFFF', name: 'Mariée' },
  { emoji: '🧔', color: '#78350F', name: 'Barbu' },
  { emoji: '👱', color: '#FDE68A', name: 'Blond' },
];

export const MemberForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('id');
  const { members, addMember, updateMember } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    avatarType: 'emoji' as AvatarType,
    emoji: '👨',
    photoUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditing = !!memberId;

  useEffect(() => {
    if (memberId) {
      const member = members.find((m) => m.id === memberId);
      if (member) {
        setFormData({
          name: member.name,
          color: member.color,
          avatarType: member.avatarType || 'emoji',
          emoji: member.emoji || '👨',
          photoUrl: member.photoUrl || '',
        });
      }
    }
  }, [memberId, members]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          photoUrl: reader.result as string,
          avatarType: 'photo',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const memberData: Member = {
      id: memberId || generateUUID(),
      name: formData.name.trim(),
      color: formData.color,
      avatarType: formData.avatarType,
      emoji: formData.emoji,
      photoUrl: formData.photoUrl,
    };

    if (isEditing) {
      updateMember(memberId!, memberData);
    } else {
      addMember(memberData);
    }

    navigate('/family');
  };

  const renderAvatar = () => {
    if (formData.avatarType === 'photo' && formData.photoUrl) {
      return (
        <div className="relative">
          <img
            src={formData.photoUrl}
            alt={formData.name}
            className="w-24 h-24 rounded-2xl object-cover shadow-lg"
          />
          <button
            type="button"
            onClick={() => setFormData({ ...formData, avatarType: 'emoji', photoUrl: '' })}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
          >
            ×
          </button>
        </div>
      );
    }

    return (
      <div
        className="w-24 h-24 rounded-2xl flex items-center justify-center text-6xl shadow-lg cursor-pointer hover:scale-105 transition-transform"
        style={{ backgroundColor: formData.color }}
      >
        {formData.emoji}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-pink-50/20 dark:from-gray-950 dark:via-violet-950/10 dark:to-pink-950/10">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/family')}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Retour</span>
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            {isEditing ? 'Modifier le membre' : 'Nouveau membre'}
          </h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Form */}
      <div className="px-4 pt-20 pb-32 max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Avatar & Name Card */}
          <div className="relative overflow-hidden bg-white/80 dark:bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {renderAvatar()}
              </div>

              {/* Avatar Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                  <Camera size={16} />
                  Photo
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, avatarType: 'emoji', photoUrl: '' })}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                  <Smile size={16} />
                  Emoji
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {/* Name Input */}
              <div className="w-full">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border ${
                    errors.name
                      ? 'border-red-500'
                      : 'border-gray-200 dark:border-gray-800'
                  } text-gray-900 dark:text-white text-center text-xl font-bold focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all`}
                  placeholder="Nom du membre"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 text-center">{errors.name}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                  Aperçu du profil
                </p>
              </div>
            </div>
          </div>

          {/* Emoji Selector - Only show when emoji mode */}
          {formData.avatarType === 'emoji' && (
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/15 to-violet-500/15 flex items-center justify-center">
                  <Smile className="w-4 h-4 text-pink-600" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Choix de l'emoji</h3>
              </div>

              <div className="grid grid-cols-6 gap-3">
                {EMOJI_OPTIONS.map((option) => (
                  <button
                    key={option.emoji}
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        emoji: option.emoji,
                        color: option.color,
                      });
                    }}
                    className={`aspect-square rounded-xl transition-all text-3xl flex items-center justify-center ${
                      formData.emoji === option.emoji
                        ? 'ring-4 ring-offset-2 ring-violet-500 scale-110 shadow-lg'
                        : 'hover:scale-105 shadow-sm bg-gray-100 dark:bg-gray-800'
                    }`}
                    title={option.name}
                  >
                    {option.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Picker - Only show for emoji type */}
          {formData.avatarType === 'emoji' && (
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/15 to-violet-500/15 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-pink-600" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Couleur de fond</h3>
              </div>

              <div className="grid grid-cols-6 gap-3">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`aspect-square rounded-xl transition-all ${
                      formData.color === color.value
                        ? 'ring-4 ring-offset-2 ring-gray-400 dark:ring-gray-600 scale-110 shadow-lg'
                        : 'hover:scale-105 shadow-sm'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 text-center">
                {COLOR_PALETTE.find((c) => c.value === formData.color)?.name || 'Couleur personnalisée'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/family')}
              className="flex-1 px-6 py-4 bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold transition-all duration-300 active:scale-95 shadow-sm"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-2xl font-bold transition-all duration-300 active:scale-95 shadow-xl flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {isEditing ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
