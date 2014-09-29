ResizeEventNormalizer = function() {
}

ResizeEventNormalizer.IE8_MS_DELAY = 500;
ResizeEventNormalizer.GOOD_BROWSER_MS_DELAY = 0;

ResizeEventNormalizer.prototype.apply = function(originalHandlerFunc) {
    return function() {
        if(browserDetector.isIe8())
            var delay = ResizeEventNormalizer.IE8_MS_DELAY;
        else
            var delay = ResizeEventNormalizer.GOOD_BROWSER_MS_DELAY;

        if(this.fireResizeEventTimeout != null)
            clearTimeout(this.fireResizeEventTimeout);
        
        this.fireResizeEventTimeout = setTimeout(originalHandlerFunc, delay);
    };
}