ScaleToggleFactory = function(withFade) {
    var withFade = withFade || false;

    if(!withFade)
        return new ScaleToggle(nop(), nop(), nop(), nop());
    else {
        return new ScaleToggle(
            function(item, time, timing, dom, api) {
                dom.css3.opacity(item, "0");
            },
            function(item, time, timing, dom, api) {
                var prefix = api.prefix.getForCss('opacity', item);
                dom.css3.transitionProperty(item, prefix + " " + time + "ms " + timing);
                dom.css3.opacity(item, "1");
            },
            function(item, time, timing, dom, api) {
                var prefix = api.prefix.getForCss('opacity', item);
                dom.css3.transitionProperty(item, prefix + " " + time + "ms " + timing);
                dom.css3.opacity(item, "0");
            },
            function(item, time, timing, dom, api) {
                dom.css3.opacity(item, "1");
            }
        );
    }
}