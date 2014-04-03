var socket = io.connect('/');
var socket_id = parseInt(Math.random() * 10000);

if ( !String.prototype.contains ) {
  String.prototype.contains = function() {
      return String.prototype.indexOf.apply( this, arguments ) !== -1;
  };
}

// var editor = ace.edit("editscript");
// editor.setTheme("ace/theme/dawn");
// editor.getSession().setMode("ace/mode/javascript");
// editor.getSession().setUseSoftTabs(true);
// editor.setShowFoldWidgets(false);
// // editor.setShowInvisibles(true);
// document.getElementById('editscript').style.fontSize='14px';

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
  "style.scss",
  "index.html",
  "script.js",
  "test.txt",
  "test2.txt",
  "test3.txt",
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
  tab_panel.className = escaped + " tab";
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
    // extraKeys: {"Ctrl-Space": "autocomplete"},
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
    keyMap: "sublime",
    theme: "loop-light"
  });

  var timeout;
  editor.on("inputRead", function(cm) {
      if(timeout) clearTimeout(timeout);

      var cursor = cm.getCursor();
      var ltr = cm.getRange({line: cursor.line, ch: cursor.ch - 1}, cursor);

      if (/^[A-Za-z]/.test(ltr)) {
        timeout = setTimeout(function() {
            CodeMirror.showHint(cm, CodeMirror.hint.javascript, {completeSingle: false});
        }, 150);
      }
  });
  editor.on("renderLine", function(cm, line, el) {
    // var nums = el.querySelectorAll(".cm-number");
  });
  editor.on("focus", function(cm) {
    var tabname = cm.display.wrapper.parentNode.getAttribute("data-tabpanel");
    set_tab_by_name(tabname);
  });
  editor.on("change", function(cm, change) {

    var start_line = change.from.line;
    var end_line = change.to.line;


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
        if (type) curr = type.contains("number");
        else curr = false;

        if (curr && !prev) {
          var insert_pos = {line: line_num, ch: ch - 1};
          var sl = get_slider();
          var widg = cm.setBookmark(
            insert_pos,
            {
              widget: sl.el,
              insertLeft: true
            }
          );
          sl.slider.widget = widg;
        }
        prev = curr;
      }
    }
  });

  open(filename, function(data){
    editor.setValue(data);
  });

  var left = index * 600;
  tab_panel.style.webkitTransform = "translate3d(" + left + "px,0,0)";

  nav[filename] = {
    cm: editor,
    left: left,
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
    editor.on("change", function(cm) {
      send_scss(cm.getValue());
    });
  }
  else if (mode == "javascript") {
    editor.on("change", function(cm) {
      send_script(cm.getValue(), "http://localhost:3000/sketch/script.js");
    });
  }


  return editor;

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

// C O L O R S   ( H U S L p )


var css = "";
for (var i = 0; i < 100; i++) {
  var col = $.husl.p.toHex(((i / 40) * 360), 80, 55);
  var className = ".cm-s-loop-light .cm-color-" + i;
  css += className + " { color: " + col + "}\n"; 
}

for (var i = 0; i < 100; i++) {
  var col = $.husl.p.toHex(((i / 40) * 360), 50, 50);
  var className = ".cm-s-loop-dark .cm-color-" + i;
  css += className + " { color: " + col + "}\n"; 
}
add_style_sheet(css);



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

  // console.log(tabs_width + 500);
  // console.log(body_width + 500);
  // console.log(newleft);

  // if (newleft > body_width + 500) {
  //   newleft = body_width + 500;
  // }

  var i = 0;
  for (tabname in nav) {
    var t = nav[tabname];
    t.left = t.left - newleft + 20;
    t.panel.style.webkitTransform = "translate3d(" + t.left + "px,0,0)";
    // t.panel.style.webkitTransitionDelay = 30*i + "ms";
    i++;
  }

  document.getElementById("save_status").innerText = curr_tab.save_state;
}

