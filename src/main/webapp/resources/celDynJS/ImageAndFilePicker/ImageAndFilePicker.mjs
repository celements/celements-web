/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */
import { CelFileDropHandler }
  from "../upload/fileUpload.mjs?version=202212020804";
import { CelOverlay }
  from "../overlay/celOverlay.mjs?version=202212041427";

//TODO CELDEV-1078 - improve implementation 
export class CelFilePicker {

  constructor(options) {
    this.dropHandler = new CelFileDropHandler(options.wiki_attach_path,
      options.wiki_imagedownload_path, this.updateAttachmentList.bind(this),
      (standPercent) => console.log('upload progress ', standPercent));
    this.imagePickerMaxDimension = 100;
    this.filebaseFN = options.filebaseFN;
    this.pickerOverlay = new CelOverlay([{
      'src' : '/file/resources/celRes/ImageAndFilePicker/ImageAndFilePicker.css'
    }]);
    this.pickerOverlay.customCssClass = 'filebasePicker';
    this.pickerOverlay.setZIndex(2000);
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
      if (options.duplicateCheck) {
        [...attachEl.querySelectorAll('.imagePickerWrapper')]
          .filter(imgWrapper => imgWrapper.querySelector('img').src.href == attElemUrl.href)
          .forEach(imgWrapper => imgWrapper.remove());
      }
      attachEl.appendChild(imgDiv);
      imgDiv.addEventListener('click', options.clickHandler);
    }
    return attachEl;
  }

  async updateAttachmentList() {
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
    const resp = await fetch('/ajax/picker/filePickerList', {
      method : 'POST',
      body : formData
    });
    const data = await resp.json()
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
  }

  renderFilePickerInOverlay(onlyImages, callback, value) {
    this.startPos = 0;
    this.stepNumber = 1000; //TODO CELDEV-1078 - reduce initial stepNumber to 25
    this.tag = '';
    this.onlyImages = onlyImages;
    this.callback = callback;
    this.selectedValue = value;
    this.updateAttachmentList();
  }

}
