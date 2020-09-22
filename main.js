// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, dialog} = require('electron')
const path = require('path')

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  mainWindow.maximize();
  mainWindow.show();

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

function initMenu() {
  let templates = [{
      label: 'File',
      submenu: [{
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          dialog.showOpenDialog({title:'Please select a directory.', properties: ['openDirectory']})
          .then(result => {
            console.log(result.canceled);
            console.log(result.filePaths);
          })
        }
      }, {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        role: 'close'
      }]
    }, {
      label: 'Help',
      submenu: [{
        label: 'Manual',
        accelerator: 'CmdOrCtrl+H',
        click: () => {
          dialog.showMessageBoxSync({
            title: 'mylabel - Manual',
            message: '使用方法:',
            detail: '按“空格”键：开始标记； 按“<-”或“->”键： 切换到“上一个”或“下一个”'
          });
        }
      }, {
        label: 'ForceLoad',
        accelerator: 'F5',
        role: 'forceload'
      }, {
        label: 'DevTools',
        accelerator: 'F12',
        role: 'toggleDevTools'
      }]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(templates));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  initMenu()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
