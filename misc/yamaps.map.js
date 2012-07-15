(function($) {
  ymaps.ready(function() {
    $.extend($.yaMaps, {
      YamapsMap: function(mapId, options) {
        this.map = new ymaps.Map(mapId, options.init);
        this.mapId = mapId;
        this.options = options;
        this.mapListeners = this.map.events.group();

        this.exportCoords = function(event) {
          var coords = {
            //bounds: event.get('newBounds'),
            center: event.get('newCenter'),
            zoom: event.get('newZoom')
          };
          var $storage = $('.field-yamaps-coords-' + mapId);
          $storage.val(JSON.stringify(coords));
        };

        this.exportType = function(event) {
          var type = event.get('newType');
          var $storage = $('.field-yamaps-type-' + mapId);
          $storage.val(type);
        };

        this.map.events
          .add('boundschange', this.exportCoords, this.map)
          .add('typechange', this.exportType, this.map);

        this.enableControls = function() {
          this.map.controls.add('typeSelector', {right: 5, top: 5});
          this.map.controls.add('zoomControl', {right: 5, top: 50});
          $.yaMaps._mapTools.unshift('default');
        };

        this.enableTraffic = function() {
          var traffic = new ymaps.control.TrafficControl({
            providerKey:'traffic#actual',
            shown:true
          });
          traffic.getProvider().state.set('infoLayerShown', true);
          this.map.controls.add(traffic, {top: 5, left: 5});
        };

        this.enableTools = function() {
          var mapTools = $.yaMaps.getMapTools(this);
          this.map.controls.add(new ymaps.control.MapTools(mapTools), {left: 5, bottom: 35});
        };
      }
    });
  });
})(jQuery);