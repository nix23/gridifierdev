Gridifier.SizesTransformer = function(gridifier,
                                      settings,
                                      connectors,
                                      connections,
                                      connectionsSorter,
                                      guid,
                                      appender,
                                      reversedAppender,
                                      normalizer) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._connectors = null;
    this._connections = null;
    this._connectionsSorter = null;
    this._guid = null;
    this._appender = null;
    this._reversedAppender = null;
    this._normalizer = null;

    this._connectorsCleaner = null;
    this._connectorsSelector = null;
    this._transformerConnectors = null;

    this._transformedItemClonesToDelete = [];
    this._deleteTransformedItemClonesTimeout = null;

    this._lastReappendedItemInsertType = null;
    this._isNoIntersectionsStrategyPrependedTransformedItemSpecialFix = false;
    this._isNoIntersectionsStrategyFakeCallToFixPrependedTransform = false;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._connectors = connectors;
        me._connections = connections;
        me._connectionsSorter = connectionsSorter;
        me._guid = guid;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._normalizer = normalizer;

        if(me._settings.isVerticalGrid()) {
            me._connectorsCleaner = new Gridifier.VerticalGrid.ConnectorsCleaner(
                me._connectors, me._connections, me._settings
            );

            me._transformerConnectors = new Gridifier.VerticalGrid.TransformerConnectors(
                me._gridifier,
                me._connectors,
                me._connections,
                me._guid,
                me._appender,
                me._reversedAppender,
                me._normalizer,
                me,
                me._connectorsCleaner
            );
        }
        else if(me._settings.isHorizontalGrid()) {
            // @todo -> Implement here
        }

        me._connectorsSelector = new Gridifier.VerticalGrid.ConnectorsSelector(me._guid);
    };

    this._bindEvents = function() {
    };

    this._unbindEvents = function() {
    };

    this.destruct = function() {
        me._unbindEvents();
    };

    this._construct();
    return this;
}

Gridifier.SizesTransformer.TRANSFORMED_ITEM_DATA_ATTR = "data-transformed-item";
Gridifier.SizesTransformer.ORIGINAL_TRANSFORMED_ITEM_FOR_FAKE_CALL_DATA_ATTR = "data-original-item-for-fake-call";
Gridifier.SizesTransformer.DEPENDED_ITEM_DATA_ATTR = "data-depended-item";
Gridifier.SizesTransformer.TRANSFORMER_EMPTY_DATA_ATTR_VALUE = "gridifier-data";
Gridifier.SizesTransformer.TARGET_WIDTH_DATA_ATTR = "data-transformed-item-target-width";
Gridifier.SizesTransformer.TARGET_HEIGHT_DATA_ATTR = "data-transformed-item-target-height";
Gridifier.SizesTransformer.TRANSFORMED_ITEM_CLONE_DATA_ATTR = "data-transformed-item-clone";
Gridifier.SizesTransformer.TRANSFORMED_ITEM_CLONE_DATA_ATTR_VALUE = "item-clone";
Gridifier.SizesTransformer.TOGGLE_SIZES_TOGGLED_ITEM_SIZES_DATA_ATTR = "data-toggle-sizes-item-sizes-are-toggled";
Gridifier.SizesTransformer.TOGGLE_SIZES_ORIGINAL_WIDTH_DATA_ATTR = "data-toggle-sizes-original-width";
Gridifier.SizesTransformer.TOGGLE_SIZES_ORIGINAL_HEIGHT_DATA_ATTR = "data-toggle-sizes-original-height";
Gridifier.SizesTransformer.DELETE_TRANSFORMED_ITEM_CLONES_DELAY = 100;

Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT = "restrictConnectionCollect";

Gridifier.SizesTransformer.prototype.initConnectionTransform = function(connection, newWidth, newHeight) {
    this._isNoIntersectionsStrategyFakeCallToFixPrependedTransform = false; // @todo -> remove this???
    var targetSizes = {};

    var targetSizeTypes = {width: 0, height: 1};
    var me = this;

    var getTargetSize = function(newSize, targetSizeType) {
        var targetValueWithMultiplicationExpressionRegexp = new RegExp(/^\*(\d*\.?\d*)$/);
        var targetValueWithDivisionExpressionRegexp = new RegExp(/^\/(\d*\.?\d*)$/);
        var targetValueWithPostfixRegexp = new RegExp(/(^\d*\.?\d*)(px|%)$/);
        var targetValueRegexp = new RegExp(/^\d*\.?\d*$/);
        
        if(typeof newSize != "undefined" && typeof newSize != "boolean" && typeof newSize != null) {
            if(targetValueWithMultiplicationExpressionRegexp.test(newSize)) {
                var itemRawSize = me._getItemRawSize(connection.item, targetSizeType, targetSizeTypes);
                var itemSizeParts = targetValueWithPostfixRegexp.exec(itemRawSize);
                var multipleBy = targetValueWithMultiplicationExpressionRegexp.exec(newSize)[1];

                return (itemSizeParts[1] * multipleBy) + itemSizeParts[2];
            }

            if(targetValueWithDivisionExpressionRegexp.test(newSize)) {
                var itemRawSize = me._getItemRawSize(connection.item, targetSizeType, targetSizeTypes);
                var itemSizeParts = targetValueWithPostfixRegexp.exec(itemRawSize);
                var divideBy = targetValueWithDivisionExpressionRegexp.exec(newSize)[1];

                return (itemSizeParts[1] / divideBy) + itemSizeParts[2];
            }

            if(targetValueWithPostfixRegexp.test(newSize))
                return newSize;

            if(targetValueRegexp.test(newSize))
                return newSize + "px";

            new Gridifier.Error(
                Gridifier.Error.ERROR_TYPES.SIZES_TRANSFORMER.WRONG_TARGET_TRANSFORMATION_SIZES,
                newSize
            );
        }
        
        return me._getItemRawSize(connection.item, targetSizeType, targetSizeTypes);
    }

    targetSizes.targetWidth = getTargetSize(newWidth, targetSizeTypes.width);
    targetSizes.targetHeight = getTargetSize(newHeight, targetSizeTypes.height);

    return targetSizes;
}

