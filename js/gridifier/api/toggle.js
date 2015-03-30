Gridifier.Api.Toggle = function(settings, gridifier, eventEmitter, sizesResolverManager) {
    var me = this;

    this._settings = null;
    this._gridifier = null;
    this._eventEmitter = null;
    this._sizesResolverManager = null;

    this._slideApi = null;
    this._rotateApi = null;

    this._toggleFunction = null;
    this._toggleFunctions = {};

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._gridifier = gridifier;
        me._eventEmitter = eventEmitter;
        me._sizesResolverManager = sizesResolverManager;

        me._slideApi = new Gridifier.Api.Slide(
            me._settings, me._gridifier, me._eventEmitter, me._sizesResolverManager
        );
        me._rotateApi = new Gridifier.Api.Rotate(
            me._settings, me._eventEmitter, me._sizesResolverManager
        );

        me._toggleFunctions = {};

        me._addSlides();
        me._addRotates();
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

Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING = "data-gridifier-toggle-animation-is-running";

Gridifier.Api.Toggle.prototype.setCollectorInstance = function(collector) {
    this._rotateApi.setCollectorInstance(collector);
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

Gridifier.Api.Toggle.prototype._addSlides = function() {
    var me = this;

    this._toggleFunctions.slideLeft = this._slideApi.createHorizontalSlideToggler(false, false, false);
    this._toggleFunctions.slideLeftTop = this._slideApi.createHorizontalSlideToggler(true, false, false);
    this._toggleFunctions.slideLeftBottom = this._slideApi.createHorizontalSlideToggler(false, true, false);

    this._toggleFunctions.slideRight = this._slideApi.createHorizontalSlideToggler(false, false, true);
    this._toggleFunctions.slideRightTop = this._slideApi.createHorizontalSlideToggler(true, false, true);
    this._toggleFunctions.slideRightBottom = this._slideApi.createHorizontalSlideToggler(false, true, true);

    this._toggleFunctions.slideTop = this._slideApi.createVerticalSlideToggler(false, false, false);
    this._toggleFunctions.slideTopLeft = this._slideApi.createVerticalSlideToggler(true, false, false);
    this._toggleFunctions.slideTopRight = this._slideApi.createVerticalSlideToggler(false, true, false);

    this._toggleFunctions.slideBottom = this._slideApi.createVerticalSlideToggler(false, false, true);
    this._toggleFunctions.slideBottomLeft = this._slideApi.createVerticalSlideToggler(true, false, true);
    this._toggleFunctions.slideBottomRight = this._slideApi.createVerticalSlideToggler(false, true, true);
}

Gridifier.Api.Toggle.prototype._createRotator = function(rotatorName,
                                                         showRotateApiFunction,
                                                         hideRotateApiFunction,
                                                         rotateMatrixType) {
    var me = this;

    this._toggleFunctions[rotatorName] = {
        "show": function(item,
                         grid,
                         animationMsDuration,
                         timeouter,
                         eventEmitter,
                         sizesResolverManager,
                         coordsChanger,
                         collector,
                         left,
                         top,
                         coordsChangerApi,
                         itemClonesManager) {
            timeouter.flush(item);
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "visible";
                eventEmitter.emitShowEvent(item);
                return;
            }

            me._rotateApi[showRotateApiFunction](item, grid, rotateMatrixType, timeouter, left, top, itemClonesManager);
        },

        "hide": function(item,
                         grid,
                         animationMsDuration,
                         timeouter,
                         eventEmitter,
                         sizesResolverManager,
                         coordsChanger,
                         collector,
                         left,
                         top,
                         coordsChangerApi,
                         itemClonesManager) {
            timeouter.flush(item);
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "hidden";
                eventEmitter.emitHideEvent(item);
                return;
            }

            me._rotateApi[hideRotateApiFunction](item, grid, rotateMatrixType, timeouter, left, top, itemClonesManager);
        }
    };
}

Gridifier.Api.Toggle.prototype._addRotates = function() {
    this._createRotator("rotate3dX", "show3d", "hide3d", Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.X);
    this._createRotator("rotate3dY", "show3d", "hide3d", Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.Y);
    this._createRotator("rotate3dZ", "show3d", "hide3d", Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.Z);
    this._createRotator("rotate3dXY", "show3d", "hide3d", Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.XY);
    this._createRotator("rotate3dXZ", "show3d", "hide3d", Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.XZ);
    this._createRotator("rotate3dYZ", "show3d", "hide3d", Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.YZ);
    this._createRotator("rotate3dXYZ", "show3d", "hide3d", Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.XYZ);

    this._createRotator("rotateX", "show", "hide", Gridifier.Api.Rotate.ROTATE_FUNCTION_TYPES.X);
    this._createRotator("rotateY", "show", "hide", Gridifier.Api.Rotate.ROTATE_FUNCTION_TYPES.Y);
    this._createRotator("rotateZ", "show", "hide", Gridifier.Api.Rotate.ROTATE_FUNCTION_TYPES.Z);
}

