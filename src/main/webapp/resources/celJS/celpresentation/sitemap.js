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
    var xredirect = 'xredirect=' + encodeURIComponent(
        window.location.href.replace(/^(?:\/\/|[^\/]+)*\//, '/'));
    if (!linkUrl.match(/\?/)) {
      linkUrl += '?' + xredirect;
    } else {
      linkUrl += '&' + xredirect;
    }
    if (!theLink.up('.docLangs')) {
      window.open(linkUrl);
    } else if (checkIsCreateTrans(theLink) && checkReorderModeBrowseAway(theLink)) {
          window.location.href = linkUrl;
      }
  };

  var registerOnSiteEditLinks = function() {
    $$('.presentation_order_edit ul li a').each(function(pageLink) {
      pageLink.observe('click', pageLinkClickHandler);
    });
  };

  $j(document).ready(registerOnSiteEditLinks);

})(window);
