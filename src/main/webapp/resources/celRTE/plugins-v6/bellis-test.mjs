
class CelRteAdaptor {
  
  constructor() {
    this.imagePickerMaxDimension = 100;
  }

  uploadImagesHandler(blobInfo, progress) {
    return this.uploadHandler({
      'name' : blobInfo.filname(),
      'blob' : blobInfo.blob()
    }, progress);
  }

  uploadHandler(fileInfo, progress) {
    return  new Promise((resolve, reject) => {
      const theEditor = tinymce.activeEditor;
      const option = name => editor => editor.options.get(name);
      console.log('celRTE_image_upload_handler start ', theEditor);
      const registerOption = theEditor.options.register;
      registerOption('wiki_attach_path', {
        processor: 'string',
        default: '/'
      });
      registerOption('wiki_imagedownload_path', {
        processor: 'string',
        default: '/'
      });
    
      const getBaseUrl = option('wiki_attach_path');
      const getImgUrl = option('wiki_imagedownload_path');
    
      console.log('celRTE_image_upload_handler baseUrl, imgUrl ', getBaseUrl(theEditor),
       getImgUrl(theEditor));
    
      fetch('?xpage=celements_ajax&ajax_mode=TokenFileUploader&tfu_mode=getTokenForCurrentUser')
        .then((response) => response.json())
        .then((respJson) => {
          console.log('celRTE_image_upload_handler respJson', respJson, respJson.token);
          const xhr = new XMLHttpRequest();
          xhr.withCredentials = false;
          xhr.open('POST', getBaseUrl(theEditor) + '?xpage=celements_ajax&ajax_mode=TokenFileUploader&tfu_mode=upload');
        
          xhr.upload.onprogress = (e) => {
            progress(Math.round(e.loaded / e.total * 100));
          };
        
          xhr.onload = () => {
            if (xhr.status === 403) {
              reject({ message: 'HTTP Error: ' + xhr.status, remove: true });
              return;
            }
        
            if (xhr.status < 200 || xhr.status >= 300) {
              reject('HTTP Error: ' + xhr.status);
              return;
            }
        
            const json = JSON.parse(xhr.responseText);
        
            if (!json || typeof json.success != 'boolean') {
              reject('Invalid JSON: ' + xhr.responseText);
              return;
            }
    
            if (!json.success) {
                  reject('failed to upload: ' + xhr.responseText);
                  return;
            }
    
        /**{
         "success" : false,
         "numSavedFiles" : 0,
         "attfilename" : "Spalenhof_Innenhof_1.jpg",
         "username" : "fpichler"}
        */
            resolve(getImgUrl(theEditor) + '/'+ json.attfilename);
          };
        
          xhr.onerror = () => {
            reject('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
          };
        
          console.log('celRTE_image_upload_handler token[', respJson.token, '] filename [',
            fileInfo.name, ']');
          const formData = new FormData();
          formData.append('uploadToken', respJson.token);
          formData.append('celTokenUploadCreateIfNotExists', true);
          formData.append('filename', fileInfo.name);
          formData.append('filepath', fileInfo.blob, blobInfo.filename());
        
          xhr.send(formData);
      });
    });
  }

  renderAttachmentList(attachEl, attList, options) {
    for (const attElem of attList) {
      const cssClasses = ['imagePickerSource'];
      const attSrc = decodeURI(attElem.src);
      const attElemUrl = new URL(attSrc, window.location.href);
      if (attElemUrl.href == options.currentImgUrl.href) {
        cssClasses.push('selected');
      }
      let thmbImgSrc = '/file/resources/celRes/glyphicons/glyphicons-37-file.png';
      if (attElem.mimeType.startsWith('image/')) {
        thmbImgSrc = (attSrc + '?celheight=' + this.imagePickerMaxDimension
          + '&celwidth=' + this.imagePickerMaxDimension);
      }
      const imgThmb = document.createElement('img');
      imgThmb.src = thmbImgSrc;
      const imgContainerDiv = document.createElement('div');
      imgContainerDiv.classList.add(...cssClasses);
      imgContainerDiv.appendChild(imgThmb);
      const imgDiv = document.createElement('div');
      imgDiv.classList.add('imagePickerWrapper');
      imgDiv.setAttribute('data-att-src', attSrc);
      imgDiv.setAttribute('data-filename', attElem.filename);
      imgDiv.appendChild(imgContainerDiv);
      if(options.duplicateCheck) {
        attachEl.querySelectorAll('.imagePickerWrapper').forEach(function(imgWrapper) {
          if(imgWrapper.querySelector('img').src.href == attElemUrl.href) {
            imgWrapper.remove();
          }
        });
      }
      attachEl.appendChild(imgDiv);
      imgDiv.addEventListener('click', options.clickHandler);
    }
    const dropZoneElem = document.createElement('div');
    dropZoneElem.id = 'drop_zone';
    dropZoneElem.insertAdjacentHTML('afterbegin','<p>Drag one or more files to this <i>drop zone</i>.</p>');
    dropZoneElem.addEventListener('drop', (event) => this.dropHandler(event));
    dropZoneElem.addEventListener('dragover', (event) => this.dragOverHandler(event));
    attachEl.after(dropZoneElem);
  }

  dragOverHandler(ev) {
    console.log('File(s) in drop zone');
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  }

  dropHandler(ev) {
    console.log('File(s) dropped');
    ev.preventDefault();
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...ev.dataTransfer.items].forEach((item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === 'file') {
          const file = item.getAsFile();
          console.log(`… file[${i}].name = ${file.name}`);
          return this.uploadHandler({
            'name' : file.name,
            'blob' : file
          }, (standPercent) => console.log('upload1 progress ', standPercent));
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...ev.dataTransfer.files].forEach((file, i) => {
        console.log(`… file[${i}].name = ${file.name}`);
          return this.uploadHandler({
            'name' : file.name,
            'blob' : file
          }, (standPercent) => console.log('upload2 progress ', standPercent));
      });
    }
  }

