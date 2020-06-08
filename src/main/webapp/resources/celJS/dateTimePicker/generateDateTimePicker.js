(function(window, undefined) {
  "use strict";

  if (typeof window.CELEMENTS == "undefined") { window.CELEMENTS={};};
  if (typeof window.CELEMENTS.DATETIMEPICKER == "undefined") { window.CELEMENTS.DATETIMEPICKER={};};

  var cel_initDateTimePicker = function(event) {
    window.CELEMENTS.dateTimePickerGenerator.generateDateTimePicker();
    $(document.body).stopObserving("celements:contentChanged", cel_initDateTimePicker);
    $(document.body).observe("celements:contentChanged", cel_initDateTimePicker);
  };

  /**
   * Initialize all DateTimePicker
   */
  celAddOnBeforeLoadListener(function() {
    window.CELEMENTS.dateTimePickerGenerator = new CELEMENTS.DATETIMEPICKER.DateTimePickerGenerator("body");
    cel_initDateTimePicker();
  });

  /**
   * CELEMENTS.DATETIMEPICKER.DateTimePickerGenerator constructor
   */
  CELEMENTS.DATETIMEPICKER.DateTimePickerGenerator = function(htmlElementName) {
    // constructor
    this._init(htmlElementName);
  };

  /**
   * class CELEMENTS.DATETIMEPICKER.DateTimePickerGenerator definition
   */
  CELEMENTS.DATETIMEPICKER.DateTimePickerGenerator.prototype = {
      _htmlElement : undefined,
      _onChangeEventBind :undefined,

      _init : function(htmlCssSelector) {
        var _me = this;
        _me._htmlElement = $j(htmlCssSelector);
        _me._onChangeEventBind = _me._onChangeEvent.bind(_me);
      },

      _onChangeEvent : function(event) {
        var _me = this;
        _me._onChangeDateTime(event.element().value, event.element());
      },

      _onChangeDateTime : function(currentValue, element){
        var prototypejsEle = $(element[0]);
        prototypejsEle.fire('celForm:valueChanged', { 'currentValue' : currentValue });
      },

      generateDateTimePicker : function() {
        var _me = this;
        /**
         * Sample with additional Attribute cel_datePicker:
         * <input type="text" class="cel_datePicker" data-pickerAttr='{"format" : "Y.m.d", "minDate" : 0}'>
         */
        _me._htmlElement.find('input.cel_datePicker').each(function(key, element){
          var pickerAttrObj = {
              // FIXME [CELDEV-904] DateTimePicker Language timing issue
              'lang' : Validation.messages.get("admin-language") || 'de',
              'dayOfWeekStart' : 1,
              'format' : 'd.m.Y',
              'timepicker' : false,
              'closeOnDateSelect' : true,
              'onChangeDateTime' : _me._onChangeDateTime
          };
          var pickerDataAttrObj = JSON.parse(element.getAttribute('data-pickerAttr'));
          if(pickerDataAttrObj) {
            pickerAttrObj = $j.extend(pickerAttrObj, pickerDataAttrObj);
          }
          $j(element).datetimepicker(pickerAttrObj);
          $(element).observe('change', _me._onChangeEventBind);
        });

        /**
         * Sample with additional Attribute cel_timePicker:
         * <input type="text" class="cel_timePicker" data-pickerAttr='{"format":"i:H"}'>
         */
        _me._htmlElement.find('input.cel_timePicker').each(function(key, element){
          var pickerAttrObj = {
              // FIXME [CELDEV-904] DateTimePicker Language timing issue
              'lang' : Validation.messages.get("admin-language") || 'de',
              'datepicker' : false,
              'format' : 'H:i',
              'onChangeDateTime' : _me._onChangeDateTime
          };
          var pickerDataAttrObj = JSON.parse(element.getAttribute('data-pickerAttr'));
          if(pickerDataAttrObj) {
            pickerAttrObj = $j.extend(pickerAttrObj, pickerDataAttrObj);
          }
          $j(element).datetimepicker(pickerAttrObj);
          $(element).observe('change', _me._onChangeEventBind);
        });

        /**
         * Sample with additional Attribute cel_dateTimePicker:
         * <input type="text" class="cel_dateTimePicker" data-pickerAttr='{"format":"d/m/Y H:i"}'>
         */
        _me._htmlElement.find('input.cel_dateTimePicker').each(function(key, element){
          var pickerAttrObj = {
              // FIXME [CELDEV-904] DateTimePicker Language timing issue
              'lang' : Validation.messages.get("admin-language") || 'de',
              'dayOfWeekStart' : 1,
              'minDate' : 0,
              'format' : 'd.m.Y H:i',
              'onChangeDateTime' : _me._onChangeDateTime
          };
          var pickerDataAttrObj = JSON.parse(element.getAttribute('data-pickerAttr'));
          if(pickerDataAttrObj) {
            pickerAttrObj = $j.extend(pickerAttrObj, pickerDataAttrObj);
          }
          $j(element).datetimepicker(pickerAttrObj);
          $(element).observe('change', _me._onChangeEventBind);
        });
      }
  };

})(window)
