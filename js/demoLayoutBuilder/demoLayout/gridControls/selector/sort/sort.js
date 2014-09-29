DemoLayoutBuilder.DemoLayout.GridControls.Selector.Sort = function($selectorRightSide, demoLayout, sortType) {
    var me = this;

    this._$view = null;

    this._demoLayout = null;

    this._$sortDemo = null;
    this._demoAtomsCount = 10;
    this._itemBgClasses = [];
    this._itemNumber = 0;

    this._css = {
        containerClass: "sortDemo",
        atomClass: "atom atomBorder",
        atomVerticalMarginClass: "atomVerticalMargin",

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

        me._$sortDemo = me._$view;
        me._createItemBgClasses(sortType);
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

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Sort.SORT_TYPES = {
    BY_GUID: 0, BY_ITEM_COLOR: 1
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Sort.prototype._createItemBgClasses = function(sortType) {
    if(sortType == DemoLayoutBuilder.DemoLayout.GridControls.Selector.Sort.SORT_TYPES.BY_GUID)
    {
        for(var i = 0; i < this._demoAtomsCount; i++)
        {
            if(i == 0 || i == 5) this._itemBgClasses.push(this._css.atomFirstBgClass);
            if(i == 1 || i == 6) this._itemBgClasses.push(this._css.atomSecondBgClass);
            if(i == 2 || i == 7) this._itemBgClasses.push(this._css.atomThirdBgClass);
            if(i == 3 || i == 8) this._itemBgClasses.push(this._css.atomFourthBgClass);
            if(i == 4 || i == 9) this._itemBgClasses.push(this._css.atomFifthBgClass);
        }
    }
    else if(sortType == DemoLayoutBuilder.DemoLayout.GridControls.Selector.Sort.SORT_TYPES.BY_ITEM_COLOR)
    {
        for(var i = 0; i < this._demoAtomsCount; i++)
        {
            if(i == 0 || i == 1) this._itemBgClasses.push(this._css.atomFirstBgClass);
            if(i == 2 || i == 3) this._itemBgClasses.push(this._css.atomSecondBgClass);
            if(i == 4 || i == 5) this._itemBgClasses.push(this._css.atomThirdBgClass);
            if(i == 6 || i == 7) this._itemBgClasses.push(this._css.atomFourthBgClass);
            if(i == 8 || i == 9) this._itemBgClasses.push(this._css.atomFifthBgClass);
        }
    }
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Sort.prototype._createAtom = function() {
    var $atom = $("<div/>").addClass(this._css.atomClass);
    return $atom;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Sort.prototype._createAtoms = function() {
    for(var i = 0; i < this._demoAtomsCount; i++)
    {
        var $atom = this._createAtom();
        $atom.addClass(this._itemBgClasses[i]);
        if(i > 4)
            $atom.addClass(this._css.atomVerticalMarginClass);

        this._itemNumber++;
        $atom.html(this._itemNumber);

        this._$sortDemo.append($atom);
    }
}