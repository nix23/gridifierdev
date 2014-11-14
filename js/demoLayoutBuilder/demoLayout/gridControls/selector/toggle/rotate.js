DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Rotate = function($selectorRightSide, demoLayout, inverseRotate) {
    var me = this;

    this._$view = null;

    this._demoLayout = null;

    this._rotateCssProp = null;

    this._$leftBlock = null;
    this._$leftBlockHeading = null;
    this._$leftBlockElement = null;
    this._$leftBlockFrontFrame = null;
    this._$leftBlockBackFrame = null;
    this._$leftContentBlock = null;

    this._$rightBlock = null;
    this._$rightBlockHeading = null;
    this._$rightBlockElement = null;
    this._$rightBlockFrontFrame = null;
    this._$rightBlockBackFrame = null;
    this._$rightContentBlock = null;

    this._isAnimating = false;
    this._blockElementAnimationIntervalMs = 1200;
    this._nextAnimationTimeout = null;

    this._blockElementSideSize = 65;

    this._css = {
        verticalGridBgColorClass: "gridFifthBg",
        horizontalGridBgColorClass: "gridFourthBg",

        rotateClass: "rotate",
        blockClass: "block",
        blockHorizontalMarginClass: "blockHorizontalMargin",
        blockHeadingClass: "blockHeading",
        blockElementClass: "blockElement",

        verticalElementClass: "atomBorder gridFifthBg",
        horizontalElementClass: "atomBorder gridFourthBg"
    };

    this._construct = function() {
        if(inverseRotate)
            me._rotateCssProp = "rotateY";
        else
            me._rotateCssProp = "rotateX";

        me._demoLayout = demoLayout;
        me._$view = $("<div/>").addClass(me._css.rotateClass);
        $selectorRightSide.append(me._$view);

        me._createBlock(
            "_$leftBlock",  "_$leftBlockHeading", "_$leftBlockElement", "_$leftBlockFrontFrame", "_$leftBlockBackFrame", "left"
        );
        me._createBlock(
            "_$rightBlock", "_$rightBlockHeading", "_$rightBlockElement", "_$rightBlockFrontFrame", "_$rightBlockBackFrame", "right"
        );
        me._decorateBlocks();
        me._launchAnimation();

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

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Rotate.prototype._createRotatedBlock = function(blockFrontFrame,
                                                                                                                                                                          blockBackFrame,
                                                                                                                                                                          side) {
    var $scene = $("<div/>");
    $scene.css({
        width: "140px",
        height: this._blockElementSideSize + "px",
        position: "absolute"
    });
    Dom.css3.perspective($scene.get(0), "200px");

    var $frames = $("<div/>");
    $frames.css({
        width: "100%", height: "100%", position: "absolute"
    });
    Dom.css3.transformStyle($frames.get(0), "preserve-3d"); 
    Dom.css3.perspective($frames.get(0), "200px");
    $scene.append($frames); 

    var addFrameCss = function($frame) {
        $frame.css({
            display: "block", "position": "absolute", "width": "100%", "height": "100%"
        });

        Dom.css3.backfaceVisibility($frame.get(0), "hidden");
        return $frame;
    }

    var $frontFrame = $("<div/>");
    $frontFrame = addFrameCss($frontFrame);
    $frontFrame.css("z-index", 2); 
    Dom.css3.transition($frontFrame.get(0), "All 0ms ease");
    Dom.css3.transition($frontFrame.get(0), this._rotateCssProp + "(0deg)");

    var $backFrame = $("<div/>");
    $backFrame = addFrameCss($backFrame);
    Dom.css3.transition($backFrame.get(0), "All 0ms ease");
    Dom.css3.transition($backFrame.get(0), this._rotateCssProp + "(-180deg)");

    $frames.append($frontFrame);
    $frames.append($backFrame);

    this[blockFrontFrame] = $frontFrame;
    this[blockBackFrame] = $backFrame;

    $blockElement = $("<div/>").addClass(this._css.blockElementClass);
    this["_$" + side + "ContentBlock"] = $blockElement;
    // @todo -> Background should be placed here
    
    if(side == "left")
        $backFrame.append($blockElement);
    else if(side == "right")
        $frontFrame.append($blockElement);

    return $scene;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Rotate.prototype._createBlock = function(block, 
                                                                                                                                                               blockHeading, 
                                                                                                                                                               blockElement,
                                                                                                                                                               blockFrontFrame,
                                                                                                                                                               blockBackFrame,
                                                                                                                                                               side) {
    $block = $("<div/>").addClass(this._css.blockClass);
    $blockHeading = $("<div/>").addClass(this._css.blockHeadingClass);
    $blockElement = this._createRotatedBlock(blockFrontFrame, blockBackFrame, side);

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

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Rotate.prototype._decorateBlocks = function() {
    this._$rightBlock.addClass(this._css.blockHorizontalMarginClass);

    this._$leftBlockHeading.text("onRender");
    this._$rightBlockHeading.text("onHide");

    if(this._demoLayout.isVerticalGrid())
    {
        this._$leftContentBlock.addClass(this._css.verticalElementClass);
        this._$rightContentBlock.addClass(this._css.verticalElementClass);
    }
    else
    {
        this._$leftContentBlock.addClass(this._css.horizontalElementClass);
        this._$rightContentBlock.addClass(this._css.horizontalElementClass);
    }

    // this._$leftBlockElement.text("G");
    // this._$rightBlockElement.text("G");
    this._$leftContentBlock.text("G");
    this._$rightContentBlock.text("G");
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Rotate.prototype._launchAnimation = function() {
    this._isAnimating = true;
    this._renderNextAnimationFrame();
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Rotate.prototype._stopAnimation = function() {
    this._isAnimating = false;
    if(this._nextAnimationTimeout != null)
    {
        clearTimeout(this._nextAnimationTimeout);
        this._nextAnimationTimeout = null;
    }
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Rotate.prototype._renderNextAnimationFrame = function() {
    this._renderNextLeftBlockElementFrame();
    this._renderNextRightBlockElementFrame();

    if(this._isAnimating)
    {
        this._nextAnimationTimeout = setTimeout(
            $.proxy(DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Rotate.prototype._renderNextAnimationFrame, this),
            this._blockElementAnimationIntervalMs - 1
        );
    }
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Rotate.prototype._renderNextLeftBlockElementFrame = function() {
    var me = this; 

    Dom.css3.transition(this._$leftBlockFrontFrame.get(0), "All 0ms ease");
    Dom.css3.transition(this._$leftBlockBackFrame.get(0), "All 0ms ease");

    Dom.css3.transform(this._$leftBlockFrontFrame.get(0), this._rotateCssProp+ "(0deg)");
    Dom.css3.transform(this._$leftBlockBackFrame.get(0), this._rotateCssProp+ "(-180deg)");

    setTimeout(function() {
        Dom.css3.transition(me._$leftBlockFrontFrame.get(0), "All 900ms ease");
        Dom.css3.transition(me._$leftBlockBackFrame.get(0), "All 900ms ease");

        Dom.css3.transform(me._$leftBlockFrontFrame.get(0), me._rotateCssProp+ "(180deg)");
        Dom.css3.transform(me._$leftBlockBackFrame.get(0), me._rotateCssProp+ "(0deg)");
    }, 100);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Rotate.prototype._renderNextRightBlockElementFrame = function() {
    var me = this;

    Dom.css3.transition(this._$rightBlockFrontFrame.get(0), "All 0ms ease");
    Dom.css3.transition(this._$rightBlockBackFrame.get(0), "All 0ms ease");

    Dom.css3.transform(this._$rightBlockFrontFrame.get(0), this._rotateCssProp + "(0deg)");
    Dom.css3.transform(this._$rightBlockBackFrame.get(0), this._rotateCssProp + "(-180deg)");

    setTimeout(function() {
        Dom.css3.transition(me._$rightBlockFrontFrame.get(0), "All 900ms ease");
        Dom.css3.transition(me._$rightBlockBackFrame.get(0), "All 900ms ease");

        Dom.css3.transform(me._$rightBlockFrontFrame.get(0), me._rotateCssProp + "(180deg)");
        Dom.css3.transform(me._$rightBlockBackFrame.get(0), me._rotateCssProp + "(0deg)");
    }, 100);
}