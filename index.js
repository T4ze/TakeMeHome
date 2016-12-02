var menubar = require('menubar')

if (!process.env.NAVITIA_TOKEN) {
  console.log("/!\\ Warning : Please set the navitia token");
  process.exit(1);
}

/*
var mb = menubar({
    width: 350,
    height: 400,
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
        'minWidth': 350,
        'minHeight': 400,
        'width': 350,
        'height': 400
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);


    // Open the DevTools.
    mainWindow.webContents.openDevTools();
}

app.on('ready', createWindow);
