
function halt(e) {
  e.preventDefault();
  e.stopPropagation();
}

function Thumb(el, opts) {
  var self = this;
  var el = el;
  var dad = el.parentNode;
  //var el = document.createElement("div");
  //el.setAttribute("data-el", true);
  //document.body.appendChild(el);

  var pos   = {x: 0, y: 0};
  var size  = {w: 0, h: 0};

  var mdown = {x: 0, y: 0};
  var ppos  = {x: 0, y: 0};

  var xlimit = dad.offsetWidth;
  var ylimit = dad.offsetHeight;

  self.init = function() {
    self.dragging = false;
    el.addEventListener("mousedown", down);
    dad.addEventListener("mousedown", snapdown);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", end);

    if (opts.wraparound) {
    	self.pos = wrappos;
    }
    else if (opts.overflow) {
    	self.pos = overpos;
    }
    else {
    	self.pos = contrainpos;
    }

  }


  function contrainpos(x, y) {
    pos.x = opts.scrollx ? Math.min(Math.max(parseInt(x), 0), xlimit) : 0;
    pos.y = opts.scrolly ? Math.min(Math.max(parseInt(y), 0), ylimit) : 0;
    el.style.webkitTransform = "translate3d("+pos.x+"px,"+pos.y+"px,0)";

    signal();
  }

  function wrappos(x, y) {
    pos.x = opts.scrollx ? x % xlimit : 0;
    pos.y = opts.scrolly ? y % ylimit : 0;
    el.style.webkitTransform = "translate3d("+pos.x+"px,"+pos.y+"px,0)";

    signal();
  }

  function overpos(x, y) {
    pos.x = opts.scrollx ? x : 0;
    pos.y = opts.scrolly ? y : 0;
    el.style.webkitTransform = "translate3d("+(x % xlimit)+"px,"+(y % ylimit)+"px,0)";

    signal();
  }



  self.drag = function(x, y) {
    self.pos(
      ppos.x + x - mdown.x, 
      ppos.y + y - mdown.y
    );
  }

  self.setPos = function(percent) {
  	self.pos(
  		pos.x,
  		percent * ylimit
  	)
  }

  self.setAllPos = function(percentX, percentY) {
    self.pos(
      percentX * xlimit,
      percentY * ylimit
    )
  }


  var snapdown = function(e) {
    halt(e);
    self.pos(e.clientX - dad.offsetLeft - 50, e.clientY - dad.offsetTop - 50);
    down(e);
  }


  var down = function(e) {
    halt(e);
    self.dragging = true;
    mdown = {x: e.clientX, y: e.clientY};
    ppos.x = pos.x;
    ppos.y = pos.y;
  }

  var move = function(e) {
    if (self.dragging) {
      halt(e);
      self.drag(e.clientX, e.clientY);
    }
  }

  var end = function(e) {
    halt(e);
    if (self.dragging) {
      self.dragging = false;
    }
  }

  var signal = function() {
  	 if (opts.cb) {
  	 	opts.cb({
  	 		x: pos.x / xlimit,
  	 		y: pos.y / ylimit
  	 	});
  	 }
  }

  self.init();
}

function Wheel(container) {
	var self = this;
  var el = document.createElement("div");
  el.className = "c-looper";
  el.style.width      = container.offsetWidth  + "px";
  el.style.height     = container.offsetHeight + "px";
  el.style.background = rainbowGradV;

  container.appendChild(el);


  self.change = function(){console.log("hi")};
  self.onChange = function(cb) {
  	self.change = cb;
  }

  self.setHue = function(hue){
  	var amount = (hue / 360) - 0.5;
  	looper.setPos(amount);
  }

  function update(data) {
  	var hue = (data.y + 0.5) * 360; // from center
  	self.change(hue);
  }

  var looper = new Thumb(el, {
		scrollx: false,
		scrolly: true,
		wraparound: true,
		cb: update
	});
}


function DetailWheel(container, diff) {
	var self = this;
  var el = document.createElement("div");
  el.className = "c-looper";
  el.style.width      = container.offsetWidth  + "px";
  el.style.height     = container.offsetHeight + "px";

  container.appendChild(el);

  self.change = function(){console.log("hi")};
  self.onChange = function(cb) {
  	self.change = cb;
  }

  var last = 0;
  function update(data) {
  	var delta = data.y - last; // from center
  	self.change(delta);
  	last = data.y;
  }

  self.setHue = function(h) {
  	last = 0;
  	container.style.background = detailGradient(h, diff);
  }

  var looper = new Thumb(el, {
		scrollx: false,
		scrolly: true,
		overflow: true,
		cb: update
	});
}

