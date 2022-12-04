
import { CelUploadHandler, CelFileDropHandler }
  from "/file/resources/celDynJS/upload/fileUpload.mjs?version=202212020804";
import { CelOverlay }
  from "/file/resources/celDynJS/overlay/celOverlay.mjs?version=202212020804";
import "/file/resources/celDynJS/DynamicLoader/celLazyLoader.mjs?version=202212031707";

class CelFilePicker {

  constructor(options) {
    this.dropHandler = new CelFileDropHandler(options.wiki_attach_path,
      options.wiki_imagedownload_path, this.updateAttachmentList.bind(this),
      (standPercent) => console.log('upload progress ', standPercent));
    this.imagePickerMaxDimension = 100;
    this.filebaseFN = options.filebaseFN;
    this.pickerOverlay = new CelOverlay([{
      'src' : '/file/resources/celRTE/plugins-v6/celimage/imagepicker.css'
    }]);
    this.pickerOverlay.customCssClass = 'filebasePicker';
    this.pickerOverlay.setZIndex(2000);
    this.pickerOverlay.close();
  }

  renderAttachmentList(attList, options) {
    const attachEl = document.createElement('div');
    attachEl.id = 'attachments';
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
    return attachEl;
  }

  updateAttachmentList() {
    this.pickerOverlay.open();
    const formData = new FormData();
    formData.append('xpage', 'celements_ajax');
    formData.append('ajax_mode', 'imagePickerList');
    formData.append('images', '1');
    formData.append('start', this.startPos);
    formData.append('nb', this.stepNumber);
    formData.append('tagList', this.tag);
    formData.append('onlyImages', this.onlyImages)
    formData.append('filebaseDocFN', this.filebaseFN)
    fetch('/ajax/picker/filePickerList', {
      method : 'POST',
      body : formData
    }).then(resp => resp.json()
    ).then(data => {
      console.debug('imagePicker data: ', data);
      const attachEl = this.renderAttachmentList(data, {
        'currentImgUrl' : new URL(this.selectedValue, window.location.href),
        'duplicateCheck' : false,
        'clickHandler' : (event) => {
          const imageDiv = event.currentTarget;
          this.callback(imageDiv.dataset.attSrc, { alt : imageDiv.dataset.filename });
          this.pickerOverlay.close();
        }
      });
      this.dropHandler.registerHandler(attachEl);
      this.pickerOverlay.updateContent([attachEl]);
    });
  }

  renderFilePickerInOverlay(onlyImages, callback, value) {
    this.startPos = 0;
    this.stepNumber = 25;
    this.tag = '';
    this.onlyImages = onlyImages;
    this.callback = callback;
    this.selectedValue = value;
    this.updateAttachmentList();
  }

}

class CelRteAdaptor {
  #uploadHandler;
  #filePicker;

