(function (window, undefined) {
  "use strict";

  if (typeof window.CELEMENTS == "undefined") { window.CELEMENTS = {}; }
  if (typeof window.CELEMENTS.DATETIMEPICKER == "undefined") { window.CELEMENTS.DATETIMEPICKER = {}; }

  if (typeof window.CELEMENTS.DATETIMEPICKER.DateTimePickerGenerator === 'undefined') {
    const cel_initDateTimePicker = function (event) {
      window.CELEMENTS.dateTimePickerGenerator.generateDateTimePicker();
      $(document.body).stopObserving("celements:contentChanged", cel_initDateTimePicker);
      $(document.body).observe("celements:contentChanged", cel_initDateTimePicker);
    };

    /**
     * Initialize all DateTimePicker
     */
    celAddOnBeforeLoadListener(function () {
      window.CELEMENTS.dateTimePickerGenerator = new CELEMENTS.DATETIMEPICKER.DateTimePickerGenerator("body");
      cel_initDateTimePicker();
    });

    /**
     * class CELEMENTS.DATETIMEPICKER.DateTimePickerGenerator definition
     */
    window.CELEMENTS.DATETIMEPICKER.DateTimePickerGenerator = Class.create({
      _htmlElement: undefined,
      _onChangeEventBind: undefined,

      initialize: function (htmlCssSelector) {
        const _me = this;
        _me._htmlElement = $j(htmlCssSelector);
        _me._onChangeEventBind = _me._onChangeEvent.bind(_me);
      },

      _onChangeEvent: function (event) {
        const _me = this;
        _me._onChangeDateTime(event.element().value, event.element());
      },

      _onChangeDateTime: function (currentValue, element) {
        if (element && element.length > 0) {
          $(element[0]).fire('celForm:valueChanged', { 'currentValue': currentValue });
        } else {
          console.debug('unable to fire celForm:valueChanged on', element);
        }
      },

      generateDateTimePicker: function () {
        const _me = this;
        /**
         * Sample with additional Attribute cel_datePicker:
         * <input type="text" class="cel_datePicker" data-pickerAttr='{"format" : "Y.m.d", "minDate" : 0}'>
         */
        _me._htmlElement.find('input.cel_datePicker').each(function (key, element) {
          let pickerAttrObj = {
            // FIXME [CELDEV-904] DateTimePicker Language timing issue
            'lang': Validation.messages.get("admin-language") || 'de',
            'dayOfWeekStart': 1,
            'format': 'd.m.Y',
            'timepicker': false,
            'closeOnDateSelect': true,
            'onChangeDateTime': _me._onChangeDateTime
          };
          const pickerDataAttrObj = JSON.parse(element.getAttribute('data-pickerAttr'));
          if (pickerDataAttrObj) {
            pickerAttrObj = $j.extend(pickerAttrObj, pickerDataAttrObj);
          }
          $j(element).datetimepicker(pickerAttrObj);
          $(element).observe('change', _me._onChangeEventBind);
        });

        /**
         * Sample with additional Attribute cel_timePicker:
         * <input type="text" class="cel_timePicker" data-pickerAttr='{"format":"i:H"}'>
         */
        _me._htmlElement.find('input.cel_timePicker').each(function (key, element) {
          let pickerAttrObj = {
            // FIXME [CELDEV-904] DateTimePicker Language timing issue
            'lang': Validation.messages.get("admin-language") || 'de',
            'datepicker': false,
            'format': 'H:i',
            'onChangeDateTime': _me._onChangeDateTime
          };
          const pickerDataAttrObj = JSON.parse(element.getAttribute('data-pickerAttr'));
          if (pickerDataAttrObj) {
            pickerAttrObj = $j.extend(pickerAttrObj, pickerDataAttrObj);
          }
          $j(element).datetimepicker(pickerAttrObj);
          $(element).observe('change', _me._onChangeEventBind);
        });

        /**
         * Sample with additional Attribute cel_dateTimePicker:
         * <input type="text" class="cel_dateTimePicker" data-pickerAttr='{"format":"d/m/Y H:i"}'>
         */
        _me._htmlElement.find('input.cel_dateTimePicker').each(function (key, element) {
          let pickerAttrObj = {
            // FIXME [CELDEV-904] DateTimePicker Language timing issue
            'lang': Validation.messages.get("admin-language") || 'de',
            'dayOfWeekStart': 1,
            'minDate': 0,
            'format': 'd.m.Y H:i',
            'onChangeDateTime': _me._onChangeDateTime
          };
          const pickerDataAttrObj = JSON.parse(element.getAttribute('data-pickerAttr'));
          if (pickerDataAttrObj) {
            pickerAttrObj = $j.extend(pickerAttrObj, pickerDataAttrObj);
          }
          $j(element).datetimepicker(pickerAttrObj);
          $(element).observe('change', _me._onChangeEventBind);
        });
      }
    });
  }
})(window)
