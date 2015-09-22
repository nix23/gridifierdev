var Dom = {
    //_hasOwnPropFn: null,
    //_hasTransitions: null,

    init: function() {
        this._createTrimFunction();
        this._createHasOwnPropFn();
        this._checkIfHasTransitions();
        this.browsers.init();
        this.css3.init();
    },

    _createTrimFunction: function() {
        if(typeof String.prototype.gridifierTrim !== 'function') {
            String.prototype.gridifierTrim = function() {
                return this.replace(/^\s+|\s+$/g, '');
            }
        }
    },

    // ie11, ff30(Probably some others too) doesn't support
    // Object.prototype.hasOwnProperty.call per DOM Objects
    _createHasOwnPropFn: function() {
        var testerDiv = Dom.div();
        var rootItem = document.body || document.documentElement;
        rootItem.appendChild(testerDiv);

        if(Object.prototype.hasOwnProperty.call(testerDiv, "innerHTML")) {
            this._hasOwnPropFn = function(item, propToMatch) {
                return Object.prototype.hasOwnProperty.call(item, propToMatch);
            }
        }
        else {
            this._hasOwnPropFn = function(item, propToMatch) {
                for(var prop in item) {
                    if(prop == propToMatch)
                        return true;
                }
                
                return false;
            }
        }

        rootItem.removeChild(testerDiv);
    },

    _checkIfHasTransitions: function() {
        var testerEl = Dom.div();

        var transitionEndEventNames = {
            WebkitTransition : 'webkitTransitionEnd',
            MozTransition    : 'transitionend',
            OTransition      : 'oTransitionEnd otransitionend',
            transition       : 'transitionend'
        };

        this._hasTransitions = false;
        for(var eventName in transitionEndEventNames) {
            if(testerEl.style[eventName] !== undefined)
                this._hasTransitions = true;
        }
    },

    get: function(item, attr) {
       return item.getAttribute(attr);
    },

    set: function(item, attr, val) {
        if(this.isArray(attr)) {
            for(var i = 0; i < attr.length; i++)
                item.setAttribute(attr[i][0], attr[i][1]);
            return;
        }

        item.setAttribute(attr, val);
    },

    rm: function(item, attr) {
        item.removeAttribute(attr);
    },

    rmIfHas: function(item, attr) {
        if(this.isArray(attr)) {
            for(var prop in attr) {
                if(this.has(item, attr[prop]))
                    this.rm(item, attr[prop]);
            }
            return;
        }

        if(this.has(item, attr))
            this.rm(item, attr);
    },

    has: function(item, attr) {
        if((item.getAttribute(attr) === null) || (item.getAttribute(attr) === ''))
            return false;

        return true;
    },

    int: function(maybeNotInt) {
        return parseInt(maybeNotInt, 10);
    },

    isJquery: function(obj) {
        if(typeof jQuery == "undefined")
            return false;

        return obj && obj instanceof jQuery;
    },

    isNative: function(obj) {
        if(typeof obj != "undefined"
            && typeof obj.tagName != "undefined"
            && typeof obj.nodeName != "undefined"
            && typeof obj.ownerDocument != "undefined"
            && typeof obj.removeAttribute != "undefined")
            return true;
        else
            return false;
    },

    isArray: function(maybeArray) {
        return Object.prototype.toString.call(maybeArray) == "[object Array]";
    },

    isChildOf: function(maybeChildElem, containerElem) {
        var currentParent = maybeChildElem.parentNode;
        while(currentParent != undefined) {
            if(currentParent == containerElem)
                return true;

            if(currentParent == document.body)
                break;

            currentParent = currentParent.parentNode;
        }

        return false;
    },

    hasTransitions: function() {
        return this._hasTransitions;
    },

    hasOwnProp: function(item, propToMatch) {
        return this._hasOwnPropFn(item, propToMatch);
    },

    hasAnyProp: function(item, propsToMatch) {
        for(var i = 0; i < propsToMatch.length; i++) {
            if(this._hasOwnPropFn(propsToMatch[i]))
                return true;
        }

        return false;
    },

    toFixed: function(val, precision) {
        return parseFloat(+(Math.round(+(val.toString() + 'e' + precision)).toString() + 'e' + -precision));
    },

    areRoundedOrFlooredEq: function(first, second) {
        return (Math.round(first) == Math.round(second) || Math.floor(first) == Math.floor(second));
    },

    areRoundedOrCeiledEq: function(first, second) {
        return (Math.round(first) == Math.round(second) || Math.ceil(first) == Math.ceil(second));
    },

    filter: function(arr, fn, c) {
        var c = c || window;
        var f = [];

        for(var i = 0; i < arr.length; i++) {
            if(fn.call(c, arr[i]))
                f.push(arr[i]);
        }

        return f;
    },

    show: function(item) { item.style.visibility = "visible"; },
    hide: function(item) { item.style.visibility = "hidden"; },
    div: function() { return document.createElement("div"); },

    browsers: {
        _navigator: null,

        init: function() {
            this._navigator = (typeof navigator != "undefined") ? navigator.userAgent : '';
        },

        isAndroid: function() {
            return /android/i.test(this._navigator);
        },

        isAndroidFirefox: function() {
            if(!this.isAndroid())
                return false;

            return /firefox|iceweasel/i.test(this._navigator);
        },

        isAndroidUCBrowser: function() {
            if(!this.isAndroid())
                return false;

            return /UCBrowser/i.test(this._navigator);
        }
    },

    css: {
        set: function(item, params) {
            if(!Dom.isNative(item))
                err("Error: not DOM.");

            for(var propName in params)
                item.style[propName] = params[propName];
        },

        set4: function(item, prop, val) {
            var sides = ["Left", "Right", "Top", "Bottom"];
            for(var i = 0; i < sides.length; i++)
                item.style[prop + sides[i]] = (Dom.isArray(val)) ? val[prop + sides[i]] : val;
        },

        hasClass: function(item, classToFind) {
            var classesString = item.getAttribute("class");
            if(classesString == null || classesString.length == 0)
                return false;

            var classes = classesString.split(" ");

            for(var i = 0; i < classes.length; i++) {
                classes[i] = classes[i].gridifierTrim();
                if(classes[i] == classToFind)
                    return true;
            }

            return false;
        },

        addClass: function(item, classToAdd) {
            var currentClass = item.getAttribute("class");
            if(currentClass == null || currentClass.length == 0)
                var newClass = classToAdd;
            else
                var newClass = currentClass + " " + classToAdd;

            Dom.set(item, "class", newClass);
        },

        removeClass: function(item, classToRemove) {
            var classes = item.getAttribute("class").split(" ");
            var cleanedClass = "";

            for(var i = 0; i < classes.length; i++) {
                if(classes[i].gridifierTrim() != classToRemove)
                    cleanedClass += classes[i] + " ";
            }
            cleanedClass = cleanedClass.substring(0, cleanedClass.length - 1);

            Dom.set(item, "class", cleanedClass);
        }
    },

    css3: {
        //_transitionProps: ["transition"],
        //_transformProps: ["transform"],
        _perspectiveProps: ["perspective"],
        _transformStyleProps: ["transformStyle"],
        _backfaceVisibilityProps: ["backfaceVisibility"],
        _transformOriginProps: ["transformOrigin"],

        init: function() {
            var prefixes = [
                //["Webkit", "Moz", "Ms", "O"],
                ["Webkit", "Moz"],
                ["webkit", "moz", "o", "ms"]
            ];

            //for(var i = 0; i < prefixes[0].length; i++) {
            //    var prefix = prefixes[0][i];
            //    this._transitionProps.push(prefix + "Transition");
            //    this._transformProps.push(prefix + "Transform");
            //}

            for(var i = 0; i < prefixes[0].length; i++) {
                var prefix = prefixes[0][i];
                this._perspectiveProps.push(prefix + "Perspective");
                this._transformStyleProps.push(prefix + "TransformStyle");
                this._backfaceVisibilityProps.push(prefix + "BackfaceVisibility");
            }

            for(var i = 0; i < prefixes[1].length; i++) {
                this._transformOriginProps.push(prefixes[1][i] + "TransformOrigin");
            }
        },

        transition: function(item, val) {
            item.style[Prefixer.get("transition", item)] = val;
        },

        transitionProperty: function(item, prop) {
            var currentTransition = item.style[Prefixer.get("transition", item)];
            if(currentTransition.length == 0) {
                item.style[Prefixer.get("transition", item)] = prop;
                return;
            }

            var encodeCubicBezier = function(transition) {
                return transition.replace(
                    /cubic-bezier\([^\)]+/g,
                    function(match) { return match.replace(/,/g, ";"); }
                );
            };

            var decodeCubicBezier = function(transition) {
                return transition.replace(
                    /cubic-bezier\([^\)]+/g,
                    function(match) { return match.replace(/;/g, ","); }
                );
            }

            var newTransition = encodeCubicBezier(prop);
            currentTransition = encodeCubicBezier(currentTransition);
            var currentTransitionProps = currentTransition.split(",");

            for(var i = 0; i < currentTransitionProps.length; i++) {
                var currentTransitionProp = currentTransitionProps[i].gridifierTrim();
                if(currentTransitionProp.length == 0)
                    continue;
                
                var currentTransitionPropParts = currentTransitionProp.split(" ");
                var currentTransitionPropName = currentTransitionPropParts[0];
                
                if(newTransition.search(currentTransitionPropName) === -1) {
                    newTransition += ", " + currentTransitionProp;
                }
            }

            item.style[Prefixer.get("transition", item)] = decodeCubicBezier(newTransition).gridifierTrim();
        },

        transform: function(item, val) {
            item.style[Prefixer.get("transform", item)] = val;
        },

        transformProperty: function(item, prop, val) {
            var currentTransform = item.style[Prefixer.get('transform', item)];
            if(currentTransform.length == 0) {
                item.style[Prefixer.get('transform', item)] = prop + "(" + val + ")";
                return;
            }

            var newTransform = "";
            var currentTransformProps = currentTransform.split(/\)/);
            var hasCurrentTransformProperty = false;
            for(var i = 0; i < currentTransformProps.length; i++) {
                var currentTransformProp = currentTransformProps[i].gridifierTrim();
                if(currentTransformProp.gridifierTrim().length == 0)
                    continue;
                
                if(currentTransformProp.search(prop) !== -1) {
                    newTransform += " " + prop + "(" + val + ")";
                    hasCurrentTransformProperty = true;
                }
                else {
                    newTransform += " " + currentTransformProp + ")";
                }
            }

            if(!hasCurrentTransformProperty)
                newTransform += " " + prop + "(" + val + ")";

            item.style[Prefixer.get('transform', item)] = newTransform.gridifierTrim();
        },

        style: function(item, props, val) {
            for(var i = 0; i < props.length; i++)
                item.style[props[i]] = val;
        },

        opacity: function(item, val) {
            var opacityProps = ["-webkit-opacity", "-moz-opacity", "opacity"];
            this.style(item, opacityProps, val);
        },

        perspective: function(item, val) {
            this.style(item, this._perspectiveProps, val);
        },

        transformStyle: function(item, val) {
            this.style(item, this._transformStyleProps, val);
        },

        backfaceVisibility: function(item, val) {
            this.style(item, this._backfaceVisibilityProps, val);
        },

        transformOrigin: function(item, val) {
            for(var i = 0; i < this._transformOriginProps.length; i++) {
                if(typeof item.style[this._transformOriginProps[i]] != "undefined")
                    item.style[this._transformOriginProps[i]] = val;
            }
        }
    },

    find: {
        byId: function(id) {
            return document.getElementById(id);
        },

        byClass: function(rootEl, className) {
            return rootEl.querySelectorAll("." + className);
        },

        byQuery: function(rootEl, selector) {
            var firstChar = selector.gridifierTrim()[0];
            if(firstChar == ">") {
                var selectorPostfix = selector.substr(2, selector.length - 1);
                var items = rootEl.querySelectorAll(selectorPostfix);
                var directChilds = [];

                for(var i = 0; i < items.length; i++) {
                    if(items[i].parentNode == rootEl)
                        directChilds.push(items[i]);
                }

                return directChilds;
            }

            return rootEl.querySelectorAll(selector);
        }
    },

    remove: {
        byQuery: function(rootEl, selector) {
            var domElems = Dom.find.byQuery(rootEl, selector);
            for(var i = 0; i < domElems.length; i++)
            {
                var domElem = domElems[i];
                domElem.parentNode.removeChild(domElem);
            }
        }
    }
}