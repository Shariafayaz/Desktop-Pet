const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
  const p = screen.getPrimaryDisplay();
  console.log('WorkArea:', JSON.stringify(p.workArea));

  const win = new BrowserWindow({
    width: 360,
    height: 420,
    show: true,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'electron/preload.cjs'),
      contextIsolation: true
    }
  });

  await win.loadFile(path.join(__dirname, 'dist/index.html'));

  // Wait 1 second for React to render and images to load
  await new Promise(r => setTimeout(r, 1000));

  const html = await win.webContents.executeJavaScript('document.body.innerHTML');
  console.log('DOM length:', html.length);

  const imgInfo = await win.webContents.executeJavaScript(`
    (() => {
      const img = document.querySelector('img');
      if (!img) return 'No img element found!';
      return {
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        clientWidth: img.clientWidth,
        clientHeight: img.clientHeight
      };
    })()
  `);
  console.log('Image Info:', JSON.stringify(imgInfo));

  const image = await win.capturePage();
  fs.writeFileSync(path.join(__dirname, 'screenshot.png'), image.toPNG());
  console.log('Saved screenshot.png!');

  app.quit();
});
