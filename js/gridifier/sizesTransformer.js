Gridifier.SizesTransformer = function(gridifier,
                                      settings,
                                      connectors,
                                      connections,
                                      guid,
                                      appender,
                                      reversedAppender) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._connectors = null;
    this._connections = null;
    this._guid = null;
    this._appender = null;
    this._reversedAppender = null;

    this._connectorsCleaner = null;
    this._transformerConnectors = null;

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
        me._guid = guid;
        me._appender = appender;
        me._reversedAppender = reversedAppender;

        if(me._settings.isVerticalGrid()) {
            me._connectorsCleaner = new Gridifier.VerticalGrid.ConnectorsCleaner(
                me._connectors, me._connections
            );

            me._transformerConnectors = new Gridifier.VerticalGrid.TransformerConnectors(
                me._gridifier,
                me._connectors,
                me._connections,
                me._guid,
                me._appender,
                me._reversedAppender,
                me,
                me._connectorsCleaner
            );
        }
        else if(me._settings.isHorizontalGrid()) {
            // @todo -> Implement here
        }
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

Gridifier.SizesTransformer.prototype.initConnectionTransform = function(connection, newWidth, newHeight) {
    this._isNoIntersectionsStrategyFakeCallToFixPrependedTransform = false;
    var targetSizes = {};

    var targetSizeTypes = {width: 0, height: 1};
    var getTargetSize = function(newSize, targetSizeType) {
        var targetValueWithPostfixRegexp = new RegExp(/[\d]+(px|%)/);
        var targetValueRegexp = new RegExp(/[\d]+/);

        if(typeof newSize != "undefined" && typeof newSize != "boolean" && typeof newSize != null) {
            if(targetValueWithPostfixRegexp.test(newSize))
                return newSize;

            if(targetValueRegexp.test(newSize))
                return newSize + "px";

            new Gridifier.Error(
                Gridifier.Error.ERROR_TYPES.SIZES_TRANSFORMER.WRONG_TARGET_TRANSFORMATION_SIZES,
                newSize
            );
        }
        
        if(targetSizeType == targetSizeTypes.width)
            return SizesResolverManager.outerWidth(connection.item, true) + "px";
        else if(targetSizeType == targetSizeTypes.height)
            return SizesResolverManager.outerHeight(connection.item, true) + "px";
    }

    targetSizes.targetWidth = getTargetSize(newWidth, targetSizeTypes.width);
    targetSizes.targetHeight = getTargetSize(newHeight, targetSizeTypes.height);

    return targetSizes;
}

Gridifier.SizesTransformer.prototype._markAsTransformed = function(connection, targetWidth, targetHeight) {
    var transformedItem = connection.item;
    transformedItem.setAttribute(
        Gridifier.SizesTransformer.TRANSFORMED_ITEM_DATA_ATTR,
        Gridifier.SizesTransformer.TRANSFORMER_EMPTY_DATA_ATTR_VALUE
    );
    transformedItem.setAttribute(Gridifier.SizesTransformer.TARGET_WIDTH_DATA_ATTR, targetWidth);
    transformedItem.setAttribute(Gridifier.SizesTransformer.TARGET_HEIGHT_DATA_ATTR, targetHeight);
}

Gridifier.SizesTransformer.prototype._createTransformedConnectionItemClone = function(connection,
                                                                                      targetWidth,
                                                                                      targetHeight) {
    // @todo -> Test performance with/without first cloneNode parameter
    var transformedItemClone = connection.item.cloneNode(true);
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
        width: targetWidth,
        height: targetHeight
    });

    this._gridifier.getGrid().appendChild(transformedItemClone);
    return transformedItemClone;
}

// @todo -> Check Custom Sort Dispersion mode, maybe we should take only items with > GUID and Y >= tritemY1??
// Or item with shifted dispersion will be moved in same place???? Please check this, Mr. Eduard :D
Gridifier.SizesTransformer.prototype._findAllItemsToReappend = function(connection, transformedItemClone) {
    var itemsToReappend = [];
    itemsToReappend.push(transformedItemClone);

    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) {
        if(this._guid.getItemGUID(connections[i].item) > this._guid.getItemGUID(connection.item)) {
            itemsToReappend.push(connections[i].item);
            connections.splice(i, 1);
            i--;
        }
    }

    var me = this;
    itemsToReappend.sort(function(firstItem, secondItem) {
        return Dom.toInt(me._guid.getItemGUID(firstItem)) - Dom.toInt(me._guid.getItemGUID(secondItem));
    });

    return itemsToReappend;
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
    return this._lastReappendedItemInsertType == this._getNextReappendedItemInsertType(item);
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
    
    if(this.isReversedAppendShouldBeUsedPerItemInsert(transformedConnection.item))
        this._transformerConnectors.addGluingReversedAppendConnectorOnFirstPrependedConnection();
    else
        this._transformerConnectors.addGluingDefaultAppendConnectorOnFirstPrependedConnection();
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

        var connectorsSelector = new Gridifier.VerticalGrid.ConnectorsSelector(this._connectors.get(), this._guid);
        if(this._settings.isVerticalGrid())
            var selectedConnectorsSide = Gridifier.Connectors.SIDES.BOTTOM.LEFT;
        else if(this._settings.isHorizontalGrid())
            var selectedConnectorsSide = Gridifier.Connectors.SIDES.BOTTOM.LEFT; // @todo -> Replace with hor.grid side

        connectorsSelector.selectOnlySpecifiedSideConnectorsOnPrependedItemsExceptFirst(
            selectedConnectorsSide
        );
        this._connectors.set(connectorsSelector.getSelectedConnectors());

        if(this._guid.isFirstPrependedItem(lastReappendedItemGUID))
            this._transformerConnectors.addGluingReversedAppendConnectorOnFirstPrependedConnection();

        if(this._settings.isVerticalGrid())
            this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        else if(this._settings.isHorizontalGrid())
            this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors(); // @todo -> Replace with hor.grid side
    }

    this._reversedAppender.reversedAppend(dependedItem);
}

