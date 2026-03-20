// ======================================
// Form buttons: shortcuts, AJAX improvements and form validation
// To be completed.

// Make sure the XWiki 'namespace' exists.
if (typeof XWiki == 'undefined') {
  XWiki = new Object();
}
// Make sure the actionButtons 'namespace' exists.
if (typeof XWiki.actionButtons == 'undefined') {
  XWiki.actionButtons = new Object();
}

XWiki.actionButtons.EditActions = Class.create({
  translations: {},

  initialize: function () {
    if (window.celExecOnceAfterMessagesLoaded) {
      window.celExecOnceAfterMessagesLoaded(
        (celMessages) => (this.translations = celMessages.actionButtons),
      );
    } else {
      console.warn('celExecOnceAfterMessagesLoaded not available!');
    }
    this.addListeners();
    this.addShortcuts();
    this.addValidators();
  },
  addListeners: function () {
    $$('input[name=action_cancel]').each(
      function (item) {
        item.observe('click', this.onCancel.bindAsEventListener(this));
      }.bind(this),
    );
    $$('input[name=action_preview]').each(
      function (item) {
        item.observe('click', this.onPreview.bindAsEventListener(this));
      }.bind(this),
    );
    $$('input[name=action_save]').each(
      function (item) {
        item.observe('click', this.onSaveAndView.bindAsEventListener(this));
      }.bind(this),
    );
    $$('input[name=action_saveandcontinue]').each(
      function (item) {
        item.observe('click', this.onSaveAndContinue.bindAsEventListener(this));
      }.bind(this),
    );
  },
  addShortcuts: function () {
    var shortcuts = {
      action_cancel: this.translations.cancel,
      action_preview: this.translations.preview,
      // The following 2 are both "Back to edit" in the preview mode, depending on the used editor
      action_edit: this.translations.backtoedit,
      action_inline: this.translations.backtoedit,
      action_save: this.translations.saveandview,
      action_propupdate: this.translations.saveAndView,
      action_saveandcontinue: this.translations.saveandcontinue,
    };
    for (var key in shortcuts) {
      var targetButtons = $$('input[name=' + key + ']');
      if (targetButtons.size() > 0) {
        shortcut.add(
          shortcuts[key],
          function () {
            this.click();
          }.bind(targetButtons.first()),
          { propagate: false },
        );
      }
    }
  },
  validators: new Array(),
  addValidators: function () {
    // Add live presence validation for inputs with classname 'required'.
    var inputs = $(document.body).select('input.required');
    for (var i = 0; i < inputs.length; i++) {
      var input = inputs[i];
      var validator = new LiveValidation(input, { validMessage: '' });
      validator.add(Validate.Presence, {
        failureMessage: this.translations.mandatoryField,
      });
      validator.validate();
      this.validators.push(validator);
    }
  },
  validateForm: function (form) {
    for (var i = 0; i < this.validators.length; i++) {
      if (!this.validators[i].validate()) {
        return false;
      }
    }
    return true;
  },
  onCancel: function (event) {
    event.stop();

    // Notify others we are going to cancel
    this.notify(event, 'cancel');

    var location = event.element().form.action;
    if (typeof location != 'string') {
      location = event.element().form.attributes.getNamedItem('action');
      if (location) {
        location = location.nodeValue;
      } else {
        location = window.self.location.href;
      }
    }
    var parts = location.split('#', 2);
    var fragmentId = parts.length == 2 ? parts[1] : '';
    location = parts[0];
    if (location.indexOf('?') == -1) {
      location += '?';
    }
    window.location = location + '&action_cancel=true' + fragmentId;
  },
  onPreview: function (event) {
    if (!this.validateForm(event.element().form)) {
      event.stop();
    } else {
      // Notify others
      this.notify(event, 'preview');
    }
  },
  onSaveAndView: function (event) {
    if (!this.validateForm(event.element().form)) {
      event.stop();
    } else {
      this.notify(event, 'save', { continue: false });
    }
  },
  onSaveAndContinue: function (event) {
    if (!this.validateForm(event.element().form)) {
      event.stop();
    } else {
      this.notify(event, 'save', { continue: true });
    }
  },
  notify: function (event, action, params) {
    document.fire(
      'xwiki:actions:' + action,
      Object.extend({ originalEvent: event, form: event.element().form }, params || {}),
    );
    // In IE, events can't be stopped from another event's handler, so we must call stop() again here
    if (event.stopped) {
      event.stop();
    }
  },
});

// ======================================
// Save and continue button: Ajax improvements
XWiki.actionButtons.AjaxSaveAndContinue = Class.create({
  initialize: function () {
    this.createMessages();
    this.addListeners();
  },
  createMessages: function () {
    this.savingBox = new XWiki.widgets.Notification('Saving...', 'inprogress', { inactive: true });
    this.savedBox = new XWiki.widgets.Notification('Saved', 'done', { inactive: true });
    this.failedBox = new XWiki.widgets.Notification(
      'Failed to save the document. Reason: <span id="ajaxRequestFailureReason"></span>',
      'error',
      { inactive: true },
    );
  },
  addListeners: function () {
    document.observe('xwiki:actions:save', this.onSave.bindAsEventListener(this));
  },
  onSave: function (event) {
    if (event.memo['continue']) {
      if (typeof event.memo.originalEvent != 'undefined') {
        event.memo.originalEvent.stop();
      }
      this.form = $(event.memo.form);
      this.savedBox.hide();
      this.failedBox.hide();
      this.savingBox.show();
      var formData = new Hash(
        this.form.serialize({ hash: true, submit: 'action_saveandcontinue' }),
      );
      formData.set('minorEdit', '1');
      if (!Prototype.Browser.Opera) {
        // Opera can't handle properly 204 responses.
        formData.set('ajax', 'true');
      }
      new Ajax.Request(this.form.action, {
        method: 'post',
        parameters: formData.toQueryString(),
        onSuccess: this.onSuccess.bindAsEventListener(this),
        on1223: this.on1223.bindAsEventListener(this),
        on0: this.on0.bindAsEventListener(this),
        onFailure: this.onFailure.bind(this),
      });
    }
  },
  // IE converts 204 status code into 1223...
  on1223: function (response) {
    response.request.options.onSuccess(response);
  },
  // 0 is returned for network failures, except on IE where a strange large number (12031) is returned.
  on0: function (response) {
    response.request.options.onFailure(response);
  },
  onSuccess: function (response) {
    // If there was a 'template' field in the form, disable it to avoid 'This document already exists' errors.
    if (this.form && this.form.template) {
      this.form.template.disabled = true;
      this.form.template.value = '';
    }
    this.savingBox.replace(this.savedBox);
    // Announce that the document has been saved
    // TODO: We should send the new version as a memo field
    document.fire('xwiki:document:saved');
  },
  onFailure: function (response) {
    this.savingBox.replace(this.failedBox);
    if (response.statusText == '' /* No response */ || response.status == 12031 /* In IE */) {
      $('ajaxRequestFailureReason').update('Server not responding');
    } else {
      $('ajaxRequestFailureReason').update(response.statusText);
    }
    // Announce that a document save attempt has failed
    document.fire('xwiki:document:saveFailed', { response: response });
  },
});
document.observe('dom:loaded', function () {
  new XWiki.actionButtons.EditActions();
  // In preview mode, the &continue part of the save&continue should lead back to the edit action.
  if (!$(document.body).hasClassName('previewbody')) {
    new XWiki.actionButtons.AjaxSaveAndContinue();
  }
});
