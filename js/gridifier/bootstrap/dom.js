var Dom = {
    //_hasOwnPropFn: null,
    //_hasTransitions: null,

    init: function() {
        this._createTrimFunction();
        this._createHasOwnPropFn();
        this._checkIfHasTransitions(Dom.div());
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

    _checkIfHasTransitions: function(testerEl) {
        var names = [
            'WebkitTransition', 'MozTransition',
            'OTransition', 'msTransition', 'MsTransition', 'transition'
        ];

        this._hasTransitions = false;
        for(var i = 0; i < names.length; i++) {
            if(testerEl.style[names[i]] !== undefined)
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

    int: function(val) {
        return parseInt(val, 10);
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

    isArray: function(val) {
        return Object.prototype.toString.call(val) == "[object Array]";
    },

    isObj: function(o) {
        return typeof o == "object" && o !== null;
    },

    isChildOf: function(child, container) {
        if(child == container)
            return false;

        var currentParent = child.parentNode;
        while(currentParent != undefined) {
            if(currentParent == container)
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

    hasVal: function(obj, val) {
        for(var prop in obj) {
            if(obj[prop] == val)
                return true;
        }

        return false;
    },

    hasOwnProp: function(item, prop) {
        return this._hasOwnPropFn(item, prop);
    },

    hasAnyProp: function(item, props) {
        for(var i = 0; i < props.length; i++) {
            if(this._hasOwnPropFn(item, props[i]))
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

        isAndroidUC: function() {
            if(!this.isAndroid())
                return false;

            return /UCBrowser/i.test(this._navigator);
        }
    },

    css: {
        set: function(item, params) {
            if(!Dom.isNative(item))
                err("Error: not DOM.");

            for(var prop in params) 
                item.style[prop] = params[prop];
        },

        set4: function(item, prop, val) {
            var sides = ["Left", "Right", "Top", "Bottom"];
            for(var i = 0; i < sides.length; i++)
                item.style[prop + sides[i]] = (Dom.isObj(val)) ? val[prop + sides[i]] : val;
        },

        hasClass: function(item, classToFind) {
            var classes = item.getAttribute("class");
            if(classes == null || classes.length == 0)
                return false;

            classes = classes.split(" ");

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

        removeClass: function(item, classToRm) {
            var classes = item.getAttribute("class").split(" ");
            var newClass = "";

            for(var i = 0; i < classes.length; i++) {
                if(classes[i].gridifierTrim() != classToRm)
                    newClass += classes[i] + " ";
            }
            newClass = newClass.substring(0, newClass.length - 1);

            Dom.set(item, "class", newClass);
        }
    },

    css3: {
        //_transitionProps: ["transition"],
        //_transformProps: ["transform"],
        _opacityProps: ["opacity"],
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
                this._opacityProps.push(prefix + "Opacity");
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
            var currentTr = item.style[Prefixer.get("transition", item)];
            if(currentTr.length == 0) {
                item.style[Prefixer.get("transition", item)] = prop;
                return;
            }

            var encodeCubicBezier = function(tr) {
                return tr.replace(
                    /cubic-bezier\([^\)]+/g,
                    function(match) { return match.replace(/,/g, ";"); }
                );
            };

            var decodeCubicBezier = function(tr) {
                return tr.replace(
                    /cubic-bezier\([^\)]+/g,
                    function(match) { return match.replace(/;/g, ","); }
                );
            }

            var newTr = encodeCubicBezier(prop);
            currentTr = encodeCubicBezier(currentTr);
            var currentTrProps = currentTr.split(",");

            for(var i = 0; i < currentTrProps.length; i++) {
                var currentTrProp = currentTrProps[i].gridifierTrim();
                if(currentTrProp.length == 0)
                    continue;
                
                var currentTrPropParts = currentTrProp.split(" ");
                var currentTrPropName = currentTrPropParts[0];
                
                if(newTr.search(currentTrPropName) === -1)
                    newTr += ", " + currentTrProp;
            }

            item.style[Prefixer.get("transition", item)] = decodeCubicBezier(newTr).gridifierTrim();
        },

        transform: function(item, val) {
            item.style[Prefixer.get("transform", item)] = val;
        },

        transformProperty: function(item, prop, val) {
            var currentTr = item.style[Prefixer.get('transform', item)];
            if(currentTr.length == 0) {
                item.style[Prefixer.get('transform', item)] = prop + "(" + val + ")";
                return;
            }

            var newTr = "";
            var currentTrProps = currentTr.split(/\)/);
            var hasCurrentTrProp = false;
            for(var i = 0; i < currentTrProps.length; i++) {
                var currentTrProp = currentTrProps[i].gridifierTrim();
                if(currentTrProp.length == 0)
                    continue;
                
                if(currentTrProp.search(prop) !== -1) {
                    newTr += " " + prop + "(" + val + ")";
                    hasCurrentTrProp = true;
                }
                else
                    newTr += " " + currentTrProp + ")";
            }

            if(!hasCurrentTrProp)
                newTr += " " + prop + "(" + val + ")";

            item.style[Prefixer.get('transform', item)] = newTr.gridifierTrim();
        },

        style: function(item, props, val) {
            for(var i = 0; i < props.length; i++)
                item.style[props[i]] = val;
        },

        opacity: function(item, val) {
            this.style(item, this._opacityProps, val);
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
            var items = Dom.find.byQuery(rootEl, selector);
            for(var i = 0; i < items.length; i++) {
                var item = items[i];
                item.parentNode.removeChild(item);
            }
        }
    }
}