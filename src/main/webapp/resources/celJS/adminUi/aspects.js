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