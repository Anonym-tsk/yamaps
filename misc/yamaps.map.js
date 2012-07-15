/**
 * @file
 * Map support
 */

(function($) {
  ymaps.ready(function() {
    // Basic map class
    $.yaMaps.YamapsMap = function(mapId, options) {
      this.map = new ymaps.Map(mapId, options.init);
      this.mapId = mapId;
      this.options = options;
      this.mapListeners = this.map.events.group();

      // Export map coordinates to html element
      this.exportCoords = function(event) {
        var coords = {
          center: event.get('newCenter'),
          zoom: event.get('newZoom')
        };
        var $storage = $('.field-yamaps-coords-' + mapId);
        $storage.val(JSON.stringify(coords));
      };

      // Export map type to html element
      this.exportType = function(event) {
        var type = event.get('newType');
        var $storage = $('.field-yamaps-type-' + mapId);
        $storage.val(type);
      };

      // Map events for export
      this.map.events
        .add('boundschange', this.exportCoords, this.map)
        .add('typechange', this.exportType, this.map);

      // Enable map controls
      this.enableControls = function() {
        this.map.controls.add('typeSelector', {right: 5, top: 5});
        this.map.controls.add('zoomControl', {right: 5, top: 50});
        $.yaMaps._mapTools.unshift('default');
      };

      // Enable traffic control
      this.enableTraffic = function() {
        var traffic = new ymaps.control.TrafficControl({
          providerKey:'traffic#actual',
          shown:true
        });
        traffic.getProvider().state.set('infoLayerShown', true);
        this.map.controls.add(traffic, {top: 5, left: 5});
      };

      // Enable plugins
      this.enableTools = function() {
        var mapTools = $.yaMaps.getMapTools(this);
        this.map.controls.add(new ymaps.control.MapTools(mapTools), {left: 5, bottom: 35});
      };
    };
  });
})(jQuery);
