DemoLayoutBuilder.DemoLayout.GridControls.Selector.BatchSize.RightSide = function($selectorRightSide, demoLayout, eventsUID) {
    var me = this;

    this._$view = null;
    this._eventsUID = null;

    this._demoLayout = null;

    this._$batchSizeDemo = null;
    this._currentBgClass = 0;

    this._css = {
        containerClass: "batchSizeDemo",
        atomClass: "atom",
        atomMarginTop: "atomMarginTop",

        batchSizeOneAtomClass: "batchSizeOneAtom",
        batchSizeTwoAtomsAtomClass: "batchSizeTwoAtomsAtom",
        batchSizeFromThreeTillFifteenClass: "batchSizeFromThreeTillFifteenAtom",
        batchSizeAfterFifteenAtomClass: "batchSizeAfterFifteenAtom",

        verticalAtomClass: "atomBorder gridFifthBg",
        horizontalAtomClass: "atomBorder gridFourthBg",

        firstBgClass: "gridFirstBg",
        secondBgClass: "gridSecondBg",
        thirdBgClass: "gridThirdBg",
        fourthBgClass: "gridFourthBg",
        fifthBgClass: "gridFifthBg"
    }

    this._construct = function() {
        me._eventsUID = eventsUID;
        me._demoLayout = demoLayout;

        me._$view = $("<div/>").addClass(me._css.containerClass);
        $selectorRightSide.append(me._$view);

        me._$batchSizeDemo = me._$view;

        me._bindEvents();
    }

    this._bindEvents = function() {
        var batchSizeChangeEvent = DemoLayoutBuilder.DemoLayout.GridControls.Selector.BatchSize.LeftSide.EVENT_BATCH_SIZE_CHANGE;
        $(window).on(batchSizeChangeEvent, function(event, selectorEventsUID, batchSize) {
            if(selectorEventsUID != me._eventsUID)
                return;

            me._createAtoms(batchSize);
        });
    }

    this._unbindEvents = function() {
        var batchSizeChangeEvent = DemoLayoutBuilder.DemoLayout.GridControls.Selector.BatchSize.LeftSide.EVENT_BATCH_SIZE_CHANGE;
        $(window).off(batchSizeChangeEvent);
    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.BatchSize.RightSide.prototype._getNextBgClass = function() {
    this._currentBgClass++;
    if(this._currentBgClass == 6)
        this._currentBgClass = 1;

    if(this._currentBgClass == 1) 
        var bgClass = this._css.firstBgClass;
    else if(this._currentBgClass == 2)
        var bgClass = this._css.secondBgClass;
    else if(this._currentBgClass == 3)
        var bgClass = this._css.thirdBgClass;
    else if(this._currentBgClass == 4)
        var bgClass = this._css.fourthBgClass;
    else if(this._currentBgClass == 5)
        var bgClass = this._css.fifthBgClass;

    return bgClass;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.BatchSize.RightSide.prototype._createAtom = function() {
    var $atom = $("<div/>").addClass(this._css.atomClass);
    $atom.addClass(this._getNextBgClass()); 
    $atom.css("visibility", "hidden");
    $atom.html("G");

    return $atom;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.BatchSize.RightSide.prototype._createAtoms = function(batchSize) {
    this._$batchSizeDemo.html("");
    if(this._demoLayout.isVerticalGrid())
        this._currentBgClass = 4;
    else if(this._demoLayout.isHorizontalGrid())
        this._currentBgClass = 3;

    if(batchSize == 1)
    {
        var $atom = this._createAtom();
        $atom.addClass(this._css.batchSizeOneAtomClass);
        this._$batchSizeDemo.append($atom);
    }
    else if(batchSize == 2)
    {
        for(var i = 0; i <= 1; i++)
        {
            var $atom = this._createAtom();
            $atom.addClass(this._css.batchSizeTwoAtomsAtomClass);
            this._$batchSizeDemo.append($atom);
        }
    }
    else if(batchSize == 3 || batchSize == 5 || batchSize == 10 || batchSize == 15)
    {
        for(var i = 0; i < batchSize; i++)
        {
            var $atom = this._createAtom();
            $atom.addClass(this._css.batchSizeFromThreeTillFifteenClass);
            this._$batchSizeDemo.append($atom);

            if(i > 4)
                $atom.addClass(this._css.atomMarginTop);
        }
    }
    else if(batchSize > 15)
    {
        for(var i = 0; i < batchSize; i++)
        {
            var $atom = this._createAtom();
            $atom.addClass(this._css.batchSizeAfterFifteenAtomClass);
            this._$batchSizeDemo.append($atom);

            if(i > 9)
                $atom.addClass(this._css.atomMarginTop);
        }
    }

    this._renderAtoms();
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.BatchSize.RightSide.prototype._renderAtoms = function() {
    if(browserDetector.isIe8())
    {
        this._$view.find("." + this._css.atomClass).css("visibility", "visible");
        return;
    }

    var scaleTimeout = 600;
    $.each($("." + this._css.atomClass), function() {
        var $atom = $(this);
        $(this).transition({scale: 0}, 0, function() {
            $atom.css("visibility", "visible");
            $atom.transition({scale: 1}, scaleTimeout, function() {});
        });
    });
}