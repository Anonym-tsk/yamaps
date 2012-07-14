<?php

function yamaps_field_formatter_info() {
  return array(
    'field_yamaps_formatter_dynamic' => array(
      'label' => t('Dynamic'),
      'field types' => array('field_yamaps'),
      'settings' => array(
        'controls' => TRUE,
        'traffic' => TRUE,
        'width' => 640,
        'height' => 400,
      ),
    ),
    'field_yamaps_formatter_static' => array(
      'label' => t('Static'),
      'field types' => array('field_yamaps'),
      'settings' => array(
        'traffic' => FALSE,
        'width' => 640,
        'height' => 400,
      ),
    ),
  );
}

function yamaps_field_formatter_settings_form($field, $instance, $view_mode, $form, &$form_state) {
  $display = $instance['display'][$view_mode];
  $settings = $display['settings'];
  $element = array();

  switch ($display['type']) {
    case 'field_yamaps_formatter_dynamic':
      $element['controls'] = array(
        '#title' => t('Show controls'),
        '#type' => 'checkbox',
        '#default_value' => $settings['controls'],
      );
      $element['traffic'] = array(
        '#title' => t('Show traffic'),
        '#type' => 'checkbox',
        '#default_value' => $settings['traffic'],
      );
      $element['width'] = array(
        '#title' => t('Map width (px)'),
        '#type' => 'textfield',
        '#default_value' => $settings['width'],
        '#size' => 5,
        '#element_validate' => array('element_validate_integer_positive'),
        '#required' => TRUE,
      );
      $element['height'] = array(
        '#title' => t('Map height (px)'),
        '#type' => 'textfield',
        '#default_value' => $settings['height'],
        '#size' => 5,
        '#element_validate' => array('element_validate_integer_positive'),
        '#required' => TRUE,
      );
      break;
    case 'field_yamaps_formatter_static':
      $element['traffic'] = array(
        '#title' => t('Show traffic'),
        '#type' => 'checkbox',
        '#default_value' => $settings['traffic'],
      );
      $element['width'] = array(
        '#title' => t('Map width (px)'),
        '#type' => 'textfield',
        '#default_value' => $settings['width'],
        '#size' => 5,
        '#element_validate' => array('element_validate_integer_positive'),
        '#required' => TRUE,
      );
      $element['height'] = array(
        '#title' => t('Map height (px)'),
        '#type' => 'textfield',
        '#default_value' => $settings['height'],
        '#size' => 5,
        '#element_validate' => array('element_validate_integer_positive'),
        '#required' => TRUE,
      );
      break;
  }
  return $element;
}

function yamaps_field_formatter_settings_summary($field, $instance, $view_mode) {
  $display = $instance['display'][$view_mode];
  $settings = $display['settings'];
  $summary = array();

  switch ($display['type']) {
    case 'field_yamaps_formatter_dynamic':
      $summary[] = t('Show controls: @controls', array('@controls' => $settings['controls'] ? t('Yes') : t('No')));
      $summary[] = t('Show traffic: @traffic', array('@traffic' => $settings['traffic'] ? t('Yes') : t('No')));
      $summary[] = t('Map size: @width x @height', array('@width' => $settings['width'], '@height' => $settings['height']));
      break;
    case 'field_yamaps_formatter_static':
      $summary[] = t('Show traffic: @traffic', array('@traffic' => $settings['traffic'] ? t('Yes') : t('No')));
      $summary[] = t('Map size: @width x @height', array('@width' => $settings['width'], '@height' => $settings['height']));
      break;
  }

  return implode('<br />', $summary);
}