  constructor(options) {
    this.#filePicker = new CelFilePicker(options);
    this.#uploadHandler = new CelUploadHandler(options.wiki_attach_path,
      options.wiki_imagedownload_path);
  }

  uploadImagesHandler(blobInfo, progress) {
    return this.#uploadHandler.upload({
      'name' : blobInfo.filename(),
      'blob' : blobInfo.blob()
    }, progress);
  }

  celRte_file_picker_handler(callback, value, meta) {
    // Provide file and text for the link dialog
    console.log('celRte_file_picker_handler ', value, meta, callback);
  
    if (meta.filetype == 'file') {
      this.#filePicker.renderFilePickerInOverlay(false, callback, value);
    }
  
    // Provide image and alt text for the image dialog
    if (meta.filetype == 'image') {
      this.#filePicker.renderFilePickerInOverlay(true, callback, value);
    }
  
    // Provide alternative source and posted for the media dialog
    if (meta.filetype == 'media') {
      callback('movie.mp4', { source2: 'alt.ogg', poster: 'image.jpg' });
    }
  }
 
  initTinyMceV6(event) {
    console.log('init TinyMCE v6 start ...', event.eventName, event);
    tinymce.init({"selector" : "textarea.tinyMCE,textarea.mceEditor", "language" : "de",
      "valid_elements" : "b/strong,caption,hr[class|width|size|noshade],+a[href|class|target|onclick|name|id|title|rel|hreflang],br,i/em,#p[style|class|name|id],#h?[align<center?justify?left?right|class|style|id],-span[class|style|id|title],textformat[blockindent|indent|leading|leftmargin|rightmargin|tabstops],sub[class],sup[class],img[width|height|class|align|style|src|border=0|alt|id|title|usemap],table[align<center?left?right|bgcolor|border|cellpadding|cellspacing|class|height|width|style|id|title],tbody[align<center?char?justify?left?right|class|valign<baseline?bottom?middle?top],#td[align<center?char?justify?left?right|bgcolor|class|colspan|headers|height|nowrap<nowrap|style|rowspan|scope<col?colgroup?row?rowgroup|valign<baseline?bottom?middle?top|width],#th[align<center?char?justify?left?right|bgcolor|class|colspan|headers|height|rowspan|scope<col?colgroup?row?rowgroup|valign<baseline?bottom?middle?top|style|width],thead[align<center?char?justify?left?right|class|valign<baseline?bottom?middle?top],-tr[align<center?char?justify?left?right|bgcolor|class|style|rowspan|valign<baseline?bottom?middle?top|id],-ol[class|type|compact],-ul[class|type|compact],#li[class]",
      "invalid_elements" : "blockquote,body,button,center,cite,code,col,colgroup,dd,del,dfn,dir,div,dl,dt,fieldset,font,form,frame,frameset,head,html,iframe,input,ins,kbd,isindex,label,legend,link,map,menu,meta,noframes,noscript,object,optgroup,option,param,pre/listing/plaintext/xmp,q,s,samp,script,select,small,strike,textarea,tfoot,tt,u,var",
      "height" : "500", "width" : "1000", "menubar" : false, "branding" : false,
      "plugins" : " preview searchreplace autolink directionality visualblocks visualchars fullscreen link template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help code media",
      "toolbar"  : [
        "image | link",
        "removeformat formatselect bold italic underline | alignleft aligncenter alignright alignjustify | bullist | unlink insertimage",
        "pastetext paste | table | tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | tablesplitcells tablemergecells | template | code",
        "media"
      ], "celanim_slideshow" : true, "cel_crop" : true,
      "gallerylist" : " (Gallery8)=Gallery.Gallery8, (Gallery9)=Gallery.Gallery9,Album1  (Gallery11)=Gallery.Gallery11,Bilderimport (TestgalerieBilderimport)=Gallery.TestgalerieBilderimport,Bringold demo Alt (Bringold-Demo)=Gallery.Bringold-Demo,Japan :-) (Gallery1)=Gallery.Gallery1,Mit Meta! (Gallery6)=Gallery.Gallery6,Neugier (TestgallerySilvia)=Gallery.TestgallerySilvia,Test Titel (Gallery7)=Gallery.Gallery7,Testfotoalbum (Celementsgalerie)=Gallery.Celementsgalerie,UmlautTest (UmlautTest)=Gallery.UmlautTest,Webseiten synventis (CMSsynventisReferenzseiten)=Gallery.CMSsynventisReferenzseiten",
      "content_css" : [
        "/file/resources/celRes/celements2%2Dcontent.css?version=20221118165414",
        "/file/BellisLayout/WebHome/Bellis%2Dcontent.css?version=20160122155749"
      ],
      "wiki_linkpicker_space" : "Content",  "wiki_linkpicker_baseurl" : "/untitled1",
      "entity_encoding" : "raw", "autoresize_bottom_margin" : 1,
      "autoresize_min_height" : 0, "style_formats" : [], "image_advtab": true, "image_uploadtab" : true,
      "images_upload_handler": this.uploadImagesHandler.bind(this),
      "file_picker_callback" :  this.celRte_file_picker_handler.bind(this),
      "automatic_uploads": true
    });
  }
}

export const celRteAdaptor = new CelRteAdaptor({
  "wiki_attach_path" : "/Content_attachments/FileBaseDoc",
  "wiki_imagedownload_path" : "/download/Content_attachments/FileBaseDoc",
  "filebaseFN" : "Content_attachments.FileBaseDoc"
});

const jsLazyLoadElem = document.createElement('cel-lazy-load-js');
jsLazyLoadElem.setAttribute('src', '/file/resources/celRTE/6.3.0/tinymce.min.js');
document.body.addEventListener('celements:jsFileLoaded', celRteAdaptor.initTinyMceV6.bind(celRteAdaptor));
document.body.appendChild(jsLazyLoadElem);
