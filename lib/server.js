var Session, connect, log, net, repl;

log = console.log;

require('colors');

net = require('net');

repl = require('repl');

connect = require('connect');

Session = connect.session.Session;

exports.init = function(ss) {
  var port;
  port = null;
  ss.api.consoleVersion = '0.1.0';
  ss.events.on('server:start', function(ssInstance) {
    var server;
    if (!port) return false;
    log("i".green, "Console Server running on port " + port);
    server = net.createServer(function(socket) {
      var name, rconsole, responder, sessionID, thisSession, _ref;
      sessionID = connect.utils.uid(24);
      thisSession = new Session({
        sessionID: sessionID,
        sessionStore: ssInstance.sessionStore
      });
      thisSession.cookie = {
        maxAge: null
      };
      thisSession.save();
      socket.on('end', function() {
        return log("←".green, ("Remote console client has disconnected - Session ID " + sessionID).grey);
      });
      _ref = ssInstance.responders;
      for (name in _ref) {
        responder = _ref[name];
        if (responder.server.internal) {
          ss.api[name] = function() {
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
                socket.write(("" + (name.toUpperCase()) + " responder replied in " + timeTaken + "ms with:\n").grey);
                return socket.write(JSON.stringify(params));
              }
            };
            return responder.server.internal(args, meta, cb);
          };
        }
      }
      log("→".cyan, ("Remote console client has connected - Session ID " + sessionID).grey);
      rconsole = repl.start('', socket, void 0, true);
      return rconsole.context.ss = ss.api;
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
