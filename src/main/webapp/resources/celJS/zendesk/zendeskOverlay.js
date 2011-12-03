// IE6+SSL fix courtesy of http://www.tribalogic.net/

;(function(window) {
  try {
    var document = window.document;
    var undefined; // make sure nobody redefines window or undefined on us
    Cel_Zenbox = {

      /*
          PUBLIC API

          Methods in the public API can be used as callbacks or as direct calls. As such,
          they will always reference "Zenbox" instead of "this."
      */

      /*
       *  Build and render the Zenbox tab and build the frame for the Zenbox overlay,
       *  but do not display it.
       *  @see Zenbox._settings for options
       *  @param {Object} options
       */
      init: function(options) {
        try {
          var self = Cel_Zenbox;
          self._configure(options);
          if (!self._settings.url) {
            if (typeof(console) !== 'undefined' && console != null) { console.warn("Zendesk Dropbox must be configured with a URL."); }
          } else {
            self._initOverlay();
            self._initTab();
          }
        } catch(err) {
          if (typeof(console) !== 'undefined' && console != null) { console.error("Error initializing Zenbox: " + err + '.'); }
        }
      },

      /*
       *  Render the Zenbox. Alias for #show.
       *  @see #show
       */
      render: function(event) {
        return Cel_Zenbox.show(event);
      },

      /*
       *  Show the Zenbox. Aliased as #render.
       *  @params {Event} event the DOM event that caused the show; optional
       *  @return {false} false always, in case users want to bind it to an
       *                  onclick or other event and want to prevent default behavior.
       */
      show: function(event) {
        try {
          var self = Cel_Zenbox;
          self._render();
          var overlay = Cel_Zenbox._overlay();
          overlay.style.height = document.getElementById('zenbox_screen').style.height = self._getDocHeight() + 'px';
          document.getElementById('zenbox_main').style.top = self._getScrollOffsets().top + 50 + 'px';
          overlay.style.display = "block";
          return self._cancelEvent(event);
        } catch(err) {
          if (typeof(console) !== 'undefined' && console != null) { console.error("Error showing Zenbox: " + err + '.'); }
          return false;
        }
      },

      /*
       *  Hide the Zenbox.
        *  @params {Event} event the DOM event that caused the show; optional
        *  @return {false} false always, in case users want to bind it to an
        *                  onclick or other event and want to prevent default behavior.
        */
      hide: function (event){
        try {
          Cel_Zenbox._overlay().style.display = 'none';
          return Cel_Zenbox._cancelEvent(event);
        } catch(err) {
          if (typeof(console) !== 'undefined' && console != null) { console.error("Error hiding Zenbox: " + err + '.'); }
          return false;
        }
      },

      /*
          PRIVATE API

          Methods in the private API should only be called by Zenbox itself. As such, they
          can refer to "this" instead of "Zenbox."
      */

      _settings: {
        assetHost:      "asset0.zendesk.com",
        tab_id:         "support",
        tabText:        "Support", // most browsers will use the tab_id image rather than this text
        tab_color:      "#000000",
        hide_tab:       true,
        title:          "Support",
        text:           "How may we help you? Please fill in details below, and we'll get back to you as soon as possible.",
        loadingText:    " Loading&hellip;",
        closeText:      "Close",
        tag:            "dropbox",
        url:            "helpdesk.synventis.com",
        
        // the remaining settings are optional and listed here so users of the library know what they can configure:
        email:          undefined,
        email_header:   undefined,
        subject:        undefined,
        subject_header: undefined
      },

      _configure: function(options) {
        var prop;
        var self = this;
        for (prop in options) {
          if (options.hasOwnProperty(prop)) {
            self._settings[prop] = options[prop];
          }
        }
        self._prependSchemeIfNecessary('url');
        self._prependSchemeIfNecessary('assetHost');
      },

      _prependSchemeIfNecessary: function(urlProperty) {
        var url = this._settings[urlProperty];
        if (url && !(this._urlWithScheme.test(url))) {
          this._settings[urlProperty] = document.location.protocol + "//" + url;
        }
      },

      // @api private
      _cancelEvent: function(e) {
        var event = e || window.event || {};
        event.cancelBubble = true;
        event.returnValue = false;
        event.stopPropagation && event.stopPropagation();
        event.preventDefault && event.preventDefault();
        return false;
      },

      _urlWithScheme: /^[a-zA-Z]+:\/\//,

      _initOverlay: function() {
        var div  = document.createElement('div');
        div.setAttribute('id', 'zenbox_overlay');
        div.style.display = 'none';
        div.innerHTML = '&nbsp;';

        document.body.appendChild(div);
      },

      _initTab: function() {
        if (this._settings.hide_tab) {
          return;
        }

        this._createTabElement();

        var tab_src = this._settings.assetHost + "/external/zenbox/images/tab_" + this._settings.tab_id + ".png";
        var arVersion = window.navigator && window.navigator.appVersion.split("MSIE");
        var version = parseFloat(arVersion[1]);
        if ((version >= 5.5) && (version < 7) && (document.body.filters)) {
          document.getElementById('zenbox_tab').style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + tab_src + "', sizingMethod='crop')";
        } else {
          document.getElementById('zenbox_tab').style.backgroundImage = 'url(' + tab_src + ')';
        }
      },

      _createTabElement: function() {
        var tab = document.createElement('a');
        tab.setAttribute('id', 'zenbox_tab');
        tab.setAttribute('href', '#');
        tab.innerHTML = this._settings.tabText;

        tab.style.backgroundColor = this._settings.tab_color;
        tab.style.borderColor = this._settings.tab_color;

        tab.onclick = Cel_Zenbox.show;

        document.body.appendChild(tab);
      },

      _getDocHeight: function(){
        return Math.max(
          Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
          Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
          Math.max(document.body.clientHeight, document.documentElement.clientHeight)
        );
      },

      _getScrollOffsets: function(){
        var result = {};
        result.left = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
        result.top = window.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop;
        return(result);
      },

      _overlay: function() {
        return document.getElementById('zenbox_overlay');
      },

      _render: function() {
        if (this.is_rendered) {
          return;
        }
        this.is_rendered = true;
        this._overlay().innerHTML = this._overlayContent();
        var iframe = document.getElementById('zenbox_iframe');
        if (iframe.attachEvent) { // IE
          iframe.attachEvent("onload", this._iFrameLoaded);
        } else if (iframe.addEventListener) { // Mozilla
          iframe.addEventListener("load", this._iFrameLoaded, false);
        }
      },

      _iFrameLoaded: function() {
        document.getElementById('overlay_loading').style.display = "none";
        document.getElementById('zenbox_iframe').style.display = "block";
      },

      _overlayContent: function(title, text, iFrameURL) {
        return '<div id="zenbox_main">' +
            '<div id="overlay_header">' +
              '<span onclick="return Cel_Zenbox.hide();">' + this._settings.closeText + '</span>' +
            '</div>' +
            '<div id="overlay_preamble"><h2 id="overlay_zenbox_title">' + this._settings.title + '</h2>' +
              '<p id="overlay_zenbox_text">' + this._settings.text + '</p>' +
            '</div>' +
            '<div id="overlay_loading">' +
              '<center><h2><img src="' + this._settings.assetHost + '/images/medium_load.gif"/>' + this._settings.loadingText + '</h2></center><br/>&nbsp;' +
            '</div>' +
            '<iframe src="' + this._iFrameURL() + '" id="zenbox_iframe" frameborder="0" scrolling="no" allowTransparency="true" style="border:0;"></iframe>' +
          '</div>' +
          '<div id="zenbox_screen" onclick="return Cel_Zenbox.hide();" ></div>';
      },

      _iFrameURL: function() {
        var i_url = this._settings.url + "/external/zenbox/index.html?x=5";
        if (this._settings.tag) { i_url += "&set_tags=" + encodeURIComponent(this._settings.tag); }
        if (this._settings.email) { i_url += "&set_email=" + encodeURIComponent(this._settings.email); }
        if (this._settings.subject) { i_url += "&set_subject=" + encodeURIComponent(this._settings.subject); }
        if (this._settings.subject_header) { i_url += "&subject=" + encodeURIComponent(this._settings.subject_header); }
        if (this._settings.email_header) { i_url += "&email=" + encodeURIComponent(this._settings.email_header); }
        if (window.location) { i_url += "&page=" + encodeURIComponent(window.location.href); }
        return i_url;
      }
    };

    Event.observe(window, 'load', function() {
	  new Ajax.Request(getCelHost(), {
	    method: 'post',
	    parameters: {
          xpage : 'celements_ajax',
          ajax_mode : 'CelZendeskConfig'
		},
	    onSuccess: function(transport) {
	      if (transport.responseText.isJSON()) {
	    	Cel_Zenbox.init(transport.responseText.evalJSON());
	      } else {
            if (typeof(console) !== 'undefined' && console != null) { console.error("Response for zendesk config is no valid JSON. ", transport.responseText); }
	        Cel_Zenbox.init();
	      }
	    },
	    onFailure: function(transport) {
	      if (typeof(console) !== 'undefined' && console != null) { console.error("failed to get Zendesk config using default. "); }
          Cel_Zenbox.init();
	    }
	  });
    });
 } catch(err) {
   if (typeof(console) !== 'undefined' && console != null) { console.error("Error defining Zenbox: " + err + '.'); }
 }
})(this.window || this);