Gridifier.Api.Toggle.prototype._addScale = function() {
    var me = this;

    var createScaler = function(beforeScaleShow,
                                onScaleShow,
                                beforeScaleHide,
                                afterScaleHide) {
        return {
            "show":  function(item,
                              grid,
                              animationMsDuration,
                              timeouter,
                              eventEmitter,
                              sizesResolverManager,
                              coordsChanger,
                              collector,
                              connectionLeft,
                              connectionTop,
                              coordsChangerApi,
                              itemClonesManager) {
                timeouter.flush(item);
                if(!Dom.isBrowserSupportingTransitions()) {
                    item.style.visibility = "visible";
                    eventEmitter.emitShowEvent(item);
                    return;
                }

                itemClonesManager.lockCloneOnToggle(item);

                if(coordsChangerApi.hasTranslateOrTranslate3DTransformSet(item)) {
                    coordsChangerApi.setTransformOriginAccordingToCurrentTranslate(
                        item,
                        connectionLeft,
                        connectionTop,
                        sizesResolverManager.outerWidth(item, true),
                        sizesResolverManager.outerHeight(item, true)
                    );
                }

                if(!item.hasAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING)) {
                    Dom.css3.transition(item, "none");
                    beforeScaleShow(item, animationMsDuration);
                    Dom.css3.transformProperty(item, "scale3d", "0,0,0");
                    item.setAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING, "yes");
                }

                var initScaleTimeout = setTimeout(function () {
                    item.style.visibility = "visible";
                    Dom.css3.transition(
                        item,
                        Prefixer.getForCSS('transform', item) + " " + animationMsDuration + "ms ease"
                    );
                    Dom.css3.transformProperty(item, "scale3d", "1,1,1");
                    onScaleShow(item, animationMsDuration);
                }, 40);
                timeouter.add(item, initScaleTimeout);

                var completeScaleTimeout = setTimeout(function () {
                    itemClonesManager.unlockCloneOnToggle(item);
                    coordsChangerApi.resetTransformOrigin(item);

                    item.removeAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING);
                    eventEmitter.emitShowEvent(item);
                }, animationMsDuration + 60);
                timeouter.add(item, completeScaleTimeout);
            },

            "hide": function (item,
                              grid,
                              animationMsDuration,
                              timeouter,
                              eventEmitter,
                              sizesResolverManager,
                              coordsChanger,
                              collector,
                              connectionLeft,
                              connectionTop,
                              coordsChangerApi,
                              itemClonesManager) {
                timeouter.flush(item);
                if(!Dom.isBrowserSupportingTransitions()) {
                    item.style.visibility = "hidden";
                    eventEmitter.emitHideEvent(item);
                    return;
                }

                itemClonesManager.lockCloneOnToggle(item);

                if(coordsChangerApi.hasTranslateOrTranslate3DTransformSet(item)) {
                    coordsChangerApi.setTransformOriginAccordingToCurrentTranslate(
                        item,
                        connectionLeft,
                        connectionTop,
                        sizesResolverManager.outerWidth(item, true),
                        sizesResolverManager.outerHeight(item, true)
                    );
                }

                Dom.css3.transition(
                    item,
                    Prefixer.getForCSS('transform', item) + " " + animationMsDuration + "ms ease"
                );

                item.setAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING, "yes");
                Dom.css3.transformProperty(item, "scale3d", "0,0,0");
                beforeScaleHide(item, animationMsDuration);

                if(animationMsDuration > 200)
                    var hideItemTimeout = animationMsDuration - 100;
                else
                    var hideItemTimeout = animationMsDuration - 50;

                if(hideItemTimeout < 0)
                    hideItemTimeout = 0;

                var prehideItemTimeout = setTimeout(function () {
                    item.style.visibility = "hidden";
                    // setTimeout should be smaller than animation duration(Flickering bug in Webkit)
                }, hideItemTimeout);
                timeouter.add(item, prehideItemTimeout);

                var completeScaleTimeout = setTimeout(function () {
                    itemClonesManager.unlockCloneOnToggle(item).hideCloneOnToggle(item);

                    item.style.visibility = "hidden";
                    Dom.css3.transition(item, "none");
                    Dom.css3.transformProperty(item, "scale3d", "1,1,1");
                    afterScaleHide(item, animationMsDuration);
                    Dom.css3.transition(item, "");

                    coordsChangerApi.resetTransformOrigin(item);

                    item.removeAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING);
                    eventEmitter.emitHideEvent(item);
                }, animationMsDuration + 20);
                timeouter.add(item, completeScaleTimeout);
            }
        };
    }

    var voidFunction = function(item, animationMsDuration) { ; };
    this._toggleFunctions.scale = createScaler(voidFunction, voidFunction, voidFunction, voidFunction);
    this._toggleFunctions.scaleWithFade = createScaler(
        function(item, animationMsDuration) {
            Dom.css3.opacity(item, "0");
        },
        function(item, animationMsDuration) {
            Dom.css3.transitionProperty(
                item,
                Prefixer.getForCSS('opacity', item) + " " + animationMsDuration + "ms ease"
            );
            Dom.css3.opacity(item, 1);
        },
        function(item, animationMsDuration) {
            Dom.css3.transitionProperty(
                item,
                Prefixer.getForCSS('opacity', item) + " " + animationMsDuration + "ms ease"
            );
            Dom.css3.opacity(item, "0");
        },
        function(item, animationMsDuration) {
            Dom.css3.opacity(item, "1");
        }
    );
}

