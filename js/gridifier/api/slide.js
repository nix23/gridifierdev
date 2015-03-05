Gridifier.Api.Slide = function(settings, eventEmitter, sizesResolverManager) {
    var me = this;

    this._settings = null;
    this._eventEmitter = null;
    this._sizesResolverManager = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
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
                                                           eventEmitter,
                                                           coordsChanger,
                                                           startLeft,
                                                           startTop) {
    var targetLeft = item.style.left;
    var targetTop = item.style.top;

    var itemClone = item.cloneNode(true);
    grid.appendChild(itemClone);

    setTimeout(function() {
        Dom.css3.transition(itemClone, "none");
        coordsChanger(
            itemClone,
            startLeft,
            startTop,
            0,
            eventEmitter,
            false
        );

        setTimeout(function() {
            Dom.css3.transition(
                itemClone, 
                Prefixer.getForCSS('transform', itemClone) + " " + animationMsDuration + "ms ease"
            );
            itemClone.style.visibility = "visible";
            coordsChanger(
                itemClone, 
                targetLeft, 
                targetTop,
                animationMsDuration,
                eventEmitter,
                false
            );

            setTimeout(function() {
                itemClone.style.visibility = "hidden";
                item.style.visibility = "visible";
                grid.removeChild(itemClone);

                eventEmitter.emitShowEvent(item);
            }, animationMsDuration + 20);
        }, 100); // A little delay before setting translate3d second time
    }, 100);
}

Gridifier.Api.Slide.prototype._executeSlideHide = function(item,
                                                           itemClone,
                                                           grid,
                                                           animationMsDuration,
                                                           eventEmitter,
                                                           coordsChanger,
                                                           targetLeft,
                                                           targetTop) {
    Dom.css3.transition(
        itemClone, 
        Prefixer.getForCSS('transform', itemClone) + " " + animationMsDuration + "ms ease"
    );
    coordsChanger(
        itemClone, 
        targetLeft, 
        targetTop,
        animationMsDuration,
        eventEmitter,
        false
    );

    setTimeout(function() {
        itemClone.style.visibility = "hidden";
        grid.removeChild(itemClone);
        eventEmitter.emitHideEvent(item);
    }, animationMsDuration + 20);
}

Gridifier.Api.Slide.prototype.createHorizontalSlideToggler = function(alignTop, alignBottom, reverseDirection) {
    var me = this;

    var alignTop = alignTop || false;
    var alignBottom = alignBottom || false;

    var isLeftSideToggler = !reverseDirection;
    var isRightSideToggler = reverseDirection;

    var getLeftPos = function(item, grid) {
        if(isLeftSideToggler)
            return me._sizesResolverManager.outerWidth(item,true) * -1;
        else if(isRightSideToggler)
            return me._sizesResolverManager.outerWidth(grid) + me._sizesResolverManager.outerWidth(item, true);
    }

    return {
        "show": function(item, 
                         grid, 
                         animationMsDuration, 
                         eventEmitter, 
                         sizesResolverManager,
                         coordsChanger) {
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
                eventEmitter,
                coordsChanger,
                getLeftPos(item, grid),
                top
            );
        },

        "hide": function(item, 
                         itemClone, 
                         grid, 
                         animationMsDuration, 
                         eventEmitter, 
                         sizesResolverManager,
                         coordsChanger) {
            itemClone.style.visibility = "visible";
            item.style.visibility = "hidden";

            if(!Dom.isBrowserSupportingTransitions()) {
                itemClone.style.visibility = "hidden";
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
                itemClone,
                grid,
                animationMsDuration,
                eventEmitter,
                coordsChanger,
                getLeftPos(item, grid),
                top
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
                         eventEmitter, 
                         sizesResolverManager,
                         coordsChanger) {
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
                eventEmitter,
                coordsChanger,
                left,
                getTopPos(item, grid)
            );
        },

        "hide": function(item, 
                         itemClone, 
                         grid, 
                         animationMsDuration, 
                         eventEmitter, 
                         sizesResolverManager,
                         coordsChanger) {
            itemClone.style.visibility = "visible";
            item.style.visibility = "hidden";

            if(!Dom.isBrowserSupportingTransitions()) {
                itemClone.style.visibility = "hidden";
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
                itemClone,
                grid,
                animationMsDuration,
                eventEmitter,
                coordsChanger,
                left,
                getTopPos(item, grid)
            );
        }
    };
}