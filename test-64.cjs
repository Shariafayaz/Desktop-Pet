const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
  const p = screen.getPrimaryDisplay();
  const { workArea } = p;
  const size = 64;

  const win = new BrowserWindow({
    width: size,
    height: size,
    x: workArea.x + workArea.width - size - 20,
    y: workArea.y + workArea.height - size,
    show: true,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'electron/preload.cjs'),
      contextIsolation: true
    }
  });

  await win.loadFile(path.join(__dirname, 'dist/index.html'));
  await new Promise(r => setTimeout(r, 1000));

  const image = await win.capturePage();
  fs.writeFileSync(path.join(__dirname, 'test-64.png'), image.toPNG());
  console.log('Saved test-64.png!');
  app.quit();
});