function yamaps_field_formatter_view($entity_type, $entity, $field, $instance, $langcode, $items, $display) {
  $element = array();
  $settings = $display['settings'];

  switch ($display['type']) {
    case 'field_yamaps_formatter_dynamic':
      $maps = array();
      foreach ($items as $delta => $item) {
        $id = 'ymap-'.$delta;
        $coords = drupal_json_decode($item['coords']);
        $maps[$id] = array(
          'init' => array(
            'center' => $coords['center'],
            'zoom' => $coords['zoom'],
            'type' => $item['type'] ? $item['type'] : 'yandex#map',
            'behaviors' => array('scrollZoom', 'dblClickZoom', 'drag'),
          ),
          'controls' => $settings['controls'],
          'traffic' => $settings['traffic'],
          'placemarks' => drupal_json_decode($item['placemarks']),
          'lines' => drupal_json_decode($item['lines']),
          'polygons' => drupal_json_decode($item['polygons']),
          'edit' => FALSE,
        );
        $element[$delta] = array(
          '#type' => 'html_tag',
          '#tag' => 'div',
          '#attributes' => array(
            'id' => $id,
            'style' => 'width:'.$settings['width'].'px;height:'.$settings['height'].'px'
          ),
          '#value' => ''
        );
      }

      drupal_add_js(array('yamaps' => $maps), 'setting');
      drupal_add_library('yamaps', 'yamaps.full');

      break;
    case 'field_yamaps_formatter_static':
      foreach ($items as $delta => $item) {
        $id = 'ymap-'.$delta;
        $coords = drupal_json_decode($item['coords']);
        $params = array();
        $url = 'http://static-maps.yandex.ru/1.x/';
        $params['ll'] = end($coords['center']).','.reset($coords['center']);
        $params['z'] = $coords['zoom'];
        $params['size'] = $settings['width'].','.$settings['height'];

        $mapTypes = array(
          'yandex#map' => 'map',
          'yandex#satellite' => 'sat',
          'yandex#hybrid' => 'sat,skl',
          'yandex#publicMap' => 'pmap',
          'yandex#publicMapHybrid' => 'sat,pskl',
        );
        $params['l'] = $mapTypes[$item['type'] ? $item['type'] : 'yandex#map'];
        if ($settings['traffic']) {
          $params['l'] .= ',trf';
        }

        $colors21 = array(
          'blue' => 'bl',
          'lightblue' => 'lb',
          'night' => 'nt',
          'darkblue' => 'db',
          'green' => 'gn',
          'white' => 'wt',
          'red' => 'rd',
          'orange' => 'or',
          'darkorange' => 'do',
          'yellow' => 'yw',
          'violet' => 'vv',
          'pink' => 'pn',
        );
        $colors = array(
          'blue' => '006cff',
          'lightblue' => '66c7ff',
          'night' => '004056',
          'darkblue' => '00339a',
          'green' => '33cc00',
          'white' => 'ffffff',
          'red' => 'ff0000',
          'orange' => 'ffb400',
          'darkorange' => 'ff6600',
          'yellow' => 'ffea00',
          'violet' => 'b832fd',
          'pink' => 'fd32fb',
        );

        $pt = array();
        foreach (drupal_json_decode($item['placemarks']) as $placemark) {
          $pm = end($placemark['coords']).','.reset($placemark['coords']).',';
          $pm .= 'pm2';
          $pm .= $colors21[$placemark['params']['color']];
          $pm .= 'm';
          $pt[] = $pm;
        }
        $params['pt'] = implode('~', $pt);

        $pl = array();
        foreach (drupal_json_decode($item['lines']) as $line) {
          $opts = $line['params'];
          $pm = 'c:'.$colors[$opts['strokeColor']]. dechex(255 * $opts['opacity']) . ',';
          $pm .= 'w:'.$opts['strokeWidth'].',';
          $c = array();
          foreach ($line['coords'] as $coords) {
            $c[] = end($coords);
            $c[] = reset($coords);
          }
          $pm .= implode(',', $c);
          $pl[] = $pm;
        }

        foreach (drupal_json_decode($item['polygons']) as $polygon) {
          $opts = $polygon['params'];
          $opa = dechex(255 * $opts['opacity']);
          $pm = 'c:'.$colors[$opts['strokeColor']]. $opa . ',';
          $pm .= 'f:'.$colors[$opts['fillColor']]. $opa . ',';
          $pm .= 'w:'.$opts['strokeWidth'].',';
          $c = array();
          foreach ($polygon['coords'] as $coordsA) {
            foreach ($coordsA as $coords) {
              $c[] = end($coords);
              $c[] = reset($coords);
            }
          }
          $pm .= implode(',', $c);
          $pl[] = $pm;
        }
        $params['pl'] = implode('~', $pl);

        $element[$delta] = array(
          '#type' => 'html_tag',
          '#tag' => 'div',
          '#attributes' => array(
            'id' => $id,
            'style' => 'width:'.$settings['width'].'px;height:'.$settings['height'].'px'
          ),
          '#value' => theme('image', array(
            'path' => url($url, array('query' => $params, 'external' => TRUE)),
            'width' => $settings['width'],
            'height' => $settings['height'],
            'title' => t('Yandex.Map'),
          )),
        );
      }
      break;
  }

  return $element;
}
