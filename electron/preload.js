const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    restore: () => ipcRenderer.send('window-restore'),
    onWindowControl: (callback) => {
        ipcRenderer.on('window-control', (event, data) => callback(data))
    },
    enterBackground: () => ipcRenderer.send('window-control', 'background'),
    exitBackground: () => ipcRenderer.send('window-control', 'restore-from-background'),
    widgetDrag: (dx, dy) => ipcRenderer.send('widget-drag', { dx, dy })
});
