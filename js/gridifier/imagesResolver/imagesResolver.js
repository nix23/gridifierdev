Gridifier.ImagesResolver = function(gridifier) {
    var me = this;

    this._gridifier = null;

    // Array({items: items, images: resolvedImages, data: data}, ..., N)
    this._batchesToResolve = [];
    this._alreadyResolved = [];

    this._construct = function () {
        me._gridifier = gridifier;

        me._bindEvents();
    }

    this._bindEvents = function () {
    }

    this._unbindEvents = function () {
        ;
    }

    this.destruct = function () {
        me._unbindEvents();
    }

    this._construct();
    return this;
}

Gridifier.ImagesResolver.OPERATIONS = {APPEND: 0, SILENT_APPEND: 1, PREPEND: 2, INSERT_BEFORE: 3, INSERT_AFTER: 4};

Gridifier.ImagesResolver.prototype.scheduleImagesResolve = function(items, operation, data) {
    if(items.length == 0) {
        this._batchesToResolve.push({
            items: items, images: [], operation: operation, data: data
        });
        this._emitResolveEvent();
        return;
    }

    var images = this._findImages(items);
    this._batchesToResolve.push({
        items: items, images: images, operation: operation, data: data
    });

    if(images.length == 0) {
        this._emitResolveEvent();
        return;
    }

    for(var i = 0; i < images.length; i++)
        images[i].scheduleResolve();
}

Gridifier.ImagesResolver.prototype._findImages = function(items) {
    var images = [];

    for(var i = 0; i < items.length; i++) {
        if(items[i].nodeName == "IMG") {
            if(!this._isAlreadyResolved(items[i]))
                images.push(new Gridifier.ImagesResolver.ResolvedImage(this, items[i]));

            continue;
        }

        if(!this._isValidNode(items[i]))
            continue;

        var childImages = items[i].querySelectorAll('img');
        for(var j = 0; j < childImages.length; j++) {
            if(!this._isAlreadyResolved(childImages[j]))
                images.push(new Gridifier.ImagesResolver.ResolvedImage(this, childImages[j]));
        }
    }

    return images;
}

Gridifier.ImagesResolver.prototype._isAlreadyResolved = function(image) {
    for(var i = 0; i < this._alreadyResolved.length; i++) {
        if(this._alreadyResolved[i] === image.src)
            return true;
    }

    if(image.src.length == 0)
        return true;

    return false;
}

Gridifier.ImagesResolver.prototype._isValidNode = function(item) {
    return (item.nodeType && (item.nodeType == 1 || item.nodeType == 9 || item.nodeType == 11));
}

Gridifier.ImagesResolver.prototype.onResolve = function(resolvedImage, image) {
    this._alreadyResolved.push(image.src);
    this._emitResolveEvent();
}

Gridifier.ImagesResolver.prototype._emitResolveEvent = function() {
    for(var i = 0; i < this._batchesToResolve.length; i++) {
        var areAllBatchImagesResolved = true;
        var images = this._batchesToResolve[i].images;

        for(var j = 0; j < images.length; j++) {
            if(!images[j].isImageResolved()) {
                areAllBatchImagesResolved = false;
                break;
            }
        }

        if(areAllBatchImagesResolved) {
            for(var j = 0; j < images.length; j++)
                images[j].destruct();

            this._batchesToResolve[i].images = [];

            var items = this._batchesToResolve[i].items;
            var data = this._batchesToResolve[i].data;
            var operations = Gridifier.ImagesResolver.OPERATIONS;

            switch(this._batchesToResolve[i].operation) {
                case operations.APPEND:
                    this._gridifier.executeAppend(items, data.batchSize, data.batchTimeout);
                break;

                case operations.SILENT_APPEND:
                    this._gridifier.executeSilentAppend(items, data.batchSize, data.batchTimeout);
                break;

                case operations.PREPEND:
                    this._gridifier.executePrepend(items, data.batchSize, data.batchTimeout);
                break;

                case operations.INSERT_BEFORE:
                    this._gridifier.executeInsertBefore(items, data.beforeItem, data.batchSize, data.batchTimeout);
                break;

                case operations.INSERT_AFTER:
                    this._gridifier.executeInsertAfter(items, data.afterItem, data.batchSize, data.batchTimeout);
                break;

                default:
                    console.log("Gridifier ERROR: Unknown images resolver operation.");
                break;
            }

            this._batchesToResolve.splice(i, 1);
            i--;
        }
        else {
            break;
        }
    }
}