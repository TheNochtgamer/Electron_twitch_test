const { contextBridge, ipcRenderer } = require('electron');

const api = {
  //   handleCounter: (cb) => ipcRenderer.on('counter', cb),
  handleLog: (cb) => ipcRenderer.on('log', (_, ...args) => cb(...args))
};

contextBridge.exposeInMainWorld('api', api);
