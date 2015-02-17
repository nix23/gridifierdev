Gridifier.Settings = function(settings, eventEmitter) {
    var me = this;

    this._settings = null;
    this._eventEmitter = null;

    this._gridType = null;

    // @todo -> Fix this
    this._animationDuration = 900;

    this._prependType = null;
    this._appendType = null;

    this._intersectionStrategy = null;
    this._alignmentType = null;
    
    this._sortDispersionMode = null;
    this._sortDispersionValue = null;

    this._rotateFunction = {
        show: function(item, grid, inverseRotateAxis) {
            var rotateProp = (inverseRotateAxis) ? "rotateY" : "rotateX";
            this.rotate(item, grid, rotateProp, false);
        },

        hide: function(item, grid, inverseRotateAxis) {
            var rotateProp = (inverseRotateAxis) ? "rotateY" : "rotateX";
            this.rotate(item, grid, rotateProp, true);
        },

        rotate: function(item, grid, rotateProp, inverseToggle) {
            if(!inverseToggle) {
                var isShowing = true;
                var isHiding = false;
            }
            else {
                var isShowing = false;
                var isHiding = true;
            }

            var scene = document.createElement("div");
            Dom.css.set(scene, {
                width: SizesResolverManager.outerWidth(item, true) + "px",
                height: SizesResolverManager.outerHeight(item, true) + "px",
                position: "absolute",
                top: SizesResolverManager.positionTop(item) + "px",
                left: SizesResolverManager.positionLeft(item) + "px"
            });
            Dom.css3.perspective(scene, "200px"); 
            grid.appendChild(scene);

            var frames = document.createElement("div");
            Dom.css.set(frames, {
                width: "100%", height: "100%", position: "absolute"
            });
            Dom.css3.transformStyle(frames, "preserve-3d");
            Dom.css3.perspective(frames, "200px");
            scene.appendChild(frames);

            var addSideCss = function(frame) {
                Dom.css.set(frame, {
                    display: "block", 
                    position: "absolute", 
                    width: "100%", 
                    height: "100%"
                });
                Dom.css3.backfaceVisibility(frame, "hidden");
            };

            var frontFrame = document.createElement("div");
            addSideCss(frontFrame);
            Dom.css.set(frontFrame, {zIndex: 2});
            Dom.css3.transition(frontFrame, "All 0ms ease");
            Dom.css3.transform(frontFrame, rotateProp + "(0deg)");

            var backFrame = document.createElement("div");
            addSideCss(backFrame);
            Dom.css3.transition(backFrame, "All 0ms ease"); 
            Dom.css3.transform(backFrame, rotateProp + "(-180deg)");

            frames.appendChild(frontFrame);
            frames.appendChild(backFrame);

            var itemClone = item.cloneNode(true);
            Dom.css.set(itemClone, {
                left: "0px",
                top: "0px",
                visibility: "visible",
                width: SizesResolverManager.outerWidth(item, true) + "px",
                height: SizesResolverManager.outerHeight(item, true) + "px"
            });

            // Dom.css.set(itemClone, {left: "0px", top: "0px"});
            // Dom.css.set(itemClone, {visibility: "visible"});
            if(isShowing) {
                backFrame.appendChild(itemClone);
            }
            else if(isHiding) {
                frontFrame.appendChild(itemClone);
                item.style.visibility = "hidden";
            }

            Dom.css3.transition(frontFrame, "All " + me._animationDuration + "ms ease");
            Dom.css3.transition(backFrame, "All " + me._animationDuration + "ms ease");

            setTimeout(function() {
                Dom.css3.transform(backFrame, rotateProp + "(0deg)"); 
                Dom.css3.transform(frontFrame, rotateProp + "(180deg)"); 
            }, 20);

            setTimeout(function() {
                scene.parentNode.removeChild(scene);
                if(isShowing)
                    item.style.visibility = "visible";
                // @todo -> Send event after completion
            }, me._animationDuration + 1);
        }
    };

    this._toggleFunction = null;
    // @todo -> Pass global param duration to gridifier?
    // @todo -> Move this functions to separate files to allow easily override them?
    //               User should have the ability to overide rotateX and rotateY in such manner,
    //               that they would call for example scale in ie10/ie9 etc....
    //              User should have control over direction of rotate and perspective size.
    this._toggleFunctions = {
        "rotateX": {
            "show": function(item, grid) {
                if(!Dom.isBrowserSupportingTransitions()) {
                    item.style.visibility = "visible";
                    // @todo -> Send event
                    return;
                }

                me._rotateFunction.show(item, grid);
            },

            "hide": function(item, grid) {
                if(!Dom.isBrowserSupportingTransitions()) {
                    item.style.visibility = "hidden";
                    // @todo -> Send event
                    return;
                }

                me._rotateFunction.hide(item, grid);
            }
        },
        "rotateY": {
            "show": function(item, grid) {
                if(!Dom.isBrowserSupportingTransitions()) {
                    item.style.visibility = "visible";
                    // @todo -> Send event
                    return;
                }

                me._rotateFunction.show(item, grid, true);
            },

            "hide": function(item, grid) {
                if(!Dom.isBrowserSupportingTransitions()) {
                    item.style.visibility = "hidden";
                    // @todo -> Send event
                    return;
                }

                me._rotateFunction.hide(item, grid, true);
            }
        },
        "scale": {
            "show": function(item, grid) {
                if(!Dom.isBrowserSupportingTransitions()) {
                    item.style.visibility = "visible";
                    // @todo -> Send event
                    return;
                }
                
                // @todo -> Adjust timeout, and move to separate const
                // @todo -> Change other transition params to transform
                // @todo -> Apply prefixer to all settings
                Dom.css3.transitionProperty(item, Prefixer.getForCSS('transform', item) +" 0ms ease");
                // @todo -> Make multiple transform. Replace in all other settings
                //          (Rewrite all transitions and transforms in such manners)
                Dom.css3.transformProperty(item, "scale", 0);
                item.style.visibility = "visible"; // Ie11 blinking fix(:))
                setTimeout(function() {
                    // @todo -> Use correct vendor.(Refactor SizesTransformer)
                    item.style.visibility = "visible";
                    Dom.css3.transitionProperty(item, Prefixer.getForCSS('transform', item) + " 1000ms ease");
                    Dom.css3.transformProperty(item, "scale", 1);
                    setTimeout(function() {
                        me._eventEmitter.emitShowEvent(item);
                    }, 1020);
                }, 20); 
            },

            "hide": function(item) {
                if(!Dom.isBrowserSupportingTransitions()) {
                    item.style.visibility = "hidden";
                    // @todo -> Send event
                    return;
                }

                Dom.css3.transition(item, "transform 1000ms ease");
                Dom.css3.transform(item, "scale(0)");
                setTimeout(function() {
                    item.style.visibility = "hidden";
                    Dom.css3.transition(item, "transform 0s ease");
                    Dom.css3.transform(item, "scale(1)");
                }, 20);
                // Send event through global Gridifier.Event Object
            }
        },
        "fade": {
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
        },
        "visibility": {
            "show": function(item) {
                item.style.visibility = "visible";
            },
            "hide": function(item) {
                item.style.visibility = "hidden";
            }
        }
    };

    this._sortFunction = null;
    this._sortFunctions = {
        "default": function(itemOne, itemTwo) {
            return -1;
        }
    };

    this._filterFunction = null;
    this._filterFunctions = {
        "all": function(item) {
            return true;
        }
    };

    // @todo -> Pass timeouter object to correctly register delay???
    //          (For correct callback fire)
    this._rendererCoordsChangerFunction = null;
    this._rendererCoordsChangerFunctions = {
        'default': function(item, left, top) {
            Dom.css3.transitionProperty(item, "left 0ms ease, top 0ms ease");
            Dom.css.set(item, {
                left: left,
                top: top
            });
        },

        'simultaneousCSS3Transition': function(item, newLeft, newTop) {
            var newLeft = parseFloat(newLeft);
            var newTop = parseFloat(newTop);

            var currentLeft = parseFloat(item.style.left);
            var currentTop = parseFloat(item.style.top);

            if(newLeft > currentLeft)
                var translateX = newLeft - currentLeft;
            else if(newLeft < currentLeft)
                var translateX = (currentLeft - newLeft) * -1;
            else 
                var translateX = 0;

            if(newTop > currentTop)
                var translateY = newTop - currentTop;
            else if(newTop < currentTop)
                var translateY = (currentTop - newTop) * -1;
            else
                var translateY = 0;

            // @todo -> correctly parse params
            // @todo -> set transitions only in this func-on, or separate transition setter???
            Dom.css3.transitionProperty(item, Prefixer.getForCSS('transform3d', item) + " 500ms ease");
            //, width 600ms ease, height 600ms ease");
            Dom.css3.perspective(item, "1000");
            Dom.css3.backfaceVisibility(item, "hidden");
            Dom.css3.transformProperty(item, "translate3d", translateX + "px," + translateY + "px,0px");
        }
    };

    this._rendererSizesChangerFunction = null;
    this._rendererSizesChangerFunctions = {
        'default': function(item, newWidth, newHeight) {
            Dom.css3.transitionProperty(item, "width 0ms ease, height 0ms ease");
            Dom.css.set(item, {
                width: newWidth,
                height: newHeight
            });
        },

        'simultaneousCSS3Transition': function(item, newWidth, newHeight) {
            // @todo -> correctly parse params
            //var transition = item.style.transition;

            //Dom.css3.transition(item, "width 300ms ease, height 300ms ease");
            Dom.css.set(item, {
                width: newWidth,
                height: newHeight
            });
        }
    };

    this._gridItemMarkingStrategyType = null;
    this._gridItemMarkingValue = null;

    this._shouldEnableDragifierOnInit = false;
    this._dragifierItemSelector = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._eventEmitter = eventEmitter;
        me._parse();
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

Gridifier.Settings.prototype._parse = function() {
    this._parseGridType();
    this._parsePrependType();
    this._parseAppendType();
    this._parseIntersectionStrategy();
    this._parseIntersectionStrategyAlignmentType();
    this._parseSortDispersionMode();
    this._parseToggleOptions();
    this._parseSortOptions();
    this._parseFilterOptions();
    this._parseRendererCoordsChanger();
    this._parseRendererSizesChanger();
    this._parseGridItemMarkingStrategy();
    this._parseDragifierSettings();
}

Gridifier.Settings.prototype._parseGridType = function() {
    if(!this._settings.hasOwnProperty("gridType")) {
        this._gridType = Gridifier.GRID_TYPES.VERTICAL_GRID;
        return;
    }

    if(this._settings.gridType != Gridifier.GRID_TYPES.VERTICAL_GRID
        && this._settings.gridType != Gridifier.GRID_TYPES.HORIZONTAL_GRID) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_GRID_TYPE,
            this._settings.gridType
        );
    }
    this._gridType = this._settings.gridType; 
}

