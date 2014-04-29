
var parseId;

function id(i) { return document.getElementById(i); }


function traverseAndReturn(obj) {
	var str = "";


	var stack = [];
	var returnedStacks = [];

	var state = {};

	var traverse = function(obj, searchterm, depth) {


		stack.push(obj);

	    if (typeof depth == 'number')
	        depth++;
	    else
	        depth = 1;


	    // Clean up extraneous "computed"
	   	if (obj && obj.hasOwnProperty("computed")) {
			delete obj.computed;
		}
	   	if (obj && obj.hasOwnProperty("defaults")) {
			delete obj.defaults;
			delete obj.expression;
			delete obj.generator;
		}

	    // Clean up known types
	    if (obj && obj.type) {
	    	if (obj.type == "VariableDeclarator" && obj.id && obj.id.name) {
	        	obj.easy = "var " + obj.id.name;
	    	}
	    	else if (obj.type == "MemberExpression" && obj.property) {
	    		var name = "____";
	    		if (obj.object && obj.object.name) {
	    			name = obj.object.name;
	    		}
	        	obj.easy = "func " + name + "." + obj.property.name;
	    	}
	    	else if (obj.type == "Literal" && obj.value) {
	    	}
	    	else {
	    		//
	    	}
	    }


	    var keys = [];
	    for(var i in obj) {
	    	if(obj.hasOwnProperty(i)){
	    		keys.push(i);
	    	}
	    }


	    for(var i = 0; i < keys.length; i++) {
	    	var key = keys[i];
	    	var val = obj[key];
	    	if (typeof val == "object") {
	        	traverse(val, searchterm, depth);
	        	stack.pop();
	    	}
	    	else if (val instanceof Array) {
	        	traverse(val, searchterm, depth);
	        	stack.pop();
	    	}
	    	else {
				if (val == searchterm) {
					var newstack = stack.slice(0);
					for (var i = 0; i < newstack.length; i++) {
						if (newstack[i].type && newstack[i].type == "VariableDeclarator") {
							newstack = newstack.slice(i);
						}
						else if (newstack[i].type && newstack[i].type == "ExpressionStatement") {
							newstack = newstack.slice(i);
						}
					}
					returnedStacks.push(newstack);
				}
	    	}
	    }
	    return null;
	};


	stack = [];
	returnedStacks = [];
	traverse(obj, "enter");

	for (var i = 0; i < returnedStacks.length; i++) {


        var top = returnedStacks[i][0];

        // If this stack of code is being stored in
        // a variable, we can just see what its name is.
        // ----
		if (top.easy) {
			console.log("Enter data to: " + top.easy);
		}
		// This stack of code is being applied to a variable
		// which unfortuantely wasn't captured by the stack.
		// So we need to step back one and go down another branch
		// to find the name of the object.
		// ----
		else {
			var stck = returnedStacks[i];
        	var appendplace = stck[stck.length-2];
        	var appendplacename = appendplace.easy;

			console.log("Enter data to: " + appendplacename);
		}
		// console.log(returnedStacks[i]);
	}


	stack = [];
	returnedStacks = [];
	traverse(obj, "append");

	for (var i = 0; i < returnedStacks.length; i++) {

		var stck = returnedStacks[i];
        var top = stck[0];
        var name;
        var val = "(something)";
		if (top.easy) {
			name = top.easy;

        	var appender = stck[stck.length-3];
        	val = appender.arguments[0].value;
		}
		else {
        	var appendplace = stck[stck.length-2];
        	name = appendplace.object.name;

        	var appender = stck[stck.length-3];
        	val = appender.arguments[0].value;


		}
		var str = "Append '" + val + "' to '" + name + "'\n";


		var members = [];
		var values = [];

		for (var j = 0; j < stck.length - 3; j++) {
		// skip extra objects that describe the 'append' call
			if (stck[j].type === "MemberExpression") {
				members.unshift(stck[j].property.name); // reverse array order
			}
			else if (stck[j].type === "CallExpression") {
				var args = stck[j].arguments;
				var parsedargs = [];
				for (var k = 0; k < args.length; k++) {
					var regen = escodegen.generate(args[k]).replace(/\s/g," ");
					// Replace newlines for the sake of logging
					// right now
					parsedargs.push(regen);
				}
				values.unshift(parsedargs);
			}
		}

		for (var j = 0; j < members.length; j++) {
			str += "  " + members[j] + " | " + values[j] + "\n";
		}
		console.log(str);
		console.log(stck);
	}

	return returnedStacks;
}



function parse(delay, idstring) {
    if (parseId) {
        window.clearTimeout(parseId);
    }

    parseId = window.setTimeout(function () {
        var code, options, result, el, str;

        // Special handling for regular expression literal since we need to
        // convert it to a string literal, otherwise it will be decoded
        // as object "{}" and the regular expression would be lost.
        function adjustRegexLiteral(key, value) {
            if (key === 'value' && value instanceof RegExp) {
                value = value.toString();
            }
            return value;
        }

        code = id(idstring).innerText;
        options = {
            attachComment: false, //id('comment').checked,
            range: false, //id('range').checked,
            loc: false, //id('loc').checked,
            tolerant: false //id('tolerant').checked
        };

        try {
            result = esprima.parse(code, options);
            str = JSON.stringify(result, adjustRegexLiteral, 4);
            options.tokens = true;

            console.log(result);
			var returnedStacks = traverseAndReturn(result);

        } catch (e) {
            console.log("Error!");
            console.log(e);
        }

        parseId = undefined;
    }, delay || 811);
}		
parse(0, "code1");
