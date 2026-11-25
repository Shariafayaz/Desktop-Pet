import React, { useEffect, useRef } from 'react';
import { RotateCw, MessageCircle, Moon, Sun, Power, Pin } from 'lucide-react';

export default function ContextMenu({
  isOpen,
  onClose,
  onRoll,
  onToggleChat,
  onSleep,
  onWake,
  isSleeping,
  currentSize = 60,
  onChangeSize,
  onQuit,
  alwaysOnTop,
  onToggleAlwaysOnTop
}) {
  const menuRef = useRef(null);

  // Close when clicking anywhere outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('contextmenu', handleOutsideClick);
    }
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('contextmenu', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Scale menu proportions dynamically according to Bao's size
  const scale = currentSize <= 45 ? 0.78 : currentSize <= 60 ? 0.88 : currentSize <= 80 ? 1.0 : 1.12;
  const menuWidth = Math.round(155 * scale);
  const fontSize = Math.round(12 * scale);
  const iconSize = Math.max(12, Math.round(14 * scale));
  const padding = Math.round(5 * scale);

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'absolute',
        bottom: currentSize + 10,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(12px)',
        border: '1.5px solid #2d3748',
        borderRadius: `${Math.round(14 * scale)}px`,
        padding: `${padding}px`,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.22)',
        width: `${menuWidth}px`,
        WebkitAppRegion: 'no-drag',
        animation: 'fadeIn 0.15s ease-out'
      }}
    >
      <div style={{ padding: '3px 8px', fontSize: `${Math.max(9, Math.round(10 * scale))}px`, fontWeight: 'bold', color: '#718096', borderBottom: '1px solid #edf2f7' }}>
        🐼 BAO
      </div>

      <button className="menu-item" style={{ fontSize: `${fontSize}px`, padding: `${padding}px 8px` }} onClick={() => { onToggleChat(); onClose(); }}>
        <MessageCircle size={iconSize} color="#805ad5" />
        <span>Talk with AI</span>
      </button>

      <button className="menu-item" style={{ fontSize: `${fontSize}px`, padding: `${padding}px 8px` }} onClick={() => { onRoll(); onClose(); }}>
        <RotateCw size={iconSize} color="#3182ce" />
        <span>Roll on Taskbar</span>
      </button>

      {isSleeping ? (
        <button className="menu-item" style={{ fontSize: `${fontSize}px`, padding: `${padding}px 8px` }} onClick={() => { onWake(); onClose(); }}>
          <Sun size={iconSize} color="#d69e2e" />
          <span>Wake Up!</span>
        </button>
      ) : (
        <button className="menu-item" style={{ fontSize: `${fontSize}px`, padding: `${padding}px 8px` }} onClick={() => { onSleep(); onClose(); }}>
          <Moon size={iconSize} color="#4a5568" />
          <span>Take a Nap</span>
        </button>
      )}

      <div style={{ height: '1px', background: '#edf2f7', margin: '3px 0' }} />

      {/* Pet Size Controls */}
      <div style={{ padding: '3px 8px 1px 8px', fontSize: `${Math.max(9, Math.round(9.5 * scale))}px`, fontWeight: 'bold', color: '#a0aec0' }}>
        SIZE
      </div>
      <div style={{ display: 'flex', gap: '3px', padding: '0 4px 3px 4px' }}>
        {[
          { label: 'Mini', val: 45 },
          { label: 'Small', val: 60 },
          { label: 'Med', val: 80 },
          { label: 'Norm', val: 100 }
        ].map(s => (
          <button
            key={s.val}
            onClick={() => { onChangeSize && onChangeSize(s.val); onClose(); }}
            style={{
              flex: 1,
              padding: '3px 0',
              fontSize: `${Math.max(9, Math.round(10 * scale))}px`,
              borderRadius: '6px',
              border: currentSize === s.val ? '1.5px solid #2d3748' : '1px solid #e2e8f0',
              background: currentSize === s.val ? '#edf2f7' : '#fff',
              fontWeight: currentSize === s.val ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ height: '1px', background: '#edf2f7', margin: '3px 0' }} />

      <button className="menu-item" style={{ fontSize: `${fontSize}px`, padding: `${padding}px 8px` }} onClick={() => { onToggleAlwaysOnTop(); onClose(); }}>
        <Pin size={iconSize} color={alwaysOnTop ? '#3182ce' : '#a0aec0'} />
        <span>{alwaysOnTop ? 'On Top: Yes' : 'On Top: No'}</span>
      </button>

      <button className="menu-item danger" style={{ fontSize: `${fontSize}px`, padding: `${padding}px 8px` }} onClick={() => { onQuit(); onClose(); }}>
        <Power size={iconSize} color="#e53e3e" />
        <span>Quit</span>
      </button>
    </div>
  );
}
