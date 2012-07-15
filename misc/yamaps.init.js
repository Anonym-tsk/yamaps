/**
 * @file
 * Initialize object extended to jQuery for global operations
 */

(function($) {
  ymaps.ready(function() {
    $.extend({
      yaMaps: {
        maps: {}, // maps on page
        _mapTools: [], // map tools
        _layouts: {}, // Layouts
        addMapTools: function(button) {
          this._mapTools.push(button);
        },
        getMapTools: function(Map) {
          var tools = [];
          for (var i in this._mapTools) {
            if (typeof this._mapTools[i] == 'function') {
              tools.push(this._mapTools[i](Map));
            }
            else {
              tools.push(this._mapTools[i]);
            }
          }
          return tools;
        },
        addLayout: function(name, layout) {
          this._layouts[name] = layout;
        },
        initLayouts: function() {
          for (var name in this._layouts) {
            ymaps.layout.storage.add(name, this._layouts[name]);
          }
        }
      }
    });
  });
})(jQuery);
