<?php

function yamaps_field_formatter_info() {
  return array(
    'field_yamaps_formatter' => array(
      'label' => t('Yandex map'),
      'field types' => array('field_yamaps'),
      'settings' => array(
        'controls' => TRUE,
        'traffic' => TRUE,
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
    case 'field_yamaps_formatter':
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
  }
  return $element;
}

function yamaps_field_formatter_settings_summary($field, $instance, $view_mode) {
  $display = $instance['display'][$view_mode];
  $settings = $display['settings'];
  $summary = array();

  switch ($display['type']) {
    case 'field_yamaps_formatter':
      $summary[] = t('Show controls: @controls', array('@controls' => $settings['controls'] ? t('Yes') : t('No')));
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
    case 'field_yamaps_formatter':
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
  }

  return $element;
}
