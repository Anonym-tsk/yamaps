/**
 * @file
 * Placemarks support plugin
 */

(function($) {
  ymaps.ready(function() {
    // Class for one placemark
    $.yaMaps.YamapsPlacemark = function(geometry, properties, options) {
      this.placemark = new ymaps.Placemark(geometry, properties, options);
      this.parent = null;

      // Set placemark icon and balloon content
      this.setContent = function(iconContent, balloonContent) {
        this.placemark.properties.set('iconContent', iconContent);
        this.placemark.properties.set('balloonContentHeader', iconContent);
        this.placemark.properties.set('balloonContentBody', balloonContent);
      };

      // Set placemark color
      this.setColor = function(color) {
        var preset = 'twirl#' + color;
        preset += this.placemark.properties.get('iconContent') ? 'StretchyIcon' : 'DotIcon';
        this.placemark.options.set('preset', preset)
      };

      // Close balloon
      this.closeBalloon = function() {
        this.placemark.balloon.close();
      };

      // Open balloon
      this.openBalloon = function() {
        this.placemark.balloon.open();
      };

      // Remove placemark
      this.remove = function() {
        this.getParent().remove(this);
        this.exportParent();
      };

      // Set placemark parent
      this.setParent = function(Parent) {
        this.parent = Parent;
      };

      // Get parent
      this.getParent = function() {
        return this.parent;
      };

      // Export placemark information
      this.export = function() {
        var coords = this.placemark.geometry.getCoordinates();
        var props = this.placemark.properties.getAll();
        return {
          coords: coords,
          params: {
            color: props.color,
            iconContent: props.iconContent,
            balloonContentBody: props.balloonContentBody,
            balloonContentHeader: props.iconContent
          }
        };
      };

      // Export all placemarks from this map
      this.exportParent = function() {
        var collection = this.getParent();
        if (collection) {
          var mapId = collection.elements.getMap().container.getElement().parentElement.id;
          var placemarks = collection.export();
          var $storage = $('.field-yamaps-placemarks-' + mapId);
          $storage.val(JSON.stringify(placemarks));
        }
      };

      // Placemark events for export
      this.placemark.events
        .add('dragend', this.exportParent, this)
        .add('propertieschange', this.exportParent, this);

      // Set placemark params
      this.placemark.properties.set('Placemark', this);
      this.setColor(properties.color);
    };

    // Placemarks collection class
    $.yaMaps.YamapsPlacemarkCollection = function(options) {
      this.placemarks = [];
      this.elements = new ymaps.GeoObjectCollection();
      this.elements.options.set(options);

      // Add new placemark to collection
      this.add = function(Placemark) {
        Placemark.setParent(this);
        this.placemarks.push(Placemark);
        this.elements.add(Placemark.placemark);
        return Placemark;
      };

      // Create placemark and add to collection
      this.createPlacemark = function(geometry, properties, options) {
        return this.add(new $.yaMaps.YamapsPlacemark(geometry, properties, options));
      };

      // Remove placemark
      this.remove = function(Placemark) {
        this.elements.remove(Placemark.placemark);
        for (var i in this.placemarks) {
          if (this.placemarks[i] === Placemark) {
            this.placemarks.splice(i, 1);
            break;
          }
        }
      };

      // Each placemarks callback
      this.each = function(callback) {
        for (var i in this.placemarks) {
          callback(this.placemarks[i]);
        }
      };

      // Export collection
      this.export = function() {
        var placemarks = [];
        this.each(function(Placemark) {
          placemarks.push(Placemark.export());
        });
        return placemarks;
      };
    };

    // Edit placemark balloon template
    $.yaMaps.addLayout('yamaps#PlacemarkBalloonEditLayout',
      ymaps.templateLayoutFactory.createClass(
        [
          '<div class="yamaps-balloon yamaps-placemark-edit">',
          '<div class="form-element">',
          '<label for="iconContent">' + Drupal.t('Placemark text') + '</label>',
          '<input type="text" id="iconContent" value="$[properties.iconContent]"/>',
          '</div>',
          '<div class="form-element placemark-colors">',
          '<label>' + Drupal.t('Color') + '</label>',
          '$[[yamaps#ColorPicker]]',
          '</div>',
          '<div class="form-element">',
          '<label for="balloonContent">' + Drupal.t('Balloon text') + '</label>',
          '<input type="text" id="balloonContent" value="$[properties.balloonContentBody]"/>',
          '</div>',
          '$[[yamaps#ActionsButtons]]',
          '</div>'
        ].join(""),
        {
          build: function () {
            this.constructor.superclass.build.call(this);
            this.properties = this.getData().properties.getAll();
            // Balloon HTML element
            var $element = $(this.getParentElement());
            var _this = this;

            // Placemark colorpicker
            this.$placemarkColors = $(this.getParentElement()).find('.placemark-colors .yamaps-color');
            this.$placemarkColors.each(function() {
              var $this = $(this);
              var $div = $this.children('div');
              if (_this.properties.color == $div.attr('data-content')) {
                $this.addClass('yamaps-color-active');
              }
            });
            this.$placemarkColors.bind('click', this, this.colorClick);

            // Placemark icon and balloon content
            this.$iconContent = $element.find('#iconContent');
            this.$balloonContent = $element.find('#balloonContent');

            // Actions
            $('#deleteButton').bind('click', this, this.onDeleteClick);
            $('#saveButton').bind('click', this, this.onSaveClick);
          },
          clear: function () {
            this.constructor.superclass.build.call(this);
            this.$placemarkColors.unbind('click', this, this.colorClick);
            $('#deleteButton').unbind('click', this, this.onDeleteClick);
            $('#saveButton').unbind('click', this, this.onSaveClick);

          },
          colorClick: function(e) {
            // Colorpicker click
            e.data.properties.color = $(this).children('div').attr('data-content');
          },
          onDeleteClick: function (e) {
            // Delete click
            e.data.properties.Placemark.remove();
            e.preventDefault();
          },
          onSaveClick: function(e) {
            // Save click
            var placemark = e.data.properties.Placemark;
            // Save content, color and close balloon
            placemark.setContent(e.data.$iconContent.val(), e.data.$balloonContent.val());
            placemark.setColor(e.data.properties.color);
            placemark.closeBalloon();
          }
        }
      )
    );

    // Add placemarks support to map
    $.yaMaps.addMapTools(function(Map) {
      // Default options
      var options = {
        balloonMaxWidth: 300,
        balloonCloseButton: true
      };
      if (Map.options.edit) {
        // If map in edit mode set edit mode to placemarks options
        options.balloonContentLayout = 'yamaps#PlacemarkBalloonEditLayout';
        options.draggable = true;
      }

      // Create new collection
      var placemarksCollection = new $.yaMaps.YamapsPlacemarkCollection(options);

      // Add already created elements to collection
      for (var i in Map.options.placemarks) {
        placemarksCollection.add(new $.yaMaps.YamapsPlacemark(Map.options.placemarks[i].coords, Map.options.placemarks[i].params));
      }
      // Add collection to the map
      Map.map.geoObjects.add(placemarksCollection.elements);

      // If map in view mode exit
      if (!Map.options.edit) {
        return;
      }

      // If map in edit mode add search form
      var $searchForm = $([
        '<form id="yamaps-search-form">',
        '<input type="text" class="form-text" placeholder="' + Drupal.t('Search on the map') + '" value=""/>',
        '<input type="submit" class="form-submit" value="Найти"/>',
        '</form>'].join(''));

      $searchForm.bind('submit', function (e) {
        var searchQuery = $searchForm.children('input').val();
        // Find one element
        ymaps.geocode(searchQuery, {results: 1}, {results: 100}).then(function (res) {
          var geoObject = res.geoObjects.get(0);
          if (!geoObject) {
            alert(Drupal.t('Not found'));
            return;
          }
          var coordinates = geoObject.geometry.getCoordinates();
          var params = geoObject.properties.getAll();
          // Create new placemark
          var Placemark = new $.yaMaps.YamapsPlacemark(coordinates, {
            iconContent: params.name,
            balloonHeaderContent: params.name,
            balloonContentBody: params.description,
            color: 'white'
          });
          placemarksCollection.add(Placemark);
          Placemark.openBalloon();
          // Pan to new placemark
          Map.map.panTo(coordinates, {
            checkZoomRange: false,
            delay: 0,
            duration: 1000,
            flying: true
          });
        });
        e.preventDefault();
      });
      // Add search form after current map
      $searchForm.insertAfter('#' + Map.mapId);

      // Map click listener to adding new placemark
      var mapClick = function(event) {
        var Placemark = placemarksCollection.createPlacemark(event.get('coordPosition'), {iconContent: '', color: 'blue', balloonContentBody: '', balloonContentHeader: ''});
        Placemark.openBalloon();
      };

      // New button
      var pointButton = new ymaps.control.Button({
        data: {
          content: '<ymaps class="ymaps-b-form-button__text"><ymaps class="ymaps-b-ico ymaps-b-ico_type_point"></ymaps></ymaps>',
          title: Drupal.t('Setting points')
        }
      });

      // Button events
      pointButton.events
        .add('select', function(event) {
          Map.cursor = Map.map.cursors.push('pointer');
          Map.mapListeners.add('click', mapClick);
        })
        .add('deselect', function(event) {
          Map.cursor.remove();
          Map.mapListeners.remove('click', mapClick);
        });

      return pointButton;
    });
  });
})(jQuery);
