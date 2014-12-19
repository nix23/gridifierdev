DemoLayoutBuilder.DemoLayout.GridDebugger = function(demoLayout) {
    var me = this;

    this._demoLayout = null;

    this._$bodyEl = null;
    this._$toggleButton = null;

    this._$debugWindow = null;
    this._$debugWindowHeader = null;
    this._$debugWindowHeaderMoveButton = null;
    this._$debugWindowHeaderCloseButton = null;
    this._$debugWindowBody = null;

    this._$gridDemonstrator = null;

    this._isDebugHidden = true;
    this._isMovingDebugWindow = false;
    this._evenOperationRow = false;

    this._gridItemBgs = ["gridFirstBg", "gridSecondBg", "gridThirdBg",
                         "gridFourthBg", "gridFifthBg"];
    this._gridItemBorderColors = ["gridFirstBorderColor", "gridSecondBorderColor",
                                  "gridThirdBorderColor", "gridFourthBorderColor",
                                  "gridFifthBorderColor"];
    this._currentGridItemBgIndex = 0;
    this._currentGridBorderColorIndex = 0;

    this._actionsData = [];
    this._currentActionGUID = 0;

    this._css = {
        verticalGridBgClass: "gridFifthBg",
        horizontalGridBgClass: "gridFourthBg",

        toggleButtonClass: "gridDebuggerToggle",
        toggleButtonSelectedClass: "gridDebuggerToggleSelected",

        debugWindow: {
            wrapperClass: "gridDebuggerDebugWindow",

            headerClass: "debugWindowHeader",
            headerMoveButtonClass: "moveButton",
            headerCloseButtonClass: "closeButton",
            headerButtonClass: "button",
            headerButtonSelectedClass: "buttonSelected",

            bodyClass: "debugWindowBody",
            operationRowClass: "operationRow",
            operationRowContentClass: "operationRowContent",
            evenOperationRowBgClass: "evenOperationRowBg",
            selectedOperationRow: "selectedOperationRow",
            operationRowLeftSideClass: "leftSide",
            operationRowLeftSideHeadingClass: "heading",
            operationRowRightSideClass: "rightSide",
            operationRowRightSideHeadingClass: "heading",
            operationSubheadingClass: "operationSubheading",

            actionRowClass: "actionRow",
            actionRowLeftSideClass: "leftSide",
            actionRowLeftSideHeadingClass: "heading",
            actionRowLeftSideSubheadingClass: "subheading",
            actionRowRightSideClass: "rightSide",
            actionRowRightSideShowGridButtonClass: "showGridButton",
            actionRowLeftBorderClass: "actionRowLeftBorder",
            actionRowRightBorderClass: "actionRowRightBorder",
            actionRowBottomBorderClass: "actionRowBottomBorder",

            listRootClass: "listRoot",
            listRootBorderClass: "listRootBorder",
            selectedListRootBorderClass: "selectedListRootBorder",
            listClass: "list"
        },

        gridDemonstrator: {
            wrapperClass: "gridDebuggerGridDemonstrator",
            insertedItemClass: "insertedItem"
        }
    }

    this._construct = function() {
        me._demoLayout = demoLayout;

        me._$bodyEl = $("body");
        if(!Logger.isEnabled())
            return;

        me._createToggleButton();
        me._updateToggleButtonTopPosition();
        me._createDebugWindow();
        me._createGridDemostrator();

        me._bindEvents();
    }

    this._bindEvents = function() {
        $(window).scroll(function() {
            me._updateToggleButtonTopPosition();
        });

        $(window).on(DemoLayoutBuilder.DemoLayout.GridDebugger.EVENT_WINDOW_RESIZE, function() {
            me._updateToggleButtonTopPosition();
        });

        $(me._$toggleButton).on("mouseenter", function() {
            if(me._demoLayout.isVerticalGrid())
                me._$toggleButton.addClass(me._css.verticalGridBgClass);
            else if(me._demoLayout.isHorizontalGrid())
                me._$toggleButton.addClass(me._css.horizontalGridBgClass);
            me._$toggleButton.addClass(me._css.toggleButtonSelectedClass);
        });

        $(me._$toggleButton).on("mouseleave", function() {
            me._$toggleButton.removeClass(me._css.verticalGridBgClass);
            me._$toggleButton.removeClass(me._css.horizontalGridBgClass);
            me._$toggleButton.removeClass(me._css.toggleButtonSelectedClass);
        });

        $(me._$toggleButton).on("click", function() {
            if(me._isDebugHidden) {
                me._isDebugHidden = false;
                me._$debugWindow.css({
                    "visibility": "visible", "left": "100px"
                });
                me._$gridDemonstrator.css("display", "block");
                me._$toggleButton.text("Hide debugger");
            }
            else if(!me._isDebugHidden) {
                me._isDebugHidden = true;
                me._$debugWindow.css({
                    "visibility": "hidden", "left": "-10000px"
                });
                me._$gridDemonstrator.css("display", "none");
                me._$toggleButton.text("Show debugger");
            }
        });

        var buttons = [
            me._$debugWindowHeaderMoveButton, 
            me._$debugWindowHeaderCloseButton 
        ];
        for(var i = 0; i < buttons.length; i++) {
            buttons[i].on("mouseenter", function() {
                if(me._demoLayout.isVerticalGrid())
                    $(this).addClass(me._css.verticalGridBgClass);
                else if(me._demoLayout.isHorizontalGrid())
                    $(this).addClass(me._css.horizontalGridBgClass);

                $(this).addClass(me._css.debugWindow.headerButtonSelectedClass);
            });

            buttons[i].on("mouseleave", function() {
                $(this).removeClass(me._css.verticalGridBgClass);
                $(this).removeClass(me._css.horizontalGridBgClass);
                $(this).removeClass(me._css.debugWindow.headerButtonSelectedClass);
            });
        }

        me._$debugWindowHeaderMoveButton.on("mousedown", function() {
            me._isMovingDebugWindow = true;
        });

        me._$debugWindowHeaderMoveButton.on("mouseup", function() {
            me._isMovingDebugWindow = false;
        });

        $(window).on(DemoLayoutBuilder.DemoLayout.GridDebugger.EVENT_MOUSEMOVE, function(event) {
            if(!me._isMovingDebugWindow)
                return;

            me._moveDebugWindow(event);
        });

        me._$debugWindowHeaderCloseButton.on("click", function() {
            me._$toggleButton.trigger("click");
            // me._isDebugHidden = true;
            // me._$debugWindow.css("display", "none");
            // me._$gridDemonstrator.css("display", "none");
            // me._$toggleButton.text("Show debugger");
        });

        $(Logger).on(Logger.EVENT_NEW_OPERATION, function(event, newOperation) {
            me._addNewLogEntryToDebugWindowBody(newOperation);
        });

        me._$debugWindow.on("mouseenter", "." + me._css.debugWindow.operationRowClass, function() {
            if(!me._isOperationLogEntrySelected($(this)))
                me._highlightOperationLogEntry($(this));
        });

        me._$debugWindow.on("mouseleave", "." + me._css.debugWindow.operationRowClass, function() {
            if(!me._isOperationLogEntrySelected($(this)))
                me._unhighlightOperationLogEntry($(this));
        });

        me._$debugWindow.on("click", "." + me._css.debugWindow.operationRowClass, function() {
            if(me._isOperationLogEntrySelected($(this))) {
                me._unselectOperationLogEntry($(this));
                $(this).next().css("display", "none");
            }
            else {
                me._selectOperationLogEntry($(this));
                me._highlightOperationLogEntry($(this));
                $(this).next().css("display", "block");
            }
        });

        me._$debugWindow.on("mouseenter", "." + me._css.debugWindow.listRootClass, function() {
            if(me._isListRootSelected($(this)))
                return;

            me._highlightListRoot($(this));
        });

        me._$debugWindow.on("mouseleave", "." + me._css.debugWindow.listRootClass, function() {
            if(me._isListRootSelected($(this)))
                return;

            me._unhighlightListRoot($(this));
        });

        me._$debugWindow.on("click", "." + me._css.debugWindow.listRootClass, function() {
            if(me._isListRootSelected($(this))) {
                me._unselectListRoot($(this));
            }
            else {
                me._selectListRoot($(this));
            }
        });

        var showGridButtonClass = me._css.debugWindow.actionRowRightSideShowGridButtonClass;
        me._$debugWindow.on("mouseenter", "." + showGridButtonClass, function() {
            me._highlightShowGridButton($(this));
        });

        me._$debugWindow.on("mouseleave", "." + showGridButtonClass, function() {
            me._unhighlightShowGridButton($(this));
        });

        me._$debugWindow.on("click", "." + showGridButtonClass, function() {
            me._showGrid($(this));
        });

        //me._$toggleButton.trigger("click"); // @todo -> Delete this
    }

    this._unbindEvents = function() {
        $(window).off(DemoLayoutBuilder.DemoLayout.GridDebugger.EVENT_WINDOW_RESIZE);
        $(window).off(DemoLayoutBuilder.DemoLayout.GridDebugger.EVENT_MOUSEMOVE);
    }

    this.destruct = function() {
        me._unbindEvents();
        if(!Logger.isEnabled())
            return;

        me._$toggleButton.remove();
        me._$debugWindow.remove();
    }

    this._construct();
}

