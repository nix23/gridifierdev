DemoLayoutBuilder.IntersectionsSettingDemonstrator = function($targetEl, gridAdditionalSettings) {
    var me = this;

    this._$view = View.attach(this._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.INTERSECTIONS_SETTING_DEMONSTRATOR);

    this._gridAdditionalSettings = null;

    this._selectedIntersectionMode = null;

    this._verticalGridAtomWidth = 57;
    this._verticalGridSmallAtomHeight = 57;
    this._verticalGridBigAtomHeight = 57 + Math.floor(57 / 2) + 8;

    this._horizontalGridSmallAtomWidth = 57;
    this._horizontalGridBigAtomWidth = 57 + Math.floor(57) + 5;
    this._horizontalGridAtomHeight = 57;

    this._atomMargin = 4;

    this._$layout = null;
    this._currentGridBGIndex = -1;

    this._horizontalAtomsCount = null;
    this._verticalAtomsCount = null;

    // Per vertical grid
    this._atomWidth = null;
    this._spacerWidth = null;
    this._smallAtomHeight = null;
    this._smallAtomSpacerHeight = null;
    this._bigAtomHeight = null;
    this._bigAtomSpacerHeight = null;

    // Per horizontal grid
    this._atomHeight = null;
    this._spacerHeight = null;
    this._smallAtomWidth = null;
    this._smallAtomSpacerWidth = null;
    this._bigAtomWidth = null;
    this._bigAtomSpacerWidth = null;

    this._css = {
        layoutClass: "layout",
        atomClass: "atom",
        atomBorderClass: "atomBorder"
    }

    this._construct = function() {
        me._gridAdditionalSettings = gridAdditionalSettings;
        me._$layout = me._$view.parent().find("." + me._css.layoutClass);
        me._selectedIntersectionMode = DemoLayoutBuilder.GridAdditionalSettings.INTERSECTION_STRATEGIES.DEFAULT;

        me._renderAtoms();

        me._bindEvents();
    }

    this._bindEvents = function() {
        $(window).on(DemoLayoutBuilder.IntersectionsSettingDemonstrator.EVENT_WINDOW_RESIZE, function() {
            var resizeEventNormalizer = new ResizeEventNormalizer();
            var normalizedFunc = resizeEventNormalizer.apply(function() {
                me._removeRenderedAtoms();
                me._renderAtoms();
            });

            normalizedFunc.apply(me);
        });

        $(this._gridAdditionalSettings).on(DemoLayoutBuilder.GridAdditionalSettings.EVENT_INTERSECTION_STRATEGY_CHANGE, function(event, intersectionMode) {
            me._selectedIntersectionMode = intersectionMode;
            me._removeRenderedAtoms();
            me._renderAtoms();
        });
    }

    this._unbindEvents = function() {
        $(window).off(DemoLayoutBuilder.IntersectionsSettingDemonstrator.EVENT_WINDOW_RESIZE);
        $(this._gridAdditionalSettings).off(DemoLayoutBuilder.GridAdditionalSettings.EVENT_INTERSECTION_STRATEGY_CHANGE);
    }

    this.destruct = function() {
        me._unbindEvents();
        me._$view.remove();
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.IntersectionsSettingDemonstrator.EVENT_WINDOW_RESIZE = "resize.demoLayoutBuilder.intersectionSettingsDemonstrator";

DemoLayoutBuilder.IntersectionsSettingDemonstrator.prototype.setIntersectionMode = function(intersectionMode) {
    if(intersectionMode != DemoLayoutBuilder.GridAdditionalSettings.INTERSECTION_STRATEGIES.DEFAULT &&
        intersectionMode != DemoLayoutBuilder.GridAdditionalSettings.INTERSECTION_STRATEGIES.NO_INTERSECTIONS)
        throw new Error("Unknown intersectiond mode: " + intersectionMode);

    this._selectedIntersectionMode = intersectionMode;
}

DemoLayoutBuilder.IntersectionsSettingDemonstrator.prototype.isDefaultIntersectionMode = function() {
    return this._selectedIntersectionMode == DemoLayoutBuilder.GridAdditionalSettings.INTERSECTION_STRATEGIES.DEFAULT;
}

DemoLayoutBuilder.IntersectionsSettingDemonstrator.prototype.isNoIntersectionsMode = function() {
    return this._selectedIntersectionMode == DemoLayoutBuilder.GridAdditionalSettings.INTERSECTION_STRATEGIES.NO_INTERSECTIONS;
}

DemoLayoutBuilder.IntersectionsSettingDemonstrator.prototype._renderAtoms = function() {
    this._currentGridBGIndex = 0;

    if(this._gridAdditionalSettings._gridSettings._isVerticalGridType())
    {
        if(this.isDefaultIntersectionMode())
            this._renderVerticalGridDefaultIntersectionAtoms();
        else if(this.isNoIntersectionsMode())
            this._renderVerticalGridNoIntersectionAtoms();

        this._addVerticalGridItemIds();
    }
    else if(this._gridAdditionalSettings._gridSettings._isHorizontalGridType())
    {
        if(this.isDefaultIntersectionMode())
            this._renderHorizontalGridDefaultIntersectionAtoms();
        else if(this.isNoIntersectionsMode())
            this._renderHorizontalGridNoIntersectionAtoms();

        this._addHorizontalGridItemIds();
    }
}

DemoLayoutBuilder.IntersectionsSettingDemonstrator.prototype._removeRenderedAtoms = function() {
    this._$layout.find("." + this._css.atomClass).remove();
}

DemoLayoutBuilder.IntersectionsSettingDemonstrator.prototype._createAtom = function(atomWidth, atomHeight) {
    var gridBgs = ["gridFirstBg", "gridSecondBg", "gridThirdBg", "gridFourthBg", "gridFifthBg"];
    this._currentGridBGIndex++;
    if(this._currentGridBGIndex == gridBgs.length)
        this._currentGridBGIndex = 0;

    var div = document.createElement("div");
    div.setAttribute("class", this._css.atomClass + " " + this._css.atomBorderClass + " " + gridBgs[this._currentGridBGIndex]);
    div.style.position = "absolute";
    div.style.width = atomWidth + "px";
    div.style.height = atomHeight + "px";
    div.style.lineHeight = atomHeight - 5 + "px";

    return div;
}

DemoLayoutBuilder.IntersectionsSettingDemonstrator.prototype._addVerticalGridItemIds = function() {
    var $atoms = this._$layout.find("." + this._css.atomClass);
    $atoms.sort(function(atomA, atomB) {
        $atomA = $(atomA);
        $atomB = $(atomB);
        if(parseFloat($atomA.css("left")) <= parseFloat($atomB.css("left")))
        {
            if(parseFloat($atomA.css("top")) <= parseFloat($atomB.css("top")))
                return -1;
            else
                return 1;
        }
        else 
        {
            if(parseFloat($atomA.css("top")) < parseFloat($atomB.css("top")))
                return -1;
            else
                return 1;
        }
    });

    var itemId = 1;
    $.each($atoms, function() {
        $(this).html(itemId);
        itemId++;
    });
}

DemoLayoutBuilder.IntersectionsSettingDemonstrator.prototype._calculateVerticalGridAtomsWithSpacers = function() {
    var layoutWidth = this._$layout.outerWidth();
    var layoutHeight = this._$layout.outerHeight();

    var atomWidth = this._verticalGridAtomWidth + this._atomMargin * 2;
    var horizontalAtomsCount = Math.floor(layoutWidth / atomWidth);
    var totalWidthAvailablePerSpacers = layoutWidth - horizontalAtomsCount * this._verticalGridAtomWidth;
    var spacerWidth = totalWidthAvailablePerSpacers / (horizontalAtomsCount + 1);

    var smallAtomHeight = this._verticalGridSmallAtomHeight + this._atomMargin * 2;
    var smallAtomVerticalAtomsCount = Math.floor(layoutHeight / smallAtomHeight);
    var totalHeightAvailablePerSmallAtomSpacers = layoutHeight - smallAtomVerticalAtomsCount * this._verticalGridSmallAtomHeight;
    var smallAtomSpacerHeight = totalHeightAvailablePerSmallAtomSpacers / (smallAtomVerticalAtomsCount + 1);

    var bigAtomHeight = this._verticalGridBigAtomHeight + this._atomMargin * 2;
    var bigAtomVerticalAtomsCount = Math.floor(layoutHeight / bigAtomHeight);
    var totalHeightAvailablePerBigAtomSpacers = layoutHeight - bigAtomVerticalAtomsCount * this._verticalGridBigAtomHeight;
    var bigAtomSpacerHeight = totalHeightAvailablePerBigAtomSpacers / (bigAtomVerticalAtomsCount + 1);
    
    this._horizontalAtomsCount = horizontalAtomsCount;
    this._verticalAtomsCount = [];

    this._atomWidth = atomWidth;
    this._spacerWidth = spacerWidth;
    this._smallAtomHeight = smallAtomHeight;
    this._smallAtomSpacerHeight = smallAtomSpacerHeight;
    this._bigAtomHeight = bigAtomHeight;
    this._bigAtomSpacerHeight = bigAtomSpacerHeight;
}

DemoLayoutBuilder.IntersectionsSettingDemonstrator.prototype._renderVerticalGridDefaultIntersectionAtoms = function() {
    this._calculateVerticalGridAtomsWithSpacers();

    var me = this;
    var createAtom = function(atomWidth, atomHeight, leftPos, topPos, row, col) {
        var atom = me._createAtom(atomWidth, atomHeight);
        atom.setAttribute("class", atom.getAttribute("class") + " " + me._css.atomClass + "-" + row + "-" + col);
        atom.style.left = leftPos + "px";
        atom.style.top = topPos + "px";
        me._$layout.get(0).appendChild(atom);
    }

    var nextPositionLeft = this._spacerWidth;
    for(var i = 0; i < this._horizontalAtomsCount; i++)
    {
        var nextPositionTop = this._smallAtomSpacerHeight;
        if(i % 2 == 0)
        {
            createAtom(this._verticalGridAtomWidth, this._verticalGridBigAtomHeight, nextPositionLeft, nextPositionTop, 0, i);
            nextPositionTop += this._verticalGridBigAtomHeight + this._smallAtomSpacerHeight;
            createAtom(this._verticalGridAtomWidth, this._verticalGridBigAtomHeight, nextPositionLeft, nextPositionTop, 1, i);
            this._verticalAtomsCount.push(2);
        }
        else
        {
            createAtom(this._verticalGridAtomWidth, this._verticalGridSmallAtomHeight, nextPositionLeft, nextPositionTop, 0, i);
            nextPositionTop += this._verticalGridSmallAtomHeight + this._smallAtomSpacerHeight;
            createAtom(this._verticalGridAtomWidth, this._verticalGridBigAtomHeight, nextPositionLeft, nextPositionTop, 1, i);
            this._verticalAtomsCount.push(2);
        }

        nextPositionLeft += this._verticalGridAtomWidth + this._spacerWidth;
    }
}

DemoLayoutBuilder.IntersectionsSettingDemonstrator.prototype._renderVerticalGridNoIntersectionAtoms = function() {
    this._calculateVerticalGridAtomsWithSpacers();

    var me = this;
    var createAtom = function(atomWidth, atomHeight, leftPos, topPos, row, col) {
        var atom = me._createAtom(atomWidth, atomHeight);
        atom.setAttribute("class", atom.getAttribute("class") + " " + me._css.atomClass + "-" + row + "-" + col);
        atom.style.left = leftPos + "px";
        atom.style.top = topPos + "px";
        me._$layout.get(0).appendChild(atom);
    }

    var nextPositionLeft = this._spacerWidth;
    for(var i = 0; i < this._horizontalAtomsCount; i++)
    {
        var nextPositionTop = this._smallAtomSpacerHeight;

        var atomHeight = (i % 2 == 0) ? this._verticalGridBigAtomHeight : this._verticalGridSmallAtomHeight;
        createAtom(this._verticalGridAtomWidth, atomHeight, nextPositionLeft, nextPositionTop, 0, i);
        nextPositionTop += this._verticalGridBigAtomHeight + this._smallAtomSpacerHeight;

        createAtom(this._verticalGridAtomWidth, this._verticalGridBigAtomHeight, nextPositionLeft, nextPositionTop, 1, i);
        this._verticalAtomsCount.push(2);

        nextPositionLeft += this._verticalGridAtomWidth + this._spacerWidth;
    }
}

DemoLayoutBuilder.IntersectionsSettingDemonstrator.prototype._addHorizontalGridItemIds = function() {
    var $atoms = this._$layout.find("." + this._css.atomClass);
    $atoms.sort(function(atomA, atomB) {
        $atomA = $(atomA);
        $atomB = $(atomB);
        if(parseFloat($atomA.css("top")) <= parseFloat($atomB.css("top")))
        {
            if(parseFloat($atomA.css("left")) <= parseFloat($atomB.css("left")))
                return -1;
            else
                return 1;
        }
        else 
        {
            if(parseFloat($atomA.css("left")) < parseFloat($atomB.css("left")))
                return -1;
            else
                return 1;
        }
    });

    var itemId = 1;
    $.each($atoms, function() {
        $(this).html(itemId);
        itemId++;
    });
}

DemoLayoutBuilder.IntersectionsSettingDemonstrator.prototype._calculateHorizontalGridAtomsWithSpacers = function() {
    var layoutWidth = this._$layout.outerWidth();
    var layoutHeight = this._$layout.outerHeight();

    var customSmallAtomMargin = 5;

    var atomHeight = this._horizontalGridAtomHeight + this._atomMargin * 2;
    var verticalAtomsCount = Math.floor(layoutHeight / atomHeight);
    var totalHeightAvailablePerSpacers = layoutHeight - verticalAtomsCount * this._horizontalGridAtomHeight;
    var spacerHeight = totalHeightAvailablePerSpacers / (verticalAtomsCount + 1);

    var smallAtomWidth = this._horizontalGridSmallAtomWidth + customSmallAtomMargin;
    var smallAtomHorizontalAtomsCount = Math.floor(layoutWidth / smallAtomWidth);
    var totalWidthAvailablePerSmallAtomSpacers = layoutWidth - smallAtomHorizontalAtomsCount * this._horizontalGridSmallAtomWidth;
    var smallAtomSpacerWidth = totalWidthAvailablePerSmallAtomSpacers / (smallAtomHorizontalAtomsCount + 1);

    var bigAtomWidth = this._horizontalGridBigAtomWidth + customSmallAtomMargin;
    var bigAtomHorizontalAtomsCount = Math.floor(layoutWidth / bigAtomWidth);
    var totalWidthAvailablePerBigAtomSpacers = layoutWidth - bigAtomHorizontalAtomsCount * this._horizontalGridBigAtomWidth;
    var bigAtomSpacerWidth = totalWidthAvailablePerBigAtomSpacers / (bigAtomHorizontalAtomsCount + 1);
    
    this._horizontalAtomsCount = [bigAtomHorizontalAtomsCount, smallAtomHorizontalAtomsCount, bigAtomHorizontalAtomsCount];
    this._verticalAtomsCount = verticalAtomsCount;

    this._atomHeight = atomHeight;
    this._spacerHeight = spacerHeight;
    this._smallAtomWidth = smallAtomWidth;
    this._smallAtomSpacerWidth = customSmallAtomMargin;
    this._bigAtomWidth = bigAtomWidth;
    this._bigAtomSpacerWidth = bigAtomSpacerWidth;
}

DemoLayoutBuilder.IntersectionsSettingDemonstrator.prototype._renderHorizontalGridDefaultIntersectionAtoms = function() {
    this._calculateHorizontalGridAtomsWithSpacers();

    var me = this;
    var createAtom = function(atomWidth, atomHeight, leftPos, topPos, row, col) {
        var atom = me._createAtom(atomWidth, atomHeight);
        atom.setAttribute("class", atom.getAttribute("class") + " " + me._css.atomClass + "-" + row + "-" + col);
        atom.style.left = leftPos + "px";
        atom.style.top = topPos + "px";
        me._$layout.get(0).appendChild(atom);
    }

    var nextPositionTop = this._spacerHeight;
    for(var row = 0; row < this._verticalAtomsCount; row++)
    {
        var nextPositionLeft = this._smallAtomSpacerWidth;
        for(var col = 0; col < this._horizontalAtomsCount[row]; col++)
        {
            if(row == 0 || row == 2)
            {
                createAtom(this._horizontalGridBigAtomWidth, this._horizontalGridAtomHeight, nextPositionLeft, nextPositionTop, row, col);
                nextPositionLeft += this._horizontalGridBigAtomWidth + this._smallAtomSpacerWidth;
            }
            else
            {
                if(col == this._horizontalAtomsCount[row] - 1)
                {
                    if(col % 2 == 0)
                    {
                        continue;
                    }
                }

                createAtom(this._horizontalGridSmallAtomWidth, this._horizontalGridAtomHeight, nextPositionLeft, nextPositionTop, row, col);
                nextPositionLeft += this._horizontalGridSmallAtomWidth + this._smallAtomSpacerWidth;
            }
        }

        nextPositionTop += this._horizontalGridAtomHeight + this._spacerHeight;
    }
}

DemoLayoutBuilder.IntersectionsSettingDemonstrator.prototype._renderHorizontalGridNoIntersectionAtoms = function() {
    this._calculateHorizontalGridAtomsWithSpacers();

    var me = this;
    var createAtom = function(atomWidth, atomHeight, leftPos, topPos, row, col) {
        var atom = me._createAtom(atomWidth, atomHeight);
        atom.setAttribute("class", atom.getAttribute("class") + " " + me._css.atomClass + "-" + row + "-" + col);
        atom.style.left = leftPos + "px";
        atom.style.top = topPos + "px";
        me._$layout.get(0).appendChild(atom);
    }

    var nextPositionLeft = this._smallAtomSpacerWidth;
    var item = 0;
    for(var col = 0; col < this._horizontalAtomsCount[0]; col++)
    {
        var nextPositionTop = this._spacerHeight;
        for(var row = 0; row < this._verticalAtomsCount; row++)
        {
            if(item % 2 == 0)
                createAtom(this._horizontalGridBigAtomWidth, this._horizontalGridAtomHeight, nextPositionLeft, nextPositionTop, row, col);
            else
                createAtom(this._horizontalGridSmallAtomWidth, this._horizontalGridAtomHeight, nextPositionLeft, nextPositionTop, row, col);

            nextPositionTop += this._horizontalGridAtomHeight + this._spacerHeight;
            item++;
        }

        nextPositionLeft += this._horizontalGridBigAtomWidth + this._smallAtomSpacerWidth;
    }
}