;
(function ($, models) {

    if (!models)
        models = window.models = {};

    var _setAttr = function (attr) {
        set(attr);
    }
    var File = window.models.File =  function(attr, parent) {
        this.set(attr);
        if (parent) this.parent = parent;
    }

    $.extend(File.prototype, {
        set: function (attr) {
            $.extend(this, attr);
            return this.reset();
        },
        reset: function() {
            delete this._fullPath;
            return this;
        },
        fullpath: function() {
            this._fullPath = this._fullPath ||
            (this.parent ?
                this.parent.fullpath() + this.name + (this.isDir ? '/' : '') :
                this.name ?
                    this.name + (this.isDir ? '/' : ''):
                    '/');
            return this._fullPath;
        }
    });
})(window.Zepto || window.jQuery, window.models);