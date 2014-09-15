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

var celOnBeforeLoadListenerArray = [];

var celAddOnBeforeLoadListener = function(listenerFunc) {
  celOnBeforeLoadListenerArray.push(listenerFunc);
};

if (typeof getCelHost === 'undefined') {
var getCelHost = function() {
  var celHost = document.location + '?';
  celHost = celHost.substring(0, celHost.indexOf('?'));
  return celHost;
};
}

var celMessages = {};

(function(window, undefined) {
  "use strict";

  new Ajax.Request(getCelHost(), {
    method : 'post',
    parameters : {
      xpage : 'celements_ajax',
      ajax_mode : 'Messages'
    },
    onSuccess : function(transport) {
      if (transport.responseText.isJSON()) {
        celMessages = transport.responseText.evalJSON();
        if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
          console.log('initCelements.js: finished getting dictionary messages.');
        }
        $(document.body).fire('cel:messagesLoaded', celMessages);
      } else if ((typeof console != 'undefined') && (typeof console.error != 'undefined')) {
        console.error('noJSON!!! ', transport.responseText);
      }
    }
  });

  var formValidations = new Hash();

  var registerValidation = function(formElem) {
    if (formElem && formElem.id) {
      var valid = new Validation(formElem.id, {
        immediate : true,
        useTitles : true,
        stopOnFirst : false
      });
      formValidations.set(formElem.id, valid);
    } else if ((typeof console != 'undefined') && (typeof console.error != 'undefined')) {
      console.error('failed to register validation on form with no id. ', formElem);
    }
  };

  celAddOnBeforeLoadListener(function() {
    $$('form.cel_form_validation').each(registerValidation);
    $(document.body).observe('cel_yuiOverlay:contentChanged', function(event) {
      var containerElem = event.findElement();
      if (containerElem) {
        containerElem.select('form.cel_form_validation').each(registerValidation);
      }
    });
  });

})(window);
