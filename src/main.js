// Modules to control application life and create native browser window
const { app, shell, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { electronApp, optimizer } = require('@electron-toolkit/utils');
const Tmi = require('./structures/Tmi');

function createWindow(width, height) {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width,
    height,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux'
      ? {
          icon: path.join(__dirname, '../resources/icon.png')
        }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, '/views/preload.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '/views/index.html'));
  return mainWindow;
}

// Default open or close DevTools by F12 in development
// and ignore CommandOrControl + R in production.
// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
app.on('browser-window-created', (_, window) => {
  optimizer.watchWindowShortcuts(window);
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

app.once('ready', async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  const mainWindow = createWindow(800, 600);
  const tmi = new Tmi((...args) => mainWindow.webContents.send('log', ...args));
  await tmi.init();

  // let count = 1;
  // setInterval(() => mainWindow.webContents.send('counter', count++), 1000 * 2);

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', function () {
    tmi.disconnect();
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
});