function OpacSlider(container) {
	var self = this;
  var el = document.createElement("div");
  el.className = "c-thumb";

  container.appendChild(el);

  self.change = function(){console.log("hi")};
  self.onChange = function(cb) {
  	self.change = cb;
  }

  function update(opac) {
  	self.change(opac);
  }

  self.setColor = function(rgb) {
  	container.style.background = opacGradV(rgb);
  }

  var looper = new Thumb(el, {
		scrollx: false,
		scrolly: true,
		cb: update
	});
}


function Grid(el) {
	var self = this;
	
	var thumb = new Thumb(el.querySelector(".c-thumb"), {
		scrollx: true,
		scrolly: true,
		cb: update
	});

  self.change = function(){console.log("hi")};
  self.onChange = function(cb) {
  	self.change = cb;
  }

  // http://stackoverflow.com/questions/3423214/convert-hsb-color-to-hsl
  function update(data) {
  	self.change({
  		light: data.x,
  		sat: data.y
  	});
  }

  self.setPos = function(x, y){
    thumb.setPos(x, y);
  }

	self.setHue = function(h) {
		el.style.background = gridGradient(h);
	}
}

function Picker(el) {


  var bgel = el.querySelector(".c-bg");
  var previewel = el.querySelector(".c-preview");

	var hue   = 30;
	var sat   = 0.5;
	var black = 0.5;
  var alpha = 1;

  function update() {

    var c = hsvToRgb(hue/360, black, sat);
    opacSlider.setColor(c);
    previewel.style.background = "rgba(" + c.r + "," + c.g + "," + c.b + "," + alpha +")";
    gridThumb.style.background = "rgb(" + c.r + "," + c.g + "," + c.b + ")";
    opacThumb.style.borderColor = "rgba(" + c.r + "," + c.g + "," + c.b + "," + (alpha+0.4) +")";
  }

	var diff = 30;

	var valGrid = new Grid(el.querySelector(".c-grid"));
	var spectrumWheel = new Wheel(el.querySelector(".c-spectrum"));
	var detailWheel = new DetailWheel(el.querySelector(".c-precise"), diff);
	var opacSlider = new OpacSlider(el.querySelector(".c-alpha"));

  var gridThumb = el.querySelector(".c-grid .c-thumb");
  var opacThumb = el.querySelector(".c-opacity .c-thumb");

  valGrid.setHue(hue);
  valGrid.setPos(sat, black);
  spectrumWheel.setHue(hue);
  detailWheel.setHue(hue);

	spectrumWheel.onChange(function(h){
		hue = h;
    
    valGrid.setHue(hue);
    detailWheel.setHue(hue);

		update();
	});

  opacSlider.onChange(function(o){
    alpha = 1 - o.y;
    update();
  });

	detailWheel.onChange(function(delta){
		hue += delta * diff;

    valGrid.setHue(hue);
    spectrumWheel.setHue(hue);

    update();
	});

	valGrid.onChange(function(val){
    black = val.light;
    sat   = 1-val.sat;
    update();
	});
}

// ---------------

var blackGradV = "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)";
var rainbowGradV = "linear-gradient(to top, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)";

function gridGradient(hue) {
	return blackGradV + ", " + hueGradH(hue) + ", white";
}

function hueGradH(hue) {
	var start = "hsla(" + hue + ", 100%, 50%, 0)";
	var end = "hsla(" + hue + ", 100%, 50%, 1)";
	return "linear-gradient(to right, " + start + " 0%, " + end + " 100%)";
}

function opacGradV(rgb) {
	var start = "rgba(" + rgb.r + ", " + rgb.g +", " + rgb.b + ", 0)";
	var end =   "rgba(" + rgb.r + ", " + rgb.g +", " + rgb.b + ", 1)";
	return "linear-gradient(to top, " + start + " 0%, " + end + " 100%)";
}

function detailGradient(hue, diff) {
	var start = "hsla(" + (hue - diff) + ", 100%, 50%, 1)";
	var mid = "hsla(" + hue + ", 100%, 50%, 1)";
	var end = "hsla(" + (hue + diff) + ", 100%, 50%, 1)";
	return "linear-gradient(to top, " + start + " 0%, " + mid + " 50%, " + end + " 100%)";
}


// ---------------

var picker = new Picker(document.querySelector(".c-picker"));

function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    // return [r * 255, g * 255, b * 255];
    return {
      r: parseInt(r * 255),
      g: parseInt(g * 255),
      b: parseInt(b * 255)
    };

}

function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

