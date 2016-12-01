var menubar = require('menubar')

if (!process.env.NAVITIA_TOKEN) {
  console.log("/!\\ Warning : Please set the navitia token");
  process.exit(1);
}

/*
var mb = menubar({
    width: 300,
    height: 300,
});

mb.on('ready', function ready () {
});

mb.on('after-create-window', function ready () {
  mb.window.openDevTools();
})
*/

const electron = require('electron');

// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;


function createWindow() {
mainWindow = new BrowserWindow({
        'minWidth': 830,
        'minHeight': 600,
        'width': 1000,
        'height': 600
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);


    // Open the DevTools.
    mainWindow.webContents.openDevTools();
}

app.on('ready', createWindow);
