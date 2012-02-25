# Console (REPL) for SocketStream 0.3 apps

Allows you to connect to a running SocketStream server to call commands such as `ss.rpc()` or `ss.publish.all()` from the terminal. This can be very useful when debugging your app.

The SocketStream console follows the client/server model. This ensures the console client starts instantly and even allows you to run commands against a live production system, should you wish.


### Installation

Add `ss-console` to your package.json then add the following lines to your `app.js` file:

```javascript
var consoleServer = require('ss-console').init(ss);
consoleServer.listen(5000);
```

Change `5000` to another number if you wish to listen on another port.


### Connecting to a server

Install the client globally with:

    $ sudo npm install -g ss-client

Once your server is listening out for incoming console connections, connect to it from the terminal by executing:

    $ ss-client

By default `ss-client` will try to connect to a SocketStream server on localhost, port 5000. To connect to another host and/or port, pass params as so:

    $ ss-client www.mysocketstreamserver.com 8500

Note: A new Session ID will be created for you each time you connect to the console, allowing you to call `ss.rpc()` commands which use the `req.use('session')` middleware.


### Contributing

Please type `make build` to convert `/src` files to `/lib`.