Gridifier.SizesTransformer.prototype._getItemRawSize = function(item, sizeType, sizeTypes) {
    var itemComputedCSS = SizesResolver.getComputedCSSWithMaybePercentageSizes(item);

    if(sizeType == sizeTypes.width) {
        if(SizesResolver.hasPercentageCSSValue("width", item, itemComputedCSS))
            return SizesResolver.getPercentageCSSValue("width", item, itemComputedCSS);
        else 
            return SizesResolverManager.outerWidth(item) + "px";
    }
    else if(sizeType == sizeTypes.height) {
        if(SizesResolver.hasPercentageCSSValue("height", item, itemComputedCSS))
            return SizesResolver.getPercentageCSSValue("height", item, itemComputedCSS);
        else
            return SizesResolverManager.outerHeight(item) + "px";
    }
}

Gridifier.SizesTransformer.prototype.areConnectionSizesToggled = function(connection) {
    if(Dom.hasAttribute(connection.item, Gridifier.SizesTransformer.TOGGLE_SIZES_TOGGLED_ITEM_SIZES_DATA_ATTR))
        return true;

    return false;
}

Gridifier.SizesTransformer.prototype.getConnectionSizesPerUntoggle = function(connection) {
    var originalSizes = {};

    originalSizes.targetWidth = connection.item.getAttribute(Gridifier.SizesTransformer.TOGGLE_SIZES_ORIGINAL_WIDTH_DATA_ATTR);
    originalSizes.targetHeight = connection.item.getAttribute(Gridifier.SizesTransformer.TOGGLE_SIZES_ORIGINAL_HEIGHT_DATA_ATTR);

    return originalSizes;
}

Gridifier.SizesTransformer.prototype.markConnectionPerToggle = function(connection) {
    connection.item.setAttribute(
        Gridifier.SizesTransformer.TOGGLE_SIZES_TOGGLED_ITEM_SIZES_DATA_ATTR,
        Gridifier.SizesTransformer.TRANSFORMER_EMPTY_DATA_ATTR_VALUE
    );

    var targetSizeTypes = {width: 0, height: 1};
    var originalItemWidth = this._getItemRawSize(connection.item, targetSizeTypes.width, targetSizeTypes);
    var originalItemHeight = this._getItemRawSize(connection.item, targetSizeTypes.height, targetSizeTypes);

    connection.item.setAttribute(
        Gridifier.SizesTransformer.TOGGLE_SIZES_ORIGINAL_WIDTH_DATA_ATTR,
        originalItemWidth
    );
    connection.item.setAttribute(
        Gridifier.SizesTransformer.TOGGLE_SIZES_ORIGINAL_HEIGHT_DATA_ATTR,
        originalItemHeight
    );
}

Gridifier.SizesTransformer.prototype.unmarkConnectionPerToggle = function(connection) {
    connection.item.removeAttribute(Gridifier.SizesTransformer.TOGGLE_SIZES_TOGGLED_ITEM_SIZES_DATA_ATTR);
    connection.item.removeAttribute(Gridifier.SizesTransformer.TOGGLE_SIZES_ORIGINAL_WIDTH_DATA_ATTR);
    connection.item.removeAttribute(Gridifier.SizesTransformer.TOGGLE_SIZES_ORIGINAL_HEIGHT_DATA_ATTR);
}

// @todo -> Should transformed connection be sorted only by order of the GUIDS,
//          or when Custom Sort Dispersion is used, it will be more logical to sort by Y???
Gridifier.SizesTransformer.prototype._sortConnectionsToTransform = function(transformationData) {
    var me = this;

    var connectionsToSort = [];
    for(var i = 0; i < transformationData.length; i++)
        connectionsToSort.push(transformationData[i].connectionToTransform);
    
    var transformedConnectionSortNumber = 1;
    var sortedConnectionsToTransform = this._connectionsSorter.sortConnectionsPerReappend(
        connectionsToSort
    );
    for(var i = 0; i < sortedConnectionsToTransform.length; i++) {
        for(var j = 0; j < transformationData.length; j++) {
            if(sortedConnectionsToTransform[i].itemGUID == 
               transformationData[j].connectionToTransform.itemGUID) {
               transformationData[j].sortNumber = transformedConnectionSortNumber;
               transformedConnectionSortNumber++;
               break;
            }
        }
    }

    transformationData.sort(function(firstTransformationData, secondTransformationData) {
        if(firstTransformationData.sortNumber > secondTransformationData.sortNumber)
            return 1;

        return -1;
    });

    return transformationData;
}

