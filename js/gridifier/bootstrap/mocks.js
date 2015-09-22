var SortHelpers = nop();

var SilentRenderer = function() {
    return {isScheduled: function() { return false; }}
}
var Antialiaser = nop();

var DefaultCc = nop();
var PositionCc = nop();
var TranslateCc = nop();
var Translate3dCc = nop();

var VisibilityToggle = nop();
var ScaleToggleFactory = nop();
var ScaleToggle = nop();
var FadeToggle = nop();
var SlideToggleFactory = nop();
var SlideToggle = nop();
var RotateToggleFactory = nop();
var RotateToggle = nop();