import React, { useState, useRef, useEffect } from 'react';

export interface SwipeAction {
    icon: React.ReactNode;
    label: string;
    color: string;
    onClick: () => void;
}

interface SwipeableCardProps {
    children: React.ReactNode;
    actions: SwipeAction[];
    onTap?: () => void;
    className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
    children,
    actions,
    onTap,
    className = '',
}) => {
    const [offsetX, setOffsetX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const cardRef = useRef<HTMLDivElement>(null);

    // Actions plus compactes - 65px au lieu de 80px
    const actionWidth = 65;
    const actionsWidth = actionWidth * actions.length;

    const handleTouchStart = (e: React.TouchEvent) => {
        setStartX(e.touches[0].clientX);
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const currentX = e.touches[0].clientX;
        const diff = startX - currentX;

        if (diff > 0) {
            // Ajoute un effet d'élasticité au swipe
            const elasticOffset = diff > actionsWidth ?
                actionsWidth + (diff - actionsWidth) * 0.3 : diff;
            setOffsetX(Math.min(elasticOffset, actionsWidth * 1.2));
        } else {
            setOffsetX(0);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        // Seuil de déclenchement à 40% pour plus de réactivité
        if (offsetX > actionsWidth * 0.4) {
            setOffsetX(actionsWidth);
        } else {
            setOffsetX(0);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault(); // Empêche la sélection de texte
        setStartX(e.clientX);
        setIsDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const diff = startX - e.clientX;

        if (diff > 0) {
            const elasticOffset = diff > actionsWidth ?
                actionsWidth + (diff - actionsWidth) * 0.3 : diff;
            setOffsetX(Math.min(elasticOffset, actionsWidth * 1.2));
        } else {
            setOffsetX(0);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (offsetX > actionsWidth * 0.4) {
            setOffsetX(actionsWidth);
        } else {
            setOffsetX(0);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        if (offsetX > 0) {
            e.stopPropagation();
            setOffsetX(0);
            return;
        }
        if (onTap && !isDragging && Math.abs(offsetX) < 5) {
            onTap();
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
                setOffsetX(0);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={cardRef} className="relative overflow-hidden rounded-xl">
            {/* Actions en arrière-plan avec style amélioré */}
            <div className="absolute right-0 top-0 bottom-0 flex items-center rounded-xl overflow-hidden">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={(e) => {
                            e.stopPropagation();
                            action.onClick();
                            setTimeout(() => setOffsetX(0), 150);
                        }}
                        className={`h-full flex flex-col items-center justify-center gap-0.5 transition-all duration-300 hover:brightness-110 active:scale-95`}
                        style={{
                            width: `${actionWidth}px`,
                            background: action.color,
                            opacity: offsetX > 0 ? 1 : 0,
                            transform: `scale(${offsetX > 0 ? 1 : 0.85})`,
                        }}
                    >
                        <div className="transform transition-transform ">
                            {action.icon}
                        </div>
                        <span className="text-[10px] font-bold text-white px-1">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Carte principale avec animation fluide */}
            <div
                className={`relative transition-all ${isDragging ? '' : 'duration-300 ease-out'
                    } ${onTap ? 'cursor-pointer' : ''} ${className}`}
                style={{
                    transform: `translateX(-${offsetX}px)`,
                    willChange: isDragging ? 'transform' : 'auto',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                    if (isDragging) {
                        handleMouseUp();
                    }
                }}
                onClick={handleClick}
            >
                {children}
            </div>
        </div>
    );
};