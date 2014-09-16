DemoLayoutBuilder.InsertSettingDemonstrator = function($targetEl, gridSettings, insertMode, gridTypeSelector, demoLayout) {
    var me = this;

    this._$view = View.attach(this._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.INSERT_SETTING_DEMONSTRATOR);

    this._demoLayout = null;
    this._insertMode = null;
    this._gridTypeSelector = null;

    this._gridSettings = null;
    this._gridAnimator = null;

    this._atomSize = 57;
    this._atomMargin = 4;

    this._$layout = null;
    this._currentGridBGIndex = -1;

    this._frameRenderMsInterval = 150;
    this._isAnimationActive = false;
    this._animationSteps = null;
    this._currentAnimationStep = 0;
    this._horizontalAtomsCount = null;
    this._verticalAtomsCount = null;

    this._css = {
        layoutClass: "layout",
        atomClass: "atom",
        atomBorderClass: "atomBorder"
    }

    this._construct = function() {
        me._demoLayout = demoLayout;
        me._gridSettings = gridSettings;
        me._gridTypeSelector = gridTypeSelector;

        me._insertMode = insertMode;
        me._$layout = me._$view.parent().find("." + me._css.layoutClass);

        if(me._gridSettings._isHorizontalGridType())
            me._gridAnimator = new DemoLayoutBuilder.InsertSettingDemonstrator.HorizontalGridAnimator(me);
        else if(me._gridSettings._isVerticalGridType())
            me._gridAnimator = new DemoLayoutBuilder.InsertSettingDemonstrator.VerticalGridAnimator(me);
        
        me._renderAtoms();
        me._launchAnimation();
        
        if(me._gridSettings._isHorizontalGridType())
            me._stopAnimation();

        me._bindEvents();
    }

    this._bindEvents = function() {
        $(window).on(DemoLayoutBuilder.InsertSettingDemonstrator.EVENT_WINDOW_RESIZE, function() {
            var resizeEventNormalizer = new ResizeEventNormalizer();
            var normalizedFunc = resizeEventNormalizer.apply(function() {
                me._removeRenderedAtoms();
                me._renderAtoms();
            });

            normalizedFunc.apply(me);
        });

        $(me._gridTypeSelector).on(DemoLayoutBuilder.GridTypeSelector.EVENT_GRID_TYPE_CHANGE, function(event, 
                                                                                                                                                                      gridType, 
                                                                                                                                                                      isVerticalGridType, 
                                                                                                                                                                      isHorizontalGridType) {
            if(isVerticalGridType())
            {
                if(me._gridSettings._isHorizontalGridType())
                    me._stopAnimation();
                else if(me._gridSettings._isVerticalGridType())
                    me._launchAnimation();
            }
            else if(isHorizontalGridType())
            {
                if(me._gridSettings._isHorizontalGridType())
                    me._launchAnimation();
                else if(me._gridSettings._isVerticalGridType())
                    me._stopAnimation();
            }
        });

        $(me._demoLayout).on(DemoLayoutBuilder.EVENT_CREATE_GRID, function() {
            me._stopAnimation();
        });
    }

    this._unbindEvents = function() {
        $(window).off(DemoLayoutBuilder.InsertSettingDemonstrator.EVENT_WINDOW_RESIZE);
        $(me._gridTypeSelector).off(DemoLayoutBuilder.GridTypeSelector.EVENT_GRID_TYPE_CHANGE);
        $(me._demoLayout).off(DemoLayoutBuilder.EVENT_CREATE_GRID);
    }

    this.destruct = function() {
        me._unbindEvents();
        me._stopAnimation();
        me._gridAnimator.destruct();
        me._$view.remove();
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.InsertSettingDemonstrator.EVENT_WINDOW_RESIZE = "resize.demoLayoutBuilder.insertSettingsDemonstrator";

DemoLayoutBuilder.InsertSettingDemonstrator.prototype._isAppendInsertMode = function() {
    return this._insertMode == DemoLayoutBuilder.GridSettings.INSERT_MODES.APPEND;
}

DemoLayoutBuilder.InsertSettingDemonstrator.prototype._isPrependInsertMode = function() {
    return this._insertMode == DemoLayoutBuilder.GridSettings.INSERT_MODES.PREPEND;
}

DemoLayoutBuilder.InsertSettingDemonstrator.prototype._launchAnimation = function() {
    this._isAnimationActive = true;
    this._currentAnimationStep = 0;
    this._renderNextAnimationFrame();
}

DemoLayoutBuilder.InsertSettingDemonstrator.prototype._stopAnimation = function() {
    this._isAnimationActive = false;
    this._currentAnimationStep = 0;
}

DemoLayoutBuilder.InsertSettingDemonstrator.prototype._renderNextAnimationFrame = function() {
    var me = this; 
    this._hideAllAtoms();
    
    if(this._isPrependInsertMode())
    {
        if(this._gridSettings._isMirroredPrepend())
            this._gridAnimator.renderNextMirroredPrependFrame();
        else if(this._gridSettings._isDefaultPrepend())
            this._gridAnimator.renderNextDefaultPrependFrame();
        else if(this._gridSettings._isReversedPrepend())
            this._gridAnimator.renderNextReversedPrependFrame();
    }
    else if(this._isAppendInsertMode())
    {
        if(this._gridSettings._isDefaultAppend())
            this._gridAnimator.renderNextDefaultAppendFrame();
        else if(this._gridSettings._isReversedAppend())
            this._gridAnimator.renderNextReversedAppendFrame();
    }

    setTimeout(function() {
        if(!me._isAnimationActive)
            return;

        me._currentAnimationStep++;
        if(me._currentAnimationStep > me._animationSteps)
            me._currentAnimationStep = 0;

        me._renderNextAnimationFrame();
    }, this._frameRenderMsInterval);
}

DemoLayoutBuilder.InsertSettingDemonstrator.prototype._hideAllAtoms = function() {
    this._$layout.find("." + this._css.atomClass).css("visibility", "hidden");
}

DemoLayoutBuilder.InsertSettingDemonstrator.prototype._removeRenderedAtoms = function() {
    this._$layout.find("." + this._css.atomClass).remove();
}

DemoLayoutBuilder.InsertSettingDemonstrator.prototype._createAtom = function() {
    var gridBgs = ["gridFirstBg", "gridSecondBg", "gridThirdBg", "gridFourthBg", "gridFifthBg"];
    this._currentGridBGIndex++;
    if(this._currentGridBGIndex == gridBgs.length)
        this._currentGridBGIndex = 0;

    var div = document.createElement("div");
    div.setAttribute("class", this._css.atomClass + " " + this._css.atomBorderClass + " " + gridBgs[this._currentGridBGIndex]);
    div.style.position = "absolute";
    div.style.width = this._atomSize + "px";
    div.style.height = this._atomSize + "px";
    div.style.lineHeight = this._atomSize - 5 + "px";
    div.style.visibility = "hidden";

    return div;
}

DemoLayoutBuilder.InsertSettingDemonstrator.prototype._renderAtoms = function() {
    this._animationSteps = 0;
    this._currentAnimationStep = 0;
    this._currentGridBGIndex = -1;
    var layoutWidth = this._$layout.outerWidth();
    var layoutHeight = this._$layout.outerHeight(); 

    var atomWidth = this._atomSize + this._atomMargin * 2;
    var atomHeight = this._atomSize + this._atomMargin * 2;

    var horizontalAtomsCount = Math.floor(layoutWidth / atomWidth);
    var verticalAtomsCount = Math.floor(layoutHeight / atomHeight);

    var totalAvailableWidthPerSpacers = layoutWidth - horizontalAtomsCount * this._atomSize;
    var totalAvailableHeightPerSpacers = layoutHeight - verticalAtomsCount * this._atomSize;

    var spacerWidth = totalAvailableWidthPerSpacers / (horizontalAtomsCount + 1);
    var spacerHeight = totalAvailableHeightPerSpacers / (verticalAtomsCount + 1);

    var nextPositionLeft = spacerWidth; var layout = this._$layout.get(0); 
    for(var i = 0; i < horizontalAtomsCount; i++)
    {
        var nextPositionTop = spacerHeight; 
        for(var j = 0; j < verticalAtomsCount; j++)
        {   
            var atom = this._createAtom();
            atom.setAttribute("class", atom.getAttribute("class") + " " + this._css.atomClass + "-" + j + "-" + i);
            atom.style.left = nextPositionLeft + "px";
            atom.style.top = nextPositionTop + "px";
            this._$layout.get(0).appendChild(atom);

            this._animationSteps++;
            nextPositionTop += this._atomSize + spacerHeight;
        }

        nextPositionLeft += this._atomSize + spacerWidth;
    }

    this._horizontalAtomsCount = horizontalAtomsCount;
    this._verticalAtomsCount = verticalAtomsCount;
}