jQuery("input").each(function( index, value ) {
	var prefix = value.id.substr(0, value.id.indexOf('_'));
	if(prefix == "Classes.DocumentPublication") {
		jQuery("#"+value.id.replace(".", "\\.")).datetimepicker({	     
			lang:'de', 
			i18n:{
				  de:{
				   months:[
				    'Januar','Februar','März','April',
				    'Mai','Juni','Juli','August',
				    'September','Oktober','November','Dezember',
				   ],
				   dayOfWeek:[
				    "So", "Mo", "Di", "Mi", 
				    "Do", "Fr", "Sa",
				   ]
				  }
				 },
			dayOfWeekStart: 1,
			format:'d.m.Y H:i'});
	}
});