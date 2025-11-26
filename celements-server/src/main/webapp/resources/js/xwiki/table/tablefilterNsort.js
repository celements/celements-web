var image_path="";
var image_up="$xwiki.getSkinFile('icons/table/arrow-up.gif', true)";
var image_down="$xwiki.getSkinFile('js/xwiki/table/img/arrow-down.gif', true)";
var image_none="$xwiki.getSkinFile('js/xwiki/table/img/arrow-none.gif', true)";
var TblId,StartRow,SearchFlt,ModFn,ModFnId;
TblId=new Array(),StartRow=new Array();
ModFn=new Array(),ModFnId=new Array();
addEvent(window,"load",init_sortnfilter);
var SORT_COLUMN_INDEX;
function init_sortnfilter(){sortables_init();
filterable_init()
}function sortables_init(){if(!document.getElementsByTagName){return 
}var C=document.getElementsByTagName("table");
for(var A=0;
A<C.length;
A++){var B=C[A];
if(((" "+B.className+" ").indexOf("sortable")!=-1)&&(B.id)){ts_makeSortable(B)
}}}function filterable_init(){if(!document.getElementsByTagName){return 
}var C=document.getElementsByTagName("table");
for(var A=0;
A<C.length;
A++){var B=C[A];
if(((" "+B.className+" ").indexOf("filterable")!=-1)&&(B.id)){setFilterGrid(B.id,(getHeaderRow(B)))
}}}function ts_resortTable(R){var N,L;
for(var H=0;
H<R.childNodes.length;
H++){if(R.childNodes[H].tagName&&R.childNodes[H].tagName.toLowerCase()=="span"){N=R.childNodes[H]
}}var I=ts_getInnerText(N);
var G=R.parentNode;
var D=G.cellIndex;
var P=getParent(G,"TABLE");
if(P.rows.length<=1){return 
}var E=ts_getInnerText(P.rows[getHeaderRow(P)+1].cells[D]);
var K=getHeaderRow(P)+2;
while(!E){E=ts_getInnerText(P.rows[K].cells[D]);
K++
}if(!E){E=""
}var C=ts_sort_caseinsensitive;
if(E.match(/^\d\d[\/-]\d\d[\/-]\d\d\d\d$/)){C=ts_sort_date
}if(E.match(/^\d\d[\/-]\d\d[\/-]\d\d$/)){C=ts_sort_date
}if(E.match(/^[�$�?��]/)){C=ts_sort_currency
}if(E.match(/^[\d\.]+$/)){C=ts_sort_numeric
}SORT_COLUMN_INDEX=D;
var B=new Array();
var Q=new Array();
var J=new Array();
var F=null!=getSortBottomRow(P)?(getSortBottomRow(P)+1):P.rows.length;
for(var M=F;
M<P.rows.length;
M++){J[J.length]=P.rows[M]
}for(var M=getHeaderRow(P)+1;
M<P.rows.length;
M++){Q[Q.length]=P.rows[M]
}Q.sort(C);
if(N.getAttribute("sortdir")=="down"){L='<img border="0" src="'+image_path+image_up+'" alt="&uarr;"/>';
Q.reverse();
N.setAttribute("sortdir","up")
}else{L='<img border="0" src="'+image_path+image_down+'" alt="&darr;"/>';
N.setAttribute("sortdir","down")
}for(var O=0;
O<Q.length;
O++){if(!Q[O].className||(Q[O].className&&(Q[O].className.indexOf("sortBottom")==-1))){P.tBodies[0].appendChild(Q[O])
}}for(var O=0;
O<Q.length;
O++){if(Q[O].className&&(Q[O].className.indexOf("sortBottom")!=-1)){P.tBodies[0].appendChild(Q[O])
}}for(var O=0;
O<J.length;
O++){P.tBodies[0].appendChild(J[O])
}var A=document.getElementsByTagName("span");
for(var H=0;
H<A.length;
H++){if(A[H].className=="sortarrow"){if(getParent(A[H],"table")==getParent(R,"table")){A[H].innerHTML='<img border="0" src="'+image_path+image_none+'" alt="&darr;"/>'
}}}N.innerHTML=L;
alternate(P)
}function Filter(J){getFilters(J);
var H=document.getElementById(J);
var O=new Array();
var M=getCellsNb(J);
var L=1;
for(var Q=0;
Q<SearchFlt.length;
++Q){O.push((document.getElementById(SearchFlt[Q]).value).toLowerCase())
}var F=getStartRow(J);
var D=H.getElementsByTagName("tr");
var C=null!=getSortBottomRow(H)?getSortBottomRow(H):H.rows.length;
for(var N=F;
N<D.length;
N++){var A=true;
if(D[N].style.display=="none"){D[N].style.display=""
}var B=getChildElms(D[N]).childNodes;
var K=B.length;
if(K==M){var S=new Array();
var I=new Array();
for(var P=0;
P<K;
P++){var E=getCellText(B[P]).toLowerCase();
S.push(E);
if(O[P]!=""){var R=parseFloat(E);
if(/<=/.test(O[P])&&!isNaN(R)){R<=parseFloat(O[P].replace(/<=/,""))?I[P]=3:I[P]=1
}else{if(/>=/.test(O[P])&&!isNaN(R)){R>=parseFloat(O[P].replace(/>=/,""))?I[P]=3:I[P]=1
}else{if(/</.test(O[P])&&!isNaN(R)){R<parseFloat(O[P].replace(/</,""))?I[P]=3:I[P]=1
}else{if(/>/.test(O[P])&&!isNaN(R)){R>parseFloat(O[P].replace(/>/,""))?I[P]=3:I[P]=1
}else{I[P]=E.split(O[P]).length
}}}}}}for(var G=0;
G<M;
G++){if(O[G]!=""&&I[G]<2){A=false
}}}if(A==false&&N<C){D[N].style.display="none"
}else{D[N].style.display=""
}}alternate(H)
}function getHeaderRow(B){for(var A=0;
A<B.rows.length-1;
A++){if(B.rows[A].className.indexOf("sortHeader")>-1){return A
}}return 0
}function getSortBottomRow(B){for(var A=0;
A<B.rows.length;
A++){if(B.rows[A].className.indexOf("sortBottom")>-1){return A
}}return null
}function ts_getInnerText(D){if(typeof D=="string"){return D
}if(typeof D=="undefined"){return""
}if(typeof D=="object"&&D.tagName.toLowerCase()=="img"){return D.alt
}if(D.innerText){return D.innerText
}var E="";
var C=D.childNodes;
var A=C.length;
for(var B=0;
B<A;
B++){switch(C[B].nodeType){case 1:E+=ts_getInnerText(C[B]);
break;
case 3:E+=C[B].nodeValue;
break
}}return E
}function ts_makeSortable(D){var E;
if(D.rows&&D.rows.length>0){E=D.rows[getHeaderRow(D)]
}if(!E){return 
}for(var C=0;
C<E.cells.length;
C++){var B=E.cells[C];
var A=ts_getInnerText(B);
if(B.className!="unsortable"&&B.className.indexOf("unsortable")==-1){B.innerHTML='<a href="#" class="sortHeader" onclick="ts_resortTable(this);return false;">'+A+'<span class="sortarrow"><img border="0" src="'+image_path+image_none+'" alt="&darr;"/></span></a>'
}}alternate(D)
}function alternate(F){if(F.className.indexOf("doOddEven")>-1){var G=1;
var A=null!=getSortBottomRow(F)?getSortBottomRow(F):F.rows.length;
var D=F.getElementsByTagName("tbody");
for(var C=0;
C<D.length;
C++){var E=D[C].getElementsByTagName("tr");
for(var B=getHeaderRow(F)+1;
B<A;
B++){if(E[B].style.display==""){G++;
swapOddEven(E[B],G)
}}}}}function getParent(B,A){if(B==null){return null
}else{if(B.nodeType==1&&B.tagName.toLowerCase()==A.toLowerCase()){return B
}else{return getParent(B.parentNode,A)
}}}function addEvent(E,D,B,A){if(E.addEventListener){E.addEventListener(D,B,A);
return true
}else{if(E.attachEvent){var C=E.attachEvent("on"+D,B);
return C
}else{alert("Handler could not be removed")
}}}function replace(D,C,A){var B=D.indexOf(C);
var E="";
if(B==-1){return D
}E+=D.substring(0,B)+A;
if(B+C.length<D.length){E+=replace(D.substring(B+C.length,D.length),C,A)
}return E
}function setFilterGrid(G){var E=document.getElementById(G);
var F,D;
if(E!=null&&E.nodeName.toLowerCase()=="table"){TblId.push(G);
if(arguments.length>1){for(var B=0;
B<arguments.length;
B++){var A=typeof arguments[B];
switch(A.toLowerCase()){case"number":F=arguments[B];
break;
case"object":D=arguments[B];
break
}}}F==undefined?StartRow.push(2):StartRow.push(F+2);
var C=getCellsNb(G,F);
AddRow(G,C,D)
}}function AddRow(C,G,J){var P=document.getElementById(C);
var M=P.insertRow(0);
var A=P.rows[getHeaderRow(P)];
var K,Q,F,L,O;
J!=undefined&&J.btn==false?Q=false:Q=true;
J!=undefined&&J.btn_text!=undefined?F=J.btn_text:F="Filter";
J!=undefined&&J.enter_key==false?L=false:L=true;
J!=undefined&&J.mod_filter_fn?O=true:O=false;
if(O){ModFnId.push(C);
ModFn.push(J.mod_filter_fn)
}for(var I=0;
I<G;
I++){var E=M.insertCell(I);
var H=A.cells[I];
I==G-1&&Q==true?K="flt_s":K="flt";
if((J==undefined||J["col_"+I]==undefined||J["col_"+I]=="none")&&H.className.indexOf("selectFilter")==-1){var N=document.createElement("input");
N.setAttribute("id","flt"+I+"_"+C);
N.setAttribute("size","5");
if(H.className.indexOf("noFilter")==-1){N.setAttribute("type","text")
}else{N.setAttribute("type","hidden")
}N.className=K;
E.appendChild(N);
if(L){N.onkeypress=DetectKey
}}else{if(H.className.indexOf("selectFilter")!=-1){var B=document.createElement("select");
B.setAttribute("id","flt"+I+"_"+C);
B.className=K;
E.appendChild(B);
PopulateOptions(C,I,G);
if(L){B.onkeypress=DetectKey
}}}if(I==G-1&&Q==true){var D=document.createElement("input");
D.setAttribute("id","btn"+I+"_"+C);
D.setAttribute("type","button");
D.setAttribute("value",F);
D.className="btnflt";
E.appendChild(D);
(!O)?D.onclick=function(){Filter(C)
}:D.onclick=J.mod_filter_fn
}}}function PopulateOptions(B,J,I){var M=document.getElementById(B);
var K=getStartRow(B);
var N=M.getElementsByTagName("tr");
var F=new Array();
var H=0;
for(var D=K;
D<N.length;
D++){var L=getChildElms(N[D]).childNodes;
var C=L.length;
if(C==I){for(var E=0;
E<C;
E++){if(J==E){var G=getCellText(L[E]);
if(F.toString().toUpperCase().search(G.toUpperCase())==-1){H++;
F.push(G);
var A=new Option(G,G,false,false);
document.getElementById("flt"+J+"_"+B).options[H]=A
}}}}}}function getCellsNb(E,C){var A=document.getElementById(E);
var B;
if(C==undefined){B=A.getElementsByTagName("tr")[0]
}else{B=A.getElementsByTagName("tr")[C]
}var D=getChildElms(B);
return D.childNodes.length
}function getFilters(E){SearchFlt=new Array();
var B=document.getElementById(E);
var C=B.getElementsByTagName("tr")[0];
var D=C.childNodes;
for(var A=0;
A<D.length;
A++){SearchFlt.push(D[A].firstChild.getAttribute("id"))
}}function getStartRow(C){var B;
for(var A in TblId){if(TblId[A]==C){B=StartRow[A]
}}return B
}function getChildElms(D){if(D.nodeType==1){var C=D.childNodes;
for(var A=0;
A<C.length;
A++){var B=C[A];
if(B.nodeType==3){D.removeChild(B)
}}return D
}}function getCellText(E){var B="";
var D=E.childNodes;
for(var A=0;
A<D.length;
A++){var C=D[A];
if(C.nodeType==3){B+=C.data
}else{B+=getCellText(C)
}}return B
}function DetectKey(G){var A=(G)?G:(window.event)?window.event:null;
if(A){var D=(A.charCode)?A.charCode:((A.keyCode)?A.keyCode:((A.which)?A.which:0));
if(D=="13"){var H,E,B,F;
H=this.getAttribute("id");
E=this.getAttribute("id").split("_")[0];
B=H.substring(E.length+1,H.length);
for(var C in ModFn){ModFnId[C]==B?F=true:F=false
}(F)?ModFn[C].call():Filter(B)
}}}function swapOddEven(B,A){if((A%2)==0){if((B.className.indexOf("odd")>-1)){B.className=replace(B.className,"odd","even")
}else{B.className=B.className.indexOf("even")>-1?B.className:B.className+" even"
}}else{if((B.className.indexOf("even")>-1)){B.className=replace(B.className,"even","odd")
}B.className=B.className.indexOf("odd")>-1?B.className:B.className+" odd"
}}function ts_sort_date(C,A){var F=ts_getInnerText(C.cells[SORT_COLUMN_INDEX]);
var G=ts_getInnerText(A.cells[SORT_COLUMN_INDEX]);
var D,E,B;
if(F.length==10){D=F.substr(6,4)+F.substr(3,2)+F.substr(0,2)
}else{E=F.substr(6,2);
if(parseInt(E)<50){E="20"+E
}else{E="19"+E
}D=E+F.substr(3,2)+F.substr(0,2)
}if(G.length==10){B=G.substr(6,4)+G.substr(3,2)+G.substr(0,2)
}else{E=G.substr(6,2);
if(parseInt(E)<50){E="20"+E
}else{E="19"+E
}B=E+G.substr(3,2)+G.substr(0,2)
}if(D==B){return 0
}if(D<B){return -1
}return 1
}function ts_sort_currency(B,A){var C=ts_getInnerText(B.cells[SORT_COLUMN_INDEX]).replace(/[^0-9.]/g,"");
var D=ts_getInnerText(A.cells[SORT_COLUMN_INDEX]).replace(/[^0-9.]/g,"");
return isNaN(parseFloat(C)-parseFloat(D))?-1:parseFloat(C)-parseFloat(D)
}function ts_sort_numeric(B,A){var C=parseFloat(ts_getInnerText(B.cells[SORT_COLUMN_INDEX]));
var D=parseFloat(ts_getInnerText(A.cells[SORT_COLUMN_INDEX]));
if(isNaN(C)){C=0
}if(isNaN(D)){D=0
}return C-D
}function ts_sort_caseinsensitive(B,A){var C=ts_getInnerText(B.cells[SORT_COLUMN_INDEX]).toLowerCase();
var D=ts_getInnerText(A.cells[SORT_COLUMN_INDEX]).toLowerCase();
if(C==D){return 0
}if(C<D){return -1
}return 1
}function ts_sort_default(B,A){var C=ts_getInnerText(B.cells[SORT_COLUMN_INDEX]);
var D=ts_getInnerText(A.cells[SORT_COLUMN_INDEX]);
if(C==D){return 0
}if(C<D){return -1
}return 1
};