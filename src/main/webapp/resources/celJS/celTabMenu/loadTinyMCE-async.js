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

  var getAllEditorBodyClasses = function(tinyConfigObj) {
    var generalBodyClasses = tinyConfigObj["body_class"];
    var editorSelector = tinyConfigObj["editor_selector"];
    var bodyClassArray = [];
    $$('.' + editorSelector).each(function(textareaElem) {
      var elemClasses = [];
      $w(textareaElem.className).each(function(cssClassName) {
        if (cssClassName.startsWith('celEditorBody_')) {
          elemClasses.push(cssClassName);
        }
      });
      var elemBodyClasses = elemClasses.join(' ') + ' ' + generalBodyClasses;
      bodyClassArray.push(textareaElem.id + "=" + elemBodyClasses.strip());
    });
    return bodyClassArray;
  };

  var initCelRTE = function() {
    console.log('initCelRTE: start');
    if(!!window.MSStream && (navigator.userAgent.indexOf("MSIE") < 0)) { // if is IE11
      alert('Der RichText Editor ist zur Zeit nicht für den Internet Explorer 11 verfügbar. Bitte verwenden Sie einen unterstützten Browser (Chrome, FireFox, Safari, IE10, IE9 oder IE8).');
      return;
    }
    var params = {
        xpage : 'celements_ajax',
        ajax_mode : 'TinyConfig'
     };
    var hrefSearch = window.location.search;
    var templateRegEx = new RegExp('^(\\?|(.*&)+)?template=([^=&]*).*$');
    if (hrefSearch.match(templateRegEx)) {
      params['template'] = window.location.search.replace(templateRegEx, '$3');
    }
    console.log('initCelRTE: before Ajax tinymce');
    new Ajax.Request(getCelHost(), {
      method: 'post',
      parameters: params,
      onSuccess: function(transport) {
        var tinyConfigJSON = transport.responseText.replace(/\n/g,' ');
        if (tinyConfigJSON.isJSON()) {
          
          window.tinymce.dom.Event.domLoaded = true;
          var tinyConfigObj = tinyConfigJSON.evalJSON();
          tinyConfigObj["body_class"] = getAllEditorBodyClasses(tinyConfigObj).join(',');
          console.log('initCelRTE: tinyMCE.init');
          tinyMCE.init(tinyConfigObj);
          console.debug('initCelRTE: tinyMCE.init finished');
        } else {
          console.error('TinyConfig is no json!', tinyConfigJSON);
        }
      }
    });
  };
  
  var finishedCelRTE_tinyMCE_Load = false;
  
  window.celFinishTinyMCEStart = function() {
    console.log('celFinishTinyMCEStart: start');
    finishedCelRTE_tinyMCE_Load = true;
    console.log("celFinishTinyMCEStart: fire 'celRTE:finishedInit'");
    $$('body')[0].fire('celRTE:finishedInit');
  };

  var lacyLoadTinyMCEforTab = function(event) {
    var tabBodyId = event.memo.newTabId;
    var tinyMceAreas = $(tabBodyId).select('textarea.mceEditor');
    console.log('lacyLoadTinyMCEforTab: for tabBodyId ', tabBodyId, tinyMceAreas);
    tinyMceAreas.each(function(editorArea) {
      setTimeout(function() {tinyMCE.execCommand("mceAddControl", false, editorArea.id);}, 3000);
//      tinyMCE.execCommand("mceAddControl", false, editorArea.id);
    });
  };

  var delayedEditorOpeningHandler = function(event) {
    console.log('delayedEditorOpeningHandler: start');
    var mceEditorAreaAvailable = ($$('#tabMenuPanel .mceEditor').size() > 0);
    if (!finishedCelRTE_tinyMCE_Load && mceEditorAreaAvailable) {
      console.debug('delayedEditorOpeningHandler: stopping display event');
      event.stop();
      $$('body')[0].observe('celRTE:finishedInit', function() {
        console.debug('delayedEditorOpeningHandler: start display effect');
        event.memo.start();
      });
    }
  };
  
  var initCelRTEListener = function() {
    console.log('initCelRTEListener: before initCelRTE');
    initCelRTE();
    if(typeof(resize) != 'undefined') {
      resize();
    }
  };

  $j(document).ready(function() {
    console.log("tinymce: register document ready...");
    $('tabMenuPanel').observe('tabedit:finishedLoadingDisplayNow',
        delayedEditorOpeningHandler);
    $('tabMenuPanel').observe('tabedit:tabchange', lacyLoadTinyMCEforTab);
    console.log('loadTinyMCE-async on ready: before register initCelRTEListener');
    getCelementsTabEditor().addAfterInitListener(initCelRTEListener);
  });
  
})(window);
