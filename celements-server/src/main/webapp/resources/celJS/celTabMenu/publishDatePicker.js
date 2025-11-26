jQuery("input").each(function(index, value) {
  var prefix = value.id.substr(0, value.id.indexOf('_'));
  if (prefix == "Classes.DocumentPublication") {
    jQuery("#" + value.id.replace(".", "\\.")).datetimepicker({
      lang: Validation.messages.get("admin-language"),
      scrollInput: false,
      dayOfWeekStart: 1,
      format: 'd.m.Y H:i'
    });
  }
});