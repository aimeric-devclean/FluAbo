import React, { useState } from 'react';
import { Check, UserPlus, X } from 'lucide-react';
import { Member } from '../types';
import { Modal } from './Modal';
import { generateUUID } from '../utils/uuid';

interface ParticipantSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  existingParticipants: string[];
  availableMembers: Member[];
  onAddParticipant: (participant: { id: string; name: string; color: string }) => void;
}

export const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  isOpen,
  onClose,
  existingParticipants,
  availableMembers,
  onAddParticipant,
}) => {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customColor, setCustomColor] = useState('#3B82F6');

  const availableColors = [
    '#3B82F6', '#EC4899', '#10B981', '#F59E0B',
    '#8B5CF6', '#EF4444', '#14B8A6', '#F97316',
  ];

  const filteredMembers = availableMembers.filter(
    (m) => !existingParticipants.includes(m.id)
  );

  const handleAddMember = (member: Member) => {
    onAddParticipant({
      id: member.id,
      name: member.name,
      color: member.color,
    });
    onClose();
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    onAddParticipant({
      id: generateUUID(),
      name: customName.trim(),
      color: customColor,
    });
    setCustomName('');
    setCustomColor('#3B82F6');
    setShowCustomForm(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter un participant" size="sm">
      <div className="space-y-4">
        {!showCustomForm ? (
          <>
            {filteredMembers.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Depuis mes membres
                </p>
                {filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleAddMember(member)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white flex-1 text-left">
                      {member.name}
                    </span>
                    <Check className="w-5 h-5 text-blue-500" />
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowCustomForm(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium transition-all duration-200 shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              Créer un nouveau participant
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du participant
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Ex: Marie, Jean, Alex..."
                className="w-full px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Couleur
              </label>
              <div className="flex gap-2 flex-wrap">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setCustomColor(color)}
                    className={`w-10 h-10 rounded-full transition-all ${
                      customColor === color
                        ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600 scale-110'
                        : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowCustomForm(false);
                  setCustomName('');
                  setCustomColor('#3B82F6');
                }}
                className="flex-1 px-4 py-3 bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800 dark:text-gray-900 dark:text-white rounded-xl font-medium transition-all"
              >
                <X className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={handleAddCustom}
                disabled={!customName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-violet-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg disabled:shadow-none"
              >
                Ajouter
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
