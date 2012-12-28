(function(window, undefined) {

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
