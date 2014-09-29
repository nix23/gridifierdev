DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter = function($selectorRightSide, demoLayout, itemBgColorType) {
    var me = this;

    this._$view = null;
    this._eventsUID = null;

    this._demoLayout = null;

    this._$filterDemo = null;
    this._demoAtomsCount = 5;
    this._itemBgClasses = [];

    this._css = {
        containerClass: "filterDemo",
        atomClass: "atom atomBorder",

        atomFirstBgClass: "gridFirstBg",
        atomSecondBgClass: "gridSecondBg",
        atomThirdBgClass: "gridFourthBg",
        atomFourthBgClass: "gridThirdBg",
        atomFifthBgClass: "gridFifthBg"
    }

    this._construct = function() {
        me._demoLayout = demoLayout;

        me._$view = $("<div/>").addClass(me._css.containerClass);
        $selectorRightSide.append(me._$view);

        me._$filterDemo = me._$view;
        me._createItemBgClasses(itemBgColorType);
        me._createAtoms();

        me._bindEvents();
    }

    this._bindEvents = function() {
    }

    this._unbindEvents = function() {
    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter.prototype._createItemBgClasses = function(itemBgColorType) {
    var me = this;
    var createAllWithSameColor = function(itemBgClass) {
        for(var i = 0; i < me._demoAtomsCount; i++)
            me._itemBgClasses.push(itemBgClass);
    }

    if(itemBgColorType == DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter.ITEM_BG_COLOR_TYPES.ALL)
    {
        this._itemBgClasses.push(this._css.atomFirstBgClass);
        this._itemBgClasses.push(this._css.atomSecondBgClass);
        this._itemBgClasses.push(this._css.atomThirdBgClass);
        this._itemBgClasses.push(this._css.atomFourthBgClass);
        this._itemBgClasses.push(this._css.atomFifthBgClass);
    }
    else if(itemBgColorType == DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter.ITEM_BG_COLOR_TYPES.FIRST)
        createAllWithSameColor(this._css.atomFirstBgClass);
    else if(itemBgColorType == DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter.ITEM_BG_COLOR_TYPES.SECOND)
        createAllWithSameColor(this._css.atomSecondBgClass);
    else if(itemBgColorType == DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter.ITEM_BG_COLOR_TYPES.THIRD)
        createAllWithSameColor(this._css.atomThirdBgClass);
    else if(itemBgColorType == DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter.ITEM_BG_COLOR_TYPES.FOURTH)
        createAllWithSameColor(this._css.atomFourthBgClass);
    else if(itemBgColorType == DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter.ITEM_BG_COLOR_TYPES.FIFTH)
        createAllWithSameColor(this._css.atomFifthBgClass);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter.prototype._createAtom = function() {
    var $atom = $("<div/>").addClass(this._css.atomClass);
    $atom.html("G");

    return $atom;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter.prototype._createAtoms = function() {
    for(var i = 0; i < this._demoAtomsCount; i++)
    {
        var $atom = this._createAtom();
        $atom.addClass(this._itemBgClasses[i]);
        this._$filterDemo.append($atom);
    }
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter.ITEM_BG_COLOR_TYPES = {
    ALL: 0, FIRST: 1, SECOND: 2, THIRD: 3, FOURTH: 4, FIFTH: 5
}