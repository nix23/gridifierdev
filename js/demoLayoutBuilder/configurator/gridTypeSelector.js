DemoLayoutBuilder.GridTypeSelector = function($targetEl) {
    var me = this;

    this._$view = View.attach(this._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.GRID_TYPE_SELECTOR);
    
    this._$verticalGridTypeSelector = null;
    this._$horizontalGridTypeSelector = null;
    this._currentSelectedGridType = null;

    this._$verticalGridImage = null;
    this._$horizontalGridImage = null;

    this._atomSize = 30;
    this._atomMargin = 5;

    this._css = {
        verticalGridTypeSelectorClass: "verticalGridTypeSelector",
        horizontalGridTypeSelectorClass: "horizontalGridTypeSelector",
        selectedHorizontalGridTypeSelectorClass: "gridFourthBg",
        selectedVerticalGridTypeSelectorClass: "gridFifthBg",

        headingClass: "heading",
        headingLabelClass: "label",
        headingSublabelClass: "sublabel",
        selectedHeadingTextClass: "selectedHeadingText",

        gridImageClass: "gridImage",
        verticalGridImageClass: "verticalGridImage",
        horizontalGridImageClass: "horizontalGridImage",
        selectedGridImageClass: "selectedGridImage",

        atomClass: "atom",
        selectedHorizontalGridAtomClass: "selectedAtom gridFourthColor",
        selectedVerticalGridAtomClass: "selectedAtom gridFifthColor"
    }

    this._construct = function() {
        me._$verticalGridTypeSelector = me._$view.parent().find("." + this._css.verticalGridTypeSelectorClass);
        me._$horizontalGridTypeSelector = me._$view.parent().find("." + this._css.horizontalGridTypeSelectorClass);

        me._$verticalGridImage = me._$view.find("." + this._css.verticalGridImageClass);
        me._$horizontalGridImage = me._$view.find("." + this._css.horizontalGridImageClass);

        me._renderVerticalGridImage();
        me._renderHorizontalGridImage();

        me._selectVerticalGridType();

        me._bindEvents();
    }

    this._bindEvents = function() {
        $(window).on(DemoLayoutBuilder.GridTypeSelector.EVENT_WINDOW_RESIZE, function() { 
            var resizeEventNormalizer = new ResizeEventNormalizer();
            var normalizedFunc = resizeEventNormalizer.apply(function() {
                me._renderVerticalGridImage();
                me._renderHorizontalGridImage();

                // Updating atoms selected styles, because they were recreated
                if(me.isVerticalGridTypeSelected())
                    me._setSelectedCss(me._$verticalGridTypeSelector);
                else if(me.isHorizontalGridTypeSelected())
                    me._setSelectedCss(me._$horizontalGridTypeSelector);
            });
            
            normalizedFunc.apply(me); 
        });

        me._$verticalGridTypeSelector.on("mouseenter", function() {
            if(me.isVerticalGridTypeSelected())
                return;

            me._setSelectedCss(me._$verticalGridTypeSelector);
        });

        me._$verticalGridTypeSelector.on("mouseleave", function() {
            if(me.isVerticalGridTypeSelected())
                return;

            me._unsetSelectedCss(me._$verticalGridTypeSelector);
        });

        me._$verticalGridTypeSelector.on("click", function() {
            if(me.isVerticalGridTypeSelected())
                return;

            me._unsetSelectedCss(me._$horizontalGridTypeSelector);
            me._selectVerticalGridType();
        });

        me._$horizontalGridTypeSelector.on("mouseenter", function() {
            if(me.isHorizontalGridTypeSelected())
                return;

            me._setSelectedCss(me._$horizontalGridTypeSelector);
        });

        me._$horizontalGridTypeSelector.on("mouseleave", function() {
            if(me.isHorizontalGridTypeSelected())
                return;

            me._unsetSelectedCss(me._$horizontalGridTypeSelector);
        });

        me._$horizontalGridTypeSelector.on("click", function() {
            if(me.isHorizontalGridTypeSelected())
                return;

            me._unsetSelectedCss(me._$verticalGridTypeSelector);
            me._selectHorizontalGridType();
        });
    }

    this._unbindEvents = function() {
        $(window).off(DemoLayoutBuilder.GridTypeSelector.EVENT_WINDOW_RESIZE);
    }

    this.destruct = function() {
        me._$view.remove();
        me._unbindEvents();
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.GridTypeSelector.SELECTOR_TYPES = {VERTICAL_GRID: 0, HORIZONTAL_GRID: 1};
DemoLayoutBuilder.GridTypeSelector.EVENT_WINDOW_RESIZE = "resize.demoLayoutBuilder.gridTypeSelector";
DemoLayoutBuilder.GridTypeSelector.EVENT_GRID_TYPE_CHANGE = "demoLayoutBuilder.gridTypeSelector.gridTypeChange";

DemoLayoutBuilder.GridTypeSelector.prototype.isVerticalGridTypeSelected = function() {
    return (this._currentSelectedGridType == DemoLayoutBuilder.GridTypeSelector.SELECTOR_TYPES.VERTICAL_GRID);
}

DemoLayoutBuilder.GridTypeSelector.prototype.isHorizontalGridTypeSelected = function() {
    return (this._currentSelectedGridType == DemoLayoutBuilder.GridTypeSelector.SELECTOR_TYPES.HORIZONTAL_GRID);
}

DemoLayoutBuilder.GridTypeSelector.prototype._isHorizontalGridTypeSelector = function($gridTypeSelector) {
    return $gridTypeSelector.hasClass(this._css.horizontalGridTypeSelectorClass);
}

DemoLayoutBuilder.GridTypeSelector.prototype._isVerticalGridTypeSelector = function($gridTypeSelector) {
    return $gridTypeSelector.hasClass(this._css.verticalGridTypeSelectorClass);
}

DemoLayoutBuilder.GridTypeSelector.prototype._renderVerticalGridImage = function() {
    var borderSize = 4;

    var width = this._$verticalGridImage.outerWidth() - borderSize;
    var height = this._$verticalGridImage.outerHeight();

    this._removeRenderedAtoms(this._$verticalGridImage);
    var atomsData = this._renderAtoms(this._$verticalGridImage, width, height);

    var atomNumber = 0;
    for(var i = 0; i < atomsData.verticalAtomsCount; i++)
    {
        for(var j = 0; j < atomsData.horizontalAtomsCount; j++)
        {
            atomNumber++;
            this._$verticalGridImage.find("." + this._css.atomClass + "-" + j + "-" + i).text(atomNumber);
        }
    }
}

DemoLayoutBuilder.GridTypeSelector.prototype._renderHorizontalGridImage = function() {
    var borderSize = 4;

    var width = this._$horizontalGridImage.outerWidth();
    var height = this._$horizontalGridImage.outerHeight() - borderSize;

    this._removeRenderedAtoms(this._$horizontalGridImage);
    var atomsData = this._renderAtoms(this._$horizontalGridImage, width, height);

    var atomNumber = 0;
    for(var i = 0; i < atomsData.horizontalAtomsCount; i++)
    {
        for(var j = 0; j < atomsData.verticalAtomsCount; j++)
        {
            atomNumber++;
            this._$horizontalGridImage.find("." + this._css.atomClass + "-" + i + "-" + j).text(atomNumber);
        }
    }
}

DemoLayoutBuilder.GridTypeSelector.prototype._createAtom = function() {
    var borderSize = 4;
    var div = document.createElement("div");
    div.setAttribute("class", this._css.atomClass);
    div.style.position = "absolute";
    div.style.width = this._atomSize + "px";
    div.style.height = this._atomSize + "px";
    div.style.lineHeight = (this._atomSize - borderSize) + "px";

    return div;
}

DemoLayoutBuilder.GridTypeSelector.prototype._removeRenderedAtoms = function($gridImage) {
    $.each($gridImage.find("." + this._css.atomClass), function() {
        $(this).remove();
    });
}

DemoLayoutBuilder.GridTypeSelector.prototype._renderAtoms = function($gridImage, wrapperWidth, wrapperHeight) {
    var atomWidth = this._atomSize + this._atomMargin * 2;
    var atomHeight = this._atomSize + this._atomMargin * 2;

    var horizontalAtomsCount = Math.floor(wrapperWidth / atomWidth);
    var verticalAtomsCount = Math.floor(wrapperHeight / atomHeight);

    var totalAvailableWidthPerSpacers = wrapperWidth - horizontalAtomsCount * this._atomSize;
    var totalAvailableHeightPerSpacers = wrapperHeight - verticalAtomsCount * this._atomSize;

    var spacerWidth = totalAvailableWidthPerSpacers / (horizontalAtomsCount + 1);
    var spacerHeight = totalAvailableHeightPerSpacers / (verticalAtomsCount + 1);

    var nextPositionLeft = spacerWidth;
    for(var i = 0; i < horizontalAtomsCount; i++)
    {
        var nextPositionTop = spacerHeight;
        for(var j = 0; j < verticalAtomsCount; j++)
        {
            var atom = this._createAtom();
            atom.setAttribute("class", atom.getAttribute("class") + " " + this._css.atomClass + "-" + i + "-" + j);
            atom.style.left = nextPositionLeft + "px";
            atom.style.top = nextPositionTop + "px";
            $gridImage.get(0).appendChild(atom);

            nextPositionTop += this._atomSize + spacerHeight;
        }

        nextPositionLeft += this._atomSize + spacerWidth;
    }

    return {horizontalAtomsCount: horizontalAtomsCount, verticalAtomsCount: verticalAtomsCount};
}

DemoLayoutBuilder.GridTypeSelector.prototype._selectVerticalGridType = function() {
    this._currentSelectedGridType = DemoLayoutBuilder.GridTypeSelector.SELECTOR_TYPES.VERTICAL_GRID;
    this._setSelectedCss(this._$verticalGridTypeSelector);

    var me = this;
    $(this).trigger(DemoLayoutBuilder.GridTypeSelector.EVENT_GRID_TYPE_CHANGE, [
        this._currentSelectedGridType,
        function() { return me.isVerticalGridTypeSelected(); },
        function() { return me.isHorizontalGridTypeSelected(); }
    ]);
}

DemoLayoutBuilder.GridTypeSelector.prototype._selectHorizontalGridType = function() {
    this._currentSelectedGridType = DemoLayoutBuilder.GridTypeSelector.SELECTOR_TYPES.HORIZONTAL_GRID;
    this._setSelectedCss(this._$horizontalGridTypeSelector);

    var me = this;
    $(this).trigger(DemoLayoutBuilder.GridTypeSelector.EVENT_GRID_TYPE_CHANGE, [
        this._currentSelectedGridType,
        function() { return me.isVerticalGridTypeSelected(); },
        function() { return me.isHorizontalGridTypeSelected(); }
    ]);
}

DemoLayoutBuilder.GridTypeSelector.prototype._mutateSelectedCss = function($gridTypeSelector, applyMutator) {
    if(this._isVerticalGridTypeSelector($gridTypeSelector)) {
        var selectedGridTypeSelectorClass = this._css.selectedVerticalGridTypeSelectorClass;
        var selectedAtomClass = this._css.selectedVerticalGridAtomClass;
    }
    else {
        var selectedGridTypeSelectorClass = this._css.selectedHorizontalGridTypeSelectorClass;
        var selectedAtomClass = this._css.selectedHorizontalGridAtomClass;
    }

    applyMutator($gridTypeSelector, selectedGridTypeSelectorClass);

    var headingLabelSelectorPath = "." + this._css.headingClass + " ." + this._css.headingLabelClass;
    var headingSublabelSelectorPath = "." + this._css.headingClass + " ." + this._css.headingSublabelClass;

    $headingLabel = $gridTypeSelector.find(headingLabelSelectorPath);
    $headingSublabel = $gridTypeSelector.find(headingSublabelSelectorPath);

    applyMutator($headingLabel, this._css.selectedHeadingTextClass);
    applyMutator($headingSublabel, this._css.selectedHeadingTextClass);

    applyMutator($gridTypeSelector.find("." + this._css.gridImageClass), this._css.selectedGridImageClass);
    applyMutator($gridTypeSelector.find("." + this._css.atomClass), selectedAtomClass);
}

DemoLayoutBuilder.GridTypeSelector.prototype._setSelectedCssMutator = function($targetEl, className) {
    $targetEl.addClass(className);
}

DemoLayoutBuilder.GridTypeSelector.prototype._unsetSelectedCssMutator = function($targetEl, className) {
    $targetEl.removeClass(className);
}

DemoLayoutBuilder.GridTypeSelector.prototype._setSelectedCss = function($gridTypeSelector) {
    this._mutateSelectedCss($gridTypeSelector, this._setSelectedCssMutator);
}

DemoLayoutBuilder.GridTypeSelector.prototype._unsetSelectedCss = function($gridTypeSelector) {
    this._mutateSelectedCss($gridTypeSelector, this._unsetSelectedCssMutator);
}