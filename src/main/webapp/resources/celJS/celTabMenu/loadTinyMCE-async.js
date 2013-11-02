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

var initCelRTE = function() {
  var params = {
      xpage : 'celements_ajax',
      ajax_mode : 'TinyConfig'
   };
  var hrefSearch = window.location.search;
  var templateRegEx = new RegExp('^(\\?|(.*&)+)?template=([^=&]*).*$');
  if (hrefSearch.match(templateRegEx)) {
    params['template'] = window.location.search.replace(templateRegEx, '$3');
  }
  new Ajax.Request(getCelHost(), {
    method: 'post',
    parameters: params,
    onSuccess: function(transport) {
      var tinyConfigJSON = transport.responseText.replace(/\n/g,' ');
      if (tinyConfigJSON.isJSON()) {
        tinyMCE.init(tinyConfigJSON.evalJSON());
      } else {
        console.error('TinyConfig is no json!', tinyConfigJSON);
      }
    }
  });
};

var finishedCelRTE_tinyMCE_Load = false;

var celFinishTinyMCEStart = function() {
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
