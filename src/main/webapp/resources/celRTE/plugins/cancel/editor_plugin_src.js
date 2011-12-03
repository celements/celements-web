/**
 * Cancel plugin for tinyMCE in XWiki
 * Developped by synventis gmbh, Theus Hossmann <theus.hossmann@synventis.com>
 */

/* Import plugin specific language pack */
tinyMCE.importPluginLanguagePack('cancel', 'en,tr,sv,zh_cn,cs,fa,fr_ca,fr,de,pl,pt_br,nl,he,nb,hu,ru,ru_KOI8-R,ru_UTF-8,nn,fi,da,es,cy,is,zh_tw,zh_tw_utf8,sk');

var TinyMCE_CancelPlugin = {
	getInfo : function() {
		return {
			longname : 'Cancel',
			author : 'synventis gmbh',
			authorurl : 'http://www.synventis.com',
			infourl : '',
			version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
		};
	},

	/**
	 * Returns the HTML contents of the cancel control.
	 */
	getControlHTML : function(cn) {
		switch (cn) {
			case "cancel":
				return tinyMCE.getButtonHTML(cn, 'lang_save_desc', '{$pluginurl}/images/cancel.gif', 'mceCancel');
		}
		return "";
	},

	/**
	 * Executes the save command.
	 */
	execCommand : function(editor_id, element, command, user_interface, value) {
		// Handle commands
		switch (command) {
			case "mceCancel":
				if (tinyMCE.getParam("plugin_cancel_cancelFunction")) {
					var func_name = tinyMCE.getParam("plugin_cancel_cancelFunction");
					eval(func_name+"()");
				} else
					alert("Error: No cancel function defined.");

				return true;
		}
		// Pass to next handler in chain
		return false;
	}
};

tinyMCE.addPlugin("cancel", TinyMCE_CancelPlugin);