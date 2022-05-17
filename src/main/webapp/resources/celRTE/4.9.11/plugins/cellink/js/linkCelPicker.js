var fileBaseLink = tinyMCE.activeEditor.getParam("wiki_filebase_link");
var linkPickerSpace = tinyMCE.activeEditor.getParam("wiki_linkpicker_space");
var filePickerDoc = tinyMCE.activeEditor.getParam("wiki_filepicker_doc");
var wikiLinkpickerBaseurl = tinyMCE.activeEditor.getParam("wiki_linkpicker_baseurl");
    var isFile = false;
    
    //------------------
    // threadsafe asynchronous XMLHTTPRequest code
    function executeCommand(url, callback) {
        // we use a javascript feature here called "inner functions"
        // using these means the local variables retain their values after the outer function
        // has returned. this is useful for thread safety, so
        // reassigning the onreadystatechange function doesn't stomp over earlier requests.
        function ajaxBindCallback() {
            if (ajaxRequest.readyState == 4) {
                if (ajaxRequest.status == 200) {
                    if (ajaxCallback) {
                        ajaxCallback(ajaxRequest.responseText);
                    } else {
                        alert('no callback defined');
                    }
                } else {
                    alert("There was a problem retrieving the xml data:\n" + ajaxRequest.status
                        + ":\t" + ajaxRequest.statusText + "\n" + ajaxRequest.responseText);
                }
            }
        }

        // addMessage(url);
        // use a local variable to hold our request and callback until the inner function is called...
        var ajaxRequest = null;
        var ajaxCallback = callback;

        // bind our callback then hit the server...
        if (window.XMLHttpRequest) {
            // moz et al
            ajaxRequest = new XMLHttpRequest();
            ajaxRequest.onreadystatechange = ajaxBindCallback;
            ajaxRequest.open("GET", url, true);
            ajaxRequest.send(null);
        } else if (window.ActiveXObject) {
            // ie
            ajaxRequest = new ActiveXObject("Microsoft.XMLHTTP");
            if (ajaxRequest) {
                ajaxRequest.onreadystatechange = ajaxBindCallback;
                ajaxRequest.open("GET", url, true);
                ajaxRequest.send();
            }
            else{
                alert("your browser does not support xmlhttprequest" )
            }
        }
        else{
            alert("your browser does not support xmlhttprequest" )
        }
    }

    function loadLinkPicker(linkPickerSpace) {
      var url = wikiLinkpickerBaseurl;
      if (!url) {
        url = '/' + linkPickerSpace + '/' + filePickerDoc
      }
      url += "?xpage=celements_ajax&ajax_mode=LinkPicker&picker=1&fieldname=href&space="
      + linkPickerSpace;
      executeCommand(url, loadLinkPickerCallback);
    }

    function loadFilePicker(fileBaseLink){ //filePickerSpace, filePickerDoc) {
        var url = fileBaseLink;
        
        var iframe = document.createElement("iframe");
        iframe.setAttribute("src", url);
        iframe.setAttribute("style", "width: 97%; height: 97%");
        iframe.setAttribute("width", "97%");
        iframe.setAttribute("height", "97%");
        iframe.setAttribute("id", "inline_filebase");
        var attachEl = document.getElementById("cel_filepicker");
        attachEl.innerHTML = "";
        attachEl.appendChild(iframe);
        //executeCommand(url, loadLinkPickerCallback);
    }

    function loadLinkPickerCallback(e) {
      var attachEl = document.getElementById("cel_linkpicker");
      attachEl.innerHTML = e;
    }
