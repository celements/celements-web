/**
 * $Id: editor_plugin_src.js 677 2008-03-07 13:52:41Z spocke $
 *
 * @author Moxiecode, synventis
 * @copyright Copyright © 2010 synventis, Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	tinymce.create('tinymce.plugins.AdvancedImagePlugin', {
		init : function(ed, url) {
			// DONOT Register commands

			// Register buttons
			ed.addButton('image', {
				title : 'advimage.image_desc',
				cmd : 'mceAdvImage'
			});
		},

		getInfo : function() {
			return {
				longname : 'Celements image',
				author : 'synventis',
				authorurl : 'http://www.synventis.ch',
				infourl : 'http://www.celements.ch',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('advimage', tinymce.plugins.AdvancedImagePlugin);
})();