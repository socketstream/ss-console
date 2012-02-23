# Console Server
# --------------
# Listen out for incoming remote console connections

log = console.log

require('colors')
net = require('net')
repl = require('repl')
connect = require('connect')
Session = connect.session.Session

exports.init = (ss) ->

  port = null

  ss.api.consoleVersion = '0.1.0'

  ss.events.on 'server:start', (ssInstance) ->
    return false unless port  
    log("i".green, "Console Server running on port #{port}")

    server = net.createServer (socket) ->

      # Create a unique session for this console client
      sessionID = connect.utils.uid(24)
      thisSession = new Session({sessionID: sessionID, sessionStore: ssInstance.sessionStore})
      thisSession.cookie = {maxAge: null}
      thisSession.save()

      # Handle client disconnections
      socket.on 'end', ->
        log "←".green, "Remote console client has disconnected - Session ID #{sessionID}".grey

      # Make all Request Responders with an 'internal' interface available over the REPL
      for name, responder of ssInstance.responders
        if responder.server.internal
        
          # Add to the ss API
          ss.api[name] = ->
            start = Date.now()
            args = Array.prototype.slice.call(arguments)
            meta = {sessionId: sessionID, transport: 'console'}

            cb = (err, params) ->
              if err
                if err.stack
                  lines = err.stack.split("\n")
                  firstLine = lines[0].red
                  msg = [firstLine].concat(lines.slice(1)).join("\n")
                  socket.write(msg)
                else
                  socket.write(JSON.stringify(err))
              else      
                timeTaken = Date.now() - start
                socket.write("#{name.toUpperCase()} responder replied in #{timeTaken}ms with:\n".grey)
                socket.write(JSON.stringify(params))

            responder.server.internal(args, meta, cb)

      log "→".cyan, "Remote console client has connected - Session ID #{sessionID}".grey

      # Start a REPL for this client
      rconsole = repl.start('', socket, undefined, true)
      rconsole.context.ss = ss.api
    
    server.listen(port)

  # Return API
  listen: (p = 5000) ->
    throw new Error('ss-console port number to listen on is not valid') unless Number(p) > 0
    port = p