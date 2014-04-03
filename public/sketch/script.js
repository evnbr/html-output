
var counter = 0;

var mouse = {x: 0, y:0};

function draaw() {
  
  counter++;
  
  background(176, 220, 176);  
  
  
  for (var i = 0; i < 14; i++) {  
    var add = Math.sin(counter / 57) * i * 15;  
    rect(
      144 + i * 20, 
      86 +  i * 21, 
      100 + add, 
      87
    );       
  }
  
  // console.log(Math.random());
} 

document.addEventListener("mousemove", function(e) {
  //console.log(e.clientX);
  // mouse.x = e.clientX;
  // mouse.y = e.clientY;
});

document.addEventListener("mousedown", function(e) {
  //console.log("click");
}); 

