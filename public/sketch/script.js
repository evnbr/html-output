
var counter = 0;

var mouse = {x: 0, y:0};

function draaw() {
  
  counter++;
  
  background(176, 187, 176);    
  
  
  for (var i = 0; i < 6; i++) {  
    var add = Math.sin(counter / 35.2) * i * 58;   
    rect(
      112 + i * 20,   
      164 +  i * 21, 
      127 + add, 
      87
    );       
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
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}