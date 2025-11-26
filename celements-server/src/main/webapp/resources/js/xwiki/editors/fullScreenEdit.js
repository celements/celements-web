if(typeof (XWiki)=="undefined"){XWiki=new Object()
}if(typeof (XWiki.editors)=="undefined"){XWiki.editors=new Object()
}XWiki.editors.FullScreenEditing=Class.create({margin:0,buttonSize:16,initialize:function(){this.buttons=$(document.body).down(".bottombuttons");
if(!this.buttons){this.buttons=new Element("div",{"class":"bottombuttons"}).update(new Element("div",{"class":"buttons"}));
this.buttons._x_isCustom=true;
document.body.appendChild(this.buttons.hide())
}this.buttonsPlaceholder=new Element("span");
this.toolbarPlaceholder=new Element("span");
this.createCloseButtons();
$$("textarea").each(function(B){this.addBehavior(B)
}.bind(this));
$$(".xRichTextEditor").each(function(B){this.addBehavior(B)
}.bind(this));
this.addWysiwyg20Listener();
this.maximizedReference=$(document.body).down("input[name='x-maximized']");
if(this.maximizedReference&&this.maximizedReference.value!=""){var A=$$(this.maximizedReference.value);
if(A&&A.length>0){this.makeFullScreen(A[0])
}}},addBehavior:function(A){if(this.isWysiwyg20Content(A)){this.addWysiwyg20ContentButton(A)
}else{if(this.isWysiwyg10Content(A)){this.addWysiwyg10ContentButton(A)
}else{if(this.isWikiContent(A)){this.addWikiContentButton(A)
}else{if(this.isWysiwyg20Field(A)){this.addWysiwyg20FieldButton(A)
}else{if(this.isWikiField(A)){this.addWikiFieldButton(A)
}else{if(this.isWysiwyg10Field(A)){this.addWysiwyg10FieldButton(A)
}}}}}}},addWysiwyg20Listener:function(){document.observe("xwiki:wysiwyg:created",this.wysiwyg20Created.bindAsEventListener(this))
},wysiwyg20Created:function(B,A){},isWikiContent:function(A){return A.name=="content"&&A.visible()
},isWysiwyg10Content:function(A){return A.name=="content"&&(Prototype.Browser.IE?A.previous(".mceEditorContainer"):A.next(".mceEditorContainer"))
},isWysiwyg20Content:function(A){return A.hasClassName("xRichTextEditor")&&A.up("div[id^=content_container]")
},isWikiField:function(A){return A.visible()
},isWysiwyg10Field:function(A){return !A.visible()&&A.name!="content"&&(Prototype.Browser.IE?A.previous(".mceEditorContainer"):A.next(".mceEditorContainer"))
},isWysiwyg20Field:function(A){return A.hasClassName("xRichTextEditor")&&!A.up("div[id^=content_container]")
},addWikiContentButton:function(A){A._toolbar=$(document.body).down(".leftmenu2");
if(A._toolbar){A._toolbar.insert({top:this.createOpenButton(A)})
}else{this.addWikiFieldButton(A)
}},addWysiwyg10ContentButton:function(E){var B=(Prototype.Browser.IE?E.previous(".mceEditorContainer"):E.next(".mceEditorContainer"));
if(!B){return false
}var D=B.down(".mceToolbar");
if(!D){return false
}var A=new Element("span",{"class":"mce_editor_fullscreentoolbar"});
var C=new Element("a",{"class":"mceButtonNormal"});
A.insert(new Element("img",{"class":"mceSeparatorLine",height:15,width:1,src:D.down("img.mceSeparatorLine").src}));
A.insert(C.insert(this.createOpenButton(B)));
D.insert(A);
B._toolbar=D;
return true
},addWysiwyg20ContentButton:function(B){var A=B.down(".gwt-MenuBar");
if(!A){if(!B._x_fullScreenLoader){B._x_fullScreenLoader_iterations=0;
B._x_fullScreenLoader=new PeriodicalExecuter(function(C){if(C._x_fullScreenLoader_iteration>100){C._x_fullScreenLoader.stop();
C._x_fullScreenLoader=false;
return 
}C._x_fullScreenLoader_iteration++;
this.addWysiwyg20ContentButton(C)
}.bind(this,B),0.2)
}return false
}A.insert({top:this.createOpenButton(B)});
B._toolbar=A;
if(B._x_fullScreenLoader){B._x_fullScreenLoader.stop();
B._x_fullScreenLoader=false
}return true
},addWikiFieldButton:function(A){Element.insert(A,{before:this.createOpenLink(A)})
},addWysiwyg10FieldButton:function(A){this.addWysiwyg10ContentButton(A)
},addWysiwyg20FieldButton:function(A){this.addWysiwyg20ContentButton(A)
},createOpenButton:function(B){var A=new Element("img",{"class":"fullScreenEditButton",title:"$msg.get('core.editors.fullscreen.editFullScreen')",alt:"$msg.get('core.editors.fullscreen.editFullScreen')",src:"$xwiki.getSkinFile('icons/silk/arrow_out.gif', true)"});
A.observe("click",this.makeFullScreen.bind(this,B));
A.observe("mousedown",this.preventDrag.bindAsEventListener(this));
B._x_fullScreenActivator=A;
A._x_maximizedElement=B;
return A
},createOpenLink:function(B){var C=new Element("div",{"class":"fullScreenEditLinkContainer"});
var A=new Element("a",{"class":"fullScreenEditLink",title:"$msg.get('core.editors.fullscreen.editFullScreen')"});
A.update("${msg.get('core.editors.fullscreen.editFullScreen')} &raquo;");
A.observe("click",this.makeFullScreen.bind(this,B));
C.update(A);
B._x_fullScreenActivator=A;
A._x_maximizedElement=B;
return C
},createCloseButtons:function(){this.closeButton=new Element("img",{"class":"fullScreenCloseButton",title:"$msg.get('core.editors.fullscreen.exitFullScreen')",alt:"$msg.get('core.editors.fullscreen.exitFullScreen')",src:"$xwiki.getSkinFile('icons/silk/arrow_in.gif', true)"});
this.closeButton.observe("click",this.closeFullScreen.bind(this));
this.closeButton.observe("mousedown",this.preventDrag.bindAsEventListener(this));
this.closeButton.hide();
this.actionCloseButton=new Element("input",{type:"button","class":"button",value:"$msg.get('core.editors.fullscreen.exitFullScreen')"});
this.actionCloseButtonWrapper=new Element("span",{"class":"buttonwrapper"});
this.actionCloseButtonWrapper.update(this.actionCloseButton);
this.actionCloseButton.observe("click",this.closeFullScreen.bind(this));
this.actionCloseButtonWrapper.hide();
this.buttons.down(".buttons").insert({top:this.actionCloseButtonWrapper})
},makeFullScreen:function(A){if(this.maximizedReference){if(A.id){this.maximizedReference.value=A.tagName+"[id='"+A.id+"']"
}else{if(A.name){this.maximizedReference.value=A.tagName+"[name='"+A.name+"']"
}else{if(A.className){this.maximizedReference.value=A.tagName+"."+A.className
}}}}this.maximized=A;
A._originalStyle={width:A.style.width,height:A.style.height};
if(A.hasClassName("xRichTextEditor")){var D=A.down(".gwt-RichTextArea");
D._originalStyle={width:D.style.width,height:D.style.height}
}else{if(A.hasClassName("mceEditorContainer")){var D=A.down(".mceEditorIframe");
D._originalStyle={width:D.style.width,height:D.style.height};
var C=A.down(".mceEditorSource");
C._originalStyle={width:C.style.width,height:C.style.height}
}}var E=A.up();
E.addClassName("fullScreenWrapper");
if(A._toolbar){if(A._toolbar.hasClassName("leftmenu2")){E.insert({top:A._toolbar.replace(this.toolbarPlaceholder)})
}A._x_fullScreenActivator.replace(this.closeButton)
}E.insert(this.buttons.replace(this.buttonsPlaceholder).show());
var B=A.up();
A._x_fullScreenActivator.hide();
while(B!=document.body){B._originalStyle={overflow:B.style.overflow,position:B.style.position,width:B.style.width,height:B.style.height,left:B.style.left,right:B.style.right,top:B.style.top,bottom:B.style.bottom,padding:B.style.padding,margin:B.style.margin};
B.setStyle({overflow:"visible",position:"absolute",width:"100%",height:"100%",left:0,top:0,right:0,bottom:0,padding:0,margin:0});
B.siblings().each(function(F){F._originalDisplay=F.style.display;
F.setStyle({display:"none"})
});
B=B.up()
}document.body._originalStyle={overflow:B.style.overflow,width:B.style.width,height:B.style.height};
document.body.setStyle({overflow:"hidden",width:"100%",height:"100%"});
this.resizeListener=this.resizeTextArea.bind(this,A);
Event.observe(window,"resize",this.resizeListener);
this.closeButton.show();
this.actionCloseButtonWrapper.show();
this.resizeTextArea(A);
if(A._toolbar){A._toolbar.viewportOffset()
}},closeFullScreen:function(){var A=this.maximized;
this.closeButton.hide();
this.actionCloseButtonWrapper.hide();
Event.stopObserving(window,"resize",this.resizeListener);
A.up().removeClassName("fullScreenWrapper");
if(A.hasClassName("xRichTextEditor")){var D=A.down(".gwt-RichTextArea");
D.setStyle(D._originalStyle)
}else{if(A.hasClassName("mceEditorContainer")){var D=A.down(".mceEditorIframe");
D.setStyle(D._originalStyle);
var C=A.down(".mceEditorSource");
C.setStyle(C._originalStyle)
}}var B=A.up();
while(B!=document.body){B.setStyle(B._originalStyle);
B.siblings().each(function(E){E.style.display=E._originalDisplay
});
B=B.up()
}document.body.setStyle(document.body._originalStyle);
this.buttonsPlaceholder.replace(this.buttons);
if(this.buttons._x_isCustom){this.buttons.hide()
}if(A._toolbar){if(A._toolbar.hasClassName("leftmenu2")){this.toolbarPlaceholder.replace(A._toolbar)
}this.closeButton.replace(A._x_fullScreenActivator)
}if(Prototype.Browser.IE){setTimeout(function(){A._x_fullScreenActivator.show();
this.setStyle(this._originalStyle)
}.bind(A),500)
}else{A._x_fullScreenActivator.show();
A.setStyle(A._originalStyle)
}delete this.maximized;
if(this.maximizedReference){this.maximizedReference.value=""
}},resizeTextArea:function(B){if(!this.maximized){return 
}var A=document.viewport.getHeight();
var C=document.viewport.getWidth();
if(C<=0){C=document.body.clientWidth;
A=document.body.clientHeight
}C=C-this.margin;
A=A-B.positionedOffset().top-this.margin-this.buttons.getHeight();
B.setStyle({width:C+"px",height:A+"px"});
if(B.hasClassName("xRichTextEditor")){B.down(".gwt-RichTextArea").setStyle({width:C+"px",height:A-B.down(".xToolbar").getHeight()-B.down(".gwt-MenuBar").getHeight()+"px"})
}else{if(B.hasClassName("mceEditorContainer")){B.down(".mceEditorIframe").setStyle({width:C+"px",height:A-B._toolbar.getHeight()+"px"});
B.down(".mceEditorSource").setStyle({width:C+"px",height:A-B._toolbar.getHeight()+"px"})
}}},preventDrag:function(A){A.stop()
}});
Event.observe(window,"load",function(){if(Prototype.Browser.IE){setTimeout("new XWiki.editors.FullScreenEditing();",500)
}else{new XWiki.editors.FullScreenEditing()
}});