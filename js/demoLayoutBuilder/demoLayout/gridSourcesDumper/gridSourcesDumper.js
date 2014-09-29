DemoLayoutBuilder.DemoLayout.GridSourcesDumper = function($targetEl) {
    var me = this;

    this._$view = View.attach(this._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.DEMO_LAYOUT.GRID_SOURCES_DUMPER);

    this._css = {

    }

    this._construct = function() {


        this._bindEvents();
    }

    this._bindEvents = function() {

    }

    this._unbindEvents = function() {

    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
}