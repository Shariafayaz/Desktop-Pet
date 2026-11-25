# 🐼 Bao the Desktop Panda Pet

A cute, interactive, transparent desktop companion built with **React**, **Vite**, and **Electron**, featuring optional local LLM integration (**Ollama**).

![Panda Preview](./sprites_test/idle.png)

---

## ✨ Features

* **Transparent & Borderless**: Floats directly on your Windows desktop above all your other apps.
* **8 Animated Poses**: Sliced and rendered cleanly with transparent backgrounds:
  * 🎋 **Idle**: Sitting comfortably, blinking and wiggling ears.
  * 💖 **Happy**: Bouncing with joy and floating hearts when clicked or petted.
  * ❓ **Thinking / Curious**: Pondering questions when talking with AI.
  * 💤 **Sleeping**: Automatically curls up for a cozy nap after 90 seconds of inactivity.
  * ⚽ **Roll Prep, Roll 1, Roll 2**: Somersaulting along the taskbar.
  * 💫 **Dizzy**: Slumped with spiral eyes and floating stars after a big roll!
* **Taskbar Walking & Rolling**: Right-click $\rightarrow$ **"Roll on Taskbar"** to watch Bao roll all the way across your Windows taskbar!
* **Native Desktop Dragging**: Click and drag Bao anywhere on your monitor.
* **Local LLM AI Chat (Ollama)**:
  * Type questions into the speech bubble.
  * Connects to local Ollama (`http://localhost:11434`) using lightweight models like `llama3.2` or `qwen2.5`.
  * AI emotion tags dynamically switch Bao's animations in real time!
  * If Ollama is offline, Bao falls back to charming offline panda thoughts.
* **Synthesized Cute Audio**: Web Audio API generates pops, purrs, munches, and yawns with zero external sound files.
* **Right-Click Context Menu**:
  * 🎋 Feed Bamboo
  * ⚽ Roll on Taskbar
  * 💬 Talk with AI
  * 💤 Take a Nap / ☀️ Wake Up
  * 📌 Toggle Always-on-Top
  * ❌ Put to Bed (Quit)

---

## 🚀 Quick Start

### 1. Launch the Desktop Pet
To launch the desktop pet directly:
```bash
npm start
```

Or for live development (hot-reload React changes):
```bash
npm run dev
```

---

## 🤖 Optional: Connecting Local AI (Ollama)

If you have [Ollama](https://ollama.com/) installed:
1. Make sure Ollama is running (`ollama run llama3.2`).
2. Type any question into Bao's speech bubble!
3. If Ollama is not installed or turned off, Bao still works 100% with cute built-in conversations and tricks.
