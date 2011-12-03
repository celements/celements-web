/* Helpers */
function showAdminToolbar(url){

	if(!url) url = "";

	// first, remove context menu
	if(myContextMenu) myContextMenu.hide();
	
	// now show the toolbar
	myAdminToolbar.show(url);	
}

function getDocumentDimensions(){
	// determine size of the body element (taken from quirksmode.org
	var x,y;
	var test1 = document.body.scrollHeight;
	var test2 = document.body.offsetHeight
	if (test1 > test2) // all but Explorer Mac
	{
		x = document.body.scrollWidth;
		y = document.body.scrollHeight;
	}
	else // Explorer Mac;
	     //would also work in Explorer 6 Strict, Mozilla and Safari
	{
		x = document.body.offsetWidth;
		y = document.body.offsetHeight;
	}
	
	return new Array(y,x);
}

function getMousePosY(event){
	if (!event) var event = window.event;

	if(event.pageY){
		return event.pageY;
	} else if(event.clientY){	
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
		
		return event.clientY + topOffset + 2;
		
	}
	return 0;
}

/* Aspects */

Aspects = new Object();

Aspects.addBefore = function(obj, fname, before) {
    var oldFunc = obj[fname];
    obj[fname] = function() {		
        return oldFunc.apply(this, before(arguments, oldFunc, obj));
    };
};

Aspects.addAfter = function(obj, fname, after) {
    var oldFunc = obj[fname];
    obj[fname] = function() {
        return after(oldFunc.apply(this, arguments), arguments, oldFunc, obj);
    };
};

Aspects.addAround = function(obj, fname, around) {
    var oldFunc = obj[fname];
    obj[fname] = function() {
        return around(arguments, oldFunc, this);
    };
};

// aspects setting event handlers
function aopizeMouseDown(arguments, oldFunc, me){

	if(myAdminToolbar.adminDiv) myAdminToolbar.adminDiv.resetEventHandlers();
	
	document.onmousemove = me.mouseDrag;
	
	return arguments;
}

function aopizeMouseUp(result, arguments, oldFunc, me){

	if(myAdminToolbar.adminDiv) myAdminToolbar.adminDiv.setEventHandlers();
	
	document.onmousemove = me.mouseMove;
	
	return result;
}

function aopizeMouseOver(arguments, oldFunc, me){

	if(myAdminToolbar.adminDiv) myAdminToolbar.adminDiv.resetEventHandlers();
	me.n.onmouseout = me.mouseOut;
	
	document.onmousemove = me.mouseMove;
	document.onmouseup = me.mouseUp;
	document.onmousedown = me.mouseDown;

	return arguments;
}

function aopizeMouseOut(result, arguments, oldFunc, me){

	if(myAdminToolbar.adminDiv) myAdminToolbar.adminDiv.setEventHandlers();
	
	document.onmousemove = null;
	document.onmouseup = null;
	document.onmousedown = null;

	return result;
}

/* Admin Toolbar Class */
function AdminToolbar(){
	var me = this;
	
	var overlayDiv = null;
	var adminDiv = null;
	
	this.show = function(url){
	
		if(!this.overlayDiv){

			var docDim = getDocumentDimensions();			
			// overlay div
			this.overlayDiv = new Div('admin_overlay', null, document.getElementsByTagName('body')[0], 0,0,docDim[0],docDim[1],'admin_overlay');
			for(var i = 0; i <= 60; i++)
				this.overlayDiv.setOpacity(i);
		}
		
		if(!this.adminDiv){
			this.adminDiv = new AdminWindow(null, document.getElementsByTagName('body')[0], 100,5,300,docDim[1]-12,'admin_div');
		}
		
		this.adminDiv.setContent(url);
	};
	
	this.hide = function(){
		if(this.adminDiv){
			this.adminDiv.resetEventHandlers();
			this.adminDiv.remove();
			this.adminDiv = null;
		}
		if(this.overlayDiv){
			for(var i = 60; i >= 0; i--)
				this.overlayDiv.setOpacity(i);	
		 	this.overlayDiv.remove();
		}
		this.overlayDiv = null;
	
	};
	
	this.resize = function(){
		var docDim = getDocumentDimensions();
		if(me.overlayDiv)
			me.overlayDiv.setSize(docDim[0], docDim[1]);
		if(me.adminDiv)
			me.adminDiv.setSize(300, docDim[1]-12);
	}
}

