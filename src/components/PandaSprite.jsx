import React, { useState, useRef } from 'react';
import { playPop, playPurr } from '../services/audio';

const SPRITES = {
  idle: './sprites/idle.png',
  happy: './sprites/happy.png',
  thinking: './sprites/thinking.png',
  curious: './sprites/thinking.png',
  sleeping: './sprites/sleeping.png',
  roll_prep: './sprites/roll_prep.png',
  roll_1: './sprites/roll_1.png',
  roll_2: './sprites/roll_2.png',
  dizzy: './sprites/dizzy.png'
};

export default function PandaSprite({
  state = 'idle',
  size = 60,
  onClick,
  onDoubleClick,
  onContextMenu,
  isRolling = false
}) {
  const [isBouncing, setIsBouncing] = useState(false);
  const [hearts, setHearts] = useState([]);
  const dragRef = useRef({ isDown: false, startX: 0, startY: 0, hasMoved: false });

  const currentSprite = SPRITES[state] || SPRITES.idle;

  const triggerClickFeedback = (e) => {
    const newHeart = {
      id: Date.now(),
      x: (Math.random() - 0.5) * (size * 0.4),
      y: (Math.random() - 0.5) * 12
    };
    setHearts(prev => [...prev.slice(-3), newHeart]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1200);

    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 400);

    if (onClick) onClick(e);
  };

  // Custom Drag handling without Windows HTCAPTION interference
  const handleMouseDown = (e) => {
    // Only handle left mouse button for dragging/clicking
    if (e.button !== 0) return;

    dragRef.current = {
      isDown: true,
      startX: e.screenX,
      startY: e.screenY,
      hasMoved: false
    };

    if (window.desktopPet?.dragStart) {
      window.desktopPet.dragStart();
    }

    const handleMouseMove = (moveEvent) => {
      if (!dragRef.current.isDown) return;
      const dx = moveEvent.screenX - dragRef.current.startX;
      const dy = moveEvent.screenY - dragRef.current.startY;

      if (!dragRef.current.hasMoved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        dragRef.current.hasMoved = true;
      }

      if (dragRef.current.hasMoved && window.desktopPet?.dragMove) {
        window.desktopPet.dragMove(dx, dy);
      }
    };

    const handleMouseUp = (upEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      if (window.desktopPet?.dragEnd) {
        window.desktopPet.dragEnd();
      }

      const wasDragging = dragRef.current.hasMoved;
      dragRef.current.isDown = false;

      // If user simply clicked without dragging, trigger click interaction
      if (!wasDragging) {
        triggerClickFeedback(upEvent);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`panda-container ${isBouncing ? 'bounce' : ''} ${isRolling ? 'rolling' : ''}`}
      onMouseDown={handleMouseDown}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (onDoubleClick) onDoubleClick(e);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onContextMenu) onContextMenu(e);
      }}
      title="Click to pet/wake Bao! Double-click to chat. Drag anywhere to move."
      style={{
        position: 'relative',
        width: size,
        height: size,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        userSelect: 'none'
      }}
    >
      {/* Floating hearts on click */}
      {hearts.map(h => (
        <span
          key={h.id}
          className="floating-heart"
          style={{
            position: 'absolute',
            top: 5 + h.y,
            left: size / 2 - 8 + h.x,
            pointerEvents: 'none',
            fontSize: `${Math.max(14, Math.round(size * 0.22))}px`
          }}
        >
          💖
        </span>
      ))}

      {/* Main Panda Character Sprite */}
      <img
        src={currentSprite}
        alt={`Panda ${state}`}
        draggable={false}
        className="panda-image"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: `scale(${state === 'happy' ? 1.18 : state === 'thinking' ? 1.10 : 1.0})`,
          transformOrigin: 'bottom center',
          filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.2))',
          pointerEvents: 'none',
          transition: 'transform 0.15s ease'
        }}
      />
    </div>
  );
}
