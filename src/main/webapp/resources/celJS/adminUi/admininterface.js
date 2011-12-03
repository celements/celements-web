/*** Moo.fx effects for moving windows **/
fx.MoveX = Class.create();
fx.MoveX.prototype = Object.extend(new fx.Base(), {
		initialize: function(el, options) {
			this.el = $(el);
			this.setOptions(options);
		},
		increase: function() {
			this.el.style.left = this.now + "px";
		}
});
fx.MoveY = Class.create();
fx.MoveY.prototype = Object.extend(new fx.Base(), {
		initialize: function(el, options) {
			this.el = $(el);
			this.setOptions(options);
		},
		increase: function() {
			this.el.style.top = this.now + "px";
		}
});
/*** CLASS AdminInteface ***/
var AdminInterface = Class.create();
AdminInterface.prototype = {
 // constructor
 initialize : function() {
 	this.n = document.getElementsByTagName("body")[0];
 	
 	// windows
 	this.windows = new Array();
 	this.maxZIndex = 0;
	this.tmpSheet = null;
	this.minWinHeight = 150;
	this.minWinWidth = 150;
 	
 	// observer mouse position
	this.mousePos = new Array(0,0);	// (X,Y) 	
 	Event.observe(document, 'mousemove', this.mouseMove);
 },
 
 newWindow : function(top,left,height,width,url) {
 	this.windows[this.windows.length] = new WMWindow(this.windows.length, this, this.n, top, left, height, width, 'wmwindow');
 	return true;
 },
 
 setEventHandlers : function(){
	for(var i=0; i<this.windows.length; i++){
		if(this.windows[i]) this.windows[i].setEventHandlers();
	}
	return true;
 },
	
 resetEventHandlers : function(){
	for(var i=0; i<this.windows.length; i++){
		if(this.windows[i]) this.windows[i].resetEventHandlers();
	}

	return true;
 },
 
 mouseMove : function(e){
	
	my_admin_interface.getMousePos(e);
			
	return true;	
 },
 
 getMousePos : function(event){
		
	if (!event) var event = window.event;

	if(event.pageX){
		
		this.mousePos = new Array(event.pageX, event.pageY);
	} else if(event.clientX){
		
		if (document.documentElement && document.documentElement.scrollTop){
			var topOffset = document.documentElement.scrollTop;
			var leftOffset = document.documentElement.scrollLeft;
		} else if (document.body) {
			var topOffset = document.body.scrollTop;
			var leftOffset = document.body.scrollLeft;
		} else {
			var topOffset = 0;
			var leftOffset = 0;
		}
			
		this.mousePos = new Array(event.clientX + leftOffset, event.clientY + topOffset);
			
	}else {
		this.mousePos = new Array(0,0);
	}
		
	return true;		
 },

 createTmpSheet : function(){
	if(typeof this.n.style.filter == 'string' || typeof this.n.style.KHTMLOpacity == 'string' || typeof this.n.style.MozOpacity == 'string' || typeof sheet.n.style.opacity == 'string'){
		if(!this.tmpSheet){
			this.tmpSheet = new Div('tmpsheet', null, document.getElementsByTagName('body')[0], 0, 0, this.getDocumentHeight() ,this.getDocumentWidth(), 'sheet');
			
			this.tmpSheet.setOpacity(1);
			this.tmpSheet.setZIndex(998);
		}
	}
		
	return true;

 },

 removeTmpSheet : function(){

	if(this.tmpSheet){
		this.tmpSheet.remove();
		delete this.tmpSheet;
		this.tmpSheet = null;
	}

 },
 
 getDocumentWidth : function(){
	// determine size of the body element (taken from quirksmode.org
	var x;
	var test1 = document.body.scrollHeight;
	var test2 = document.body.offsetHeight
	if (test1 > test2) // all but Explorer Mac
	{
		x = document.body.scrollWidth;
	}
	else // Explorer Mac;
	     //would also work in Explorer 6 Strict, Mozilla and Safari
	{
		x = document.body.offsetWidth;
	}
	
	return x;
 },

 getDocumentHeight : function(){
	// determine size of the body element (taken from quirksmode.org
	var x;
	var test1 = document.body.scrollHeight;
	var test2 = document.body.offsetHeight
	if (test1 > test2) // all but Explorer Mac
	{
		x = document.body.scrollHeight;
	}
	else // Explorer Mac;
	     //would also work in Explorer 6 Strict, Mozilla and Safari
	{
		x = document.body.offsetHeight;
	}
	
	return x;
 },
 
 fadeOut : function(){
	for(var i=0; i<this.windows.length; i++){
		if(this.windows[i]) this.windows[i].fadeOut();
	}

	return true;
 },
 fadeIn : function(){
	for(var i=0; i<this.windows.length; i++){
		if(this.windows[i]) this.windows[i].fadeIn();
	}

	return true;
 }
}