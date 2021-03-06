var Event = (function() {
    var gevents = "gridifierEvents";
    var ghandle = "gridifierHandle";
    var guid = function() {
        var d = new Date().getTime();
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
    }

    function fixEvent(event) {
        event = event || window.event;
        
        if(event.isFixed) {
            return event;
        }
        event.isFixed = true;
        
        event.preventDefault = event.preventDefault || function() { this.returnValue = false; }
        event.stopPropagation = event.stopPropagation || function() { this.cancelBubble = true; }
        
        if(!event.target) {
            event.target = event.srcElement;
        }
        
        if(!event.relatedTarget && event.fromElement) {
            event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;
        }
        
        if(event.pageX == null && event.clientX != null) {
            var html = document.documentElement, body = document.body;
            event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
            event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
        }
        
        if(!event.which && event.button) {
            event.which = (event.button & 1 ? 1 : (event.button & 2 ? 3 : (event.button & 4 ? 2 : 0)));
        }
        
        return event;
    }
    
    function commonHandle(event) {
        event = fixEvent(event);
        var handlers = this[gevents][event.type];
        
        for(var g in handlers) {
            var ret = handlers[g].call(this, event);
            if(ret === false) {
                event.preventDefault();
                event.stopPropagation();
            }
            else if(ret !== undefined) {
                event.result = ret;
            }
            
            if(event.stopNow) break;
        }
    }
    
    return {
        add: function(elem, type, handler) {
            if(elem.setInterval && (elem != window && !elem.frameElement)) {
                elem = window;
            }
            
            if(!handler.guid)
                handler.guid = guid();

            if(!elem[gevents]) {
                elem[gevents] = {};
                
                elem[ghandle] = function(event) {
                    if(typeof Event !== "undefined") {
                        return commonHandle.call(elem, event);
                    }
                }
            }
            
            if(!elem[gevents][type]) {
                elem[gevents][type] = {};
                
                if(elem.addEventListener)
                    elem.addEventListener(type, elem[ghandle], false);
                else if(elem.attachEvent)
                    elem.attachEvent("on" + type, elem[ghandle]);
            }
            
            elem[gevents][type][handler.guid] = handler;
        },
        
        rm: function(elem, type, handler) {
            var handlers = elem[gevents] && elem[gevents][type];
            if(!handlers) return;
            
            if(!handler) {
                for(var handle in handlers) {
                    delete elem[gevents][type][handle];
                }
                return;
            }
            else {
                delete handlers[handler.guid];
                for(var any in handlers) return;
            }
                
            if(elem.removeEventListener)
                elem.removeEventListener(type, elem[ghandle], false);
            else if(elem.detachEvent)
                elem.detachEvent("on" + type, elem[ghandle]);
            
            delete elem[gevents][type];
            
            for(var any in elem[gevents]) return;
            try {
                delete elem[ghandle];
                delete elem[gevents];
            } catch(e) {
                elem.removeAttribute(ghandle);
                elem.removeAttribute(gevents);
            }
        }
    }
}());