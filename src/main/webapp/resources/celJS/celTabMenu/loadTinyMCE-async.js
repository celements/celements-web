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

  var tinyConfigLoaded = false;
  var editorCounter = 0;

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
          tinyConfigObj["setup"] = celSetupTinyMCE;
         console.log('initCelRTE: tinymce.init');
         tinymce.init(tinyConfigObj);
         tinyConfigLoaded = true;
          console.debug('initCelRTE: tinymce.init finished');
        } else {
          console.error('TinyConfig is no json!', tinyConfigJSON);
        }
      }
    });
  };
  
  var celSetupTinyMCE = function(editor) {
    console.log('celSetupTinyMCE start');
    editor.onInit.add(celFinishTinyMCEStart);
    console.log('celSetupTinyMCE finish');
  };

  var celFinishTinyMCEStart = function() {
    try {
      console.log('celFinishTinyMCEStart: start');
      $$('body')[0].fire('celRTE:finishedInit');
      console.log('celFinishTinyMCEStart: finish');
    } catch (exp) {
      console.error('celFinishTinyMCEStart failed', exp);
    }
  };

  var lazyLoadTinyMCEforTab = function(event) {
    try {
      var tabBodyId = event.memo.newTabBodyId;
      if (tinyConfigLoaded) {
        getUninitializedMceEditors(tabBodyId).each(function(editorAreaId) {
          console.log('lazyLoadTinyMCEforTab: mceAddControl for editorArea ', editorAreaId,
              tabBodyId);
          tinymce.execCommand("mceAddControl", false, editorAreaId);
        });
        console.log('lazyLoadTinyMCEforTab: finish', tabBodyId);
      } else {
        console.log('lazyLoadTinyMCEforTab: skip mceAddControl because tinyConfig not yet loaded.',
            tabBodyId);
      }
    } catch (exp) {
      console.error("lazyLoadTinyMCEforTab failed. ", exp);
    }
  };

  var getUninitializedMceEditors = function(mceParentElem) {
    console.log('getUninitializedMceEditors: start ', mceParentElem);
    var mceEditorsToInit = new Array();
    $(mceParentElem).select('textarea.mceEditor').each(function(editorArea) {
      if (!editorArea.id || (editorArea.id === '')) {
        editorArea.writeAttribute('id', editorArea.name + 'Editor' + (++editorCounter));
      }
      var notInitialized = !tinymce.getInstanceById(editorArea.id);
      console.log('getUninitializedMceEditors: found new editorArea ', editorArea.id,
          notInitialized);
      if (notInitialized) {
        mceEditorsToInit.push(editorArea.id);
      }
    });
    console.log('getUninitializedMceEditors: returns ', mceParentElem, mceEditorsToInit);
    return mceEditorsToInit;
  };

  var delayedEditorOpeningHandler = function(event) {
    console.log('delayedEditorOpeningHandler: start ', event.memo);
    var mceParentElem = event.memo.tabBodyId || "tabMenuPanel";
    var mceEditorAreaAvailable = (getUninitializedMceEditors(mceParentElem).size() > 0);
    if (mceEditorAreaAvailable) {
      console.debug('delayedEditorOpeningHandler: stopping display event');
      event.stop();
      $$('body')[0].observe('celRTE:finishedInit', function() {
        console.debug('delayedEditorOpeningHandler: start display effect');
        event.memo.effect.start();
      });
    }
  };
  
  var initCelRTEListener = function() {
    console.log('initCelRTEListener: before initCelRTE');
    initCelRTE();
  };

  $j(document).ready(function() {
    console.log("tinymce: register document ready...");
    $('tabMenuPanel').observe('tabedit:finishedLoadingDisplayNow',
        delayedEditorOpeningHandler);
    $('tabMenuPanel').observe('tabedit:tabLoadingFinished', lazyLoadTinyMCEforTab);
    console.log('loadTinyMCE-async on ready: before register initCelRTEListener');
    getCelementsTabEditor().addAfterInitListener(initCelRTEListener);
  });
  
})(window);