Gridifier.Settings.prototype._parsePrependType = function() {
    if(!this._settings.hasOwnProperty("prependType")) {
        this._prependType = Gridifier.PREPEND_TYPES.DEFAULT_PREPEND;
        return;
    }

    if(this._settings.prependType != Gridifier.PREPEND_TYPES.DEFAULT_PREPEND 
        && this._settings.prependType != Gridifier.PREPEND_TYPES.REVERSED_PREPEND 
        && this._settings.prependType != Gridifier.PREPEND_TYPES.MIRRORED_PREPEND) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_PREPEND_TYPE,
            this._settings.prependType
        );
    }
    this._prependType = this._settings.prependType;
}

Gridifier.Settings.prototype._parseAppendType = function() {
    if(!this._settings.hasOwnProperty("appendType")) {
        this._appendType = Gridifier.APPEND_TYPES.DEFAULT_APPEND;
        return;
    }

    if(this._settings.appendType != Gridifier.APPEND_TYPES.DEFAULT_APPEND
        && this._settings.appendType != Gridifier.APPEND_TYPES.REVERSED_APPEND) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_APPEND_TYPE,
            this._settings.appendType
        );
    }
    this._appendType = this._settings.appendType;
}

Gridifier.Settings.prototype._parseIntersectionStrategy = function() {
    if(!this._settings.hasOwnProperty("intersectionStrategy")) {
        this._intersectionStrategy = Gridifier.INTERSECTION_STRATEGIES.DEFAULT;
        return;
    }

    if(this._settings.intersectionStrategy != Gridifier.INTERSECTION_STRATEGIES.DEFAULT 
        && this._settings.intersectionStrategy != Gridifier.INTERSECTION_STRATEGIES.NO_INTERSECTIONS) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_INTERSECTION_STRATEGY,
            this._settings.intersectionStrategy
        );
    }
    this._intersectionStrategy = this._settings.intersectionStrategy;
}

