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
    console.log('initCelRTE: befor Ajax tinymce');
    new Ajax.Request(getCelHost(), {
      method: 'post',
      parameters: params,
      onSuccess: function(transport) {
        var tinyConfigJSON = transport.responseText.replace(/\n/g,' ');
        if (tinyConfigJSON.isJSON()) {
          //tinyMCE.execCommand("mceAddControl", false, 'txt'+id);
          window.tinymce.dom.Event.domLoaded = true;
          var tinyConfigObj = tinyConfigJSON.evalJSON();
          tinyConfigObj["body_class"] = getAllEditorBodyClasses(tinyConfigObj).join(',');
          console.log('initCelRTE: tinyMCE.init');
          tinyMCE.init(tinyConfigObj);
        } else {
          console.error('TinyConfig is no json!', tinyConfigJSON);
        }
      }
    });
  };
  
  var finishedCelRTE_tinyMCE_Load = false;
  
  window.celFinishTinyMCEStart = function() {
    finishedCelRTE_tinyMCE_Load = true;
    $$('body')[0].fire('celRTE:finishedInit');
  };
  
  var delayedEditorOpeningHandler = function(event) {
    var mceEditorAreaAvailable = ($$('#tabMenuPanel .mceEditor').size() > 0);
    if (!finishedCelRTE_tinyMCE_Load && mceEditorAreaAvailable) {
      event.stop();
      $$('body')[0].observe('celRTE:finishedInit', function() {
        event.memo.start();
      });
    }
  };
  
  $j(document).ready(function() {
    $('tabMenuPanel').observe('tabedit:finishedLoadingDisplayNow',
        delayedEditorOpeningHandler);
    getCelementsTabEditor().addAfterInitListener(function() {
      initCelRTE();
      if(typeof(resize) != 'undefined') {
        resize();
      }
    });
  });
  
})(window);
