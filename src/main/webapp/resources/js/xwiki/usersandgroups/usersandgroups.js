/* this represent a triple state checkbox */
MSCheckbox = Class.create({
  /**
    * @todo Make confirmations generic.
    * @todo msg.get
    * @todo Send the state number, or a generic map {state => sendValue}
    * @todo Configuration: automatic save, or just change the value.
    * @todo "Busy" icon when saving.
    * @todo Changing the value should change the cache, not invalidate it.
    * @todo The new state should be taken from the response, not just increment it.
    * @todo Make this a valid ARIA checkbox: http://www.w3.org/TR/aria-role/#checkbox
    */
  initialize: function(domNode, right, saveUrl, defaultState, table, idx)
  {
    this.table = table;
    this.idx = idx;
    if (this.table && this.idx && this.table.fetchedRows[this.idx]) {
      this.currentUorG = this.table.fetchedRows[this.idx].fullname;
      this.isUserInGroup = this.table.fetchedRows[this.idx].isuseringroup;
    } else {
      // guest users
      this.currentUorG = window.unregUser;
      this.isUserInGroup = false;
    }
    this.domNode = $(domNode);
    this.right = right;
    this.saveUrl = saveUrl;
    this.defaultState = defaultState;
    this.state = defaultState;
    this.states = [0,1,2]; // 0 = inherit; 1 = allow, 2 == deny
    this.nrstates = this.states.length;
    this.images = [
      "$xwiki.getSkinFile('js/xwiki/usersandgroups/img/none.png',true)",
      "$xwiki.getSkinFile('js/xwiki/usersandgroups/img/allow.png',true)",
      "$xwiki.getSkinFile('js/xwiki/usersandgroups/img/deny1.png',true)"
    ];
    this.labels = ['','',''];

    this.draw(this.state);
    this.attachEvents();
  },

  /**
    * @todo Draw with the current this.state, don't pass as an argument.
    */
  draw: function(state)
  {
    //remove child nodes
    while (this.domNode.childNodes.length > 0) {
      this.domNode.removeChild(this.domNode.firstChild);
    }
    //add new image
    var img = document.createElement('img');
    img.src = this.images[state];
    this.domNode.appendChild(img);
    //add label
    if (this.labels[state] != '') {
      var la = document.createElement('span');
      la.appendChild(document.createTextNode(this.labels[state]));
      this.domNode.appendChild(la);
    }
  },

  next: function()
  {
    this.state = (this.state + 1) % this.nrstates;
    if (this.table != undefined) {
      // TODO: Just update the cache, don't invalidate the row, once the rights are as stored as an
      // array, and not as a string.
      delete this.table.fetchedRows[this.idx];
    }
    this.draw(this.state);
  },

  /* Confirmation cases:
   * 1. The current user is clearing / denying himself any right.
   * 2. The current user is clearing / denying any rights for a group he belongs to.
   * 3. The current user is is clearing / denying admin right for any user / group.
   * User can clear it's own right after canceling the deny action and confirming the clear action.
   */
  createClickHandler: function(self)
  {
    return function() {
      if (self.req) {
        return;
      }

      var action = "";
      var nxtst = (self.state + 1) % self.nrstates;

      // 1. The current user is clearing / denying himself any right.
      if (self.currentUorG == window.currentUser) {
        if (nxtst == 2) {
          var denymessage = "$msg.get('rightsmanager.denyrightforcurrentuser').replaceAll('"', '\\"')".replace('__right__', self.right);
          if (!confirm(denymessage)) {
            var clearmessage = "$msg.get('rightsmanager.clearrightforcurrentuserinstead').replaceAll('"', '\\"')".replace('__right__', self.right);
            if (confirm(clearmessage)) {
              action = "clear";
              self.state = 2;
              nxtst = 0;
            } else {
              return;
            }
          }
        } else if (nxtst == 0) {
          var clearmessage = "$msg.get('rightsmanager.clearrightforcurrentuser').replaceAll('"', '\\"')".replace('__right__', self.right);
          if (!confirm(clearmessage)) {
            return;
          }
        }
      }
      // 2. The current user is clearing / denying any rights for a group he belongs to.
      else if (self.isUserInGroup || (window.currentUser == "XWiki.XWikiGuest" && self.currentUorG == "XWiki.XWikiAllGroup")) {
        if (nxtst == 2) {
          var denymessage = "$msg.get('rightsmanager.denyrightforgroup').replaceAll('"', '\\"')".replace(/__right__/g, self.right);
          denymessage = denymessage.replace('__name__', self.currentUorG);
          if (!confirm(denymessage)) {
            var clearmessage = "$msg.get('rightsmanager.clearrightforgroupinstead').replaceAll('"', '\\"')".replace(/__right__/g, self.right);
            clearmessage = clearmessage.replace('__name__', self.currentUorG);
            if (confirm(clearmessage)) {
              action = "clear";
              self.state = 2;
              nxtst = 0;
            } else {
              return;
            }
          }
        } else if (nxtst == 0) {
          var clearmessage = "$msg.get('rightsmanager.clearrightforgroup').replaceAll('"', '\\"')".replace(/__right__/g, self.right);
          clearmessage = clearmessage.replace('__name__', self.currentUorG);
          if (!confirm(clearmessage)) {
            return;
          }
        }
      }
      // 3. The current user is is clearing / denying admin right for any user / group.
      else if (self.right == "admin") {
        if (nxtst == 2) {
          var denymessage = "$msg.get('rightsmanager.denyrightforuorg').replaceAll('"', '\\"')".replace('__right__', self.right);
          denymessage = denymessage.replace('__name__', self.currentUorG);
          if (!confirm(denymessage)) {
            return;
          }
        } else if (nxtst == 0) {
          var clearmessage = "$msg.get('rightsmanager.clearrightforuorg').replaceAll('"', '\\"')".replace('__right__', self.right);
          clearmessage = clearmessage.replace('__name__', self.currentUorG);
          if (!confirm(clearmessage)) {
            return;
          }
        }
      }

      if (action == "") {
        if (nxtst == 0) {
          action = "clear";
        } else if (nxtst == 1) {
          action = "allow";
        } else {
          action = "deny";
        }
      }

      // Compose the complete URI
      var url = self.saveUrl + "&action=" + action + "&right=" + self.right;

      self.req = new Ajax.Request(url, {
        method: 'get',
        onSuccess: function(transport) {
          if (transport.responseText.strip() == "SUCCESS") {
            self.next();
          } else {
            //if an error occurred while trying to save a right rule, display an alert
            // and refresh the page, since probably the user does not have the right to perform
            // that action
            alert("$msg.get('platform.core.rightsManagement.saveFailure')");
            var rURL = unescape(window.location.pathname);
            window.location.href = rURL;
          }
        },
        onFailure: function() {
          alert("$msg.get('platform.core.rightsManagement.ajaxFailure')");
        },
        onComplete: function() {
          delete self.req;
        }
      });
    }
  },

  attachEvents: function()
  {
    Event.observe(this.domNode, 'click', this.createClickHandler(this));
  }
});

