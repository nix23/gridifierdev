Gridifier.Api.Slide = function(settings, gridifier, eventEmitter, sizesResolverManager) {
    var me = this;

    this._settings = null;
    this._gridifier = null;
    this._eventEmitter = null;
    this._sizesResolverManager = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._gridifier = gridifier;
        me._eventEmitter = eventEmitter;
        me._sizesResolverManager = sizesResolverManager;
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

Gridifier.Api.Slide.prototype._executeSlideShow = function(item, 
                                                           grid, 
                                                           animationMsDuration,
                                                           timeouter,
                                                           eventEmitter,
                                                           coordsChanger,
                                                           collector,
                                                           startLeft,
                                                           startTop,
                                                           connectionLeft,
                                                           connectionTop) {
    var me = this;
    var targetLeft = connectionLeft;
    var targetTop = connectionTop;

    if (!item.hasAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING)) {
        coordsChanger(
            item,
            startLeft,
            startTop,
            0,
            eventEmitter,
            false
        );

        item.setAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING, "yes");
    }

    // Setting translated position after 0ms call requires a little delay
    // per browsers repaint
    var slideOutTimeout = setTimeout(function() {
        if(!me._gridifier.hasItemBindedClone(item))
            item.style.visibility = "visible";

        coordsChanger(
            item,
            targetLeft,
            targetTop,
            animationMsDuration,
            eventEmitter,
            false
        );
    }, 0);
    timeouter.add(item, slideOutTimeout);

    var completeSlideOutTimeout = setTimeout(function() {
        item.style.visibility = "visible";
        item.removeAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING);
        eventEmitter.emitShowEvent(item);
    }, animationMsDuration + 20);
    timeouter.add(item, completeSlideOutTimeout);
}

Gridifier.Api.Slide.prototype._executeSlideHide = function(item,
                                                           grid,
                                                           animationMsDuration,
                                                           timeouter,
                                                           eventEmitter,
                                                           coordsChanger,
                                                           collector,
                                                           targetLeft,
                                                           targetTop,
                                                           connectionLeft,
                                                           connectionTop) {
    item.setAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING, "yes");
    coordsChanger(
        item,
        targetLeft,
        targetTop,
        animationMsDuration,
        eventEmitter,
        false
    );

    var slideInTimeout = setTimeout(function() {
        item.style.visibility = "hidden";
        item.removeAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING);
        eventEmitter.emitHideEvent(item);
    }, animationMsDuration + 20);
    timeouter.add(item, slideInTimeout);
}

Gridifier.Api.Slide.prototype.createHorizontalSlideToggler = function(alignTop, alignBottom, reverseDirection) {
    var me = this;

    var alignTop = alignTop || false;
    var alignBottom = alignBottom || false;

    var isLeftSideToggler = !reverseDirection;
    var isRightSideToggler = reverseDirection;

    var getLeftPos = function(item, grid) {
        if(isLeftSideToggler)
            return me._sizesResolverManager.outerWidth(item, true) * -1;
        else if(isRightSideToggler)
            return me._sizesResolverManager.outerWidth(grid) + me._sizesResolverManager.outerWidth(item, true);
    }

    return {
        "show": function(item, 
                         grid, 
                         animationMsDuration,
                         timeouter,
                         eventEmitter, 
                         sizesResolverManager,
                         coordsChanger,
                         collector,
                         connectionLeft,
                         connectionTop) {
            timeouter.flush(item);
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "visible";
                eventEmitter.emitShowEvent(item);
                return;
            }
            
            if(alignTop)
                var top = 0;
            else if(alignBottom)
                var top = sizesResolverManager.outerHeight(grid) + sizesResolverManager.outerHeight(item, true);
            else
                var top = item.style.top;

            me._executeSlideShow(
                item, 
                grid, 
                animationMsDuration,
                timeouter,
                eventEmitter,
                coordsChanger,
                collector,
                getLeftPos(item, grid),
                top,
                connectionLeft,
                connectionTop
            );
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
                         connectionTop) {
            timeouter.flush(item);
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "hidden";
                eventEmitter.emitHideEvent(item);
                return;
            }

            if(alignTop)
                var top = 0;
            else if(alignBottom)
                var top = sizesResolverManager.outerHeight(grid) + sizesResolverManager.outerHeight(item, true);
            else
                var top = item.style.top;

            me._executeSlideHide(
                item,
                grid,
                animationMsDuration,
                timeouter,
                eventEmitter,
                coordsChanger,
                collector,
                getLeftPos(item, grid),
                top,
                connectionLeft,
                connectionTop
            );
        }
    };
}

Gridifier.Api.Slide.prototype.createVerticalSlideToggler = function(alignLeft, alignRight, reverseDirection) {
    var me = this;

    var alignLeft = alignLeft || false;
    var alignRight = alignRight || false;

    var isTopSideToggler = !reverseDirection;
    var isBottomSideToggler = reverseDirection;

    var getTopPos = function(item, grid) {
        if(isTopSideToggler)
            return me._sizesResolverManager.outerHeight(item,true) * -1;
        else if(isBottomSideToggler)
            return me._sizesResolverManager.outerHeight(grid) + me._sizesResolverManager.outerHeight(item, true);
    }

    return {
        "show": function(item, 
                         grid, 
                         animationMsDuration,
                         timeouter,
                         eventEmitter, 
                         sizesResolverManager,
                         coordsChanger,
                         collector,
                         connectionLeft,
                         connectionTop) {
            timeouter.flush(item);
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "visible";
                eventEmitter.emitShowEvent(item);
                return;
            }

            if(alignLeft)
                var left = 0;
            else if(alignRight)
                var left = sizesResolverManager.outerWidth(grid) + sizesResolverManager.outerWidth(item, true);
            else
                var left = item.style.left;

            me._executeSlideShow(
                item, 
                grid, 
                animationMsDuration,
                timeouter,
                eventEmitter,
                coordsChanger,
                collector,
                left,
                getTopPos(item, grid),
                connectionLeft,
                connectionTop
            );
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
                         connectionTop) {
            timeouter.flush(item);
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "hidden";
                eventEmitter.emitHideEvent(item);
                return;
            }

            if(alignLeft)
                var left = 0;
            else if(alignRight)
                var left = sizesResolverManager.outerWidth(grid) + sizesResolverManager.outerWidth(item, true);
            else
                var left = item.style.left;

            me._executeSlideHide(
                item,
                grid,
                animationMsDuration,
                timeouter,
                eventEmitter,
                coordsChanger,
                collector,
                left,
                getTopPos(item, grid),
                connectionLeft,
                connectionTop
            );
        }
    };
}