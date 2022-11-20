
class CelRteAdaptor {

  uploadHandler(blobInfo, progress) {
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
            progress(e.loaded / e.total * 100);
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
            blobInfo.filename(), ']');
          const formData = new FormData();
          formData.append('uploadToken', respJson.token);
          formData.append('celTokenUploadCreateIfNotExists', true);
          formData.append('filename', blobInfo.filename());
          formData.append('filepath', blobInfo.blob(), blobInfo.filename());
        
          xhr.send(formData);
      });
    });
  }
  
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
  "image_uploadtab" : true,   "images_upload_handler": celRteAdaptor.uploadHandler,
  "automatic_uploads": true
});
