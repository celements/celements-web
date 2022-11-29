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

export class CelUploadHandler {
  #uploadUrl;
  #fileBaseUrl;
  
  constructor(uploadUrl, fileBaseUrl) {
    this.#uploadUrl = uploadUrl;
    this.#fileBaseUrl = fileBaseUrl;
  }

  #createXhrForUpload(resolve, reject, progress) {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;
    xhr.open('POST', this.#uploadUrl + '?xpage=celements_ajax&ajax_mode=TokenFileUploader&tfu_mode=upload');
  
    xhr.upload.onprogress = (e) => {
      progress(Math.round(e.loaded / e.total * 100));
    };
  
    xhr.onload = () => {
      if ((xhr.status >= 200) && (xhr.status < 300)) {
        try {
          const json = JSON.parse(xhr.responseText);
          if (!json || typeof json.success != 'boolean') {
            reject('Invalid JSON: ' + xhr.responseText);
          }
          if (!json.success) {
            reject('failed to upload: ' + xhr.responseText);
          }
          resolve(this.#fileBaseUrl + '/'+ json.attfilename);
        } catch (err) {
          reject('Invalid JSON: ' + xhr.responseText + ' parse error: ' + err);
        }
      } else if (xhr.status === 403) {
        reject({ message: 'HTTP Error: ' + xhr.status, remove: true });
      } else {
        reject('HTTP Error: ' + xhr.status);
      }
    };
  
    xhr.onerror = () => {
      reject('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
    };
    return xhr;
  }

  upload(fileInfo, progress) {
    return  new Promise((resolve, reject) => {        
      fetch('?xpage=celements_ajax&ajax_mode=TokenFileUploader&tfu_mode=getTokenForCurrentUser')
      .then((response) => response.json())
      .then((respJson) => {
        console.debug('upload: token[', respJson.token, '] filename [',
          fileInfo.name, ']');
        const formData = new FormData();
        formData.append('uploadToken', respJson.token);
        formData.append('celTokenUploadCreateIfNotExists', true);
        formData.append('filename', fileInfo.name);
        formData.append('filepath', fileInfo.blob, fileInfo.name);
        this.#createXhrForUpload(resolve, reject, progress
          ).send(formData);
      }).catch((err) => reject({ message: 'Failed to get upload token. ' + err, remove: true  }));
    });
  }
}

export class CelFileDropHandler {
  #uploadHandler;
  #updateAfterUpload;
  #progressCallback;
  
  constructor(uploadUrl, fileBaseUrl, updateAfterUpload, progressCallback) {
    this.#uploadHandler = new CelUploadHandler(uploadUrl, fileBaseUrl);
    this.#updateAfterUpload = updateAfterUpload;
    this.#progressCallback = progressCallback ?? function() {};
  }

  registerHandler(dropZoneElem) {
    this.dropZoneElem = dropZoneElem;
    this.dropZoneElem.classList.add('celDropZone');
    this.dropZoneElem.addEventListener('drop', (event) => this.dropHandler(event));
    document.body.addEventListener('dragover', (event) => this.dragOverHandler(event));
   }

  dragOverHandler(ev) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.target.closest('.celDropZone') === this.dropZoneElem) {
      ev.dataTransfer.dropEffect = 'copy';
      this.dropZoneElem.classList.add('celDropOverActive');
    } else {
      ev.dataTransfer.dropEffect = 'none';
      this.dropZoneElem.classList.remove('celDropOverActive');
    }
  }

  uploadFile(file) {
    this.#uploadHandler.upload({
        'name' : file.name,
        'blob' : file
      }, this.#progressCallback
    ).then(() => { 
      if (typeof this.#updateAfterUpload === 'function') {
        this.#updateAfterUpload();
      }
    });
  }

  dropHandler(ev) {
    console.debug('File(s) dropped');
    ev.preventDefault();
    this.dropZoneElem.classList.remove('celDropOverActive');
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...ev.dataTransfer.items].forEach((item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === 'file') {
          const file = item.getAsFile();
          console.debug(`dropped file[${i}].name = ${file.name}`);
          this.uploadFile(file);
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...ev.dataTransfer.files].forEach((file, i) => {
        console.debug(`… file[${i}].name = ${file.name}`);
        this.uploadFile(file);
      });
    }
  }
  
}
