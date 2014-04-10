var socket = io.connect('/');
var socket_id = parseInt(Math.random() * 10000);

if ( !String.prototype.contains ) {
  String.prototype.contains = function() {
      return String.prototype.indexOf.apply( this, arguments ) !== -1;
  };
}

$edit = document.getElementById("edit");
$editscript = document.getElementById("editscript");

var $tab_nav = document.getElementById("tab_nav");
var $tab_content = document.getElementById("tab_content");


// window.onbeforeunload = function() {
//   return "Don't forget to save your changes!";
// }


// ========================

var nav = {};
var curr_tab;

var file_arr = [
  "style.styl",
  "index.html",
  "script.js",
  "style.scss",
];

for (var i = 0; i < file_arr.length; i++) {
  make_tab(i, file_arr[i]);
}



function make_tab(index, filename) {

  var ext = filename.split(".")[1];
  var mode = get_mode_from_extension(ext);
  var escaped = filename.replace(".","_");

  var tab = document.createElement("a");
  tab.setAttribute("href", "#");
  tab.setAttribute("data-tabname", escaped); 
  tab.innerText = filename;

  tab_nav.appendChild(tab);

  var tab_panel = document.createElement("div");
  tab_panel.className = escaped + " cm-mode-" + ext +" tab";
  tab_panel.setAttribute("data-tabpanel", escaped); 
  tab_content.appendChild(tab_panel);


  var editor = CodeMirror(function(elt) {
    tab_panel.appendChild(elt);
  },
  {
    mode: mode,
    tabSize: 2,
    styleActiveLine: true,
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
        save(curr_tab.title, curr_tab.cm.getValue());
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
  else if (ext == "html") hinter = "html";
  else if (ext == "css" || ext=="scss") hinter = "css";

  editor.on("inputRead", function(cm) {
      if(timeout) clearTimeout(timeout);

      var cursor = cm.getCursor();
      var ltr = cm.getRange({line: cursor.line, ch: cursor.ch - 1}, cursor);

      if (/^[A-Za-z]/.test(ltr)) {
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

  open(filename, function(cm, data){
    editor.setValue(data);
    setTimeout(function(cm){widgetize(cm, 0, 25);}, 300);
  });

  // var left = index * 700;
  // tab_panel.style.webkitTransform = "translate3d(" + left + "px,0,0)";

  nav[filename] = {
    cm: editor,
    // left: left,
    panel: tab_panel,
    title: filename,
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
      type = cm.getTokenTypeAt(pos);
      if      (type && type.contains("number")) curr = "number";
      else if (type && type.contains("color"))  curr = "color";
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
        var widg = cm.setBookmark(
          insert_pos,
          {
            widget: w.el,
            insertLeft: true
          }
        );
        w.obj.setWidget(widg);
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
      nav[msg.file_name].cm.setValue(msg.content);
    }
    else if (msg.confirm_save) {
      curr_tab.save_state = "Saved";
      document.getElementById("save_status").innerText = "Saved";
    }
    else if (msg.console) {
      var parsed = JSON.parse(msg.msg)
      var text = parsed.text;
      var cm = nav["script.js"].cm;


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

var tabs = document.querySelectorAll("[data-tabname]");
for (var i = 0; i < tabs.length; i++ ) {
  tabs[i].addEventListener("click",function(e){
    e.preventDefault();
  });
  tabs[i].addEventListener("mousedown", click_tab, false);
}

function click_tab(e) {
  set_tab(this);
}


function set_tab_by_name(name) {
  set_tab(document.querySelector("[data-tabname=" + name + "]"));
}
 
function set_tab(tab_el) {
  var activetab = document.querySelector(".activetab");
  if (activetab) activetab.classList.remove("activetab");
  tab_el.classList.add("activetab");

  var sel =  tab_el.getAttribute("data-tabname");
  var active = document.querySelector(".active");
  if (active) active.classList.remove("active");
  document.querySelector("." + sel).classList.add("active");

  curr_tab = nav[sel.replace("_",".")];
  curr_tab.cm.refresh();

  var newleft = curr_tab.left;
  var tabs_width = 1800;
  var body_width = $("body").width();

  if (newleft > 1) {
    console.log("slid too far");
  }

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

  curr_tab.cm.focus();

  document.getElementById("save_status").innerText = curr_tab.save_state;
}

set_tab(document.querySelectorAll("[data-tabname]")[0]);


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
  console.log("hey");
  if (curr_tab.cm.getOption("theme") !== "loop-dark") {
    curr_tab.cm.setOption("theme", "loop-dark");
  }
  else {
    curr_tab.cm.setOption("theme", "loop-light");
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

function open(filename, callback) {
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

