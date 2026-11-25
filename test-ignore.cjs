const { app, BrowserWindow, ipcMain } = require('electron');
app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 300,
    height: 300,
    transparent: true,
    frame: false,
    show: false
  });
  console.log('Testing setIgnoreMouseEvents on Windows...');
  win.setIgnoreMouseEvents(true, { forward: true });
  console.log('setIgnoreMouseEvents succeeded without errors!');
  app.quit();
});
