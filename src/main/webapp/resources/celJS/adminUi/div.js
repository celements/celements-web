// AJAX window maker 0.0.1
// written by Theus Hossmann in 2005
// Feel free to use and modify this script
// Contact: theus.hossmann@gmail.com

/*** CLASS Div ***/
function Div(id, parent, parent_node, top, left, height, width, className){

	// properties
	
	this.i = id;
	this.parent = parent;
	this.parent_node = parent_node;
	this.parent_node = parent_node;
	this.n = null;
	
	this.t = top;
	this.l = left;
	this.h = height;
	this.w = width;
	
	this.pl = 0;
	this.pr = 0;
	this.pt = 0;
	this.pb = 0;
	this.bl = 0;
	this.br = 0;
	this.bt = 0;
	this.bb = 0;
	
	this.totalw = 0;
	this.totalh = 0;
	
	this.c = className;
	

	// methods
	this.setSize = function(height, width){
	
		this.n.style.height = height + 'px';
		this.n.style.width = width + 'px';
		
		this.h = height;
		this.w = width;
		
		this.totalw = this.w + this.bl + this.pl + this.pr + this.br;
		this.totalh = this.h + this.bt + this.pt + this.pb + this.bb;
		
		return true;
		
	};
	
	this.setPosition = function(top, left){
	
		this.n.style.top = top + 'px';
		this.n.style.left = left + 'px';
		
		this.t = top;
		this.l = left;
		
		return true;
		
	};
	
	this.setClass = function(className){
	
		var classAttribute = null;
		if(!this.n.getAttributeNode('class')){
			classAttribute = document.createAttribute('class');
			this.n.setAttributeNode(classAttribute);
		} else {
			classAttribute = this.n.getAttributeNode('class');
		}
		classAttribute.nodeValue = className;
		
		return true;
	
	};
	
	this.setId = function(id){
		this.n.setAttribute('id', id);
		this.i = id;
		
		return true;
	};
	
	this.setVisible = function(){
		
		this.n.style.visibility = 'visible';
		return true;
	};
	
	this.setInvisible = function(){
	
		this.n.style.visibility = 'hidden';
		return true;
	};
	
	this.setOpacity = function(opacity) {
	
		opacity = (opacity == 100)?99.999:opacity;
		
		// IE/Win
		if(typeof this.n.style.filter == 'string') this.n.style.filter = "alpha(opacity:"+opacity+")";
		
		// Safari<1.2, Konqueror
		if(typeof this.n.style.KHTMLOpacity == 'string') this.n.style.KHTMLOpacity = opacity/100;
		
		// Older Mozilla and Firefox
		if(typeof this.n.style.MozOpacity == 'string') this.n.style.MozOpacity = opacity/100;
		
		// Safari 1.2, newer Firefox and Mozilla, CSS3
		if(typeof this.n.style.opacity == 'string') this.n.style.opacity = opacity/100;
	};
	
	this.setZIndex = function(i){
	
		this.n.style.zIndex = i;
		return true;
	};
	
	this.setContent = function(content){
	
		if(this.n.firstChild){
			this.n.firstChild.nodeValue = content;
		} else {
			this.n.appendChild(document.createTextNode(content));
		}	
		return true;
		
	};
		
	this.remove = function(){
	
		try{
			this.parent_node.removeChild(this.n);
			return true;
		} catch(e) {
			return false;
		}
	}
	
	this.mouseOver = function(e){
	
		return true;		
	}
	this.mouseOut = function(e){
	
		return true;
	}

	this.mouseMove = function(e){
	
		return true;
	}

	this.mouseDrag = function(e){
	
		return true;
	}
	
	this.mouseDown = function(e){
	
		return true;
	}
	
	this.mouseUp = function(e){
	
		return true;
	}
		
	this.setEventHandlers = function(){
	
		this.n.onmouseover = this.mouseOver;
		this.n.onmouseout = this.mouseOut;

		return true;
	}
	this.resetEventHandlers = function(){
	
		this.n.onmouseover = null;
		this.n.onmouseout = null;
		return true;
	}
	
	this.getClassProperties = function(){
		if (this.n.currentStyle){	// ie
		
			var str = '';
						
			if(str = this.n.currentStyle['paddingTop'])
				this.pt = parseInt(str.substring(0, str.length - 2));
			
			if(str = this.n.currentStyle['paddingBottom'])			
				this.pb = parseInt(str.substring(0, str.length - 2));
			
			if(str = this.n.currentStyle['paddingLeft'])
				this.pl = parseInt(str.substring(0, str.length - 2));
			
			if(str = this.n.currentStyle['paddingRight'])			
				this.pr = parseInt(str.substring(0, str.length - 2));
			

			if(str = this.n.currentStyle['borderTopWidth'])
				this.bt = parseInt(str.substring(0, str.length - 2));
				
			if(str = this.n.currentStyle['borderBottomWidth'])
				this.bb = parseInt(str.substring(0, str.length - 2));
	
			if(str = this.n.currentStyle['borderLeftWidth'])
				this.bl = parseInt(str.substring(0, str.length - 2));
				
			if(str = this.n.currentStyle['borderRightWidth'])
				this.br = parseInt(str.substring(0, str.length - 2));
				
			
		} else if (window.getComputedStyle){	// moz, opera
		
			var str = '';
			
			if(str = document.defaultView.getComputedStyle(this.n,null).getPropertyValue('padding-top'))
				this.pt = parseInt(str.substring(0, str.length - 2));
				
			if(str = document.defaultView.getComputedStyle(this.n,null).getPropertyValue('padding-bottom'))
				this.pb = parseInt(str.substring(0, str.length - 2));

			if(str = document.defaultView.getComputedStyle(this.n,null).getPropertyValue('padding-left'))
				this.pl = parseInt(str.substring(0, str.length - 2));
				
			if(str = document.defaultView.getComputedStyle(this.n,null).getPropertyValue('padding-right'))
				this.pr = parseInt(str.substring(0, str.length - 2));
			
			if(str = document.defaultView.getComputedStyle(this.n,null).getPropertyValue('border-top-width'))
				this.bt = parseInt(str.substring(0, str.length - 2));
			
			if(str = document.defaultView.getComputedStyle(this.n,null).getPropertyValue('border-bottom-width'))
				this.bb = parseInt(str.substring(0, str.length - 2));
				
			if(str = document.defaultView.getComputedStyle(this.n,null).getPropertyValue('border-left-width'))
				this.bl = parseInt(str.substring(0, str.length - 2));
			
			if(str = document.defaultView.getComputedStyle(this.n,null).getPropertyValue('border-right-width'))
				this.br = parseInt(str.substring(0, str.length - 2));

		} else if(document.styleSheets) {	// safari, TODO

		       // find the according css rule
		       var currentStyle = null;
		       for(var i = 0; i <  document.styleSheets[0].rules.length; i++){
			      if('.'+this.c == document.styleSheets[0].rules[i].selectorText){
					    currentStyle = document.styleSheets[0].rules[i];
			      }
		       }
		       if(currentStyle){
				var str = '';
				if(str = currentStyle.style.paddingTop)
				       this.pt = parseInt(str.substring(0, str.length - 2));
				
				if(str = currentStyle.style.paddingBottom)
				       this.pb = parseInt(str.substring(0, str.length - 2));

				if(str = currentStyle.style.paddingLeft)
				       this.pl = parseInt(str.substring(0, str.length - 2));
				
				if(str = currentStyle.style.paddingRight)
					this.pr = parseInt(str.substring(0, str.length - 2));
			
				if(str = currentStyle.style.borderTopWidth)
					this.bt = parseInt(str.substring(0, str.length - 2));
			
				if(str = currentStyle.style.borderBottomWidth)
					this.bb = parseInt(str.substring(0, str.length - 2));
				
				if(str = currentStyle.style.borderLeftWidth)
					this.bl = parseInt(str.substring(0, str.length - 2));
			
				if(str = currentStyle.style.borderRightWidth)
					this.br = parseInt(str.substring(0, str.length - 2));
		       }

		
		}
		
		this.totalw = this.w + this.bl + this.pl + this.pr + this.br;
		this.totalh = this.h + this.bt + this.pt + this.pb + this.bb;
		
	}
	
	
	// constructor
	this.Div = function(){
	
		this.n = document.createElement('div');
		this.setInvisible();
		this.setId(this.i);
		this.setClass(this.c);
		this.setSize(this.h, this.w);
		this.setPosition(this.t, this.l);
		this.parent_node.appendChild(this.n);		
		this.setVisible();
		
		// get class properties
		this.getClassProperties();
	};
	
	this.Div();
	return true;
	
};