// DOM abstraction layer
var Dom = {
    hasDOMElemOwnPropertyFunction: null,
    _isBrowserSupportingTransitions: null,

    init: function() {
        this.createTrimFunction();
        this.createHasDOMElemOwnPropertyFunction();
        this._determineIfBrowserIsSupportingTransitions();
        this.browsers.init();
    },

    createTrimFunction: function() {
        if(typeof String.prototype.gridifierTrim !== 'function') {
            String.prototype.gridifierTrim = function() {
                return this.replace(/^\s+|\s+$/g, '');
            }
        }
    },

    // ie11, ff30(Probably some others too) doesn't support
    // Object.prototype.hasOwnProperty.call per DOM Objects
    createHasDOMElemOwnPropertyFunction: function() {
        var testerDiv = document.createElement("div");
        var rootElement = document.body || document.documentElement;
        rootElement.appendChild(testerDiv);

        if(Object.prototype.hasOwnProperty.call(testerDiv, "innerHTML")) {
            this.hasDOMElemOwnPropertyFunction = function(DOMElem, propertyToMatch) {
                return Object.prototype.hasOwnProperty.call(DOMElem, propertyToMatch);
            }
        }
        else {
            this.hasDOMElemOwnPropertyFunction = function(DOMElem, propertyToMatch) {
                for(var property in DOMElem) {
                    if(property == propertyToMatch)
                        return true;
                }
                
                return false;
            }
        }

        rootElement.removeChild(testerDiv);
    },

    _determineIfBrowserIsSupportingTransitions: function() {
        var testerEl = document.createElement("div");

        var transitionEndEventNames = {
            WebkitTransition : 'webkitTransitionEnd',
            MozTransition      : 'transitionend',
            OTransition         : 'oTransitionEnd otransitionend',
            transition            : 'transitionend'
        };

        this._isBrowserSupportingTransitions = false;
        for(var eventName in transitionEndEventNames) {
            if(testerEl.style[eventName] !== undefined)
                this._isBrowserSupportingTransitions = true;
        }
    },

    toInt: function(maybeNotInt) {
        return parseInt(maybeNotInt, 10);
    },

    isJqueryObject: function(maybeJqueryObject) {
        if(typeof jQuery == "undefined")
            return false;

        return maybeJqueryObject && maybeJqueryObject instanceof jQuery;
    },

    isNativeDOMObject: function(maybeDOMObject) {
        if(typeof maybeDOMObject != "undefined" 
            && typeof maybeDOMObject.tagName != "undefined"
            && typeof maybeDOMObject.nodeName != "undefined"
            && typeof maybeDOMObject.ownerDocument != "undefined"
            && typeof maybeDOMObject.removeAttribute != "undefined")
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

    hasAttribute: function(DOMElem, attr) {
        if((DOMElem.getAttribute(attr) === null) || (DOMElem.getAttribute(attr) === ''))
            return false;

        return true;
    },

    isBrowserSupportingTransitions: function() {
        return this._isBrowserSupportingTransitions;
    },

    hasDOMElemOwnProperty: function(DOMElem, propertyToMatch) {
        return this.hasDOMElemOwnPropertyFunction(DOMElem, propertyToMatch);
    },

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
        set: function(DOMElem, params) {
            if(!Dom.isNativeDOMObject(DOMElem))
                throw new Error("Dom abstraction layer error: DOMElem must be a scalar value.");

            for(var propName in params)
                DOMElem.style[propName] = params[propName];
        },

        hasClass: function(DOMElem, classToFind) {
            var classesString = DOMElem.getAttribute("class");
            if(classesString == null || classesString.length == 0)
                return false;

            var classes = classesString.split(" ");

            for(var i = 0; i < classes.length; i++)
            {
                classes[i] = classes[i].gridifierTrim();
                if(classes[i] == classToFind)
                    return true;
            }

            return false;
        },

        addClass: function(DOMElem, classToAdd) {
            var currentClass = DOMElem.getAttribute("class");
            if(currentClass == null || currentClass.length == 0)
                var newClass = classToAdd;
            else
                var newClass = currentClass + " " + classToAdd;

            DOMElem.setAttribute("class", newClass);
        },

        removeClass: function(DOMElem, classToRemove) {
            var classes = DOMElem.getAttribute("class").split(" ");
            var cleanedClass = "";

            for(var i = 0; i < classes.length; i++) {
                if(classes[i].gridifierTrim() != classToRemove)
                    cleanedClass += classes[i] + " ";
            }
            cleanedClass = cleanedClass.substring(0, cleanedClass.length - 1);

            DOMElem.setAttribute("class", cleanedClass);
        }
    },

    css3: {
        prefixedTransitionProps: ["WebkitTransition", "MozTransition", "MsTransition",
                                                 "OTransition", "transition"],
        prefixedTransformProps: ["WebkitTransform", "MozTransform", "OTransform",
                                               "MsTransform", "transform"],
        prefixedPerspectiveProps: ["WebkitPerspective", "perspective", "MozPerspective"],
        prefixedTransformStyleProps: ["transformStyle", "WebkitTransformStyle", "MozTransformStyle"],
        prefixedBackfaceVisibilityProps: ["WebkitBackfaceVisibility", "MozBackfaceVisibility", "backfaceVisibility"],
        prefixedTransformOriginProps: ["webkitTransformOrigin", "mozTransformOrigin", "oTransformOrigin",
                                       "msTransformOrigin", "transformOrigin"],

        transition: function(DOMElem, propertyValue) {
            DOMElem.style[Prefixer.get("transition", DOMElem)] = propertyValue;
        },

        transitionProperty: function(DOMElem, property) {
            var currentTransition = DOMElem.style[Prefixer.get("transition", DOMElem)];
            if(currentTransition.length == 0) {
                DOMElem.style[Prefixer.get("transition", DOMElem)] = property;
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

            var newTransition = encodeCubicBezier(property);
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

            DOMElem.style[Prefixer.get("transition", DOMElem)] = decodeCubicBezier(newTransition).gridifierTrim();
        },

        transform: function(DOMElem, propertyValue) {
            DOMElem.style[Prefixer.get("transform", DOMElem)] = propertyValue;
        },

        transformProperty: function(DOMElem, property, propertyValue) {
            var currentTransform = DOMElem.style[Prefixer.get('transform', DOMElem)];
            if(currentTransform.length == 0) {
                DOMElem.style[Prefixer.get('transform', DOMElem)] = property + "(" + propertyValue + ")";
                return;
            }

            var newTransform = "";
            var currentTransformProps = currentTransform.split(/\)/);
            var hasCurrentTransformProperty = false;
            for(var i = 0; i < currentTransformProps.length; i++) {
                var currentTransformProp = currentTransformProps[i].gridifierTrim();
                if(currentTransformProp.gridifierTrim().length == 0)
                    continue;
                
                if(currentTransformProp.search(property) !== -1) {
                    newTransform += " " + property + "(" + propertyValue + ")";
                    hasCurrentTransformProperty = true;
                }
                else {
                    newTransform += " " + currentTransformProp + ")";
                }
            }

            if(!hasCurrentTransformProperty)
                newTransform += " " + property + "(" + propertyValue + ")";

            DOMElem.style[Prefixer.get('transform', DOMElem)] = newTransform.gridifierTrim();
        },

        opacity: function(DOMElem, opacityValue) {
            var prefixedOpacityProps = ["-webkit-opacity", "-moz-opacity", "opacity"];
            for(var i = 0; i < prefixedOpacityProps.length; i++)
                DOMElem.style[prefixedOpacityProps[i]] = opacityValue;
        },

        perspective: function(DOMElem, propertyValue) {
            for(var i = 0; i < this.prefixedPerspectiveProps.length; i++)
                DOMElem.style[this.prefixedPerspectiveProps[i]] = propertyValue;
        },

        transformStyle: function(DOMElem, propertyValue) {
            for(var i = 0; i < this.prefixedTransformStyleProps.length; i++) 
                DOMElem.style[this.prefixedTransformStyleProps[i]] = propertyValue;
        },

        backfaceVisibility: function(DOMElem, propertyValue) {
            for(var i = 0; i < this.prefixedBackfaceVisibilityProps.length; i++)
                DOMElem.style[this.prefixedBackfaceVisibilityProps[i]] = propertyValue;
        },

        transformOrigin: function(DOMElem, propertyValue) {
            for(var i = 0; i < this.prefixedTransformOriginProps.length; i++) {
                if(typeof DOMElem.style[this.prefixedTransformOriginProps[i]] != "undefined")
                    DOMElem.style[this.prefixedTransformOriginProps[i]] = propertyValue;
            }
        }
    },

    get: {
        byId: function(id) {
            return document.getElementById(id);
        },

        byClass: function(rootEl, className) {
            return rootEl.querySelectorAll("." + className);
        },

        byQuery: function(rootEl, selector) {
            return rootEl.querySelectorAll(selector);
        }
    },

    remove: {
        byQuery: function(rootEl, selector) {
            var domElems = Dom.get.byQuery(rootEl, selector);
            for(var i = 0; i < domElems.length; i++)
            {
                var domElem = domElems[i];
                domElem.parentNode.removeChild(domElem);
            }
        }
    }
}