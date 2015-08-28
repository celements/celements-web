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
  var responseDomain = window.location.search.replace(/^.*[&\?]domain=(.*?)(&.*)?$/g, '$1');
  var cookiesAllowed = false;
  var cookieName = "CelementsTestThirdPartyCookieEnabled";
  document.cookie = cookieName + "=yes;";
  if(document.cookie.indexOf(cookieName + "=yes") > -1) {
    var date = new Date();
    date.setTime(date.getTime()+(-1*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
    document.cookie = cookieName + "=no" + expires;
    cookiesAllowed = true;
  }
  var locSearch = window.location.search;
  if(locSearch.match(/[&\?]domain=http/)) {
    var loc = locSearch.replace(/^.*[&\?]domain=(.*?)(&.*)?$/g, '$1');
    var decodedLoc = decodeURIComponent(loc);
    // DON'T use anything but string. (It's IE, what else?)
    parent.postMessage('thirdPartyCookiesEnabled=' + cookiesAllowed, decodedLoc);
  } else {
    var failMsg = 'Third party cookie enabled check failed.';
    alert(failMsg);
    console.log(failMsg, locSearch);
  }
})(window);