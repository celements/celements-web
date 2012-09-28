/* Helpers */
function createCookie(name,value,days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
  }
  else var expires = "";
  document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

function eraseCookie(name) {
  createCookie(name,"",-1);
}

/* MenuBar Class */
var MenuBar = Class.create();
MenuBar.prototype = {
 // constructor
 initialize : function() {
   // initialize variables
  this.n = $("celements2_menu_bar");
  this.menu = $("celements2_menu_bar_header");
  this.fade_state = true;
  this.currentWidth = 1000;
  // creade fade effect
//  this.fadeEffect = new fx.Width('celements2_menu_bar' , {duration: 400, onComplete: this.toggleStateCallback});
  this.n.style.overflow = "visible";
  // observe the keypress event for fading in and out the menu bar
//  Event.observe(document, 'keypress', function(event){
//    if((event.keyCode == Event.KEY_LEFT && my_menu_bar.fade_state)
//        || (event.keyCode == Event.KEY_RIGHT && !my_menu_bar.fade_state)) {
//      my_menu_bar.toggleState();
//    }
//  });
  //var temp_fade_state = readCookie("menubar_fade_state");
  //if(temp_fade_state == "out"){
  //  this.fade_state = false;
  //  this.hideMenu();
  //  this.n.style.width="150px"  
  //}
  return true;
 },
 hideAllMenu : function () {
   $$("#celements2_menu_bar .celements2_menu_bar_submenu.active").each(function(submenu) {
     submenu.removeClassName('active');
     submenu.setStyle({ display : 'none' });
   });
   $$("#celements2_menu_bar .celements2_menu_bar_header_item.active").each(function(menu) {
     menu.removeClassName('active');
   });
 },
 show_menu_item : function(event){
  var headerElem = event.findElement('.celements2_menu_bar_header_item');
  // show submenu
  if(headerElem && !headerElem.hasClassName('active')){
    event.stop();
    this.hideAllMenu();
    var id = headerElem.id.replace(/.*(\d+)/, '$1');
    $("celements2_menu_bar_submenu"+id).addClassName('active');
    $("celements2_menu_bar_submenu"+id).setStyle({ display : 'block', opacity : '0'});
    new Effect.Opacity("celements2_menu_bar_submenu"+id, {
        duration: 0.3,
        from: 0,
        to: 1
    });
    $("celements2_menu_bar_header"+id).addClassName('active');
  } else if (!headerElem) {
    this.hideAllMenu();
  }
 },
/* click_showhide : function(id){
  // TODO; buggy. if already visible hide, else show
  if (id && $("celements2_menu_bar_submenu"+id)){
    if ($("celements2_menu_bar_submenu"+id).hasClassName('active')) {
      $("celements2_menu_bar_submenu"+id).removeClassName('active');
      new Effect.Opacity("celements2_menu_bar_submenu"+id, {
        duration: 0.2,
        from: 1,
        to: 0,
        afterFinish: function(effect) {
          effect.element.setStyle({ display : 'none' });
        }
      });
    } else {
      $("celements2_menu_bar_submenu"+id).addClassName('active');
    }
  }
 },
 */
 hide_sub_menu : function(event){
   event.stop();
   var reltg = (event.relatedTarget) ? event.relatedTarget : event.toElement;
   var headerElem = $(reltg).up('.celements2_menu_bar_header_item');
   // hide specified submenu
   if (!headerElem
       && ($$("#celements2_menu_bar .celements2_menu_bar_submenu.active").size() > 0)) {
     var menuToHide = $$("#celements2_menu_bar .celements2_menu_bar_submenu.active")[0];
     new Effect.Opacity(menuToHide.id, {
      duration: 0.3,
      from: 1,
      to: 0,
      afterFinish: function(effect) {
        effect.element.setStyle({ display : 'none' });
        effect.element.removeClassName('active');
        effect.element.up('.celements2_menu_bar_header_item').removeClassName('active');
      }
    });
  }
 },
 toggleState : function() {
  if(this.fade_state){
    this.fade_state = false;
    //createCookie("menubar_fade_state","out")
    // save current menu bar width for later use
    this.current_width = this.getCurrentMenuBarWidth();
    // hide the menu items
    this.hideMenu();
    // fade out
//    this.fadeEffect.custom(this.current_width,150);
    my_admin_interface.fadeOut();
  }else{
    //createCookie("menubar_fade_state","in") 
    this.fade_state=true;
    // fade in
//    this.fadeEffect.custom(150,this.current_width);
    my_admin_interface.fadeIn();
    //var body_elem = $$("body")[0];
    //for(i = 0; i <= 34; i++)
    //  body_elem.style.marginTop = i+"px";
    
  }
 },
 toggleStateCallback: function() {
  if(my_menu_bar.fade_state){
    // just faded in
    my_menu_bar.showMenu();
    my_menu_bar.n.style.width = "100%";
        
  } else {
    // just faded out
    //var body_elem = $$("body")[0];
    //for(i = 34; i >= 0; i--)
    //  body_elem.style.marginTop = i+"px";
    
  }
 },
 hideMenu : function() {
    this.menu.style.display = "none"; 
 },
 showMenu : function() {
    this.menu.style.display = "block"; 
 },
 getCurrentMenuBarWidth : function(){
    return this.n.offsetWidth;
 }
};

var initMenuBarListener = function() {
  if($('celements2_menu_bar_header')) {
     // Admin Interface
     my_admin_interface = new AdminInterface();
    
      // Menu Bar 
     my_menu_bar = new MenuBar();
    $$('#celements2_menu_bar_header .celements2_menu_bar_submenu').each(
      function(submenuitem) {
        submenuitem.observe('mouseout', my_menu_bar.hide_sub_menu);
      }
    );
    $$('#celements2_menu_bar_header .celements2_menu_bar_header_item').each(
      function(headeritem) {
        headeritem.observe('click', my_menu_bar.show_menu_item.bind(my_menu_bar));
        headeritem.observe('mouseover', my_menu_bar.show_menu_item.bind(my_menu_bar));
      }
    );
    var body_elem = document.getElementsByTagName("body")[0];
    body_elem.style.marginTop = "42px";
    $$('#celements2_menu_bar_header .celements_menu_bar_support_item').each(function(elem) {
      elem.stopObserving('click', openZendeskHandler);
      elem.observe('click', openZendeskHandler);
    });
  }
  if (typeof my_menu_bar != 'undefined') {
    $$("body")[0].observe('click', my_menu_bar.show_menu_item.bind(my_menu_bar));
  }
};

Event.observe(window, 'load', initMenuBarListener);

var openZendeskHandler = function(event) {
  event.stop();
  Cel_Zenbox.show();
};
