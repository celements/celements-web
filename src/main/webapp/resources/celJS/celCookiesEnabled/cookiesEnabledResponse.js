(function(window, undefined) {
  var cookiesAllowed = window.location.search.replace(/^.*[&\?]cookiesAllowed=(.*?)(&.*)?$/g, '$1');
  document.cookie = 'checkCookiesEnambledResponse=' + cookiesAllowed + '; path=/';
})(window);