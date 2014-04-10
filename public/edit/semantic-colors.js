// ========================

// C O L O R S   ( H U S L p )


var css = "";
for (var i = 0; i < 100; i++) {
  var col = $.husl.p.toHex(((i / 40) * 360), 100, 55);
  var className = ".cm-s-loop-light .cm-semantic-" + i;
  css += className + " { color: " + col + "}\n"; 
}

for (var i = 0; i < 100; i++) {
  var col = $.husl.p.toHex(((i / 40) * 360), 50, 50);
  var className = ".cm-s-loop-dark .cm-semantic-" + i;
  css += className + " { color: " + col + "}\n"; 
}
add_style_sheet(css);


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
