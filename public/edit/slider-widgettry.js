// ================

var mousedowns = 0;

function Slider(el, txt, begin, end) {
  // console.log("built slider");
  var self = this;
  var $el = $(el);

  var $thumb = $el.find(".slider-thumb");
  $thumb.attr("tabindex", "0");
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

  self.setWidget = function(widget) {
    self.widget = widget;
  }


  $el.mousedown(function(e){

    dragging = true;
    $val = $el.parent().next();
    $el.addClass("dragging");
    $("body").addClass("dragging");
    start.x = e.clientX;
    start.y = e.clientY;
    delt.x = 0;
    delt.y = 0;
    strt_text = txt;
    val = parseFloat(strt_text);
    ext = strt_text.replace(/([-0-9.]*)/ , "");
    strtval = val;

    if (ext == "em") step = 0.05;
    else if (ext == "" && val < 3) step = 0.1; 
    else step = 1;

    curr_text = txt;
    // pos = self.widget.find();
    pos = begin;

    var offset = $thumb.offset();
    // $rail = $("<div class='slider-thumb'></div>");
    // $("body").append($rail);
    // $rail.css({
    //   "position": "fixed",
    //   // "padding": "20px",
    //   "z-index": 999,
    //   "top": offset.top,
    //   "left": offset.left,
    // });

    // $rail.css("background", "rgb(" + parseInt(Math.random()*255) + ",255,0)");

  });

  $("html").mousemove(function(e){
    if (dragging) {

      delt.x = e.clientX - start.x;
      delt.y = e.clientY - start.y;

      val = Math.round((strtval - parseInt(-delt.x * 0.3) * step) * 100) / 100;

      $el.find(".cm-number").text(val + ext);

      var endpos =  {
          line: pos.line,
          ch: (pos.ch + curr_text.length)
        };

      console.log(pos);
      console.log(endpos);
      curr_tab.cm.replaceRange(
        (val + ext),
        pos,
        endpos
      );
      curr_text = val + ext;

      // $rail.css({
      //   "-webkit-transform": "translate3d(0, " + delt.y + "px, 0)",
      //   // "height": delt.y
      // });
    }
  });
  $("html").mouseup(function(){
    dragging = false;
    $(".dragging").removeClass("dragging");
    // $rail.remove();
    // $rail.css({
    //   "-webkit-transform": ""
    // });
  });

  $el.keydown(function(e){
    // UP KEY
    if (e.keyCode == 38) {
      e.preventDefault();
      val = Math.round((val + step) * 100) / 100;
      curr_tab.cm.replaceRange(
        (val + ext),
        pos,
        {
          line: pos.line,
          ch: (pos.ch + curr_text.length)
        }
      );
    }
    // DOWN KEY
    else if (e.keyCode == 40) {
      e.preventDefault();
      val = Math.round((val - step) * 100) / 100;
      curr_tab.cm.replaceRange(
        (val + ext),
        pos,
        {
          line: pos.line,
          ch: (pos.ch + curr_text.length)
        }
      );
    }

  });
}



// ==========

function Picker(el) {
  var self = this
    , $el = el;

  $($el).html('<div class="colorpicker-swatch"></div>');
  var $sw = $($el).find(".colorpicker-swatch")[0];


  self.setWidget = function(widget){
    self.widget = widget;

    // Find color value
    setTimeout(function() {
      var next = $($el).parent().next().html();
      $sw.style.backgroundColor = next;
    }, 0);
  }

  $el.addEventListener('mousedown', function(e){
    console.log("color picker clicked");
    pos = self.widget.find();

  });
}






// ==========


function getNumberSlider(txt, start, end) {
  var el = document.createElement('span');
  el.className = 'slider';

  var val = document.createElement('span');
  val.className = "val";
  val.innerText = txt;

  var thumb = document.createElement('span');
  thumb.className = "slider-thumb";

  // $el.append('<div class="slider-thumb"></div>');


  el.appendChild(thumb);
  el.appendChild(val);

  var slider = new Slider(el, txt, start, end);
  return el;
}


function getColorPicker(txt) {
  var el = document.createElement('span');
  el.className = 'colorpicker';

  var sw = document.createElement('span');
  sw.className = 'colorpicker-swatch';
  sw.style.backgroundColor = txt;
  el.appendChild(sw);

  return el;
}

function get_img() {
  var el = document.createElement('span');
  el.className = 'imgwidget';
  return {obj: {}, el: el};
}

