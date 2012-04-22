# Console Server
# --------------
# Listen out for incoming remote console connections

require('colors')
net = require('net')
repl = require('repl')

port = null

module.exports = (socketStream) ->

  ss = socketStream.api

  ss.consoleVersion = '0.1.2'

  socketStream.events.on 'server:start', (serverInstance) ->
    return false unless port  
    ss.log("i".green, "Console Server running on port #{port}")

    server = net.createServer (socket) ->

      sessionID = ss.session.create()

      # Handle client disconnections
      socket.on 'end', ->
        ss.log("←".green, "Session ID #{sessionID} - Console client has disconnected".grey)

      # Make all Request Responders with a 'console' interface available over the REPL
      for id, responder of serverInstance.responders
        if responder.interfaces.internal && responder.name
        
          # Add to the ss API
          ss[responder.name] = ->
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
                socket.write("#{responder.name.toUpperCase()} responder replied in #{timeTaken}ms with:\n".grey)
                socket.write(JSON.stringify(params))

            responder.interfaces.internal(args, meta, cb)

      ss.log("→".cyan, "Session ID #{sessionID} - Console client has connected".grey)

      # Start a REPL for this client
      rconsole = repl.start('', socket, undefined, true, true)
      rconsole.context.ss = ss
    
    server.listen(port)

  # Return API
  listen: (p = 5000) ->
    throw new Error('ss-console port number to listen on is not valid') unless Number(p) > 0
    port = p