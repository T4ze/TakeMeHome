var menubar = require('menubar')

var mb = menubar({
    width: 300,
    height: 300,
});

mb.on('ready', function ready () {
});

mb.on('after-create-window', function ready () {
  mb.window.openDevTools();
})