Gridifier.SizesTransformer.prototype._markEachConnectionAsTransformed = function(transformationData) {
    for(var i = 0; i < transformationData.length; i++) {
        var itemToTransform = transformationData[i].connectionToTransform.item;
        itemToTransform.setAttribute(
            Gridifier.SizesTransformer.TRANSFORMED_ITEM_DATA_ATTR,
            Gridifier.SizesTransformer.TRANSFORMER_EMPTY_DATA_ATTR_VALUE
        );
        itemToTransform.setAttribute(
            Gridifier.SizesTransformer.TARGET_WIDTH_DATA_ATTR,
            transformationData[i].widthToTransform
        );
        itemToTransform.setAttribute(
            Gridifier.SizesTransformer.TARGET_HEIGHT_DATA_ATTR,
            transformationData[i].heightToTransform
        );
    }
}

Gridifier.SizesTransformer.prototype._createAllTransformedConnectionItemClones = function(transformationData) {
    var transformedItemClones = [];

    for(var i = 0; i < transformationData.length; i++) {
        // @todo -> Test performance with/without first cloneNode parameter
        var transformedItemClone = transformationData[i].connectionToTransform.item.cloneNode();
        transformedItemClone.setAttribute(
            Gridifier.SizesTransformer.TRANSFORMED_ITEM_CLONE_DATA_ATTR,
            Gridifier.SizesTransformer.TRANSFORMED_ITEM_CLONE_DATA_ATTR_VALUE
        );
        SizesResolverManager.unmarkAsCached(transformedItemClone);

        Dom.css.set(transformedItemClone, {
            position: "absolute",
            top: "0px",
            left: "-90000px",
            visibility: "hidden",
            width: transformationData[i].widthToTransform,
            height: transformationData[i].heightToTransform
        });

        this._gridifier.getGrid().appendChild(transformedItemClone);
        transformedItemClones.push(transformedItemClone);
        this._transformedItemClonesToDelete.push(transformedItemClone);
    }

    return transformedItemClones;
}

// @todo -> Check Custom Sort Dispersion mode, maybe we should take only items with > GUID and Y >= tritemY1??
// Or item with shifted dispersion will be moved in same place???? Please check this, Mr. Eduard :D
Gridifier.SizesTransformer.prototype._findAllItemsToReappend = function(firstTransformedConnection, 
                                                                        transformedItemClones,
                                                                        transformedConnections) {
    //var itemsToReappend = [];
    var connectionsToReappend = [];
    var exceptItemGUIDS = [];

    for(var i = 0; i < transformedConnections.length; i++)
        connectionsToReappend.push(transformedConnections[i]);

    for(var i = 0; i < transformedItemClones.length; i++) {
        //itemsToReappend.push(transformedItemClones[i]);
        exceptItemGUIDS.push(this._guid.getItemGUID(transformedItemClones[i]));
    }

    //var draggedConnections = [];

    var me = this;
    var iteratorTypes = {COLLECT_ITEMS_TO_REAPPEND: 0, CLEAR_COLLECTED_ITEMS: 1};
    var iterateConnections = function(iteratorType) {
        var iteratorFunction = function() {
            for(var j = 0; j < exceptItemGUIDS.length; j++) {
                if(connections[i].itemGUID == exceptItemGUIDS[j])
                    return;
            }

            if(iteratorType == iteratorTypes.COLLECT_ITEMS_TO_REAPPEND) {
                //itemsToReappend.push(connections[i].item);
                connectionsToReappend.push(connections[i]);
            }
            else if(iteratorType == iteratorTypes.CLEAR_COLLECTED_ITEMS) {
                connections.splice(i, 1);
                i--;
            }
            else {
                throw new Error("Wrong iteratorType: ", iteratorType);
            }
        }

        for(var i = 0; i < connections.length; i++) {
            if(connections[i][Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT]) {
                //draggedConnections.push(connections[i]);
                continue;
            }

            // Default or no intersections strategy check is required here, because we are reappending items
            // starting from random position. In such case we should reappend all row items in NIS mode.
            if(me._settings.isDisabledSortDispersion() && me._settings.isDefaultIntersectionStrategy()) {
                if(connections[i].itemGUID > firstTransformedConnection.itemGUID)
                    iteratorFunction();
            }
            // When noIntersection strategy is use, we should reappend all row items.(Height of transformed item may become smaller).
            // When customSortDispersion is used, element with bigger guid can be above.(Depending on the dispersion param).
            // @todo Determine, how far from current connection.y1 items should be collected for reappend.
            //      (Resort batch, and append transformed item first????, Or under some special conditions???)
            // @todo -> custom sort dispersion should have custom y1(VG) and custom x1(HG)
            else if(me._settings.isCustomSortDispersion() || me._settings.isCustomAllEmptySpaceSortDispersion() ||
                    me._settings.isNoIntersectionsStrategy()) {
                // @todo -> process horizontal hrid here
                // @todo -> process isCustomAllAvailableSpaceSD???
                if(connections[i].y2 >= firstTransformedConnection.y1)
                    iteratorFunction();
            }
        }
    }

    var connections = this._connections.get();
    iterateConnections(iteratorTypes.COLLECT_ITEMS_TO_REAPPEND);

    // var connections = this._connections.get();
    // for(var i = 0; i < connections.length; i++) {
    //     if(this._settings.isDisabledSortDispersion() && this._settings.isDefaultIntersectionStrategy()) {
    //         if(this._guid.getItemGUID(connections[i].item) > this._guid.getItemGUID(connection.item)) {
    //             itemsToReappend.push(connections[i].item);
    //             connections.splice(i, 1);
    //             i--;
    //         }
    //     }
    //     // When noIntersection strategy is used, we should reappend all row items.(Height of transformed item may become smaller).
    //     // When customSortDispersion is used, element with bigger guid can be above.(Depending on the dispersion param).
    //     // @todo Determine, how far from current connection.y1 items should be collected for reappend.
    //     //       (Resort batch, and append transformed item first????, Or under some special conditions???)
    //     else if(this._settings.isCustomSortDispersion() || this._settings.isNoIntersectionsStrategy()) {
    //         if(connections[i].y2 >= connection.y1) {
    //             itemsToReappend.push(connections[i].item);
    //             connections.splice(i, 1);
    //             i--;
    //         }
    //     }
    // }

    var me = this;
    var sortedConnectionsToReappend = this._connectionsSorter.sortConnectionsPerReappend(
        connectionsToReappend
    );

    var itemsToReappend = [];
    for(var i = 0; i < sortedConnectionsToReappend.length; i++) {
        var isTransformedItem = false;
        var transformedItemClone = null;

        for(var j = 0; j < transformedItemClones.length; j++) {
            if(this._guid.getItemGUID(transformedItemClones[j]) == 
               sortedConnectionsToReappend[i].itemGUID) {
                isTransformedItem = true;
                transformedItemClone = transformedItemClones[j];
                break;
            }
        }

        if(isTransformedItem)
            itemsToReappend.push(transformedItemClone);
        else
            itemsToReappend.push(sortedConnectionsToReappend[i].item);
    }
    // itemsToReappend.sort(function(firstItem, secondItem) {
    //     return Dom.toInt(me._guid.getItemGUID(firstItem)) - Dom.toInt(me._guid.getItemGUID(secondItem));
    // });
    
    var firstConnectionToReappend = this._gridifier.findConnectionByItem(itemsToReappend[0]);
    iterateConnections(iteratorTypes.CLEAR_COLLECTED_ITEMS);

    // for(var i = 0; i < draggedConnections.length; i++)
    //     draggedConnections[i].isDragged = false;
    
    return {
        itemsToReappend: itemsToReappend,
        firstConnectionToReappend: firstConnectionToReappend
    };
}

