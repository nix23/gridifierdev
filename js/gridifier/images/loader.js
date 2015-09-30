ImagesLoader = function() {
    // Array({items: items, images: loadedImages, op: op, data: data}, ..., N)
    this._batches = [];
    this._loaded = [];
}

proto(ImagesLoader, {
    schedule: function(items, op, data) {
        if(items.length == 0) {
            this._batches.push({items: items, images: [], op: op, data: data});
            this._checkLoad();
            return;
        }

        var images = this._findImages(items);
        this._batches.push({items: items, images: images, op: op, data: data});

        if(images.length == 0) {
            this._checkLoad();
            return;
        }

        for(var i = 0; i < images.length; i++)
            images[i].scheduleLoad();
    },

    _findImages: function(items) {
        var images = [];
        for(var i = 0; i < items.length; i++) {
            if(items[i].nodeName == "IMG") {
                if(!this._isAlreadyLoaded(items[i]))
                    images.push(new Image(items[i]));

                continue;
            }

            if(!this._isValidNode(items[i]))
                continue;

            var childs = items[i].querySelectorAll('img');
            for(var j = 0; j < childs.length; j++) {
                if(!this._isAlreadyLoaded(childs[j]))
                    images.push(new Image(childs[j]));
            }
        }

        return images;
    },

    _isAlreadyLoaded: function(image) {
        for(var i = 0; i < this._loaded.length; i++) {
            if(this._loaded[i] === image.src)
                return true;
        }

        return (image.src.length == 0);
    },

    _isValidNode: function(item) {
        return (item.nodeType && (item.nodeType == 1 || item.nodeType == 9 || item.nodeType == 11));
    },

    onLoad: function(image) {
        this._loaded.push(image.src);
        this._checkLoad();
    },

    _checkLoad: function() {
        for(var i = 0; i < this._batches.length; i++) {
            var isBatchLoaded = true;
            var images = this._batches[i].images;

            for(var j = 0; j < images.length; j++) {
                if(!images[j].isLoaded()) {
                    isBatchLoaded = false;
                    break;
                }
            }

            if(!isBatchLoaded) break;
            for(var j = 0; j < images.length; j++)
                images[j].destroy();

            this._batches[i].images = [];
            this._callOp(this._batches[i].items, this._batches[i].op, this._batches[i].data);
            this._batches.splice(i, 1);
            i--;
        }
    },

    _callOp: function(items, op, data) {
        var bs = data.batchSize;
        var bd = data.batchDelay;

        if(op == OPS.APPEND || op == OPS.PREPEND)
            core.exec(op, items, bs, bd);
        else if(op == OPS.SIL_APPEND)
            core.execSilentAppend(items, bs, bd);
        else if(op == OPS.INS_BEFORE)
            core.exec(op, items, bs, bd, data.beforeItem);
        else if(op == OPS.INS_AFTER)
            core.exec(op, items, bs, bd, data.afterItem);
        else
            err("Wrong op.");
    }
});