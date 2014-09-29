DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Fade = function($selectorRightSide, demoLayout) {
    var me = this;

    this._$view = null;

    this._demoLayout = null;

    this._$leftBlock = null;
    this._$leftBlockHeading = null;
    this._$leftBlockElement = null;

    this._$rightBlock = null;
    this._$rightBlockHeading = null;
    this._$rightBlockElement = null;

    this._isAnimating = false;
    this._blockElementAnimationIntervalMs = 1200;
    this._nextAnimationTimeout = null;

    this._css = {
        verticalGridBgColorClass: "gridFifthBg",
        horizontalGridBgColorClass: "gridFourthBg",

        fadeClass: "fade",
        blockClass: "block",
        blockHorizontalMarginClass: "blockHorizontalMargin",
        blockHeadingClass: "blockHeading",
        blockElementClass: "blockElement",

        verticalElementClass: "atomBorder gridFifthBg",
        horizontalElementClass: "atomBorder gridFourthBg"
    };

    this._construct = function() {
        me._demoLayout = demoLayout;
        me._$view = $("<div/>").addClass(me._css.fadeClass);
        $selectorRightSide.append(me._$view);

        me._createBlock("_$leftBlock", "_$leftBlockHeading", "_$leftBlockElement");
        me._createBlock("_$rightBlock", "_$rightBlockHeading", "_$rightBlockElement");
        me._decorateBlocks();
        me._launchAnimation();

        this._bindEvents();
    };

    this._bindEvents = function() {
    };

    this._unbindEvents = function() {
    };

    this._destruct = function() {
        me._unbindEvents();
    };

    this._construct();
    return this;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Fade.prototype._createBlock = function(block, blockHeading, blockElement) {
    $block = $("<div/>").addClass(this._css.blockClass);
    $blockHeading = $("<div/>").addClass(this._css.blockHeadingClass);
    $blockElement = $("<div/>").addClass(this._css.blockElementClass);

    if(this._demoLayout.isVerticalGrid())
        $blockHeading.addClass(this._css.verticalGridBgColorClass);
    else if(this._demoLayout.isHorizontalGrid())
        $blockHeading.addClass(this._css.horizontalGridBgColorClass);

    $block.append($blockHeading).append($blockElement);
    this._$view.append($block);

    this[block] = $block;
    this[blockHeading] = $blockHeading;
    this[blockElement] = $blockElement;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Fade.prototype._decorateBlocks = function() {
    this._$rightBlock.addClass(this._css.blockHorizontalMarginClass);

    this._$leftBlockHeading.text("onRender");
    this._$rightBlockHeading.text("onHide");

    if(this._demoLayout.isVerticalGrid())
    {
        this._$leftBlockElement.addClass(this._css.verticalElementClass);
        this._$rightBlockElement.addClass(this._css.verticalElementClass);
    }
    else if(this._demoLayout.isHorizontalGrid())
    {
        this._$leftBlockElement.addClass(this._css.horizontalElementClass);
        this._$rightBlockElement.addClass(this._css.horizontalElementClass);
    }

    this._$leftBlockElement.text("G");
    this._$rightBlockElement.text("G");
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Fade.prototype._launchAnimation = function() {
    this._isAnimating = true;
    this._renderNextAnimationFrame();
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Fade.prototype._stopAnimation = function() {
    this._isAnimating = false;
    if(this._nextAnimationTimeout != null)
    {
        clearTimeout(this._nextAnimationTimeout);
        this._nextAnimationTimeout = null;
    }
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Fade.prototype._renderNextAnimationFrame = function() {
    this._renderNextLeftBlockElementFrame();
    this._renderNextRightBlockElementFrame();

    if(this._isAnimating)
    {
        this._nextAnimationTimeout = setTimeout(
            $.proxy(DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Fade.prototype._renderNextAnimationFrame,this),
            this._blockElementAnimationIntervalMs - 1
        );
    }
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Fade.prototype._renderNextLeftBlockElementFrame = function() {
    var me = this;

    this._$leftBlockElement.transition({opacity: 0}, 0, function() {
        me._$leftBlockElement.transition({opacity: 1}, me._blockElementAnimationIntervalMs - 1, function() {
        });
    });
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Fade.prototype._renderNextRightBlockElementFrame = function() {
    var me = this;

    this._$rightBlockElement.transition({opacity: 1}, 0, function() {
        me._$rightBlockElement.transition({opacity: 0}, me._blockElementAnimationIntervalMs - 1, function() {
        });
    });
}