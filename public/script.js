var socket = io.connect('/');
var socket_id = parseInt(Math.random() * 10000);

$edit = document.getElementById("edit");


socket.on('message', function(msg) {
  if (msg.ID !== socket_id) {
    insert_css("test", msg.css);
  }
});


function send() {
  socket.emit('message', {
    "css": $edit.innerText,
    "ID": socket_id
  });
}

if ($edit) {
  $edit.addEventListener("keyup", function(e){
    send();
  }, false);


  // Ajax get
  // -------

  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

          var txt = xmlhttp.responseText;

          var lines = txt.split("\n");

          for (var i = 0; i < lines.length; i++) {
            var words = lines[i].split(" ");
            for (var j = 0; j < words.length; j++) {
              if (words[j] == "black;") {
                words[j] = '<input class="color" type="text" value="#000">;';
              }
              else if (words[j] == "white;") {
                words[j] = '<input class="color" type="text" value="#fff">;';
              }
              else if (words[j] == "2em;") {
                words[j] = '<input type="range" value="2" min="0" max="30" step="0.1"/> <span class="rangeafter">2</span>em;';
              }
              else if (words[j] == "28px/1.25") {
                words[j] = '<input type="range" value="28" min="0" max="50" step="1"/> <span class="rangeafter">28</span>px/1.25';
              }
            }
            lines[i] = words.join(" ");
          }

          var html = lines.join("\n");

          document.getElementById("edit").innerHTML = html;

          $(".color").minicolors({
            opacity: false,
            change: function(hex, opacity) {
              this.parentNode.querySelector(".minicolors-swatch-color").innerText = hex;
              send();
            }
          });

          $("input[type=range]").mousemove(function(e){
            $(this).next().html( $(this).val() );
              send();
          });

      }
  }

  xmlhttp.open("GET", "../sketch/style.css", true);
  xmlhttp.send();
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