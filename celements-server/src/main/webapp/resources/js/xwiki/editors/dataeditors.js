$j(document).ready(function(){$$("#xwikiobjects a.delete").each(function(B){B.observe("click",function(C){B.blur();
C.stop();
if(!B.disabled){new XWiki.widgets.ConfirmedAjaxRequest(B.href,{onCreate:function(){B.disabled=true
},onSuccess:function(){var D=B.up(".xobject");
var E=D.up(".xclass");
D.remove();
if(E.select(".xobject").size()==0){E.remove()
}}.bind(this),onComplete:function(){B.disabled=false
}},{confirmationText:"$msg.get('core.editors.object.delete.confirm')",progressMessageText:"$msg.get('core.editors.object.delete.inProgress')",successMessageText:"$msg.get('core.editors.object.delete.done')",failureMessageText:"$msg.get('core.editors.object.delete.failed')"})
}}.bindAsEventListener())
});
$$("#xwikiobjects a.edit").each(function(B){B.observe("click",function(C){B.blur();
C.stop();
window.location=B.href
}.bindAsEventListener())
});
$$("#xwikiobjects .xclass-title").each(function(B){B.observe("click",function(C){B.up().toggleClassName("collapsed")
}.bindAsEventListener())
});
$$("#xwikiobjects .xclass").each(function(B){B.addClassName("collapsable")
});
var A=$$(".xproperty").size();
$$(".xproperty").each(function(B){B.addClassName("collapsable");
if(A>1){B.toggleClassName("collapsed")
}});
$$(".xproperty-title").each(function(B){B.observe("click",function(C){B.up().toggleClassName("collapsed")
}.bindAsEventListener())
});
A=$$("#xwikiobjects .xobject").size();
$$("#xwikiobjects .xobject").each(function(B){B.addClassName("collapsable");
if(A>1){B.toggleClassName("collapsed")
}});
$$("#xwikiobjects .xobject-title").each(function(B){B.observe("click",function(C){B.up().toggleClassName("collapsed")
}.bindAsEventListener())
});
$$(".xobject-content dt, .xproperty-content dt").each(function(B){if(!B.down("input[type=checkbox]")){B.addClassName("collapsable");
B.insertBefore(new Element("span",{"class":"collapser"}),B.firstDescendant())
}else{B.addClassName("uncollapsable")
}});
$$(".xobject-content dt label, .xproperty-content dt label").each(function(B){B.observe("click",function(C){if(B.up("dt").down("span").hasClassName("collapsed")){B.up("dt").next("dd").toggle();
B.up("dt").down("span").toggleClassName("collapsed")
}}.bindAsEventListener())
});
$$(".collapser").each(function(B){B.observe("click",function(C){B.up("dt").next("dd").toggle();
B.toggleClassName("collapsed")
}.bindAsEventListener())
})
});
if(typeof (XWiki)=="undefined"){XWiki=new Object()
}if(typeof (XWiki.editors)=="undefined"){XWiki.editors=new Object()
}XWiki.editors.XPropertyOrdering=Class.create({initialize:function(){$$(".xproperty-content").each(function(A){A.select("input").each(function(B){if(B.id.endsWith("_number")){A.numberProperty=B;
B.up().hide();
if(B.up().previous("dt")){B.up().previous("dt").hide()
}}})
});
if($$(".xproperty").size()<=1){return 
}$$(".xproperty-title").each(function(B){var A=new Element("img",{src:"$xwiki.getSkinFile('icons/datamodel/move.png', true)","class":"move",alt:"move",title:"Drag and drop to change the order"});
B.makePositioned();
B.appendChild(A);
A.observe("click",function(C){C.stop()
}.bindAsEventListener())
});
Sortable.create("xclassContent",{tag:"div",only:"xproperty",handle:"move",starteffect:this.startDrag.bind(this),endeffect:this.endDrag.bind(this),onUpdate:this.updateOrder.bind(this)})
},updateOrder:function(A){var C=A.childElements();
for(var B=0;
B<C.size();
++B){var D=C[B].down(".xproperty-content");
D.numberProperty.value=B+1
}},startDrag:function(A){A.addClassName("dragged");
$("xclassContent").childElements().each(function(B){B._expandedBeforeDrag=!B.hasClassName("collapsed");
B.addClassName("collapsed")
})
},endDrag:function(A){A.removeClassName("dragged");
$("xclassContent").childElements().each(function(B){if(B._expandedBeforeDrag){B.removeClassName("collapsed")
}})
}});
$j(document).ready(function(){if($("xclassContent")){new XWiki.editors.XPropertyOrdering()
}});