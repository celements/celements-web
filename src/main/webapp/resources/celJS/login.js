(function(window, undefined) {
  var focuseOnUsernameField = function() {
    document.forms.loginForm.j_username.focus();
  };

  celAddOnBeforeLoadListener(focuseOnUsernameField);

})(window);