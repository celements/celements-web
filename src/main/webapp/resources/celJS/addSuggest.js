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

Event.observe(window, 'load', getSuggestConf);

function getSuggestConf() {
  var fields = new Array();
  $$('input').each(function(inpField){
    if(inpField.type == 'text') {
      fields.push(inpField.id);
    }
  });
  new Ajax.Request('?', {
    method : 'post',
    parameters : {
      'xpage' : 'celements_ajax',
      'ajax_mode' : 'GetSuggestFields',
      'fields' : fields
    },
    onSuccess : function(transport){
      answer = transport.responseText;
      if(answer.isJSON()) {
        jsonanswer = transport.responseText.evalJSON();
        for(var i = 0; i < jsonanswer.length; i++) {
          addSuggest(jsonanswer[i]);
        }
      } else {
        if ((typeof console != 'undefined') && (typeof console.error != 'undefined')) {
          console.error("Ajax answer is no JSON.", transport);
        }
      }
    },
    onFailure : function(transport) {
      if ((typeof console != 'undefined') && (typeof console.error != 'undefined')) {
        console.error("Getting suggest fields failed.", transport);
      }
    }
  });
}

var addSuggest = function(conf) {
  Event.observe($(conf.id), "focus", function() {
    var url = '?xpage=suggest&classname=' + conf.classname + '&fieldname=' + conf.fieldname + '&';
      new XWiki.widgets.Suggest(this, {
          script: url, 
          varname: "input", 
          seps: " ,|",
          offsety: 13,
          minchars: 2,
          timeout: 10000
      });
  });
};