// @todo -> Check if horizontal grid works correctly here
Gridifier.SizesTransformer.prototype.isReversedAppendShouldBeUsedPerItemInsert = function(item) {
    if(this._guid.wasItemPrepended(this._guid.getItemGUID(item)) 
       && !this._settings.isMirroredPrepend()) {
        if(this._settings.isDefaultPrepend())
            return false;
        else if(this._settings.isReversedPrepend())
            return true;
    }
    else if(this._guid.wasItemAppended(this._guid.getItemGUID(item))) {
        if(this._settings.isDefaultAppend())
            return false;
        else if(this._settings.isReversedAppend())
            return true;
    }
}

Gridifier.SizesTransformer.prototype._getNextReappendedItemInsertType = function(item) {
    if(this._guid.wasItemPrepended(this._guid.getItemGUID(item)))
        return Gridifier.OPERATIONS.PREPEND;
    else if(this._guid.wasItemAppended(this._guid.getItemGUID(item)))
        return Gridifier.OPERATIONS.APPEND;
}

Gridifier.SizesTransformer.prototype._isNextReappendedItemInsertTypeChanged = function(item) {
    return this._lastReappendedItemInsertType != this._getNextReappendedItemInsertType(item);
}

Gridifier.SizesTransformer.prototype._storeHowNextReappendedItemWasInserted = function(item) {
    this._lastReappendedItemInsertType = this._getNextReappendedItemInsertType(item);
}

Gridifier.SizesTransformer.prototype._maybeAddGluingConnectorOnFirstPrependedConnection = function(transformedConnection) {
    var itemBeforeTransformedGUID = this._guid.getMaxGUIDBefore(
        this._guid.getItemGUID(transformedConnection.item), this._connections.get()
    );
    if(itemBeforeTransformedGUID == null)
        return;

    if(!this._guid.isFirstPrependedItem(itemBeforeTransformedGUID))
        return;
    
    if(this.isReversedAppendShouldBeUsedPerItemInsert(transformedConnection.item)) {
        this._transformerConnectors.addGluingReversedAppendConnectorOnFirstPrependedConnection();
        Logger.log( // @system-log-start
            "maybeAddGluingConnectorOnFirstPrependedConnection",
            "addGluingReversedAppendConnectorOnFirstPrependedConnection",
            this._connectors.get(),
            this._connections.get()
        );          // @system-log-end
    }
    else {
        this._transformerConnectors.addGluingDefaultAppendConnectorOnFirstPrependedConnection();
        Logger.log( // @system-log-start
            "maybeAddGluingConnectorOnFirstPrependedConnection",
            "addGluingDefaultAppendConnectorOnFirstPrependedConnection",
            this._connectors.get(),
            this._connections.get()
        );          // @system-log-end
    }
}

Gridifier.SizesTransformer.prototype._determineIfNoIntersectionsStrategySpecialFixIsRequired = function(connection) {
    this._isNoIntersectionsStrategyPrependedTransformedItemSpecialFix = false;

    if(this._settings.isNoIntersectionsStrategy()
       && !this.isNoIntersectionsStrategyFakeCallToFixPrependedTransform) {
        if(this._guid.wasItemPrepended(this._guid.getItemGUID(connection.item)))
            this._isNoIntersectionsStrategyPrependedTransformedItemSpecialFix = true;
    }
}

