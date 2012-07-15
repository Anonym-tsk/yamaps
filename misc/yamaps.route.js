(function($) {
  ymaps.ready(function() {
    $.yaMaps.addMapTools(function(Map) {
      var firstPoint = null;
      var secondPoint = null;
      var exportRoute = function(start, end) {
        var mapId = Map.map.container.getElement().parentElement.id;
        var $storage = $('.field-yamaps-routes-' + mapId);
        if (!start || !end) {
          $storage.val('');
        }
        else {
          $storage.val(JSON.stringify([start, end]));
        }
      };
      var writeRoute = function(start, end, route) {
        ymaps.route([start, end], {mapStateAutoApply: false}).then(
          function (newRoute) {
            if (route) {
              Map.map.geoObjects.remove(route);
            }
            Map.map.geoObjects.add(newRoute);

            var points = newRoute.getWayPoints();
            var pointStart = points.get(0);
            var pointEnd = points.get(1);
            pointStart.options.set('preset', 'twirl#carIcon');
            pointEnd.options.set('preset', 'twirl#houseIcon');

            if (Map.options.edit) {
              exportRoute(start, end);

              points.options.set('draggable', true);
              points.events.add('dragend', function() {
                writeRoute(this.start.geometry.getCoordinates(), this.end.geometry.getCoordinates(), newRoute);
              }, {start: pointStart, end: pointEnd});

              points.events.add('click', function() {
                Map.map.geoObjects.remove(this);
                firstPoint = secondPoint = null;
                exportRoute(null, null);
              }, newRoute);
            }
          },
          function (error) {
            if (!route) {
              firstPoint = secondPoint = null;
            }
            alert(Drupal.t('Error found') + ": " + error.message);
          }
        );
      };

      if (Map.options.routes) {
        firstPoint = Map.options.routes[0];
        secondPoint = Map.options.routes[1];
        writeRoute(firstPoint, secondPoint);
      }

      if (!Map.options.edit) {
        return;
      }

      var mapClick = function(event) {
        if (!firstPoint) {
          firstPoint = new ymaps.Placemark(event.get('coordPosition'), {}, {
            balloonCloseButton: true,
            preset: 'twirl#carIcon'
          });
          Map.map.geoObjects.add(firstPoint);
        }
        else if (!secondPoint) {
          var first = firstPoint.geometry.getCoordinates();
          Map.map.geoObjects.remove(firstPoint);
          secondPoint = event.get('coordPosition');
          writeRoute(first, secondPoint, null);
        }
        else {
          alert(Drupal.t('The route is already on this map'));
        }
      };

      var routeButton = new ymaps.control.Button({
        data: {
          content: '<ymaps class="ymaps-b-form-button__text"><ymaps class="ymaps-b-ico ymaps-b-ico_type_route"></ymaps></ymaps>',
          title: Drupal.t('Laying routes')
        }
      });

      routeButton.events
        .add('select', function(event) {
          Map.cursor = Map.map.cursors.push('pointer');
          Map.mapListeners.add('click', mapClick);
        })
        .add('deselect', function(event) {
          Map.cursor.remove();
          Map.mapListeners.remove('click', mapClick);
        });

      return routeButton;
    });
  });
})(jQuery);