Gridifier.Settings.prototype._parseIntersectionStrategyAlignmentType = function() {
    var alignmentTypes = Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES;

    if(!this._settings.hasOwnProperty("alignmentType")) {
        if(this.isVerticalGrid())
            this._alignmentType = alignmentTypes.FOR_VERTICAL_GRID.TOP;
        else if(this.isHorizontalGrid()) 
            this._alignmentType = alignmentTypes.FOR_HORIZONTAL_GRID.LEFT;
        return;
    }

    if(this.isVerticalGrid()) {
        var validAlignmentTypes = [
            alignmentTypes.FOR_VERTICAL_GRID.TOP,
            alignmentTypes.FOR_VERTICAL_GRID.CENTER,
            alignmentTypes.FOR_VERTICAL_GRID.BOTTOM
        ];
    }
    else if(this.isHorizontalGrid()) {
        var validAlignmentTypes = [
            alignmentTypes.FOR_HORIZONTAL_GRID.LEFT,
            alignmentTypes.FOR_HORIZONTAL_GRID.CENTER,
            alignmentTypes.FOR_HORIZONTAL_GRID.RIGHT
        ];
    }

    var isValidAlignmentType = false;
    for(var i = 0; i < validAlignmentTypes.length; i++) {
        if(validAlignmentTypes[i] == this._settings.alignmentType)
            isValidAlignmentType = true;
    }

    if(isValidAlignmentType) {
        this._alignmentType = this._settings.alignmentType;
        return;
    }

    new Gridifier.Error(
        Gridifier.Error.ERROR_TYPES.INVALID_ALIGNMENT_TYPE,
        this._settings.alignmentType
    );
}

