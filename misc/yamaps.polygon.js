/**
 * @file
 * Polygons support plugin
 */

(function($) {
  ymaps.ready(function() {
    // Class for one polygon
    $.yaMaps.YamapsPolygon = function(geometry, properties, options) {
      this.polygon = new ymaps.Polygon(geometry, properties, options);
      this.parent = null;

      // Edit polygon mode
      this.startEditing = function(active) {
        this.polygon.editor.startEditing();
        if (active) {
          this.polygon.editor.state.set('drawing', true);
        }
        this.polygon.editor.events.add('statechange', function(e) {
          if (this.polygon.editor.state.get('editing') && !this.polygon.editor.state.get('drawing')) {
            this.openBalloon();
          }
        }, this);
      };

      // Set balloon content
      this.setContent = function(balloonContent) {
        this.polygon.properties.set('balloonContent', balloonContent);
      };

      // Set polygon colors
      this.setColor = function(strokeColor, fillColor) {
        this.polygon.options.set('strokeColor', $.yaMaps.colors[strokeColor]);
        this.polygon.options.set('fillColor', $.yaMaps.colors[fillColor]);
      };

      // Set opacity
      this.setOpacity = function(opacity) {
        this.polygon.options.set('opacity', opacity);
      };

      // Set line width
      this.setWidth = function(width) {
        this.polygon.options.set('strokeWidth', width);
      };

      // Close balloon
      this.closeBalloon = function() {
        this.polygon.balloon.close();
      };

      // Open balloon
      this.openBalloon = function() {
        this.polygon.balloon.open();
      };

      // Remove polygon from map
      this.remove = function() {
        this.getParent().remove(this);
        this.exportParent();
      };

      // Set polygon parent
      this.setParent = function(Parent) {
        this.parent = Parent;
      };

      // Get parent
      this.getParent = function() {
        return this.parent;
      };

      // Export polygon information
      this.export = function() {
        var coords = this.polygon.geometry.getCoordinates();
        var props = this.polygon.properties.getAll();
        return {
          coords: coords,
          params: {
            strokeWidth: props.strokeWidth,
            strokeColor: props.strokeColor,
            fillColor: props.fillColor,
            balloonContent: props.balloonContent,
            opacity: props.opacity
          }
        };
      };

      // Export all polygons from current map
      this.exportParent = function() {
        var collection = this.getParent();
        if (collection) {
          var mapId = collection.elements.getMap().container.getElement().parentElement.id;
          var polygons = collection.export();
          var $storage = $('.field-yamaps-polygons-' + mapId);
          $storage.val(JSON.stringify(polygons));
        }
      };

      // Actions for export polygons
      this.polygon.events
        .add('geometrychange', this.exportParent, this)
        .add('propertieschange', this.exportParent, this);

      // Polygon initialization parameters
      this.polygon.properties.set('Polygon', this);
      this.setColor(properties.strokeColor, properties.fillColor);
      this.setOpacity(properties.opacity);
      this.setWidth(properties.strokeWidth);
    };

    // Class for polygons collection
    $.yaMaps.YamapsPolygonCollection = function(options) {
      this.polygons = [];
      this.elements = new ymaps.GeoObjectCollection();
      this.elements.options.set(options);

      // Add new polygon to collection
      this.add = function(Polygon) {
        Polygon.setParent(this);
        this.polygons.push(Polygon);
        this.elements.add(Polygon.polygon);
        return Polygon;
      };

      // Create polygon and add to collection
      this.createPolygon = function(geometry, properties, options) {
        return this.add(new $.yaMaps.YamapsPolygon(geometry, properties, options));
      };

      // Remove polygon from map
      this.remove = function(Polygon) {
        this.elements.remove(Polygon.polygon);
        for (var i in this.polygons) {
          if (this.polygons[i] === Polygon) {
            this.polygons.splice(i, 1);
            break;
          }
        }
      };

      // Each polygons callback
      this.each = function(callback) {
        for (var i in this.polygons) {
          callback(this.polygons[i]);
        }
      };

      // Export collection
      this.export = function() {
        var polygons = [];
        this.each(function(Polygon) {
          polygons.push(Polygon.export());
        });
        return polygons;
      };
    };

    // Edit polygon balloon template
    $.yaMaps.addLayout('yamaps#PolygonBalloonEditLayout',
      ymaps.templateLayoutFactory.createClass(
        [
          '<div class="yamaps-balloon yamaps-polygon-edit">',
          '<div class="form-element line-colors">',
          '<label>' + Drupal.t('Line color') + '</label>',
          '$[[yamaps#ColorPicker]]',
          '</div>',
          '<div class="form-element poly-colors">',
          '<label>' + Drupal.t('Polygon color') + '</label>',
          '$[[yamaps#ColorPicker]]',
          '</div>',
          '<div class="form-element line-width">',
          '$[[yamaps#StrokeWidthLayout]]',
          '</div>',
          '<div class="form-element poly-opacity">',
          '$[[yamaps#OpacityLayout]]',
          '</div>',
          '<div class="form-element">',
          '<label for="balloonContent">' + Drupal.t('Balloon text') + '</label>',
          '<input type="text" id="balloonContent" value="$[properties.balloonContent]"/>',
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

            // Polygon background colorpicker
            this.$polyColors = $element.find('.poly-colors .yamaps-color');
            this.$polyColors.each(function() {
              var $this = $(this);
              var $div = $this.children('div');
              if (_this.properties.fillColor == $div.attr('data-content')) {
                $this.addClass('yamaps-color-active');
              }
            });
            this.$polyColors.bind('click', this, this.fillColorClick);

            // Polygon line colorpicker
            this.$lineColors = $(this.getParentElement()).find('.line-colors .yamaps-color');
            this.$lineColors.each(function() {
              var $this = $(this);
              var $div = $this.children('div');
              if (_this.properties.strokeColor == $div.attr('data-content')) {
                $this.addClass('yamaps-color-active');
              }
            });
            this.$lineColors.bind('click', this, this.strokeColorClick);

            // Opacity
            this.$opacity = $element.find('.poly-opacity select');
            this.$opacity.val(_this.properties.opacity);

            // Stroke width
            this.$width = $element.find('.line-width select');
            this.$width.val(_this.properties.strokeWidth);

            // Balloon content
            this.$balloonContent = $element.find('#balloonContent');

            // Actions
            $('#deleteButton').bind('click', this, this.onDeleteClick);
            $('#saveButton').bind('click', this, this.onSaveClick);
          },
          clear: function () {
            this.constructor.superclass.build.call(this);
            this.$polyColors.unbind('click', this, this.fillColorClick)
            this.$lineColors.unbind('click', this, this.strokeColorClick);
            $('#deleteButton').unbind('click', this, this.onDeleteClick);
            $('#saveButton').unbind('click', this, this.onSaveClick);
          },
          fillColorClick: function(e) {
            // Fill colorpicker click
            e.data.properties.fillColor = $(this).children('div').attr('data-content');
          },
          strokeColorClick: function(e) {
            // Stroke colorpicker click
            e.data.properties.strokeColor = $(this).children('div').attr('data-content');
          },
          onDeleteClick: function (e) {
            // Delete click
            e.data.properties.Polygon.remove();
            e.preventDefault();
          },
          onSaveClick: function(e) {
            // Save click
            var polygon = e.data.properties.Polygon;
            // Set opacity
            e.data.properties.opacity = e.data.$opacity.val();
            polygon.setOpacity(e.data.properties.opacity);
            // Set stroke width
            e.data.properties.strokeWidth = e.data.$width.val();
            polygon.setWidth(e.data.properties.strokeWidth);
            // Set colors
            polygon.setColor(e.data.properties.strokeColor, e.data.properties.fillColor);
            // Set balloon content
            polygon.setContent(e.data.$balloonContent.val());
            polygon.closeBalloon();
          }
        }
      )
    );

    // Add polygons support to map
    $.yaMaps.addMapTools(function(Map) {
      // Default options
      var options = {
        balloonMaxWidth: 300,
        balloonCloseButton: true,
        strokeWidth: 3,
        elements: {}
      };
      if (Map.options.edit) {
        // If map in edit mode set edit mode to polygons options
        options.balloonContentBodyLayout = 'yamaps#PolygonBalloonEditLayout';
        options.draggable = true;
      }

      // Create polygons collection
      var polygonsCollection = new $.yaMaps.YamapsPolygonCollection(options);

      // Add empty collection to the map
      Map.map.geoObjects.add(polygonsCollection.elements);

      // Add already created polygons to map
      for (var i in Map.options.polygons) {
        var Polygon = polygonsCollection.add(new $.yaMaps.YamapsPolygon(Map.options.polygons[i].coords, Map.options.polygons[i].params));
        if (Map.options.edit) {
          Polygon.startEditing();
        }
      }

      // If map in view mode exit
      if (!Map.options.edit) {
        return;
      }

      // If map in edit mode set map click listener to adding new polygon
      var mapClick = function(event) {
        var Polygon = new $.yaMaps.YamapsPolygon([[event.get('coordPosition')]], {balloonContent: '', fillColor: 'lightblue', strokeColor: 'blue', opacity: 0.6, strokeWidth: 3});
        polygonsCollection.add(Polygon);
        Polygon.startEditing(true);
      };

      // Add new button
      var polygonButton = new ymaps.control.Button({
        data: {
          content: '<ymaps class="ymaps-b-form-button__text"><ymaps class="ymaps-b-ico ymaps-b-ico_type_poly"></ymaps></ymaps>',
          title: Drupal.t('Drawing polygons')
        }
      });

      // Button actions
      polygonButton.events
        .add('select', function(event) {
          Map.cursor = Map.map.cursors.push('pointer');
          Map.mapListeners.add('click', mapClick);
        })
        .add('deselect', function(event) {
          Map.cursor.remove();
          Map.mapListeners.remove('click', mapClick);
        });

      return polygonButton;
    });
  });
})(jQuery);