  celRTE_filePicker(theOverlay, filebaseFN, onlyImages, callback, value) {
    let startPos = 0;
    let stepNumber = 25;
    let tag = '';
    theOverlay.open();
    const formData = new FormData();
    formData.append('xpage', 'celements_ajax');
    formData.append('ajax_mode', 'imagePickerList');
    formData.append('images', '1');
    formData.append('start', startPos);
    formData.append('nb', stepNumber);
    formData.append('tagList', tag);
    formData.append('onlyImages', onlyImages)
    formData.append('filebaseDocFN', filebaseFN)
    fetch('/ajax/picker/filePickerList', {
      method : 'POST',
      body : formData
    }).then(resp => resp.json()
    ).then(data => {
      console.debug('imagePicker data: ', data);
      const attachEl = document.createElement('div');
      attachEl.id = 'attachments';
      this.renderAttachmentList(attachEl, data, {
        'currentImgUrl' : new URL(value, window.location.href),
        'duplicateCheck' : false,
        'clickHandler' : (event) => {
          const imageDiv = event.currentTarget;
          callback(imageDiv.dataset.attSrc, { alt : imageDiv.dataset.filename });
          theOverlay.close();
        }
      });
      theOverlay.updateContent([attachEl]);
    });
  }
  
  celRte_file_picker_handler(callback, value, meta) {
    // Provide file and text for the link dialog
    console.log('celRte_file_picker_handler ', value, meta, callback);
    const theEditor = tinymce.activeEditor;
    const option = name => editor => editor.options.get(name);
    console.log('celRTE_image_upload_handler start ', theEditor);
    const registerOption = theEditor.options.register;
    registerOption('filebaseFN', {
      processor: 'string',
      default: ''
    });
  
    const getFilebaseFN = option('filebaseFN');
    const theOverlay = new window.CELEMENTS_Overlay([{
      'src' : '/file/resources/celRTE/plugins-v6/celimage/imagepicker.css'
    }]);
    theOverlay.customCssClass = 'filebasePicker';
    theOverlay.setZIndex(2000);
    theOverlay.close();
  
    if (meta.filetype == 'file') {
      this.celRTE_filePicker(theOverlay, getFilebaseFN(theEditor), false, callback, value);
    }
  
    // Provide image and alt text for the image dialog
    if (meta.filetype == 'image') {
      this.celRTE_filePicker(theOverlay, getFilebaseFN(theEditor), true, callback, value);
    }
  
    // Provide alternative source and posted for the media dialog
    if (meta.filetype == 'media') {
      callback('movie.mp4', { source2: 'alt.ogg', poster: 'image.jpg' });
    }
  };
 
}

export const celRteAdaptor = new CelRteAdaptor();