Gridifier.Settings.prototype._parseSortDispersionMode = function() {
    if(!this._settings.hasOwnProperty("sortDispersionMode")) {
        this._sortDispersionMode = Gridifier.SORT_DISPERSION_MODES.DISABLED;
        return;
    }

    if(this._settings.sortDispersionMode != Gridifier.SORT_DISPERSION_MODES.DISABLED 
        && this._settings.sortDispersionMode != Gridifier.SORT_DISPERSION_MODES.CUSTOM 
        && this._settings.sortDispersionMode != Gridifier.SORT_DISPERSION_MODES.CUSTOM_ALL_EMPTY_SPACE) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_SORT_DISPERSION_MODE,
            this._settings.sortDispersionMode
        );
    }
    this._sortDispersionMode = this._settings.sortDispersionMode;

    if(this.isCustomSortDispersion()) {
        if(!this._settings.hasOwnProperty("sortDispersionValue")) {
            new Gridifier.Error(Gridifier.Error.ERROR_TYPES.SETTINGS.MISSING_SORT_DISPERSION_VALUE);
        }

        var sortDispersionValueRegexp = new RegExp(/[\d]+(px)/);
        if(!sortDispersionValueRegexp.test(this._settings.sortDispersionValue)) {
            new Gridifier.Error(
                Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_SORT_DISPERSION_VALUE,
                this._settings.sortDispersionValue
            );
        }
        this._sortDispersionValue = this._settings.sortDispersionValue;
    }
}

Gridifier.Settings.prototype.isVerticalGrid = function() {
    return this._gridType == Gridifier.GRID_TYPES.VERTICAL_GRID;
}

Gridifier.Settings.prototype.isHorizontalGrid = function() {
    return this._gridType == Gridifier.GRID_TYPES.HORIZONTAL_GRID;
}

Gridifier.Settings.prototype.isDefaultPrepend = function() {
    return this._prependType == Gridifier.PREPEND_TYPES.DEFAULT_PREPEND;
}

Gridifier.Settings.prototype.isReversedPrepend = function() {
    return this._prependType == Gridifier.PREPEND_TYPES.REVERSED_PREPEND;
}

Gridifier.Settings.prototype.isMirroredPrepend = function() {
    return this._prependType == Gridifier.PREPEND_TYPES.MIRRORED_PREPEND;
}

Gridifier.Settings.prototype.isDefaultAppend = function() {
    return this._appendType == Gridifier.APPEND_TYPES.DEFAULT_APPEND;
}

Gridifier.Settings.prototype.isReversedAppend = function() {
    return this._appendType == Gridifier.APPEND_TYPES.REVERSED_APPEND;
}

Gridifier.Settings.prototype.isDefaultIntersectionStrategy = function() {
    return this._intersectionStrategy == Gridifier.INTERSECTION_STRATEGIES.DEFAULT;
}

