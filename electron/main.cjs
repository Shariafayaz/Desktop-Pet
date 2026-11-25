const { app, BrowserWindow, screen, ipcMain, Menu, Tray } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { workArea } = primaryDisplay;

  // Compact window strictly wrapping Bao (no 2cm on sides, no upper space!)
  const winWidth = 72;
  const winHeight = 72;

  // Position on the bottom right, resting directly on the taskbar
  const initialX = Math.max(0, workArea.x + workArea.width - winWidth - 30);
  const initialY = Math.max(0, workArea.y + workArea.height - winHeight);

  mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: initialX,
    y: initialY,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    show: true,
    skipTaskbar: true, // Removes the Electron atom icon from the taskbar completely!
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Cross-platform dock / taskbar handling
  if (process.platform === 'darwin' && app.dock) {
    app.dock.hide(); // Hides from macOS Dock so it stays pure desktop pet!
  }

  // Cross-platform always-on-top level
  if (process.platform === 'darwin') {
    mainWindow.setAlwaysOnTop(true, 'floating');
  } else {
    mainWindow.setAlwaysOnTop(true);
  }

  const distPath = path.join(__dirname, '../dist/index.html');
  const isDev = process.argv.includes('--dev');

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('get-screen-bounds', () => {
  if (!mainWindow) return null;
  const primaryDisplay = screen.getPrimaryDisplay();
  return {
    workArea: primaryDisplay.workArea,
    bounds: primaryDisplay.bounds
  };
});

ipcMain.handle('get-window-position', () => {
  if (!mainWindow) return [0, 0];
  return mainWindow.getPosition();
});

// Window Drag Handlers (Smooth custom dragging without Windows HTCAPTION interception)
let dragOrigin = null;

ipcMain.on('window-drag-start', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const [x, y] = mainWindow.getPosition();
    dragOrigin = { x, y };
  }
});

ipcMain.on('window-drag-move', (event, { dx, dy }) => {
  if (mainWindow && !mainWindow.isDestroyed() && dragOrigin) {
    mainWindow.setPosition(dragOrigin.x + dx, dragOrigin.y + dy);
  }
});

ipcMain.on('window-drag-end', () => {
  dragOrigin = null;
});

ipcMain.on('set-window-position', (event, { x, y }) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setPosition(Math.round(x), Math.round(y));
  }
});

// Dynamic window resizing: window expands for chat/menu and shrinks to pet size when idle!
ipcMain.on('resize-window', (event, { width, height }) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const [currentX, currentY] = mainWindow.getPosition();
    const [currentW, currentH] = mainWindow.getSize();

    const targetW = Math.round(width);
    const targetH = Math.round(height);

    if (currentW === targetW && currentH === targetH) return;

    // Anchor to bottom-center so Bao stays resting on the taskbar!
    const deltaH = targetH - currentH;
    const deltaW = targetW - currentW;

    const newX = Math.round(currentX - deltaW / 2);
    const newY = Math.round(currentY - deltaH);

    mainWindow.setBounds({
      x: newX,
      y: newY,
      width: targetW,
      height: targetH
    });
  }
});

// Click-through transparency: ignore mouse events on transparent regions!
ipcMain.on('set-ignore-mouse-events', (event, { ignore, options }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && !win.isDestroyed()) {
    win.setIgnoreMouseEvents(ignore, options);
  }
});

// Native Context Menu (never cut off by window borders!)
ipcMain.on('show-context-menu', (event, { isSleeping, currentSize, alwaysOnTop }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const template = [
    { label: '🐼 Bao the Panda', enabled: false },
    { type: 'separator' },
    {
      label: '💬 Chat with Bao',
      click: () => event.sender.send('menu-action', 'chat')
    },
    {
      label: '⚽ Roll on Taskbar',
      click: () => event.sender.send('menu-action', 'roll')
    },
    {
      label: isSleeping ? '☀️ Wake Up!' : '💤 Take a Nap',
      click: () => event.sender.send('menu-action', isSleeping ? 'wake' : 'sleep')
    },
    { type: 'separator' },
    {
      label: 'Pet Size',
      submenu: [
        { label: 'Mini (45px)', type: 'radio', checked: currentSize === 45, click: () => event.sender.send('menu-action', 'size:45') },
        { label: 'Small (60px)', type: 'radio', checked: currentSize === 60, click: () => event.sender.send('menu-action', 'size:60') },
        { label: 'Medium (80px)', type: 'radio', checked: currentSize === 80, click: () => event.sender.send('menu-action', 'size:80') },
        { label: 'Normal (100px)', type: 'radio', checked: currentSize === 100, click: () => event.sender.send('menu-action', 'size:100') }
      ]
    },
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: alwaysOnTop,
      click: () => event.sender.send('menu-action', 'toggle-always-on-top')
    },
    { type: 'separator' },
    {
      label: '❌ Put to Bed (Quit)',
      click: () => app.quit()
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  menu.popup({ window: win });
});

ipcMain.on('close-app', () => {
  app.quit();
});

ipcMain.on('set-always-on-top', (event, flag) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setAlwaysOnTop(flag);
  }
});

app.whenReady().then(() => {
  createWindow();

  // Create cross-platform system tray icon (next to Ollama and clock/menu bar!)
  const iconPath = process.platform === 'win32'
    ? path.join(__dirname, '../panda.ico')
    : path.join(__dirname, '../public/sprites/idle.png');

  if (fs.existsSync(iconPath)) {
    try {
      tray = new Tray(iconPath);
      tray.setToolTip('Bao the Desktop Panda');

      const trayMenu = Menu.buildFromTemplate([
        { label: '🐼 Bao the Desktop Panda', enabled: false },
        { type: 'separator' },
        {
          label: 'Show / Focus Bao',
          click: () => {
            if (mainWindow) {
              mainWindow.show();
              mainWindow.focus();
            }
          }
        },
        {
          label: 'Wake Up',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'wake');
            }
          }
        },
        {
          label: 'Take a Nap',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'sleep');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quit Bao',
          click: () => {
            app.quit();
          }
        }
      ]);

      tray.setContextMenu(trayMenu);

      tray.on('click', () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      });
    } catch (e) {
      console.warn('Could not create tray icon:', e);
    }
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