Gridifier.SizesTransformer.prototype._reappendDependedItemWithReversedAppend = function(dependedItem,
                                                                                        lastReappendedItemGUID) {
    if(this._isNextReappendedItemInsertTypeChanged(dependedItem)) {
        this._storeHowNextReappendedItemWasInserted(dependedItem);
        this._reversedAppender.recreateConnectorsPerAllConnectedItems();
        Logger.log( // @system-log-start
            "reappendDependedItemWithReversedAppend Depended item GUID: " + this._guid.getItemGUID(dependedItem),
            "nextReappendedItemInsertTypeChanged -> recreateConnectorsPerAllConnectedItems(ra)",
            this._connectors.get(),
            this._connections.get()
        );          // @system-log-end

        this._connectorsSelector.attachConnectors(this._connectors.get());
        if(this._settings.isVerticalGrid())
            var selectedConnectorsSide = Gridifier.Connectors.SIDES.BOTTOM.LEFT;
        else if(this._settings.isHorizontalGrid())
            var selectedConnectorsSide = Gridifier.Connectors.SIDES.BOTTOM.LEFT; // @todo -> Replace with hor.grid side

        this._connectorsSelector.selectOnlySpecifiedSideConnectorsOnPrependedItemsExceptFirst(
            selectedConnectorsSide
        );
        this._connectors.set(this._connectorsSelector.getSelectedConnectors());
        var logSide = (this._settings.isVerticalGrid()) ? "BOTTOM.LEFT" : "BOTTOM.LEFT"; // @system-log-start
        Logger.log(
            "reappendDependedItemWithReversedAppend Depended item GUID: " + this._guid.getItemGUID(dependedItem),
            "nextReappendedItemInsertTypeChanged -> selectOnlySpecifiedSideConnectorsOnPrependedItemsExceptFirst(" +
            logSide + ")",
            this._connectors.get(),
            this._connections.get()
        );                                                                             // @system-log-end

        if(this._guid.isFirstPrependedItem(lastReappendedItemGUID)) {
            this._transformerConnectors.addGluingReversedAppendConnectorOnFirstPrependedConnection();
            Logger.log( // @system-log-start
                "reappendDependedItemWithReversedAppend Depended item GUID: " + this._guid.getItemGUID(dependedItem),
                "nextReappendedItemInsertTypeChanged -> addGluingReversedAppendConnectorOnFirstPrependedConnection",
                this._connectors.get(),
                this._connections.get()
            );          // @system-log-end
        }

        if(this._settings.isVerticalGrid())
            this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        else if(this._settings.isHorizontalGrid())
            this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors(); // @todo -> Replace with hor.grid side
        if(this._settings.isVerticalGrid()) // @system-log-start
            var logMethod = "deleteAllIntersectedFromBottomConnectors";
        else
            var logMethod = "deleteAllIntersectedFromBottomConnectors";
        Logger.log(
            "reappendDependedItemWithReversedAppend Depended item GUID: " + this._guid.getItemGUID(dependedItem),
            "nextReappendedItemInsertTypeChanged -> " + logMethod,
            this._connectors.get(),
            this._connections.get()
        );                                  // @system-log-end
    }

    Logger.startLoggingSubaction(   // @system-log-start
        "reappendDependedItemWithReversedAppend",
        "reversedAppend depended item with GUID: " + this._guid.getItemGUID(dependedItem)
    );                             // @system-log-end
    this._reversedAppender.reversedAppend(dependedItem, true);
    Logger.stopLoggingSubaction(); // @system-log
}