Gridifier.Settings.prototype.isNoIntersectionsStrategy = function() {
    return this._intersectionStrategy == Gridifier.INTERSECTION_STRATEGIES.NO_INTERSECTIONS;
}

Gridifier.Settings.prototype.isVerticalGridTopAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_VERTICAL_GRID.TOP;
}

Gridifier.Settings.prototype.isVerticalGridCenterAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_VERTICAL_GRID.CENTER;
}

Gridifier.Settings.prototype.isVerticalGridBottomAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_VERTICAL_GRID.BOTTOM;
}

Gridifier.Settings.prototype.isHorizontalGridLeftAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_HORIZONTAL_GRID.LEFT;
}

Gridifier.Settings.prototype.isHorizontalGridCenterAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_HORIZONTAL_GRID.CENTER;
}

Gridifier.Settings.prototype.isHorizontalGridRightAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_HORIZONTAL_GRID.RIGHT;
}

Gridifier.Settings.prototype.isDisabledSortDispersion = function() {
    return this._sortDispersionMode == Gridifier.SORT_DISPERSION_MODES.DISABLED;
}

Gridifier.Settings.prototype.isCustomSortDispersion = function() {
    return this._sortDispersionMode == Gridifier.SORT_DISPERSION_MODES.CUSTOM;
}

Gridifier.Settings.prototype.isCustomAllEmptySpaceSortDispersion = function() {
    return this._sortDispersionMode == Gridifier.SORT_DISPERSION_MODES.CUSTOM_ALL_EMPTY_SPACE;
}

Gridifier.Settings.prototype.getSortDispersionValue = function() {
    return this._sortDispersionValue;
}

Gridifier.Settings.prototype._parseToggleOptions = function() {
    if(!this._settings.hasOwnProperty("toggle")) {
        this._toggleFunction = this._toggleFunctions["scale"];
        return;
    }

    if(typeof this._settings.toggle == "object") {
        for(var toggleFunctionName in this._settings.toggle) {
            var toggleFunctionsData = this._settings.toggle[toggleFunctionName];

            if(typeof toggleFunctionsData != "object"
                || typeof toggleFunctionsData.show == "undefined"
                || typeof toggleFunctionsData.hide == "undefined") {
                new Gridifier.Error(
                    Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_TOGGLE_PARAMS,
                    toggleFunctionsData
                );
            }
            this._toggleFunctions[toggleFunctionName] = toggleFunctionsData;
        }
        this._toggleFunction = this._toggleFunctions["scale"];
    }
    else {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_TOGGLE_PARAM_VALUE,
            this._settings.toggle
        );
    }
}

Gridifier.Settings.prototype._parseSortOptions = function() {
    if(!this._settings.hasOwnProperty("sort")) {
        this._sortFunction = this._sortFunctions["default"];
        return;
    }

    if(typeof this._settings.sort == "function") {
        this._sortFunctions["clientDefault"] = this._settings.sort;
        this._sortFunction = this._settings.sort;
    }
    else if(typeof this._settings.sort == "object") {
        for(var sortFunctionName in this._settings.sort) {
            var sortFunction = this._settings.sort[sortFunctionName];

            if(typeof sortFunction != "function") {
                new Gridifier.Error(
                    Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_SORT_FUNCTION_TYPES,
                    sortFunction
                );
            }
            this._sortFunctions[sortFunctionName] = sortFunction;
        }
        this._sortFunction = this._sortFunctions["default"];
    }
    else {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_SORT_PARAM_VALUE,
            this._settings.sort
        );
    }
}

Gridifier.Settings.prototype._parseFilterOptions = function() {
    if(!this._settings.hasOwnProperty("filter")) {
        this._filterFunction = this._filterFunctions["all"];
        return;
    }

    if(typeof this._settings.filter == "function") {
        this._filterFunctions["clientDefault"] = this._settings.filter;
        this._filterFunction = this._settings.filter;
    }
    else if(typeof this._settings.filter == "object") {
        for(var filterFunctionName in this._settings.filter) {
            var filterFunction = this._settings.filter[filterFunctionName];

            if(typeof filterFunction != "function") {
                new Gridifier.Error(
                    Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_FILTER_FUNCTION_TYPES,
                    filterFunction
                );
            }
            this._filterFunctions[filterFunctionName] = filterFunction;
        }
        this._filterFunction = this._filterFunctions["all"];
    }
    else {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_FILTER_PARAM_VALUE,
            this._settings.filter
        );
    }
}

