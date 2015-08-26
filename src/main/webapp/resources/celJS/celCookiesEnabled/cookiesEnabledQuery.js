(function(window, undefined) {
  var responseDomain = window.location.search.replace(/^.*[&\?]domain=(.*?)(&.*)?$/g, '$1');
//  var msgDoc = window.location.search.replace(/^.*[&\?]msgDoc=(.*?)(&.*)?$/g, '$1');
  var cookiesAllowed = 'no';
  var cookieName = "CelementsTestThirdPartyCookieEnabled";
  document.cookie = cookieName + "=yes;";
  if(document.cookie.indexOf(cookieName + "=yes") > -1) {
    var date = new Date();
    date.setTime(date.getTime()+(-1*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
    document.cookie = cookieName + "=no" + expires;
    cookiesAllowed = 'yes';
  }
  var locSearch = window.location.search;
  if(locSearch.match(/[&\?]domain=http/)) {
    var loc = locSearch.replace(/^.*[&\?]domain=(.*?)(&.*)?$/g, '$1');
    var decodedLoc = decodeURIComponent(loc);
    if(decodedLoc.indexOf('?') > -1) {
      decodedLoc += '&';
    } else {
      decodedLoc += '?';
    }
    decodedLoc += 'xpage=plainpagetype&response=1&cookiesAllowed=' + cookiesAllowed;
    var responseFrame = new Element('iframe', { src: decodedLoc });
    $(document.body).insert(responseFrame);
  } else {
    var failMsg = 'Third party cookie enabled check failed.';
    alert(failMsg);
    console.log(failMsg, locSearch);
  }
})(window);