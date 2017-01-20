(function(window, undefined) {
  "use strict";

  if (typeof window.CELEMENTS == "undefined") { window.CELEMENTS={};};
  if (typeof window.CELEMENTS.DATETIMEPICKER == "undefined") { window.CELEMENTS.DATETIMEPICKER={};};

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

      _init : function(htmlCssSelector) {
        var _me = this;
        _me._htmlElement = $j(htmlCssSelector);
      },

      generateDateTimePicker : function() {
        var _me = this;
        /**
         * Sample with additional Attribute cel_datePicker:
         * <input type="text" class="cel_datePicker" data-pickerAttr='{"format" : "Y.m.d", "minDate" : 0}'>
         */
        _me._htmlElement.find('input.cel_datePicker').each(function(key, element){
          var pickerAttrObj = {
              lang : Validation.messages.get("language"),
              dayOfWeekStart : 1,
              format : 'd.m.Y',
              timepicker : false,
              closeOnDateSelect : true,
              onChangeDateTime: _me._onChangeDateTime
          }
          var pickerDataAttrObj = JSON.parse(element.getAttribute('data-pickerAttr'));
          if(pickerDataAttrObj) {
            pickerAttrObj = $j.extend(pickerAttrObj, pickerDataAttrObj);
          }
          $j(element).datetimepicker(pickerAttrObj);
          _me._observeChange(element);
        });

        /**
         * Sample with additional Attribute cel_timePicker:
         * <input type="text" class="cel_timePicker" data-pickerAttr='{"format":"i:H"}'>
         */
        _me._htmlElement.find('input.cel_timePicker').each(function(key, element){
          var pickerAttrObj = {
              lang : Validation.messages.get("language"),
              datepicker:false,
              format:'H:i',
              onChangeDateTime: _me._onChangeDateTime
          }
          var pickerDataAttrObj = JSON.parse(element.getAttribute('data-pickerAttr'));
          if(pickerDataAttrObj) {
            pickerAttrObj = $j.extend(pickerAttrObj, pickerDataAttrObj);
          }
          $j(element).datetimepicker(pickerAttrObj);
          _me._observeChange(element);
        });

        /**
         * Sample with additional Attribute cel_dateTimePicker:
         * <input type="text" class="cel_dateTimePicker" data-pickerAttr='{"format":"d/m/Y H:i"}'>
         */
        _me._htmlElement.find('input.cel_dateTimePicker').each(function(key, element){
          var pickerAttrObj = {
              lang : Validation.messages.get("language"),
              dayOfWeekStart : 1,
              minDate : 0,
              format : 'd.m.Y H:i',
              onChangeDateTime: _me._onChangeDateTime
          }
          var pickerDataAttrObj = JSON.parse(element.getAttribute('data-pickerAttr'));
          if(pickerDataAttrObj) {
            pickerAttrObj = $j.extend(pickerAttrObj, pickerDataAttrObj);
          }
          $j(element).datetimepicker(pickerAttrObj);
          _me._observeChange(element);
        });

        _me._onChangeDateTime = function(currentValue, element){
          $(element).fire('celForm:valueChanged', {
            'currentValue' : currentValue
          });
        };

        _me._observeChange = function(element) {
          $(element).observe('change', function(event) {
            event.element().fire('celForm:valueChanged', {
              'currentValue' : event.element().value
            });
          });
        };
      }
  };
})(window)