Gridifier.Settings.prototype._parseRendererCoordsChanger = function(rendererCoordsChangerFunctionName) {
    if(!this._settings.hasOwnProperty("rendererCoordsChanger")) {
        this._rendererCoordsChangerFunction = this._rendererCoordsChangerFunctions["simultaneousCSS3Transition"];
        return;
    }

    if(typeof this._settings.rendererCoordsChanger == "function") {
        this._rendererCoordsChangerFunctions["clientDefault"] = this._settings.rendererCoordsChanger;
        this._rendererCoordsChangerFunction = this._settings.rendererCoordsChanger;
    }
    else if(typeof this._settings.rendererCoordsChanger == "object") {
        for(var rendererCoordsChangerFunctionName in this._settings.rendererCoordsChanger) {
            var rendererCoordsChangerFunction = this._settings.rendererCoordsChanger[rendererCoordsChangerFunctionName];

            if(typeof rendererCoordsChangerFunction != "function") {
                // @todo -> Throw correct error
                throw new Error("Invalid renderCoordsChanger function on object.");
                // new Gridifier.Error(
                //     Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_SORT_FUNCTION_TYPES,
                //     sortFunction
                // );
            }
            this._rendererCoordsChangerFunctions[rendererCoordsChangerFunctionName] = rendererCoordsChangerFunction;
        }
        // @todo -> parse first function
        this._rendererCoordsChangerFunction = this._rendererCoordsChangerFunctions["default"];
    }
    else {
        // @todo -> Throw correct error
        throw new Error("Invalid rendererCoordsChanger function.");
        // new Gridifier.Error(
        //     Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_SORT_PARAM_VALUE,
        //     this._settings.sort
        // );
    }
}

Gridifier.Settings.prototype._parseRendererSizesChanger = function(rendererSizesChangerFunctionName) {
    if(!this._settings.hasOwnProperty("rendererSizesChanger")) {
        this._rendererSizesChangerFunction = this._rendererSizesChangerFunctions["simultaneousCSS3Transition"];
        return;
    }

    if(typeof this._settings.rendererSizesChanger == "function") {
        this._rendererSizesChangerFunctions["clientDefault"] = this._settings.rendererSizesChanger;
        this._rendererSizesChangerFunction = this._settings.rendererSizesChanger;
    }
    else if(typeof this._settings.rendererSizesChanger == "object") {
        for(var rendererSizesChangerFunctionName in this._settings.rendererSizesChanger) {
            var rendererSizesChangerFunction = this._settings.rendererSizesChanger[rendererSizesChangerFunctionName];

            if(typeof rendererSizesChangerFunction != "function") {
                // @todo -> Throw correct error
                throw new Error("Invalid renderSizesChanger function on object.");
                // new Gridifier.Error(
                //     Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_SORT_FUNCTION_TYPES,
                //     sortFunction
                // );
            }
            this._rendererSizesChangerFunctions[rendererSizesChangerFunctionName] = rendererSizesChangerFunction;
        }
        // @todo -> parse first function
        this._rendererSizesChangerFunction = this._rendererSizesChangerFunctions["default"];
    }
    else {
        // @todo -> Throw correct error
        throw new Error("Invalid rendererSizesChanger function.");
        // new Gridifier.Error(
        //     Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_SORT_PARAM_VALUE,
        //     this._settings.sort
        // );
    }
}

Gridifier.Settings.prototype.setToggle = function(toggleFunctionName) {
    if(!this._toggleFunctions.hasOwnProperty(toggleFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_TOGGLE_INVALID_PARAM,
            toggleFunctionName
        );
        return;
    }

    this._toggleFunction = this._toggleFunctions[toggleFunctionName];
}

Gridifier.Settings.prototype.setFilter = function(filterFunctionName) {
    if(!this._filterFunctions.hasOwnProperty(filterFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_FILTER_INVALID_PARAM,
            filterFunctionName
        );
        return;
    }

    this._filterFunction = this._filterFunctions[filterFunctionName];
}

Gridifier.Settings.prototype.setSort = function(sortFunctionName) {
    if(!this._sortFunctions.hasOwnProperty(sortFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_SORT_INVALID_PARAM,
            sortFunctionName
        );
        return;
    }

    this._sortFunction = this._sortFunctions[sortFunctionName];
}

