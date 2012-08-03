/**
 * @file
 * Base layouts
 */

(function($) {
  ymaps.ready(function() {
    // Available colors
    $.yaMaps.colors = {
      blue: '#006cff',
      lightblue: '#66c7ff',
      night: '#004056',
      darkblue: '#00339a',
      green: '#33cc00',
      white: '#ffffff',
      red: '#ff0000',
      orange: '#ffb400',
      darkorange: '#ff6600',
      yellow: '#ffea00',
      violet: '#b832fd',
      pink: '#fd32fb'
    };
    // HTML for colorpicker
    $.yaMaps.colorsHTML = '';
    for (var i in $.yaMaps.colors) {
      $.yaMaps.colorsHTML += '<div class="yamaps-color"><div data-content="' + i + '">' + $.yaMaps.colors[i] + '</div></div>';
    }

    // Opacity select layout
    $.yaMaps.addLayout('yamaps#OpacityLayout', ymaps.templateLayoutFactory.createClass([
      '<label for="opacity">' + Drupal.t('Opacity') + '</label>',
      '<select id="opacity">',
      '<option value="1">100%</option>',
      '<option value="0.9">90%</option>',
      '<option value="0.8">80%</option>',
      '<option value="0.7">70%</option>',
      '<option value="0.6">60%</option>',
      '<option value="0.5">50%</option>',
      '<option value="0.4">40%</option>',
      '<option value="0.3">30%</option>',
      '<option value="0.2">20%</option>',
      '<option value="0.1">10%</option>',
      '</select>'
    ].join('')));

    // Stroke width layout
    $.yaMaps.addLayout('yamaps#StrokeWidthLayout', ymaps.templateLayoutFactory.createClass([
      '<label for="strokeWidth">' + Drupal.t('Stroke width') + '</label>',
      '<select id="strokeWidth">',
      '<option value="7">' + Drupal.t('Very bold') + '</option>',
      '<option value="5">' + Drupal.t('Bold') + '</option>',
      '<option value="3">' + Drupal.t('Normal') + '</option>',
      '<option value="2">' + Drupal.t('Slim') + '</option>',
      '<option value="1">' + Drupal.t('Very slim') + '</option>',
      '</select>'
    ].join('')));

    // ColorPicker layout
    $.yaMaps.addLayout('yamaps#ColorPicker', ymaps.templateLayoutFactory.createClass(
      '<div class="yamaps-colors">' + $.yaMaps.colorsHTML + '</div>',
      {
        build: function () {
          this.constructor.superclass.build.call(this);
          this.$elements = $(this.getParentElement()).find('.yamaps-color');
          this.$elements.each(function() {
            var $div = $(this).children('div');
            $div.css('background-color', $div.text());
          });
          this.$elements.bind('click', this, this.colorClick)
        },
        clear: function () {
          this.constructor.superclass.build.call(this);
          this.$elements.unbind('click', this, this.colorClick)
        },
        colorClick: function(e) {
          e.data.$elements.removeClass('yamaps-color-active');
          $(this).addClass('yamaps-color-active');
        }
      }
    ));

    // Ballon actions layout
    $.yaMaps.addLayout('yamaps#ActionsButtons', ymaps.templateLayoutFactory.createClass(
      '<div class="actions"><a id="deleteButton" href="#">' +
        Drupal.t('Delete') +
        '</a><input id="saveButton" type="button" value="' +
        Drupal.t('Save') +
        '"/></div>'
    ));
  });
})(jQuery);
