/*jshint laxcomma: true, laxbreak: true*/ 

var counter = 0;
var mouse = {x: 0, y:0};
 
// ----------------------------------

function draaw() { 
  var message = "hello";
  counter++;
   
  background(143, 187, 176);    

  for (var i = 0; i < 6; i++) {  
    var add = Math.sin(counter / 18.2) * i * 6;      
    rect( 64 + i * 7, 164 +  i * 21,  105 + add, 87 );          
  }
  // console.log(Math.random());   
} 

document.addEventListener("mousemove", function(e) {
  console.log(e.clientX);  
  // mouse.x = e.clientX;
  // mouse.y = e.clientY;
});
 
var clicked = 0;
document.addEventListener("mousedown", function(e) { 
  console.log(clicked++);
}); 

function shuffle(array) { 
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue      = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex]  = temporaryValue;
  }

  return array;
}


(function(mod) { 
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";
  var GUTTER_ID = "CodeMirror-lint-markers";
  var SEVERITIES = /^(?:error|warning)$/;
  
  var document;

  function showTooltip(e, content) {
    var tt = document.createElement("div");
  }
});

// A more explicit example showing off multiple
// animation curves



exampleCurves = [
	"linear",
	"ease-in-out",
	"cubic-bezier(.9,.2,.1,.8)", 
	"spring(20,1,0)",
	"spring(100,5,500)",
	"spring(1000,20,500)"
];


// Loop over all the curves
exampleCurves.map(function(curve, i) {
	
	view = new View({width:180, height:50,  
		x:50, y:50 + (70 * i)}); 
	
	view.html = curve;
	
	view.style = {
		lineHeight: view.height + "px", 
		color:     "#fff",
		fontSize:  "13px",
		textAlign: "center" 
	};
	
	// Create two animations moving from left to right
	animation1 = new Animation({
		view:view,
		properties:{x:300}, 
		curve: curve,
		time: 1000 
	});

	animation2 = animation1.reverse();

	// Make sure they loop
	animation1.on("end", animation2.start);
	animation2.on("end", animation1.start);
	animation1.start();
});