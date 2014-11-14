// DOM abstraction layer
var Dom = {
    init: function() {
        this.createTrimFunction();
    },

    createTrimFunction: function() {
        if(typeof String.prototype.trim !== 'function') {
            String.prototype.trim = function() {
                return this.replace(/^\s+|\s+$/g, '');
            }
        }
    },

    toInt: function(maybeNotInt) {
        return parseInt(maybeNotInt, 10);
    },

    // @todo -> Check if this class sees global jQuery object
    // from inside of the module definition(Require.js)
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
        var testerEl = document.createElement("div");

        var transitionEndEventNames = {
          WebkitTransition : 'webkitTransitionEnd',
          MozTransition      : 'transitionend',
          OTransition         : 'oTransitionEnd otransitionend',
          transition            : 'transitionend'
        };

        for(var eventName in transitionEndEventNames) {
            if(testerEl.style[eventName] !== undefined)
                return true;
        }

        return false;
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
            var classes = classesString.split(" ");

            for(var i = 0; i < classes.length; i++)
            {
                classes[i] = classes[i].trim();
                if(classes[i] == classToFind)
                    return true;
            }

            return false;
        },

        addClass: function(DOMElem, classToAdd) {
            var currentClass = DOMElem.getAttribute("class");
            DOMElem.setAttribute("class", currentClass + " " + classToAdd);
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

        transition: function(DOMElem, propertyValue) {
            for(var i = 0; i < this.prefixedTransitionProps.length; i++)
                DOMElem.style[this.prefixedTransitionProps[i]] = propertyValue;
        },

        transform: function(DOMElem, propertyValue) {
            for(var i = 0; i < this.prefixedTransformProps.length; i++)
                DOMElem.style[this.prefixedTransformProps[i]] = propertyValue;
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
Dom.init();