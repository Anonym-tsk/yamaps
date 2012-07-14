<?php

function yamaps_field_widget_info() {
  return array(
    'yamaps_field' => array(
      'label' => t('Yandex map'),
      'field types' => array('field_yamaps'),
    ),
  );
}

function yamaps_field_widget_form(&$form, &$form_state, $field, $instance, $langcode, $items, $delta, $element) {
  $element += array(
    '#type' => $instance['widget']['type'],
    '#default_value' => isset($items[$delta]) ? $items[$delta] : '',
  );
  return $element;
}
