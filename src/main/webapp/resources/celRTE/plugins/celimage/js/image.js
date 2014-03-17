var CelImageDialog = {
    _isNewImage : null,
    _origDim : new Hash(),
    _gallery : undefined,

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
    if (ed.getParam("celanim_slideshow", false)) {
      _me.fillGalleryList('galleryPicker_list');
    }
    $('galleryPicker_list').observe('change', _me._selectGalleryPickerActionHandler.bind(_me));
    $('gallery_list').observe('change', _me._selectGalleryActionHandler.bind(_me));
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
      selectByValue(f, 'galleryPicker_list', _me.getAttrib(n, 'gallery'), true, true);
      if ($('gallery_list').value != '') {
        _me._gallery = new CELEMENTS.images.Gallery($('gallery_list').value);
      }
      selectByValue(f, 'effect_list', _me.getAttrib(n, 'effect'), true, true);
      nl.hasSlideshow.checked = _me.getAttrib(n, 'hasSlideshow');
      nl.hasOverlay.checked = _me.getAttrib(n, 'hasOverlay');
      nl.hasCloseButton.checked = _me.getAttrib(n, 'hasCloseButton');
      nl.isSlideshowManualStart.checked = _me.getAttrib(n, 'isSlideshowManualStart');
      nl.isSlideshowRandomStart.checked = _me.getAttrib(n, 'isSlideshowRandomStart');
      nl.slideshowFixStartImageNum.value = _me.getAttrib(n, 'slideshowFixStartImageNum');
      nl.hasSlideshowAddNavigation.checked = _me.getAttrib(n, 'hasSlideshowAddNavigation');
      nl.delay.value = _me.getAttrib(n, 'delay');
      nl.overlayWidth.value = _me.getAttrib(n, 'overlayWidth');
      nl.overlayHeight.value = _me.getAttrib(n, 'overlayHeight');
      nl.animWidth.value = _me.getAttrib(n, 'animWidth');
      nl.animHeight.value = _me.getAttrib(n, 'animHeight');
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
      _me.resetMaxDimension();
      _me._isNewImage = false;
    } else {
      baseurl = tinyMCEPopup.getParam("wiki_attach_path");
      loadAttachmentList(baseurl);
    }

    $('resetMax').observe('click', function(event) {
      $('celwidth').value = '';
      $('celheight').value = '';
      CelImageDialog.resetMaxDimension();
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
    _me.showPreviewImage(nl.src.value, 1);
    Event.observe(window, 'resize', _me._popupResizeHandler);
    _me._popupResizeHandler();
  },

  _loadedGalleryData : function(galleryObj) {
    var _me = this;
    if (galleryObj.getImages().size() > 0) {
      _me.isNewImage = true;
      var filename = galleryObj.getImages()[0].getURL();
      filename = filename.replace(/^(.+)\?.*/, '$1');
      document.forms[0].src.value = filename;
      document.forms[0].hasSlideshow.checked = true;
      document.forms[0].slideshowFixStartImageNum.value = 1;
      var overlayDim = galleryObj.getDimension();
      document.forms[0].overlayWidth.value = overlayDim.width;
      document.forms[0].overlayHeight.value = overlayDim.height;
      _me.showPreviewImage(filename);
      mcTabs.displayTab('imageDetails_tab','imageDetails_panel');
    } else {
      alert('empty gallery.');
    }
  },

  _selectGalleryPickerActionHandler : function(event) {
    var _me = this;
    var gallerySelect = event.element();
    if ($('gallery_list').value != gallerySelect.value) {
      $('gallery_list').value = gallerySelect.value;
    }
    if (!_me._gallery || (_me._gallery.getDocRef() != gallerySelect.value)) {
      if (gallerySelect.value != '') {
        _me._gallery = new CELEMENTS.images.Gallery(gallerySelect.value,
            _me._loadedGalleryData.bind(_me));
      } else {
        _me._gallery = undefined;
      }
    }
  },

  _selectGalleryActionHandler : function(event) {
    var _me = this;
    var galleryPicker = event.element();
    if ($('galleryPicker_list').value != galleryPicker.value) {
      $('galleryPicker_list').value = galleryPicker.value;
    }
    if (!_me._gallery || (_me._gallery.getDocRef() != galleryPicker.value)) {
      if (galleryPicker.value != '') {
        _me._gallery = new CELEMENTS.images.Gallery(galleryPicker.value);
      } else {
        _me._gallery = undefined;
      }
    }
  },

  getOrigDimensionsForImg : function(imgSrc, callbackFN) {
    var _me = this;
    var ed = tinyMCEPopup.editor;
    callbackFN = callbackFN || function() {};
    var imageFullName = _me._getImageFullName(imgSrc);
    if (!_me._origDim.get(imageFullName)) {
//      console.log('getOrigDimensionsForImg: load async for ', imageFullName);
      tinymce.plugins.CelementsImagePlugin.prototype.loadOrigDimensionsAsync(ed,
          imageFullName, callbackFN);
    } else {
//      console.log('getOrigDimensionsForImg: already available for ', imageFullName,
//          _me._origDim.get(imageFullName));
      callbackFN(imageFullName, _me._origDim.get(imageFullName));
    }
  },

  resetMaxDimension : function(callbackFN) {
    callbackFN = callbackFN || function(){};
    var _me = this;
    var f = document.forms[0];
    var nl = f.elements;
//    console.log('resetMaxDimension: ', nl.celwidth.value, nl.celheight.value);
    var newIsCropped = (nl.cropWidth.value != '') && (nl.cropHeight.value != '');
    if (newIsCropped) {
      $('resetMaxLabel').update(nl.cropWidth.value + ' x ' + nl.cropHeight.value);
      _me._updateAfterResettingMaxDimension(newIsCropped);
      callbackFN();
    } else {
      _me.getOrigDimensionsForImg(nl.src.value, function(imageFullName, origDim) {
//          console.log('resetMaxDimension: callback ', imageFullName, origDim);
          $('resetMaxLabel').update(origDim.width + ' x ' + origDim.height);
          _me._updateAfterResettingMaxDimension(newIsCropped);
          callbackFN();
      });
    }
  },

  _updateAfterResettingMaxDimension : function(newIsCropped) {
    var _me = this;
    var f = document.forms[0];
    var nl = f.elements;
//    console.log('_updateAfterResettingMaxDimension: ', nl.celwidth.value, nl.celheight.value);
    if ((nl.celwidth.value == '') && (nl.celheight.value == '')) {
      nl.celheight.value = _me.getMaxHeight();
      _me.changeWidth();
    } else if (nl.celheight.value == '') {
      _me.changeHeight();
    }
    if (nl.celwidth.value == '') {
      _me.changeWidth();
    }
  },

  _popupResizeHandler : function() {
    var newMaxSize = $j(window).height() - 108;
    $$('.panel_wrapper .panel, .panel_wrapper .current').each(function(panel) {
      panel.setStyle( { 'height' : newMaxSize + 'px' });
    });
    var newPickerMaxSize = newMaxSize - 62;
    $('attachments').setStyle({ 'height' : newPickerMaxSize + 'px' });
    //TODO add minimal height depending on content
  },

  getMaxWidth : function() {
    return $('resetMaxLabel').innerHTML.replace(/\D*(\d*) x.*/g, '$1');
  },

  getMaxHeight : function() {
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
            t.startInsertAndClose();
        });

        return;
      }
    }

    t.startInsertAndClose();
  },
  
  addAutoResizeToURL : function(src, width, height) {
    if (src && (src != '')) {
      var newSrc = src.replace(/(.*\?)(.*&celwidth=\d*|celwidth=\d*)(\D?.*)/g, '$1$3');
      newSrc = newSrc.replace(/(.*\?)(.*&celheight=\d*|celheight=\d*)(\D?.*)/g, '$1$3');
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
  
  addFixAnimSizeToURL : function(src) {
    var f = document.forms[0];
    var nl = f.elements;
    if (src && (src != '')) {
      var newSrc = src.replace(/(.*\?)(.*&background=\d*|background=\d*)(\D?.*)/g, '$1$3');
      if(newSrc.indexOf('?') < 0) {
        newSrc += '?';
      } else if(!newSrc.endsWith('&')) {
        newSrc += '&';
      }
      if (nl.hasSlideshow.checked) {
        //TODO change background color to transparent
        newSrc += 'background=00000022';
      }
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
        var cropH = $('cropHeight').value;
        newSrc = src.replace(/(.*\?)(.*&cropX=\d*|cropX=\d*)(\D?.*)/g, '$1$3');
        newSrc = newSrc.replace(/(.*\?)(.*&cropY=\d*|cropY=\d*)(\D?.*)/g, '$1$3');
        newSrc = newSrc.replace(/(.*\?)(.*&cropW=\d*|cropW=\d*)(\D?.*)/g, '$1$3');
        newSrc = newSrc.replace(/(.*\?)(.*&cropH=\d*|cropH=\d*)(\D?.*)/g, '$1$3');
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

  _getGallerySpace : function() {
    var _me = this;
    if (!_me._gallery) {
      return '';
    }
    var gallerySpaceName = _me._gallery.getSpaceName();
    if (_me._gallery && gallerySpaceName) {
      return gallerySpaceName;
    }
    return '';
  },

  getSlideShowId : function(f) {
    var _me = this;
    var nl = f.elements;
    newId = 'S' + new Date().getTime() + ':' + getSelectValue(f, 'gallery') + ':'
      + nl.delay.value + ':' + getSelectValue(f, 'effect') + ':' + nl.overlayWidth.value
      + ':' + nl.overlayHeight.value + ':' + nl.slideshowFixStartImageNum.value + ':'
      + _me._getGallerySpace() + ':'  + nl.animWidth.value + ':' + nl.animHeight.value;
    return newId.replace(/:+$/, '');
  },

  startInsertAndClose : function() {
//    console.debug('startInsertAndClose');
    var _me = this;
    var prepareFunctions = new Array();
    prepareFunctions.push(_me._insertAndClose.bind(_me));
    $$('body')[0].fire('celImagePicker:collectPrepareForInsertAndClose',
        prepareFunctions);

    var executeInsertAndCloseFunc = function() {
//      console.debug('executeInsertAndCloseFunc: ', prepareFunctions.length);
      var nextFunc = prepareFunctions.pop();
      if (nextFunc) {
        nextFunc(executeInsertAndCloseFunc);
      } else {
        executeInsertAndCloseFunc();
      }
    };

    //start finishing
//    console.debug('start finishing functions');
    executeInsertAndCloseFunc();
  },

  _insertAndClose : function() {
//    console.debug('insertAndClose now.');
    var _me = this;
    var ed = tinyMCEPopup.editor, f = document.forms[0];
    var nl = f.elements, args = {}, el;

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

    if (nl.hasSlideshow.checked && !isNaN(parseInt(nl.animWidth.value))
        && !isNaN(parseInt(nl.animHeight.value))) {
      nl.celwidth.value = parseInt(nl.animWidth.value);
      nl.celheight.value = parseInt(nl.animHeight.value);
    }

    nl.src.value = _me.addAutoResizeToURL(nl.src.value, nl.celwidth.value,
        nl.celheight.value);

    nl.src.value = _me.replaceCropInURL(nl.src.value);

    nl.src.value = _me.addFixAnimSizeToURL(nl.src.value);

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

    var cssClassPrefix = 'celanim';
//    console.log('_insertAndClose: isNewImageGallery ', _me._gallery.isNewImageGallery());
    if (_me._gallery && _me._gallery.isNewImageGallery()) {
      cssClassPrefix = 'celimage';
    }

    if (nl.hasSlideshow.checked) {
      args['id'] = _me.getSlideShowId(f);
      args['class'] = (args['class'] + ' ' + cssClassPrefix + '_slideshow').strip();
    }

    if (nl.isSlideshowManualStart.checked) {
      args['id'] = _me.getSlideShowId(f);
      args['class'] = (args['class'] + ' ' + cssClassPrefix + '_manualstart').strip();
    }

    if (nl.isSlideshowRandomStart.checked) {
      args['id'] = _me.getSlideShowId(f);
      args['class'] = (args['class'] + ' ' + cssClassPrefix + '_slideshowRandomStart').strip();
    }

    if (nl.slideshowFixStartImageNum.value != '') {
      args['id'] = _me.getSlideShowId(f);
    }

    if (nl.hasSlideshowAddNavigation.checked) {
      args['id'] = _me.getSlideShowId(f);
      args['class'] = (args['class'] + ' ' + cssClassPrefix + '_addNavigation').strip();
    }

    if (nl.hasOverlay.checked) {
      args['id'] = _me.getSlideShowId(f);
      args['class'] = (args['class'] + ' ' + cssClassPrefix + '_overlay').strip();
    }

    if (nl.hasCloseButton.checked) {
      args['id'] = _me.getSlideShowId(f);
      args['class'] = (args['class'] + ' ' + cssClassPrefix + '_overlay_addCloseButton').strip();
    }

    el = ed.selection.getNode();

    var imageFullName = _me._getImageFullName(args['src']);
    ed.origData.unset(imageFullName);
    ed.lastSize.unset(imageFullName);

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

  _getImageFullName : function(imageUrl) {
    return imageUrl.replace(/.*\/download\/([^\/]+)\/([^\/]+)\/([^\?]+).*/, '$1.$2;$3');
  },

  getAttrib : function(e, at) {
    var ed = tinyMCEPopup.editor, dom = ed.dom, v = '';

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
      return (dom.hasClass(e, 'celanim_slideshow') || dom.hasClass(e, 'celimage_slideshow'));
    }

    if (at == 'isSlideshowManualStart') {
      return (dom.hasClass(e, 'celanim_manualstart') || dom.hasClass(e, 'celimage_manualstart'));
    }

    if (at == 'isSlideshowRandomStart') {
      return (dom.hasClass(e, 'celanim_slideshowRandomStart') || dom.hasClass(e, 'celimage_slideshowRandomStart'));
    }

    if (at == 'hasSlideshowAddNavigation') {
      return (dom.hasClass(e, 'celanim_addNavigation') || dom.hasClass(e, 'celimage_addNavigation'));
    }

    if (at == 'hasOverlay') {
      return (dom.hasClass(e, 'celanim_overlay') || dom.hasClass(e, 'celimage_overlay'));
    }

    if (at == 'hasCloseButton') {
      return (dom.hasClass(e, 'celanim_overlay_addCloseButton') || dom.hasClass(e, 'celimage_overlay_addCloseButton'));
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

    if (at == 'animWidth') {
      v = '';
      idArgs = dom.getAttrib(e, 'id').split(':');
      if (idArgs.length > 8) {
        v = idArgs[8];
      }
      return v;
    }

    if (at == 'animHeight') {
      v = '';
      idArgs = dom.getAttrib(e, 'id').split(':');
      if (idArgs.length > 9) {
        v = idArgs[9];
      }
      return v;
    }

    if (at == 'slideshowFixStartImageNum') {
      v = '';
      idArgs = dom.getAttrib(e, 'id').split(':');
      if (idArgs.length > 6) {
        v = idArgs[6];
      }
      return v;
    }

    if (at == 'class') {
      v = ' ' + dom.getAttrib(e, 'class') + ' ';
      v = v.replace(/ /g, '  ');
      v = v.replace(/ (celanim_slideshow|celanim_manualstart|celanim_overlay|celanim_overlay_addCloseButton|celanim_slideshowRandomStart|celanim_addNavigation) /g, ' ');
      v = v.replace(/ (celimage_slideshow|celimage_manualstart|celimage_overlay|celimage_overlay_addCloseButton|celimage_slideshowRandomStart|celimage_addNavigation) /g, ' ');
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
      if (!$(lst.up('fieldset')).visible()) {
        Effect.Appear(lst.up('fieldset'));
      }
    }
  },

  fillEffectList : function(id) {
    var dom = tinyMCEPopup.dom, lst = dom.get(id), cl;

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
      if(this._isNewImage) {
        $('resetMaxLabel').update(img.width + ' x ' + img.height);
        this._isNewImage = false;
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

    var maxWidthValue = parseInt(t.getMaxWidth());
    var newWidthValue = parseInt(f.celwidth.value);
    if (isNaN(newWidthValue) || (newWidthValue >= maxWidthValue)
        || (newWidthValue <= 0)) {
      f.celwidth.value = maxWidthValue;
      f.celheight.value = t.getMaxHeight();
    } else {
      tp = (newWidthValue / parseInt(t.preloadImg.width)) * t.preloadImg.height;
      f.celheight.value = Math.floor(tp + 0.5);
      t.showPreviewImage(f.src.value, 1);
    }
  },

  changeWidth : function() {
    var f = document.forms[0], tp, t = this;

    if (!t.constrain || !t.preloadImg) {
      return;
    }

    var maxHeightValue = parseInt(t.getMaxHeight());
    var newHeightValue = parseInt(f.celheight.value);
    if (isNaN(newHeightValue) || (newHeightValue >= maxHeightValue)
        || (newHeightValue <= 0)) {
      f.celheight.value = maxHeightValue;
      f.celwidth.value = t.getMaxWidth();
    } else {
      tp = (newHeightValue / parseInt(t.preloadImg.height)) * t.preloadImg.width;
      f.celwidth.value = Math.floor(tp + 0.5);
      t.showPreviewImage(f.src.value, 1);
    }
  },

  updateStyle : function(ty) {
    var dom = tinyMCEPopup.dom, v, f = document.forms[0], img = dom.create('img', {style : dom.get('style').value});

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

  showPreviewImage : function(u, st) {
    var _me = this;
    var f = document.forms[0], nl = f.elements;

    if (!u || (u == '')) {
      tinyMCEPopup.dom.setHTML('prev', '<p style="padding:20px;">' + tinyMCEPopup.getLang(
          'celimage_dlg.select_image_first') +'</p>');
      return;
    }
    u = _me.replaceCropInURL(_me.addAutoResizeToURL(u, nl.celwidth.value,
        nl.celheight.value));
        
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
//      console.log('showPreviewImage: image changed');
    }

//    console.log('showPreviewImage: new URL ', u);
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
