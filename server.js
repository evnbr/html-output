var express      = require('express')
  , http         = require('http')
  , app          = express()
  , socketServer = http.createServer(app)
  , io           = require('socket.io').listen(socketServer)
  , fs           = require('fs')
  , stylus       = require('stylus')
  , sass         = require('node-sass')
  ;

// function handler (req, res) {
//   var html = '<h1>Socket.IO Server</h1>';
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   res.end(html);
// }


app.use(stylus.middleware({
  src: __dirname + '/resources',
  dest: __dirname + '/public',
  debug: true,
  force: true
}));
app.use(express.static(__dirname + '/public'));
// app.use(express.errorHandler());

var server = socketServer.listen(process.env.PORT || 3000, function() {
    console.log('Listening on port %d', server.address().port);
});


io.sockets.on('connection', function (socket) {
  socket.on('message', function(message) {

    // File saving
    if (message.save && message.file_name) {
      save(message.file_name, message.text, message.ID);
    }

    // File opening
    else if (message.open && message.file_name) {
      open(message.file_name, message.text, message.ID)
    }

    // SCSS conversion
    else if (message.scss) {
      try{
        message.css = sass.renderSync({
          data: message.scss
        });
        io.sockets.emit('message', message);
      } catch(err) {
        console.log(err);
      }
    }

    // STYLUS conversion
    else if (message.styl) {
      try{
        stylus(message.styl)
          .set('filename', '.css')
          .render(function(err, css){
            if (err) throw err;
            message.css = css;
            io.sockets.emit('message', message);
          });     
      } catch(err) {
        console.log(err);
      }
    }

    // Just send message on its way
    else {
      io.sockets.emit('message', message);
    }

  });
});



function save(filename, text, id) {
  fs.writeFile(filename, text, function(err) {
      if (err) {
          console.log(err);
      }
      else {
          console.log("The file was saved!");
        io.sockets.emit('message', {
          confirm_save: true, 
        });
      }
  }); 
}

function open(filename, id) {
  fs.readFile(filename, 'utf8', function (err,data) {
    if (err) {
        console.log(err);
    }
    else {
        io.sockets.emit('message', {
          from_disk: true, 
          file_name: filename,
          content: data
        });
      // console.log(data);
    }
  });
}

