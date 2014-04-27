
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
	        	str += (new Array(depth + 1)).join("  ");
	        	str += "'var " + obj.id.name + "' \n";
	        	obj.easy = "'var " + obj.id.name + "' ";
	        	str += (new Array(depth + 1)).join("  ");
	        	str += "---------- \n";
	        	//delete obj.type;
	        	//delete obj.id;
	    	}
	    	else if (obj.type == "MemberExpression" && obj.property) {
	    		var name = "____";
	    		if (obj.object && obj.object.name) {
	    			name = obj.object.name;
	    			// delete obj.object;
	    		}
	        	str += (new Array(depth + 1)).join("  ");
	        	str += "func " + name + "." + obj.property.name + " \n";
	        	obj.easy = "func " + name + "." + obj.property.name;

	        	str += (new Array(depth + 1)).join("  ");
	        	str += "---------- \n";
	        	//delete obj.type;
	        	//delete obj.property;
	        	//delete obj.id;
	    	}
	    	else if (obj.type == "Literal" && obj.value) {
	        	//delete obj.type;
	        	//delete obj.value;
	    	}
	    	else {
	    		//
	    	}
	    }


	    var keys = [];
	    for(var i in obj) {
	    	if(obj.hasOwnProperty(i)){
	    		keys.push(i);
	    		// if (obj[i] && obj.type) {
	    		// 	obj[i].parent = "child of " + obj.type;
	    		// }
	    	}
	    }
	    keys = keys.sort(function(a,b){
	    	if (typeof obj[a] !== "string" && typeof obj[b] !== "string") return a > b;
	    	if (typeof obj[a] !== "string") return 1;
	    	if (typeof obj[b] !== "string") return -1;
	    	else return a > b;
	    });


	    for(var i = 0; i < keys.length; i++) {
	    	var key = keys[i];
	    	var val = obj[key];
	    	if (typeof val == "object") {
	    		str += (new Array(depth + 1)).join("  ");
	    		str += key + ": \n";
	        	traverse(val, searchterm, depth);
	        	stack.pop();
	    	}
	    	else if (val instanceof Array) {
	    		str += (new Array(depth + 1)).join("  ");
	    		str += key + " [ \n";
	        	traverse(val, searchterm, depth);
	        	stack.pop();

	    		str += (new Array(depth + 1)).join("  ");
	    		str += "] \n";
	    	}
	    	else {
				str += (new Array(depth + 1)).join("  ");
				str += key + ": " + val + "\n";
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
	    str += "\n";
	    return null;
	};
	traverse(obj, "enter");
	console.log(str);

	for (var i = 0; i < returnedStacks.length; i++) {
        var top = returnedStacks[i][0];
		if (top.easy) console.log("we are adding data to: " + top.easy);
		else {
			console.log("we are adding data to");
			console.log(top);
		}
		// console.log(returnedStacks[i]);
	}

	stack = [];
	returnedStacks = [];
	traverse(obj, "append");

	for (var i = 0; i < returnedStacks.length; i++) {
        var top = returnedStacks[i][0];
		if (top.easy) console.log("we are appending to " + top.easy);
		else {
			var stck = returnedStacks[i];
        	var appendplace = stck[stck.length-2];
        	var appendplacename = appendplace.object.name;

			console.log("we are appending to " + appendplacename);
		}

		// console.log(returnedStacks[i]);
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
parse(0, "code3");
