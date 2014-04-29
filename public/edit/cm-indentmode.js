
CodeMirror.defineMode("indent-js", function(config, parserConfig) {
  var indentGuideOverlay = {
    token: function(stream, state) {
      

      // if (stream.sol() && state.freshline) {
      //   state.freshline = false;
      //   var level = stream.indentation();
      //   console.log(level);
      //   // stream.next();
      //   return "line-indent-" + level;
      // }
      // var ch;
      // if (stream.match("{{")) {
      //   while ((ch = stream.next()) != null)
      //     if (ch == "}" && stream.next() == "}") break;
      //   stream.eat("}");
      //   return "mustache";
      // }
      if (stream.sol()) {
        console.log(state)
        var level = stream.indentation();
        stream.next();

        state.wasFreshLine = true;
        state.indentLevel = level;

        return "line-ind-" + level;
      }
      else if (state.wasFreshLine) {
        state.wasFreshLine = false;
        stream.backUp(1);
      }
      while (stream.next() != null) {
      }
      return null;
    },
    blankLine: function(state) {
      console.log("blankline at " + state.indentLevel);
      return "line-wat"; //"line-ind-" + state.indentLevel;
    }
  };

  return CodeMirror.overlayMode(CodeMirror.getMode(config, parserConfig.backdrop || "javascript"), indentGuideOverlay);
});
//var editor = CodeMirror.fromTextArea(document.getElementById("code"), {mode: "mustache"});
