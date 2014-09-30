/* ==========================================================================
   Helpers.js - JS Shims, helpers

   Consider using one of these libraries to provide support for
   javascript's natives across browsers

   * https://github.com/kriskowal/es5-shim
   * http://lodash.com/
   * http://sugarjs.com/
   ========================================================================== */

/*
   Array Remove
   By John Resig (MIT Licensed)
   http://ejohn.org/blog/javascript-array-remove/
   ========================================================================== */
Array.prototype.remove = Array.prototype.remove || function (from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

/*
   String substitute, ported from MooTools
   Usage: https://gist.github.com/mrmartineau/7926397
   ========================================================================== */
String.prototype.substitute = function (object) {
	return this.replace(/\{(.+?)\}/g, function (match, name) {
		return name in object ? object[name] : match;
	});
};


/*
   Object create patch
   ========================================================================== */
if (!('create' in Object.prototype)) {
	Object.create = (function () {
		function F() { }

		return function (o) {
			if (arguments.length != 1) {
				throw new Error('Object.create implementation only accepts one parameter.');
			}
			F.prototype = o;
			return new F();
		};
	})();
}


/*
   Object comparison is not the same as if you compare primitive types.
   https://gist.github.com/nicbell/6081098
   ========================================================================== */
Object.compare = function (obj1, obj2) {
	for (var p in obj1) {
		if ( obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) {
			return false;
		}

		switch (typeof (obj1[p])) {
			case 'object':
				if (!Object.compare(obj1[p], obj2[p])) {
					return false;
				}
				break;
			case 'function':
				if (typeof (obj2[p]) == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString())) {
					return false;
				}
				break;
			default:
				if (obj1[p] != obj2[p]) {
					return false;
				}
		}
	}

	for (var p in obj2) {
		if (typeof (obj1[p]) == 'undefined') {
			return false;
		}
	}
	return true;
};

/*
    Developed by Robert Nyman, http://www.robertnyman.com
    Code/licensing: http://code.google.com/p/getelementsbyclassname/
*/
var getElementsByClassName = function (className, tag, elm){
    if (document.getElementsByClassName) {
        getElementsByClassName = function (className, tag, elm) {
            elm = elm || document;
            var elements = elm.getElementsByClassName(className),
                nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
                returnElements = [],
                current;
            for(var i=0, il=elements.length; i<il; i+=1){
                current = elements[i];
                if(!nodeName || nodeName.test(current.nodeName)) {
                    returnElements.push(current);
                }
            }
            return returnElements;
        };
    }
    else if (document.evaluate) {
        getElementsByClassName = function (className, tag, elm) {
            tag = tag || "*";
            elm = elm || document;
            var classes = className.split(" "),
                classesToCheck = "",
                xhtmlNamespace = "http://www.w3.org/1999/xhtml",
                namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
                returnElements = [],
                elements,
                node;
            for(var j=0, jl=classes.length; j<jl; j+=1){
                classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
            }
            try {
                elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
            }
            catch (e) {
                elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
            }
            while ((node = elements.iterateNext())) {
                returnElements.push(node);
            }
            return returnElements;
        };
    }
    else {
        getElementsByClassName = function (className, tag, elm) {
            tag = tag || "*";
            elm = elm || document;
            var classes = className.split(" "),
                classesToCheck = [],
                elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
                current,
                returnElements = [],
                match;
            for(var k=0, kl=classes.length; k<kl; k+=1){
                classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
            }
            for(var l=0, ll=elements.length; l<ll; l+=1){
                current = elements[l];
                match = false;
                for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
                    match = classesToCheck[m].test(current.className);
                    if (!match) {
                        break;
                    }
                }
                if (match) {
                    returnElements.push(current);
                }
            }
            return returnElements;
        };
    }
    return getElementsByClassName(className, tag, elm);
};

var hasClass = function (elem, className) {
    return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
}

var addClass = function (elem, className) {
    if (!hasClass(elem, className)) {
        elem.className += ' ' + className;
    }
}

var removeClass = function (elem, className) {
    var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ') + ' ';
    if (hasClass(elem, className)) {
        while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
            newClass = newClass.replace(' ' + className + ' ', ' ');
        }
        elem.className = newClass.replace(/^\s+|\s+$/g, '');
    }
}

