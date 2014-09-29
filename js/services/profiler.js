var microProfiler = {
    startMsec: null,
    message: "",

    start: function(message)
    {
        //this.startMsec = new Date().getTime();
        this.startMsec = window.performance.now();
        this.message = message;
    },

    stop: function()
    {
        //console.log(this.message, (new Date().getTime() - this.startMsec) + " msec");
        console.log(this.message, (window.performance.now() - this.startMsec) + " msec");
    },

    get: function()
    {
        return (window.performance.now() - this.startMsec);
        //return (new Date().getTime() - this.startMsec);
    }
}

var msProfiler = {
    startMsec: null,
    message: "",

    start: function(message)
    {
        this.startMsec = new Date().getTime();
        //this.startMsec = window.performance.now();
        this.message = message;
    },

    stop: function()
    {
        console.log(this.message, (new Date().getTime() - this.startMsec) + " msec");
        //console.log(this.message, (window.performance.now() - this.startMsec) + " msec");
    },

    get: function()
    {
        //return (window.performance.now() - this.startMsec);
        return (new Date().getTime() - this.startMsec);
    }
}