/**
  * user list element creator. Used in adminusers.vm.
  */
function displayUsers(row, i, table)
{
  var userurl = row.userurl;
  var usersaveurl = row.usersaveurl;
  var userinlineurl = row.userinlineurl;
  var wikiname = row.wikiname;
  var docurl = row.docurl;

  var tr = document.createElement('tr');

  var username = document.createElement('td');
  if (wikiname == "local") {
    var a = document.createElement('a');
    a.href = userurl;
    a.appendChild(document.createTextNode(row.username));
    username.appendChild(a);
  } else {
    username.appendChild(document.createTextNode(row.username));
  }
  username.className="username";
  tr.appendChild(username);

  var firstname = document.createElement('td');
  firstname.appendChild(document.createTextNode(row.firstname) );
  tr.appendChild(firstname);

  var lastname = document.createElement('td');
  lastname.appendChild(document.createTextNode(row.lastname) );
  tr.appendChild(lastname);

  var manage = document.createElement('td');
  manage.className = "manage";

  if (wikiname == "local") {
    //edit user
    var edit = document.createElement('img');
    edit.src = '$xwiki.getSkinFile("js/xwiki/usersandgroups/img/edit.png",true)';
    edit.title = "$msg.get('edit')";
    Event.observe(edit, 'click', editUserOrGroup(userinlineurl, usersaveurl, docurl));
    edit.className = 'icon-manage';
    manage.appendChild(edit);

    //delete group
    var del = document.createElement('img');

    if (row.grayed == "true") {
      del.src = '$xwiki.getSkinFile("js/xwiki/usersandgroups/img/clearg.png",true)';
      del.className = 'icon-manageg';
    } else {
      del.src = '$xwiki.getSkinFile("js/xwiki/usersandgroups/img/clear.png",true)';
      Event.observe(del, 'click', deleteUserOrGroup(i, table, row.fullname, "user"));
      del.className = 'icon-manage';
    }
    del.title = "$msg.get('delete')";
    manage.appendChild(del);
  }

  tr.appendChild(manage);
  return tr;
}

