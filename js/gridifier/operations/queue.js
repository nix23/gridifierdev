Gridifier.Operations.Queue = function(gridSizesUpdater,
                                      collector,
                                      connections,
                                      connectionsSorter,
                                      guid,
                                      settings,
                                      prepender,
                                      reversedPrepender,
                                      appender,
                                      reversedAppender,
                                      sizesTransformer,
                                      sizesResolverManager,
                                      eventEmitter) {
    var me = this;

    this._gridSizesUpdater = null;
    this._collector = null;
    this._connections = null;
    this._connectionsSorter = null;
    this._guid = null;
    this._settings = null;
    this._prepender = null;
    this._reversedPrepender = null;
    this._appender = null;
    this._reversedAppender = null;
    this._sizesTransformer = null;
    this._sizesResolverManager = null;
    this._eventEmitter = null;

    this._operationsQueue = null;

    /*
        Array(
            {'queuedOperationType' => 'qot', 'items/item' => 'i', 'opSpecificParam1' => 'osp1', ...},
            ....,
            n
        )
    */
    this._queuedOperations = [];
    this._isWaitingForTransformerQueueRelease = false;

    this._prependOperation = null;
    this._appendOperation = null;

    this._css = {
    };

    this._construct = function() {
        me._gridSizesUpdater = gridSizesUpdater;
        me._collector = collector;
        me._connections = connections;
        me._connectionsSorter = connectionsSorter;
        me._guid = guid;
        me._settings = settings;
        me._prepender = prepender;
        me._reversedPrepender = reversedPrepender;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._sizesTransformer = sizesTransformer;
        me._sizesResolverManager = sizesResolverManager;
        me._eventEmitter = eventEmitter;

        me._prependOperation = new Gridifier.Operations.Prepend(
            me._gridSizesUpdater, 
            me._collector, 
            me._guid, 
            me._settings, 
            me._prepender, 
            me._reversedPrepender,
            me._sizesResolverManager,
            me._eventEmitter
        );
        me._appendOperation = new Gridifier.Operations.Append(
            me._gridSizesUpdater, 
            me._collector, 
            me._connections,
            me._connectionsSorter,
            me._guid, 
            me._settings, 
            me._appender, 
            me._reversedAppender,
            me._sizesTransformer,
            me._sizesResolverManager,
            me._eventEmitter
        );
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

Gridifier.Operations.Queue.QUEUED_OPERATION_TYPES = {PREPEND: 0, APPEND: 1, INSERT_BEFORE: 2, INSERT_AFTER: 3};
Gridifier.Operations.Queue.PROCESS_QUEUED_OPERATIONS_TIMEOUT = 100;
Gridifier.Operations.Queue.DEFAULT_BATCH_TIMEOUT = 100;

Gridifier.Operations.Queue.prototype._scheduleOperation = function(items, targetItem, batchSize, batchTimeout, operationExecutorFn, operationType) {
    var me = this;
    var scheduleOperation = function(items, targetItem) {
        setTimeout(function() {
            if(me._sizesTransformer.isTransformerQueueEmpty()) {
                operationExecutorFn(items, targetItem);
            }
            else {
                me._queuedOperations.push({
                    queuedOperationType: operationType,
                    items: items,
                    beforeItem: targetItem,
                    afterItem: targetItem
                });

                if(me._isWaitingForTransformerQueueRelease)
                    return;

                setTimeout(function() {
                    me._isWaitingForTransformerQueueRelease = true;
                    me._processQueuedOperations.call(me);
                }, Gridifier.Operations.Queue.PROCESS_QUEUED_OPERATIONS_TIMEOUT);
            }
        }, 0);
    }

    if(typeof batchSize == "undefined") {
        scheduleOperation.call(me, items, targetItem);
        return;
    }

    var batchTimeout = batchTimeout || Gridifier.Operations.Queue.DEFAULT_BATCH_TIMEOUT;
    var itemBatches = this._packItemsToBatches(items, batchSize);
    for(var i = 0; i < itemBatches.length; i++) {
        (function(itemBatch, i) {
            setTimeout(function() { scheduleOperation.call(me, itemBatch, targetItem); }, batchTimeout * i);
        })(itemBatches[i], i);
    }
}

Gridifier.Operations.Queue.prototype.schedulePrependOperation = function(items, batchSize, batchTimeout) {
    var me = this;
    this._scheduleOperation(
        items,
        null,
        batchSize,
        batchTimeout,
        function(items) {
            me._executePrependOperation.call(me, items);
        },
        Gridifier.Operations.Queue.QUEUED_OPERATION_TYPES.PREPEND
    );
}

Gridifier.Operations.Queue.prototype.scheduleAppendOperation = function(items, batchSize, batchTimeout) {
    var me = this;
    this._scheduleOperation(
        items,
        null,
        batchSize,
        batchTimeout,
        function(items) {
            me._executeAppendOperation.call(me, items);
        },
        Gridifier.Operations.Queue.QUEUED_OPERATION_TYPES.APPEND
    );
}

Gridifier.Operations.Queue.prototype.scheduleInsertBeforeOperation = function(items, 
                                                                              beforeItem, 
                                                                              batchSize, 
                                                                              batchTimeout) {
    var me = this;
    this._scheduleOperation(
        items,
        beforeItem,
        batchSize,
        batchTimeout,
        function(items, beforeItem) {
            me._executeInsertBeforeOperation.call(me, items, beforeItem);
        },
        Gridifier.Operations.Queue.QUEUED_OPERATION_TYPES.INSERT_BEFORE
    );
}

Gridifier.Operations.Queue.prototype.scheduleInsertAfterOperation = function(items,
                                                                             afterItem,
                                                                             batchSize,
                                                                             batchTimeout) {
    var me = this;
    this._scheduleOperation(
        items,
        afterItem,
        batchSize,
        batchTimeout,
        function(items, afterItem) {
            me._executeInsertAfterOperation.call(me, items, afterItem);
        },
        Gridifier.Operations.Queue.QUEUED_OPERATION_TYPES.INSERT_AFTER
    );
}

Gridifier.Operations.Queue.prototype._packItemsToBatches = function(items, batchSize) {
    var items = this._collector.toDOMCollection(items);
    return this.splitItemsToBatches(items, batchSize);
}

Gridifier.Operations.Queue.prototype.splitItemsToBatches = function(items, batchSize) {
    var itemBatches = [];
    var itemsCountInCurrentBatch = 0;
    var itemsBatch = [];
    var wasLastBatchPushed = false;

    for(var i = 0; i < items.length; i++) {
        itemsBatch.push(items[i]);
        wasLastBatchPushed = false;

        itemsCountInCurrentBatch++;
        if(itemsCountInCurrentBatch == batchSize) {
            itemBatches.push(itemsBatch);
            itemsBatch = [];
            wasLastBatchPushed = true;
            itemsCountInCurrentBatch = 0;
        }
    }

    if(!wasLastBatchPushed)
        itemBatches.push(itemsBatch);

    return itemBatches;
}

Gridifier.Operations.Queue.prototype._processQueuedOperations = function() {
    var me = this;

    var wereAllQueueOperationsExecuted = true;
    for(var i = 0; i < this._queuedOperations.length; i++) {
        if(!this._sizesTransformer.isTransformerQueueEmpty()) {
            setTimeout(function() {
                me._processQueuedOperations.call(me);
            }, Gridifier.Operations.Queue.PROCESS_QUEUED_OPERATIONS_TIMEOUT);
            wereAllQueueOperationsExecuted = false;
            break;
        }

        var queuedOperationTypes = Gridifier.Operations.Queue.QUEUED_OPERATION_TYPES;
        if(this._queuedOperations[i].queuedOperationType == queuedOperationTypes.APPEND) {
            this._executeAppendOperation(this._queuedOperations[i].items);
        }
        else if(this._queuedOperations[i].queuedOperationType == queuedOperationTypes.PREPEND) {
            this._executePrependOperation(this._queuedOperations[i].items);
        }
        else if(this._queuedOperations[i].queuedOperationType == queuedOperationTypes.INSERT_BEFORE) {
            this._executeInsertBeforeOperation(
                this._queuedOperations[i].items,
                this._queuedOperations[i].beforeItem
            );
        }
        else if(this._queuedOperations[i].queuedOperationType == queuedOperationTypes.INSERT_AFTER) {
            this._executeInsertAfterOperation(
                this._queuedOperations[i].items,
                this._queuedOperations[i].afterItem
            );
        }
        else {
            var operationType = this._queuedOperations[i].queuedOperationType;
            throw new Error("Unknown queued operation type = '" + operationType + "'");
        }

        this._queuedOperations.shift();
        i--;
    }

    if(wereAllQueueOperationsExecuted)
        this._isWaitingForTransformerQueueRelease = false;
}

Gridifier.Operations.Queue.prototype._executePrependOperation = function(items) {
    this._prependOperation.execute(items);
}

Gridifier.Operations.Queue.prototype._executeAppendOperation = function(items) {
    this._appendOperation.execute(items);
}

Gridifier.Operations.Queue.prototype._executeInsertBeforeOperation = function(items, beforeItem) {
    this._appendOperation.executeInsertBefore(items, beforeItem);
}

Gridifier.Operations.Queue.prototype._executeInsertAfterOperation = function(items, afterItem) { 
    this._appendOperation.executeInsertAfter(items, afterItem);
}

Gridifier.Operations.Queue.prototype.scheduleAsyncFnExecutionByBatches = function(itemsToSplit, batchSize, batchTimeout, asyncFn) {
    var itemBatches = this.splitItemsToBatches(itemsToSplit, batchSize);
    batchTimeout = (typeof batchTimeout != "undefined") ? batchTimeout : Gridifier.Operations.Queue.DEFAULT_BATCH_TIMEOUT;

    for(var i = 0; i < itemBatches.length; i++) {
        (function(itemBatch, i) {
            setTimeout(function() { asyncFn(itemBatch); }, batchTimeout * i);
        })(itemBatches[i], i);
    }
}