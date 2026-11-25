const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopPet', {
  getScreenBounds: () => ipcRenderer.invoke('get-screen-bounds'),
  getWindowPosition: () => ipcRenderer.invoke('get-window-position'),
  setWindowPosition: (x, y) => ipcRenderer.send('set-window-position', { x, y }),
  dragStart: () => ipcRenderer.send('window-drag-start'),
  dragMove: (dx, dy) => ipcRenderer.send('window-drag-move', { dx, dy }),
  dragEnd: () => ipcRenderer.send('window-drag-end'),
  resizeWindow: (width, height) => ipcRenderer.send('resize-window', { width, height }),
  showContextMenu: (opts) => ipcRenderer.send('show-context-menu', opts),
  onMenuAction: (cb) => ipcRenderer.on('menu-action', (event, action) => cb(action)),
  setIgnoreMouseEvents: (ignore, options) => ipcRenderer.send('set-ignore-mouse-events', { ignore, options }),
  closeApp: () => ipcRenderer.send('close-app'),
  setAlwaysOnTop: (flag) => ipcRenderer.send('set-always-on-top', flag)
});
