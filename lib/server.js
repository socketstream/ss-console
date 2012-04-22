var net, port, repl;

require('colors');

net = require('net');

repl = require('repl');

port = null;

module.exports = function(socketStream) {
  var ss;
  ss = socketStream.api;
  ss.consoleVersion = '0.1.2';
  socketStream.events.on('server:start', function(serverInstance) {
    var server;
    if (!port) return false;
    ss.log("i".green, "Console Server running on port " + port);
    server = net.createServer(function(socket) {
      var id, rconsole, responder, sessionID, _ref;
      sessionID = ss.session.create();
      socket.on('end', function() {
        return ss.log("←".green, ("Session ID " + sessionID + " - Console client has disconnected").grey);
      });
      _ref = serverInstance.responders;
      for (id in _ref) {
        responder = _ref[id];
        if (responder.interfaces.internal && responder.name) {
          ss[responder.name] = function() {
            var args, cb, meta, start;
            start = Date.now();
            args = Array.prototype.slice.call(arguments);
            meta = {
              sessionId: sessionID,
              transport: 'console'
            };
            cb = function(err, params) {
              var firstLine, lines, msg, timeTaken;
              if (err) {
                if (err.stack) {
                  lines = err.stack.split("\n");
                  firstLine = lines[0].red;
                  msg = [firstLine].concat(lines.slice(1)).join("\n");
                  return socket.write(msg);
                } else {
                  return socket.write(JSON.stringify(err));
                }
              } else {
                timeTaken = Date.now() - start;
                socket.write(("" + (responder.name.toUpperCase()) + " responder replied in " + timeTaken + "ms with:\n").grey);
                return socket.write(JSON.stringify(params));
              }
            };
            return responder.interfaces.internal(args, meta, cb);
          };
        }
      }
      ss.log("→".cyan, ("Session ID " + sessionID + " - Console client has connected").grey);
      rconsole = repl.start('', socket, void 0, true, true);
      return rconsole.context.ss = ss;
    });
    return server.listen(port);
  });
  return {
    listen: function(p) {
      if (p == null) p = 5000;
      if (!(Number(p) > 0)) {
        throw new Error('ss-console port number to listen on is not valid');
      }
      return port = p;
    }
  };
};