DemoLayoutBuilder.DemoLayout.GridDebugger.EVENT_WINDOW_RESIZE = "resize.demoLayoutBuilder.demoLayout.GridDebugger";
DemoLayoutBuilder.DemoLayout.GridDebugger.EVENT_MOUSEMOVE = "mousemove.demoLayoutBuilder.demoLayout.GridDebugger";

DemoLayoutBuilder.DemoLayout.GridDebugger.HIGHLIGHT_CLASS_DATA_ATTR = "data-highlight-class";
DemoLayoutBuilder.DemoLayout.GridDebugger.HIGHLIGHT_BORDER_CLASS_DATA_ATTR = "data-highlight-border-class";
DemoLayoutBuilder.DemoLayout.GridDebugger.SELECTED_CLASS_DATA_ATTR = "data-selected-class";
DemoLayoutBuilder.DemoLayout.GridDebugger.EMPTY_DATA_ATTR_VALUE = "empty-value";

DemoLayoutBuilder.DemoLayout.GridDebugger.ACTION_GUID_DATA_ATTR = "data-action-guid";

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._getNextGridItemBg = function() {
    this._currentGridItemBgIndex++;
    if(this._currentGridItemBgIndex == 5)
        this._currentGridItemBgIndex = 0;

    return this._gridItemBgs[this._currentGridItemBgIndex];
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._getNextGridBorderColor = function() {
    this._currentGridBorderColorIndex++;
    if(this._currentGridBorderColorIndex == 5)
        this._currentGridBorderColorIndex = 0;

    return this._gridItemBorderColors[this._currentGridBorderColorIndex];
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._createToggleButton = function() {
    this._$toggleButton = $("<div/>").addClass(this._css.toggleButtonClass);
    this._$toggleButton.text("Show debugger");
    this._$bodyEl.append(this._$toggleButton);
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._updateToggleButtonTopPosition = function() {
    var currentScrollTop = $(window).scrollTop();
    var windowHeight = $(window).height();
    var top = currentScrollTop + windowHeight - this._$toggleButton.outerHeight();

    this._$toggleButton.css("top", top + "px");
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._createDebugWindow = function() {
    this._$debugWindow = $("<div/>").addClass(this._css.debugWindow.wrapperClass);
    this._$bodyEl.append(this._$debugWindow);
    this._$debugWindow.css("visibility", "hidden");

    this._$debugWindowHeader = $("<div/>").addClass(this._css.debugWindow.headerClass);
    this._$debugWindow.append(this._$debugWindowHeader);
    this._$debugWindowHeader.prepend("Gridifier logger");

    this._$debugWindowHeaderCloseButton = $("<div/>").addClass(this._css.debugWindow.headerCloseButtonClass);
    this._$debugWindowHeaderCloseButton.addClass(this._css.debugWindow.headerButtonClass);
    this._$debugWindowHeaderCloseButton.text("CLOSE");
    this._$debugWindowHeader.append(this._$debugWindowHeaderCloseButton);

    this._$debugWindowHeaderMoveButton = $("<div/>").addClass(this._css.debugWindow.headerMoveButtonClass);
    this._$debugWindowHeaderMoveButton.addClass(this._css.debugWindow.headerButtonClass);
    this._$debugWindowHeaderMoveButton.text("MOVE");
    this._$debugWindowHeader.append(this._$debugWindowHeaderMoveButton);

    this._$debugWindowBody = $("<div/>").addClass(this._css.debugWindow.bodyClass);
    this._$debugWindow.append(this._$debugWindowBody);
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._createGridDemostrator = function() {
    this._$gridDemonstrator = $("<div/>").addClass(this._css.gridDemonstrator.wrapperClass);
    this._$bodyEl.append(this._$gridDemonstrator);
    this._$gridDemonstrator.css({
        "display": "none", "width": "0px", "top": "0px", "background": "rgb(210,210,210)"
    });
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._moveDebugWindow = function(event) {
    // @todo -> Stop overflow from all sides 
    var horizontalCursorSnapPxCount = 600;
    var verticalCursorSnapPxCount = 35;

    this._$debugWindow.css("left", (event.pageX - horizontalCursorSnapPxCount) + "px");
    this._$debugWindow.css("top", (event.pageY - verticalCursorSnapPxCount) + "px");
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._addNewLogEntryToDebugWindowBody = function(newOperation) {
    var $newOperationRow = $("<div/>").addClass(this._css.debugWindow.operationRowClass);
    this._$debugWindowBody.append($newOperationRow);

    var $leftSide = $("<div/>").addClass(this._css.debugWindow.operationRowLeftSideClass);
    var $rightSide = $("<div/>").addClass(this._css.debugWindow.operationRowRightSideClass);
    if(this._evenOperationRow) $leftSide.addClass(this._css.debugWindow.evenOperationRowBgClass);
    if(this._evenOperationRow) $rightSide.addClass(this._css.debugWindow.evenOperationRowBgClass);

    $newOperationRow.append($leftSide).append($rightSide);

    var highlightClass = this._getNextGridItemBg();
    $newOperationRow.attr(DemoLayoutBuilder.DemoLayout.GridDebugger.HIGHLIGHT_CLASS_DATA_ATTR, highlightClass);

    var highlightBorderClass = this._getNextGridBorderColor();
    $newOperationRow.attr(
        DemoLayoutBuilder.DemoLayout.GridDebugger.HIGHLIGHT_BORDER_CLASS_DATA_ATTR,
        highlightBorderClass 
    );

    var $leftSideHeading = $("<div/>").addClass(this._css.debugWindow.operationRowLeftSideHeadingClass);
    $leftSideHeading.addClass(highlightClass);
    $leftSideHeading.text(newOperation.type.toUpperCase());
    $leftSide.append($leftSideHeading);

    var $rightSideHeading = $("<div/>").addClass(this._css.debugWindow.operationRowRightSideHeadingClass);
    $rightSideHeading.html("Actions count: " + newOperation.actions.length);
    $rightSide.append($rightSideHeading);

    if(newOperation.subheading && newOperation.subheading.length > 0) {
        var $newOperationSubheading = $("<div/>").addClass(this._css.debugWindow.operationSubheadingClass);
        $newOperationSubheading.html(newOperation.subheading);
        $leftSide.append($newOperationSubheading);
    }

    $rightSide.height($leftSide.height());
    this._evenOperationRow = (this._evenOperationRow) ? false : true;

    if(newOperation.actions.length > 0) {
        this._addOperationActionsToDebugWindowBody($newOperationRow, newOperation.actions);
    }
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._addOperationActionsToDebugWindowBody = function($newOperationRow,
                                                                                                     actions) {
    var $actions = $("<div/>").addClass(this._css.debugWindow.operationRowContentClass);

    for(var i = 0; i < actions.length; i++) {
        if(actions[i].actionType == Logger.ACTION_TYPES.ACTION) {
            var $actionRow = this._createActionRow(actions[i]);
            $actions.append($actionRow);
        }
        else if(actions[i].actionType == Logger.ACTION_TYPES.SUBACTION_ROOT) {
            var $listRoot = $("<div/>").addClass(this._css.debugWindow.listRootClass);
            $listRoot.addClass(this._css.debugWindow.listRootBorderClass);
            $listRoot.html(actions[i].heading + "<br>" + actions[i].subheading);

            var $list = $("<div/>").addClass(this._css.listClass);
            $list = this._addSubactionsToList($list, actions[i].subactions);
            $list.find("." + this._css.debugWindow.listRootClass).next().css({"border": "0px"});
            $.each($list.find("." + this._css.debugWindow.listRootClass).next().find(".leftSide"), function() {
                $(this).css("background", "rgb(235,235,235)");
            });
            $.each($list.find("." + this._css.debugWindow.listRootClass).next().find(".rightSide"), function() {
                $(this).css("background", "rgb(235,235,235)");
            });
            $list.css({"display": "none"});

            $actions.append($listRoot).append($list);
        }
        else if(actions[i].actionType == Logger.ACTION_TYPES.FIND_ITEM_CONNECTION_COORDS_ROOT) {
            var $listRoot = $("<div/>").addClass(this._css.debugWindow.listRootClass);
            $listRoot.addClass(this._css.debugWindow.listRootBorderClass);
            $listRoot.text(actions[i].heading);

            var $list = $("<div/>").addClass(this._css.listClass);
            for(var j = 0; j < actions[i].steps.length; j++) 
                $list.append(this._createActionRow(actions[i].steps[j]));
            $list.css("display", "none");
            
            $actions.append($listRoot).append($list);
        }
    }

    $actions.css("display", "none");
    this._$debugWindowBody.append($actions);
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._addSubactionsToList = function($list, subactions) {
    for(var i = 0; i < subactions.length; i++) {
        if(subactions[i].actionType == Logger.ACTION_TYPES.ACTION) {
            var $actionRow = this._createActionRow(subactions[i]);
            $list.append($actionRow);
        }
        else if(subactions[i].actionType == Logger.ACTION_TYPES.FIND_ITEM_CONNECTION_COORDS_ROOT) {
            var $sublistRoot = $("<div/>").addClass(this._css.debugWindow.listRootClass);
            $sublistRoot.addClass(this._css.debugWindow.listRootBorderClass);
            $sublistRoot.text(subactions[i].heading);

            var $sublist = $("<div/>").addClass(this._css.debugWindow.listClass);
            for(var j = 0; j < subactions[i].steps.length; j++)
                $sublist.append(this._createActionRow(subactions[i].steps[j]));
            $sublist.css("display", "none");

            $list.append($sublistRoot).append($sublist);
        }
    }

    return $list;
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._createActionRow = function(action) {
    var $actionRow = $("<div/>").addClass(this._css.debugWindow.actionRowClass);
    var $leftSide = $("<div/>").addClass(this._css.debugWindow.actionRowLeftSideClass);
    var $rightSide = $("<div/>").addClass(this._css.debugWindow.actionRowRightSideClass);

    var $leftSideHeading = $("<div/>").addClass(this._css.debugWindow.actionRowLeftSideHeadingClass);
    var $leftSideSubheading = $("<div/>").addClass(this._css.debugWindow.actionRowLeftSideSubheadingClass);
    $leftSideHeading.html(action.heading);
    $leftSideSubheading.html((action.subheading.length > 0) ? action.subheading : "---");
    $leftSide.append($leftSideHeading).append($leftSideSubheading);

    var $rightSideShowGridButton = $("<div/>").addClass(this._css.debugWindow.actionRowRightSideShowGridButtonClass);
    $rightSideShowGridButton.text("Show grid");
    $rightSide.append($rightSideShowGridButton);

    this._currentActionGUID++;
    var newAction = {actionGUID: this._currentActionGUID, action: action};
    this._actionsData.push(newAction);
    $rightSideShowGridButton.attr(
        DemoLayoutBuilder.DemoLayout.GridDebugger.ACTION_GUID_DATA_ATTR,
        this._currentActionGUID
    );
    
    $actionRow.append($leftSide).append($rightSide);

    return $actionRow;
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._highlightOperationLogEntry = function($operationLogEntry) {
    var highlightClass = $operationLogEntry.attr(DemoLayoutBuilder.DemoLayout.GridDebugger.HIGHLIGHT_CLASS_DATA_ATTR);
    var $leftSide = $operationLogEntry.find("." + this._css.debugWindow.operationRowLeftSideClass);
    var $rightSide = $operationLogEntry.find("." + this._css.debugWindow.operationRowRightSideClass);

    $operationLogEntry.addClass(this._css.debugWindow.selectedOperationRow);
    $leftSide.addClass(highlightClass);
    $rightSide.addClass(highlightClass);
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._unhighlightOperationLogEntry = function($operationLogEntry) {
    var highlightClass = $operationLogEntry.attr(DemoLayoutBuilder.DemoLayout.GridDebugger.HIGHLIGHT_CLASS_DATA_ATTR);
    var $leftSide = $operationLogEntry.find("." + this._css.debugWindow.operationRowLeftSideClass);
    var $rightSide = $operationLogEntry.find("." + this._css.debugWindow.operationRowRightSideClass);

    $operationLogEntry.removeClass(this._css.debugWindow.selectedOperationRow);
    $leftSide.removeClass(highlightClass);
    $rightSide.removeClass(highlightClass);
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._isOperationLogEntrySelected = function($operationLogEntry) {
    return ($operationLogEntry.attr(DemoLayoutBuilder.DemoLayout.GridDebugger.SELECTED_CLASS_DATA_ATTR) ==
            DemoLayoutBuilder.DemoLayout.GridDebugger.EMPTY_DATA_ATTR_VALUE);
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._selectOperationLogEntry = function($operationLogEntry) {
    this._highlightOperationLogEntry($operationLogEntry);
    $operationLogEntry.attr(
        DemoLayoutBuilder.DemoLayout.GridDebugger.SELECTED_CLASS_DATA_ATTR,
        DemoLayoutBuilder.DemoLayout.GridDebugger.EMPTY_DATA_ATTR_VALUE
    );
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._unselectOperationLogEntry = function($operationLogEntry) {
    //this._unhighlightOperationLogEntry($operationLogEntry);
    $operationLogEntry.removeAttr(DemoLayoutBuilder.DemoLayout.GridDebugger.SELECTED_CLASS_DATA_ATTR);
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._getOperationBorderHighlightClass = function($operationChildElem) {
    var $operationRowContent = $operationChildElem.closest("." + this._css.debugWindow.operationRowContentClass);
    var $operationRow = $operationRowContent.prev("." + this._css.debugWindow.operationRowClass);
    var namespace = DemoLayoutBuilder.DemoLayout.GridDebugger;
    
    return $operationRow.attr(namespace.HIGHLIGHT_BORDER_CLASS_DATA_ATTR);
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._highlightListRoot = function($listRoot) {
    $listRoot.addClass(this._getOperationBorderHighlightClass($listRoot));
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._unhighlightListRoot = function($listRoot) {
    $listRoot.removeClass(this._getOperationBorderHighlightClass($listRoot));
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._selectListRoot = function($listRoot) {
    this._highlightListRoot($listRoot);

    $listRoot.attr(
        DemoLayoutBuilder.DemoLayout.GridDebugger.SELECTED_CLASS_DATA_ATTR,
        DemoLayoutBuilder.DemoLayout.GridDebugger.EMPTY_DATA_ATTR_VALUE
    );
    $listRoot.removeClass(this._css.debugWindow.listRootBorderClass);
    $listRoot.addClass(this._css.debugWindow.selectedListRootBorderClass);

    $listRoot.next().css("display", "block");
    this._highlightList($listRoot.next());
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._unselectListRoot = function($listRoot) {
    $listRoot.removeAttr(DemoLayoutBuilder.DemoLayout.GridDebugger.SELECTED_CLASS_DATA_ATTR);
    $listRoot.removeClass(this._css.debugWindow.selectedListRootBorderClass);
    $listRoot.addClass(this._css.debugWindow.listRootBorderClass);

    $listRoot.next().css("display", "none");
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._isListRootSelected = function($listRoot) {
    return ($listRoot.attr(DemoLayoutBuilder.DemoLayout.GridDebugger.SELECTED_CLASS_DATA_ATTR) ==
            DemoLayoutBuilder.DemoLayout.GridDebugger.EMPTY_DATA_ATTR_VALUE);
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._highlightList = function($list) {
    var me = this;
    var rowsCount = $list.children("." + this._css.debugWindow.actionRowClass).length;
    var currentRow = -1;

    $.each($list.children("." + this._css.debugWindow.actionRowClass), function() {
        currentRow++;

        var $leftSide = $(this).children("." + me._css.debugWindow.actionRowLeftSideClass);
        var $rightSide = $(this).children("." + me._css.debugWindow.actionRowRightSideClass);

        $leftSide.addClass(me._getOperationBorderHighlightClass($list));
        $leftSide.addClass(me._css.debugWindow.actionRowLeftBorderClass);

        $rightSide.addClass(me._getOperationBorderHighlightClass($list));
        $rightSide.addClass(me._css.debugWindow.actionRowRightBorderClass);

        if(currentRow == rowsCount - 1) {
            $leftSide.addClass(me._css.debugWindow.actionRowBottomBorderClass);
            $rightSide.addClass(me._css.debugWindow.actionRowBottomBorderClass);
        }
        
        $rightSide.height($leftSide.height());
    });
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._unhighlightList = function($list) {
    $list.removeClass(this._getOperationBorderHighlightClass($list));
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._highlightShowGridButton = function($showGridButton) {
    var $operationRowContent = $showGridButton.closest("." + this._css.debugWindow.operationRowContentClass);
    var $operationRow = $operationRowContent.prev("." + this._css.debugWindow.operationRowClass);
    var namespace = DemoLayoutBuilder.DemoLayout.GridDebugger;
    var highlightClass = $operationRow.attr(namespace.HIGHLIGHT_CLASS_DATA_ATTR);
    $showGridButton.addClass(highlightClass).css({"cursor": "pointer", "color": "white"});
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._unhighlightShowGridButton = function($showGridButton) {
    var $operationRowContent = $showGridButton.closest("." + this._css.debugWindow.operationRowContentClass);
    var $operationRow = $operationRowContent.prev("." + this._css.debugWindow.operationRowClass);
    var namespace = DemoLayoutBuilder.DemoLayout.GridDebugger;
    var highlightClass = $operationRow.attr(namespace.HIGHLIGHT_CLASS_DATA_ATTR);
    $showGridButton.removeClass(highlightClass).css({"cursor": "default", "color": "black"});
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._showGrid = function($showGridButton) {
    var actionGUID = $showGridButton.attr(DemoLayoutBuilder.DemoLayout.GridDebugger.ACTION_GUID_DATA_ATTR);
    var action = null;
    for(var i = 0; i < this._actionsData.length; i++) {
        if(parseInt(this._actionsData[i].actionGUID, 10) == parseInt(actionGUID, 10))
            action = this._actionsData[i].action;
    }

    $.each($("." + this._css.gridDemonstrator.insertedItemClass), function() {
        $(this).remove();
    });

    this._$gridDemonstrator.html("");
    this._$gridDemonstrator.css({
        "top": $("#demoLayout .gridView .grid").offset().top + "px",
        "left": $("#demoLayout .gridView .grid").offset().left + "px",
        "width": action.gridWidth + "px",
        "height": action.gridHeight + "px"
    });
    
    if(action.actionType == Logger.ACTION_TYPES.ACTION) {
        this._createGridAction(action);
    }
    else if(action.actionType == Logger.FIND_ITEM_CONNECTION_COORDS_ACTION_TYPES.INSPECT_CONNECTOR) {
        this._createGridInspectConnectorAction(action);
    }
    else if(action.actionType == Logger.FIND_ITEM_CONNECTION_COORDS_ACTION_TYPES.OUT_OF_LAYOUT_BOUNDS) {
        this._createGridOutOfLayoutBoundsAction(action);
    }
    else if(action.actionType == Logger.FIND_ITEM_CONNECTION_COORDS_ACTION_TYPES.INTERSECTION_FOUND) {
        this._createGridIntersectionFoundAction(action);
    }
    else if(action.actionType == Logger.FIND_ITEM_CONNECTION_COORDS_ACTION_TYPES.WRONG_SORTING) {
        this._createGridWrongSortingAction(action);
    }
    else if(action.actionType == Logger.FIND_ITEM_CONNECTION_COORDS_ACTION_TYPES.VERTICAL_INTERSECTIONS_ERROR) {
        this._createGridVerticalIntersectionsErrorAction(action);
    }
    else if(action.actionType == Logger.FIND_ITEM_CONNECTION_COORDS_ACTION_TYPES.FOUND) {
        this._createGridFoundAction(action);
    }
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._createConnectionsOnGrid = function(connections) {
    var createdConnections = [];

    for(var i = 0; i < connections.length; i++) {
        var itemWidth = Math.abs(connections[i].x2 - connections[i].x1);
        var itemHeight = Math.abs(connections[i].y2 - connections[i].y1);

        var $connection = $("<div/>").css({
            width: itemWidth + "px",
            height: itemHeight + "px",
            "line-height": itemHeight + "px",
            background: "rgb(235,235,235)",
            "box-sizing": "border-box",
            "border": "1px rgb(190,190,190) solid",
            position: "absolute",
            left: connections[i].x1 + "px",
            top: connections[i].y1 + "px",
            "font-weight": "bold",
            "font-size": "12px"
        });
        $connection.text(connections[i].itemGUID);
        $connection.attr("data-gridifier-item-id", connections[i].itemGUID);

        this._$gridDemonstrator.append($connection);
        createdConnections.push($connection);
    }

    return createdConnections;
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._bindConnectorEvents = function($connector,
                                                                                    connector,
                                                                                    highlightClass) {
    var $connectorInfo;
    var me = this;

    $connector.on("mouseenter", function() {
        $connectorInfo = $("<div/>").css({
            position: "absolute",
            "z-index": "150",
            "color": "white",
            "font-size": "14px",
            "padding": "10px"
        });
        $connectorInfo.addClass(highlightClass);
        $connectorInfo.html("itemGUID: " + connector.itemGUID +
                            "<br>side: " + connector.side +
                            "<br>type: " + connector.type +
                            "<br>x: " + connector.x +
                            "<br>y: " + connector.y);
        $("body").append($connectorInfo);

        if(($connector.offset().left + $connectorInfo.outerWidth()) > $(window).outerWidth()) {
            var left = $(window).outerWidth() - $connectorInfo.outerWidth() - 10;
        }
        else if($connector.offset().left - $connectorInfo.outerWidth() < 0) {
            var left = $connector.offset().left;
        }
        else
            var left = $connector.offset().left - ($connectorInfo.outerWidth() / 2);

        $connectorInfo.css({
            top: $connector.offset().top - $connectorInfo.outerHeight() - 10 + "px",
            left: left + "px"
        });
    });

    $connector.on("mouseleave", function() {
        $connectorInfo.remove();
    });
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._createConnectorsOnGrid = function(connectors) {
    for(var i = 0; i < connectors.length; i++) {
        var $connector = $("<div/>").css({
            width: "10px",
            height: "10px",
            position: "absolute",
            left: (connectors[i].x - 5) + "px",
            top: (connectors[i].y - 5) + "px"
        });

        if(connectors[i].type == "shifted") {
            var highlightClass = "gridFourthBg";
            $connector.addClass(highlightClass);
        }
        else {
            var highlightClass = "gridFifthBg";
            $connector.addClass(highlightClass);
        }
        this._bindConnectorEvents($connector, connectors[i], highlightClass);

        var $connectorPixel = $("<div/>").css({
            position: "absolute",
            width: "4px",
            height: "4px",
            background: "black",
            left: connectors[i].x + "px",
            top: connectors[i].y + "px",
            "z-index": "150"
        });

        this._$gridDemonstrator.append($connector);
        this._$gridDemonstrator.append($connectorPixel);
    }
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._createInsertedItemOnGrid = function(itemCoords) {
    var itemWidth = Math.abs(itemCoords.x2 - itemCoords.x1);
    var itemHeight = Math.abs(itemCoords.y2 - itemCoords.y1);

    var $insertedItem = $("<div/>").css({
        position: "absolute",
        width: itemWidth + "px",
        height: itemHeight + "px",
        "line-height": itemHeight + "px",
        "font-size": "14px",
        border: "3px dashed",
        left: this._$gridDemonstrator.offset().left + itemCoords.x1 + "px",
        top: this._$gridDemonstrator.offset().top + itemCoords.y1 + "px",
        "box-sizing": "border-box",
        "z-index": "150"
    });
    $insertedItem.addClass(this._css.gridDemonstrator.insertedItemClass);

    if(this._demoLayout.isVerticalGrid())
        var gridBorderColorClass = "gridFifthBorderColor";
    else if(this._demoLayout.isHorizontalGrid())
        var gridBorderColorClass = "gridFourthBorderColor";

    $insertedItem.addClass(gridBorderColorClass);
    $("body").append($insertedItem);
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._createGridAction = function(action) {
    var connections = this._createConnectionsOnGrid(action.connections);
    this._createConnectorsOnGrid(action.connectors);
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._createGridInspectConnectorAction = function(action) {
    var connections = this._createConnectionsOnGrid(action.connections);
    this._createConnectorsOnGrid([action.connector]);
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._createGridOutOfLayoutBoundsAction = function(action) {
    var connections = this._createConnectionsOnGrid(action.connections);
    this._createConnectorsOnGrid([action.connector]);
    this._createInsertedItemOnGrid(action.itemCoords);
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._createGridIntersectionFoundAction = function(action) {
    var connections = this._createConnectionsOnGrid(action.connections);
    this._createConnectorsOnGrid([action.connector]);
    this._createInsertedItemOnGrid(action.itemCoords);

    for(var i = 0; i < action.maybeIntersectableConnections.length; i++) {
        var $maybeIntersectableConnectionItem = $(action.maybeIntersectableConnections[i].item);
        var intersectableItemGUID = parseInt($maybeIntersectableConnectionItem.attr("data-gridifier-item-id"), 10);

        for(var j = 0; j < connections.length; j++) {
            var connectionItemGUID = parseInt(connections[j].attr("data-gridifier-item-id"), 10);
            if(intersectableItemGUID == connectionItemGUID)
                connections[j].addClass("gridFourthBg");
        }
    }
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._createGridWrongSortingAction = function(action) {
    var connections = this._createConnectionsOnGrid(action.connections);
    this._createConnectorsOnGrid([action.connector]);
    this._createInsertedItemOnGrid(action.itemCoords);

    for(var i = 0; i < action.connectionsBelowCurrent.length; i++) {
        var $itemBelowCurrent = $(action.connectionsBelowCurrent[i].item);
        var itemBelowCurrentGUID = parseInt($itemBelowCurrent.attr("data-gridifier-item-id"), 10);

        for(var j = 0; j < connections.length; j++) {
            var connectionItemGUID = parseInt(connections[j].attr("data-gridifier-item-id"), 10);
            if(itemBelowCurrentGUID == connectionItemGUID)
                connections[j].addClass("gridFourthBg");
        }
    }
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._createGridVerticalIntersectionsErrorAction = function(action) {
    var connections = this._createConnectionsOnGrid(action.connections);
    this._createConnectorsOnGrid([action.connector]);
    this._createInsertedItemOnGrid(action.itemCoords);
}

DemoLayoutBuilder.DemoLayout.GridDebugger.prototype._createGridFoundAction = function(action) {
    var connections = this._createConnectionsOnGrid(action.connections);
    this._createConnectorsOnGrid([action.connector]);
    this._createInsertedItemOnGrid(action.itemCoords);
}