set_tab(document.querySelectorAll("[data-tab]")[0]);


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
    "css": $edit.innerText,
    "ID": socket_id
  });
}

function send_css(css) {
  socket.emit('message', {
    "css": css,
    "ID": socket_id
  });
}

function send_scss(scss) {
  socket.emit('message', {
    "scss": scss,
    "ID": socket_id
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


// ================


function Slider(el) {
  var self = this;
  var $el = $(el);

  $el.attr("tabindex", 0);
  $el.html('<div class="slider-rail"></div><div class="slider-thumb"></div>');

  var $rail = $el.find(".slider-rail");
  var $thumb = $el.find(".slider-thumb");
  var $val = $el.next();
  var dragging = false;
  var start = {x:0, y:0};
  var delt = {x:0, y:0};
  var val = 0;
  var ext = "";
  var strtval = 0;
  var step = 1;
  var curr_text = "";
  var strt_text = "";
  var pos;

  // $el.attr("contenteditable", false);
  // $rail.attr("contenteditable", false);
  // $thumb.attr("contenteditable", false);


  $thumb.mousedown(function(e){

    dragging = true;
    $val = $el.parent().next();
    $el.addClass("dragging");
    $("body").addClass("dragging");
    start.x = e.clientX;
    start.y = e.clientY;
    delt.x = 0;
    delt.y = 0;
    strt_text = $val.html();
    val = parseFloat(strt_text);
    ext = strt_text.replace(/([-0-9.]*)/ , "");
    strtval = val;

    if (ext == "em") step = 0.05;
    else if (ext == "" && val < 3) step = 0.1; 
    else step = 1;

    curr_text = strt_text;
    pos = self.widget.find();
  });

  $("html").mousemove(function(e){
    if (dragging) {

      delt.x = e.clientX - start.x;
      delt.y = e.clientY - start.y;

      val = Math.round((strtval - parseInt(delt.y * 0.3) * step) * 100) / 100;


      curr_tab.cm.replaceRange(
        (val + ext),
        pos,
        {
          line: pos.line,
          ch: (pos.ch + curr_text.length)
        }
      );
      curr_text = val + ext;

      $rail.css({
        "-webkit-transform": "translate3d(0, " + delt.y + "px, 0)"
      });
    }
  });
  $("html").mouseup(function(){
    dragging = false;
    $(".dragging").removeClass("dragging");
    $rail.css({
      "-webkit-transform": ""
    });
  });

  $el.keydown(function(e){
    // UP KEY
    if (e.keyCode == 38) {
      e.preventDefault();
      val += step;
      $val.html(val);
      send();
    }
    // DOWN KEY
    else if (e.keyCode == 40) {
      e.preventDefault();
      val -= step;
      $val.html(val);
      send();
    }

  });
}


// ==========


function get_slider() {
  var val = 0;
  var el = document.createElement('span');
  el.className = 'slider';
  var slider = new Slider(el);
  return {slider: slider, el: el};
}


// =============


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

          // SPLIT
          for (var i = 0; i < lines.length; i++) {
            // var words = lines[i].split(" ");
            if (lines[i].indexOf("{") !== -1 ) {
              var parts = lines[i].split("{");
              lines[i] = [
                {
                  sel: true,
                  str: parts[0]
                },
                {
                  str: "{"
                },
                {
                  str: parts[1]
                }
              ];
            }
            else {
              var parts = lines[i].split(" ");
              var arr = [];
              for (var j = 0; j < parts.length; j++) {
                var is_number = false;
                // if (/([0-9]+([a-z]{2}|%))/.test(parts[j])) {
                if (/([0-9]+)/.test(parts[j])) {
                  is_number = true;
                }
                arr.push({
                  numerical: is_number,
                  str: parts[j]
                });
                arr.push({
                  str: " "
                });
              }
              lines[i] = arr;
            }

          }

          // RECOMBINE
          for (var i = 0; i < lines.length; i++) {
            var words = lines[i];

            for (var j = 0; j < words.length; j++) {
              if (words[j].sel) {
                var sel = words[j].str.trim();
                sel = sel.replace(/(\s|^)([\*a-zA-Z]+[1-7]{0,1})/g, function(match, grp){
                  return '<span class="sel-name">' + match + '</span>';
                });
                sel = sel.replace(/#([a-zA-Z]*)/, function(match, grp){
                  return '<span class="sel-id">' + match + '</span>';
                });
                sel = sel.replace(/(\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g, function(match, grp){
                  return '<span class="sel-class">' + match + '</span>';
                });
                words[j].str = words[j].str.replace(words[j].str.trim(), '<span data-selector>' + sel + '</span>');
              }

              else if (words[j].numerical) {
                var str = words[j].str.trim();
                var val = parseFloat(str);
                var min, max, step, unit;
                if (str.indexOf("em") !== -1) {
                  min = -2;
                  max = 10;
                  step = 0.1;
                  unit = "em";
                }
                else if (str.indexOf("px") !== -1) {
                  min = -20;
                  max = 200;
                  step = 1;
                  unit = "px";
                }
                else if (str.indexOf("vw") !== -1) {
                  min = -10;
                  max = 100;
                  step = 1;
                  unit = "vw";
                }
                else if (str.indexOf("%") !== -1) {
                  min = -10;
                  max = 200;
                  step = 1;
                  unit = "%";
                }

                // var input = '<input type="range" value="' + val + '" min="' + min + '" max="' + max + '" step="' + step + '"/> <span class="rangeDat">' + val + '</span>';


                var input = '<span class="slider"></span><span class="slider-val">' + val + '</span>';



                words[j].str = words[j].str.replace(val, input );
              }
              else if (words[j].str == "black;") {
                words[j].str = '<input class="color" type="text" value="#000">;';
              }
              else if (words[j].str == "white;") {
                words[j].str = '<input class="color" type="text" value="#fff">;';
              }
              else if (words[j].str == "blue;") {
                words[j].str = '<input class="color" type="text" value="#00f">;';
              }
              // else if (words[j].str == "2em;") {
              //   words[j].str = '<input type="range" value="2" min="0" max="30" step="0.1"/> <span class="rangeafter">2</span>em;';
              // }
              // else if (words[j].str == "28px/1.25") {
              //   words[j].str = '<input type="range" value="28" min="0" max="50" step="1"/> <span class="rangeafter">28</span>px/1.25';
              // }
            }
            lines[i] = words.reduce(function(prev, curr, i, arr){
              return prev + curr.str;
            }, "");
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
          $(".color").each(function(){
            this.parentNode.querySelector(".minicolors-swatch-color").innerText = this.value;
          });



          // $("input[type=range]").on("mousemove change", function(e){
          //   $(this).next().html( $(this).val() );
          //     send();
          // });


          var sliders = document.querySelectorAll(".slider");
          for (var i = 0; i < sliders.length; i++) {
            new Slider(sliders[i]);
          }


          $("[data-selector]").hover(function(e){
            var s = this.innerText;
            send_highlight(s);
          }, function(e){
            var s = this.innerText;
            clear_highlight(s);
          });

      }
  }

  xmlhttp.open("GET", "../sketch/style.css", true);
  xmlhttp.send();
}



// ==============================

// D O M  U T I L I T I E S


function add_style_sheet(css) {
  var head, styleElement;
  head = document.getElementsByTagName('head')[0];
  styleElement = document.createElement('style');
  styleElement.setAttribute('type', 'text/css');
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    styleElement.appendChild(document.createTextNode(css));
  }
  head.appendChild(styleElement);
  return styleElement;
}

function get_mode_from_extension(ext) {
  if (ext == "html") return "text/html";
  else if (ext == "css") return ext;
  else if (ext == "scss") return "text/x-scss";
  else if (ext == "js") return "javascript";
}

