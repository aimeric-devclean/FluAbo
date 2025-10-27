import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-violet-500/50 active:scale-95 transition-all duration-200 flex items-center justify-center group"
      aria-label="Ajouter"
    >
      <Plus size={24} strokeWidth={2.5} className="group-active:rotate-90 transition-transform duration-200" />
    </button>
  );
};