Gridifier.Settings.prototype.setRendererCoordsChanger = function(rendererCoordsChangerFunctionName) {
    if(!this._rendererCoordsChangerFunctions.hasOwnProperty(rendererCoordsChangerFunctionName)) {
        // @todo -> Throw correct error here
        throw new Error("wrong renderer coords changer function to set.");
        // new Gridifier.Error(
        //     Gridifier.Error.ERROR_TYPES.SETTINGS.SET_SORT_INVALID_PARAM,
        //     sortFunctionName
        // );
        return;
    }

    this._rendererCoordsChangerFunction = this._rendererCoordsChangerFunctions[rendererCoordsChangerFunctionName];
}

Gridifier.Settings.prototype.setRendererSizesChanger = function(rendererSizesChangerFunctionName) {
    if(!this._rendererSizesChangerFunctions.hasOwnProperty(rendererSizesChangerFunctionName)) {
        // @todo -> Throw correct error here
        throw new Error("wrong renderer sizes changer function to set.");
        // new Gridifier.Error(
        //     Gridifier.Error.ERROR_TYPES.SETTINGS.SET_SORT_INVALID_PARAM,
        //     sortFunctionName
        // );
        return;
    }

    this._rendererSizesChangerFunction = this._rendererSizesChangerFunctions[rendererSizesChangerFunctionName];
}

Gridifier.Settings.prototype.getToggle = function() {
    return this._toggleFunction;
}

Gridifier.Settings.prototype.getSort = function() {
    return this._sortFunction;
}

Gridifier.Settings.prototype.getFilter = function() {
    return this._filterFunction;
}

Gridifier.Settings.prototype.getRendererCoordsChanger = function() {
    return this._rendererCoordsChangerFunction;
}

Gridifier.Settings.prototype.getRendererSizesChanger = function() {
    return this._rendererSizesChangerFunction;
}

Gridifier.Settings.prototype._parseGridItemMarkingStrategy = function() {
    if(!this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS) 
        && !this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR)) {
        this._gridItemMarkingStrategyType = Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR;
        this._gridItemMarkingValue = Gridifier.GRID_ITEM_MARKING_DEFAULTS.DATA_ATTR;
        return;
    }

    if(this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS)) {
        this._gridItemMarkingStrategyType = Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS;
        this._gridItemMarkingValue = this._settings[Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS];
    }
    else if(this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR)) {
        this._gridItemMarkingStrategyType = Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR;
        this._gridItemMarkingValue = this._settings[Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR];
    }
}

Gridifier.Settings.prototype.isByClassGridItemMarkingStrategy = function() {
    return this._gridItemMarkingStrategyType == Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS;
}

Gridifier.Settings.prototype.isByDataAttrGridItemMarkingStrategy = function() {
    return this._gridItemMarkingStrategyType == Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR;
}

Gridifier.Settings.prototype.getGridItemMarkingType = function() {
    return this._gridItemMarkingValue;
}

Gridifier.Settings.prototype.getGridItemMarkingValue = function() {
    return this._gridItemMarkingValue;
}

Gridifier.Settings.prototype._parseDragifierSettings = function() {
    if(this._settings.hasOwnProperty("dragifier") && this._settings.dragifier) {
        this._shouldEnableDragifierOnInit = true;

        if(typeof this._settings.dragifier == "boolean") {
            if(this.isByClassGridItemMarkingStrategy()) {
                this._dragifierItemSelector = "." + this._gridItemMarkingValue;
            }
            else if(this.isByDataAttrGridItemMarkingStrategy()) {
                this._dragifierItemSelector = "[" + this._gridItemMarkingValue + "]";
            }
        }
        else {
            this._dragifierItemSelector = this._settings.dragifier;
        }
        
        return;
    }

    this._shouldEnableDragifierOnInit = false;
    if(this.isByClassGridItemMarkingStrategy()) {
        this._dragifierItemSelector = "." + this._gridItemMarkingValue;
    }
    else if(this.isByDataAttrGridItemMarkingStrategy()) {
        this._dragifierItemSelector = "[" + this._gridItemMarkingValue + "]";
    }
}

Gridifier.Settings.prototype.shouldEnableDragifierOnInit = function() {
    return this._shouldEnableDragifierOnInit;
}

Gridifier.Settings.prototype.getDragifierItemSelector = function() {
    return this._dragifierItemSelector;
}