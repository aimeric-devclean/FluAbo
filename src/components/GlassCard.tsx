import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        backdrop-blur-md bg-white/70 dark:bg-gray-800/70
        border border-white/20 dark:border-gray-700/50
        rounded-2xl shadow-lg
        transition-all duration-300
        ${onClick ? 'cursor-pointer ' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
