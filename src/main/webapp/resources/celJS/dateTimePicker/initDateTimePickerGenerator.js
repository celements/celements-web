(function(window, undefined) {
  "use strict";
  
  celAddOnBeforeLoadListener(function() {
    require([
       // Load our app module and pass it to our definition function
       'jquery',
       'dateTimePicker',
       'dateTimePicker/generateDateTimePicker'
      ], function(Generator){
        // The "app" dependency is passed in as "App"
        var dateTimePickerGenerator = new CELEMENTS.DATETIMEPICKER.DateTimePickerGenerator("content");
    });
//    require.config({
//      paths: {
//        jquery: 'celJS/jquery',
//        dateTimePicker: 'celJS/jquery-datetimepicker/jquery.datetimepicker',
//        generateDateTimePicker: 'celJS/dateTimePicker/generateDateTimePicker'
//      }
//    });
    
//    define([
//      'jquery',
//      'dateTimePicker',
//      'generateDateTimePicker'
//    ], function(jq, dateTimePicker){
//      console.log("TEST: app initialize: ", jq('#content'))
//      var dateTimePickerGenerator = new CELEMENTS.DATETIMEPICKER.DateTimePickerGenerator("content")
//      dateTimePickerGenerator.generateDateTimePicker();
//    });
  });
  
})(window)