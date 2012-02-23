# Remote Console Client
# ---------------------
# Starts a console that connects to a running SocketStream server

log = console.log

require('colors')
net = require('net')
url = require('url')
repl = require('repl')


exports.connect = (host, port) ->
  cbStack = []
  
  log "Connecting to SocketStream server at #{host}, port #{port}...".green
  log "Type 'ss' to see the API, Control-C twice to quit".grey

  client = net.connect(port, host)

  client.on 'data', (buf) ->
    response = buf.toString()
    return if response == 'undefined'
    cb = cbStack.pop()
    if cb
      cb response.replace(/\n$/, '')
    else
      log response

  client.on 'end', ->
    log 'Disconnected. The SocketStream server went away'.red
    process.exit(1)

  evalFunc = (code, context, file, cb) ->
    cbStack.push(cb)
    code = code.substring(1, code.length - 2)
    client.write(code)

  repl.start("#{host}:#{port} > ", undefined, evalFunc, false, true)
