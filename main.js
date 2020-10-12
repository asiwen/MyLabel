// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

mainWindow = null;
datasetPath = null;
loadedLabels = new Map();

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
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

function loadLabels(filename) {
    const data = fs.readFileSync(filename, 'UTF-8');
    const lines = data.split(/\r?\n/);

    loadedLabels.clear();

    return lines.reduce((acc, curr) => {
        const key_label = curr.split(',');
        if (key_label.length == 2) {
            acc.set(key_label[0], key_label[1]);
        }
        return acc;
    }, loadedLabels);
}

function saveLabels() {
    if (datasetPath != null && loadedLabels != null) {
        const data = Array.from(loadedLabels).map(item => `${item[0]},${item[1]}`).join("\r\n");
        fs.writeFileSync(path.join(datasetPath, "labels.csv"), data);
    }
}

function openDataSet() {
    dialog.showOpenDialog({ title: 'Please select a directory.', properties: ['openDirectory'] })
        .then(result => {
            if (!result.canceled) {
                //重新打开文件夹时，先保存已经标注的数据,并清除缓存的标签数据
                saveLabels()
                loadedLabels.clear();

                datasetPath = result.filePaths[0];
                let dataset = fs.readdirSync(datasetPath, { withFileTypes: true })
                    .reduce((acc, dirent) => {
                        let dname = dirent.name;
                        if (dirent.isFile() && dname.slice(-4).toUpperCase() === '.PNG') {
                            acc['files'].push(dirent.name);
                        } else if (dirent.isFile() && dname.toUpperCase() == 'LABELS.CSV') {
                            acc['labels'] = loadLabels(path.join(acc['path'], dname));
                        }
                        return acc;
                    }, { path: datasetPath, files: [], labels: null });
                if (dataset['labels'] == null) {
                    dataset['labels'] = loadedLabels;
                }
                mainWindow.webContents.send('open-dataset', dataset);
            }
        });
}

function initMenu() {
    let templates = [{
        label: 'File',
        submenu: [{
            label: 'Open',
            accelerator: 'CmdOrCtrl+O',
            click: openDataSet
        }, {
            label: 'Save',
            accelerator: 'CmdOrCtrl+S',
            click: saveLabels
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
            role: 'reload'
        }, {
            label: 'DevTools',
            accelerator: 'F12',
            role: 'toggleDevTools'
        }]
    }];
    Menu.setApplicationMenu(Menu.buildFromTemplate(templates));
}

function openModalDialog(url) {
    Menu.setApplicationMenu(null);

    const mywin = new BrowserWindow({
        show: false,
        parent: mainWindow,
        modal: true,
        minimizable: false,
        maximizable: false,
        center: true
    });

    mywin.loadURL(url)
    mywin.maximize();
    mywin.show();

    mywin.on('closed', initMenu);
}

//Override app default quit
const default_quit = app.quit;
app.quit = () => {
    saveLabels();
    default_quit.call(app);
}

ipcMain.on('update-label', (e, arg) => {
    const id = arg['id'];
    const label = arg['label'];
    if (id != null && label != null) {
        loadedLabels.set(id, label);
    }
});

ipcMain.on('open-modaldialog', (e, arg) => {
    if (arg['url']) openModalDialog(arg['url']);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()

    initMenu()

    app.on('activate', function() {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
