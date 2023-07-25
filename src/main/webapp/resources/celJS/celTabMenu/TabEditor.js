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

/*
*
*
**/
(function(window, undefined) {
  "use strict";

  if(typeof window.CELEMENTS=="undefined"){window.CELEMENTS={};};
  if(typeof window.CELEMENTS.widget=="undefined"){window.CELEMENTS.widget={};};

  window.CELEMENTS.widget.TabEditor = function() {
    // constructor
    this._init();
  };

var TE = window.CELEMENTS.widget.TabEditor;

TE.prototype = {
  tmd : undefined,
  tabMenuConfig : undefined,
  scriptLoading : undefined,
  CSSLoading : undefined,
  scriptQueue : undefined,
  CSSQueue : undefined,
  tabButtons : undefined,
  actionButtons : undefined,
  dirtyFlag : undefined,
  editorFormsInitialValues : undefined,
  modalDialog : undefined,
  initDone : undefined,
  _tabsInitalized : undefined,
  _isEditorDirtyOnLoad : undefined,
  afterInitListeners : undefined,
  _editorReadyDisplayNowBind : undefined,
  _tabReadyDisplayNowBind : undefined,
  _log : undefined,
  _tabLoaderElem : undefined,
  _loadingTabId : undefined,

  _init : function() {
    Object.assign(this, window.CELEMENTS.mixins.Observable);
    const _me = this;
    _me.tmd = null;
    _me.tabMenuConfig = null;
    _me.scriptLoading = false;
    _me.CSSLoading = false;
    _me.scriptQueue = new Array();
    _me.CSSQueue = new Array();
    _me.tabButtons = new Hash();
    _me.actionButtons = new Hash();
    _me.dirtyFlag = new Hash();
    _me.editorFormsInitialValues = new Map();
    _me.modalDialog = null;
    _me.initDone = false;
    _me._isEditorDirtyOnLoad = false;
    _me.afterInitListeners = new Array();
    _me._tabsInitalized = new Array();
    _me._log = new CELEMENTS.mobile.Dimensions();
    _me._loading = new CELEMENTS.LoadingIndicator();
    _me._editorReadyDisplayNowBind = _me._editorReadyDisplayNow.bind(_me);
    _me._tabReadyDisplayNowBind = _me._tabReadyDisplayNow.bind(_me);
  },

  isValidFormId : function(formId) {
    return (typeof formId == 'string') && (formId != '') && $(formId)
      && (typeof $(formId).action != 'undefined') && ($(formId).action != '');
  },

  addAfterInitListener : function(newListener) {
    if (!this.initDone) {
      this.afterInitListeners.push(newListener);
    } else {
      this._execOneListener(newListener);
    }
  },

  retrieveInitialValues : function(formId) {
    console.debug('retrieveInitialValues: ', formId);
    if (this.isValidFormId(formId)) {
      this.updateTinyMCETextAreas(formId);
      const formdata = new FormData(document.getElementById(formId));
      const newInitialValues = {};
      [...formdata.keys()].forEach(key => {
        newInitialValues[key] = new Set(formdata.getAll(key));
      });
      console.debug('retrieveInitialValues: before add newInitialValues',
        formId, newInitialValues);
      this.editorFormsInitialValues.set(formId, Object.freeze(
        newInitialValues));
    }
    console.debug('retrieveInitialValues: end');
  },

  _insertLoadingIndicator : function() {
    const _me = this;
    var loaderimg = _me._loading.getLoadingIndicator().setStyle({
      'display' : 'block',
      'marginLeft' : 'auto',
      'marginRight' : 'auto'
    });
    var tabMenuPanelWidth = $('tabMenuPanel').getWidth();
    var loadingElem = new Element('div', {
      'id' : 'celementsLoadingIndicator',
      'class' : 'celementsLoadingIndicator'
    }).update(loaderimg).setStyle({
      'width' : tabMenuPanelWidth + 'px'
    });
    var textLoading = new Element('p').update('loading ...');
    loadingElem.insert(textLoading);
    $$('.celements3_tabMenu')[0].insert({
      top : loadingElem
    });
    $('tabMenuPanel').hide();
    $$('html')[0].setStyle({
      'height' : '100%',
      'margin' : '0',
      'padding' : '0'
    });
    $$('body')[0].setStyle({
      'height' : '100%',
      'margin' : '0',
      'padding' : '0'
    });
  },

  initTabMenu : function() {
    const _me = this;
    if (!$('tabMenuPanel').down('.xwikimessage')) {
      _me._insertLoadingIndicator();
      new Ajax.Request(getTMCelHost(), {
        method: 'post',
        parameters: {
         xpage : 'celements_ajax',
         ajax_mode : 'CelTabMenu',
         tm_mode : "getTabMenuConfig"
        },
        onSuccess: function(transport) {
          if (transport.responseText.isJSON()) {
            console.log('initTabMenu: before tabMenuSetup ');
            _me.tabMenuSetup(transport.responseText.evalJSON());
          } else  {
            console.log('failed to get CelTabMenu config: no valid JSON!', transport);
          }
          $$('body')[0].observe('scroll', function(event) {
            event.target.scrollTop = 0; //FF and IE fix
          });
          Event.observe(window, 'scroll', function() {
            $j(window).scrollTop(0); //webkit
          });
        }
      });
    }
  },

  tabMenuSetup : function(tabMenuConf) {
    const _me = this;
    console.log('tabMenuSetup start');
    _me.tabMenuConfig = tabMenuConf;
    var starttabId = '';
    var celstartab = '';
    if ($('cel_startab')) {
      celstartab = $('cel_startab').innerHTML;
    }
    var tabClickHandler = function(event) {
      //direct access of element method fails in IE8!
      var elem = Event.element(event);
      var elemId = elem.id.substring(0, elem.id.length - 7);
      if (elemId && $(elemId + '-button')) {
        _me.getTab(elemId);
        event.stop();
        console.log('tabClickHandler finish.');
      }
    };
    // set html and body overflow to hidden
    $$('html')[0].setStyle({ 'overflow' : 'hidden' });
    $$('body')[0].setStyle({ 'overflow' : 'hidden' });
    // initialize button objects
    var i = 1;
    _me.tabMenuConfig.tabMenuPanelData.each(function(tabData) {
      tabData['container'] = 'buttonSpan' + i;
      var span = new Element('span', { 'class': 'yui-button yui-push-button tabButton', 'id': tabData['container'] });
      $('tabMenuPanel').down('.hd').appendChild(span);
      tabData['onclick'] = { fn: tabClickHandler };
      _me.tabButtons.set(tabData['id'], new YAHOO.widget.Button(tabData));
      i++;
      if (tabData['id'] == celstartab) {
        starttabId = celstartab;
      }
    });
    _me._isEditorDirtyOnLoad = ((_me.tabMenuConfig.isDirtyOnLoad !== undefined)
        && (_me.tabMenuConfig.isDirtyOnLoad == true));
    _me.tmd = new YAHOO.widget.Panel("tabMenuPanel", _me.tabMenuConfig.tabMenuPanelConfig);
    _me.tmd.render();
    console.log('tabMenuSetup after render');

    if (starttabId == '') {
      var starttablist = $$('.celements3_tabMenu .starttab');
      if (starttablist.length > 0) {
        starttabId = starttablist[0].id.substring(0, starttablist[0].id.length - 4);
        starttablist[0].select('form').each(function(formelem) {
          _me.retrieveInitialValues(formelem.id);
        });
      } else if(_me.tabMenuConfig.tabMenuPanelData.length > 0) {
        starttabId = _me.tabMenuConfig.tabMenuPanelData[0]['id'];
      }
    }
    console.log('editorReadyDisplayNow register');
    $('tabMenuPanel').stopObserving('tabedit:scriptsLoaded', _me._editorReadyDisplayNowBind);
    $('tabMenuPanel').observe('tabedit:scriptsLoaded', _me._editorReadyDisplayNowBind);
    if(starttabId != null) {
      console.log('tabMenuSetup before showTabMenu');
      _me.showTabMenu(starttabId);
    }
    console.log('tabMenuSetup after showTabMenu');

    if($$('.container-close').length > 0) {
      _me.initDefaultCloseButton();
      _me._addClearButtons();
    }
    console.log('tabMenuSetup before initCloseButton');
    if(_me.tabMenuConfig.initCloseButton) {
      _me.initCloseButton();
    }
    console.log('tabMenuSetup before initSaveButton');
    if(_me.tabMenuConfig.initSaveButton) {
      _me.initSaveButton();
    }
    console.log('tabMenuSetup before con_titblock');
    if (!$('con_titblock')) {
      var titlediv = new Element('div', { 'id': 'con_titblock', 'class': 'titleblock' });
      titlediv.update(_me.tabMenuConfig.tabMenuPanelConfig.title);
      $('tabMenuPanel').down('.bd').insert({ top: titlediv });
    }
    console.log('tabMenuSetup activating browse away check');
    window.onbeforeunload = _me.checkBeforeUnload.bind(_me);
    _me.initDone = true;
    console.log('tabMenuSetup before afterInitListeners');
    _me.afterInitListeners.each(_me._execOneListener);
    console.log('tabMenuSetup end');
  },

  _editorReadyDisplayNow : function() {
    const _me = this;
    console.log('editorReadyDisplayNow start');
    $('tabMenuPanel').stopObserving('tabedit:scriptsLoaded', _me._editorReadyDisplayNowBind);
    _me._displayNowEffect('tabMenuPanel','celementsLoadingIndicator');
    console.log('editorReadyDisplayNow finish');
  },
  
  _tabReadyDisplayNow : function() {
    const _me = this;
    console.log('_tabReadyDisplayNow start', _me._loadingTabId);
    $('tabMenuPanel').stopObserving('tabedit:scriptsLoaded', _me._tabReadyDisplayNowBind);
    _me._displayNowEffect(_me._getTabBodyId(_me._loadingTabId), _me._getTabLoaderElement());
    console.log('_tabReadyDisplayNow finish');
  },

  _displayNowEffect : function(appearElem, fadeElem) {
    const _me = this;
    var tabBodyId = _me._getTabBodyId(_me._loadingTabId);
    console.log('_displayNowEffect start ', _me._loadingTabId);
    var displayNowEffect = new Effect.Parallel([
      new Effect.Appear(appearElem, {
        afterFinish: function() {
          //afterFinish for parallel effect is not working! Instead placed on first effect is working.
          console.log("afterFinish: in appear start");
          if (_me._loadingTabId) {
            console.log("afterFinish: in appear before _fireTabChange");
            _me._fireTabChange(_me._loadingTabId);
          }
          console.log("afterFinish: in appear fire 'tabedit:afterDisplayNow'");
          $('tabMenuPanel').fire('tabedit:afterDisplayNow');
        },
        sync: true
      }),
      new Effect.Fade(fadeElem, { sync: true })
    ], {
       duration: 0.5,
       sync: true
    });
    console.log('_displayNowEffect: fire tabedit:finishedLoadingDisplayNow');
    const beforeDisplayEvent = this.celFire('tabedit:beforeDisplaying', {
      'beforePromises' : [],
      'tabBodyId' : tabBodyId
    });
    Promise.all(beforeDisplayEvent.memo.beforePromises).then(() => {
      const defaultShowEvent = $('tabMenuPanel').fire('tabedit:finishedLoadingDisplayNow', {
        'effect' : displayNowEffect,
        'tabBodyId' : tabBodyId
      });
      if (!defaultShowEvent.stopped) {
        console.debug('displayNow event not stopped -> displaying instantly');
        displayNowEffect.start();
      } else {
        console.warn('displayNow stopped. This usage is deprecated. Instead use beforeDisplaying '
        + 'and promises');
      }
      console.debug('beforeDisplaying finish');
    }).catch((err) => {
      console.error('preparing tab failed. Displaying will not happen.', err);
      //TODO show error message to user instead.
    });
    console.debug('_displayNowEffect finish');
  },

  _execOneListener : function(listener) {
    try {
      listener();
    } catch (exept) {
      console.log('listener failed: ', listener);
    }
  },

  checkBeforeUnload : function() {
  const _me = this;
    if (_me.isDirty() && !_me.tabMenuConfig.supressBeforeUnload) {
      if (_me.tabMenuConfig && _me.tabMenuConfig.unsavedChangesOnCloseMessage && (_me.tabMenuConfig.unsavedChangesOnCloseMessage != '')) {
        return _me.tabMenuConfig.unsavedChangesOnCloseMessage;
      }
      return "WARNING: You have currently unsafed changes. Those changes will be lost if you click OK.";
    }
  },

  getTMCelDomain : function() {
    var celHost = document.location;
    celHost = celHost.protocol + '//' + celHost.host;
    return celHost;
  },

  initDefaultCloseButton : function() {
    const _me = this;
    /* close button functions */
    $$('.container-close')[0].innerHTML = _me.tabMenuConfig.tabEditorSaveAndClose;
    $$('.container-close')[0].onclick = function() {
      _me.saveAndClose();
    };
    $$('.container-close')[0].onmouseover = function() {
      // flag as active
      this.className = this.className+' focus';
    };
    $$('.container-close')[0].onmouseout = function() {
      // flag as inactive
      this.className = this.className.replace(' focus','');
    };
  },

  addActionButton : function(buttonLabel, clickHandler) {
    const _me = this;
    var tabData = [];
    tabData['label'] = buttonLabel;
    tabData['container'] = 'ActionButtonSpan' + _me.actionButtons.size();
    var span = new Element('span', {
      'class': 'yui-button yui-push-button actionButton',
      'id': tabData['container']
    });
    _me._addClearButtons();
    $('tabMenuPanel').down('.hd').down('div.clearbuttons').insert({ "before" : span });
    tabData['onclick'] = { fn: clickHandler };
    _me.actionButtons.set(tabData['id'], new YAHOO.widget.Button(tabData));
  },

  _addClearButtons : function() {
    if (!$('tabMenuPanel').down('.hd').down('div.clearbuttons')) {
      var clearbuttons = new Element('div', {
        'class': 'clearbuttons'
      });
      $('tabMenuPanel').down('.hd').appendChild(clearbuttons);
    }
  },

  _deleteParamsFromURL : function() {
    var newUrlParams = [];
    var standardWhiteList = ["language", "xredirect", "xcontinue"];
    var additionalWhiteList = [];
    $j("input[name=white_list_url]").each(function( index, inputElem ) {
      additionalWhiteList.add(inputElem.value);
    });
    standardWhiteList = standardWhiteList.concat(additionalWhiteList);
    for (var index = 0; index < standardWhiteList.length; index++) {
      var regEx = new RegExp("^.*(" + standardWhiteList[index] + "=[^&]*).*$", "g");
      var regExArray = regEx.exec(window.location.search);
      if (regExArray != null) {
        newUrlParams = newUrlParams.concat(regExArray.slice(1));
      }
    }
    return newUrlParams.join('&');
  },

  initSaveButton : function() {
    const _me = this;
    var saveClickHandler = function() {
      _me.saveAndContinue(function(transport, jsonResponses, failed) {
        if (!failed) {
          //remove template in url query after creating document in inline mode
          try {
            if (window.location.search.match(/\&?template=[^\&]+/)) {
              window.onbeforeunload = null;
              window.location.search = _me._deleteParamsFromURL();
            }
          } catch (err) {
            console.error('initSaveButton: error in saveAndContinue callback ', err);
          }
          $('tabMenuPanel').fire('tabedit:saveAndContinueButtonSuccessful', jsonResponses);
        } else {
          $('tabMenuPanel').fire('tabedit:saveAndContinueButtonFailed', jsonResponses);
        }
      });
    };
    var buttonLabel = _me.tabMenuConfig.saveButtonLabel || 'Save';
    _me.addActionButton(buttonLabel, saveClickHandler);
  },

  initCloseButton : function() {
    const _me = this;
    var closeClickHandler = function() {
      _me.checkUnsavedChanges(function(transport, jsonResponses, failed) {
        try {
          if (failed) {
            _me.celFire('tabedit:failingSaved', { 'jsonResponses' : jsonResponses });
          } else {
            _me.celFire('tabedit:successfulSaved', { 'jsonResponses' : jsonResponses });
          }
        } catch (exp) {
          console.error('Saved-listener failed.', exp);
        }
        if (!failed) {
          window.onbeforeunload = null;
          window.location.href = _me._getCancelURL();
        } else {
          console.error('closeClickHandler: checkUnsavedChanges failed! ', failed);
        }
      });
    };
    var buttonLabel = _me.tabMenuConfig.closeButtonLabel || 'Close';
    _me.addActionButton(buttonLabel, closeClickHandler);
  },

  _getCancelURL : function() {
    const _me = this;
    var redirectValue = '';
    if ($$('input.celEditorRedirect').length > 0) {
      redirectValue = $F($$('input.celEditorRedirect')[0]);
    } else {
      var firstFormName = _me.getFirstFormWithId() || 0;
      var firstForm = document.forms[firstFormName];
      if (firstForm && firstForm['xredirect']) {
        if (firstForm['xredirect'][0]) {
          redirectValue = $F(firstForm['xredirect'][0]);
        } else {
          redirectValue = $F(firstForm['xredirect']);
        }
      }
    }
    var redirectBaseValue = window.location.pathname.replace(/\/edit\/|\/inline\//,
        '/cancel/');
    redirectValue = redirectBaseValue + '?xredirect=' + redirectValue;
    console.log('_getCancelURL: return redirectValue ', redirectValue);
    return redirectValue;
  },

  showTabMenu : function(tabId) {
    const _me = this;
    $('cel_overlay').setStyle({'display' : "block"});
    _me.getTab(tabId);
    var tabBodyId = _me._getTabBodyId(tabId);
    $(tabBodyId).fire('tabedit:before-tabshow', {
      'newTabId' : tabBodyId
    });
    _me.tmd.show();
    $(tabBodyId).fire('tabedit:after-tabshow', {
      'newTabId' : tabBodyId
    });
    console.log('showTabMenu done.');
  },

  _getTabLoaderElement : function() {
    const _me = this;
    console.log('_getTabLoaderElement: start');
    if (!_me._tabLoaderElem) {
      console.log('_getTabLoaderElement: create tabLoader');
      var loaderimg = _me._loading.getLoadingIndicator().setStyle({
        'display' : 'block',
        'marginLeft' : 'auto',
        'marginRight' : 'auto'
      });
      var loaderDiv = new Element('div').update(loaderimg).setStyle({
        'width' : _me.tabMenuConfig.tabMenuPanelConfig.width,
        'min-height' : '50px',
        'padding-top' : '100px',
        'padding-bottom' : '100px'
      });
      var textLoading = new Element('p').update('loading ...');
      loaderDiv.insert(textLoading);
      //.menuTab needed for resize!
      _me._tabLoaderElem = new Element('div', {
        'class': 'menuTab celementsLoadingIndicator',
        'id': 'tabLoaderContainer'
      }).update(loaderDiv);
      $('tabMenuPanel').down('.bd').appendChild(_me._tabLoaderElem);
    }
    console.log('_getTabLoaderElement: end ', _me._tabLoaderElem);
    return _me._tabLoaderElem;
  },

  _getOrCreateTabBody : function(tabBodyId) {
    const _me = this;
    console.log('_getOrCreateTabBody: start ', tabBodyId);
    var tabBodyElem = $(tabBodyId);
    if (!tabBodyElem) {
      console.log('_getOrCreateTabBody: creating ', tabBodyId);
      tabBodyElem = new Element('div', {
        'class': 'menuTab ' + tabBodyId,
        'id': tabBodyId
      }).setStyle({
        'width' : _me.tabMenuConfig.tabMenuPanelConfig.width
      });
      $('tabMenuPanel').down('.bd').appendChild(tabBodyElem);
    }
    return tabBodyElem;
  },

  getTab : function(tabId, reload) {
    const _me = this;
    $$('.menuTab').each(function(tab) { tab.hide(); });
    // create tab if it does not exist
    var tabBodyId = _me._getTabBodyId(tabId);
    var tabBodyElem = $(tabBodyId);
    var width = _me.tabMenuConfig.tabMenuPanelConfig.width;
    var scriptLoadedHandler = function() {
      console.log('scriptLoadedHandler: start');
      $('tabMenuPanel').stopObserving('tabedit:scriptsLoaded', scriptLoadedHandler);
      console.log('TabEditor: async loading tab firing celements:contentChanged');
      $(tabBodyId).fire('celements:contentChanged', {
        'htmlElem' : $(tabBodyId)
      });
      $(tabBodyId).fire('tabedit:tabLoadingFinished', {
        'newTabBodyId' : tabBodyId,
        'newTabButtonId' : tabId
      });
      console.log('getTab.scriptLoadedHandler: after async tab load before tabedit:tabchange event',
          tabId);
      console.log('scriptLoadedHandler: finish');
    };
    $('tabMenuPanel').observe('tabedit:scriptsLoaded', scriptLoadedHandler);
    console.log('getTab: ', tabBodyId, tabBodyElem, reload);
    _me._hideTabShowLoadingIndicator(tabId);
    if (!tabBodyElem || ((reload !== 'undefined') && reload)) {
      _me._loadTabAsync(tabId);
    } else if (_me._tabsInitalized.indexOf(tabBodyId) <= -1 ) {
      console.log('getTab: static loaded ; start initialize ', tabBodyId, $(tabBodyId));
      _me._initializeLoadedTab(tabBodyId);
      console.log('getTab: finish static loaded', tabId);
    } else {
      $('tabMenuPanel').stopObserving('tabedit:scriptsLoaded', scriptLoadedHandler);
      _me._getTabLoaderElement().hide();
      $(tabBodyId).show();
      _me._fireTabChange(tabId);
    }
    //fix celements3_tabMenu width
    $(tabBodyId).up('.celements3_tabMenu').setStyle({
      'width' : width
    });
    _me.setButtonActive(tabId);
    console.log('getTab finish');
  },

  _getTabBodyId : function(tabId) {
    return tabId + '-tab';
  },

  _fireTabChange : function(tabId) {
    const _me = this;
    var tabBodyId = _me._getTabBodyId(tabId);
    console.log('_fireTabChange: fire tabedit:tabchange event for', tabId, tabBodyId);
    $(tabBodyId).fire('tabedit:tabchange', {
      'newTabId' : tabBodyId,
      'newTabBodyId' : tabBodyId,
      'newTabButtonId' : tabId
    });
  },

  _hideTabShowLoadingIndicator : function(tabId) {
    const _me = this;
    console.log('_hideTabShowLoadingIndicator: start ', tabId);
    _me._getTabLoaderElement().show();
    var tabBodyId = _me._getTabBodyId(tabId);
    var tabBodyElem = _me._getOrCreateTabBody(tabBodyId);
    tabBodyElem.hide();
    _me._loadingTabId = tabId;
    $('tabMenuPanel').stopObserving('tabedit:scriptsLoaded', _me._tabReadyDisplayNowBind);
    $('tabMenuPanel').observe('tabedit:scriptsLoaded', _me._tabReadyDisplayNowBind);
    console.log('_hideTabShowLoadingIndicator: finish ', tabId);
  },

  _initializeLoadedTab : function(tabBodyId) {
    const _me = this;
    console.log('_initializeLoadedTab: before LazyLoadJS ', tabBodyId);
    var tabBodyElem = _me._getOrCreateTabBody(tabBodyId);
    _me.lazyLoadJS(tabBodyElem);
    _me.lazyLoadCSS(tabBodyElem);
    $(tabBodyId).select('form').each(function(formelem) {
      console.log('_initializeLoadedTab: before retrieveInitialValues ', tabBodyId, formelem);
      if (formelem && formelem.id) {
        _me.retrieveInitialValues(formelem.id);
      }
    });
    _me._tabsInitalized.push(tabBodyId);
    console.log('_initializeLoadedTab: finish ', tabBodyId);
  },

  _loadTabAsync : function(tabId) {
    const _me = this;
    console.log('_loadTabAsync: start loading async ', tabId);
    var lang = '';
    if($$('.celTabLanguage') && $$('.celTabLanguage').length > 0) {
      lang = $$('.celTabLanguage')[0].value;
    }
    console.log('_loadTabAsync: celTabLanguage? ', lang);
    var loadTabParams = {
        xpage : 'celements_ajax',
        ajax_mode : 'CelTabContent',
        id : tabId,
        language : lang
     };
    if (window.location.search.match(/\&?template=[^\&]+/)) {
      loadTabParams["template"] = window.location.search.replace(
          /.*\&?template=([^\&]+).*/, '$1');
    }
    console.log('_loadTabAsync: template in URL? ', loadTabParams["template"]);
    if (window.location.search.match(/\&?language=[^\&]+/)) {
      loadTabParams["language"] = window.location.search.replace(
          /.*\&?language=([^\&]+).*/, '$1');
    }
    console.log('_loadTabAsync: overwrite language from URL ? ', loadTabParams["language"]);
    $A(decodeURI(window.location.search).match(/(\&|\?)data-[^=\&]+=[^\&]+/g)).each(function(elem) {
      var elemArray = elem.split('=');
      var key = elemArray[0].substr(1);
      var value = elemArray[1];
      loadTabParams[key] = value;
    });
    console.log('_loadTabAsync: start Ajax call to load content ', loadTabParams);
    new Ajax.Request(getTMCelHost(), {
       method: 'post',
       parameters: loadTabParams,
       onSuccess: function(transport) {
         console.log('_loadTabAsync.Ajax: onSuccess', tabId);
         var tabBodyId = _me._getTabBodyId(tabId);
         console.log('_loadTabAsync.Ajax: before update', tabId);
         _me._getOrCreateTabBody(tabBodyId).update(transport.responseText);
         console.log('_loadTabAsync.Ajax: before _initializeLoadedTab', tabId);
         _me._initializeLoadedTab(tabBodyId);
         console.log('_loadTabAsync.Ajax: finish', tabId);
       }
    });
    console.log('_loadTabAsync: finish', tabId);
  },

  lazyLoadJS : function(parentEle, syncLoadOnly) {
  const _me = this;
  syncLoadOnly = syncLoadOnly || false;
  var scripts = [];
  var scriptElems = parentEle.select('span.cel_lazyloadJS, span.cel_lazyloadJS_exec');
  console.log('lazyLoadJS: start ', parentEle, syncLoadOnly, scriptElems);
  scriptElems.each(function(scriptEle) {
    if (scriptEle.hasClassName('cel_lazyloadJS')) {
      var scriptPath = scriptEle.innerHTML;
      var scriptPathObj = "";
      var scriptURL = "";
      var loadScript = !syncLoadOnly;
      console.log('lazyLoadJS: scriptPath isJSON ', scriptPath, scriptPath.isJSON());
      if (scriptPath.isJSON()) {
        scriptPathObj = scriptPath.evalJSON();
        scriptPath = scriptPathObj.url;
        scriptURL = scriptPathObj.fullURL;
        loadScript = !syncLoadOnly || (scriptPathObj.initLoad);
      }
      console.log('lazyLoadJS: scriptPath after isJSON ', scriptPath, scriptURL);
      if ((typeof scriptPath !== 'undefined') && (scriptPath != '')) {
        if (scriptPath.indexOf('?') > 0) {
          scriptPath += '&';
        } else {
          scriptPath += '?';
        }
        scriptPath += "version=" + _me.tabMenuConfig.startupTimeStamp;
        if ((typeof scriptPathObj === 'object') && (scriptPathObj.action == 'file')) {
          scriptPath = _me.tabMenuConfig.jsPathFileActionPrefix + scriptPath;
        } else {
          scriptPath = _me.tabMenuConfig.jsPathPrefix + scriptPath;
        }
        scriptURL = scriptPath;
      }
      console.log('lazyLoadJS: before check load script ', loadScript, scriptURL);
      if (loadScript && scriptURL && (scriptURL !== '')
          && !_me.scriptIsLoaded(scriptURL)) {
        console.log('lazyLoadJS: add ', scriptURL);
        scripts.push( { isUrl: true, value: scriptURL } );
//          var newEle = new Element('script', { type: 'text/javascript', src: scriptURL });
//          $$('head')[0].insert(newEle);
      }
    } else if (scriptEle.hasClassName('cel_lazyloadJS_exec')) {
      console.log('lazyLoadJS: elsif is URL false add ', scriptEle.innerHTML);
      scripts.push( { isUrl: false, value: scriptEle.innerHTML } );
//      eval(scriptEle.innerHTML);
    }
  });
  if(scripts.length > 0) {
    console.log('lazyLoadJS scripts ', scripts);
    _me.loadScripts(scripts);
  } else {
    console.log('TabEditor: lazyLoadJS NO scripts to add -> firing tabedit:scriptsLoaded');
    $('tabMenuPanel').fire('tabedit:scriptsLoaded');
  }
  console.log('lazyLoadJS: end');
 },

 lazyLoadCSS : function(parentEle) {
  const _me = this;
  const scripts = [];
  parentEle.select('span.cel_lazyloadCSS').each(function(scriptEle) {
    var scriptPath = scriptEle.innerHTML;
    var scriptPathObj = "";
    if (scriptPath.isJSON()) {
      scriptPathObj = scriptPath.evalJSON();
      scriptPath = scriptPathObj.url;
    }
    if(scriptPath != '') {
      if (scriptPath.indexOf('?') > 0) {
        scriptPath += '&';
      } else {
        scriptPath += '?';
      }
      scriptPath += "version=" + _me.tabMenuConfig.startupTimeStamp;
      if ((typeof scriptPathObj === 'object') && (scriptPathObj.action == 'file')) {
        scriptPath = _me.tabMenuConfig.jsPathFileActionPrefix + scriptPath;
      } else {
        scriptPath = _me.tabMenuConfig.jsPathPrefix + scriptPath;
      }
      if(!_me.cssIsLoaded(scriptPath)) {
        scripts.push( { isUrl: true, value: scriptPath } );
      }
    }
  });
  if(scripts.length > 0) { _me.loadCSSScripts(scripts); }
 },

 loadCSSScripts : function(scripts) {
  const _me = this;
  var CSSLoaded = function() {
    _me.CSSLoading = false;
    _me.loadCSSScripts();
  };
  if(!_me.CSSLoading && (_me.CSSQueue.length > 0)) {
    var loadScript = _me.CSSQueue.first();
    _me.CSSQueue = _me.CSSQueue.slice(1); // remove first element
    if(loadScript.isUrl) {
      var newEle = new Element('link', {
          'rel': 'stylesheet',
          'href': loadScript.value,
          'type': 'text/css',
          'media': 'screen'
      });
    if(Prototype.Browser.IE) {
        newEle.onreadystatechange = function () {
          if (this.readyState === 'loaded' || this.readyState === 'complete') {
            CSSLoaded();
          }
        };
      } else if (Prototype.Browser.Gecko || Prototype.Browser.WebKit) {
        newEle.onload  = CSSLoaded;
        newEle.onerror = CSSLoaded;
      }
      _me.CSSLoading = true;
      $$('head')[0].insert(newEle);
    } else {
      eval(loadScript.value);
      _me.loadScripts();
    }
  } else if((scripts != undefined) && (scripts.length > 0)) {
    $A(scripts).each( function(ele) {
      _me.CSSQueue.push(ele);
    });
    _me.loadCSSScripts();
  }
 },

 loadScripts : function(scripts) {
  const _me = this;
  var scriptLoaded = function() {
    _me.scriptLoading = false;
    _me.loadScripts();
  };
  if(!_me.scriptLoading && (_me.scriptQueue.length > 0)) {
    var loadScript = _me.scriptQueue.first();
    _me.scriptQueue = _me.scriptQueue.slice(1); // remove first element
    if(loadScript.isUrl) {
      var newEle = new Element('script', { type: 'text/javascript', src: loadScript.value });
      if(Prototype.Browser.IE) {
        newEle.onreadystatechange = function () {
          if (this.readyState === 'loaded' || this.readyState === 'complete') {
            scriptLoaded();
          }
        };
      } else if (Prototype.Browser.Gecko || Prototype.Browser.WebKit) {
        newEle.onload  = scriptLoaded;
        newEle.onerror = scriptLoaded;
      }
      _me.scriptLoading = true;
      console.log('loadScripts insert ', newEle);
      $$('head')[0].insert(newEle);
    } else {
      eval(loadScript.value);
      _me.loadScripts();
    }
  } else if((scripts != undefined) && (scripts.length > 0)) {
    $A(scripts).each( function(ele) {
      _me.scriptQueue.push(ele);
    });
    _me.loadScripts();
  }
  _me._loadScriptsCheckFinished();
 },

 _loadScriptsCheckFinished : function() {
   const _me = this;
   if (!_me.scriptLoading && _me.scriptQueue.length <= 0) {
     console.log('TabEditor: _loadScriptsCheckFinished firing tabedit:scriptsLoaded');
     $('tabMenuPanel').fire('tabedit:scriptsLoaded');
   }
   console.log('_loadScriptsCheckFinished: finish');
 },

 scriptIsLoaded : function(scriptURL) {
  const _me = this;
  var isLoaded = false;
  $$('script').each(function(loadedScript) {
    //as long as new URL() is not available in IE use a-Element
    var scriptNewURLLink = new Element('a', { 'href' : scriptURL});
    console.log('scriptIsLoaded: ', loadedScript.src, scriptNewURLLink);
    if(loadedScript.src === scriptNewURLLink.href) {
      isLoaded = true;
    }
  });
  console.log('scriptIsLoaded: return ', isLoaded, scriptURL);
  return isLoaded;
},

 cssIsLoaded : function(script) {
  const _me = this;
  var isLoaded = false;
  $$('link[rel="stylesheet"]').each(function(loadedScript) {
    if(loadedScript.href === _me.getTMCelDomain() + script) {
      isLoaded = true;
    }
  });
  return isLoaded;
 },

 setButtonActive : function(id) {
  const _me = this;
  // set all buttons: inactive
  $$('.tabButton .cel-button-active').each(function(button) {
    button.removeClassName('cel-button-active');
  });
  // set current button: active
  if($(id)) {
    $(id).addClassName('cel-button-active');
  } else {
    YAHOO.util.Event.onContentReady(id, function() { _me.setButtonActive(id); });
  }
  // if current button = content, make titleblock active
  var tabbuttons = $$('.tabButton span');
  if ((tabbuttons.size() > 0) && (tabbuttons[0].id == id)) {
    _me.setFocus('con_titblock');
  } else {
    _me.removeFocus('con_titblock');
  }
 },

 setFocus : function(elid) {
  if($(elid)) {
    $(elid).addClassName('focus');
  }
 },

 removeFocus : function(elid) {
  if($(elid)) {
    $(elid).removeClassName('focus');
  }
 },

 saveAndClose : function(formName) {
  const _me = this;
  if(!formName) {
    formName = _me.getFirstFormWithId();
  }
  var oldSaveFormName = formName;
  if(document.forms[oldSaveFormName]) {
    if(typeof(doBeforeEditSubmit) != 'undefined') {
      doBeforeEditSubmit();
    }
    _me.saveAllFormsAjax(function(transport) {
      window.onbeforeunload = null;
      document.forms[oldSaveFormName].submit();
    }, oldSaveFormName);
  } else {
    alert("Error: No 'edit' form!");
  }
 },

 getFirstFormWithId : function() {
   var formName = '';
   if(document.forms['edit']) {
     formName = 'edit';
   } else {
     $A(document.forms).each(function(form) {
       if (form.id != '') {
         formName = form.id;
         throw $break;
       }
     });
   }
   return formName;
 },

 saveAndContinue : function(execCallback) {
  const _me = this;
  //TODO add possibility to add JS-listener which can do additional 'isDirty' checks
  if (_me.isDirty()) {
    if(typeof(doBeforeEditSubmit) != 'undefined') {
      doBeforeEditSubmit();
    }
    const savingDialog = _me._getModalDialog();
    savingDialog.setHeader(_me.tabMenuConfig.savingDialogHeader);
    savingDialog.setBody(_me._loading.getLoadingIndicator(true));
    savingDialog.cfg.queueProperty("buttons", null);
    savingDialog.render();
    savingDialog.show();
    //TODO add possibility to add JS-listener which can execute alternative save actions
    _me.saveAllFormsAjax(function(transport, jsonResponses) {
      savingDialog.hide();
      const failed = _me.showErrorMessages(jsonResponses);
      try {
        if (failed) {
          _me.celFire('tabedit:failingSaved', { 'jsonResponses' : jsonResponses });
          $('tabMenuPanel').fire('tabedit:failingSaved', jsonResponses);
        } else {
          _me.celFire('tabedit:successfulSaved', { 'jsonResponses' : jsonResponses });
          $('tabMenuPanel').fire('tabedit:successfulSaved', jsonResponses);
        }
      } catch (exp) {
        console.error('Saved-listener failed.', exp);
      }
      execCallback && execCallback(transport, jsonResponses, failed);
    });
  }
 },

 /**
  * showErrorMessages display errors in jsonResponses to the user
  *
  * @param jsonResponses
  * @returns true if errors have been displayed
  *          false if no errors have been displayed
  */
 showErrorMessages : function(jsonResponses) {
   const errorMessages = jsonResponses.values()
     .filter(response => response && !response.successful)
     .flatMap(response => response.errorMessages || []);
   if (errorMessages.length > 0) {
     const errorMesgDialog = this._getModalDialog();
     errorMesgDialog.setHeader('Saving failed!');
     errorMesgDialog.setBody("saving failed for the following reasons:<ul><li>"
         + errorMessages.join('</li><li>').replace(new RegExp('<li>$'),'') + "</ul>");
     errorMesgDialog.cfg.setProperty("icon", YAHOO.widget.SimpleDialog.ICON_WARN);
     errorMesgDialog.cfg.queueProperty("buttons",
       [ { text: "OK", handler:function() {
              this.cancel();
            } }
       ]);
     errorMesgDialog.render();
     errorMesgDialog.show();
     return true;
   }
   return false;
 },

 saveAndContinueAjax : function(formName, handler) {
  if(!formName) { formName = 'edit'; }
  if(document.forms[formName]) {
    if(typeof(doBeforeEditSubmit) != 'undefined') {
      doBeforeEditSubmit();
    }
    document.forms[formName].select('textarea.mceEditor').each(function(formfield) {
      formfield.value = tinymce.get(formfield.id).save();
    });
    $(formName).request(handler);
  } else {
    alert("Error: No edit form!");
  }
 },

 showProgressDialog : function(headerTxt) {
   var savingDialog = this._getModalDialog();
   savingDialog.setHeader(headerTxt);
   savingDialog.setBody(_me._loading.getLoadingIndicator(true));
   savingDialog.cfg.queueProperty("buttons", null);
   savingDialog.render();
   savingDialog.show();
   return savingDialog;
 },

 closeProgressDialog : function(headerTxt) {
   var savingDialog = this._getModalDialog();
   savingDialog.hide();
 },

 isDirty : function() {
   const _me = this;
   const isDirty = (_me.getDirtyFormIds().length > 0) || _me._isEditorDirtyOnLoad;
   console.debug('isDirty: ', isDirty, ' , isEditorDirtyOnLoad: ', _me._isEditorDirtyOnLoad);
   return isDirty;
 },

 updateOneTinyMCETextArea : function(ed) {
   const formfield = document.getElementById(ed.id);
   console.debug('updateOneTinyMCETextArea: updating field value', formfield.id);
   try {
     if (typeof ed.serializer !== 'undefined') {
       formfield.value = ed.getContent();
       console.log('updateOneTinyMCETextArea: for field ', formfield.id, formfield.value);
     } else {
       console.warn('updateOneTinyMCETextArea: no serializer -> skip', ed.id);
     }
   } catch (exp) {
     console.error('updateOneTinyMCETextArea: failed with exception', formfield.id,
         ed.serializer, exp);
   }
 },

 updateTinyMCETextAreas : function(formId) {
   const _me = this;
   const mceFields = document.forms[formId].select('textarea.mceEditor');
   console.log('updateTinyMCETextAreas: for ', formId, mceFields);
   mceFields.each(function(formfield) {
     if ((typeof tinymce !== 'undefined') && tinymce.get(formfield.id)) {
       _me.updateOneTinyMCETextArea(tinymce.get(formfield.id));
     }
   });
   console.debug('updateTinyMCETextAreas: end ', formId);
 },

 /**
  * submittable fields must have a name attribute and maynot be disabled
  * @param fieldElem
  * @returns {Boolean}
  */
 _isSubmittableField : function(fieldElem) {
   return (fieldElem.name && (fieldElem.name != '') && !fieldElem.disabled);
 },

 /**
  * isDirtyField and needs saving
  *
  * @param fieldElem
  * @return
  */
  isDirtyField : function(fieldElem) {
    if (fieldElem.hasClassName('celDirtyOnLoad')) {
      return true;
    }
    const formElem = fieldElem.closest('form');
    const formdata = new FormData(formElem);
    const formElements = formElem.elements;
    const elementsValues = this.editorFormsInitialValues.get(formElem.id);
    const dirtyFields = [...formdata.keys()].filter(key => 
      !(!formElements[key].classList || formElements[key].classList.contains('celIgnoreDirty'))
      && !this._equalsParamValues(formdata.getAll(key), elementsValues[key]));
    console.debug('isDirtyField: dirtyFields found', dirtyFields);
    return dirtyFields.length > 0;
  },

  _equalsParamValues : function(currentValueArr, initValueSet = new Set()) {
    return (currentValueArr.length === initValueSet.size)
      && currentValueArr.every(val => initValueSet.has(val));
  },

 _formDirtyOnLoad : function(formId) {
   const _me = this;
   return _me._isEditorDirtyOnLoad ||
     (typeof($(formId).celFormDirtyOnLoad) !== 'undefined')
       && ($(formId).celFormDirtyOnLoad.value == 'true');
 },

 getDirtyFormIds : function() {
   const dirtyFormIds = [];
   for(let entry of this.editorFormsInitialValues) {
     let formId = entry[0];
     if (this.isValidFormId(formId)) {
       if (this._formDirtyOnLoad(formId)) {
         console.debug('getDirtyFormIds formDirtyOnLoad found. ');
         dirtyFormIds.push(formId);
       } else {
         this.updateTinyMCETextAreas(formId);
         for(let elem of document.getElementById(formId).elements) {
           if (this._isSubmittableField(elem) && this.isDirtyField(elem)) {
             console.debug('getDirtyFormIds first found dirty field: ', elem.name);
             dirtyFormIds.push(formId);
             break;
           }
         }
       }
     } else {
       console.warn('getDirtyFormIds: form with id [' + formId
         + '] disappeared since loading the editor.');
     }
   }
   return dirtyFormIds;
 },

 changeEditLanguage : function(newEditLanguage, execCancelCallback) {
   const _me = this;
   _me.checkUnsavedChanges(function(transport, jsonResponses, failed) {
     var successful = (typeof failed === 'undefined') || !failed;
     if (successful) {
       window.location.href = '?language=' + newEditLanguage + '&'
           + window.location.search.replace(/^\?/, '').replace(/language=[^&]*&?/g, '');
     } else {
       execCancelCallback();
     }
   }, execCancelCallback);
 },

 checkUnsavedChanges : function(execCallback, execCancelCallback) {
   const _me = this;
   execCallback = execCallback || function() {};
   execCancelCallback = execCancelCallback || function() {};
   if (_me.isDirty()) {
   var saveBeforeCloseQuestion = _me._getModalDialog();
     saveBeforeCloseQuestion.setHeader(_me.tabMenuConfig.savingDialogWarningHeader);
     saveBeforeCloseQuestion.setBody(_me.tabMenuConfig.savingDialogMessage);
     saveBeforeCloseQuestion.cfg.setProperty("icon", YAHOO.widget.SimpleDialog.ICON_WARN);
     saveBeforeCloseQuestion.cfg.queueProperty("buttons",
         [ { text: _me.tabMenuConfig.savingDialogButtonDoNotSave, handler:function() {
             window.onbeforeunload = null;
             this.hide();
             execCallback();
             }},
               { text: _me.tabMenuConfig.savingDialogButtonCancel, handler:function() {
                this.cancel();
                execCancelCallback();
              } },
               { text: _me.tabMenuConfig.savingDialogButtonSave, handler:function() {
                 var _dialog = this;
                 _me.saveAllFormsAjax(function(transport, jsonResponses) {
                   _dialog.hide();
                   const failed = _me.showErrorMessages(jsonResponses);
                   console.log('saveAllFormsAjax returning: ', failed, jsonResponses, execCallback);
             execCallback(transport, jsonResponses, failed);
           });
                 _dialog.setHeader(_me.tabMenuConfig.savingDialogHeader);
                 _dialog.cfg.queueProperty("buttons", null);
                 _dialog.setBody(_me._loading.getLoadingIndicator(true));
                 _dialog.render();
               }, isDefault:true }
             ]);
     saveBeforeCloseQuestion.render();
     saveBeforeCloseQuestion.show();
   } else {
     execCallback();
   }
 },

 saveAllFormsAjax : function(execCallback, doNotSaveFormId) {
   const _me = this;
   var dirtyFormIds = _me.getDirtyFormIds();
   var jsonResponses = new Hash();
   var saveAllForms = function(allDirtyFormIds) {
     var formId = allDirtyFormIds.pop();
     var remainingDirtyFormIds = allDirtyFormIds;
     _me.saveAndContinueAjax(formId, { onSuccess : function(transport) {
       if (_me._handleSaveAjaxResponse(formId, transport, jsonResponses)) {
         _me._isEditorDirtyOnLoad = false;
         _me.retrieveInitialValues(formId);
       }
       if (remainingDirtyFormIds.length > 0) {
         console.log('next saveAllForms with: ', remainingDirtyFormIds);
         saveAllForms(remainingDirtyFormIds);
         } else {
           console.log('save done.');
           execCallback(transport, jsonResponses);
         }
     }});
   };
   if (doNotSaveFormId && (doNotSaveFormId != '')) {
     dirtyFormIds = dirtyFormIds.without(doNotSaveFormId);
   }
   if (dirtyFormIds.length > 0) {
     saveAllForms(dirtyFormIds);
   } else {
     execCallback();
   }
 },

 _handleSaveAjaxResponse : function(formId, transport, jsonResponses) {
   if (transport.responseText.isJSON()) {
     console.debug('_handleSaveAjaxResponse with json result: ', transport.responseText);
     var jsonResult = transport.responseText.evalJSON();
     jsonResponses.set(formId, jsonResult);
     if (jsonResult.successful) {
       return true;
     } else {
       console.warn('_handleSaveAjaxResponse: save failed for [' + formId + ']: ', jsonResult);
     }
   } else {
     return true;
   }
   return false;
 },

 saveWithAjax : function(pageFullName, lang, queryString) {
    // save menu name, redirect and target name
    var url = getTMCelHost() + "?ajax=save";
    url = url+"&xpage=celements_ajax";
    url = url+"&ajax_mode=CelTabEditAjax";
    url = url+"&pagefullname=" + pageFullName;
    url = url+"&lang=" + lang;
    url = url+"&"+queryString;
    console.warn('DEPRECATED saveWithAjax on TabEditor: ', pageFullName, queryString);
    new Ajax.Request(url, {method: 'get'});
  },

  saveWithAjaxPOST : function(pageFullName, lang, paramsHash) {
    // save menu name, redirect and target name
    var ajaxParams = new Hash({
        xpage : 'celements_ajax',
        ajax_mode : 'CelTabEditAjax',
        ajax : 'save',
        pagefullname : pageFullName,
        lang : lang
     }).merge(paramsHash);
    console.warn('DEPRECATED saveWithAjaxPOST on TabEditor: ', pageFullName, queryString);
    new Ajax.Request(getTMCelHost(), {
      method: 'post',
      parameters: ajaxParams,
      onSuccess: function(transport) {
        if (transport.responseText.isJSON()) {
          loadContextMenuForClassNames(transport.responseText.evalJSON());
        }
      }
    });
  },

  _getModalDialog : function() {
    if(!this.modalDialog) {
      this.modalDialog = new YAHOO.widget.SimpleDialog("modal dialog", {
          width: "auto",
          fixedcenter: true,
          visible: false,
          draggable: false,
          close: false,
          zindex:4,
          modal:true,
          monitorresize:false,
          icon: YAHOO.widget.SimpleDialog.ICON_HELP,
          constraintoviewport: true
          } );
    }
    //add skin-div to get default yui-skin-sam layouting for the dialog
    var yuiSamSkinDiv = new Element('div', {'class' : 'yui-skin-sam'});
    $(document.body).insert(yuiSamSkinDiv);
    this.modalDialog.render(yuiSamSkinDiv);
    return this.modalDialog;
  }
};

})(window);
//YAHOO.register("tabeditor", CELEMENTS.widget.TabEditor, {version: "2.6", build: "7"});

var getTMCelHost = function() {
  var celHost = document.location.href + '?';
  celHost = celHost.substring(0, celHost.indexOf('?'));
  return celHost;
};

// backwards compatibility

/** deprecated methods **/
var saveAndClose = function(formName) {
  getCelementsTabEditor().saveAndClose(formName);
};

/** deprecated methods **/
var setFocus = function(elid) {
  getCelementsTabEditor().setFocus(elid);
};

/** deprecated methods **/
var removeFocus = function(elid) {
  getCelementsTabEditor().removeFocus(elid);
};

/** deprecated methods **/
var saveWithAjax = function(pageFullName, lang, queryString) {
  getCelementsTabEditor().saveWithAjax(pageFullName, lang, queryString);
};

/** deprecated methods **/
var saveWithAjaxPOST = function(pageFullName, lang, paramsHash) {
  getCelementsTabEditor().saveWithAjaxPOST(pageFullName, lang, paramsHash);
};

/** deprecated methods **/
var lazyLoadJS = function(div) {
  getCelementsTabEditor().lazyLoadJS(div);
};