tinymce.init({"selector" : "textarea.tinyMCE,textarea.mceEditor", "language" : "de",
  "valid_elements" : "b/strong,caption,hr[class|width|size|noshade],+a[href|class|target|onclick|name|id|title|rel|hreflang],br,i/em,#p[style|class|name|id],#h?[align<center?justify?left?right|class|style|id],-span[class|style|id|title],textformat[blockindent|indent|leading|leftmargin|rightmargin|tabstops],sub[class],sup[class],img[width|height|class|align|style|src|border=0|alt|id|title|usemap],table[align<center?left?right|bgcolor|border|cellpadding|cellspacing|class|height|width|style|id|title],tbody[align<center?char?justify?left?right|class|valign<baseline?bottom?middle?top],#td[align<center?char?justify?left?right|bgcolor|class|colspan|headers|height|nowrap<nowrap|style|rowspan|scope<col?colgroup?row?rowgroup|valign<baseline?bottom?middle?top|width],#th[align<center?char?justify?left?right|bgcolor|class|colspan|headers|height|rowspan|scope<col?colgroup?row?rowgroup|valign<baseline?bottom?middle?top|style|width],thead[align<center?char?justify?left?right|class|valign<baseline?bottom?middle?top],-tr[align<center?char?justify?left?right|bgcolor|class|style|rowspan|valign<baseline?bottom?middle?top|id],-ol[class|type|compact],-ul[class|type|compact],#li[class]",
  "invalid_elements" : "blockquote,body,button,center,cite,code,col,colgroup,dd,del,dfn,dir,div,dl,dt,fieldset,font,form,frame,frameset,head,html,iframe,input,ins,kbd,isindex,label,legend,link,map,menu,meta,noframes,noscript,object,optgroup,option,param,pre/listing/plaintext/xmp,q,s,samp,script,select,small,strike,textarea,tfoot,tt,u,var",
  "height" : "500", "width" : "1000", "menubar" : false, "branding" : false,
  "plugins" : " preview searchreplace autolink directionality visualblocks visualchars fullscreen link template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help code media",
  "external_plugins" : {
    "celImage" : "/file/resources/celRTE/plugins-v6/celimage/plugin.js?version=20221119113500"
  }, "toolbar"  : [
    "celImage | link",
    "removeformat formatselect bold italic underline | alignleft aligncenter alignright alignjustify | bullist | unlink insertimage",
    "pastetext paste | table | tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | tablesplitcells tablemergecells | template | code",
    "media"
  ], "celanim_slideshow" : true, "cel_crop" : true,
  "gallerylist" : " (Gallery8)=Gallery.Gallery8, (Gallery9)=Gallery.Gallery9,Album1  (Gallery11)=Gallery.Gallery11,Bilderimport (TestgalerieBilderimport)=Gallery.TestgalerieBilderimport,Bringold demo Alt (Bringold-Demo)=Gallery.Bringold-Demo,Japan :-) (Gallery1)=Gallery.Gallery1,Mit Meta! (Gallery6)=Gallery.Gallery6,Neugier (TestgallerySilvia)=Gallery.TestgallerySilvia,Test Titel (Gallery7)=Gallery.Gallery7,Testfotoalbum (Celementsgalerie)=Gallery.Celementsgalerie,UmlautTest (UmlautTest)=Gallery.UmlautTest,Webseiten synventis (CMSsynventisReferenzseiten)=Gallery.CMSsynventisReferenzseiten",
  "content_css" : [
    "/file/resources/celRes/celements2%2Dcontent.css?version=20221118165414",
    "/file/BellisLayout/WebHome/Bellis%2Dcontent.css?version=20160122155749"
  ], "wiki_images_path" : "/download/Content_attachments/FileBaseDoc",
  "wiki_attach_path" : "/Content_attachments/FileBaseDoc",
  "wiki_imagedownload_path" : "/download/Content_attachments/FileBaseDoc",
  "wiki_linkpicker_space" : "Content",  "wiki_linkpicker_baseurl" : "/untitled1",
  "wiki_filepicker_upload_space" : "Content", "wiki_filepicker_space" : "Content",
  "wiki_filepicker_doc" : "untitled1",
  "wiki_filebase_link" : "/untitled1?xpage=celements_ajax&ajax_mode=FileBase&picker=1&single_doc=Content_attachments.FileBaseDoc&fieldname=href&src_doc=Content.untitled1&columns=10&root=Content&hasUpload=1",
  "wiki_filebase_single_doc" : "1", "entity_encoding" : "raw", "autoresize_bottom_margin" : 1,
  "autoresize_min_height" : 0, "style_formats" : [], "image_advtab": true,
  "image_uploadtab" : true,   "images_upload_handler": celRteAdaptor.uploadImagesHandler,
  "file_picker_callback" :  celRteAdaptor.celRte_file_picker_handler.bind(celRteAdaptor),
  "automatic_uploads": true, "filebaseFN" : "Content_attachments.FileBaseDoc"
});
