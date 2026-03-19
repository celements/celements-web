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

(function (window, undefined) {
  'use strict';

  const checkReorderModeBrowseAway = function (theLink) {
    const parentDiv = theLink.up('ul').up();
    const isInReorderMode = parentDiv.hasClassName('reorderMode');
    return (
      !isInReorderMode ||
      confirm(
        'Sie sind am neu ordnen der Knoten.' + ' Nicht gespeicherte Änderungen gehen verloren.',
      )
    );
  };

  const checkIsCreateTrans = function (theLink) {
    const langName = theLink.innerHTML;
    return (
      !theLink.hasClassName('transNotExists') ||
      confirm("Möchten Sie wirklich eine Übersetzung für '" + langName + "' erstellen?")
    );
  };

  const pageLinkClickHandler = function (event) {
    event.stop();
    const theLink = this;
    let linkUrl = theLink.href;
    if (!theLink.up('.docLangs')) {
      window.open(linkUrl);
    } else if (checkIsCreateTrans(theLink) && checkReorderModeBrowseAway(theLink)) {
      const xredirect =
        'xredirect=' + encodeURIComponent(window.location.href.replace(/^(?:\/\/|[^\/]+)*\//, '/'));
      if (!linkUrl.match(/\?/)) {
        linkUrl += '?' + xredirect;
      } else {
        linkUrl += '&' + xredirect;
      }
      if (theLink.getAttribute('target') === '_blank') {
        window.open(linkUrl);
      } else {
        window.location.href = linkUrl;
      }
    }
  };

  const registerOnSiteEditLinks = () => {
    $$('.presentation_order_edit ul li a').each(function (pageLink) {
      pageLink.observe('click', pageLinkClickHandler);
    });
  };

  document.addEventListener('DOMContentLoaded', () => registerOnSiteEditLinks());

  /****
   * Space selector
   */
  const spaceSelectorChangeHandler = function (event) {
    window.location.href = this.value;
  };

  document.addEventListener('DOMContentLoaded', () =>
    $('spaceSelector').observe('change', spaceSelectorChangeHandler),
  );
})(window);
