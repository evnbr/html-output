var express = require('express')
  , http = require('http')
  , app = express()
  , socketServer = http.createServer(app)
  , io = require('socket.io').listen(socketServer)
  , fs = require('fs')
  , sass = require('node-sass')
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

  	if (message.save && message.file_name) {

  		console.log("someone is telling me to save " + message.file_name);
  		save(message.file_name, message.text, message.ID);
  	}
  	else if (message.open && message.file_name) {

  		console.log("someone is telling me to open " + message.file_name);
  		open(message.file_name, message.text, message.ID)
  	}
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
  	else {
    	io.sockets.emit('message', message);
	}
  });
});



function save(filename, text, id) {
	fs.writeFile("public/sketch/" + filename, text, function(err) {
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
	fs.readFile('public/sketch/' + filename, 'utf8', function (err,data) {
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

