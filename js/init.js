$(document).ready(function() {
    sh_highlightDocument();
    CssCalcNormalizer.applyTo($("body"));
    View.init();
    
    var demoLayoutBuilder = new DemoLayoutBuilder($("#demoLayoutContainer"));
});