import React, { useState, useEffect, useRef } from 'react';
import PandaSprite from './components/PandaSprite';
import SpeechBubble from './components/SpeechBubble';
import ContextMenu from './components/ContextMenu';
import { askPandaAI } from './services/ollama';

export default function App() {
  const [petState, setPetState] = useState('idle');
  const [petSize, setPetSize] = useState(() => {
    const saved = localStorage.getItem('panda_pet_size');
    const val = saved ? Number(saved) : null;
    if (val && val <= 70) return val;
    return 60; // Extra compact default!
  });

  const [message, setMessage] = useState("");
  const [isBubbleOpen, setIsBubbleOpen] = useState(false); // Hidden by default
  const [showChatInput, setShowChatInput] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [alwaysOnTop, setAlwaysOnTop] = useState(true);

  const idleTimerRef = useRef(null);
  const bubbleAutoCloseTimer = useRef(null);
  const stateResetTimerRef = useRef(null);

  // Auto-close bubble after delay
  const scheduleBubbleClose = (delayMs = 4000) => {
    if (bubbleAutoCloseTimer.current) clearTimeout(bubbleAutoCloseTimer.current);
    bubbleAutoCloseTimer.current = setTimeout(() => {
      setIsBubbleOpen(false);
      setShowChatInput(false);
    }, delayMs);
  };

  const scheduleIdleReset = (delay = 3000) => {
    if (stateResetTimerRef.current) clearTimeout(stateResetTimerRef.current);
    stateResetTimerRef.current = setTimeout(() => {
      setPetState((current) => {
        if (current === 'sleeping' || current.startsWith('roll')) return current;
        return 'idle';
      });
    }, delay);
  };

  // 90s inactivity sleep (quiet, no bubble, just sprite sleeping)
  const resetActivityTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setPetState('sleeping');
      setIsBubbleOpen(false);
      setShowChatInput(false);
    }, 90000);
  };

  // True Click-Through: only Bao, Speech Bubble, and Context Menu intercept clicks!
  // Any transparent empty space passes mouse clicks directly to underlying Windows apps!
  useEffect(() => {
    if (!window.desktopPet?.setIgnoreMouseEvents) return;

    let currentlyIgnoring = false;

    const handleMouseMove = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const isOverInteractive = el && 
        el.tagName !== 'HTML' && 
        el.tagName !== 'BODY' && 
        el.id !== 'root';

      const shouldIgnore = !isOverInteractive;
      if (shouldIgnore !== currentlyIgnoring) {
        currentlyIgnoring = shouldIgnore;
        window.desktopPet.setIgnoreMouseEvents(shouldIgnore, { forward: true });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Listen to native menu actions from Electron
  useEffect(() => {
    if (window.desktopPet?.onMenuAction) {
      window.desktopPet.onMenuAction((action) => {
        if (action === 'chat') {
          handleOpenChat();
        } else if (action === 'feed') {
          handleFeed();
        } else if (action === 'roll') {
          handleRollOnTaskbar();
        } else if (action === 'sleep') {
          handleSleep();
        } else if (action === 'wake') {
          handleWake();
        } else if (action.startsWith('size:')) {
          const sz = parseInt(action.replace('size:', ''), 10);
          setPetSize(sz);
          localStorage.setItem('panda_pet_size', sz);
        } else if (action === 'toggle-always-on-top') {
          setAlwaysOnTop(prev => {
            const next = !prev;
            window.desktopPet?.setAlwaysOnTop(next);
            return next;
          });
        }
      });
    }

    resetActivityTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (bubbleAutoCloseTimer.current) clearTimeout(bubbleAutoCloseTimer.current);
      if (stateResetTimerRef.current) clearTimeout(stateResetTimerRef.current);
    };
  }, []);

  // Single click: purely visual reaction (bounce + heart), NO text bubbles!
  const handlePandaClick = () => {
    resetActivityTimer();
    if (petState === 'sleeping') {
      // Wake up silently to happy
      setPetState('happy');
      scheduleIdleReset(2500);
      return;
    }

    if (!petState.startsWith('roll')) {
      setPetState('happy');
      scheduleIdleReset(2000);
    }
  };

  // Double click: open chat
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    handleOpenChat();
  };

  const handleOpenChat = () => {
    resetActivityTimer();
    setMessage("Ask me anything!");
    setShowChatInput(true);
    setIsBubbleOpen(true);
    scheduleBubbleClose(10000); // Closes automatically after 10s if not used
  };

  // Dynamic window resizing: strictly compact (72x72) when idle
  // Expands only while chat is active!
  useEffect(() => {
    if (!window.desktopPet?.resizeWindow) return;
    if (isBubbleOpen || showChatInput) {
      window.desktopPet.resizeWindow(230, 180);
    } else {
      const compact = Math.round(petSize + 12);
      window.desktopPet.resizeWindow(compact, compact);
    }
  }, [isBubbleOpen, showChatInput, petSize]);

  // Right click -> Open native Windows menu (no window expansion needed!)
  const handleContextMenu = (e) => {
    e.preventDefault();
    setIsBubbleOpen(false);
    setShowChatInput(false);
    if (window.desktopPet?.showContextMenu) {
      window.desktopPet.showContextMenu({
        isSleeping: petState === 'sleeping',
        currentSize: petSize,
        alwaysOnTop
      });
    }
  };

  // Feed bamboo: happy visual munching, NO text bubble!
  const handleFeed = () => {
    resetActivityTimer();
    setPetState('happy');
    setIsBubbleOpen(false);
    scheduleIdleReset(3000);
  };

  // Roll on taskbar: stays precisely at current Y position so it NEVER goes below the taskbar!
  const handleRollOnTaskbar = async () => {
    if (isRolling) return;
    setIsRolling(true);
    resetActivityTimer();
    setIsBubbleOpen(false);
    setShowChatInput(false);

    setPetState('roll_prep');
    await new Promise(r => setTimeout(r, 350));

    if (window.desktopPet) {
      try {
        const boundsData = await window.desktopPet.getScreenBounds();
        const currentPos = await window.desktopPet.getWindowPosition();

        if (boundsData && currentPos) {
          const { workArea } = boundsData;
          // Keep current Y position exactly where the pet currently is!
          const rollY = currentPos[1];
          let currentX = currentPos[0];

          // Roll to the opposite side of the screen
          const targetX = currentX > workArea.width / 2 ? workArea.x + 20 : workArea.x + workArea.width - 260;
          const stepDirection = targetX > currentX ? 1 : -1;
          const totalDistance = Math.abs(targetX - currentX);
          const steps = Math.min(Math.floor(totalDistance / 16), 55);

          let frameToggle = false;
          for (let i = 0; i < steps; i++) {
            currentX += stepDirection * 16;
            frameToggle = !frameToggle;
            setPetState(frameToggle ? 'roll_1' : 'roll_2');
            window.desktopPet.setWindowPosition(currentX, rollY);
            await new Promise(r => setTimeout(r, 65));
          }
        }
      } catch (err) {
        console.warn('Roll error:', err);
      }
    } else {
      for (let i = 0; i < 15; i++) {
        setPetState(i % 2 === 0 ? 'roll_1' : 'roll_2');
        await new Promise(r => setTimeout(r, 120));
      }
    }

    // Dizzy landing!
    setPetState('dizzy');
    await new Promise(r => setTimeout(r, 2200));

    setPetState('idle');
    setIsRolling(false);
  };

  // Send message to AI
  const handleSendMessage = async (text) => {
    resetActivityTimer();
    if (bubbleAutoCloseTimer.current) clearTimeout(bubbleAutoCloseTimer.current);
    setIsLoading(true);
    setPetState('thinking');
    setMessage("Thinking...");
    setIsBubbleOpen(true);
    setShowChatInput(false);

    await askPandaAI(text, {
      onChunk: (chunkText, emotion) => {
        setMessage(chunkText);
        if (emotion && emotion !== 'thinking') {
          setPetState(emotion);
        }
      },
      onDone: (finalText, emotion) => {
        setIsLoading(false);
        setMessage(finalText);
        setPetState(emotion || 'happy');
        scheduleIdleReset(5000);
        scheduleBubbleClose(6000); // Closes automatically after 6s
      },
      onError: () => {
        setIsLoading(false);
        setMessage("Hmm, something went wrong!");
        setPetState('dizzy');
        scheduleBubbleClose(3000);
        scheduleIdleReset(3000);
      }
    });
  };

  const handleSleep = () => {
    setPetState('sleeping');
    setIsBubbleOpen(false);
    setShowChatInput(false);
  };

  const handleWake = () => {
    setPetState('happy');
    setIsBubbleOpen(false);
    setShowChatInput(false);
    scheduleIdleReset(2500);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Speech Bubble (ONLY appears when asking a question, auto-closes after!) */}
      {isBubbleOpen && (
        <SpeechBubble
          message={message}
          isLoading={isLoading}
          showInput={showChatInput}
          onSendMessage={handleSendMessage}
          onClose={() => {
            setIsBubbleOpen(false);
            setShowChatInput(false);
          }}
        />
      )}

      {/* Context Menu (Scales with Bao and sits right above him) */}
      <ContextMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onRoll={handleRollOnTaskbar}
        onToggleChat={handleOpenChat}
        onSleep={handleSleep}
        onWake={handleWake}
        isSleeping={petState === 'sleeping'}
        currentSize={petSize}
        onChangeSize={(newSize) => {
          setPetSize(newSize);
          localStorage.setItem('panda_pet_size', newSize);
        }}
        alwaysOnTop={alwaysOnTop}
        onToggleAlwaysOnTop={() => {
          const next = !alwaysOnTop;
          setAlwaysOnTop(next);
          if (window.desktopPet) {
            window.desktopPet.setAlwaysOnTop(next);
          }
        }}
        onQuit={() => {
          if (window.desktopPet) {
            window.desktopPet.closeApp();
          } else {
            alert('Quit');
          }
        }}
      />

      {/* The Animated Panda Character */}
      <PandaSprite
        state={petState}
        size={petSize}
        isRolling={isRolling}
        onClick={handlePandaClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
}