/** group list element creator **/
function displayGroups(row, i, table)
{
  var userurl = row.userurl;
  var userinlineurl = row.userinlineurl;
  var usersaveurl = row.usersaveurl;
  var wikiname = row.wikiname;
  var docurl = row.docurl;

  var tr = document.createElement('tr');

  var username = document.createElement('td');
  if (wikiname == "local") {
    var a = document.createElement('a');
    a.href = userurl;
    a.appendChild( document.createTextNode( row.username ) );
    username.appendChild( a );
  } else {
    username.appendChild(document.createTextNode(row.username));
  }
  username.className="username";
  tr.appendChild(username);

  var members = document.createElement('td');
  if (wikiname == "local") {
    members.appendChild(document.createTextNode(row.members));
  } else {
    members.appendChild(document.createTextNode("-"));
  }
  tr.appendChild(members);

  var manage = document.createElement('td');
  manage.className = "manage";

  if (wikiname == "local") {
    //delete group
    var del = document.createElement('img');
    del.src = '$xwiki.getSkinFile("js/xwiki/usersandgroups/img/clear.png",true)';
    del.title = "$msg.get('delete')";
    Event.observe(del, 'click', deleteUserOrGroup(i, table, row.fullname, "group"));
    del.className = 'icon-manage';

    //edit user
    var edit = document.createElement('img');
    edit.src = '$xwiki.getSkinFile("js/xwiki/usersandgroups/img/edit.png",true)';
    edit.title = "$msg.get('edit')";
    Event.observe(edit, 'click', editUserOrGroup(userinlineurl, usersaveurl, docurl));
    edit.className = 'icon-manage';

    manage.appendChild(edit);
    manage.appendChild(del);
  }

  tr.appendChild(manage);

  return tr;
}

/** group members list element creator **/
function displayMembers(row, i, table)
{
  var tr = document.createElement('tr');
  var membername = document.createElement("td");

  var displayedName = document.createTextNode(row.prettyname);
  if (row.wikiname == "local") {
    var a = document.createElement("a");
    a.href = row.memberurl;
    a.appendChild(displayedName);
    membername.appendChild(a);
  } else {
    membername.appendChild(displayedName);
  }
  membername.className="username";
  tr.appendChild(membername);

  /* do not allow to delete users from a group when not in inline mode */
  if (table.action == "inline") {
    var membermanage = document.createElement("td");
    membermanage.className = "manage";

    var del = document.createElement('img');

    if (row.grayed == "true") {
      del.src = '$xwiki.getSkinFile("js/xwiki/usersandgroups/img/clearg.png",true)';
      del.className = 'icon-manageg';
    } else {
      del.src = '$xwiki.getSkinFile("js/xwiki/usersandgroups/img/clear.png",true)';
      Event.observe(del, 'click', deleteMember(i, table, row.fullname, row.docurl));
      del.className = 'icon-manage';
    }
    del.title = "$msg.get('delete')";
    membermanage.appendChild(del);
    tr.appendChild(membermanage);
  }

  return tr;
}

/**
  * User and groups list element creator.
  * Used in adminglobalrights.vm, adminspacerights.vm, editrights.vm.
  * @todo allows and denys should be arrays, not strings.
  */
