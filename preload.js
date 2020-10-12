// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {

});

window.document.addEventListener('ready', () => {

});

dataSetRootPath = null;

const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.on('open-dataset', (e, ...args) => {
        onOpenDataset(args[0] || { path: '', files: [] });
    })
});

//enable ipcRenderer feature
window.ipcRenderer = ipcRenderer;



