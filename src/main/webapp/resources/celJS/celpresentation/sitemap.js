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

  var checkReorderModeBrowseAway = function(theLink) {
    var parentDiv = theLink.up('ul').up();
    var isInReorderMode = parentDiv.hasClassName('reorderMode');
    return (!isInReorderMode || confirm('Sie sind am neu ordnen der Knoten.'
      + ' Nicht gespeicherte Änderungen gehen verloren.'));
  };

  var checkIsCreateTrans = function(theLink) {
    var langName = theLink.innerHTML;
    return (!theLink.hasClassName('transNotExists')
      || confirm('Möchten Sie wirklich eine Übersetzung für \'' + langName
        + '\' erstellen?'));
  };

  var pageLinkClickHandler = function(event) {
    event.stop();
    var theLink = this;
    var linkUrl = theLink.href;
    if (!theLink.up('.docLangs')) {
      window.open(linkUrl);
    } else if (checkIsCreateTrans(theLink) && checkReorderModeBrowseAway(theLink)) {
      var xredirect = 'xredirect=' + encodeURIComponent(
        window.location.href.replace(/^(?:\/\/|[^\/]+)*\//, '/'));
      if (!linkUrl.match(/\?/)) {
        linkUrl += '?' + xredirect;
      } else {
        linkUrl += '&' + xredirect;
      }
      window.location.href = linkUrl;
    }
  };

  var registerOnSiteEditLinks = function() {
    $$('.presentation_order_edit ul li a').each(function(pageLink) {
      pageLink.observe('click', pageLinkClickHandler);
    });
  };

  $j(document).ready(registerOnSiteEditLinks);

  /****
   * Space selector
   */
  var spaceSelectorChangeHandler = function(event) {
    window.location.href = this.value;
  };

  $j(document).ready(function() {
    $('spaceSelector').observe('change', spaceSelectorChangeHandler);
  });

})(window);
