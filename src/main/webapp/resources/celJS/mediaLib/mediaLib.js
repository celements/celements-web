var mediaLibraries = new Hash();

/**
 *
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.widget=="undefined"){CELEMENTS.widget={};};
CELEMENTS.widget.MediaLibTable = function(id) {
    this.id = id; 
    this.requestData();

    var mltableId = this.id; //TODO direct access to id out of DomReady???
    YAHOO.util.Event.onDOMReady(function() {
      fbp = new YAHOO.widget.Panel(mltableId + "_fileBasePanel", {
        width: "auto",
        draggable:false,
        monitorresize:false,
        close:false
      });
      fbp.render();
      fbp.show();
    });
}

CELEMENTS.widget.MediaLibTable.prototype.getId = function() { return this.id; };

var linkFormatter = function(elCell, oRecord, oColumn, sData) {
  var name = '<a ';
  name += 'id="' + oRecord.getData('id') + '" ';
  name += 'href="' + oRecord.getData('url') + '" target="_blank"';
  var linkName = oRecord.getData('prettyname');
  /*if(linkName.length > 25){
    name += 'title="' + linkName + '" ';
    linkName = linkName.substr(0, 25) + '&#126;';
  }*/
  name += ">" + linkName + "</a>";
  elCell.innerHTML = name;
}

//display the date as DD.MM.YYYY HH.MM.SS
var dateFormatter = function(elCell, oRecord, oColumn, oData) {
  var oDate = new Date(parseInt(oData));
  var fullMonth = oDate.getMonth() + 1;
  var dateString = (oDate.getDate()<10?"0":"") + oDate.getDate() + ".";
  dateString += (fullMonth<10?"0":"") + fullMonth + "."; 
  dateString += oDate.getFullYear();// + " ";
  /*dateString += (oDate.getHours()<10?"0":"") + oDate.getHours() + ":";
  dateString += (oDate.getMinutes()<10?"0":"") + oDate.getMinutes() + ".";
  dateString += (oDate.getSeconds()<10?"0":"") + oDate.getSeconds();*/
  elCell.innerHTML = dateString;
};

var stringFormatter = function(elCell, oRecord, oColumn, sData) {
  var title = "";
  var shortTitle = sData;
  /*if(sData.length > 25){
    title = 'title="' + sData + '" ';
    shortTitle = sData.substr(0, 25) + '&#126;';
  }*/
  elCell.innerHTML = "<span " + title + ">" + shortTitle + "</span>";
}

var blockFormatsFormatter = function(elCell, oRecord, oColumn, sData) {
  var shortTitle = oRecord.getData('prettyname');
  var htmlTag = sData;
  elCell.innerHTML = "<" + htmlTag + ">" + shortTitle + "</" + htmlTag +">";
}

var languageListFormatter = function(elCell, oRecord, oColumn, sData) {
  var langString = '';
  var langList = oRecord.getData('languages');
  var xredirect = "&xredirect=" + encodeURI(window.location.pathname);
  for(var i = 0; i < langList.length; i++) {
    var langUrl = oRecord.getData('url') + '?language=' + langList[i];
//    if(oRecord.getData('isEditable')) {
//      langUrl = '/edit' + langUrl;
//    }
    langUrl +=  xredirect;
    var langLink = "<a target='_blank' class='cel_lang_link' href='" + langUrl + "'>" + langList[i] + "</a> ";
    langString += langLink;
  }
  elCell.innerHTML = langString;
}

YAHOO.widget.DataTable.Formatter.link = linkFormatter;
YAHOO.widget.DataTable.Formatter.date = dateFormatter;
YAHOO.widget.DataTable.Formatter.string = stringFormatter;
YAHOO.widget.DataTable.Formatter.formatSet = blockFormatsFormatter;
YAHOO.widget.DataTable.Formatter.langs = languageListFormatter;

CELEMENTS.widget.MediaLibTable.prototype.handleDomReady = function(event){
  $(this.getId()).down('.yui-dt-data').addClassName("c3_import_scrollable");
  $(this.getId()).fire("filepicker:changed");
}

CELEMENTS.widget.MediaLibTable.prototype.requestData = function(){
  var loaderEle = new Element('div', { 'id' : this.getId() + '_ml_loader' });
  loaderEle.innerHTML = "<img src='" + window.CELEMENTS.getPathPrefix()
    + "/file/resources/celRes/ajax-loader.gif'>";
  $(this.getId()).setStyle( { display : 'none' } );
  $(this.getId()).parentNode.appendChild(loaderEle);
  
  var formCssClass = this.id + '_config';
  var reqParams = new Hash();
  reqParams.set('xpage', 'celements_ajax');
  reqParams.set('ajax_mode', 'MediaLibConfig');
  $$('form.' + formCssClass + ' .cel_ml_config_name').each(function(configInput) {
    reqParams.set('configname', configInput.value);
  });
  $$('form.' + formCssClass + ' .cel_ml_param').each(function(paramInput) {
    reqParams.set(paramInput.name, paramInput.value);
  });
  var mediaLib = this;
  new Ajax.Request("?", {
    method: 'post',
    parameters: reqParams,
    onSuccess:function(transport){
      jsonResult = transport.responseText.evalJSON();
      var mediaLibColumnDef = new Array();
      for(i = 0; i < jsonResult.ColumnCfg.size(); i++) {
        var prop = jsonResult.ColumnCfg[i];
        if (prop && prop.propname) {
          if (prop.propname == 'checkbox') {
            mediaLibColumnDef[i] = {key:prop.propname, label:prop.prettyname, formatter:prop.type, sortable:false, resizeable:false};
          } else {
            mediaLibColumnDef[i] = {key:prop.propname, label:prop.prettyname, formatter:prop.type, sortable:true, resizeable:false};
          }
        }
      }
      
      this.mediaLibDataSource = new YAHOO.util.DataSource(jsonResult);
      this.mediaLibDataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
      var fieldsArray = $H(jsonResult.DataSrc[0]).keys();
      for(i = 0; i < jsonResult.ColumnCfg.size(); i++) {
        fieldsArray.push(jsonResult.ColumnCfg[i].propname);
      }
      this.mediaLibDataSource.responseSchema = {
        resultsList: "DataSrc", 
        fields: fieldsArray
      };
      
      this.myDataTable = new YAHOO.widget.DataTable(mediaLib.id, mediaLibColumnDef, this.mediaLibDataSource);
      
      if(typeof(chkboxClickHandler) != 'undefined') {
        this.myDataTable.subscribe("checkboxClickEvent", chkboxClickHandler);
      }
      if(typeof(onSortEventHandler) != 'undefined') {
        this.myDataTable.subscribe("columnSortEvent", onSortEventHandler);
      }
      
      mediaLibraries.set(mediaLib.id, myDataTable);
      
      // Subscribe to events for row selection
      //this.myDataTable.subscribe("rowClickEvent", this.myDataTable.onEventSelectRow);
      
      // needed for correct positioning
      var cellspacing = document.createAttribute("cellspacing");
      cellspacing.nodeValue = "0";
      document.getElementsByTagName("table")[0].setAttributeNode(cellspacing);
      
      // add onContentReady async caller
      YAHOO.util.Event.onDOMReady(mediaLib.handleDomReady, mediaLib, true);
      
      $(mediaLib.id).setStyle( { display : '' } );
      $(mediaLib.id + '_ml_loader').parentNode.removeChild($(mediaLib.id + '_ml_loader'));
    }
  });
}