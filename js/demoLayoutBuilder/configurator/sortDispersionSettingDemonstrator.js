DemoLayoutBuilder.SortDispersionSettingDemonstrator = function($targetEl, gridAdditionalSettings, gridSettings, gridTypeSelector, demoLayout) {
    var me = this;

    this._$view = View.attach(this._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.SORT_DISPERSION_SETTING_DEMONSTRATOR);

    this._demoLayout = null;
    this._gridAdditionalSettings = null;
    this._gridTypeSelector = null;

    this._selectedSortDispersionMode = null;

    this._atomSize = 57;
    this._bigAtomSize = 114;
    this._atomMargin = 4;
    this._itemNumber = 0;

    this._isAnimationActive = false;
    this._wasAnimationActive = null;

    this._toggleLayoutFrameTimeout = null;
   // this._frameRenderMsInterval = 3000;
    this._frameRenderMsInterval = 800;

    this._$currentVisibleFrame = null;
    this._$disabledSdInsertionFrame = null;
    this._$disabledSdTransitionFrame = null;
    this._$customSdInsertionFrame = null;
    this._$customSdTransitionFrame = null;

    this._css = {
        layoutClass: "layout",
        atomClass: "atom",
        bigAtomClass: "bigAtom",
        atomBorderClass: "atomBorder",

        sortDispersionDemonstratorLayoutClass: "sortDispersionDemonstratorLayout",
        disabledSdInsertionFrameClass: "disabledSortDispersionLayoutInsertionFrame",
        disabledSdTransitionFrameClass: "disabledSortDispersionLayoutTransitionFrame",
        customSdInsertionFrameClass: "customSortDispersionLayoutInsertionFrame",
        customSdTransitionFrameClass: "customSortDispersionLayoutTransitionFrame"
    }

    this._construct = function() {
        me._demoLayout = demoLayout;
        me._gridAdditionalSettings = gridAdditionalSettings;
        me._gridSettings = gridSettings;
        me._gridTypeSelector = gridTypeSelector;

        me._$layout = me._$view.parent().find("." + me._css.layoutClass);
        me._selectedSortDispersionMode = DemoLayoutBuilder.GridAdditionalSettings.SORT_DISPERSION_MODES.DISABLED;

        me._$disabledSdInsertionFrame = me._$view.find("." + me._css.disabledSdInsertionFrameClass);
        me._$disabledSdTransitionFrame = me._$view.find("." + me._css.disabledSdTransitionFrameClass);
        me._$customSdInsertionFrame = me._$view.find("." + me._css.customSdInsertionFrameClass);
        me._$customSdTransitionFrame = me._$view.find("." + me._css.customSdTransitionFrameClass);

        me._renderAtoms();
        me._launchLayoutAnimation();

        if(me._gridSettings._isHorizontalGridType())
            me._stopLayoutAnimation();

        me._bindEvents();
    }

    this._bindEvents = function() {
        var me = this;

        $(window).on(DemoLayoutBuilder.SortDispersionSettingDemonstrator.EVENT_WINDOW_RESIZE, function() {
            var resizeEventNormalizer = new ResizeEventNormalizer();
            var normalizedFunc = resizeEventNormalizer.apply(function() {
                me._removeAllRenderedAtoms();
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
                    me._stopLayoutAnimation();
                else if(me._gridSettings._isVerticalGridType())
                    me._launchLayoutAnimation();
            }
            else if(isHorizontalGridType())
            {
                if(me._gridSettings._isHorizontalGridType())
                    me._launchLayoutAnimation();
                else if(me._gridSettings._isVerticalGridType())
                    me._stopLayoutAnimation();
            }
        });
        
        var sdChangeHandler = function(event, sortDispersionMode, sortDispersionValue) {
            me.setSortDispersionMode(sortDispersionMode);
            if(me.isDisabledSortDispersionMode()) 
            {
                me._$currentVisibleFrame = me._$disabledSdInsertionFrame;
            }
            else if(me.isCustomSortDispersionMode()) 
            {
                me._$currentVisibleFrame = me._$customSdInsertionFrame;
            }
        }
        $(this._gridAdditionalSettings).on(DemoLayoutBuilder.GridAdditionalSettings.EVENT_SORT_DISPERSION_MODE_CHANGE, sdChangeHandler);

        $(me._demoLayout).on(DemoLayoutBuilder.EVENT_CREATE_GRID, function() {
            me._stopLayoutAnimation();
        });

        $(me._demoLayout).on(DemoLayoutBuilder.EVENT_LOCK_CONFIGURATOR_ANIMATIONS, function() {
            me._wasAnimationActive = me._isAnimationActive;
            me._stopLayoutAnimation();
        });

        $(me._demoLayout).on(DemoLayoutBuilder.EVENT_UNLOCK_CONFIGURATOR_ANIMATIONS, function() {
            if(me._wasAnimationActive)
                me._launchLayoutAnimation();
        });
    }

    this._unbindEvents = function() {
        $(window).off(DemoLayoutBuilder.SortDispersionSettingDemonstrator.EVENT_WINDOW_RESIZE);
        $(this._gridAdditionalSettings).off(DemoLayoutBuilder.GridAdditionalSettings.EVENT_SORT_DISPERSION_MODE_CHANGE);
        $(me._gridTypeSelector).off(DemoLayoutBuilder.GridTypeSelector.EVENT_GRID_TYPE_CHANGE);
        $(me._demoLayout).off(DemoLayoutBuilder.EVENT_CREATE_GRID);
        $(me._demoLayout).off(DemoLayoutBuilder.EVENT_LOCK_CONFIGURATOR_ANIMATIONS);
        $(me._demoLayout).off(DemoLayoutBuilder.EVENT_UNLOCK_CONFIGURATOR_ANIMATIONS);
    }

    this.destruct = function() {
        me._unbindEvents();
        me._stopLayoutAnimation();
        me._$view.remove();
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.EVENT_WINDOW_RESIZE = "resize.demoLayoutBuilder.sortDispersionSettingDemonstrator";

DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_TYPES = {DEFAULT: 0, BIG: 1};
DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES = {DEFAULT: 0, FIRST_SPECIAL: 1, SECOND_SPECIAL: 2};

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype.setSortDispersionMode = function(sortDispersionMode) {
    if(sortDispersionMode != DemoLayoutBuilder.GridAdditionalSettings.SORT_DISPERSION_MODES.DISABLED &&
        sortDispersionMode != DemoLayoutBuilder.GridAdditionalSettings.SORT_DISPERSION_MODES.CUSTOM)
        throw new Error("Uknown sortDispersionMode: " + sortDispersionMode);

    this._selectedSortDispersionMode = sortDispersionMode;
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype.isDisabledSortDispersionMode = function() {
    return this._selectedSortDispersionMode == DemoLayoutBuilder.GridAdditionalSettings.SORT_DISPERSION_MODES.DISABLED;
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype.isCustomSortDispersionMode = function() {
    return this._selectedSortDispersionMode == DemoLayoutBuilder.GridAdditionalSettings.SORT_DISPERSION_MODES.CUSTOM;
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._hideAllLayoutFrames = function() {
    this._$disabledSdInsertionFrame.css("visibility", "hidden");
    this._$disabledSdTransitionFrame.css("visibility", "hidden");
    this._$customSdInsertionFrame.css("visibility", "hidden");
    this._$customSdTransitionFrame.css("visibility", "hidden");
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._showCurrentLayoutFrame = function() {
    this._$currentVisibleFrame.css("visibility", "visible");
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._showDisabledSdInsertionFrame = function() {
    this._$disabledSdInsertionFrame.css("visibility", "visible");
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._showDisabledSdTranstionFrame = function() {
    this._$disabledSdTransitionFrame.css("visibility", "visible");
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._showCustomSdInsertionFrame = function() {
    this._$customSdInsertionFrame.css("visibility", "visible");
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._showCustomSdTranstionFrame = function() {
    this._$customSdTransitionFrame.css("visibility", "visible");
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._toggleCurrentLayoutFrames = function() {
    this._hideAllLayoutFrames();
    this._showCurrentLayoutFrame(); 
    if(this.isDisabledSortDispersionMode())
    {
        if(this._$disabledSdInsertionFrame.css("visibility") == "visible")
        {
            this._$disabledSdInsertionFrame.css("visibility", "hidden");
            this._$disabledSdTransitionFrame.css("visibility", "visible");
            this._$currentVisibleFrame = this._$disabledSdTransitionFrame;
        }
        else if(this._$disabledSdTransitionFrame.css("visibility") == "visible")
        {
            this._$disabledSdTransitionFrame.css("visibility", "hidden");
            this._$disabledSdInsertionFrame.css("visibility", "visible");
            this._$currentVisibleFrame = this._$disabledSdInsertionFrame;
        }
    }
    else if(this.isCustomSortDispersionMode())
    {
        if(this._$customSdInsertionFrame.css("visibility") == "visible")
        {
            this._$customSdInsertionFrame.css("visibility", "hidden");
            this._$customSdTransitionFrame.css("visibility", "visible");
            this._$currentVisibleFrame = this._$customSdTransitionFrame;
        } 
        else if(this._$customSdTransitionFrame.css("visibility") == "visible")
        {
            this._$customSdTransitionFrame.css("visibility", "hidden");
            this._$customSdInsertionFrame.css("visibility", "visible");
            this._$currentVisibleFrame = this._$customSdInsertionFrame;
        }
    }

    this._toggleLayoutFrameTimeout = setTimeout($.proxy(this._toggleCurrentLayoutFrames, this), this._frameRenderMsInterval);
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._launchLayoutAnimation = function() {
    this._isAnimationActive = true;
    if(this._$currentVisibleFrame == null)
        this._$currentVisibleFrame = this._$disabledSdInsertionFrame;
    this._toggleLayoutFrameTimeout = setTimeout($.proxy(this._toggleCurrentLayoutFrames, this), 0);
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._stopLayoutAnimation = function() {
    if(this._toggleLayoutFrameTimeout != null)
        clearTimeout(this._toggleLayoutFrameTimeout);
    this._isAnimationActive = false;
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._removeAllRenderedAtoms = function() {
    this._$layout.find("." + this._css.atomClass).remove();
    this._$layout.find("." + this._css.bigAtomClass).remove();
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._renderAtoms = function() {
    this._itemNumber = 0;

    if(this._gridAdditionalSettings._gridSettings._isVerticalGridType())
    {
        this._renderVerticalGridDisabledSdInsertionFrameAtoms(this._$disabledSdInsertionFrame);

        this._itemNumber = 0;
        this._renderVerticalGridDisabledSdTransitionFrameAtoms(this._$disabledSdTransitionFrame);

        this._itemNumber = 0;
        this._renderVerticalGridCustomSdInsertionFrameAtoms(this._$customSdInsertionFrame);

        this._itemNumber = 0;
        this._renderVerticalGridCustomSdTransitionFrameAtoms(this._$customSdTransitionFrame);
    }
    else if(this._gridAdditionalSettings._gridSettings._isHorizontalGridType())
    {
        this._renderHorizontalGridDisabledSdInsertionFrameAtoms(this._$disabledSdInsertionFrame);

        this._itemNumber = 0;
        this._renderHorizontalGridDisabledSdTransitionFrameAtoms(this._$disabledSdTransitionFrame);

        this._itemNumber = 0;
        this._renderHorizontalGridCustomSdInsertionFrameAtoms(this._$customSdInsertionFrame);

        this._itemNumber = 0;
        this._renderHorizontalGridCustomSdTransitionFrameAtoms(this._$customSdTransitionFrame);
    }
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._createAtom = function(atomType, atomBgType, spacerWidth, spacerHeight) {
    if(atomType == DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_TYPES.DEFAULT)
    {
        var atomWidth = this._atomSize;
        var atomHeight = this._atomSize;
        var atomClass = this._css.atomClass;
    }
    else if(atomType == DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_TYPES.BIG)
    {
        var atomWidth = this._bigAtomSize + spacerWidth;
        var atomHeight = this._bigAtomSize + spacerHeight;
        var atomClass = this._css.bigAtomClass;
    }
    this._itemNumber++;

    var div = document.createElement("div");
    div.setAttribute("class", atomClass + " " + this._css.atomBorderClass);
    div.style.position = "absolute";
    div.style.width = atomWidth + "px";
    div.style.height = atomHeight + "px";
    div.style.lineHeight = atomHeight - 5 + "px";
    div.innerHTML = this._itemNumber;

    if(atomBgType == DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.DEFAULT)
        div.style.background = "rgb(210,210,210)";
    else if(atomBgType == DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.FIRST_SPECIAL)
    {
        div.setAttribute("class", div.getAttribute("class") + " gridFourthBg");
        div.style.color = "white";
    }
    else if(atomBgType == DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.SECOND_SPECIAL)
    {
        div.setAttribute("class", div.getAttribute("class") + " gridFifthBg");
        div.style.color = "white";
    }

    return div;
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._getGridAtomParams = function($layoutFrame) {
    var layoutFrameWidth = $layoutFrame.outerWidth();
    var layoutFrameHeight = $layoutFrame.outerHeight();

    var atomWidth = this._atomSize + this._atomMargin * 2;
    var atomHeight = this._atomSize + this._atomMargin * 2;

    var horizontalAtomsCount = Math.floor(layoutFrameWidth / atomWidth);
    var verticalAtomsCount = Math.floor(layoutFrameHeight / atomHeight); 

    var totalAvailableWidthPerSpacers = layoutFrameWidth - horizontalAtomsCount * this._atomSize;
    var totalAvailableHeightPerSpacers = layoutFrameHeight - verticalAtomsCount * this._atomSize;

    var spacerWidth = totalAvailableWidthPerSpacers / (horizontalAtomsCount + 1);
    var spacerHeight = totalAvailableHeightPerSpacers / (verticalAtomsCount + 1);

    return {
        horizontalAtomsCount: horizontalAtomsCount,
        verticalAtomsCount: verticalAtomsCount,
        spacerWidth: spacerWidth,
        spacerHeight: spacerHeight
    }
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._renderVerticalGridDisabledSdInsertionFrameAtoms = function($layoutFrame) {
    var atomParams = this._getGridAtomParams($layoutFrame);

    var totalItemsCount = atomParams.horizontalAtomsCount * atomParams.verticalAtomsCount;
    var interruptRenderAtItem = totalItemsCount - 4;
    var currentItem = 0;
    var interruptRender = false;

    var nextPositionTop = atomParams.spacerHeight;
    for(var j = 0; j < atomParams.verticalAtomsCount; j++)
    {
        var nextPositionLeft = atomParams.spacerWidth;
        for(var i = 0; i < atomParams.horizontalAtomsCount; i++)
        {
            if(i == atomParams.horizontalAtomsCount - 1 && j == 0)
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.FIRST_SPECIAL;
            else if(j == 1 && i == 0)
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.SECOND_SPECIAL; 
            else
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.DEFAULT;

            var atom = this._createAtom(DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_TYPES.DEFAULT, atomBgType);
            atom.setAttribute("class", atom.getAttribute("class") + " " + this._css.atomClass + "-" + j + "-" + i);
            atom.style.left = nextPositionLeft + "px";
            atom.style.top = nextPositionTop + "px";
            $layoutFrame.get(0).appendChild(atom);

            nextPositionLeft += this._atomSize + atomParams.spacerWidth;
            currentItem++;
            if(currentItem == interruptRenderAtItem) interruptRender = true;
            if(interruptRender) break;
        }

        nextPositionTop += this._atomSize + atomParams.spacerHeight;
        if(interruptRender) break;
    }
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._renderVerticalGridDisabledSdTransitionFrameAtoms = function($layoutFrame) {
    var atomParams = this._getGridAtomParams($layoutFrame);

    var totalItemsCount = atomParams.horizontalAtomsCount * atomParams.verticalAtomsCount;
    var interruptRenderAtItem = totalItemsCount - 4;
    var currentItem = 0;
    var interruptRender = false;

    var nextPositionTop = atomParams.spacerHeight;
    for(var j = 0; j < atomParams.verticalAtomsCount; j++)
    {
        var nextPositionLeft = atomParams.spacerWidth;
        for(var i = 0; i < atomParams.horizontalAtomsCount; i++)
        {
            if(j == 1 && i == 0)
            {
                var atomType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_TYPES.BIG;
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.FIRST_SPECIAL;
            }
            else if((j == 1 && i == 1) || (j == 2 && i == 0) || (j == 2 && i == 1) || (j == 0 && i == atomParams.horizontalAtomsCount - 1))
            {
                nextPositionLeft += this._atomSize + atomParams.spacerWidth;
                continue;
            }
            else if(j == 1 && i == 2)
            {
                var atomType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_TYPES.DEFAULT;
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.SECOND_SPECIAL;
            }
            else
            {
                var atomType =DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_TYPES.DEFAULT;
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.DEFAULT;
            }

            var atom = this._createAtom(atomType, atomBgType, atomParams.spacerWidth, atomParams.spacerHeight);
            atom.setAttribute("class", atom.getAttribute("class") + " " + this._css.atomClass + "-" + j + "-" + i);
            atom.style.left = nextPositionLeft + "px";
            atom.style.top = nextPositionTop + "px";
            $layoutFrame.get(0).appendChild(atom);

            nextPositionLeft += this._atomSize + atomParams.spacerWidth;
            currentItem++;
            if(currentItem == interruptRenderAtItem) interruptRender = true;
            if(interruptRender) break;
        }

        nextPositionTop += this._atomSize + atomParams.spacerHeight;
        if(interruptRender) break;
    }
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._renderVerticalGridCustomSdInsertionFrameAtoms = function($layoutFrame) {
    this._renderVerticalGridDisabledSdInsertionFrameAtoms($layoutFrame);
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._renderVerticalGridCustomSdTransitionFrameAtoms = function($layoutFrame) {
    var atomParams = this._getGridAtomParams($layoutFrame);

    var totalItemsCount = atomParams.horizontalAtomsCount * atomParams.verticalAtomsCount;
    var interruptRenderAtItem = totalItemsCount - 4;
    var currentItem = 0;
    var interruptRender = false;

    var nextPositionTop = atomParams.spacerHeight;
    var lastAtomOnFirstLinePositionLeft = null;
    for(var j = 0; j < atomParams.verticalAtomsCount; j++)
    {
        var nextPositionLeft = atomParams.spacerWidth;
        for(var i = 0; i < atomParams.horizontalAtomsCount; i++)
        {
            if(j == 0 && i == atomParams.horizontalAtomsCount - 1)
                lastAtomOnFirstLinePositionLeft = nextPositionLeft;

            if(j == 1 && i == 0)
            {
                var atomType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_TYPES.BIG;
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.FIRST_SPECIAL;
            }
            else if((j == 2 && i == 0) || (j == 2 && i == 1) || (j == 1 && i == 1) || (j == 0 && i == atomParams.horizontalAtomsCount - 1))
            {
                nextPositionLeft += this._atomSize + atomParams.spacerWidth;
                continue;
            }
            else if(j == 1 && i == 2)
            {
                var atomType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_TYPES.DEFAULT;
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.SECOND_SPECIAL;

                var atom = this._createAtom(atomType, atomBgType);
                atom.setAttribute("class", atom.getAttribute("class") + " " + this._css.atomClass + "-0-" + (atomParams.horizontalAtomsCount - 1));
                atom.style.left = lastAtomOnFirstLinePositionLeft + "px";
                atom.style.top = atomParams.spacerHeight + "px";
                $layoutFrame.get(0).appendChild(atom);

                currentItem++;
                atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.DEFAULT;
            }
            else
            {
                var atomType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_TYPES.DEFAULT;
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.DEFAULT;
            }
            
            var atom = this._createAtom(atomType, atomBgType, atomParams.spacerWidth, atomParams.spacerHeight);
            atom.setAttribute("class", atom.getAttribute("class") + " " + this._css.atomClass + "-" + j + "-" + i);
            atom.style.left = nextPositionLeft + "px";
            atom.style.top = nextPositionTop + "px";
            $layoutFrame.get(0).appendChild(atom);

            nextPositionLeft += this._atomSize + atomParams.spacerWidth;
            currentItem++;
            if(currentItem == interruptRenderAtItem) interruptRender = true;
            if(interruptRender) break;
        }

        nextPositionTop += this._atomSize + atomParams.spacerHeight;
        if(interruptRender) break;
    }
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._renderHorizontalGridDisabledSdInsertionFrameAtoms = function($layoutFrame) {
    var atomParams = this._getGridAtomParams($layoutFrame);

    var totalItemsCount = atomParams.horizontalAtomsCount * atomParams.verticalAtomsCount;
    var interruptRenderAtItem = totalItemsCount - 4;
    var currentItem = 0;
    var interruptRender = false;

    var nextPositionLeft = atomParams.spacerWidth;
    for(var i = 0; i < atomParams.horizontalAtomsCount; i++)
    {
        var nextPositionTop = atomParams.spacerHeight;
        for(var j = 0; j < atomParams.verticalAtomsCount; j++)
        {
            if(j == atomParams.verticalAtomsCount - 1 && i == atomParams.horizontalAtomsCount - 3)
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.FIRST_SPECIAL;
            else if(j == 0 && i == atomParams.horizontalAtomsCount - 2)
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.SECOND_SPECIAL;
            else
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.DEFAULT;

            var atom = this._createAtom(DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_TYPES.DEFAULT, atomBgType);
            atom.setAttribute("class", atom.getAttribute("class") + " " + this._css.atomClass + "-" + j + "-" + i);
            atom.style.left = nextPositionLeft + "px";
            atom.style.top = nextPositionTop + "px";
            $layoutFrame.get(0).appendChild(atom);

            nextPositionTop += this._atomSize + atomParams.spacerHeight;
            currentItem++;
            if(currentItem == interruptRenderAtItem) interruptRender = true;
            if(interruptRender) break;
        }

        nextPositionLeft += this._atomSize + atomParams.spacerWidth;
        if(interruptRender) break;
    }
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._renderHorizontalGridDisabledSdTransitionFrameAtoms = function($layoutFrame) {
    var atomParams = this._getGridAtomParams($layoutFrame);

    var totalItemsCount = atomParams.horizontalAtomsCount * atomParams.verticalAtomsCount;
    var interruptRenderAtItem = totalItemsCount - 4;
    var currentItem = 0;
    var interruptRender = false;

    var nextPositionLeft = atomParams.spacerWidth;
    for(var i = 0; i < atomParams.horizontalAtomsCount; i++)
    {
        var nextPositionTop = atomParams.spacerHeight;
        for(var j = 0; j < atomParams.verticalAtomsCount; j++)
        {
            if(j == 0 && i == atomParams.horizontalAtomsCount - 2)
            {
                var atomType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_TYPES.BIG;
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.FIRST_SPECIAL;
            }
            else if((j == 0 && i == atomParams.horizontalAtomsCount - 1) || (j == 1 && i == atomParams.horizontalAtomsCount - 2)
                        || (j == 1 && i == atomParams.horizontalAtomsCount - 1) 
                        || (j == atomParams.verticalAtomsCount - 1 && i == atomParams.horizontalAtomsCount - 3))
            {
                nextPositionTop += this._atomSize + atomParams.spacerHeight;
                continue;
            }
            else if(j == 2 && i == atomParams.horizontalAtomsCount - 2)
            {
                var atomType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_TYPES.DEFAULT;
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.SECOND_SPECIAL;
            }
            else
            {
                var atomType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_TYPES.DEFAULT;
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.DEFAULT;
            }

            var atom = this._createAtom(atomType, atomBgType, atomParams.spacerWidth, atomParams.spacerHeight);
            atom.setAttribute("class", atom.getAttribute("class") + " " + this._css.atomClass + "-" + j + "-" + i);
            atom.style.left = nextPositionLeft + "px";
            atom.style.top = nextPositionTop + "px";
            $layoutFrame.get(0).appendChild(atom);

            nextPositionTop += this._atomSize + atomParams.spacerHeight;
            currentItem++;
            if(currentItem == interruptRenderAtItem) interruptRender = true;
            if(interruptRender) break;
        }

        nextPositionLeft += this._atomSize + atomParams.spacerWidth;
        if(interruptRender) break;
    }
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._renderHorizontalGridCustomSdInsertionFrameAtoms = function($layoutFrame) {
    this._renderHorizontalGridDisabledSdInsertionFrameAtoms($layoutFrame);
}

DemoLayoutBuilder.SortDispersionSettingDemonstrator.prototype._renderHorizontalGridCustomSdTransitionFrameAtoms = function($layoutFrame) {
    var atomParams = this._getGridAtomParams($layoutFrame);

    var totalItemsCount = atomParams.horizontalAtomsCount * atomParams.verticalAtomsCount;
    var interruptRenderAtItem = totalItemsCount - 4;
    var currentItem = 0;
    var interruptRender = false;

    var nextPositionLeft = atomParams.spacerWidth;
    var mostBottomAtomBeforeTransitionedPositionLeft = null;
    var mostBottomAtomBeforeTransitionedPositionTop = null;
    for(var i = 0; i < atomParams.horizontalAtomsCount; i++)
    {
        var nextPositionTop = atomParams.spacerHeight;
        for(var j = 0; j < atomParams.verticalAtomsCount; j++)
        {
            if(j == atomParams.verticalAtomsCount - 1 && i == atomParams.horizontalAtomsCount - 3)
            {
                mostBottomAtomBeforeTransitionedPositionTop = nextPositionTop;
                mostBottomAtomBeforeTransitionedPositionLeft = nextPositionLeft;
            }

            if(j == 0 && i == atomParams.horizontalAtomsCount - 2)
            {
                var atomType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_TYPES.BIG;
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.FIRST_SPECIAL;
            }
            else if((j == 0 && i == atomParams.horizontalAtomsCount - 1) || (j == 1 && i == atomParams.horizontalAtomsCount - 2)
                        || (j == 1 && i == atomParams.horizontalAtomsCount - 1) 
                        || (j == atomParams.verticalAtomsCount - 1 && i == atomParams.horizontalAtomsCount - 3))
            {
                nextPositionTop += this._atomSize + atomParams.spacerHeight;
                continue;
            }
            else if(j == 2 && i == atomParams.horizontalAtomsCount - 2)
            {
                var atomType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_TYPES.DEFAULT;
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.SECOND_SPECIAL;

                var atom = this._createAtom(atomType, atomBgType);
                atom.setAttribute("class", atom.getAttribute("class") + " " + this._css.atomClass + "-2-" + (atomParams.horizontalAtomsCount - 3));
                atom.style.left = mostBottomAtomBeforeTransitionedPositionLeft + "px";
                atom.style.top = mostBottomAtomBeforeTransitionedPositionTop + "px";
                $layoutFrame.get(0).appendChild(atom);

                currentItem++;
                atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.DEFAULT;
            }
            else
            {
                var atomType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_TYPES.DEFAULT;
                var atomBgType = DemoLayoutBuilder.SortDispersionSettingDemonstrator.ATOM_BG_TYPES.DEFAULT;
            }

            var atom = this._createAtom(atomType, atomBgType, atomParams.spacerWidth, atomParams.spacerHeight);
            atom.setAttribute("class", atom.getAttribute("class") + " " + this._css.atomClass + "-" + j + "-" + i);
            atom.style.left = nextPositionLeft + "px";
            atom.style.top = nextPositionTop + "px";
            $layoutFrame.get(0).appendChild(atom);

            nextPositionTop += this._atomSize + atomParams.spacerHeight;
            currentItem++;
            if(currentItem == interruptRenderAtItem) interruptRender = true;
            if(interruptRender) break;
        }

        nextPositionLeft += this._atomSize + atomParams.spacerWidth;
        if(interruptRender) break;
    }
}