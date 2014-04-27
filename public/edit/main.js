var socket = io.connect('/');
var socket_id = parseInt(Math.random() * 10000);

if ( !String.prototype.contains ) {
  String.prototype.contains = function() {
      return String.prototype.indexOf.apply( this, arguments ) !== -1;
  };
}

// window.onbeforeunload = function() {
//   return "Don't forget to save your changes!";
// }

// ========================

var nav = {};
var curr_tab;

var file_arr = [
  "/Users/evan/Developer/htmloutput/public/sketch/style.styl",
  "/Users/evan/Developer/htmloutput/public/sketch/index.html",
  "/Users/evan/Developer/htmloutput/public/sketch/script.js",
  "/Users/evan/Developer/htmloutput/public/sketch/style.scss",
];

// var file_arr = [
//   "style.styl",
//   "index.html",
//   "script.js",
//   "style.scss",
// ];


for (var i = 0; i < file_arr.length; i++) {
  open(file_arr[i]);
}


function make_tab(filename, content) {

  var title = filename.replace(/^.*[\\\/]/, '');
  var ext = title.split(".")[1];
  var mode = get_mode_from_extension(ext);

  var tab_flap = document.createElement("a");
  tab_flap.setAttribute("href", "#");
  tab_flap.setAttribute("data-tabname", filename); 
  tab_flap.innerText = title;
  tab_flap.addEventListener("click",function(e){e.preventDefault();});
  tab_flap.addEventListener("mousedown", click_tab, false);


  tab_nav.appendChild(tab_flap);

  var tab_panel = document.createElement("div");
  tab_panel.className = "cm-mode-" + ext +" tab";
  tab_panel.setAttribute("data-tabpanel", filename); 
  tab_content.appendChild(tab_panel);


  var editor = CodeMirror(function(elt) {
    tab_panel.appendChild(elt);
  },
  {
    mode: mode,
    tabSize: 2,
    //styleActiveLine: true,
    lineNumbers: false,
    lineWrapping: true,
    gutters: ["CodeMirror-lint-markers"],
    lint: (mode == "javascript"),
    keyMap: "sublime",
    theme: "loop-light",
    extraKeys: {
      "Tab": function(cm) {
        var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
        cm.replaceSelection(spaces);
      },
      "Cmd-S": function(cm) {
        save(curr_tab.filename, curr_tab.cm.getValue());
      },
      "Cmd-1": function(cm) {
        cm.setBookmark(cm.getCursor(), {
          widget: get_slider()
        });
      }
    },
  });

  var timeout;
  var hinter = "";

  if (ext == "js") hinter = "javascript";
  // else if (ext == "html") hinter = "html";
  else if (ext == "css" || ext=="scss") hinter = "css";

  editor.on("inputRead", function(cm) {
      if(timeout) clearTimeout(timeout);

      var cursor = cm.getCursor();
      var ltr = cm.getRange({line: cursor.line, ch: cursor.ch - 1}, cursor);

      if (hinter && /^[A-Za-z]/.test(ltr)) {
        timeout = setTimeout(function() {
            CodeMirror.showHint(cm, CodeMirror.hint[hinter], {completeSingle: false});
        }, 150);
      }
  });

  editor.on("renderLine", function(cm, line, el) {
    // var nums = el.querySelectorAll(".cm-number");
  });
  editor.on("focus", function(cm) {
    var tabname = cm.display.wrapper.parentNode.getAttribute("data-tabpanel");
    if (curr_tab && cm !== curr_tab.cm) {
      set_tab_by_name(tabname);
    }
  });
  editor.on("change", function(cm, change) {

    widgetize(cm, change.from.line, change.to.line);
  });

  // open(filename, function(cm, data){
  //   editor.setValue(data);
  //   setTimeout(function(cm){widgetize(cm, 0, 25);}, 300);
  // });

  editor.setValue(content);
  setTimeout(function(){
    widgetize(editor, 0, editor.lineCount()-1);
  }, 100);


  // var left = index * 700;
  // tab_panel.style.webkitTransform = "translate3d(" + left + "px,0,0)";

  nav[filename] = {
    cm: editor,
    // left: left,
    flap: tab_flap, 
    panel: tab_panel,
    title: title,
    filename: filename,
    save_state: "Just opened"
  }



  // ========================

  // L I V E  R E L O A D

  if (mode == "css") {
    editor.on("inputRead", function(cm) {
      send_css(cm.getValue());
    });
    editor.on("change", function(cm) {
      send_css(cm.getValue());
    });
  }
  else if (mode == "text/x-scss") {
    if (ext == "scss") {
      editor.on("change", function(cm) {
        send_scss(cm.getValue());
      });
    }
    else if (ext == "styl") {
      editor.on("change", function(cm) {
        send_styl(cm.getValue());
      });
    }
  }
  else if (mode == "javascript") {
    editor.on("change", function(cm) {
      send_script(cm.getValue(), "http://localhost:3000/sketch/script.js");
    });
  }


  return editor;

}





