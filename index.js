var menubar = require('menubar')

if (!process.env.NAVITIA_TOKEN) {
  console.log("/!\\ Warning : Please set the navitia token");
  process.exit(1);
}


var mb = menubar({
    width: 300,
    height: 300,
});

mb.on('ready', function ready () {
});

mb.on('after-create-window', function ready () {
  mb.window.openDevTools();
})
