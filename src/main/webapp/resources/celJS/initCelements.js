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
        console.log('initCelements.js: finished getting messages.');
      }
      $(document).fire('cel:messagesLoaded', celMessages);
    } else if ((typeof console != 'undefined') && (typeof console.error != 'undefined')) {
      console.error('noJSON!!! ', transport.responseText);
    }
  }
});
