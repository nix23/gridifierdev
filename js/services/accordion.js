Accordion = function($container, settings) {
    var me = this;

    this._settings = {
        pluginNameDataAttrPostfix: "applyplugin",
        pluginNameDataAttrValue: "accordion",
        pluginItemDataAttrPostfix: "accordionItemId",
        animationMsCount: 500
    }

    this._$container = null;
    this._items = {};
    this._currentAccordionItemId = null;
    this._isAnimating = false;
    this._selectItemsQueue = [];

    this._construct = function() {
        me._$container = $container;
        me._$container.css({position: "relative", overflow: "hidden"});

        me._items = {};
        me._collectItems();
        me._calculateItemPositions();

        $.extend(me._settings, settings);
        me._bindEvents();
    }

    this._bindEvents = function() {
        $(window).on(Accordion.EVENT_WINDOW_RESIZE, function() {
            me._calculateItemPositions();
            me._normalizeOffsetsAfterResize();
        });
    }

    this._unbindEvents = function() {
        $(window).off(Accordion.EVENT_WINDOW_RESIZE);
    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
}

Accordion.EVENT_WINDOW_RESIZE = "resize.accordion";

Accordion.prototype._collectItems = function() {
    var me = this;
    $.each(this._$container.find("[data-" + this._settings.pluginNameDataAttrPostfix + "]"), function() {
        if($(this).attr("data-" + me._settings.pluginNameDataAttrPostfix) != me._settings.pluginNameDataAttrValue)
            return;

        if(me._currentAccordionItemId == null)
            me._currentAccordionItemId = $(this).attr("data-" + me._settings.pluginItemDataAttrPostfix);

        me._items[$(this).attr("data-" + me._settings.pluginItemDataAttrPostfix)] = $(this);
    });
}

Accordion.prototype._calculateItemPositions = function() {
    var nextOffsetLeft = 0;
    for(var accordionItemId in this._items)
    {
        var $accordionItem = this._items[accordionItemId];
        $accordionItem.css({
            position: "absolute",
            left: nextOffsetLeft + "px",
            top: "0px"
        });

        nextOffsetLeft += $accordionItem.outerWidth();
    }
}

Accordion.prototype._normalizeOffsetsAfterResize = function() {
    var currentItemNumber = 0;
    for(var accordionItemId in this._items)
    {
        if(accordionItemId == this._currentAccordionItemId)
            break;
        currentItemNumber++;
    }

    var newItemWidth = this._items[this._currentAccordionItemId].outerWidth();
    var offsetLeftToSubstract = newItemWidth * currentItemNumber;

    for(var accordionItemId in this._items)
    {
        var $accordionItem = this._items[accordionItemId];
        $accordionItem.css({left: parseFloat($accordionItem.css("left")) - offsetLeftToSubstract + "px"});
    }
}

Accordion.prototype.selectItem = function(nextAccordionItemId) {
    if(nextAccordionItemId == this._currentAccordionItemId)
        return;

     if(this._isAnimating)
     {
        this._selectItemsQueue.push(nextAccordionItemId);
        return;
     }

    var me = this;
    this._isAnimating = true;
    var disableAnimation = disableAnimation || false;
    var itemsCount = 0;

    var currentAccordionItemNumber = null;
    var nextAccordionItemNumber = null;
    var nextPosition = 1;
    for(var accordionItemId in this._items) 
    {
        if(accordionItemId == nextAccordionItemId)
            nextAccordionItemNumber = nextPosition;
        else if(accordionItemId == this._currentAccordionItemId)
            currentAccordionItemNumber = nextPosition;

        nextPosition++;
        itemsCount++;
    }

    if(currentAccordionItemNumber == null || nextAccordionItemNumber == null)
        throw new Error("accordionPlugin: wrong accordionItemId passed to selectItem function.");

    var moveAllItemsRight = false;
    var moveAllItemsLeft = false;
    if(nextAccordionItemNumber > currentAccordionItemNumber)
        moveAllItemsLeft = true;
    else
        moveAllItemsRight = true;

    var itemsDifference = Math.abs(nextAccordionItemNumber - currentAccordionItemNumber);
    var itemWidth = this._items[this._currentAccordionItemId].outerWidth();
    var animatedItemsCount = 0;

    for(var accordionItemId in this._items)
    {
        var $accordionItem = this._items[accordionItemId];
        if(moveAllItemsLeft)
            var newLeft = parseFloat($accordionItem.css("left")) - (itemsDifference * itemWidth);
        else if(moveAllItemsRight)
            var newLeft = parseFloat($accordionItem.css("left")) + (itemsDifference * itemWidth);

        $accordionItem.transition({left: newLeft + "px"}, this._settings.animationMsCount, function() {
            animatedItemsCount++;
            if(animatedItemsCount == itemsCount)
            {
                me._isAnimating = false;
                if(me._selectItemsQueue.length > 0)
                    me.selectItem(me._selectItemsQueue.shift());
            }
        });
    }

    this._currentAccordionItemId = nextAccordionItemId;
}