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

    $.yaMaps.BasePlugin = {
      // Edit mode for line and polygin
      startEditing: function(active) {
        this.element.editor.startEditing();
        if (active) {
          this.element.editor.state.set('drawing', true);
        }
        this.element.editor.events.add('statechange', function(e) {
          if (this.element.editor.state.get('editing') && !this.element.editor.state.get('drawing')) {
            this.openBalloon();
          }
        }, this);
      },
      // Set line and polygon colors
      setColor: function(strokeColor, fillColor) {
        this.element.options.set('strokeColor', $.yaMaps.colors[strokeColor]);
        if (typeof fillColor != 'undefined') {
          this.element.options.set('fillColor', $.yaMaps.colors[fillColor]);
        }
      },
      // Set balloon content
      setContent: function(balloonContent) {
        this.element.properties.set('balloonContent', balloonContent);
      },
      // Set opacity
      setOpacity: function(opacity) {
        this.element.options.set('opacity', opacity);
      },
      // Set line width
      setWidth: function(width) {
        this.element.options.set('strokeWidth', width);
      },
      // Open balloon
      openBalloon: function() {
        this.element.balloon.open();
      },
      // Close balloon
      closeBalloon: function() {
        this.element.balloon.close();
      },
      // Remove line or polygon
      remove: function() {
        this.getParent().remove(this);
        this.exportParent();
      },
      // Set parent object
      setParent: function(Parent) {
        this.parent = Parent;
      },
      // Get parent
      getParent: function() {
        return this.parent;
      }
    };
  });
})(jQuery);
