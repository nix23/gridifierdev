var CcApi = function() {
    var retTr = function() { return function(tr) { return tr; }; };
    var roundTr = function() { return function(tr) { return Math.round(tr); }; };
    var beforeSyncToggle = function() { return function(item, left, top, dom) {
        dom.css.set(item, {
            left: Math.round(parseFloat(left)) + "px",
            top: Math.round(parseFloat(top)) + "px"
        });
    }; };

    var ccs = [
        ["default", new DefaultCc()],
        ["position", new PositionCc()],
        ["translate", new TranslateCc(retTr(), retTr(), nop(), false)],
        ["translateInt", new TranslateCc(roundTr(), roundTr(), beforeSyncToggle(), false)],
        ["translate3d", new TranslateCc(retTr(), retTr(), nop(), true)],
        ["translate3dInt", new TranslateCc(roundTr(), roundTr(), beforeSyncToggle(), true)]
    ];

    for(var i = 0; i < ccs.length; i++)
        settings.addApi("coordsChanger", ccs[i][0], ccs[i][1]);
}