function widgetize(cm, start, end) {
  var start_line = start;
  var end_line = end;


  for (var j = start_line; j <= end_line; j++ ) {
    // Identify line that was changed
    var line_num = j;
    var line = cm.getLineHandle(line_num);
    
    // Find all widget marks on this line and clear them
    var marks = cm.findMarks(
      {line: line_num, ch: 0 },
      {line: line_num, ch: line.text.length }
    );
    for (var i = 0; i < marks.length; i++) {
      marks[i].clear();
    }

    // Scan through this line and insert widget marks
    var prev, curr, pos, type;
    for (var ch = 0; ch < line.text.length; ch++) {
      pos = {line: line_num, ch: ch}
      token = cm.getTokenAt(pos);
      type = token.type;
      if      (type && type.contains("number"))       curr = "number";
      else if (type && type.contains("color"))        curr = "color";
      else if (type && type.contains("attrval-src"))  curr = "src";
      else    curr = false;

      if (curr && (curr !== prev)) {
        var insert_pos = {line: line_num, ch: ch - 1};
        var w;
        if (curr == "number") {
          var w = get_slider();
        }
        else if (curr == "color") {
          var w = get_colorpicker();
        }
        else if (curr == "src") {
          var w = get_img();
        }
        // console.log(w);
        var widg = cm.setBookmark(
          insert_pos,
          {
            widget: w.el,
            insertLeft: true
          }
        );
        if (w.obj.setWidget) w.obj.setWidget(widg);
      }
      prev = curr;
    }
  }
}

// $(window).resize(function(e){
//   editor.refresh();
// });



// ========================

// R E C E I V E   M E S S A G E

socket.on('message', function(msg) {
  if (msg.ID !== socket_id) {
    if (msg.from_disk) {
      // console.log(msg);
      make_tab(msg.file_name, msg.content);
    }
    else if (msg.confirm_save) {
      curr_tab.save_state = "Saved";
      document.getElementById("save_status").innerText = "Saved";
    }
    else if (msg.console) {
      var parsed = JSON.parse(msg.msg)
      var text = parsed.text;
      var cm = nav["script.js"].cm;
      console.log("received message!");

      if (parsed.level == "error") {
        text = text.split(":")[1];
        cm.markText(
          {ch: parsed.column - 1, line: parsed.line-1},
          {ch: parsed.column + 2, line: parsed.line-1},
          {className: "logged-error"}
        );

      }

      var el = document.createElement("div");
      el.className = "console-log-marker console-" + parsed.level;
      el.innerText = text;

      cm.setGutterMarker(
        parsed.line - 1, // zero-indexed
        "CodeMirror-lint-markers",
        el
      );

    }
  }
});

// socket.on('message', function(msg) {
//   if (msg.ID !== socket_id) {
//     if (msg.error) {
//       var parts = msg.error.text.split(":");

//       var txt = '<span class="error-type">' + parts[0] + '</span>' + parts[1];
//       document.querySelector(".error").innerHTML = txt;
//     }
//   }
// });


// ========================

// I N I T I I A L I Z E   T A B S


