(function(window, undefined) {
  var msgDoc = window.location.search.replace(/^.*[&\?]msgDoc=(.*?)(&.*)?$/g, '$1');
  document.cookie = 'checkCookiesEnambledResponse=' + msgDoc + '; path=/';
})(window);