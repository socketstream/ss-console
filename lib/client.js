/*
  Remote Console Client
  ---------------------
  Starts a console that connects to a running SocketStream server
*/

require('colors');

var net = require('net'),
    log = console.log,
    controlCcount = 0;

module.exports = function(host, port) {

  log(("Connecting to SocketStream server at " + host + ", port " + port + "...").green);
  log("Type 'ss' to see the API, Control-C twice to quit".grey);
  
  var sock = net.connect(port, host);

  process.stdin.pipe(sock);
  sock.pipe(process.stdout);

  sock.on('connect', function () {
    process.stdin.resume();
    process.stdin.setRawMode(true);
  });

  sock.on('close', function () {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    sock.removeListener('close', done);
    log('Disconnected. The SocketStream server went away'.red);
    process.exit(1);
  });

  process.stdin.on('end', function () {
    sock.destroy();
    process.exit(1);
  });

  process.stdin.on('data', function (key) {
    if (key.length === 1 && key[0] === 3) {
      ++controlCcount;
      if (controlCcount === 2) process.stdin.emit('end');
    } else {
      controlCcount = 0;
    }
  });

};