Gridifier.SizesTransformer.prototype._reappendDependedItemWithDefaultAppend = function(dependedItem,
                                                                                       lastReappendedItemGUID) {
    if(this._isNextReappendedItemInsertTypeChanged(dependedItem)) {
        this._storeHowNextReappendedItemWasInserted(dependedItem);
        this._appender.recreateConnectorsPerAllConnectedItems();
        Logger.log( // @system-log-start
            "reappendDependedItemWithDefaultAppend Depended item GUID: " + this._guid.getItemGUID(dependedItem),
            "nextReappendedItemInsertTypeChanged -> recreateConnectorsPerAllConnectedItems(da)",
            this._connectors.get(),
            this._connections.get()
        );          // @system-log-end

        this._connectorsSelector.attachConnectors(this._connectors.get());
        if(this._settings.isVerticalGrid())
            var selectedConnectorsSide = Gridifier.Connectors.SIDES.BOTTOM.RIGHT;
        else if(this._settings.isHorizontalGrid())
            var selectedConnectorsSide = Gridifier.Connectors.SIDES.BOTTOM.RIGHT; // @todo -> Replace with hor.grid side

        this._connectorsSelector.selectOnlySpecifiedSideConnectorsOnPrependedItemsExceptFirst(
            selectedConnectorsSide
        );
        this._connectors.set(this._connectorsSelector.getSelectedConnectors());
        var logSide = (this._settings.isVerticalGrid()) ? "BOTTOM.RIGHT" : "BOTTOM.RIGHT"; // @system-log-start
        Logger.log(
            "reappendDependedItemWithDefaultAppend Depended item GUID: " + this._guid.getItemGUID(dependedItem),
            "nextReappendedItemInsertTypeChanged -> selectOnlySpecifiedSideConnectorsOnPrependedItemsExceptFirst(" +
            logSide + ")",
            this._connectors.get(),
            this._connections.get()
        );                                                                                 // @system-log-end

        if(this._guid.isFirstPrependedItem(lastReappendedItemGUID)) {
            this._transformerConnectors.addGluingDefaultAppendConnectorOnFirstPrependedConnection();
            Logger.log( // @system-log-start
                "reappendDependedItemWithDefaultAppend Depended item GUID: " + this._guid.getItemGUID(dependedItem),
                "nextReappendedItemInsertTypeChanged -> addGluingDefaultAppendConnectorOnFirstPrependedConnection",
                this._connectors.get(),
                this._connections.get()
            );          // @system-log-end
        }

        if(this._settings.isVerticalGrid())
            this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        else if(this._settings.isHorizontalGrid())
            this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors(); // @todo -> Replace with hor.grid side
        if(this._settings.isVerticalGrid()) // @system-log-start
            var logMethod = "deleteAllIntersectedFromBottomConnectors";
        else
            var logMethod = "deleteAllIntersectedFromBottomConnectors";
        Logger.log(
            "_reappendDependedItemWithDefaultAppend Depended item GUID: " + this._guid.getItemGUID(dependedItem),
            "nextReappendedItemInsertTypeChanged -> " + logMethod,
            this._connectors.get(),
            this._connections.get()
        );                                 // @system-log-end
    }
    
    Logger.startLoggingSubaction(   // @system-log-start
        "reappendDependedItemWithDefaultAppend",
        "defaultAppend depended item with GUID: " + this._guid.getItemGUID(dependedItem)
    );                              // @system-log-end
    this._appender.append(dependedItem, true);
    Logger.stopLoggingSubaction(); // @system-log
}

Gridifier.SizesTransformer.prototype._reappendTransformedItem = function(transformedItemClone, transformedItem) {
    if(this.isReversedAppendShouldBeUsedPerItemInsert(transformedItem)) {
        Logger.startLoggingSubaction(   // @system-log-start
            "reappendTransformedItemWithReversedAppend",
            "reversedAppend transformed item with GUID: " + this._guid.getItemGUID(transformedItem)
        );                              // @system-log-end
        this._reversedAppender.reversedAppend(transformedItemClone, true);
        Logger.stopLoggingSubaction();  // @system-log
    }
    else {
        Logger.startLoggingSubaction(   // @system-log-start
            "reappendTransformedItemWithDefaultAppend",
            "defaultAppend transformed item with GUID: " + this._guid.getItemGUID(transformedItem)
        );                              // @system-log-end
        this._appender.append(transformedItemClone, true);
        Logger.stopLoggingSubaction();  // @system-log
    }

    // If second transform to fix will be called, connection should still contain transformedItemClone
    // and so, only after returning from subcall clone should be replaced with original item.
    // if(this._isNoIntersectionsStrategyPrependedTransformedItemSpecialFix)
    //     return; 

    var connections = this._connections.get();

    for(var i = 0; i < connections.length; i++) {
        if(connections[i].itemGUID == this._guid.getItemGUID(transformedItem))
            connections[i].item = transformedItem;
    }
    Logger.log( // @system-log-start
        "reappendTransformedItem transformed item GUID: " + this._guid.getItemGUID(transformedItem),
        "after replacing connection item with transformed",
        this._connectors.get(),
        this._connections.get()
    );          // @system-log-end

    //transformedItemClone.parentNode.removeChild(transformedItemClone);
}

Gridifier.SizesTransformer.prototype._reappendItems = function(itemsToReappend, 
                                                               transformedConnections) {
    var st = Gridifier.SizesTransformer; 
    var lastReappendedItemGUID = null;

    for(var i = 0; i < itemsToReappend.length; i++) {
        if(!Dom.hasAttribute(itemsToReappend[i], st.TRANSFORMED_ITEM_DATA_ATTR)
           || Dom.hasAttribute(itemsToReappend[i], st.ORIGINAL_TRANSFORMED_ITEM_FOR_FAKE_CALL_DATA_ATTR)) {
            itemsToReappend[i].removeAttribute(st.ORIGINAL_TRANSFORMED_ITEM_FOR_FAKE_CALL_DATA_ATTR);
            itemsToReappend[i].setAttribute(st.DEPENDED_ITEM_DATA_ATTR, st.TRANSFORMER_EMPTY_DATA_ATTR_VALUE);
            
            if(this.isReversedAppendShouldBeUsedPerItemInsert(itemsToReappend[i]))
                this._reappendDependedItemWithReversedAppend(itemsToReappend[i], lastReappendedItemGUID);
            else
                this._reappendDependedItemWithDefaultAppend(itemsToReappend[i], lastReappendedItemGUID);
        }
        else {
            var transformedConnection = null;
            for(var j = 0; j < transformedConnections.length; j++) {
                if(transformedConnections[j].itemGUID == this._guid.getItemGUID(itemsToReappend[i]))
                    transformedConnection = transformedConnections[j];
            }

            this._reappendTransformedItem(itemsToReappend[i], transformedConnection.item);
        }
        
        if(this._settings.isVerticalGrid())
            this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        else if(this._settings.isHorizontalGrid())
            this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors(); // @todo -> Replace with hor.grid side
        Logger.log( // @system-log-start
            "reappendItems",
            "deleteAllIntersectedFromBottomOrXXXConnectors",
            this._connectors.get(),
            this._connections.get()
        );          // @system-log-end
        
        lastReappendedItemGUID = this._guid.getItemGUID(itemsToReappend[i]);
    }
}

