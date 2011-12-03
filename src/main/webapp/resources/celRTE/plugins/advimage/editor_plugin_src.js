/**
 * $Id: editor_plugin_src.js 677 2008-03-07 13:52:41Z spocke $
 *
 * @author Moxiecode, synventis
 * @copyright Copyright © 2010 synventis, Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	tinymce.create('tinymce.plugins.AdvancedImagePlugin', {
		init : function(ed, url) {
			// Register commands
			ed.addCommand('mceAdvImage', function() {
				// Internal image object like a flash placeholder
				if (ed.dom.getAttrib(ed.selection.getNode(), 'class').indexOf('mceItem') != -1)
					return;

				ed.windowManager.open({
					file : url + '/image.htm',
					width : 620 + parseInt(ed.getLang('celimage.delta_width', 0)),
					height : 500 + parseInt(ed.getLang('celimage.delta_height', 0)),
					inline : 1
				}, {
					plugin_url : url
				});
			});

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