/**
 * @file
 * Polylines support plugin
 */

(function($) {
  ymaps.ready(function() {
    // Class for one line
    $.yaMaps.YamapsLine = function(geometry, properties, options) {
      this.line = new ymaps.Polyline(geometry, properties, options);
      this.parent = null;

      // Edit line mode
      this.startEditing = function(active) {
        this.line.editor.startEditing();
        if (active) {
          this.line.editor.state.set('drawing', true);
        }
        this.line.editor.events.add('statechange', function(e) {
          if (this.line.editor.state.get('editing') && !this.line.editor.state.get('drawing')) {
            this.openBalloon();
          }
        }, this);
      };

      // Set balloon content
      this.setContent = function(balloonContent) {
        this.line.properties.set('balloonContent', balloonContent);
      };

      // Set line color
      this.setColor = function(strokeColor) {
        this.line.options.set('strokeColor', $.yaMaps.colors[strokeColor]);
      };

      // Set line opacity
      this.setOpacity = function(opacity) {
        this.line.options.set('opacity', opacity);
      };

      // Set line width
      this.setWidth = function(width) {
        this.line.options.set('strokeWidth', width);
      };

      // Close balloon
      this.closeBalloon = function() {
        this.line.balloon.close();
      };

      // Open balloon
      this.openBalloon = function() {
        this.line.balloon.open();
      };

      // Remove line
      this.remove = function() {
        this.getParent().remove(this);
        this.exportParent();
      };

      // Set line parent object
      this.setParent = function(Parent) {
        this.parent = Parent;
      };

      // Get line parent
      this.getParent = function() {
        return this.parent;
      };

      // Export lines information
      this.export = function() {
        var coords = this.line.geometry.getCoordinates();
        var props = this.line.properties.getAll();
        return {
          coords: coords,
          params: {
            strokeWidth: props.strokeWidth,
            strokeColor: props.strokeColor,
            balloonContent: props.balloonContent,
            opacity: props.opacity
          }
        };
      };

      // Export all lines on this map to html container
      this.exportParent = function() {
        var collection = this.getParent();
        if (collection) {
          var mapId = collection.elements.getMap().container.getElement().parentElement.id;
          var lines = collection.export();
          // Hardcoded html class
          var $storage = $('.field-yamaps-lines-' + mapId);
          $storage.val(JSON.stringify(lines));
        }
      };

      // Actions for export lines
      this.line.events
        .add('geometrychange', this.exportParent, this)
        .add('propertieschange', this.exportParent, this);

      // Line initialization parameters
      this.line.properties.set('Line', this);
      this.setColor(properties.strokeColor);
      this.setOpacity(properties.opacity);
      this.setWidth(properties.strokeWidth);
    };

    // Class for lines collection
    $.yaMaps.YamapsLineCollection = function(options) {
      this.lines = [];
      this.elements = new ymaps.GeoObjectCollection();
      this.elements.options.set(options);

      // Add new line to collection
      this.add = function(Line) {
        Line.setParent(this);
        this.lines.push(Line);
        this.elements.add(Line.line);
        return Line;
      };

      // Create line and add to collection
      this.createLine = function(geometry, properties, options) {
        return this.add(new $.yaMaps.YamapsLine(geometry, properties, options));
      };

      // Remove line from map
      this.remove = function(Line) {
        this.elements.remove(Line.line);
        for (var i in this.lines) {
          if (this.lines[i] === Line) {
            this.lines.splice(i, 1);
            break;
          }
        }
      };

      // Each lines callback
      this.each = function(callback) {
        for (var i in this.lines) {
          callback(this.lines[i]);
        }
      };

      // Export collection
      this.export = function() {
        var lines = [];
        this.each(function(Line) {
          lines.push(Line.export());
        });
        return lines;
      };
    };

    // Edit line balloon template
    $.yaMaps.addLayout('yamaps#LineBalloonEditLayout',
      ymaps.templateLayoutFactory.createClass(
        [
          '<div class="yamaps-balloon yamaps-line-edit">',
          '<div class="form-element line-colors">',
          '<label>' + Drupal.t('Line color') + '</label>',
          '$[[yamaps#ColorPicker]]',
          '</div>',
          '<div class="form-element line-width">',
          '$[[yamaps#StrokeWidthLayout]]',
          '</div>',
          '<div class="form-element line-opacity">',
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

            // Line colorpicker
            this.$lineColors = $element.find('.line-colors .yamaps-color');
            this.$lineColors.each(function() {
              // Set colorpicker parameters
              var $this = $(this);
              var $div = $this.children('div');
              if (_this.properties.strokeColor == $div.attr('data-content')) {
                $this.addClass('yamaps-color-active');
              }
            });
            this.$lineColors.bind('click', this, this.strokeColorClick);

            // Opacity
            this.$opacity = $element.find('.line-opacity select');
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
            this.$lineColors.unbind('click', this, this.strokeColorClick);
            $('#deleteButton').unbind('click', this, this.onDeleteClick);
            $('#saveButton').unbind('click', this, this.onSaveClick);

          },
          strokeColorClick: function(e) {
            // Click to colorpicker
            e.data.properties.strokeColor = $(this).children('div').attr('data-content');
          },
          onDeleteClick: function (e) {
            // Delete link click
            e.data.properties.Line.remove();
            e.preventDefault();
          },
          onSaveClick: function(e) {
            // Save button click
            var line = e.data.properties.Line;
            // Set opacity
            e.data.properties.opacity = e.data.$opacity.val();
            line.setOpacity(e.data.properties.opacity);
            // Set width
            e.data.properties.strokeWidth = e.data.$width.val();
            line.setWidth(e.data.properties.strokeWidth);
            // Set color
            line.setColor(e.data.properties.strokeColor);
            // Set balloon content
            line.setContent(e.data.$balloonContent.val());
            // Close balloon
            line.closeBalloon();
          }
        }
      )
    );

    // Add lines support to map
    $.yaMaps.addMapTools(function(Map) {
      // Default options
      var options = {
        balloonMaxWidth: 300,
        balloonCloseButton: true,
        strokeWidth: 3,
        elements: {}
      };
      if (Map.options.edit) {
        // If map in edit mode set edit mode to lines options
        options.balloonContentLayout = 'yamaps#LineBalloonEditLayout';
        options.draggable = true;
      }

      // Create lines collection
      var linesCollection = new $.yaMaps.YamapsLineCollection(options);

      // Add empty collection to the map
      Map.map.geoObjects.add(linesCollection.elements);

      // Add already created lines to map
      for (var i in Map.options.lines) {
        var Line = linesCollection.add(new $.yaMaps.YamapsLine(Map.options.lines[i].coords, Map.options.lines[i].params));
        if (Map.options.edit) {
          if (Map.options.edit) {
            Line.startEditing();
          }
        }
      }

      // If map in view mode exit
      if (!Map.options.edit) {
        return;
      }

      // If map in edit mode set map click listener to adding new line
      var mapClick = function(event) {
        var Line = new $.yaMaps.YamapsLine([event.get('coordPosition')], {balloonContent: '', strokeColor: 'blue', opacity: 0.8, strokeWidth: 3});
        linesCollection.add(Line);
        Line.startEditing(true);
      };

      // Add new button
      var lineButton = new ymaps.control.Button({
        data: {
          content: '<ymaps class="ymaps-b-form-button__text"><ymaps class="ymaps-b-ico ymaps-b-ico_type_line"></ymaps></ymaps>',
          title: Drupal.t('Drawing lines')
        }
      });

      // Button actions
      lineButton.events
        .add('select', function(event) {
          Map.cursor = Map.map.cursors.push('pointer');
          Map.mapListeners.add('click', mapClick);
        })
        .add('deselect', function(event) {
          Map.cursor.remove();
          Map.mapListeners.remove('click', mapClick);
        });

      return lineButton;
    });
  });
})(jQuery);
