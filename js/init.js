$(document).ready(function() {
    CssCalcNormalizer.applyTo($("body"));
    View.init();
    
    var demoLayoutBuilder = new DemoLayoutBuilder($("#demoLayoutContainer"));
});