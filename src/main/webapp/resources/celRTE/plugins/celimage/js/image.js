var CelImageDialog = {
    isNewImage : null,

    preInit : function() {
    var url;

    tinyMCEPopup.requireLangPack();

    if (url = tinyMCEPopup.getParam("external_image_list_url"))
      document.write('<script language="javascript" type="text/javascript" src="' + tinyMCEPopup.editor.documentBaseURI.toAbsolute(url) + '"></script>');
  },

  init : function(ed) {
    var _me = this;
    var f = document.forms[0], nl = f.elements, ed = tinyMCEPopup.editor, dom = ed.dom, n = ed.selection.getNode();

    tinyMCEPopup.resizeToInnerSize();
    _me.fillClassList('class_list');
    _me.fillGalleryList('gallery_list');
    _me.fillEffectList('effect_list');
    TinyMCE_EditableSelects.init();

    if (n.nodeName == 'IMG') {
      nl.src.value = dom.getAttrib(n, 'src').replace(/\?.*/, '');
      nl.celwidth.value = dom.getAttrib(n, 'width');
      nl.celheight.value = dom.getAttrib(n, 'height');
      nl.cropX.value = _me.getAttrib(n, 'cropX');
      nl.cropY.value = _me.getAttrib(n, 'cropY');
      nl.cropWidth.value = _me.getAttrib(n, 'cropWidth');
      nl.cropHeight.value = _me.getAttrib(n, 'cropHeight');
      if((nl.cropX.value != '') && (nl.cropY.value != '') && (nl.cropWidth.value != '') 
          && (nl.cropHeight.value != '')) {
        nl.isCropped.value = '1';
      }
      nl.alt.value = dom.getAttrib(n, 'alt');
      nl.title.value = dom.getAttrib(n, 'title');
      nl.marginTop.value = _me.getAttrib(n, 'marginTop');
      nl.marginLeft.value = _me.getAttrib(n, 'marginLeft');
      nl.marginBottom.value = _me.getAttrib(n, 'marginBottom');
      nl.marginRight.value = _me.getAttrib(n, 'marginRight');
      nl.border.value = _me.getAttrib(n, 'border');
      selectByValue(f, 'align', _me.getAttrib(n, 'align'));
      selectByValue(f, 'class_list', _me.getAttrib(n, 'class'), true, true);
      selectByValue(f, 'gallery_list', _me.getAttrib(n, 'gallery'), true, true);
      selectByValue(f, 'effect_list', _me.getAttrib(n, 'effect'), true, true);
      nl.hasSlideshow.checked = _me.getAttrib(n, 'hasSlideshow');
      nl.hasOverlay.checked = _me.getAttrib(n, 'hasOverlay');
      nl.hasCloseButton.checked = _me.getAttrib(n, 'hasCloseButton');
      nl.isSlideshowManualStart.checked = _me.getAttrib(n, 'isSlideshowManualStart');
      nl.isSlideshowRandomStart.checked = _me.getAttrib(n, 'isSlideshowRandomStart');
      nl.hasSlideshowAddNavigation.checked = _me.getAttrib(n, 'hasSlideshowAddNavigation');
      nl.delay.value = _me.getAttrib(n, 'delay');
      nl.overlayWidth.value = _me.getAttrib(n, 'overlayWidth');
      nl.overlayHeight.value = _me.getAttrib(n, 'overlayHeight');
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
          _me.updateStyle('align');

        if (dom.getAttrib(n, 'border'))
          _me.updateStyle('border');
      }
      $('imagePicker_tab').down('a').observe('click',
          imagePicker_pickerTabFirstClickHandler);
    } else {
      baseurl = tinyMCEPopup.getParam("wiki_attach_path");
      loadAttachmentList(baseurl);
    }

    $('resetMax').observe('click', function(event) {
      $('celwidth').value = _me._getMaxWidth();
      $('celheight').value = _me._getMaxHeight();
      CelImageDialog.showPreviewImage(CelImageDialog.replaceCropInURL(
          CelImageDialog.addAutoResizeToURL($('previewImg').src, $('celwidth').value, 
          $('celheight').value)), $('celwidth').value, $('celheight').value, 1);
      event.stop();
    });

    // If option enabled default constrain proportions to checked
    if (ed.getParam("advimage_constrain_proportions", true)) {
      _me.constrain = true;
    }

    if (ed.getParam("celanim_slideshow", false)) {
      $('animation_panel').show();
      $('animation_tab').show();
    }

    if (ed.getParam("cel_crop", false)) {
      $('crop_panel').show();
      $('crop_tab').show();
    }

    _me.changeAppearance();
    _me.showPreviewImage(_me.replaceCropInURL(_me.addAutoResizeToURL(nl.src.value, 
        nl.celwidth.value, nl.celheight.value)), nl.celwidth.value, nl.celheight.value, 1);
    Event.observe(window, 'resize', _me._popupResizeHandler);
    _me._popupResizeHandler();
  },

  _popupResizeHandler : function() {
    var newMaxSize = $j(document).height() - 108;
    $$('.panel_wrapper .panel, .panel_wrapper .current').each(function(panel) {
      console.log('panel size: ', panel.id, panel.getHeight(), newMaxSize);
      panel.setStyle( { 'height' : newMaxSize + 'px' });
    });
    var newPickerMaxSize = newMaxSize - 62;
    $('attachments').setStyle({ 'height' : newPickerMaxSize + 'px' });
    //TODO add minimal height depending on content
  },

  _getMaxWidth : function() {
    return $('resetMaxLabel').innerHTML.replace(/\D*(\d*) x.*/g, '$1');
  },

  _getMaxHeight : function() {
    return $('resetMaxLabel').innerHTML.replace(/.*x (\d*)\D*/g, '$1');
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
      var newSrc = src.replace(/(.*\?.*)(&celwidth=\d*|celwidth=\d*&)(\D?.*)/g, '$1$3');
      newSrc = newSrc.replace(/(.*\?.*)(&celheight=\d*|celheight=\d*&)(\D?.*)/g, '$1$3');
      if(newSrc.indexOf('?') < 0) {
        newSrc += '?';
      } else if(!newSrc.endsWith('&')) {
        newSrc += '&';
      }
      newSrc += 'celwidth=' + width + '&celheight=' + height;
      return newSrc;
    }
    return '';
  },
  
  replaceCropInURL : function(src) {
    if (src && (src != '')) {
      if($('isCropped').value == '1') {
        var cropX = $('cropX').value;
        var cropY = $('cropY').value;
        var cropW = $('cropWidth').value;
        var cropH = $('cropHeight').value
        newSrc = src.replace(/(.*\?.*)(&cropX=\d*|cropX=\d*&)(\D?.*)/g, '$1$3');
        newSrc = newSrc.replace(/(.*\?.*)(&cropY=\d*|cropY=\d*&)(\D?.*)/g, '$1$3');
        newSrc = newSrc.replace(/(.*\?.*)(&cropW=\d*|cropW=\d*&)(\D?.*)/g, '$1$3');
        newSrc = newSrc.replace(/(.*\?.*)(&cropH=\d*|cropH=\d*&)(\D?.*)/g, '$1$3');
        if(newSrc.indexOf('?') < 0) {
          newSrc += '?';
        } else if(!newSrc.endsWith('&')) {
          newSrc += '&';
        }
        newSrc += 'cropX=' + cropX + '&cropY=' + cropY + '&cropW=' + cropW + '&cropH=' 
            + cropH;
        return newSrc;
      } else {
        return src;
      }
    }
    return src;
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
    
    nl.src.value = this.replaceCropInURL(nl.src.value);

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

    if(at == 'cropX') {
      return e.src.replace(/((^|(.*[\?&]))cropX=(\d*)\D?.*)|.*/g, '$4');
    }
    if(at == 'cropY') {
      return e.src.replace(/((^|(.*[\?&]))cropY=(\d*)\D?.*)|.*/g, '$4');
    }
    if(at == 'cropWidth') {
      return e.src.replace(/((^|(.*[\?&]))cropW=(\d*)\D?.*)|.*/g, '$4');
    }
    if(at == 'cropHeight') {
      return e.src.replace(/((^|(.*[\?&]))cropH=(\d*)\D?.*)|.*/g, '$4');
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
      if(this.isNewImage) {
        $('resetMaxLabel').update(img.width + ' x ' + img.height);
        this.isNewImage = false;
      }
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

    var maxWidthValue = parseInt(t._getMaxWidth());
    var newWidthValue = parseInt(f.celwidth.value);
    if (isNaN(newWidthValue) || (newWidthValue >= maxWidthValue)
        || (newWidthValue <= 0)) {
      f.celwidth.value = maxWidthValue;
      f.celheight.value = t._getMaxHeight();
    } else {
      tp = (newWidthValue / parseInt(t.preloadImg.width)) * t.preloadImg.height;
      f.celheight.value = Math.floor(tp + 0.5);
      t.showPreviewImage(t.replaceCropInURL(t.addAutoResizeToURL(f.src.value, 
          f.celwidth.value, f.celheight.value)), f.celwidth.value, f.celheight.value, 1);
    }
  },

  changeWidth : function() {
    var f = document.forms[0], tp, t = this;

    if (!t.constrain || !t.preloadImg) {
      return;
    }

    var maxHeightValue = parseInt(t._getMaxHeight());
    var newHeightValue = parseInt(f.celheight.value);
    if (isNaN(newHeightValue) || (newHeightValue >= maxHeightValue)
        || (newHeightValue <= 0)) {
      f.celheight.value = maxHeightValue;
      f.celwidth.value = t._getMaxWidth();
    } else {
      tp = (newHeightValue / parseInt(t.preloadImg.height)) * t.preloadImg.width;
      f.celwidth.value = Math.floor(tp + 0.5);
      t.showPreviewImage(t.replaceCropInURL(t.addAutoResizeToURL(f.src.value, 
          f.celwidth.value, f.celheight.value)), f.celwidth.value, f.celheight.value, 1);
    }
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
//TODO if src is new, remove crops
    if (!u || (u == '')) {
      tinyMCEPopup.dom.setHTML('prev', '<p style="padding:20px;">' + tinyMCEPopup.getLang(
          'celimage_dlg.select_image_first') +'</p>');
      return;
    }

    if (!st && tinyMCEPopup.getParam("advimage_update_dimensions_onchange", true)) {
      this.resetImageData();
    }

    u = tinyMCEPopup.editor.documentBaseURI.toAbsolute(u);

    if($('previewImg') && ($('previewImg').src != '') 
        && (u.replace(/(.*)\?.*/g, '$1') != $('previewImg').src.replace(/(.*)\?.*/g, '$1'
        ))) { //image changed
      $('isCropped').value == '0';
      $('cropX').value = '';
      $('cropY').value = '';
      $('cropWidth').value = '';
      $('cropHeight').value = '';
    }

    if(this.isNewImage == null) {
      if(($('cropWidth').value != '') && ($('cropHeight').value != '')) {
        $('resetMaxLabel').update($('cropWidth').value + ' x ' + $('cropHeight').value);
      } else {
        $('resetMaxLabel').update(width + ' x ' + height);
      }
      this.isNewImage = false;
    }
    
    if (!st) {
      tinyMCEPopup.dom.setHTML('prev', '<img id="previewImg" src="' + u
          + '"' //+ dimensions
          + ' border="0" onload="CelImageDialog.updateImageData(this);"'
          + ' onerror="CelImageDialog.resetImageData();" />');
    } else {
      tinyMCEPopup.dom.setHTML('prev', '<img id="previewImg" src="' + u
          + '"' //+ dimensions
          + ' border="0" onload="CelImageDialog.updateImageData(this, 1);" />');
    }
  }
};

CelImageDialog.preInit();
tinyMCEPopup.onInit.add(CelImageDialog.init, CelImageDialog);
