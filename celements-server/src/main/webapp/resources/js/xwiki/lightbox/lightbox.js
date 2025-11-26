Lightbox=Class.create({initialize:function(C,A,B){this.formUrl=C;
this.saveUrl=A;
this.redirectUrl=B;
this.formData="";
this.loadedForms=new Object();
this.lbinit();
this.lbShow();
this.lbLoadForm(C)
},lbShow:function(){this.lbLoading();
toggleClass($("lb-bg"),"hidden");
toggleClass($("lb-align"),"hidden");
$("lb-bg").style.height=(document.body.offsetHeight+35)+"px"
},lbHide:function(){toggleClass($("lb-bg"),"hidden");
toggleClass($("lb-align"),"hidden")
},lbLoading:function(){if(this.currentUrl){this.loadedForms[this.currentUrl]=$("lb-content").firstChild.cloneNode(true)
}$("lb-content").innerHTML=this.getWaiting()
},lbLoadForm:function(url){this.currentUrl=url;
if(this.loadedForms[url]){var c=$("lb-content");
$("lb-content").innerHTML="";
$("lb-content").appendChild(this.loadedForms[url]);
this.form=c.getElementsByTagName("form")[0];
var scripts=c.getElementsByTagName("script");
for(var i=0;
i<scripts.length;
++i){eval(scripts[i].text)
}}else{new Ajax.Request(url,{onSuccess:this.lbFormDataLoaded.bind(this)})
}},lbFormDataLoaded:function(transport){var c=$("lb-content");
c.innerHTML="<div>"+transport.responseText+"</div>";
this.form=c.getElementsByTagName("form")[0];
var scripts=c.getElementsByTagName("script");
for(var i=0;
i<scripts.length;
++i){eval(scripts[i].text)
}$("lb-bg").style.height=(document.body.offsetHeight+35)+"px"
},lbSaveForm:function(){this.lbSaveData();
Form.disable(this.form);
this.lbSaveSync(this.saveUrl);
this.lbHide();
window.location=this.redirectUrl
},lbNext:function(A){this.lbSaveData();
this.lbLoading();
this.lbLoadForm(A)
},lbSaveData:function(){this.formData+="&"+Form.serialize(this.form);
this.formData=this.formData.replace("_segmentChief=&","=&");
this.formData=this.formData.replace("_periodicity=&","=&")
},lbSave:function(A){this.lbSaveData();
new Ajax.Request(A+"?ajax=1",{parameters:this.formData,onSuccess:this.lbSaveDone.bind(this)})
},lbSaveSync:function(A){new Ajax.Request(A+"?ajax=1",{parameters:this.formData,asynchronous:false})
},lbSaveDone:function(A){this.lbHide()
},lbClearData:function(){this.formData=""
},lbClose:function(){this.lbHide();
if(this.redirectUrl!==undefined){window.location=this.redirectUrl
}},lbSetNext:function(A){this.nextURL=A
},getWaiting:function(){var A="$xwiki.getSkinFile('icons/ajax-loader.gif', true)";
return'<div style="padding: 30px;"><img src="'+A+'"/></div>'
},lbcustominit:function(B,A,E,C){if(!$("lb")){var D=this.insertlbcontent(B,A,E,C);
new Insertion.Top("body",D)
}},lbinit:function(){return this.lbcustominit("#FFF","#FFF","#000","rounded")
},insertlbcontent:function(B,A,E,C){var D='<div id="lb-bg" class="hidden"></div><div id="lb-align" class="hidden"><div id="lb"><div id="lb-top"><div id="close-wrap"><div id="lb-close" onclick="window.lb.lbClose();" title="Cancel and close">&nbsp;</div></div>';
if(C=="lightrounded"){D+=this.roundedlighttop(B,A)
}else{if(C=="rounded"){D+=this.roundedtop(B,A)
}else{D+='<div class="lb-squarred" style="background:'+B+"; border-color:"+A+'"></div></div>'
}}D+='</div><div class="lb-content" style="background:'+B+"; border-color:"+A+"; color:"+E+'" id="lb-content">Lightbox Content</div>';
if(C=="lightrounded"){D+=this.roundedlightbottom(B,A)
}else{if(C=="rounded"){D+=this.roundedbottom(B,A)
}else{D+='<div class="lb-squarred" style="background:'+B+"; border-color:"+A+'"></div></div></div></div>'
}}return D
},roundedlightbottom:function(A,B){var C='<div class="roundedlight"><b class="top"><b class="b4b" style="background:'+B+';"></b><b class="b3b" style="background:'+A+"; border-color:"+B+';"></b><b class="b3b" style="background:'+A+"; border-color:"+B+';"></b><b class="b1b" style="background:'+A+"; border-color:"+B+';"></b></b> </div>';
return C
},roundedbottom:function(A,B){var C='<div class="rounded"><b class="bottom" style="padding:0px; margin:0px;"><b class="b12b" style="background:'+B+';"></b><b class="b11b" style="background:'+A+"; border-color:"+B+';"></b><b class="b10b" style="background:'+A+"; border-color:"+B+';"></b><b class="b9b" style="background:'+A+"; border-color:"+B+';"></b><b class="b8b" style="background:'+A+"; border-color:"+B+';"></b><b class="b7b" style="background:'+A+"; border-color:"+B+';"></b><b class="b6b" style="background:'+A+"; border-color:"+B+';"></b><b class="b5b" style="background:'+A+"; border-color:"+B+';"></b><b class="b4b" style="background:'+A+"; border-color:"+B+';"></b><b class="b3b" style="background:'+A+"; border-color:"+B+';"></b><b class="b2b" style="background:'+A+"; border-color:"+B+';"></b><b class="b1b" style="background:'+A+"; border-color:"+B+';"></b></b></div>';
return C
},roundedlighttop:function(A,B){var C='<div class="roundedlight"><b class="top"><b class="b1" style="background:'+B+';"></b><b class="b2" style="background:'+A+"; border-color:"+B+';"></b><b class="b3" style="background:'+A+"; border-color:"+B+';"></b><b class="b4" style="background:'+A+"; border-color:"+B+';"></b></b> </div>';
return C
},roundedtop:function(A,B){var C='<div class="rounded"><b class="top"><b class="b1" style="background:'+B+';"></b><b class="b2" style="background:'+A+"; border-color:"+B+';"></b><b class="b3" style="background:'+A+"; border-color:"+B+';"></b><b class="b4" style="background:'+A+"; border-color:"+B+';"></b><b class="b5" style="background:'+A+"; border-color:"+B+';"></b><b class="b6" style="background:'+A+"; border-color:"+B+';"></b><b class="b7" style="background:'+A+"; border-color:"+B+';"></b><b class="b8" style="background:'+A+"; border-color:"+B+';"></b><b class="b9" style="background:'+A+"; border-color:"+B+';"></b><b class="b10" style="background:'+A+"; border-color:"+B+';"></b><b class="b11" style="background:'+A+"; border-color:"+B+';"></b><b class="b12" style="background:'+A+"; border-color:"+B+';"></b></b></div>';
return C
},lightboxlink:function(B,A){var C='<a href="#" onclick="javascript:$(\'lb-content\').innerHTML ='+A+"; toggleClass($('lb-bg'), 'hidden'); toggleClass($('lb-align'), 'hidden');\">"+B+"</a>";
return C
}});