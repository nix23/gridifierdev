var browserDetector = {
    isIe8: function() {
        var hasIe8CondClass = false;

        var htmlClasses = document.querySelector("html").className.split(' ');
        for(var i = 0; i < htmlClasses.length; i++) {
            if(htmlClasses[i] == "lt-ie9")
                hasIe8CondClass = true;
        }

        return !Modernizr.csscalc && hasIe8CondClass;
    }
}