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

export class CelOverlayResize {
  /** class field definition and private fields only works for > Safari 14.5, Dec 2021,
   don't use it yet. '
  #overlay;
  #resizeBind;
  */

  constructor(theOverlay) {
    const _me = this;
    _me._overlay = theOverlay;
    _me._resizeBind = _me.resize.bind(_me);
    _me._overlay.celObserve('celOverlay:contentChanged', _me.startResizeObservers.bind(_me));
    _me.startResizeObservers();
  }

  startResizeObservers() {
    const _me = this;
    window.addEventListener('resize', _me._resizeBind);
    const overlayBodyElem = _me._overlay.getOverlayBody();
    if (overlayBodyElem) {
      overlayBodyElem.stopObserving('celoverlay:resize', _me._resizeBind);
      overlayBodyElem.observe('celoverlay:resize', _me._resizeBind);
    }
    _me.resize();
  }

  _getOverlayBoxes() {
    const _me = this;
    const overlayBodyElem = _me._overlay.getOverlayBody();
    let outerBox = overlayBodyElem.querySelector('.cel_overlay_outerBox');
    let innerBox = overlayBodyElem.querySelector('.cel_overlay_innerBox');
    let scrollBox;
    if (outerBox && innerBox) {
      scrollBox = innerBox.querySelector('.cel_overlay_scrollable');
    } else {
      outerBox = overlayBodyElem;
      innerBox = overlayBodyElem;
      scrollBox = overlayBodyElem;
    }
    return {
      'outerBox': outerBox,
      'innerBox': innerBox,
      'scrollBox': scrollBox
    };
  }

  _cumulativeOffset(obj) {
    let left = 0;
    let top = 0;
    if (obj.offsetParent) {
      do {
        left += obj.offsetLeft;
        top += obj.offsetTop;
      } while (obj = obj.offsetParent);
    }
    return { left: left, top: top };
  }

  _getBoxHeight(theBox) {
    const theBoxHeight = theBox.style.height;
    theBox.style.height = "";
    theBox.style.overflow = "visible";
    const theBoxContentHeight = Math.ceil(theBox.getBoundingClientRect().height);
    theBox.style.overflow = "";
    theBox.style.height = theBoxHeight;
    return theBoxContentHeight;
  }

  _getWinHeight() {
    let winHeight = 0;
    if (typeof (window.innerHeight) === 'number') {
      winHeight = window.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) {
      winHeight = document.documentElement.clientHeight;
    } else if (document.body && document.body.clientHeight) {
      winHeight = document.body.clientHeight;
    }
    return winHeight;
  }

  _getCumulativeScrollboxHeight(boxes) {
    const _me = this;
    const innerBox = boxes.innerBox;
    const scrollBox = boxes.scrollBox;
    let siblingHeight = 0;
    if (scrollBox) {
      for (let sibl of scrollBox.parentNode.children) {
        const siblStyle = window.getComputedStyle(sibl);
        if ((scrollBox !== sibl) && (siblStyle.position !== 'absolute')) {
          siblingHeight += sibl.offsetHeight;
        }
      }
    }
    siblingHeight += (_me._cumulativeOffset(scrollBox).top
      - _me._cumulativeOffset(innerBox).top);
    return siblingHeight;
  }

  resize() {
    const _me = this;
    const boxes = _me._getOverlayBoxes();
    const outerBox = boxes.outerBox;
    const innerBox = boxes.innerBox;
    const scrollBox = boxes.scrollBox;
    const overlayElem = _me._overlay.getOverlayElem();
    console.debug('overlay resize before computeResize: ', overlayElem, outerBox, innerBox,
      scrollBox);
    if (overlayElem && outerBox && innerBox) {
      const mainElem = overlayElem.querySelector('.main');
      const mainElemStyle = window.getComputedStyle(mainElem);
      const mainPadding = parseInt(mainElemStyle.paddingTop) || 0;
      const mainMargin = parseInt(mainElemStyle.marginTop) || 0;
      const mainBorders = 2 * (mainPadding + mainMargin);
      const outerBoxSize = _me._getWinHeight() - mainBorders;
      let innerSize = outerBoxSize;
      if (_me._overlay.isMaxContentHeight()) {
        innerSize = Math.min(_me._getBoxHeight(innerBox), outerBoxSize)
      }
      const scrollableSize = innerSize - _me._getCumulativeScrollboxHeight(boxes);

      console.debug('overlayResize: ', outerBoxSize, innerSize, scrollableSize);
       outerBox.style.height = Math.max(50, outerBoxSize) + "px";
      innerBox.style.height = Math.max(50, innerSize) + "px";
      scrollBox.style.height = Math.max(50, scrollableSize) + "px";
    } else {
      console.log('skip resize no boxes found');
    }
  }
}
