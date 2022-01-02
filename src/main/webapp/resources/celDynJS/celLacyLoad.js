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
 (function(window, undefined) {
  "use strict";

  function checkLoadingElements(documentPart) {
    if (!documentPart.querySelectorAll) return;
    for (let cellLoad of documentPart.querySelectorAll('.celLoadLacy')) {
      if (!cellLoad.classList.contains('celLoadLacyLoading')) {
        new CelementsLacyLoader(cellLoad).loadCell();
      }
    }
  };

  class CelementsLacyLoader {
    
    constructor (cellToLoad) {
      this.cellToLoad = cellToLoad;
      this.cellToLoad.classList.add('celLoadLacyLoading');
    }

    async loadCell() {
      const _me = this;
      await fetch(_me.cellToLoad.dataset.cellUrl)
      .then(resp => resp.text())
      .then(function(txt){
        let elem = document.createElement('div');
        elem.innerHTML = txt;
        for (let item of elem.childNodes) {
          _me.cellToLoad.parentNode.insertBefore(item, _me.cellToLoad);
          checkLoadingElements(item);
        }
        _me.cellToLoad.remove();
      });
    }

  }

  document.addEventListener("DOMContentLoaded", function() {
    checkLoadingElements(document);
  });


})(window);