Gridifier.SizesTransformer.prototype._makeNoIntersectionsStrategyFakeCallToFixPrependedTransform = function(connection,
                                                                                                            transformedItemClone,
                                                                                                            targetWidth,
                                                                                                            targetHeight) {
    transformedItemClone.setAttribute(
        Gridifier.SizesTransformer.ORIGINAL_TRANSFORMED_ITEM_FOR_FAKE_CALL_DATA_ATTR,
        Gridifier.SizesTransformer.TRANSFORMER_EMPTY_DATA_ATTR_VALUE
    );
    var lastPrependedConnection = this._connections.getLastPrependedConnection();

    this._isNoIntersectionsStrategyFakeCallToFixPrependedTransform = true;

    // If it is item with the smallest GUID, we should pass original sizes,
    // otherwise percentage sizes will break.
    if(connection.itemGUID == lastPrependedConnection.itemGUID) {
        Logger.log( // @system-log-start
            "makeNoIntersectionsStrategyFakeCallToFixPrependedTransform start",
            "is item with smallest guid, connection item GUID: " + this._guid.getItemGUID(connection.item),
            this._connectors.get(),
            this._connections.get(),
            true
        );          // @system-log-end
        this.transformConnectionSizes(
            connection, targetWidth, targetHeight
        );
        Logger.log( // @system-log-start
            "makeNoIntersectionsStrategyFakeCallToFixPrependedTransform end",
            "is item with smalles guid, connection item GUID: " + this._guid.getItemGUID(connection.item),
            this._connectors.get(),
            this._connections.get(),
            true
        );          // @system-log-end
    }
    else {
        Logger.log( // @system-log-start
            "makeNoIntersectionsStrategyFakeCallToFixPrependedTransform end",
            "is not item with smallest guid, connection item GUID: " + this._guid.getItemGUID(lastPrependedConnection.item),
            this._connectors.get(),
            this._connections.get(),
            true
        );         // @system-log-end
        this.transformConnectionSizes(
            lastPrependedConnection,
            SizesResolverManager.outerWidth(connection.item) + "px", //@todo -> pass correct sizes, as in initConnectionTransform
            SizesResolverManager.outerHeight(connection.item) + "px"
        );
        Logger.log( // @system-log-start
            "makeNoIntersectionsStrategyFakeCallToFixPrependedTransform end",
            "is not item with smallest guid, connection item GUID: " + this._guid.getItemGUID(lastPrependedConnection.item),
            this._connectors.get(),
            this._connections.get(),
            true
        );          // @system-log-end
    }

    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) {
        if(connections[i].itemGUID == connection.itemGUID) 
            connections[i].item = connection.item;
    }
    Logger.log( // @system-log-start
        "makeNoIntersectionsStrategyFakeCallToFixPrependedTransform",
        "after subcall finish and replacing connection item with real",
        this._connectors.get(),
        this._connections.get()
    );          // @system-log-end

    transformedItemClone.parentNode.removeChild(transformedItemClone);
}

Gridifier.SizesTransformer.prototype._applyNoIntersectionsStrategyTopFreeSpaceFixOnPrependedItemTransform = function() {
    var connections = this._connections.get();

    for(var i = 0; i < connections.length; i++) {
        if(connections[i].y1 == 0)
            return;
    }

    var minY1 = null;
    for(var i = 0; i < connections.length; i++) {
        if(minY1 == null)
            minY1 = connections[i].y1;
        else {
            if(connections[i].y1 < minY1)
                minY1 = connections[i].y1;
        }
    }

    var verticalDecrease = minY1;
    for(var i = 0; i < connections.length; i++) {
        connections[i].y1 -= verticalDecrease;
        connections[i].y2 -= verticalDecrease;
    }
    Logger.log( // @system-log-start
        "applyNoIntersectionsStrategyTopFreeSpaceFixOnPrependedItemTransform",
        "sizesTransformer subcall",
        this._connectors.get(),
        this._connections.get()
    );          // @system-log-end
}

Gridifier.SizesTransformer.prototype._applyNoIntersectionsStrategyLeftFreeSpaceFixOnPrependedItemTransform = function() {
    // @todo -> Implement horizontal fix here
}

Gridifier.SizesTransformer.prototype._deleteTransformedItemClones = function() {
    for(var i = 0; i < this._transformedItemClonesToDelete.length; i++) {
        var cloneToDelete = this._transformedItemClonesToDelete[i];
        cloneToDelete.parentNode.removeChild(cloneToDelete);
    }

    this._transformedItemClonesToDelete = [];
}

Gridifier.SizesTransformer.prototype._scheduleTransformedItemClonesDelete = function() {
    if(this._deleteTransformedItemClonesTimeout != null) {
        clearTimeout(this._deleteTransformedItemClonesTimeout);
        this._deleteTransformedItemClonesTimeout = null;
    }

    var me = this;
    this._deleteTransformedItemClonesTimeout = setTimeout(function() {
        me._deleteTransformedItemClones.call(me);
    }, Gridifier.SizesTransformer.DELETE_TRANSFORMED_ITEM_CLONES_DELAY);
}

