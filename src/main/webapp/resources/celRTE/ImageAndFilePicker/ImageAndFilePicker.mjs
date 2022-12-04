import { CelFileDropHandler }
  from "../../celDynJS/upload/fileUpload.mjs?version=202212020804";
import { CelOverlay }
  from "../../celDynJS/overlay/celOverlay.mjs?version=202212041407";

export class CelFilePicker {

  constructor(options) {
    this.dropHandler = new CelFileDropHandler(options.wiki_attach_path,
      options.wiki_imagedownload_path, this.updateAttachmentList.bind(this),
      (standPercent) => console.log('upload progress ', standPercent));
    this.imagePickerMaxDimension = 100;
    this.filebaseFN = options.filebaseFN;
    this.pickerOverlay = new CelOverlay([{
      'src' : '/file/resources/celRTE/ImageAndFilePicker/ImageAndFilePicker.css'
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
