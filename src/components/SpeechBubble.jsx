import React, { useState } from 'react';
import { Send, X, Sparkles } from 'lucide-react';

export default function SpeechBubble({
  message,
  isLoading,
  showInput = false,
  onSendMessage,
  onClose
}) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div
      className="speech-bubble-wrapper"
      style={{
        position: 'relative',
        width: '92%',
        maxWidth: '220px',
        margin: '0 auto 6px auto',
        WebkitAppRegion: 'no-drag',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="speech-bubble"
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(10px)',
          borderRadius: '14px',
          padding: '8px 10px',
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.16)',
          border: '1.5px solid #2d3748',
          fontSize: '11.5px',
          color: '#1a202c',
          lineHeight: '1.35',
          position: 'relative',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            title="Close"
            style={{
              position: 'absolute',
              top: '4px',
              right: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#a0aec0',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}
          >
            <X size={13} />
          </button>
        )}

        {/* Message Content */}
        <div style={{ paddingRight: showInput ? '14px' : '0', minHeight: '20px', wordBreak: 'break-word' }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4a5568' }}>
              <Sparkles size={14} className="spin-icon" style={{ color: '#ed8936' }} />
              <span>Thinking...</span>
            </div>
          ) : (
            <span>{message}</span>
          )}
        </div>

        {/* Chat Input Field (Only shown when user opens chat mode!) */}
        {showInput && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '5px', marginTop: '6px' }}>
            <input
              type="text"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Bao anything..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '4px 8px',
                borderRadius: '8px',
                border: '1px solid #cbd5e0',
                outline: 'none',
                fontSize: '11px',
                background: '#f7fafc',
                color: '#2d3748'
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                background: input.trim() ? '#2d3748' : '#e2e8f0',
                color: input.trim() ? '#fff' : '#a0aec0',
                border: 'none',
                borderRadius: '8px',
                width: '26px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'background 0.2s'
              }}
            >
              <Send size={12} />
            </button>
          </form>
        )}

        {/* Comic Pointer Triangle */}
        <div
          style={{
            position: 'absolute',
            bottom: '-9px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '9px solid #2d3748'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '7px solid #ffffff'
          }}
        />
      </div>
    </div>
  );
}
