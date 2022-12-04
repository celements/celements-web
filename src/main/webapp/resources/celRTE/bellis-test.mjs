
import "../celDynJS/DynamicLoader/celLazyLoader.mjs?version=202212031733";
import { CelUploadHandler }
  from "../celDynJS/upload/fileUpload.mjs?version=202212020804";
import { CelFilePicker }
  from "./ImageAndFilePicker/ImageAndFilePicker.mjs?version=202212041429";

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
      "plugins" : " preview searchreplace autolink directionality visualblocks visualchars fullscreen link image template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help code media",
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
