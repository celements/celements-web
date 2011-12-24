var datePickerIdCount = 0;

var handleDateSelected = function(type, args, pickerDateCal) {
  var dateField = $(pickerDateCal.containerId).previous('input');
  var selDates = args[0];
  if ((selDates.length > 0) && dateField) {
    var selDate = selDates[0];
    var newStartDate = selDate[2] + '.' + selDate[1] + '.' + selDate[0];
    dateField.value = newStartDate;
  }
  pickerDateCal.hide();
};

var addDatePickerToField = function(inputField) {
  datePickerIdCount++;
  var dateFieldOffset = inputField.positionedOffset();
  var datePickerCon = new Element('div', {
    'id' : ('date-picker-container-' + datePickerIdCount),
    'left' : dateFieldOffset.left + 'px',
    'top' : (dateFieldOffset.top + 15) + 'px',
    'position' : 'absolute'
  });
  datePickerCon.hide();
  inputField.insert({ after : datePickerCon });
  var pickerDateCal = new YAHOO.widget.Calendar("navDate" + datePickerIdCount,
      datePickerCon.readAttribute('id'), {
        title : 'Bitte ein Datum w&auml;hlen:',
        close : true
  });
  //TODO move to ajax
  pickerDateCal.cfg.setProperty("MONTHS_SHORT",   ["Jan", "Feb", "M\u00E4r", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]); 
  pickerDateCal.cfg.setProperty("MONTHS_LONG",    ["Januar", "Februar", "M\u00E4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]); 
  pickerDateCal.cfg.setProperty("WEEKDAYS_1CHAR", ["S", "M", "D", "M", "D", "F", "S"]); 
  pickerDateCal.cfg.setProperty("WEEKDAYS_SHORT", ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]); 
  pickerDateCal.cfg.setProperty("WEEKDAYS_MEDIUM",["Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam"]); 
  pickerDateCal.cfg.setProperty("WEEKDAYS_LONG",  ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]); 
  pickerDateCal.render();
  YAHOO.util.Event.addListener(inputField, "focus", pickerDateCal.show, pickerDateCal,
      true);
  pickerDateCal.selectEvent.subscribe(handleDateSelected, pickerDateCal, true);
};

