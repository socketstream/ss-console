var log, net, repl, url;

log = console.log;

require('colors');

net = require('net');

url = require('url');

repl = require('repl');

exports.connect = function(host, port) {
  var cbStack, client, evalFunc;
  cbStack = [];
  log(("Connecting to SocketStream server at " + host + ", port " + port + "...").green);
  log("Type 'ss' to see the API, Control-C twice to quit".grey);
  client = net.connect(port, host);
  client.on('data', function(buf) {
    var cb, response;
    response = buf.toString();
    if (response === 'undefined') return;
    cb = cbStack.pop();
    if (cb) {
      return cb(response.replace(/\n$/, ''));
    } else {
      return log(response);
    }
  });
  client.on('end', function() {
    log('Disconnected. The SocketStream server went away'.red);
    return process.exit(1);
  });
  evalFunc = function(code, context, file, cb) {
    cbStack.push(cb);
    code = code.substring(1, code.length - 2);
    return client.write(code);
  };
  return repl.start("" + host + ":" + port + " > ", void 0, evalFunc, false, true);
};
