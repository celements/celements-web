/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

// AJAX window maker 0.1 beta
// written by Theus Hossmann in 2005
// Feel free to use and modify this script
// Contact: theus.hossmann@gmail.com

/*** CLASS WMWindow ***/
function WMWindow(nr, parent, parent_node, top, left, height, width, className){

	var me = this;

	this.inheritFrom = Div;
	
	this.nr = nr;
	
	this.mousePosRel = new Array(0,0);
	
	this.closeDiv = null;
	this.contentDiv = null;
	this.titleDiv = null;
	
	this.contentUrl = null;
	this.title = null;
	
	// moo.fx effects
	this.moveX = null;
	this.moveY = null;
	this.fadeWidth = null;
	this.fadeHeight = null;

	this.WMWindow = function(nr, parent, parent_node, top, left, height, width, className){
	
		this.inheritFrom('wm'+nr, parent, parent_node, top, left, height, width, className);
		
		// create close element
		this.closeDiv = new CloseDiv(nr, this, this.n, 0, 0, this.pt, this.pt, 'close');
		this.closeDiv.setSize(this.pt - (this.closeDiv.totalh - this.closeDiv.h), this.pt - (this.closeDiv.totalw - this.closeDiv.w));
		this.closeDiv.setContent("X");
		
		// create title
		this.titleDiv = new Div('title'+nr, this, this.n ,0 ,this.pt, this.pt, this.totalw - this.pt, 'title');
		this.titleDiv.setSize(this.pt - (this.titleDiv.totalh - this.titleDiv.h), this.w + this.pl + this.pr - (this.titleDiv.totalw - this.titleDiv.w) - this.closeDiv.totalw);
		this.setTitle('FLOATING WINDOW');
	
		// create content background
		this.contentBgDiv = new Div(nr, this, this.n, this.pt, this.pl, this.h, this.w, 'content_background');
		this.contentBgDiv.setSize(this.h - (this.contentBgDiv.totalh - this.contentBgDiv.h), this.w - (this.contentBgDiv.totalw - this.contentBgDiv.w));
		this.contentBgDiv.setOpacity(50);

		this.contentDiv = new ContentDiv(nr, this, this.n, this.pt, this.pl, this.h, this.w, 'content');
		this.contentDiv.setSize(this.h - (this.contentDiv.totalh - this.contentDiv.h), this.w - (this.contentDiv.totalw - this.contentDiv.w));
		this.contentDiv.setContent('http://creadev.synventis.com:8080/xwiki/bin/view/Celements2/Test?xpage=plain');
		
		this.moveX = new fx.MoveX(this.n, {duration: 400});
		this.moveY = new fx.MoveY(this.n, {duration: 400});
		this.fadeWidth = new fx.Width(this.n, {duration: 400});
		this.fadeHeight = new fx.Height(this.n, {duration: 400});
		
		return true;
	};
		
	this.setTitle = function(title){
		this.title = title;
		this.titleDiv.setContent(title);
		
		return true;
	};

	this.WMWindow(nr, parent, parent_node, top, left, height, width, className);
	
	this.setContent = function(url){

		if(!url) return false;
	
		this.contentDiv.setContent(url);
		this.contentUrl = url;
		
		return true;
	};
		
	this.mouseOver = function(e){

		// requires the same mouse move event handler as my_admin_interface
		document.onmousemove = me.parent.mouseMove;
			
		return true;
	};
	
	this.mouseDrag = function(e){
			
		my_admin_interface.getMousePos(e);
				
		var x = my_admin_interface.mousePos[0]-me.mousePosRel[0];
		var y = my_admin_interface.mousePos[1]-me.mousePosRel[1];
		
		//edges
		if(x < 0) x = 0;
		if(x + me.totalw > my_admin_interface.getDocumentWidth()) x = my_admin_interface.getDocumentWidth() - me.totalw;
		if(y < 40) y = 40;
		if(y + me.totalh > my_admin_interface.getDocumentHeight()) y = my_admin_interface.getDocumentHeight() - me.totalh;
	
		me.setPosition(y, x);
		
		return true;
	};	

	this.mouseDown = function(e){
			
		my_admin_interface.createTmpSheet();
		// select
		me.setClass('wmwindow_selected');
		me.setZIndex(my_admin_interface.maxZIndex++);
				
		me.mousePosRel = [my_admin_interface.mousePos[0] - me.l, my_admin_interface.mousePos[1] - me.t];
					
		return true;
	};

	this.mouseUp = function(e){
		
		// deselect
		me.setClass('wmwindow');
		my_admin_interface.removeTmpSheet();
		
		return true;
	};
		
	this.setEventHandlers = function(){
	
		this.n.onmouseover = this.mouseOver;
		this.n.onmouseout = this.mouseOut;
		
		this.closeDiv.setEventHandlers();
		this.contentDiv.setEventHandlers();		

		return true;	
	};
	
	this.resetEventHandlers = function(){
		this.n.onmouseover = null;
		this.n.onmouseout = null;
		
		this.closeDiv.resetEventHandlers();
		this.contentDiv.resetEventHandlers();
			
		return true;	
	};
	
	this.fadeOut = function(){
		this.closeDiv.n.style.display="none";
		this.titleDiv.n.style.display="none";
		this.contentDiv.n.style.display="none";
		this.moveX.custom(this.l, Math.round(this.l/15));
		this.moveY.custom(this.t, 30 + Math.round(this.t/15));
		this.fadeWidth.custom(this.w, Math.round(this.w/15));
		this.fadeHeight.custom(this.h, Math.round(this.h/15));		
	};
	
	this.fadeIn = function(){
		this.closeDiv.n.style.display="block";
		this.titleDiv.n.style.display="block";
		this.contentDiv.n.style.display="block";
		this.moveX.custom(Math.round(this.l/12), this.l);
		this.moveY.custom(Math.round(this.t/12), this.t);
		this.fadeWidth.custom(Math.round(this.w/12), this.w);
		this.fadeHeight.custom(Math.round(this.h/12), this.h);			
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
function ContentDiv(nr, parent, parent_node, top, left, height, width, className){

	var me = this;

	this.inheritFrom = Div;
	
	this.nr = nr;
	this.http_request = false;


	this.ContentDiv = function(nr, parent, parent_node, top, left, height, width, className){
	
		this.inheritFrom('content'+nr, parent, parent_node, top, left, height, width, className);	
		
		return true;
	};
	
	// call constructor
	this.ContentDiv(nr, parent, parent_node, top, left, height, width, className);

	this.mouseUp = function(e){
	
		me.parent.setZIndex(my_admin_interface.maxZIndex++);	
				
		return true;
	};
		
	this.setContent = function(url){

		if(!url) url = defaultUrl;
		
		this.http_request = null;
	
		try{
			this.http_request = new ActiveXObject("Msxml2.XMLHTTP");
		}catch(e){
			try{
				this.http_request = new ActiveXObject("Microsoft.XMLHTTP");
			}catch(e){
				this.http_request = null;
			}
		}
		if(!this.http_request && typeof XMLHttpRequest != "undefined"){
			this.http_request = new XMLHttpRequest();
		}
	
		if (!this.http_request) {
			return false;
		}
		this.http_request.onreadystatechange = this.outContent;
		try{
			this.http_request.open('GET', url, true);
			this.http_request.send(null);
		}catch(e){
		}
	
		return true;
	};
	
	this.outContent = function(){
		
		// out content
		if (me.parent.contentDiv.http_request.readyState == 4) {
			if (me.http_request.status == 200 || me.http_request.status == 304) {
				if(me.http_request.responseText) {
									
					me.n.innerHTML = me.http_request.responseText;
					
				} else {
					return false;
				}
			} else {
				return false;

			}
		}
		
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

/*** CLASS Close Div ***/
function CloseDiv(nr, parent, parent_node, top, left, height, width, className){

	var me = this;
	
	this.inheritFrom = Div;
	
	this.nr = nr;

	this.CloseDiv = function(nr, parent, parent_node, top, left, height, width, className){
	
		this.inheritFrom('close'+nr, parent, parent_node, top, left, height, width, className);	
		
		return true;
	};
	
	// call constructor
	this.CloseDiv(nr, parent, parent_node, top, left, height, width, className);

	this.mouseUp = function(e){
	
		me.parent.remove();
		my_admin_interface.windows[me.parent.nr] = null;
						
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
