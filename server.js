var express = require('express')
  , http = require('http')
  , app = express()
  , socketServer = http.createServer(app)
  , io = require('socket.io').listen(socketServer)
  ;

// function handler (req, res) {
//   var html = '<h1>Socket.IO Server</h1>';
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   res.end(html);
// }


app.use(express.static(__dirname + '/public'));

var server = socketServer.listen(process.env.PORT || 3000, function() {
    console.log('Listening on port %d', server.address().port);
});


io.sockets.on('connection', function (socket) {
  socket.on('message', function(message) {
    io.sockets.emit('message', message);
  });
});
