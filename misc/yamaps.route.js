/**
 * @file
 * Routes support plugin
 */

(function($) {
  ymaps.ready(function() {
    // Add routes support to map
    $.yaMaps.addMapTools(function(Map) {
      // Start and end of route
      var firstPoint = null;
      var secondPoint = null;

      // Export route to html element
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

      // Write route on map
      var writeRoute = function(start, end, route) {
        ymaps.route([start, end], {mapStateAutoApply: false}).then(
          function (newRoute) {
            // If route already added - remove it
            if (route) {
              Map.map.geoObjects.remove(route);
            }
            // Add new route to map
            Map.map.geoObjects.add(newRoute);

            // Create placemarks
            var points = newRoute.getWayPoints();
            var pointStart = points.get(0);
            var pointEnd = points.get(1);
            pointStart.options.set('preset', 'twirl#carIcon');
            pointEnd.options.set('preset', 'twirl#houseIcon');

            if (Map.options.edit) {
              // If map in edit mode - export route
              exportRoute(start, end);

              // Set points edit mode
              points.options.set('draggable', true);

              // Rewrite route when point moved
              points.events.add('dragend', function() {
                writeRoute(this.start.geometry.getCoordinates(), this.end.geometry.getCoordinates(), newRoute);
              }, {start: pointStart, end: pointEnd});

              // Delete route when point clicked
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

      // Add already created route to map
      if (Map.options.routes) {
        firstPoint = Map.options.routes[0];
        secondPoint = Map.options.routes[1];
        writeRoute(firstPoint, secondPoint);
      }

      // If map in view mode - exit
      if (!Map.options.edit) {
        return;
      }

      // If map in edit mode set map click listener to adding route
      var mapClick = function(event) {
        if (!firstPoint) {
          // First click - create placemark
          firstPoint = new ymaps.Placemark(event.get('coordPosition'), {}, {
            balloonCloseButton: true,
            preset: 'twirl#carIcon'
          });
          Map.map.geoObjects.add(firstPoint);
        }
        else if (!secondPoint) {
          // Second click - remove placemark and add route
          var first = firstPoint.geometry.getCoordinates();
          Map.map.geoObjects.remove(firstPoint);
          secondPoint = event.get('coordPosition');
          writeRoute(first, secondPoint, null);
        }
        else {
          // Third click - alert
          alert(Drupal.t('The route is already on this map'));
        }
      };

      // Add new button
      var routeButton = new ymaps.control.Button({
        data: {
          content: '<ymaps class="ymaps-b-form-button__text"><ymaps class="ymaps-b-ico ymaps-b-ico_type_route"></ymaps></ymaps>',
          title: Drupal.t('Laying routes')
        }
      });

      // Button actions
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
