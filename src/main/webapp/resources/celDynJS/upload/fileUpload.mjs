
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
        console.log('celRTE_image_upload_handler respJson', respJson, respJson.token);
        const xhr = this.#createXhrForUpload(resolve, reject, progress);
        console.log('celRTE_image_upload_handler token[', respJson.token, '] filename [',
          fileInfo.name, ']');
        const formData = new FormData();
        formData.append('uploadToken', respJson.token);
        formData.append('celTokenUploadCreateIfNotExists', true);
        formData.append('filename', fileInfo.name);
        formData.append('filepath', fileInfo.blob, fileInfo.name);
        xhr.send(formData);
      }).catch((err) => reject({ message: 'Failed to get upload token. ' + err, remove: true  }));
    });
  }
}

export class CelFileDropHandler {
  #uploadHandler;
  
  constructor(uploadUrl, fileBaseUrl) {
    this.#uploadHandler = new CelUploadHandler(uploadUrl, fileBaseUrl);
  }

  registerHandler(dropZoneElem) {
    this.dropZoneElem = dropZoneElem;
    this.dropZoneElem.classList.add('celDropZone');
    this.dropZoneElem.addEventListener('drop', (event) => this.dropHandler(event));
    this.dropZoneElem.addEventListener('dragover', (event) => this.dragOverHandler(event));
    this.dropZoneElem.addEventListener('dragenter', (event) => this.dragEnterHandler(event));
    this.dropZoneElem.addEventListener('dragend', (event) => this.dragEndHandler(event));
    this.dropZoneElem.addEventListener('dragleave', (event) => this.dragEndHandler(event));
  }

  dragEndHandler(ev) {
    if (ev.target.classList.contains('celDropZone')) {
      console.log('dragEnd target', ev.target, ' relatedTarget  ', ev.relatedTarget , ' closest ',
      ev.target.closest('.celDropZone'), ev);
      ev.target.classList.remove('celDropOverActive');
    }
  }

  dragEnterHandler(ev) {
    if (ev.target.classList.contains('celDropZone')) {
      console.log('dragEnter target', ev.target, ' relatedTarget  ', ev.relatedTarget , ' closest ',
      ev.target.closest('.celDropZone'), ev);
      ev.target.classList.add('celDropOverActive');
    }
  }

  dragOverHandler(ev) {
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
          this.#uploadHandler.upload({
              'name' : file.name,
              'blob' : file
            }, (standPercent) => console.log('upload1 progress ', standPercent)
          ).then(() => this.updateAttachmentList());
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...ev.dataTransfer.files].forEach((file, i) => {
        console.log(`… file[${i}].name = ${file.name}`);
          return this.#uploadHandler.upload({
            'name' : file.name,
            'blob' : file
          }, (standPercent) => console.log('upload2 progress ', standPercent));
      });
    }
  }
  
}
