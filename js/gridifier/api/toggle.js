Gridifier.Api.Toggle = function(settings, eventEmitter) {
    var me = this;

    this._settings = null;
    this._eventEmitter = null;

    this._rotateApi = null;

    this._toggleFunction = null;
    this._toggleFunctions = {};

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._eventEmitter = eventEmitter;

        me._rotateApi = new Gridifier.Api.Rotate(
            me._settings, me._eventEmitter
        );

        me._toggleFunctions = {};

        me._addRotateX();
        me._addRotateY();
        me._addScale();
        me._addFade();
        me._addVisibility();
    };

    this._bindEvents = function() {
    };

    this._unbindEvents = function() {
    };

    this.destruct = function() {
        me._unbindEvents();
    };

    this._construct();
    return this;
}

Gridifier.Api.Toggle.prototype.setToggleFunction = function(toggleFunctionName) {
    if(!this._toggleFunctions.hasOwnProperty(toggleFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_TOGGLE_INVALID_PARAM,
            toggleFunctionName
        );
        return;
    }

    this._toggleFunction = this._toggleFunctions[toggleFunctionName];
}

Gridifier.Api.Toggle.prototype.addToggleFunction = function(toggleFunctionName, toggleFunctionData) {
    this._toggleFunctions[toggleFunctionName] = toggleFunctionData;
}

Gridifier.Api.Toggle.prototype.getToggleFunction = function() {
    return this._toggleFunction;
}

Gridifier.Api.Toggle.prototype._addRotateX = function() {
    var me = this;

    this._toggleFunctions.rotateX = {
        "show": function(item, grid) {
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "visible";
                // @todo -> Send event
                return;
            }

            me._rotateApi.show(item, grid);
        },

        "hide": function(item, grid) {
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "hidden";
                // @todo -> Send event
                return;
            }

            me._rotateApi.hide(item, grid);
        }
    };
}

Gridifier.Api.Toggle.prototype._addRotateY = function() {
    var me = this;

    this._toggleFunctions.rotateY = {
        "show": function(item, grid) {
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "visible";
                // @todo -> Send event
                return;
            }

            me._rotateApi.show(item, grid, true);
        },

        "hide": function(item, grid) {
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "hidden";
                // @todo -> Send event
                return;
            }

            me._rotateApi.hide(item, grid, true);
        }
    };
}

Gridifier.Api.Toggle.prototype._addScale = function() {
    var me = this;

    this._toggleFunctions.scale = {
        "show": function(item, grid) {
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "visible";
                // @todo -> Send event
                return;
            }
            
            // @todo -> Adjust timeout, and move to separate const
            // @todo -> Change other transition params to transform
            // @todo -> Apply prefixer to all settings
            //Dom.css3.transitionProperty(item, Prefixer.getForCSS('transform', item) +" 1ms ease");
            //Dom.css3.transitionProperty(item, "none");
            Dom.css3.transition(item, "none");
            
            // @todo -> Make multiple transform. Replace in all other settings
            //          (Rewrite all transitions and transforms in such manners)
            Dom.css3.transformProperty(item, "scale", 0);
            item.style.visibility = "visible"; // Ie11 blinking fix(:))
            setTimeout(function() {
                // @todo -> Use correct vendor.(Refactor SizesTransformer)
                item.style.visibility = "visible";
                // @todo -> Add duration
                Dom.css3.transition(item, Prefixer.getForCSS('transform', item) + " 900ms ease");
                Dom.css3.transformProperty(item, "scale", 1);
                setTimeout(function() {
                    //Dom.css3.transitionProperty(item, "none");
                    me._eventEmitter.emitShowEvent(item);
                }, 1020);
            }, 20); 
        },

        "hide": function(item, itemClone, grid) {
            itemClone.style.visibility = "visible";
            item.style.visibility = "hidden";

            if(!Dom.isBrowserSupportingTransitions()) {
                itemClone.style.visibility = "hidden";
                // @todo -> Send event
                return;
            }

            Dom.css3.transition(itemClone, Prefixer.getForCSS('transform', itemClone) + " 900ms ease");
            //Dom.css3.transition(item, "transform 1000ms ease");
            Dom.css3.transform(itemClone, "scale(0)");
            //Dom.css3.transformProperty(item, "scale", 0);
            setTimeout(function() {
                grid.removeChild(itemClone);
                // @todo -> Emit event
            }, 920);
            // Send event through global Gridifier.Event Object
        }
    };
}

Gridifier.Api.Toggle.prototype._addFade = function() {
    var me = this;

    this._toggleFunctions.fade = {
        "show": function(item) {
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "visible";
                // @todo -> Send event
                return;
            }

            Dom.css3.transition(item, "All 0s ease");
            Dom.css3.opacity(item, "0");
            setTimeout(function() {
                item.style.visibility = "visible";
                Dom.css3.transition(item, "All 1000ms ease");
                Dom.css3.opacity(item, 1);
            }, 20);
        },

        "hide": function(item) {
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "hidden";
                // @todo -> Send event
                return;
            }

            Dom.css3.transition(item, "All 1000ms ease");
            Dom.css3.opacity(item, "0");
            setTimeout(function() {
                item.style.visibility = "hidden";
                Dom.css3.transition(item, "All 0ms ease");
                Dom.css3.opacity(item, 1);
            }, 20);
        }
    };
}

Gridifier.Api.Toggle.prototype._addVisibility = function() {
    this._toggleFunctions.visibility = {
        "show": function(item) {
            item.style.visibility = "visible";
        },

        "hide": function(item) {
            item.style.visibility = "hidden";
        }
    };
}