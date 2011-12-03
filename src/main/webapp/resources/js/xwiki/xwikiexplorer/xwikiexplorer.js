if(typeof XWiki=="undefined"){alert("ERROR: xwikiexplorer.js depends on xwiki.js")
}XWiki.constants.rest={baseRestURI:XWiki.contextPath+"/rest/",restChildrenRel:"http://www.xwiki.org/rel/children",restParentRel:"http://www.xwiki.org/rel/parent",restAttachmentsRel:"http://www.xwiki.org/rel/attachments",restHomeRel:"http://www.xwiki.org/rel/home"};
isc.ClassFactory.defineClass("XWEResultTree",isc.ResultTree);
isc.XWEResultTree.addClassProperties({constants:{addNodeSuffix:"..new",attachmentsTitle:"$msg.get('xwikiexplorer.attachments.title')",addPageTitle:"$msg.get('xwikiexplorer.addpage.title')",addAttachmentTitle:"$msg.get('xwikiexplorer.addattachment.title')"}});
isc.XWEResultTree.addProperties({multiDSTree:true,callbacks:{dataArrived:new Array()},parentMap:{},displayLinks:true,displayAddPage:false,displayAddPageOnTop:true,displayAttachments:true,displayAttachmentsOnTop:false,displayAttachmentsWhenEmpty:false,displayAddAttachment:false,displayAddAttachmentOnTop:true,displayBlacklistedSpaces:false});
isc.XWEResultTree.addMethods({getChildDataSource:function(E,D){var C=E[this.childTypeProperty];
if(C!=null){return isc.DS.get(C)
}var D=D||this.getNodeDataSource(E);
if(D==null||!this.isMultiDSTree()){return this.getRootDataSource()
}var B=this.treeRelations,A=D.getChildDataSources();
var F=XWiki.resource.get(E.id);
E.resource=F;
if(D.Class=="XWEDataSource"){C=isc.XWEWikiDataSource.getOrCreate(F.wiki).getID()
}else{if(D.Class=="XWEWikiDataSource"){C=isc.XWESpaceDataSource.getOrCreate(F.wiki,F.space).getID()
}else{if(D.Class=="XWESpaceDataSource"){if(E.isXWikiAttachment==null){C=isc.XWESpaceDataSource.getOrCreate(F.wiki,F.space).getID()
}else{C=isc.XWEAttachmentsDataSource.getOrCreate(F.wiki,F.space,F.name).getID()
}}else{if(B){C=B[D.ID]
}}}}if(C!=null){return isc.DS.get(C)
}if(A!=null){return A[0]
}},dataArrived:function(E){var I=this.getNodeDataSource(E);
var C="";
if(I==null){I=this.getDataSource()
}if(I.Class=="XWEWikiDataSource"&&this.displayBlacklistedSpaces==false){this.filterNodesByName(this.getChildren(),XWiki.blacklistedSpaces)
}var B=this.getChildren(E);
for(var D=0;
D<B.length;
D++){var A=this.getNodeDataSource(B[D]);
var G=B[D].name;
var F=true;
if(this.displayLinks==true&&B[D].xwikiRelativeUrl!=null){G="<a href='"+B[D].xwikiRelativeUrl+"'>"+G+"</a>"
}isc.addProperties(B[D],{icon:A.icon,title:G,isNewPage:false,isNewAttachment:false});
if(D==0){C=A.Class
}}if(C=="XWESpaceDataSource"&&I.Class=="XWEWikiDataSource"&&this.displayAddPage==true){this.addAddPageNode(E)
}if(I.Class=="XWESpaceDataSource"&&this.displayAttachments==true&&!E.isXWikiAttachment){this.addAttachmentsNode(E)
}if(E.isXWikiAttachment&&this.displayAddAttachment==true){this.addAddAttachmentsNode(E)
}if(this.callbacks.dataArrived.length>0){var H=this.callbacks.dataArrived.shift();
H.callback()
}},isFolder:function(D){var C=this.getNodeDataSource(D);
if(C!=null){if(C.Class=="XWEDataSource"){return true
}else{if(C.Class=="XWEWikiDataSource"){return true
}else{if(C.Class=="XWESpaceDataSource"){if(D.isXWikiAttachment==true){return true
}var A=(D.link!=null)?D.link:new Array();
for(var B=0;
B<A.length;
B++){if(A[B].rel==XWiki.constants.rest.restChildrenRel||A[B].rel==XWiki.constants.rest.restAttachmentsRel||this.displayAttachmentsWhenEmpty||this.displayAddAttachment){return true
}}return false
}else{if(C.Class=="XWEAttachmentsDataSource"){return false
}}}}}return true
},getChildNodeByName:function(D,A){var C=this.getChildren(D);
if(C!=null){for(var B=0;
B<C.length;
B++){if(C[B].name==A){return C[B]
}}}return null
},filterNodesByName:function(A,C){for(var B=0;
B<A.length;
B++){if(XWiki.blacklistedSpaces.indexOf(A[B].name)!=-1){this.remove(A[B])
}}},addAddPageNode:function(C){var B={id:C.id+isc.XWEResultTree.constants.addNodeSuffix,wiki:C.wiki,space:C.space,title:isc.XWEResultTree.constants.addPageTitle,parentId:C.id,icon:"$xwiki.getSkinFile('icons/silk/bullet_add.gif', true)",resource:C.resource,isNewPage:true,isNewAttachment:false,clickCallback:function(F,D,E){D.resource=XWiki.resource.get(D.resource.prefixedSpace);
F.input.value=""
}};
var A;
if(this.displayAddPageOnTop==true){A=0
}else{A=null
}this.add(B,C,A)
},addAddAttachmentsNode:function(C){var B={id:C.id+isc.XWEResultTree.constants.addNodeSuffix,wiki:C.wiki,space:C.space,title:isc.XWEResultTree.constants.addAttachmentTitle,parentId:C.id,icon:"$xwiki.getSkinFile('icons/silk/bullet_add.gif', true)",resource:C.resource,isNewPage:false,isNewAttachment:true,clickCallback:function(F,D,E){F.input.value=""
}};
var A;
if(this.displayAddAttachmentsOnTop==true){A=0
}else{A=null
}this.add(B,C,A)
},addAttachmentsNode:function(G){var D=false;
var F=this.getNodeDataSource(G);
if(this.displayAttachmentsWhenEmpty==true||this.displayAddAttachment){D=true
}else{var B=(G.link!=null)?G.link:new Array();
var D=false;
for(var E=0;
E<B.length;
E++){if(B[E].rel==XWiki.constants.rest.restAttachmentsRel){D=true;
break
}}}if(D==true){var H=isc.XWEResultTree.constants.attachmentsTitle+" ("+G.name+")";
if(this.displayLinks==true){H="<a href='"+G.xwikiRelativeUrl+XWiki.constants.anchorSeparator+XWiki.constants.docextraAttachmentsAnchor+"'>"+H+"</a>"
}var A={id:G.id+XWiki.constants.anchorSeparator+XWiki.constants.docextraAttachmentsAnchor,fullName:G.fullName+XWiki.constants.anchorSeparator+XWiki.constants.docextraAttachmentsAnchor,wiki:G.wiki,space:G.space,title:H,name:G.name,parentId:G.id,xwikiRelativeURL:G.xwikiRelativeURL+XWiki.constants.anchorSeparator+XWiki.constants.docextraAttachmentsAnchor,icon:"$xwiki.getSkinFile('icons/silk/page_white_zip.gif', true)",resource:XWiki.resource.get(G.id+XWiki.constants.anchorSeparator+XWiki.constants.docextraAttachmentsAnchor),isXWikiAttachment:true,isNewPage:false,isNewAttachment:false};
var C;
if(this.displayAttachmentsOnTop==true){C=0
}else{C=null
}this.add(A,G,C)
}}});
isc.ClassFactory.defineClass("XWEDataSource",isc.DataSource);
isc.XWEDataSource.addClassProperties({sep:"_"});
isc.XWEDataSource.addProperties({dataFormat:"xml",xmlNamespaces:{xwiki:"http://www.xwiki.org"},resultTreeClass:"XWEResultTree",transformResponse:function(B,A,D){if(this.callbacks.transformResponse.length>0){var C=this.callbacks.transformResponse.shift();
C.callback(B,A,D)
}return B
},dataURL:XWiki.constants.rest.baseRestURI+"wikis/",recordXPath:"/xwiki:wikis/xwiki:wiki",fields:[{name:"id",required:true,type:"text",primaryKey:true},{name:"name",type:"text"},{name:"title",type:"text"},{name:"xwikiRelativeUrl",type:"text"}],icon:"$xwiki.getSkinFile('icons/silk/database.gif', true)",requestProperties:{promptStyle:"cursor"},callbacks:{transformResponse:new Array()}});
isc.XWEDataSource.addMethods({transformRequest:function(A){if(A.originalData){A.originalData.r=""+Math.floor(Math.random()*1000000)
}return A.data
}});
isc.ClassFactory.defineClass("XWEWikiDataSource",isc.XWEDataSource);
isc.XWEWikiDataSource.addClassMethods({getOrCreate:function(A){var C="XWEWikiDataSource_"+A;
var B=this.get(C);
if(B==null){B=this.create({ID:C,wiki:A})
}return B
}});
isc.XWEWikiDataSource.addProperties({wiki:XWiki.currentWiki,recordXPath:"/xwiki:spaces/xwiki:space",fields:[{name:"id",required:true,type:"text",primaryKey:true},{name:"name",required:true,type:"text"},{name:"title",type:"text"},{name:"xwikiRelativeUrl",type:"text"}],icon:"$xwiki.getSkinFile('icons/silk/folder.gif', true)"});
isc.XWEWikiDataSource.addMethods({init:function(){this.dataURL=XWiki.constants.rest.baseRestURI+"wikis/"+this.wiki+"/spaces";
this.Super("init",arguments)
}});
isc.ClassFactory.defineClass("XWESpaceDataSource",isc.XWEDataSource);
isc.XWESpaceDataSource.addClassMethods({getOrCreate:function(A,C){var D="XWESpaceDataSource_"+A+isc.XWEDataSource.sep+C;
var B=this.get(D);
if(B==null){B=this.create({ID:D,wiki:A,space:C})
}return B
}});
isc.XWESpaceDataSource.addProperties({wiki:"xwiki",space:"Main",recordXPath:"/xwiki:pages/xwiki:pageSummary",fields:[{name:"id",required:true,type:"text",primaryKey:true},{name:"fullName",required:true,type:"text"},{name:"wiki",required:true,type:"text"},{name:"space",required:true,type:"text"},{name:"name",required:true,type:"text"},{name:"title",required:true,type:"text"},{name:"parentId",required:true,type:"text",foreignKey:"id"},{name:"parent",required:true,type:"text"},{name:"xwikiRelativeUrl",type:"text"},{name:"link",propertiesOnly:true}],icon:"$xwiki.getSkinFile('icons/silk/page_white_text.gif', true)"});
isc.XWESpaceDataSource.addMethods({init:function(){this.dataURL=XWiki.constants.rest.baseRestURI+"wikis/"+this.wiki+"/spaces/"+this.space+"/pages";
this.transformRequest=function(A){var B=this.wiki+XWiki.constants.wikiSpaceSeparator+this.space;
if(A.originalData.parentId==B||A.originalData.parentId==null){A.originalData.parentId="^(?!"+B+".).*$"
}return this.Super("transformRequest",arguments)
};
this.Super("init",arguments)
}});
isc.ClassFactory.defineClass("XWEPageDataSource",isc.XWEDataSource);
isc.XWEPageDataSource.addClassMethods({getOrCreate:function(A,D,C){var E="XWEPageDataSource_"+A+isc.XWEDataSource.sep+D+isc.XWEDataSource.sep+C;
var B=this.get(E);
if(B==null){B=this.create({ID:E,wiki:A,space:D,page:C})
}return B
}});
isc.XWEPageDataSource.addProperties({wiki:"xwiki",space:"Main",page:"WebHome",recordXPath:"/xwiki:page",fields:[{name:"id",required:true,type:"text",primaryKey:true},{name:"wiki",required:true,type:"text"},{name:"space",required:true,type:"text"},{name:"name",required:true,type:"text"},{name:"parentId",required:true,type:"text"},{name:"parent",required:true,type:"text"},{name:"link",propertiesOnly:true}],icon:"$xwiki.getSkinFile('icons/silk/page_white_text.gif', true)"});
isc.XWEPageDataSource.addMethods({init:function(){this.dataURL=XWiki.constants.rest.baseRestURI+"wikis/"+this.wiki+"/spaces/"+this.space+"/pages/"+this.page;
this.Super("init",arguments)
}});
isc.ClassFactory.defineClass("XWEAttachmentsDataSource",isc.XWEDataSource);
isc.XWEAttachmentsDataSource.addClassMethods({getOrCreate:function(A,D,C){var E="XWEAttachmentsDataSource_"+A+isc.XWEDataSource.sep+D+isc.XWEDataSource.sep+C;
var B=this.get(E);
if(B==null){B=this.create({ID:E,wiki:A,space:D,page:C})
}return B
}});
isc.XWEAttachmentsDataSource.addProperties({wiki:"xwiki",space:"Main",page:"WebHome",recordXPath:"/xwiki:attachments/xwiki:attachment",fields:[{name:"id",required:true,type:"text",primaryKey:true},{name:"name",required:true,type:"text"},{name:"title",type:"text"},{name:"xwikiRelativeUrl",type:"text"}],icon:"$xwiki.getSkinFile('icons/silk/attach.gif', true)"});
isc.XWEAttachmentsDataSource.addMethods({init:function(){this.dataURL=XWiki.constants.rest.baseRestURI+"wikis/"+this.wiki+"/spaces/"+this.space+"/pages/"+this.page+"/attachments";
this.Super("init",arguments)
}});
isc.ClassFactory.defineClass("XWETreeGrid",isc.TreeGrid);
isc.XWETreeGrid.addProperties({autoDraw:false,autoFetchData:true,nodeClick:function(C,A,B){this.nodeClickCallback(C,A,B)
},showHeader:false,folderIcon:"$xwiki.getSkinFile('icons/silk/database.gif', true)",position:"relative",dropIconSuffix:"",openIconSuffix:"",closedIconSuffix:"",animateFolders:false,wiki:XWiki.currentWiki,space:null,displaySuggest:true,defaultValue:"Main.WebHome",inputValueCache:""});
isc.XWETreeGrid.addMethods({draw:function(){if(this.Super("draw",arguments)!=null){return this
}if(typeof this.input=="undefined"&&this.input==null){this.drawInput()
}for(member in this){if(typeof member!="function"&&member.startsWith("display")){this.data[member]=this[member]
}}var A="div.listGrid td, div.listGrid table {margin:0;padding:0;} div.listGrid td {border:0;color:#333;} #actionmenu {z-index: 999999;}";
var C=document.getElementsByTagName("head")[0];
var B=document.createElement("style");
B.type="text/css";
B.media="screen";
if(B.styleSheet){B.styleSheet.cssText=A
}else{B.appendChild(document.createTextNode(A))
}C.appendChild(B)
},invalidateCache:function(){this.Super("invalidateCache",arguments);
this.inputValueCache=""
},openNode:function(A,E,B){var D={treeId:this.getID(),callback:function(){window[this.treeId].openNodesFromInput()
}};
var C=A.findById(E);
if(C!=null){if(A.isFolder(C)&&!A.isOpen(C)){if(B==true){this.getData().callbacks.dataArrived.push(D)
}A.openFolder(C);
return null
}this.selectNodeAndScroll(C);
return C
}return null
},selectNodeAndScroll:function(A){this.deselectAllRecords();
this.selectRecord(A);
nodeYPos=this.getFocusRow()*this.getRowHeight();
this.body.scrollTo(this.body.getScrollLeft(),nodeYPos)
},openParent:function(A,D){if(D.name!=""){if(A.parentMap[D.prefixedFullName]==null){var E=isc.XWEPageDataSource.getOrCreate(D.wiki,D.space,D.name);
var C=function(J,I,L,H){if(J.httpResponseCode==200){var G=XWiki.resource.get(J.data[0].parent);
var F=A.findById(G.fullName);
A.parentMap[D.prefixedFullName]=G;
if(A.findById(G.prefixedFullName)!=null){this.openNode(A,G.prefixedFullName,true)
}else{this.openParent(A,G)
}}else{if(this.displayAddPage==true){var K=this.getData().findById(D.prefixedSpace+isc.XWEResultTree.constants.addNodeSuffix);
K.resource=D;
this.selectNodeAndScroll(K)
}}}.bind(this);
E.fetchData(null,C,null)
}else{var B=A.parentMap[D.prefixedFullName];
if(A.findById(B.prefixedFullName)!=null){this.openNode(A,B.prefixedFullName,true)
}else{this.openParent(A,B)
}}}},openNodesFromInput:function(){var I=this.getDataSource().Class;
var D=XWiki.resource.get(this.input.value);
var B=XWiki.resource.get("");
var E=this.getData();
if(this.getSelectedRecord()!=null){B=this.getSelectedRecord().resource
}if(I=="XWEDataSource"){var J=this.openNode(E,D.wiki,true);
if(J==null){return 
}}if(I=="XWEDataSource"||I=="XWEWikiDataSource"){if(D.space!=B.space){this.deselectRecord(this.getSelectedRecord())
}var F=this.openNode(E,D.prefixedSpace,true);
if(F==null){return 
}}var K=this.openNode(E,D.prefixedFullName,true);
if(K==null){this.openParent(E,D)
}if(B.attachment!=D.attachment||(B.anchor!=D.anchor&&D.anchor==XWiki.constants.docextraAttachmentsAnchor)){var C=D.prefixedFullName+XWiki.constants.anchorSeparator+XWiki.constants.docextraAttachmentsAnchor;
var A=this.openNode(E,C,true);
if(A==null){return 
}var G=D.prefixedFullName+XWiki.constants.pageAttachmentSeparator+D.attachment;
var H=this.openNode(E,G,false)
}return 
},inputObserver:function(){var A=this.input.value;
if(A!=""&&A!=this.inputValueCache){this.openNodesFromInput();
this.inputValueCache=A
}setTimeout(this.inputObserver.bind(this),2000)
},drawInput:function(){var D=(this.displaySuggest==false)?"hidden":"text";
var A=this.width-6;
var B=document.createElement("input");
B.setAttribute("id",this.getID()+"_Input");
B.setAttribute("name",this.getID()+"_Input");
B.setAttribute("style","width:"+A+"px;clear:both");
B.setAttribute("type",D);
if(this.defaultValue){B.setAttribute("value",this.defaultValue)
}this.htmlElement.appendChild(B);
this.input=B;
if(this.displaySuggest){var C=function(){var F=new ajaxSuggest(this,{script:"/xwiki/rest/wikis/"+XWiki.currentWiki+"/search?scope=name&",varname:"q"});
F.setSuggestions=function(K){this.aSuggestions=[];
var H=K.responseXML;
var J=H.getElementsByTagName("searchResult");
for(var I=0;
I<J.length;
I++){var M=J[I].getElementsByTagName("id")[0].firstChild.nodeValue;
var L=J[I].getElementsByTagName("space")[0].firstChild.nodeValue;
var G=J[I].getElementsByTagName("pageName")[0].firstChild.nodeValue;
if(J[I].hasChildNodes()){this.aSuggestions.push({id:M,value:L+XWiki.constants.spacePageSeparator+G,info:""})
}}this.idAs="as_"+this.fld.id;
this.createList(this.aSuggestions)
}
};
Event.observe(B,"focus",C);
var E={treeId:this.getID(),callback:function(){window[this.treeId].inputObserver()
}};
this.getData().callbacks.dataArrived.push(E)
}else{var E={treeId:this.getID(),callback:function(){window[this.treeId].openNodesFromInput()
}};
this.getData().callbacks.dataArrived.push(E)
}},nodeClickCallback:function(C,A,B){if(A.clickCallback==null){var D=A.id;
if(!D.include(XWiki.constants.wikiSpaceSeparator)&&this.getData().getNodeDataSource(A).Class=="XWEDataSource"){D=D+XWiki.constants.wikiSpaceSeparator+"Main"+XWiki.constants.spacePageSeparator+"WebHome"
}if(!D.include(XWiki.constants.spacePageSeparator)&&this.getData().getNodeDataSource(A).Class=="XWEWikiDataSource"){D=D+XWiki.constants.spacePageSeparator+"WebHome"
}if(this.getDataSource().Class!="XWEDataSource"){D=D.substring(D.indexOf(XWiki.constants.wikiSpaceSeparator)+1,D.length)
}if(A.resource.space==XWiki.currentSpace){D=D.substring(D.indexOf(XWiki.constants.spacePageSeparator)+1,D.length)
}this.input.value=D;
this.inputValueCache=D
}else{A.clickCallback(C,A,B)
}},setValue:function(A){this.input.value=A
},getValue:function(){return this.input.value
},getSelectedResourceProperty:function(A){return XWiki.resource.get(this.getValue())[A]
},isNewPage:function(){if(this.getSelectedRecord()==null){return true
}return this.getSelectedRecord().isNewPage
},isNewAttachment:function(){return this.getSelectedRecord().isNewAttachment
}});