function click_tab(e) {
  var tab_obj = nav[this.getAttribute("data-tabname")];
  set_tab(tab_obj);
}

 
function set_tab(tab) {
  if (curr_tab) {
    var active_flap = curr_tab.flap;
    var active_panel = curr_tab.panel;
    active_flap.classList.remove("activetab");
    active_panel.classList.remove("active");
  }
  tab.flap.classList.add("activetab");
  tab.panel.classList.add("active");

  curr_tab = tab;
  curr_tab.cm.refresh();
  curr_tab.cm.focus();

  document.getElementById("save_status").innerText = curr_tab.save_state;

  // var newleft = curr_tab.left;
  // var tabs_width = 1800;
  // var body_width = $("body").width();

  // if (newleft > 1) {
  //   console.log("slid too far");
  // }

  // console.log(tabs_width + 500);
  // console.log(body_width + 500);

  // if (newleft > body_width + 500) {
  //   newleft = body_width + 500;
  // }

  // var i = 0;
  // for (tabname in nav) {
  //   var t = nav[tabname];
  //   t.left = t.left - newleft + 0;
  //   var displayleft = t.left;
  //   // if (displayleft < 0) displayleft = 0;
  //   // if (displayleft > body_width) t.panel.style.display = "none";
  //   // else t.panel.style.display = "inline-block";
  //   t.panel.style.webkitTransform = "translate3d(" + displayleft+ "px,0,0)";
  //   // t.panel.style.webkitTransitionDelay = 30*i + "ms";
  //   i++;
  // }

}

// set_tab(document.querySelectorAll("[data-tabname]")[0]);


// ========================

// I N I T I I A L I Z E   A C T I O N S


var actions = document.querySelectorAll("[data-action]");
for (var i = 0; i < actions.length; i++ ) {
  var action = actions[i];
  var attr = action.getAttribute("data-action");

  if (attr == "theme") {
    action.addEventListener("mousedown",function(e){
      toggle_theme();
    }, false);
  }
  else if (attr == "save") {
    action.addEventListener("mousedown",function(e){
      save(curr_tab.title, curr_tab.cm.getValue());
    }, false);
  }
  else if (attr == "reload") {
    action.addEventListener("mousedown",function(e){
      reload_browser();
    }, false);
  }

  action.addEventListener("click",function(e){
    e.preventDefault();
  });
}


// ========================

// T H E M E


function toggle_theme() {
  $("body").toggleClass("dark-theme");

  var newtheme = "loop-light";
  if ($("body").hasClass("dark-theme")) {
    newtheme = "loop-dark";
  }

  for (file in nav) {
    nav[file].cm.setOption("theme", newtheme)
  }
}

// document.getElementById("execute").addEventListener("click", function(e){
//   e.preventDefault();
//   send_script();
// });


// ====================

// S O C K E T   S E N D   E V E N T S

function send() {
  socket.emit('message', {
    css: $edit.innerText,
    ID: socket_id
  });
}

function send_css(css) {
  socket.emit('message', {
    css: css,
    ID: socket_id
  });
}

function send_scss(scss) {
  socket.emit('message', {
    scss: scss,
    ID: socket_id
  });
}

function send_styl(styl) {
  socket.emit('message', {
    styl: styl,
    ID: socket_id
  });
}


function send_script(script, url) {
  socket.emit('message', {
    swapscript: true,
    script: script,
    url: url,
    ID: socket_id
  });
}

function save(filename, txt) {

  reload_browser();
  socket.emit('message', {
    save: true,
    file_name: filename,
    text: txt,
    ID: socket_id
  });
}

function open(filename) {

  socket.emit('message', {
    open: true,
    file_name: filename,
    "ID": socket_id
  });
}

function reload_browser() {
  socket.emit('message', {
    reload: true,
    "ID": socket_id
  });
}


function send_highlight(s) {
  socket.emit('message', {
    "highlight": s,
    "ID": socket_id
  });
}

function clear_highlight(s) {
  socket.emit('message', {
    "unhighlight": s,
    "ID": socket_id
  });
}



// =============


function get_mode_from_extension(ext) {
  if (ext == "html") return "text/html";
  else if (ext == "css") return ext;
  else if (ext == "scss") return "text/x-scss";
  else if (ext == "styl") return "text/x-scss";
  else if (ext == "js") return "javascript";
}