/*** CLASS AdminWindow ***/
function AdminWindow(parent, parent_node, top, left, height, width, className){

	var me = this;

	this.inheritFrom = Div;
	
	this.mousePosRelY = 0;
	
	this.closeDiv = null;
	this.contentDiv = null;
	this.titleDiv = null;
	
	this.contentUrl = null;
	this.title = null;

	this.AdminWindow = function(parent, parent_node, top, left, height, width, className){

		this.inheritFrom('admin_div', parent, parent_node, top, left, height, width, className);
		
		// create close element
		this.closeDiv = new CloseDiv(this, this.n, 0, this.w + this.pl + this.pr - 50, this.pt, 50, 'admin_close');
		this.closeDiv.setSize(this.pt - (this.closeDiv.totalh - this.closeDiv.h), this.pt - (this.closeDiv.totalw - this.closeDiv.w));
		this.closeDiv.setContent("close");
		
		// create title
		this.titleDiv = new Div('title', this, this.n, 0,0, this.pt, this.totalw - 50, 'admin_title');
		this.titleDiv.setSize(this.pt - (this.titleDiv.totalh - this.titleDiv.h), this.w + this.pl + this.pr - (this.titleDiv.totalw - this.titleDiv.w) - this.closeDiv.totalw);
		this.setTitle('celements2.0 admin mode');
		
		// create content
		this.contentDiv = new ContentDiv(this, this.n, this.pt, this.pl, this.h, this.w, 'admin_content');
		this.contentDiv.setSize(this.h - (this.contentDiv.totalh - this.contentDiv.h), this.w - (this.contentDiv.totalw - this.contentDiv.w));
					
		return true;
	};
		
	this.setTitle = function(title){
		this.title = title;
		this.titleDiv.setContent(title);
		
		return true;
	}

	this.AdminWindow(parent, parent_node, top, left, height, width, className);
	
	this.setContent = function(url){

		if(!url) url = defaultUrl;
	
		this.contentDiv.setContent(url);
		this.contentUrl = url;
		
		return true;
	}

	this.setSize = function(height, width){
	
		this.n.style.height = height + 'px';
		this.n.style.width = (width-2) + 'px';

		this.h = height;
		this.w = width;
		
		this.totalw = this.w + this.bl + this.pl + this.pr + this.br;
		this.totalh = this.h + this.bt + this.pt + this.pb + this.bb;

		this.closeDiv.setPosition(0, this.w + this.pl + this.pr - 50);
		
		this.contentDiv.setSize(this.h - (this.contentDiv.totalh - this.contentDiv.h), this.w - (this.contentDiv.totalw - this.contentDiv.w));
		this.titleDiv.setSize(this.pt - (this.titleDiv.totalh - this.titleDiv.h), this.w + this.pl + this.pr - (this.titleDiv.totalw - this.titleDiv.w) - this.closeDiv.totalw);
		
		return true;
		
	};
	this.mouseDown = function(e){
		
		me.setClass('admin_div_selected');
			
		// store the position of the click
		me.mousePosRelY = getMousePosY(e) - me.t;
					
		return true;
	};	
	
	this.mouseUp = function(e){
		
		// deselect
		me.setClass('admin_div');

		return true;
	};
	
	this.mouseDrag = function(e){
		
		var y_tmp = getMousePosY(e);
		var y = y_tmp - me.mousePosRelY;
				
		//edges
		if(y < 0) y = 0;
		var docDim = getDocumentDimensions();
		if(y + me.totalh > docDim[0]) y = docDim[0] - me.totalh;
	
		me.setPosition(y, 5);
		
		return true;
	};
		
	this.setEventHandlers = function(){
	
		this.n.onmouseover = this.mouseOver;
		this.n.onmouseout = this.mouseOut;
		
		this.closeDiv.setEventHandlers();

		return true;	
	};
	
	this.resetEventHandlers = function(){
		this.n.onmouseover = null;
		this.n.onmouseout = null;
		
		this.closeDiv.resetEventHandlers();
		return true;	
	};

	// add aspects
	Aspects.addBefore(this, "mouseDown", aopizeMouseDown);
	Aspects.addAfter(this, "mouseUp", aopizeMouseUp);
	Aspects.addBefore(this, "mouseOver", aopizeMouseOver);
	Aspects.addAfter(this, "mouseOut", aopizeMouseOut);
	
	// set event handlers		
	this.setEventHandlers();
	
	return true;
};

