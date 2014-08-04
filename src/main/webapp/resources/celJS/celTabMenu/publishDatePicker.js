jQuery("input").each(function( index, value ) {
	var prefix = value.id.substr(0, value.id.indexOf('_'));
	var suffix = value.id.substr(value.id.lastIndexOf('_')+1, value.id.length);
	if(prefix == "Classes.DocumentPublication") {
		var replaceId = value.id.replace(".", "\\.");
		jQuery("#"+replaceId).datetimepicker({	     
			lang:Validation.messages.get("admin-language"),
			dayOfWeekStart: 1,
			format:'d.m.Y H:i'});
		var siblingSuffix = 'unpublishDate';
		if (suffix == 'unpublishDate') {
			siblingSuffix = "publishDate";
		}
		var siblingInputId = replaceId.substr(0, replaceId.lastIndexOf('_')+1)+siblingSuffix;
		jQuery("#"+replaceId).blur(function() {
			var greaterDate = null;
			var lowerDate = null;
			if (suffix == 'unpublishDate') {
				greaterDate = parseStringToDate(jQuery("#" + replaceId).val());
				lowerDate   = parseStringToDate(jQuery("#" + siblingInputId).val());
			} else {
				greaterDate = parseStringToDate(jQuery("#" + siblingInputId).val());				
				lowerDate   = parseStringToDate(jQuery("#" + replaceId).val());
			}
			if ((greaterDate < lowerDate) && (greaterDate != "" && lowerDate != "")) {
				var errorMesgDialog = getCelementsTabEditor()._getModalDialog();
				errorMesgDialog.setHeader('Saving failed!');
				errorMesgDialog.setBody("saving failed for the following reasons:");
				errorMesgDialog.cfg.setProperty("icon", YAHOO.widget.SimpleDialog.ICON_WARN);
				errorMesgDialog.cfg.queueProperty("buttons",
				[ { text: "OK", handler:function() {
				this.cancel();
				} }
				]);
				errorMesgDialog.render();
				errorMesgDialog.show();
			}
		});
	}
});

function parseStringToDate(dateString) {
	if (dateString != "") {
	var reggie = /(\d{2}).(\d{2}).(\d{4}) (\d{2}):(\d{2})/;
	var dateArray = reggie.exec(dateString); 
	var dateObject = new Date(
    	(+dateArray[3]),
	    (+dateArray[2])-1, // month starts at 0!
	    (+dateArray[1]),
	    (+dateArray[4]),
	    (+dateArray[5]));
		return dateObject;
	}
	
	return "";
}