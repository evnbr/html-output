var counter = 0;
var mouse = {x: 0, y:0};

// ----------------------------------

// Hello! this is the section
// --------------------------
// where I *explain* what is going on!
// pretty cool, huh.
// 
// Well, I think it is.

function draaw() {
  
  counter++;
  background(176, 187, 176);    
  
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


// (function(mod) { 
//   if (typeof exports == "object" && typeof module == "object") // CommonJS
//     mod(require("../../lib/codemirror"));
//   else if (typeof define == "function" && define.amd) // AMD
//     define(["../../lib/codemirror"], mod);
//   else // Plain browser env
//     mod(CodeMirror);
// })(function(CodeMirror) {
//   "use strict";
//   var GUTTER_ID = "CodeMirror-lint-markers";
//   var SEVERITIES = /^(?:error|warning)$/;

//   function showTooltip(e, content) {
//     var tt = document.createElement("div");
//   }
// });