/*** CLASS ContentDiv ***/
function ContentDiv(parent, parent_node, top, left, height, width, className){

	var me = this;

	this.inheritFrom = Div;
	
	this.http_request = false;


	this.ContentDiv = function(parent, parent_node, top, left, height, width, className){
	
		this.inheritFrom('content', parent, parent_node, top, left, height, width, className);
		
		return true;
	};
	
	// call constructor
	this.ContentDiv(parent, parent_node, top, left, height, width, className);
		
	this.setContent = function(url){

		if(!url) url = "";
		
		me.n.innerHTML = "<iframe src='"+url+"' marginheight='0' marginwidth='0' frameborder='0' style='width:"+this.w+"px;height:"+this.h+"px;'/>"
		
		/*
		this.http_request = null;
	
		try{
			this.http_request = new ActiveXObject("Msxml2.XMLHTTP")
		}catch(e){
			try{
				this.http_request = new ActiveXObject("Microsoft.XMLHTTP")
			}catch(e){
				this.http_request = null;
			}
		}
		if(!this.http_request && typeof XMLHttpRequest != "undefined"){
			this.http_request = new XMLHttpRequest();
		}
	
		if (!this.http_request) {
			//me.parent.statusDiv.setContent('Error: can not load content!');
			return false;
		}
		this.http_request.onreadystatechange = this.outContent;
		try{
			this.http_request.open('GET', url, true);
			this.http_request.send(null);
		}catch(e){
			//me.parent.statusDiv.setContent('Error: invalid xmlUrl!');			
		}
		*/
		return true;
	};
	
	this.outContent = function(){
		
		// TODO: out status
		/*switch(me.http_request.readyState){
			case 0: me.parent.statusDiv.setContent('Uninitialized');
					break;
			case 1: me.parent.statusDiv.setContent('Loading..');
					break;
			case 2: me.parent.statusDiv.setContent('Loaded..');
					break;
			case 3: me.parent.statusDiv.setContent('Interactive..');
					break;
			case 4: me.parent.statusDiv.setContent('Done.');
					break;
		}*/

		// out content
		if (me.http_request.readyState == 4) {
			if (me.http_request.status == 200 || me.http_request.status == 304) {
				if(me.http_request.responseXML) {
					var xmlDoc = me.http_request.responseXML;
					var renderedCodeElem = xmlDoc.getElementsByTagName("renderedcontent")[0];
					me.n.innerHTML = renderedCodeElem.firstChild.nodeValue;
					
				} else {
					//me.parent.statusDiv.setContent('Error: no XML file!');
				}
			} else {
				//me.parent.statusDiv.setContent('Error: server error '+me.http_request.status+'!');

			}
		}
		
		return true;
	}
	
	// add aspects
	Aspects.addBefore(this, "mouseDown", aopizeMouseDown);
	Aspects.addAfter(this, "mouseUp", aopizeMouseUp);
	Aspects.addBefore(this, "mouseOver", aopizeMouseOver);
	Aspects.addAfter(this, "mouseOut", aopizeMouseOut);
	
	// set event handlers
	this.setEventHandlers();

	return true;
};

/*** CLASS Close Div ***/
function CloseDiv(parent, parent_node, top, left, height, width, className){

	var me = this;
	
	this.inheritFrom = Div;
	
	this.CloseDiv = function(parent, parent_node, top, left, height, width, className){
	
		this.inheritFrom('close', parent, parent_node, top, left, height, width, className);	
		
		return true;
	};
	
	// call constructor
	this.CloseDiv(parent, parent_node, top, left, height, width, className);

	this.mouseUp = function(e){
	
		myAdminToolbar.hide();						
		return false;
	};
	
	// add aspects
	Aspects.addBefore(this, "mouseDown", aopizeMouseDown);
	Aspects.addAfter(this, "mouseUp", aopizeMouseUp);
	Aspects.addBefore(this, "mouseOver", aopizeMouseOver);
	Aspects.addAfter(this, "mouseOut", aopizeMouseOut);
		
	// set event handlers
	this.setEventHandlers();

	return true;
};

var myAdminToolbar = new AdminToolbar();
window.onresize = myAdminToolbar.resize;