Gridifier.SizesTransformer.prototype._reappendDependedItemWithDefaultAppend = function(dependedItem,
                                                                                       lastReappendedItemGUID) {
    if(this._isNextReappendedItemInsertTypeChanged(dependedItem)) {
        this._storeHowNextReappendedItemWasInserted(dependedItem);
        this._appender.recreateConnectorsPerAllConnectedItems();

        var connectorsSelector = new Gridifier.VerticalGrid.ConnectorsSelector(this._connectors.get(), this._guid);
        if(this._settings.isVerticalGrid())
            var selectedConnectorsSide = Gridifier.Connectors.SIDES.BOTTOM.RIGHT;
        else if(this._settings.isHorizontalGrid())
            var selectedConnectorsSide = Gridifier.Connectors.SIDES.BOTTOM.RIGHT; // @todo -> Replace with hor.grid side

        connectorsSelector.selectOnlySpecifiedSideConnectorsOnPrependedItemsExceptFirst(
            selectedConnectorsSide
        );
        this._connectors.set(connectorsSelector.getSelectedConnectors());

        if(this._guid.isFirstPrependedItem(lastReappendedItemGUID))
            this._transformerConnectors.addGluingDefaultAppendConnectorOnFirstPrependedConnection();

        if(this._settings.isVerticalGrid())
            this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        else if(this._settings.isHorizontalGrid())
            this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors(); // @todo -> Replace with hor.grid side
    }
    
    this._appender.append(dependedItem);
}

Gridifier.SizesTransformer.prototype._reappendTransformedItem = function(transformedItemClone, transformedItem) {
    if(this.isReversedAppendShouldBeUsedPerItemInsert(transformedItem))
        this._reversedAppender.reversedAppend(transformedItemClone);
    else
        this._appender.append(transformedItemClone);

    // If second transform to fix will be called, connection should still contain transformedItemClone
    // and so, only after returning from subcall clone should be replaced with original item.
    if(this._isNoIntersectionsStrategyPrependedTransformedItemSpecialFix)
        return; 

    var connections = this._connections.get();

    for(var i = 0; i < connections.length; i++) {
        if(connections[i].itemGUID == this._guid.getItemGUID(transformedItem))
            connections[i].item = transformedItem;
    }

    transformedItemClone.parentNode.removeChild(transformedItemClone);
}

Gridifier.SizesTransformer.prototype._reappendItems = function(itemsToReappend, 
                                                               transformedItemClone,
                                                               transformedConnection) {
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
            this._reappendTransformedItem(itemsToReappend[i], transformedConnection.item);
        }

        if(this._settings.isVerticalGrid())
            this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        else if(this._settings.isHorizontalGrid())
            this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors(); // @todo -> Replace with hor.grid side

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
        this.transformConnectionSizes(
            connection, targetWidth, targetHeight
        );
    }
    else {
        this.transformConnectionSizes(
            lastPrependedConnection,
            SizesResolverManager.outerWidth(connection.item) + "px", //@todo -> pass correct sizes, as in initConnectionTransform
            SizesResolverManager.outerHeight(connection.item) + "px"
        );
    }

    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) {
        if(connections[i].itemGUID == connection.itemGUID)
            connections[i].item = connection.item;
    }

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
}

Gridifier.SizesTransformer.prototype._applyNoIntersectionsStrategyLeftFreeSpaceFixOnPrependedItemTransform = function() {
    // @todo -> Implement horizontal fix here
}

Gridifier.SizesTransformer.prototype.transformConnectionSizes = function(connection, targetWidth, targetHeight) {
    this._connections.removeConnection(connection);
    this._markAsTransformed(connection, targetWidth, targetHeight);

    var transformedItemClone = this._createTransformedConnectionItemClone(connection, targetWidth, targetHeight);
    var itemsToReappend = this._findAllItemsToReappend(connection, transformedItemClone);
    
    this._storeHowNextReappendedItemWasInserted(itemsToReappend[0]);
    this._transformerConnectors.recreateConnectorsPerConnectionTransform(
        connection, transformedItemClone
    );
    this._maybeAddGluingConnectorOnFirstPrependedConnection(connection);

    this._determineIfNoIntersectionsStrategySpecialFixIsRequired(connection);
    this._reappendItems(itemsToReappend, transformedItemClone, connection);

    // Special fix for prepended items, when noIntersectionsStrategy is used.(All items should be
    // reappended and moved up, if there is any empty space).
    if(this._settings.isNoIntersectionsStrategy()
       && !this._isNoIntersectionsStrategyFakeCallToFixPrependedTransform
       && this._guid.wasItemPrepended(this._guid.getItemGUID(connection.item))) {
        this._makeNoIntersectionsStrategyFakeCallToFixPrependedTransform(
            connection, transformedItemClone, targetWidth, targetHeight
        );
    }
    else if(this._settings.isNoIntersectionsStrategy()
            && this._isNoIntersectionsStrategyFakeCallToFixPrependedTransform) {
        if(this._settings.isVerticalGrid())
            this._applyNoIntersectionsStrategyTopFreeSpaceFixOnPrependedItemTransform();
        else if(this._settings.isHorizontalGrid())
            this._applyNoIntersectionsStrategyLeftFreeSpaceFixOnPrependedItemTransform();
        return;
    }
}