Gridifier.SizesTransformer.prototype.transformConnectionSizes = function(transformationData) {
    transformationData = this._sortConnectionsToTransform(transformationData);
    this._markEachConnectionAsTransformed(transformationData);

    var transformedConnections = [];
    for(var i = 0; i < transformationData.length; i++)
        transformedConnections.push(transformationData[i].connectionToTransform);

    var transformedItemClones = this._createAllTransformedConnectionItemClones(transformationData);

    // Timeout is required here because of DOM-tree changes inside transformed item clones creation.
    // (Optimizing getComputedStyle after reflow performance)
    var processor = function() {
    var itemsToReappendData = this._findAllItemsToReappend(
        transformationData[0].connectionToTransform, transformedItemClones, transformedConnections
    );
    var itemsToReappend = itemsToReappendData.itemsToReappend;
    var firstConnectionToReappend = itemsToReappendData.firstConnectionToReappend;

    for(var i = 0; i < transformedItemClones.length; i++) {
        if(firstConnectionToReappend.itemGUID == this._guid.getItemGUID(transformedItemClones[i])) {
            firstConnectionToReappend.transformedItemClone = transformedItemClones[i];
            break;
        }
    }

    for(var i = 0; i < transformationData.length; i++)
       this._connections.removeConnection(transformationData[i].connectionToTransform);

    this._storeHowNextReappendedItemWasInserted(itemsToReappend[0]);
    this._transformerConnectors.recreateConnectorsPerConnectionTransform(firstConnectionToReappend);
    this._maybeAddGluingConnectorOnFirstPrependedConnection(transformedConnections[0]);
    
    //this._determineIfNoIntersectionsStrategySpecialFixIsRequired(connection);
    this._reappendItems(itemsToReappend, transformedConnections);
    this._gridifier.getRenderer().renderTransformedConnections();
    this._scheduleTransformedItemClonesDelete(); 
    Logger.stopLoggingOperation(); // @system-log
    }

    var me = this;
    setTimeout(function() { processor.call(me); }, 0);
    //processor.call(me);

    // @TODO -> WARNING!!! THIS SHOULD BE USED WHEN !NO_INTERSECTIONS STRATEGY TO FIX PREPENDED TRANSFORMS
    //  (FIX THIS!!!!)
    // @todo -> Check if this fix should be made always
    // if(this._settings.isNoIntersectionsStrategy()) {
    //     if(this._settings.isVerticalGrid())
    //         this._applyNoIntersectionsStrategyTopFreeSpaceFixOnPrependedItemTransform();
    //     else if(this._settings.isHorizontalGrid())
    //         this._applyNoIntersectionsStrategyLeftFreeSpaceFixOnPrependedItemTransform();
    // }

    // Special fix for prepended items, when noIntersectionsStrategy is used.(All items should be
    // reappended and moved up, if there is any empty space).
    // if(this._settings.isNoIntersectionsStrategy()
    //    && !this._isNoIntersectionsStrategyFakeCallToFixPrependedTransform
    //    && this._guid.wasItemPrepended(this._guid.getItemGUID(connection.item))) {
        // this._makeNoIntersectionsStrategyFakeCallToFixPrependedTransform(
        //     connection, transformedItemClone, targetWidth, targetHeight
        // );
    // }
    // else if(this._settings.isNoIntersectionsStrategy()
    //         && this._isNoIntersectionsStrategyFakeCallToFixPrependedTransform) {
    //     if(this._settings.isVerticalGrid())
    //         this._applyNoIntersectionsStrategyTopFreeSpaceFixOnPrependedItemTransform();
    //     else if(this._settings.isHorizontalGrid())
    //         this._applyNoIntersectionsStrategyLeftFreeSpaceFixOnPrependedItemTransform();
    //     return;
    // }
}

Gridifier.SizesTransformer.prototype.retransformAllConnections = function() {
    var connections = this._connections.get();
    if(connections.length == 0)
        return;

    connections = this._connectionsSorter.sortConnectionsPerReappend(connections);

    var itemsToReappend = [];
    var connectionsToKeep = [];
    for(var i = 0; i < connections.length; i++) {
        if(!connections[i][Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT]) {
            itemsToReappend.push(connections[i].item);
        }
        else {
            connectionsToKeep.push(connections[i]);
        }
    }

    var firstConnectionToReappend = null;
    if(connectionsToKeep.length == 0) {
        firstConnectionToReappend = connections[0];
        connections.splice(0, connections.length);
    }
    else {
        for(var i = 0; i < connections.length; i++) {
            var shouldRetransformConnection = true;

            for(var j = 0; j < connectionsToKeep.length; j++) {
                if(connectionsToKeep[j].itemGUID == connections[i].itemGUID) {
                    shouldRetransformConnection = false;
                    break;
                }
            }

            if(shouldRetransformConnection) {
                firstConnectionToReappend = connections[i];
                break;
            }
        }

        connections.splice(0, connections.length);
        for(var i = 0; i < connectionsToKeep.length; i++)
            connections.push(connectionsToKeep[i]);
    }

    this._storeHowNextReappendedItemWasInserted(itemsToReappend[0]);
    this._transformerConnectors.recreateConnectorsPerConnectionTransform(firstConnectionToReappend);
    this._maybeAddGluingConnectorOnFirstPrependedConnection(firstConnectionToReappend); // @todo -> delete???

    this._reappendItems(itemsToReappend, []);
    this._gridifier.getRenderer().renderTransformedConnections();
    Logger.stopLoggingOperation(); // @system-log
}