var CelImageDialog = {
    preInit : function() {
    var url;

    tinyMCEPopup.requireLangPack();

    if (url = tinyMCEPopup.getParam("external_image_list_url"))
      document.write('<script language="javascript" type="text/javascript" src="' + tinyMCEPopup.editor.documentBaseURI.toAbsolute(url) + '"></script>');
  },

  init : function(ed) {
    var f = document.forms[0], nl = f.elements, ed = tinyMCEPopup.editor, dom = ed.dom, n = ed.selection.getNode();

    tinyMCEPopup.resizeToInnerSize();
    this.fillClassList('class_list');
    this.fillGalleryList('gallery_list');
    this.fillEffectList('effect_list');
    TinyMCE_EditableSelects.init();

    if (n.nodeName == 'IMG') {
      nl.src.value = dom.getAttrib(n, 'src').replace(/\?.*/, '');
      nl.celwidth.value = dom.getAttrib(n, 'width');
      nl.celheight.value = dom.getAttrib(n, 'height');
      nl.alt.value = dom.getAttrib(n, 'alt');
      nl.title.value = dom.getAttrib(n, 'title');
      nl.marginTop.value = this.getAttrib(n, 'marginTop');
      nl.marginLeft.value = this.getAttrib(n, 'marginLeft');
      nl.marginBottom.value = this.getAttrib(n, 'marginBottom');
      nl.marginRight.value = this.getAttrib(n, 'marginRight');
      nl.border.value = this.getAttrib(n, 'border');
      selectByValue(f, 'align', this.getAttrib(n, 'align'));
      selectByValue(f, 'class_list', this.getAttrib(n, 'class'), true, true);
      selectByValue(f, 'gallery_list', this.getAttrib(n, 'gallery'), true, true);
      selectByValue(f, 'effect_list', this.getAttrib(n, 'effect'), true, true);
      nl.hasSlideshow.checked = this.getAttrib(n, 'hasSlideshow');
      nl.hasOverlay.checked = this.getAttrib(n, 'hasOverlay');
      nl.hasCloseButton.checked = this.getAttrib(n, 'hasCloseButton');
      nl.isSlideshowManualStart.checked = this.getAttrib(n, 'isSlideshowManualStart');
      nl.isSlideshowRandomStart.checked = this.getAttrib(n, 'isSlideshowRandomStart');
      nl.hasSlideshowAddNavigation.checked = this.getAttrib(n, 'hasSlideshowAddNavigation');
      nl.delay.value = this.getAttrib(n, 'delay');
      nl.overlayWidth.value = this.getAttrib(n, 'overlayWidth');
      nl.overlayHeight.value = this.getAttrib(n, 'overlayHeight');
      nl.style.value = dom.getAttrib(n, 'style');
      nl.id.value = dom.getAttrib(n, 'id');
      nl.dir.value = dom.getAttrib(n, 'dir');
      nl.lang.value = dom.getAttrib(n, 'lang');
      nl.usemap.value = dom.getAttrib(n, 'usemap');
      nl.longdesc.value = dom.getAttrib(n, 'longdesc');
      nl.insert.value = ed.getLang('update');
      mcTabs.displayTab('imageDetails_tab','imageDetails_panel');

      if (ed.settings.inline_styles) {
        // Move attribs to styles
        if (dom.getAttrib(n, 'align'))
          this.updateStyle('align');

        if (dom.getAttrib(n, 'border'))
          this.updateStyle('border');
      }
      $('imagePicker_tab').down('a').observe('click',
          imagePicker_pickerTabFirstClickHandler);
    } else {
      baseurl = tinyMCEPopup.getParam("wiki_attach_path");
      loadAttachmentList(baseurl);
    }

    // If option enabled default constrain proportions to checked
    if (ed.getParam("advimage_constrain_proportions", true)) {
      this.constrain = true;
    }

    if (ed.getParam("celanim_slideshow", false)) {
      $('animation_panel').show();
      $('animation_tab').show();
    }

    this.changeAppearance();
    this.showPreviewImage(this.addAutoResizeToURL(nl.src.value, nl.celwidth.value,
        nl.celheight.value), nl.celwidth.value, nl.celheight.value, 1);
  },

  insert : function(file, title) {
    var ed = tinyMCEPopup.editor, t = this, f = document.forms[0];

    if (f.src.value === '') {
      if (ed.selection.getNode().nodeName == 'IMG') {
        ed.dom.remove(ed.selection.getNode());
        ed.execCommand('mceRepaint', false);
      }

      tinyMCEPopup.close();
      return;
    }

    if (tinyMCEPopup.getParam("accessibility_warnings", 1)) {
      if (!f.alt.value) {
        tinyMCEPopup.confirm(tinyMCEPopup.getLang('celimage_dlg.missing_alt'), function(s) {
          if (s)
            t.insertAndClose();
        });

        return;
      }
    }

    t.insertAndClose();
  },

  addAutoResizeToURL : function(src, width, height) {
    if (src && (src != '')) {
      return src.replace(/\?.*/, '').strip() + '?celwidth=' + width
        + '&celheight=' + height;
    }
    return '';
  },

  getSlideShowId : function(f) {
    var nl = f.elements;
    newId = 'S' + new Date().getTime() + ':' + getSelectValue(f, 'gallery') + ':'
      + nl.delay.value + ':' + getSelectValue(f, 'effect') + ':' + nl.overlayWidth.value
      + ':' + nl.overlayHeight.value;
    return newId.replace(/:+$/, '');
  },

  insertAndClose : function() {
    var ed = tinyMCEPopup.editor, f = document.forms[0], nl = f.elements, v, args = {}, el;

    tinyMCEPopup.restoreSelection();

    // Fixes crash in Safari
    if (tinymce.isWebKit)
      ed.getWin().focus();

    if (!ed.settings.inline_styles) {
      args = {
        border : nl.border.value,
        align : getSelectValue(f, 'align')
      };
    } else {
      // Remove deprecated values
      args = {
        vspace : '',
        hspace : '',
        border : '',
        align : ''
      };
    }

    nl.src.value = this.addAutoResizeToURL(nl.src.value, nl.celwidth.value,
        nl.celheight.value);

    tinymce.extend(args, {
      src : nl.src.value,
      width : nl.celwidth.value,
      height : nl.celheight.value,
      alt : nl.alt.value,
      title : nl.title.value,
      'class' : getSelectValue(f, 'class_list'),
      style : nl.style.value,
      id : nl.id.value,
      dir : nl.dir.value,
      lang : nl.lang.value,
      usemap : nl.usemap.value,
      longdesc : nl.longdesc.value
    });

    if (nl.hasSlideshow.checked) {
      args['id'] = this.getSlideShowId(f);
      args['class'] = (args['class'] + ' celanim_slideshow').strip();
    }

    if (nl.isSlideshowManualStart.checked) {
      args['id'] = this.getSlideShowId(f);
      args['class'] = (args['class'] + ' celanim_manualstart').strip();
    }

    if (nl.isSlideshowRandomStart.checked) {
      args['id'] = this.getSlideShowId(f);
      args['class'] = (args['class'] + ' celanim_slideshowRandomStart').strip();
    }

    if (nl.hasSlideshowAddNavigation.checked) {
      args['id'] = this.getSlideShowId(f);
      args['class'] = (args['class'] + ' celanim_addNavigation').strip();
    }

    if (nl.hasOverlay.checked) {
      args['id'] = this.getSlideShowId(f);
      args['class'] = (args['class'] + ' celanim_overlay').strip();
    }

    if (nl.hasCloseButton.checked) {
      args['id'] = this.getSlideShowId(f);
      args['class'] = (args['class'] + ' celanim_overlay_addCloseButton').strip();
    }

    el = ed.selection.getNode();

    if (el && el.nodeName == 'IMG') {
      ed.dom.setAttribs(el, args);
    } else {
      ed.execCommand('mceInsertContent', false, '<img id="__mce_tmp" />', {skip_undo : 1});
      ed.dom.setAttribs('__mce_tmp', args);
      ed.dom.setAttrib('__mce_tmp', 'id', '');
      ed.undoManager.add();
    }

    tinyMCEPopup.close();
  },

  getAttrib : function(e, at) {
    var ed = tinyMCEPopup.editor, dom = ed.dom, v, v2;

    if (at.startsWith('margin')) {
      switch (at) {
        case 'marginTop':
          v = dom.getStyle(e, 'margin-top');

          if (!v) {
            v = dom.getAttrib(e, 'vspace');
          }
          break;
        case 'marginBottom':
          v = dom.getStyle(e, 'margin-bottom');

          if (!v) {
            v = dom.getAttrib(e, 'vspace');
          }
          break;
        case 'marginRight':
          v = dom.getStyle(e, 'margin-right');

          if (!v) {
            v = dom.getAttrib(e, 'hspace');
          }
          break;
        case 'marginLeft':
          v = dom.getStyle(e, 'margin-left');

          if (!v) {
            v = dom.getAttrib(e, 'hspace');
          }
          break;
      }
      if (v) {
        v = v.replace(/px/, '');
      }
      return v;
    }

    if (at == 'hasSlideshow') {
      return dom.hasClass(e, 'celanim_slideshow');
    }

    if (at == 'isSlideshowManualStart') {
      return dom.hasClass(e, 'celanim_manualstart');
    }

    if (at == 'isSlideshowRandomStart') {
      return dom.hasClass(e, 'celanim_slideshowRandomStart');
    }

    if (at == 'hasSlideshowAddNavigation') {
      return dom.hasClass(e, 'celanim_addNavigation');
    }

    if (at == 'hasOverlay') {
      return dom.hasClass(e, 'celanim_overlay');
    }

    if (at == 'hasCloseButton') {
      return dom.hasClass(e, 'celanim_overlay_addCloseButton');
    }

    if (at == 'gallery') {
      v = '';
      idArgs = dom.getAttrib(e, 'id').split(':');
      if (idArgs.length > 1) {
        v = idArgs[1];
      }
      return v;
    }

    if (at == 'delay') {
      v = '';
      idArgs = dom.getAttrib(e, 'id').split(':');
      if (idArgs.length > 2) {
        v = idArgs[2];
      }
      return v;
    }

    if (at == 'effect') {
      v = '';
      idArgs = dom.getAttrib(e, 'id').split(':');
      if (idArgs.length > 3) {
        v = idArgs[3];
      }
      return v;
    }

    if (at == 'overlayWidth') {
      v = '';
      idArgs = dom.getAttrib(e, 'id').split(':');
      if (idArgs.length > 4) {
        v = idArgs[4];
      }
      return v;
    }

    if (at == 'overlayHeight') {
      v = '';
      idArgs = dom.getAttrib(e, 'id').split(':');
      if (idArgs.length > 5) {
        v = idArgs[5];
      }
      return v;
    }

    if (at == 'class') {
      v = ' ' + dom.getAttrib(e, 'class') + ' ';
      v = v.replace(/ /g, '  ');
      v = v.replace(/ (celanim_slideshow|celanim_manualstart|celanim_overlay|celanim_overlay_addCloseButton|celanim_slideshowRandomStart|celanim_addNavigation) /g, ' ');
      v = v.replace(/  /g, ' ');
      return v.strip();
    }

    if (ed.settings.inline_styles) {
      switch (at) {
        case 'align':
          if (v = dom.getStyle(e, 'float'))
            return v;

          if (v = dom.getStyle(e, 'vertical-align'))
            return v;

          break;

        case 'width':
          if (v = dom.getStyle(e, 'width'))
            return v;

          if (v = dom.getAttrib(e, 'width'))
            return v;

          break;

        case 'height':
          if (v = dom.getStyle(e, 'height'))
            return v;

          if (v = dom.getAttrib(e, 'height'))
            return v;

          break;

        case 'border':
          v = 0;

          tinymce.each(['top', 'right', 'bottom', 'left'], function(sv) {
            sv = dom.getStyle(e, 'border-' + sv + '-width');

            // False or not the same as prev
            if (!sv || (sv != v && v !== 0)) {
              v = 0;
              return false;
            }

            if (sv)
              v = sv;
          });

          if (v)
            return parseInt(v.replace(/[^0-9]/g, ''));

          break;
      }
    }

    if (v = dom.getAttrib(e, at))
      return v;

    return '';
  },

  fillClassList : function(id) {
    var dom = tinyMCEPopup.dom, lst = dom.get(id), v, cl;

    if (v = tinyMCEPopup.getParam('theme_advanced_styles')) {
      cl = [];

      tinymce.each(v.split(';'), function(v) {
        var p = v.split('=');

        cl.push({'title' : p[0], 'class' : p[1]});
      });
    } else
      cl = tinyMCEPopup.editor.dom.getClasses();

    if (cl.length > 0) {
      lst.options.length = 0;
      lst.options[lst.options.length] = new Option(tinyMCEPopup.getLang('not_set'), '');

      tinymce.each(cl, function(o) {
        lst.options[lst.options.length] = new Option(o.title || o['class'], o['class']);
      });
    } else
      dom.remove(dom.getParent(id, 'tr'));
  },

  fillGalleryList : function(id) {
    var dom = tinyMCEPopup.dom, lst = dom.get(id), v, cl;

    cl = [];
    if (v = tinyMCEPopup.getParam('gallerylist')) {

      tinymce.each(v.split(','), function(v) {
        var p = v.split('=');

        cl.push({'title' : p[0], 'gallery' : p[1]});
      });
    }

    if (cl.length > 0) {
      lst.options.length = 0;
      lst.options[lst.options.length] = new Option(tinyMCEPopup.getLang('not_set'), '');

      tinymce.each(cl, function(o) {
        lst.options[lst.options.length] = new Option(o.title || o['gallery'], o['gallery']);
      });
    }
  },

  fillEffectList : function(id) {
    var dom = tinyMCEPopup.dom, lst = dom.get(id), v, cl;

    outermostWindow = window;
    while (outermostWindow.parent && (outermostWindow != outermostWindow.parent)) {
      outermostWindow = outermostWindow.parent;
    }

    lst.options.length = 0;
    lst.options[lst.options.length] = new Option(tinyMCEPopup.getLang(
        'celimage_dlg.defaultEffect'), '');
    if (outermostWindow.celSlideShowEffects) {
      cl = outermostWindow.celSlideShowEffects.keys();
      if (cl.length > 0) {
        tinymce.each(cl, function(o) {
          lst.options[lst.options.length] = new Option(o, o);
        });
      }
    }
  },

  resetImageData : function() {
    var f = document.forms[0];

    f.elements.celwidth.value = f.elements.celheight.value = '';
  },

  updateImageData : function(img, st) {
    var f = document.forms[0];

    if (!st) {
      f.elements.celwidth.value = img.width;
      f.elements.celheight.value = img.height;
    }

    this.preloadImg = img;
  },

  changeAppearance : function() {
    var ed = tinyMCEPopup.editor, f = document.forms[0], img = document.getElementById(
        'alignSampleImg');

    if (img) {
      if (ed.getParam('inline_styles')) {
        ed.dom.setAttrib(img, 'style', f.style.value);
      } else {
        img.align = f.align.value;
        img.border = f.border.value;
      }
    }
  },

  changeHeight : function() {
    var f = document.forms[0], tp, t = this;

    if (!t.constrain || !t.preloadImg) {
      return;
    }

    if (f.celwidth.value == "")
      return;

    tp = (parseInt(f.celwidth.value) / parseInt(t.preloadImg.width)) * t.preloadImg.height;
    f.celheight.value = Math.floor(tp + 0.5);
    t.showPreviewImage(t.addAutoResizeToURL(f.src.value, f.celwidth.value,
        f.celheight.value), f.celwidth.value, f.celheight.value, 1);
  },

  changeWidth : function() {
    var f = document.forms[0], tp, t = this;

    if (!t.constrain || !t.preloadImg) {
      return;
    }

    if (f.celheight.value == "")
      return;

    tp = (parseInt(f.celheight.value) / parseInt(t.preloadImg.height)) * t.preloadImg.width;
    f.celwidth.value = Math.floor(tp + 0.5);
    t.showPreviewImage(t.addAutoResizeToURL(f.src.value, f.celwidth.value,
        f.celheight.value), f.celwidth.value, f.celheight.value, 1);
  },

  updateStyle : function(ty) {
    var dom = tinyMCEPopup.dom, st, v, f = document.forms[0], img = dom.create('img', {style : dom.get('style').value});

    if (tinyMCEPopup.editor.settings.inline_styles) {
      // Handle align
      if (ty == 'align') {
        dom.setStyle(img, 'float', '');
        dom.setStyle(img, 'vertical-align', '');

        v = getSelectValue(f, 'align');
        if (v) {
          if (v == 'left' || v == 'right')
            dom.setStyle(img, 'float', v);
          else
            img.style.verticalAlign = v;
        }
      }

      // Handle border
      if (ty == 'border') {
        dom.setStyle(img, 'border', '');

        v = f.border.value;
        if (v || v == '0') {
          if (v == '0')
            img.style.border = '0';
          else
            img.style.border = v + 'px solid black';
        }
      }

      // Handle marginLeft
      if (ty == 'marginLeft') {
        dom.setStyle(img, 'marginLeft', '');

        v = f.marginLeft.value;
        if (v) {
          img.style.marginLeft = v + 'px';
        }
      }

      // Handle marginRight
      if (ty == 'marginRight') {
        dom.setStyle(img, 'marginRight', '');

        v = f.marginRight.value;
        if (v) {
          img.style.marginRight = v + 'px';
        }
      }

      // Handle marginTop
      if (ty == 'marginTop') {
        dom.setStyle(img, 'marginTop', '');

        v = f.marginTop.value;
        if (v) {
          img.style.marginTop = v + 'px';
        }
      }

      // Handle marginBottom
      if (ty == 'marginBottom') {
        dom.setStyle(img, 'marginBottom', '');

        v = f.marginBottom.value;
        if (v) {
          img.style.marginBottom = v + 'px';
        }
      }

      // Merge
      dom.get('style').value = dom.serializeStyle(dom.parseStyle(img.style.cssText));
    }
  },

  changeMouseMove : function() {
  },

  showPreviewImage : function(u, celWidth, celHeight, st) {
    var width = celWidth || 0;
    var height = celHeight || 0;

    if (!u || (u == '')) {
      tinyMCEPopup.dom.setHTML('prev', '<p style="padding:20px;">' + tinyMCEPopup.getLang(
          'celimage_dlg.select_image_first') +'</p>');
      return;
    }

    if (!st && tinyMCEPopup.getParam("advimage_update_dimensions_onchange", true)) {
      this.resetImageData();
    }

    u = tinyMCEPopup.editor.documentBaseURI.toAbsolute(u);

    var dimensions = "";
    if ((width > 0) && (height > 0)) {
      dimensions = 'width="' + width + '" height="' + height + '"';
    }

    if (!st) {
      tinyMCEPopup.dom.setHTML('prev', '<img id="previewImg" src="' + u
          + '"' + dimensions
          + ' border="0" onload="CelImageDialog.updateImageData(this);"'
          + ' onerror="CelImageDialog.resetImageData();" />');
    } else {
      tinyMCEPopup.dom.setHTML('prev', '<img id="previewImg" src="' + u
          + '"' + dimensions
          + ' border="0" onload="CelImageDialog.updateImageData(this, 1);" />');
    }
  }
};

CelImageDialog.preInit();
tinyMCEPopup.onInit.add(CelImageDialog.init, CelImageDialog);
