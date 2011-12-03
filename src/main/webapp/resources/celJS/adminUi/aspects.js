// Aspects.js

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

// end of Aspects.js

// aspects setting event handlers
function aopizeMouseDown(arguments, oldFunc, me){

	my_admin_interface.resetEventHandlers();
	
	document.onmousemove = me.mouseDrag;
	
	return arguments;
}

function aopizeMouseUp(result, arguments, oldFunc, me){

	my_admin_interface.setEventHandlers();
	
	document.onmousemove = me.mouseMove;
	
	return result;
}

function aopizeMouseOver(arguments, oldFunc, me){

	my_admin_interface.resetEventHandlers();
	me.n.onmouseout = me.mouseOut;
	
	document.onmousemove = me.mouseMove;
	document.onmouseup = me.mouseUp;
	document.onmousedown = me.mouseDown;

	return arguments;
}

function aopizeMouseOut(result, arguments, oldFunc, me){

	my_admin_interface.setEventHandlers();
	
	document.onmousemove = null;
	document.onmouseup = null;
	document.onmousedown = null;

	return result;
}