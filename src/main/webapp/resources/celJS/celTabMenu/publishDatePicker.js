/*
var registerDatePickerListener = function() {
	$$('.editObjField_Classes\\.DocumentPublication_publishDate input, .editObjField_Classes\\.DocumentPublication_unpublishDate input').each(function(inputfield) {
	addDatePickerToField(inputfield);
	var navDateCal = getDatePickerForInputField(inputfield);
	navDateCal.setSelectedDateFormat("dd.MM.yyyy HH:mm");
	});
};

$j(document).ready(function() {
	registerDatePickerListener();
});
*/
jQuery('#Classes\\.DocumentPublication_0_publishDate').datetimepicker({format:'d.m.Y H:i'});