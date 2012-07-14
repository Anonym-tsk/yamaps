<?php

/**
 * @file
 * Yandex.Maps block.
 */


/**
 * Implements hook_block_info().
 */
function yamaps_block_info() {
  $blocks['yamaps'] = array(
    'info' => t('Yandex.Map'),
    'cache' => DRUPAL_CACHE_GLOBAL,
  );
  return $blocks;
}

/**
 * Implements hook_block_configure().
 */
function yamaps_block_configure($delta = '') {
  $form = array();
  if ($delta == 'yamaps') {
    $form['yamaps_block_controls'] = array(
      '#title' => t('Show controls'),
      '#type' => 'checkbox',
      '#default_value' => variable_get('yamaps_block_controls', TRUE),
    );
    $form['yamaps_block_traffic'] = array(
      '#title' => t('Show traffic'),
      '#type' => 'checkbox',
      '#default_value' => variable_get('yamaps_block_traffic', FALSE),
    );
    $form['yamaps_block_width'] = array(
      '#title' => t('Map width (px)'),
      '#type' => 'textfield',
      '#default_value' => variable_get('yamaps_block_width', 168),
      '#size' => 5,
      '#element_validate' => array('element_validate_integer_positive'),
      '#required' => TRUE,
    );
    $form['yamaps_block_height'] = array(
      '#title' => t('Map height (px)'),
      '#type' => 'textfield',
      '#default_value' => variable_get('yamaps_block_height', 200),
      '#size' => 5,
      '#element_validate' => array('element_validate_integer_positive'),
      '#required' => TRUE,
    );
    $element = array(
      '#delta' => 'block-' . $delta,
      '#required' => TRUE,
      '#value' => array(
        'coords' => variable_get('yamaps_block_coords', NULL),
        'type' => variable_get('yamaps_block_type', 'yandex#map'),
        'placemarks' => variable_get('yamaps_block_placemarks', NULL),
        'lines' => variable_get('yamaps_block_lines', NULL),
        'polygons' => variable_get('yamaps_block_polygons', NULL),
      ),
    );
    $form += yamaps_field_process($element, NULL, NULL);
  }
  return $form;
}

/**
 * Implements hook_block_save().
 */
function yamaps_block_save($delta = '', $edit = array()) {
  if ($delta == 'yamaps') {
    variable_set('yamaps_block_controls', $edit['yamaps_block_controls']);
    variable_set('yamaps_block_traffic', $edit['yamaps_block_traffic']);
    variable_set('yamaps_block_width', $edit['yamaps_block_width']);
    variable_set('yamaps_block_height', $edit['yamaps_block_height']);
    variable_set('yamaps_block_coords', $edit['coords']);
    variable_set('yamaps_block_type', $edit['type']);
    variable_set('yamaps_block_placemarks', $edit['placemarks']);
    variable_set('yamaps_block_lines', $edit['lines']);
    variable_set('yamaps_block_polygons', $edit['polygons']);
  }
}

/**
 * Implements hook_block_view().
 */
function yamaps_block_view($delta = '') {
  $block = array();
  if ($delta == 'yamaps') {
    $block['subject'] = t('Yandex.Map');
    $block['content'] = yamaps_block_content($delta);
  }
  return $block;
}

/**
 * Returns block content.
 * @see yamaps_block_view()
 */
function yamaps_block_content($delta) {
  $id = 'ymap-block-' . $delta;
  $coords = drupal_json_decode(variable_get('yamaps_block_coords', NULL));
  $width = variable_get('yamaps_block_width', 168);
  $height = variable_get('yamaps_block_height', 200);
  $map = array(
    'init' => array(
      'center' => $coords['center'],
      'zoom' => $coords['zoom'],
      'type' => variable_get('yamaps_block_type', 'yandex#map'),
      'behaviors' => array('scrollZoom', 'dblClickZoom', 'drag'),
    ),
    'controls' => variable_get('yamaps_block_controls', TRUE),
    'traffic' => variable_get('yamaps_block_traffic', FALSE),
    'placemarks' => drupal_json_decode(variable_get('yamaps_block_placemarks', NULL)),
    'lines' => drupal_json_decode(variable_get('yamaps_block_lines', NULL)),
    'polygons' => drupal_json_decode(variable_get('yamaps_block_polygons', NULL)),
    'edit' => FALSE,
  );
  drupal_add_js(array('yamaps' => array($id => $map)), 'setting');
  drupal_add_library('yamaps', 'yamaps.full');

  return array(
    '#type' => 'html_tag',
    '#tag' => 'div',
    '#attributes' => array(
      'id' => $id,
      'style' => 'width:' . $width . 'px;height:' . $height . 'px'
    ),
    '#value' => ''
  );
}