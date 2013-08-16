/**
 * Enhancing contextmenu with an hover on elements with a contextMenu.
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.editorsupport =="undefined"){CELEMENTS.editorsupport={};};

(function(window, undefined) {

  var datePickerObjsHash = new Hash();
  var datePickerIdCounter = 0;
  addDatePickerToField = function(inputField) {
    inputField = $(inputField);
    if (!inputField.id) {
      datePickerIdCounter = datePickerIdCounter + 1;
      inputField.id = 'celInputFieldDatePickerId' + datePickerIdCounter;
    }
    if (!datePickerObjsHash.get(inputField.id)) {
      datePickerObjsHash.set(inputField.id, new CELEMENTS.editorsupport.DatePicker(
          inputField, datePickerIdCounter));
    }
  };

  getDatePickerForInputField = function(inputField) {
    return datePickerObjsHash.get($(inputField).id);
  };

  CELEMENTS.editorsupport.DatePicker = function(inputField, datePickerIdNum) {
    // constructor
    this._init(inputField, datePickerIdNum);
  };

  (function() {

    CELEMENTS.editorsupport.DatePicker.prototype = {
      _datePickerIdNum : undefined,
      _inputField : undefined,
      _pickerDateCal : undefined,
      _datePickerCon : undefined,
      _selectedDateFormat : '',

      _init : function(inputField, datePickerIdNum) {
        var _me = this;
        _me._datePickerIdNum = datePickerIdNum;
        _me._inputField = $(inputField);

        var dateFieldOffset = _me._inputField.positionedOffset();
        var inputFieldHeight = _me._inputField.getHeight();
        if (!inputFieldHeight) {
          inputFieldHeight = 15;
        }
        _me._datePickerCon = new Element('div', {
          'id' : ('date-picker-container-' + datePickerIdNum)
        }).setStyle({
          'left' : dateFieldOffset.left + 'px',
          'top' : (dateFieldOffset.top + inputFieldHeight) + 'px',
          'position' : 'absolute'
        });
        _me._datePickerCon.hide();
        _me._inputField.addClassName('celDatePickerHidden');
        _me._inputField.insert({ after : _me._datePickerCon });
        _me._pickerDateCal = new YAHOO.widget.Calendar("navDate" + datePickerIdNum,
            _me._datePickerCon.readAttribute('id'), {
              title : 'Bitte ein Datum w&auml;hlen:',
              close : true
        });
        _me._updatePickerSelectedDate(true);
        //TODO move to ajax
        _me._pickerDateCal.cfg.setProperty("MONTHS_SHORT",   ["Jan", "Feb", "M\u00E4r", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]); 
        _me._pickerDateCal.cfg.setProperty("MONTHS_LONG",    ["Januar", "Februar", "M\u00E4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]); 
        _me._pickerDateCal.cfg.setProperty("WEEKDAYS_1CHAR", ["S", "M", "D", "M", "D", "F", "S"]); 
        _me._pickerDateCal.cfg.setProperty("WEEKDAYS_SHORT", ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]); 
        _me._pickerDateCal.cfg.setProperty("WEEKDAYS_MEDIUM",["Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam"]); 
        _me._pickerDateCal.cfg.setProperty("WEEKDAYS_LONG",  ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]); 
        _me._pickerDateCal.render();
        _me._pickerDateCal.selectEvent.subscribe(_me._handleDateSelected, _me, true);
        _me._pickerDateCal.hideEvent.subscribe(_me._calHideEventHandler, _me, true);
        _me._pickerDateCal.showEvent.subscribe(_me._calShowEventHandler, _me, true);
        $(_me._inputField).observe("focus", _me._calClickInsideInputHandler.bind(_me));
        $(_me._inputField).observe("click", _me._calClickInsideInputHandler.bind(_me));
        $(_me._inputField).observe("blur", _me._blurInputFieldHandler.bind(_me));
        $(document.body).observe('click', _me._calClickOutsideHandler.bind(_me));
        $(document.body).observe('celements:datePicker-show',
            _me._calCheckMultipleOpenHandler.bind(_me));
      },

      _blurInputFieldHandler : function() {
        var _me = this;
        _me._updatePickerSelectedDate(false);
      },

      _updatePickerSelectedDate : function(selectDate) {
        var _me = this;
        var inputFieldValue = '';
        if (_me._inputField.getValue) {
          inputFieldValue = $F($(_me._inputField));
        } else {
          inputFieldValue = _me._inputField.innerHTML;
        }
        if (inputFieldValue && (inputFieldValue != '')) {
          var dateSpliter = new RegExp('[-./]');
          var dateStr = inputFieldValue.split(dateSpliter);
          var curMonth = dateStr[1];
          var curYear = dateStr[2];
          _me._pickerDateCal.setYear(curYear);
          _me._pickerDateCal.setMonth(curMonth - 1);
          if (selectDate) {
            var curDay = dateStr[0];
            _me._pickerDateCal.select(new Date(curMonth + '/' + curDay + '/' + curYear));
          }
          _me._pickerDateCal.render();
        }
      },

      visible : function() {
        var _me = this;
        return _me._datePickerCon.visible();
      },

      _calCheckMultipleOpenHandler : function(event) {
        var _me = this;
        if (_me._inputField != event.memo.dateField) {
          _me._calClickOutsideHandler(event);
        }
      },

      _calClickInsideInputHandler : function(event) {
        var _me = this;
        Event.fire(_me._inputField, 'celements:datePicker-opened', {
          'celCalDatePicker' : _me,
          'dateField' : _me._inputField
        });
        if (!_me.visible()) {
          _me._pickerDateCal.show();
        }
        event.stop();
      },

      _calClickOutsideHandler : function(event) {
        var _me = this;
        var isOutside = (typeof event.findElement('#' + _me._datePickerCon.id
            ) == 'undefined');
        if (_me.visible() && isOutside) {
          Event.fire(_me._inputField, 'celements:datePicker-clickoutside', {
            'celCalDatePicker' : _me,
            'dateField' : _me._inputField
          });
          _me._pickerDateCal.hide();
        }
      },

      _calHideEventHandler : function() {
        var _me = this;
        _me._inputField.removeClassName('celDatePickerVisible');
        Event.fire(_me._inputField, 'celements:datePicker-hide', {
          'celCalDatePicker' : _me,
          'dateField' : _me._inputField
        });
        _me._inputField.addClassName('celDatePickerHidden');
      },

      _calShowEventHandler : function() {
        var _me = this;
        _me._updatePickerSelectedDate(false);
        _me._inputField.removeClassName('celDatePickerHidden');
        Event.fire(_me._inputField, 'celements:datePicker-show', {
          'celCalDatePicker' : _me,
          'dateField' : _me._inputField
        });
        _me._inputField.addClassName('celDatePickerVisible');
      },

      getSelectedDateFormat : function(newFormatString) {
        var _me = this;
        return _me._selectedDateFormat;
      },

      setSelectedDateFormat : function(newFormatString) {
        var _me = this;
        if ($j.format) {
          try {
            //try if we can format a date with it
            if (newFormatString != '') {
              $j.format.date(new Date(), newFormatString);
            }
            _me._selectedDateFormat = newFormatString;
          } catch (exp) {
            if ((typeof console != 'undefined')
                && (typeof console.error != 'undefined')) {
              console.error('failed to parse new date format with: ' + newFormatString,
                  exp);
            }
          }
        } else if ((typeof console != 'undefined')
            && (typeof console.warn != 'undefined')) {
          console.warn('Failed to finde jquery-formater plugin!');
        }
      },

      _handleDateSelected : function(type, args) {
        var _me = this;
        var pickerDateCal = _me._pickerDateCal;
        var selDates = args[0];
        if ((selDates.length > 0) && _me._inputField) {
          var selDate = selDates[0];
          var selectedDate = new Date(selDate[1] + '/' + selDate[2] + '/' + selDate[0]);
          var dateSelectedEvent = Event.fire(_me._inputField, 'celements:datePicker-dateSelected', {
            'selDate' : selDate,
            'date' : selectedDate,
            'dateField' : _me._inputField
          });
          if (!dateSelectedEvent.stopped) {
            var newStartDate = selDate[2] + '.' + selDate[1] + '.' + selDate[0];
            if ($j.format && (_me._selectedDateFormat != '')) {
              newStartDate = $j.format.date(selectedDate, _me._selectedDateFormat);
            }
            _me._inputField.value = newStartDate;
            _me._inputField.fire('celValidation:revalidateField');
          }
        }
        pickerDateCal.hide();
      }

    };
  })();

})(window);