function displayUsersAndGroups(row, i, table, idx)
{
  var userurl = row.userurl;
  var uorg = table.json.uorg;
  var allows = row.allows;
  var denys = row.denys;
  var saveUrl = "?xpage=saverights&clsname=" + table.json.clsname + "&fullname=" + row.fullname + "&uorg=" + uorg;

  var tr = document.createElement('tr');

  var username = document.createElement('td');
  if (row.wikiname == "local") {
    var a = document.createElement('a');
    a.href = userurl;
    a.appendChild( document.createTextNode( row.username ) );
    username.appendChild( a );
  } else {
    username.appendChild(document.createTextNode(row.username));
  }

  username.className = "username";
  tr.appendChild(username);
  activeRights.each(function(right) {
    if (right)
    {
      var td = document.createElement('td');
      td.className = "rights";
      var r = 0;
      if (allows.indexOf(right) >= 0) {
        r = 1;
      } else if (denys.indexOf(right) >= 0) {
        r = 2;
      }
      var chbx = new MSCheckbox(td, right, saveUrl, r, table, i);
      tr.appendChild(td);
    }
  });

  return tr;
}

////////////////////////////////////////////////////////////////

function editUserOrGroup(userinlineurl, usersaveurl, userredirecturl)
{
  return function() {
    window.lb = new Lightbox(userinlineurl, usersaveurl, userredirecturl);
  }
}


//function to delete a user with ajax
function deleteUserOrGroup(i, table, docname, uorg)
{
  return function() {
    var url = "?xpage=deleteuorg&docname=" + docname;
    if (uorg == "user") {
      if (confirm("$msg.get('rightsmanager.confirmdeleteuser').replaceAll('"', '\\"')".replace('__name__', docname))) {
        new Ajax.Request(url, {
          method: 'get',
          onSuccess: function(transport) {
            table.deleteRow(i);
          }
        });
      }
    } else {
      if (confirm("$msg.get('rightsmanager.confirmdeletegroup').replaceAll('"', '\\"')".replace('__name__', docname))) {
        new Ajax.Request(url, {
          method: 'get',
          onSuccess: function(transport) {
            table.deleteRow(i);
          }
        });
      }
    }
  }
}

//deletes a member of a group (only the object)
function deleteMember(i, table, docname, docurl)
{
  return function() {
    var url = docurl + "?xpage=deletegroupmember&fullname=" + docname;
    if (confirm("$msg.get('rightsmanager.confirmdeletemember').replaceAll('"', '\\"')")) {
      new Ajax.Request(url, {
        method: 'get',
        onSuccess: function(transport) {
          table.deleteRow(i);
        }
      });
    }
  }
}

function makeAddHandler(url, saveurl, redirecturl)
{
  return function() {
    window.lb = new Lightbox(url, saveurl, redirecturl);
  }
}

function setGuestExtendedRights(self)
{
  return function() {
    var url = '$xwiki.getURL("XWiki.XWikiPreferences", "save")';
    var pivot = self;
    if (self.getAttribute('alt') == "yes") {
      if (self.id.indexOf('view') > 0) {
        new Ajax.Request(url, {
          method: 'post',
          parameters: {"XWiki.XWikiPreferences_0_authenticate_view" : "0"},
          onSuccess: function() {
            pivot.alt = "no";
            pivot.src = "$xwiki.getSkinFile('js/xwiki/usersandgroups/img/none.png',true)";
        }});
      } else {
        new Ajax.Request(url, {
          method: 'post',
          parameters: {"XWiki.XWikiPreferences_0_authenticate_edit" : "0"},
          onSuccess: function() {
            pivot.alt = "no";
            pivot.src = "$xwiki.getSkinFile('js/xwiki/usersandgroups/img/none.png',true)";
        }});
      }
    } else {
      if (self.id.indexOf('view') > 0) {
        new Ajax.Request(url, {
          method: 'post',
          parameters: {"XWiki.XWikiPreferences_0_authenticate_view" : "1"},
          onSuccess: function() {
            pivot.alt = "yes";
            pivot.src = "$xwiki.getSkinFile('js/xwiki/usersandgroups/img/allow-black.png',true)";
        }});
      } else {
        new Ajax.Request(url, {
          method: 'post',
          parameters: {"XWiki.XWikiPreferences_0_authenticate_edit" : "1"},
          onSuccess: function() {
            pivot.alt = "yes";
            pivot.src = "$xwiki.getSkinFile('js/xwiki/usersandgroups/img/allow-black.png',true)";
        }});
      }
    }
  }
}
