var socket = io.connect('/');
var socket_id = parseInt(Math.random() * 10000);


socket.on('message', function(msg) {
  if (msg.ID !== socket_id) {
    if (msg.css) {
      insert_css("test", msg.css);
    }
    else if (msg.script) {
      // var node = document.getElementsByTagName("head")[0] || document.body;
      // if (node) {
      //   var script = document.createElement("script");
      //   script.type = "text/javascript";
      //   script.text = msg.script;
      //   node.appendChild(script);
      // }
    }
    else if (msg.highlight) {
      highlight(msg.highlight);
    }
    else if (msg.unhighlight) {
      unhighlight(msg.unhighlight);
    }
  }
});

window.onerror = function(msg, url, line){
  socket.emit('message', {
    error: {
      text: msg,
      line: line
    }
  });
};


function highlight(s) {
  var els = document.querySelectorAll(s);
  console.log(els);
  for (var i = 0; i < els.length; i++) {
    els[i].classList.add("_editor-highlight");
  }
}

function unhighlight(s) {
  var els = document.querySelectorAll(s);
  console.log(els);
  for (var i = 0; i < els.length; i++) {
    els[i].classList.remove("_editor-highlight");
  }
}

var stylenode = document.createElement('style');
stylenode.type = 'text/css';
document.head.appendChild(stylenode);

function insert_css(id, css) {
  // style.id = id;
  // style.className = "animstyle";
  if (stylenode.styleSheet){
    stylenode.styleSheet.cssText = css;
  } else {
    stylenode.innerHTML = "";
    stylenode.appendChild(document.createTextNode(css));
  }
}