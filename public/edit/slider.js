// ================


function Slider(el) {
  console.log("built slider");
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

  self.setWidget = function(widget) {
    self.widget = widget;
  }


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

    var offset = $thumb.offset();
    $rail = $("<div class='slider-thumb'></div>");
    $("body").append($rail);
    $rail.css({
      "position": "fixed",
      // "padding": "20px",
      "z-index": 999,
      "top": offset.top,
      "left": offset.left,
    });

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
        "-webkit-transform": "translate3d(0, " + delt.y + "px, 0)",
        // "height": delt.y
      });
    }
  });
  $("html").mouseup(function(){
    dragging = false;
    $(".dragging").removeClass("dragging");
    $rail.remove();
    $rail.css({
      "-webkit-transform": ""
    });
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


function get_slider() {
  var val = 0;
  var el = document.createElement('span');
  el.className = 'slider';
  var slider = new Slider(el);
  return {obj: slider, el: el};
}


function get_colorpicker() {
  var el = document.createElement('span');
  el.className = 'colorpicker';
  var picker = new Picker(el);
  return {obj: picker, el: el};
}
