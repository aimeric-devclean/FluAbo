import React, { useState } from 'react';
import { GripVertical, UserPlus, Trash2, AlertCircle } from 'lucide-react';
import { Member } from '../types';

interface Participant {
  id: string;
  name: string;
  color: string;
}

interface RotationManagerProps {
  participants: Participant[];
  currentIndex: number;
  onReorder: (newOrder: Participant[]) => void;
  onAddParticipant: () => void;
  onRemoveParticipant: (id: string) => void;
  availableMembers: Member[];
}

export const RotationManager: React.FC<RotationManagerProps> = ({
  participants,
  currentIndex,
  onReorder,
  onAddParticipant,
  onRemoveParticipant,
  availableMembers,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newOrder = [...participants];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    onReorder(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleTouchStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropIndex = element?.getAttribute('data-index');
    if (dropIndex) {
      setDragOverIndex(parseInt(dropIndex));
    }
  };

  const handleTouchEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newOrder = [...participants];
      const draggedItem = newOrder[draggedIndex];
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(dragOverIndex, 0, draggedItem);
      onReorder(newOrder);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-500" />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Maintenez et glissez pour réorganiser
          </p>
        </div>
        {availableMembers.length > 0 && (
          <button
            onClick={onAddParticipant}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 dark:rounded-lg transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Ajouter
          </button>
        )}
      </div>

      <div className="space-y-2">
        {participants.map((participant, index) => {
          const isCurrent = index === currentIndex;
          const isNext = index === (currentIndex + 1) % participants.length;
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={participant.id}
              data-index={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onTouchStart={() => handleTouchStart(index)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`
                relative flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur
                border transition-all duration-200 cursor-move touch-none
                ${isDragging ? 'opacity-50 scale-95' : ''}
                ${isDragOver ? 'border-blue-500 dark:border-blue-400 scale-[1.02]' : 'border-gray-200/50 dark:border-gray-800'}
                ${isCurrent ? 'ring-2 ring-green-500 dark:ring-green-400 shadow-lg' : ''}
                ${isNext ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-md' : ''}
              `}
            >
              <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" />

              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: participant.color }}
                  >
                    {participant.name.charAt(0)}
                  </div>
                  {isCurrent && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 dark:bg-green-400 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  )}
                  {isNext && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-[8px] text-white font-bold">→</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {participant.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span>Position {index + 1}</span>
                    {isCurrent && (
                      <>
                        <span className="w-1 h-1 bg-gray-400 rounded-full" />
                        <span className="text-green-600 dark:text-green-400 font-medium">Payeur actuel</span>
                      </>
                    )}
                    {isNext && (
                      <>
                        <span className="w-1 h-1 bg-gray-400 rounded-full" />
                        <span className="text-blue-600 dark:text-blue-400 font-medium">Prochain</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {participants.length > 2 && (
                <button
                  onClick={() => onRemoveParticipant(participant.id)}
                  className="flex-shrink-0 p-2 text-red-500 dark:rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {participants.length < 2 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Ajoutez au moins 2 participants pour utiliser la rotation
          </p>
        </div>
      )}
    </div>
  );
};
