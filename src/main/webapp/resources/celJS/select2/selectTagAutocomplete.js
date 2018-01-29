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

  var formatRepo = function(data) {
    console.log('formatRepo 1: ', data);
    if (data.loading) return data.text;

    var placeUrl = "";
    if (data.fullName) {
      placeUrl = data.fullName.split(":")[1].replace(".", "/")
    }
    var markup = 
      "<div class=\"select2-result-places clearfix progonOrgSearchResult\">" +
      "  <div class='select2-result-places_meta'>" +
      "    <div class='select2-result-places_title'>" + data.name + "</div>" +
      "    <div class=\"select2-result-places_address\">" + 
             data.street + " " + data.streetNumber + 
      "    </div>" +
      "    <div class='select2-result-places_city'>" + 
             data.zip + " " + data.city + ", " + data.country +
      "    </div>" +
      "  </div>" +
      "</div>";
    return markup;
  };

  var formatRepoSelection = function(data, container) {
    console.log('formatRepoSelection: ', data, container);
    return data.name || data.fullName;
  };

  var processData = function (response, params) {
    // parse the results into the format expected by Select2
    // since we are using custom formatting functions we do not need to
    // alter the remote JSON data, except to indicate that infinite
    // scrolling can be used
    params.page = params.page || 1;
    $A(response.results).each(function(elem){
      elem.id = elem.fullName;
      elem.text = elem.name;
    });
    return {
      results: response.results,
      pagination: {
        more: response.countAfter > 0
      }
    };
  };

  var initSelect2 = function() {
    //TODO: lazily load i18n/de.js"
    var language = "de";
    if (window.celMessages && window.celMessages.celmeta && window.celMessages.celmeta.language) {
      language = window.celMessages.celmeta.language;
    }
    console.log('start initSelect2: ', language);
    var limit = 10
    $j(".autocompletePlaces").select2({
      language: language,
      placeholder: celMessages.select2.cel_select2_autocompletePlaces_placeholder,
      ajax: {
        url: "http://programmzeitung.progdev.sneakapeek.ch/Content/Webseite?xpage=celements_ajax&ajax_mode=placesSearch&limit="+limit,
        dataType: 'json',
        delay: 250,
        cache: true,
        data: function (params) {
          var page = params.page || 1;
          var offset = (page - 1 ) * limit;
          return {
            searchterm: params.term, // search term
            page: page,
            offset: offset
          };
        },
        processResults: processData
      },
      escapeMarkup: function (markup) {
        // default Utils.escapeMarkup is HTML-escaping the value. Because
        // we formated the value using HTML it must not be further escaped.
        return markup;
      },
      minimumInputLength: 3,
      templateResult: formatRepo,
      templateSelection: formatRepoSelection
    });
  };

  var checkInitSelect2 = function() {
    if (!window.celMessages) {
      console.log('observe cel:messagesLoaded for initSelect2 ', window.celMessages);
      $(document.body).stopObserving('cel:messagesLoaded',  initSelect2);
      $(document.body).observe('cel:messagesLoaded',  initSelect2);
    } else {
      console.log('direct call of initSelect2 ', window.celMessages);
      initSelect2();
    }
  };

  celAddOnBeforeLoadListener(checkInitSelect2);

})(window);