Gridifier.Api.Toggle.prototype._addFade = function() {
    var me = this;

    this._toggleFunctions.fade = {
        "show": function(item,
                         grid,
                         animationMsDuration,
                         timeouter,
                         eventEmitter,
                         sizesResolverManager,
                         coordsChanger,
                         collector,
                         connectionLeft,
                         connectionTop,
                         coordsChangerApi,
                         itemClonesManager) {
            timeouter.flush(item);
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "visible";
                eventEmitter.emitShowEvent(item);
                return;
            }

            itemClonesManager.lockCloneOnToggle(item);

            if (!item.hasAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING)) {
                Dom.css3.transition(item, "none");
                Dom.css3.opacity(item, "0");
                item.setAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING, "yes");
            }

            var initFadeTimeout = setTimeout(function() {
                item.style.visibility = "visible";
                Dom.css3.transition(
                    item,
                    Prefixer.getForCSS('opacity', item) + " " + animationMsDuration + "ms ease"
                );
                Dom.css3.opacity(item, 1);
            }, 20);
            timeouter.add(item, initFadeTimeout);

            var completeFadeTimeout = setTimeout(function() {
                itemClonesManager.unlockCloneOnToggle(item);
                item.removeAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING);
                eventEmitter.emitShowEvent(item);
            }, animationMsDuration + 40);
            timeouter.add(item, completeFadeTimeout);
        },

        "hide": function(item,
                         grid,
                         animationMsDuration,
                         timeouter,
                         eventEmitter,
                         sizesResolverManager,
                         coordsChanger,
                         collector,
                         connectionLeft,
                         connectionTop,
                         coordsChangerApi,
                         itemClonesManager) {
            timeouter.flush(item);
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "hidden";
                eventEmitter.emitHideEvent(item);
                return;
            }

            itemClonesManager.lockCloneOnToggle(item);
            Dom.css3.transition(
                item,
                Prefixer.getForCSS('opacity', item) + " " + animationMsDuration + "ms ease"
            );

            item.setAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING, "yes");
            Dom.css3.opacity(item, "0");

            var executeFadeOutTimeout = setTimeout(function () {
                itemClonesManager.unlockCloneOnToggle(item).hideCloneOnToggle(item);
                item.removeAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING);
                item.style.visibility = "hidden";

                Dom.css3.transition(item, "none");
                Dom.css3.opacity(item, "1");
                Dom.css3.transition(item, "");

                eventEmitter.emitHideEvent(item);
            }, animationMsDuration + 20);
            timeouter.add(item, executeFadeOutTimeout);
        }
    };
}

Gridifier.Api.Toggle.prototype._addVisibility = function() {
    var me = this;

    this._toggleFunctions.visibility = {
        "show": function(item, grid, animationMsDuration, timeouter, eventEmitter, sizesResolverManager) {
            timeouter.flush(item);
            item.style.visibility = "visible";
            eventEmitter.emitShowEvent(item);
        },

        "hide": function(item, grid, animationMsDuration, timeouter, eventEmitter, sizesResolverManager) {
            timeouter.flush(item);
            item.style.visibility = "hidden";
            eventEmitter.emitHideEvent(item);
        }
    };
}