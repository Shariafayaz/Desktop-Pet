const { app, BrowserWindow } = require('electron');
app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 76, height: 76, frame: false, transparent: true, show: false });
  console.log('Requested 76x76, Actual size:', win.getSize());
  win.setBounds({ x: 100, y: 100, width: 76, height: 76 });
  console.log('After setBounds 76x76:', win.getSize());
  app.quit();
});
