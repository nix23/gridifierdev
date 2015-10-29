ScaleToggleFactory = function(withFade) {
    var withFade = withFade || false;
    var fadeFn = function(tv, trProp) {
        return function(item, time, timing, dom, api) {
            if(trProp) {
                var prefix = api.prefix.getForCss('opacity', item);
                dom.css3.transitionProperty(item, prefix + " " + time + "ms " + timing);
            }
            dom.css3.opacity(item, tv);
        };
    };

    if(!withFade)
        return new ScaleToggle(nop(), nop(), nop(), nop());
    else {
        return new ScaleToggle(
            fadeFn("0", false),
            fadeFn("1", true),
            fadeFn("0", true),
            fadeFn("1", false)
        );
    }
}