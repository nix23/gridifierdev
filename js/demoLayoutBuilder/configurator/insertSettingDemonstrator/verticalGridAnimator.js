DemoLayoutBuilder.InsertSettingDemonstrator.VerticalGridAnimator = function(insertSettingDemonstrator) {
    var me = this;

    this._insertSettingDemonstrator = null;

    this._renderedAtomsCount = 0;
    this._allFrameAtomsRendered = false;
    this._atomNumber = 0;
    this._reverseAtomNumbers = false;
    this._generateNextAtomNumberFunction = null;

    this._construct = function() {
        me._insertSettingDemonstrator = insertSettingDemonstrator;

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

DemoLayoutBuilder.InsertSettingDemonstrator.VerticalGridAnimator.prototype._initFrame = function() {
    var me = this;

    this._renderedAtomsCount = 0;
    this._allFrameAtomsRendered = false;

    if(this._reverseAtomNumbers)
    {
        this._atomNumber = this._insertSettingDemonstrator._currentAnimationStep + 1;
        this._reverseAtomNumbers = false;
        this._generateNextAtomNumberFunction = function() { me._atomNumber--; };
    }
    else
    {
        this._atomNumber = 0;
        this._generateNextAtomNumberFunction = function() { me._atomNumber++; };
    }
}

DemoLayoutBuilder.InsertSettingDemonstrator.VerticalGridAnimator.prototype._renderAtom = function(row, col) {
    var atomClass = this._insertSettingDemonstrator._css.atomClass;
    var $atom = this._insertSettingDemonstrator._$layout.find("." + atomClass + "-" + row + "-" + col);
    $atom.css("visibility", "visible");

    this._generateNextAtomNumberFunction();
    $atom.text(this._atomNumber);

    this._renderedAtomsCount++;
    if(this._renderedAtomsCount == this._insertSettingDemonstrator._currentAnimationStep)
        this._allFrameAtomsRendered = true;
}

DemoLayoutBuilder.InsertSettingDemonstrator.VerticalGridAnimator.prototype.renderNextMirroredPrependFrame = function() {
    this._reverseAtomNumbers = true;

    if(this._insertSettingDemonstrator._gridSettings._isDefaultAppend())
        this.renderNextDefaultAppendFrame();
    else if(this._insertSettingDemonstrator._gridSettings._isReversedAppend())
        this.renderNextReversedAppendFrame();
}

DemoLayoutBuilder.InsertSettingDemonstrator.VerticalGridAnimator.prototype.renderNextDefaultPrependFrame = function() {
    this._initFrame();

    if(this._insertSettingDemonstrator._currentAnimationStep == 0) 
        return;

    if(this._insertSettingDemonstrator._currentAnimationStep > this._insertSettingDemonstrator._horizontalAtomsCount)
    {
        for(var row = this._insertSettingDemonstrator._verticalAtomsCount - 1; row >= 0; row--)
        {
            for(var col = 0; col < this._insertSettingDemonstrator._horizontalAtomsCount; col++)
            {
                this._renderAtom(row, col);
                if(this._allFrameAtomsRendered) break;
            }

            if(this._allFrameAtomsRendered) break;
        }
    }
    else
    { 
        for(var row = 0; row < this._insertSettingDemonstrator._verticalAtomsCount; row++)
        {
            for(var col = 0; col < this._insertSettingDemonstrator._horizontalAtomsCount; col++)
            {
                this._renderAtom(row, col);
                if(this._allFrameAtomsRendered) break;
            }

            if(this._allFrameAtomsRendered) break;
        }
    }
}

DemoLayoutBuilder.InsertSettingDemonstrator.VerticalGridAnimator.prototype.renderNextReversedPrependFrame = function() {
    this._initFrame();

    if(this._insertSettingDemonstrator._currentAnimationStep == 0)
        return;

    if(this._insertSettingDemonstrator._currentAnimationStep > this._insertSettingDemonstrator._horizontalAtomsCount)
    {
        for(var row = this._insertSettingDemonstrator._verticalAtomsCount - 1; row >= 0; row--)
        {
            for(var col = this._insertSettingDemonstrator._horizontalAtomsCount - 1; col >= 0; col--)
            {
                this._renderAtom(row, col);
                if(this._allFrameAtomsRendered) break;
            }

            if(this._allFrameAtomsRendered) break;
        }
    }
    else
    {
        for(var row = 0; row < this._insertSettingDemonstrator._verticalAtomsCount; row++)
        {
            for(var col = this._insertSettingDemonstrator._horizontalAtomsCount - 1; col >= 0; col--)
            {
                this._renderAtom(row, col);
                if(this._allFrameAtomsRendered) break;
            }

            if(this._allFrameAtomsRendered) break;
        }
    }
}

DemoLayoutBuilder.InsertSettingDemonstrator.VerticalGridAnimator.prototype.renderNextDefaultAppendFrame = function() {
    this._initFrame();

    if(this._insertSettingDemonstrator._currentAnimationStep == 0)
        return;

    for(var row = 0; row < this._insertSettingDemonstrator._verticalAtomsCount; row++)
    {
        for(var col = this._insertSettingDemonstrator._horizontalAtomsCount - 1; col >= 0; col--)
        {
            this._renderAtom(row, col);
            if(this._allFrameAtomsRendered) break;
        }

        if(this._allFrameAtomsRendered) break;
    }
}

DemoLayoutBuilder.InsertSettingDemonstrator.VerticalGridAnimator.prototype.renderNextReversedAppendFrame = function() {
    this._initFrame();

    if(this._insertSettingDemonstrator._currentAnimationStep == 0)
        return;

    for(var row = 0; row < this._insertSettingDemonstrator._verticalAtomsCount; row++)
    {
        for(var col = 0; col < this._insertSettingDemonstrator._horizontalAtomsCount; col++)
        {
            this._renderAtom(row, col);
            if(this._allFrameAtomsRendered) break;
        }

        if(this._allFrameAtomsRendered) break;
    }
}