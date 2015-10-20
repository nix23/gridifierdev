var InsertQueue = function() {
    // Array({'op' => 'op', 'items/item' => 'i', 'opSpecificParam1' => 'osp1', ...},
    //       ...., n )
    this._queue = [];
    this._isWaitingForRpsQueue = false;
}

proto(InsertQueue, {
    itemsToBatches: function(items, batchSize, disNative) {
        var disNative = disNative || false;
        var items = (disNative) ? items : gridItem.toNative(items);
        var itemBatches = [];
        var currBatchSize = 0;
        var itemBatch = [];
        var wasPushed = false;

        for(var i = 0; i < items.length; i++) {
            itemBatch.push(items[i]);
            wasPushed = false;

            currBatchSize++;
            if(currBatchSize == batchSize) {
                itemBatches.push(itemBatch);
                itemBatch = [];
                wasPushed = true;
                currBatchSize = 0;
            }
        }

        if(!wasPushed)
            itemBatches.push(itemBatch);

        return itemBatches;
    },

    schedule: function(op, items, batchSize, batchDelay, targetItem) {
        this._schedule(items, targetItem, batchSize, batchDelay, op, this._exec);
    },

    scheduleFnExec: function(items, batchSize, batchDelay, fn) {
        var batchDelay = batchDelay || C.INSERT_BATCH_DELAY;
        var itemBatches = this.itemsToBatches(items, batchSize);

        for(var i = 0; i < itemBatches.length; i++) {
            (function(ib, i) {
                setTimeout(fn(ib), batchDelay * i);
            })(itemBatches[i], i);
        }
    },

    _schedule: function(items, targetItem, batchSize, batchDelay, op, opFn) {
        var me = this;
        var schedule = function(items) {
            setTimeout(function() {
                me._execSchedule.call(me, items, targetItem, op, opFn);
            }, 0);
        }

        if(typeof batchSize == "undefined") {
            schedule(items);
            return;
        }

        this.scheduleFnExec(items, batchSize, batchDelay, function(items) {
            schedule(items);
        });
    },

    _execSchedule: function(items, targetItem, op, opFn) {
        var me = this;

        if(repositionQueue.isEmpty())
            opFn(items, targetItem, op);
        else {
            me._queue.push({
                op: op,
                items: items,
                targetItem: targetItem
            });

            if(me._isWaitingForRpsQueue)
                return;

            setTimeout(function() {
                me._isWaitingForRpsQueue = true;
                me._process.call(me);
            }, C.INSERT_QUEUE_DELAY);
        }
    },

    _process: function() {
        var me = this;
        var wereAllQueueOpsExec = true;
        for(var i = 0; i < this._queue.length; i++) {
            if(!repositionQueue.isEmpty()) {
                setTimeout(function() { me._process.call(me); }, C.INSERT_QUEUE_DELAY);
                wereAllQueueOpsExec = false;
                break;
            }

            var qe = this._queue[i];
            this._exec(qe.items, qe.targetItem, qe.op);
            this._queue.shift();
            i--;
        }

        if(wereAllQueueOpsExec)
            this._isWaitingForRpsQueue = false;
    },

    _exec: function(items, targetItem, op) {
        if(op == OPS.PREPEND) prependOp.exec(items);
        else if(op == OPS.APPEND) appendOp.exec(items);
        else if(op == OPS.INS_BEFORE) appendOp.execInsBefore(items, targetItem);
        else if(op == OPS.INS_AFTER) appendOp.execInsAfter(items, targetItem);
        else err("wrong op");
    }
});