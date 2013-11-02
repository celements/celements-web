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

Event.observe(window, 'load', startResizeObservers);

function startResizeObservers(event){
  Event.observe(window, 'resize', resize);
  if($('cel_overlaybody')){
    $('cel_overlaybody').observe('celoverlay:resize', resize);
  }
  resize();
}

function resize(){
//alert(($$('.cel_overlay_outerBox').size() > 0) + " - " + ($$('.cel_overlay_innerBox').size() > 0));
  if(($$('.cel_overlay_outerBox').size() > 0) && ($$('.cel_overlay_innerBox').size() > 0)) {
    var outerBox = $$('.cel_overlay_outerBox')[0];
    var innerBox = $$('.cel_overlay_innerBox')[0];
    var scrollBox = innerBox.down('.cel_overlay_scrollable');
  } else {
    var outerBox = $('cel_overlaybody');
    var innerBox = $('cel_overlaybody');
    var scrollBox = $('cel_overlaybody');
  }
  if(outerBox && innerBox) { 
    var mainPadding = parseInt($$('.main')[0].getStyle('padding-top'));
    var mainMargin = parseInt($$('.main')[0].getStyle('margin-top'));
    var mainBorders = 2 * (mainPadding + mainMargin);
    var siblingHeight = 0;
    if(scrollBox){
      scrollBox.siblings().each(function(sibl){
        //excluding 'style' needed for IE7 since style tags in IE7 have a heigth ... sometimes ...
        if((sibl.getStyle('position') != 'absolute') && (sibl.tagName.toLowerCase() != 'style')){
          siblingHeight += sibl.offsetHeight;
        }
      });
    }
    
    siblingHeight += (scrollBox.cumulativeOffset().top - innerBox.cumulativeOffset().top);
    
    var winHeight = 0;
    if(typeof(window.innerWidth) == 'number') {
      winHeight = window.innerHeight;
    } else if(document.documentElement && document.documentElement.clientHeight) {
      winHeight = document.documentElement.clientHeight;
    } else if(document.body && document.body.clientHeight) {
      winHeight = document.body.clientHeight;
    }
    
    var outerBoxSize = winHeight - mainBorders;
    var innerSize = outerBoxSize;
    var scrollableSize = innerSize - siblingHeight;
    
    outerBox.setStyle({ height: Math.max(50, outerBoxSize) + "px" });
    innerBox.setStyle({ height: Math.max(50, innerSize) + "px" });
    scrollBox.setStyle({ height: Math.max(50, scrollableSize) + "px" });
  }
}