/*
**  PROCOLOR LICENSE
**  ----------------
**
**  Redistribution and use in source and binary forms, with or without
**  modification, are permitted provided that the following conditions are met:
**
**    * Redistributions of source code must retain the above copyright
**       notice, this list of conditions and the following disclaimer.
**
**    * Redistributions in binary form must reproduce the above copyright
**       notice, this list of conditions and the following disclaimer in the
**       documentation and/or other materials provided with the distribution.
**
**  THIS SOFTWARE IS PROVIDED BY THE PHANTOM INKER AND CONTRIBUTORS "AS IS"
**  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
**  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
**  ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
**  LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
**  CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
**  SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
**  INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
**  CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
**  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
**  THE POSSIBILITY OF SUCH DAMAGE.
*/
if(typeof Prototype=="undefined"){alert("ProColor Error:  Prototype is not loaded. Please make sure that your page includes prototype.js before it includes procolor.js.")
}if(Prototype.Version<"1.6"){alert("ProColor Error:  Minimum Prototype 1.6.0 is required; you are using "+Prototype.Version)
}Element.addMethods({build:function(B,D,A,C){var E=$(document.createElement(D));
$H(A).each(function(F){E[F.key]=F.value
});
if(C){E.setStyle(C)
}B.appendChild(E);
return E
},isEventIn:function(B,C){var E=B.getDimensions();
var D=B.cumulativeOffset();
var A=C.pointerX(),F=C.pointerY();
return(A>=D.left&&F>=D.top&&A<D.left+E.width&&F<D.top+E.height)
}});
var MouseCapture=Class.create({initialize:function(){},onEvent:function(A,B){if(B&&A.type!="mouseover"&&A.type!="mouseout"){B(A,A.type)
}A.stop()
},setCursor:function(A){if(this.div){this.div.setStyle({cursor:A})
}},begin:function(C){this.listener=this.onEvent.bindAsEventListener(this,C);
Event.observe(document,"mouseup",this.listener);
Event.observe(document,"mousemove",this.listener);
Event.observe(document,"mousedown",this.listener);
Event.observe(document,"mouseover",this.listener);
Event.observe(document,"mouseout",this.listener);
Event.observe(document,"keyup",this.listener);
Event.observe(document,"keydown",this.listener);
this.old_body_ondrag=document.body.ondrag;
this.old_body_onselectstart=document.body.onselectstart;
document.body.ondrag=function(){return false
};
document.body.onselectstart=function(){return false
};
var A=Element.extend(document.body);
var B=A.getDimensions();
this.div=A.build("div",{},{display:"block",position:"absolute",top:"0px",left:"0px",width:B.width+"px",height:B.height+"px",zIndex:999999999,cursor:"default",backgroundColor:"#FFFFFF",opacity:0.0001})
},end:function(){this.div.remove();
Event.stopObserving(document,"mouseup",this.listener);
Event.stopObserving(document,"mousemove",this.listener);
Event.stopObserving(document,"mousedown",this.listener);
Event.stopObserving(document,"mouseover",this.listener);
Event.stopObserving(document,"mouseout",this.listener);
Event.stopObserving(document,"keyup",this.listener);
Event.stopObserving(document,"keydown",this.listener);
document.body.ondrag=this.old_body_ondrag;
document.body.onselectstart=this.old_body_onselectstart;
delete this.old_body_ondrag;
delete this.old_body_onselectstart
}});
var ProColor=Class.create({palette:["F00C30900633963C63","FC9FC0C93F93F96F60","993CC3FF0FF6FF9FFC","3306639966939C39C6","0F09C99F9CFCCF69F0","3C36960630933C6396","6999CC9FF0FF6FC3C9","36603303936F69F0CF","00666C00F66F99FCCF","C9F90F60C63F30930C","96CC6FC3F90C639306","C9C969C6CF9F909606","F0FF9CC69F39F69F06","F66F99FCC936C36C39"],options:{imgPath:"#set($imgPath = $xwiki.getSkinFile('uicomponents/widgets/colorpicker/img/procolor_win_bg.png', true))#set($imgPath = $imgPath.substring(0, $imgPath.lastIndexOf('bg.png')))${imgPath}",showInField:true},initialize:function(A){var C=navigator.appVersion.split("MSIE");
var D=parseFloat(C[1]);
this.old_ie=(D>=5.5&&D<7&&document.body.filters);
this.div=null;
this.color=null;
this.listeners={};
this.dblclk={time:0};
if(A.parent){this.parent=$(A.parent)
}else{this.parent=Element.extend(document.body)
}if(A.input){this.input=$(A.input)
}else{this.input=null
}this.options={mode:"static",width:360,height:192,offsetx:13,offsety:8,input:null,showInField:false,parent:null,closeButton:(A.mode=="popup"),imgPath:"",color:(!this.input?"#FFFFFF":this.input.tagName=="INPUT"?this.input.value:this.input.innerHTML),editbg:"#FFFFFF",edittext:"#4C4C4C",outputFormat:"#{RR}{GG}{BB}",onOpening:null,onOpened:null,onClosing:null,onClosed:null,onCloseButton:null,onChanging:null,onChanged:null,onCancelClick:null,onAcceptClick:null};
for(var B in A){this.options[B]=A[B]
}if(this.options.onOpening){this.options.onOpening(this,"opening")
}this.createDiv();
if(this.options.mode=="popup"){this.positionPopup();
Event.observe(document,"mousedown",this.closeClickHandler=this.handleCloseClick.bindAsEventListener(this));
Event.observe(document,"keypress",this.keyPressHandler=this.handleKeyPress.bindAsEventListener(this))
}if(this.options.onOpened){this.options.onOpened(this,"opened")
}},positionPopup:function(){var I=this.div.cumulativeOffset(),K=I[0],H=I[1];
var C=this.div.getDimensions(),M=C.height,B=C.width;
var D=document.viewport.getHeight(),N=document.viewport.getWidth();
var Q=document.viewport.getScrollOffsets();
var O=$(this.input).cumulativeOffset(),F=O[1],P=O[0];
var G=$(this.input).getDimensions().height,J=F+G;
if(P+B>N-8){P=N-8-B
}if(P<8){P=8
}var L=(J+M>Q.top+D)&&(J-M>Q.top);
var A=P.toString()+"px";
var E=(L?(F-M):(F+G)).toString()+"px";
this.div.style.left=A;
this.div.style.top=E;
this.div.setStyle({visibility:"",display:"block"})
},createDiv:function(){var B={display:"block",width:this.options.width+"px",height:this.options.height+"px",backgroundPosition:"0% 0%",backgroundAttachment:"scroll",backgroundRepeat:"no-repeat",backgroundImage:"url("+this.options.imgPath+(this.old_ie?"bg.gif)":"bg.png)"),color:"#BBBBD7",left:0,top:0};
if(this.options.mode=="popup"){B.position="absolute";
B.display="none";
B.visibility="hidden";
B.zIndex=999999
}else{B.position="relative"
}this.div=$(this.parent).build("div",{className:"procolor_box"},B);
this.img_palette=this.loadBgImage(this.div,"palette_raw.png",0,1,66,174);
this.img_bar_lower=this.loadBgImage(this.div,"bars.png",77,1,20,174,{zIndex:1,opacity:1});
this.img_bar_middle=this.loadBgImage(this.div,"bars.png",77,1,20,174,{zIndex:2,opacity:0});
this.img_bar_upper=this.loadBgImage(this.div,"bars.png",77,1,20,174,{zIndex:3,opacity:0});
this.img_wheel_rgb=this.loadBgImage(this.div,"wheel_rgb.jpg",105,0,176,176,{zIndex:1,opacity:1});
this.img_wheel_black=this.loadBgImage(this.div,"wheel_black.png",105,0,176,176,{zIndex:2,opacity:1});
this.img_boxes=this.loadBgImage(this.div,"boxes.png",287,25,50,149,{zIndex:1});
this.img_bar_dragger=this.createImageButton(this.div,"sel_rect",73+this.options.offsetx,-1+this.options.offsety,24,8,{zIndex:4});
this.img_wheel_dragger=this.createImageButton(this.div,"sel_circle",184+this.options.offsetx,79+this.options.offsety,17,17,{zIndex:5});
this.listeners.wheel=this.onWheelEvent.bindAsEventListener(this);
this.img_wheel_black.observe("mousedown",this.listeners.wheel);
this.img_wheel_dragger.observe("mousedown",this.listeners.wheel);
this.img_wheel_dragger.observe("keydown",this.listeners.wheel);
this.listeners.bar=this.onBarEvent.bindAsEventListener(this);
this.img_bar_upper.observe("mousedown",this.listeners.bar);
this.img_bar_dragger.observe("mousedown",this.listeners.bar);
this.img_bar_dragger.observe("keydown",this.listeners.bar);
this.listeners.palette=this.onPaletteEvent.bindAsEventListener(this);
this.img_palette.observe("mousedown",this.listeners.palette);
this.wheel={left:106+this.options.offsetx,top:1+this.options.offsety,width:174,height:174};
this.bar={left:77+this.options.offsetx,top:2+this.options.offsety,width:20,height:172};
this.wheelsel={width:17,height:17};
this.barsel={width:24,height:8};
this.listeners.rgb=this.onNumberBox.bindAsEventListener(this,"rgb",0,255,0);
this.r_edit=this.createEdit(this.div,287,25,37,20,this.listeners.rgb);
this.g_edit=this.createEdit(this.div,287,47,37,20,this.listeners.rgb);
this.b_edit=this.createEdit(this.div,287,69,37,20,this.listeners.rgb);
this.listeners.hue=this.onNumberBox.bindAsEventListener(this,"hsb",0,359,360);
this.listeners.satbrt=this.onNumberBox.bindAsEventListener(this,"hsb",0,100,0);
this.hue_edit=this.createEdit(this.div,287,110,37,20,this.listeners.hue);
this.sat_edit=this.createEdit(this.div,287,132,37,20,this.listeners.satbrt);
this.brt_edit=this.createEdit(this.div,287,154,37,20,this.listeners.satbrt);
if(this.options.closeButton){this.img_close=this.createImageButton(this.div,"close",this.options.width-40,0,24,16);
this.listeners.close=this.onCloseEvent.bindAsEventListener(this);
this.img_close.observe("mouseover",this.listeners.close);
this.img_close.observe("mouseout",this.listeners.close);
this.img_close.observe("mousedown",this.listeners.close);
this.img_close.observe("keydown",this.listeners.close);
this.img_close.trackingMouse=false
}if(this.input&&this.input.tagName=="INPUT"){this.listeners.input=this.onInput.bindAsEventListener(this);
this.input.observe("keyup",this.listeners.input);
this.input.observe("focus",this.listeners.input);
this.input.observe("blur",this.listeners.input)
}else{this.listeners.input=null
}var A=this.decodeHexColor(this.options.color);
if(!A){A={r:0,g:0,b:0}
}this.update("rgb",A,[])
},loadBgImage:function(G,A,F,E,H,D,I){var B={display:"block",position:"absolute",width:H+"px",height:D+"px",left:F+this.options.offsetx+"px",top:E+this.options.offsety+"px",padding:"0",backgroundImage:"url("+this.options.imgPath+A+")"};
if(I){for(var C in I){B[C]=I[C]
}}return G.build("div",{},B)
},createImageButton:function(H,A,G,F,I,E,J){var B={display:"block",position:"absolute",width:I+"px",height:E+"px",left:G+"px",top:F+"px",border:"0",cursor:"default",padding:"0",fontSize:"1px",backgroundImage:"url("+this.options.imgPath+A+(this.old_ie?".gif)":".png)")};
if(J){for(var D in J){B[D]=J[D]
}}var C=H.build("a",{href:"#"},B);
return C
},createEdit:function(F,A,H,B,E,G){A+=5;
B-=9;
H+=2;
E-=6;
var D={display:"inline",position:"absolute",width:B+"px",height:E+"px",left:A+this.options.offsetx+"px",top:H+this.options.offsety+"px",verticalAlign:"top",backgroundColor:this.options.editbg,padding:"0",color:this.options.edittext,fontFamily:"Verdana,Tahoma,Arial,sans-serif,sans serif,sans",fontSize:"12px",fontStyle:"Normal",fontVariant:"Normal",fontWeight:"Normal",textAlign:"right",direction:"ltr",border:0,zIndex:10};
var C=F.build("input",{type:"text",value:"0",maxLength:3},D);
C.observe("keypress",G);
C.observe("keyup",G);
C.observe("focus",G);
C.observe("blur",G);
return C
},close:function(){if(!this.div){return false
}if(this.options.onClosing){this.options.onClosing(this,"closing")
}if(this.options.closeButton){Event.stopObserving(this.img_close)
}Event.stopObserving(this.r_edit);
Event.stopObserving(this.g_edit);
Event.stopObserving(this.b_edit);
Event.stopObserving(this.hue_edit);
Event.stopObserving(this.sat_edit);
Event.stopObserving(this.brt_edit);
Event.stopObserving(this.img_wheel_black);
Event.stopObserving(this.img_bar_upper);
Event.stopObserving(this.img_palette);
Event.stopObserving(this.img_wheel_dragger);
Event.stopObserving(this.img_bar_dragger);
if(this.listeners.input){Event.stopObserving(this.input,"keyup",this.listeners.input);
Event.stopObserving(this.input,"focus",this.listeners.input);
Event.stopObserving(this.input,"blur",this.listeners.input)
}Event.stopObserving(document,"mousedown",this.closeClickHandler);
Event.stopObserving(document,"keypress",this.keyPressHandler);
this.div.remove();
this.div=null;
this.listeners={};
this.dblclk={};
if(this.input.type!="hidden"&&!this.input.disabled){this.input.focus()
}if(this.options.onClosed){this.options.onClosed(this,"closed")
}},updateState:{},updateTimeout:false,queuedUpdate:function(D,A,B){if(!Prototype.Browser.IE){this.update(D,A,B)
}else{var C=this;
C.updateState={mode:D,color:A,sources:B};
if(C.updateTimeout==false){C.updateTimeout=setTimeout(function(){C.updateTimeout=false;
C.update(C.updateState.mode,C.updateState.color,C.updateState.sources)
},25)
}}},finalUpdate:function(){if(this.updateTimeout){clearTimeout(this.updateTimeout);
this.updateTimeout=false;
this.update(this.updateState.mode,this.updateState.color,this.updateState.sources);
this.updateState={}
}},update:function(I,F,A){if(typeof (F)!="object"){F={r:0,g:0,b:0,hue:0,sat:0,brt:0}
}F.r=this.toNumber(F.r);
F.g=this.toNumber(F.g);
F.b=this.toNumber(F.b);
F.hue=this.toNumber(F.hue);
F.sat=this.toNumber(F.sat);
F.brt=this.toNumber(F.brt);
var K,G;
if(I=="rgb"){K=F;
G=this.RGBtoHSB(K)
}else{if(I=="hsb"){G=F;
K=this.HSBtoRGB(G)
}}if(K.r<0){K.r=0
}if(K.r>255){K.r=255
}if(K.g<0){K.g=0
}if(K.g>255){K.g=255
}if(K.b<0){K.b=0
}if(K.b>255){K.b=255
}G.hue=G.hue%360;
if(G.hue<0){G.hue+=360
}if(G.sat<0){G.sat=0
}if(G.sat>100){G.sat=100
}if(G.brt<0){G.brt=0
}if(G.brt>100){G.brt=100
}source={};
A.each(function(R){source[R]=true
});
var P=this;
if(!source.wheel){var B=G.brt/100;
if(B>0.9999){B=0.9999
}P.img_wheel_black.setOpacity(1-B);
var C=((G.hue+270)%360)*(Math.PI*2/360);
var J=Math.cos(C);
var Q=Math.sin(C);
var N=Math.floor(J*G.sat*P.wheel.width/200+0.5)+P.wheel.left+((P.wheel.width-4)/2)+2;
var L=Math.floor(Q*G.sat*P.wheel.height/200+0.5)+P.wheel.top+((P.wheel.height-4)/2)+2;
P.img_wheel_dragger.setStyle({left:N-Math.floor(P.wheelsel.width/2)+"px",top:L-Math.floor(P.wheelsel.height/2)+"px"})
}if(!source.bar){var E=Math.floor(G.hue/60);
var H=(E+1)%6;
P.img_bar_lower.setStyle({backgroundPosition:(-E*20-20)+"px 0px"});
P.img_bar_middle.setStyle({backgroundPosition:(-H*20-20)+"px 0px"});
P.img_bar_middle.setOpacity((G.hue-E*60)/60);
var B=(100-G.sat)/100;
if(B<0.0001){B=0.0001
}P.img_bar_upper.setOpacity(B);
P.img_bar_dragger.setStyle({top:P.bar.top-Math.floor(P.barsel.height/2)+Math.floor((100-G.brt)*P.bar.height/100+0.5)+"px",left:P.bar.left+Math.floor(P.bar.width-P.barsel.width)/2+"px"})
}K.r=Math.floor(K.r+0.5);
K.g=Math.floor(K.g+0.5);
K.b=Math.floor(K.b+0.5);
G.hue=Math.floor(G.hue+0.5);
G.sat=Math.floor(G.sat+0.5);
G.brt=Math.floor(G.brt+0.5);
G.hue=G.hue%360;
this.color="#"+(K.r.toColorPart()+K.g.toColorPart()+K.b.toColorPart()).toUpperCase();
if(!source.rgb){this.r_edit.value=K.r;
this.g_edit.value=K.g;
this.b_edit.value=K.b
}if(!source.hsb){this.hue_edit.value=G.hue;
this.sat_edit.value=G.sat;
this.brt_edit.value=G.brt
}if(this.options.input){var M=$(this.options.input);
if(!source.input){var O=this.internalFormatOutput(K,G,this.options.outputFormat);
if(M.tagName=="INPUT"){M.value=O
}else{M.innerHTML=O
}}if(this.options.showInField){var D=this.computeTextColor(K);
M.setStyle({backgroundColor:this.color,color:"#"+D.r.toColorPart()+D.g.toColorPart()+D.b.toColorPart()})
}}},toNumber:function(A){switch(typeof A){case"number":return A;
case"string":if(matches=/^[^0-9.+-]*([+-]?(?:[0-9]*\.[0-9]+|[0-9]+(?:\.[0-9]*)?))(?:[^0-9]|$)/.exec(A)){return Number(matches[1])
}else{return 0
}case"boolean":return A?1:0;
case"object":return A?1:0;
case"function":return 1;
default:case"undefined":return 0
}},formatOutput:function(B,C){if(!C){C="#{RR}{GG}{BB}"
}var A=this.decodeHexColor(B);
if(!A){A={r:0,g:0,b:0}
}return this.internalFormatOutput(A,this.RGBtoHSB(A),C)
},internalFormatOutput:function(C,A,E){var D=E.match(/(\{\w+\}|[^{]+)/g);
var B="";
D.each(function(G){var F;
switch(G){case"{RR}":F=C.r.toColorPart().toUpperCase();
break;
case"{GG}":F=C.g.toColorPart().toUpperCase();
break;
case"{BB}":F=C.b.toColorPart().toUpperCase();
break;
case"{rr}":F=C.r.toColorPart().toLowerCase();
break;
case"{gg}":F=C.g.toColorPart().toLowerCase();
break;
case"{bb}":F=C.b.toColorPart().toLowerCase();
break;
case"{R}":F=this.halfColorPart(C.r).toUpperCase();
break;
case"{G}":F=this.halfColorPart(C.g).toUpperCase();
break;
case"{B}":F=this.halfColorPart(C.b).toUpperCase();
break;
case"{r}":F=this.halfColorPart(C.r).toLowerCase();
break;
case"{g}":F=this.halfColorPart(C.g).toLowerCase();
break;
case"{b}":F=this.halfColorPart(C.b).toLowerCase();
break;
case"{red}":F=C.r.toString();
break;
case"{grn}":F=C.g.toString();
break;
case"{blu}":F=C.b.toString();
break;
case"{hue}":F=A.hue.toString();
break;
case"{sat}":F=A.sat.toString();
break;
case"{brt}":F=A.brt.toString();
break;
default:F=G;
break
}B+=F
});
return B
},halfColorPart:function(A){return Math.floor((A+8)/17).toString(16)
},decodeHexColor:function(B){var E;
if(E=/^[^0-9A-Fa-f]*([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{0,2})(?:[^0-9A-Fa-f]|$)/.exec(B)){return{r:parseInt(E[1],16),g:parseInt(E[2],16),b:parseInt(E[3],16)}
}if(E=/^[^0-9A-Fa-f]*([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f])(?:[^0-9A-Fa-f]|$)/.exec(B)){var A=parseInt(E[3],16);
return{r:parseInt(E[1],16),g:parseInt(E[2],16),b:A*16+A}
}if(E=/^[^0-9A-Fa-f]*([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})(?:[^0-9A-Fa-f]|$)/.exec(B)){var D=parseInt(E[2],16);
return{r:parseInt(E[1],16),g:D,b:D}
}if(E=/^[^0-9A-Fa-f]*([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f]{0,2})(?:[^0-9A-Fa-f]|$)/.exec(B)){var C=parseInt(E[1],16);
var D=parseInt(E[2],16);
var A=parseInt(E[3],16);
return{r:C*16+C,g:D*16+D,b:A*16+A}
}if(E=/^[^0-9A-Fa-f]*([0-9A-Fa-f]{2})(?:[^0-9A-Fa-f]|$)/.exec(B)){var D=parseInt(E[1],16);
return{r:D,g:D,b:D}
}if(E=/^[^0-9A-Fa-f]*([0-9A-Fa-f])(?:[^0-9A-Fa-f]|$)/.exec(B)){var D=parseInt(E[1],16);
D=D*16+D;
return{r:D,g:D,b:D}
}return false
},trueBrightness:function(A){return(A.r/255*0.3)+(A.g/255*0.59)+(A.b/255*0.11)
},computeTextColor:function(C){var D=this.trueBrightness(C);
if(D<0.5){var A=Math.floor(D*20)+3;
var B=255*(A-1)
}else{var A=Math.floor((1-D)*20)+3;
var B=0
}return{r:Math.floor((C.r+B)/A),g:Math.floor((C.g+B)/A),b:Math.floor((C.b+B)/A)}
},RGBtoHSB:function(E){var A=Math.floor(this.toNumber(E.r)+0.5);
var D=Math.floor(this.toNumber(E.g)+0.5);
var F=Math.floor(this.toNumber(E.b)+0.5);
if(A<0){A=0
}if(A>255){A=255
}if(D<0){D=0
}if(D>255){D=255
}if(F<0){F=0
}if(F>255){F=255
}var G,J,H,B;
var C=A,K=D,I=F;
if(A>D){if(A>F){I=G=A,B=0,H=D-F
}else{I=G=F,B=240,H=A-D
}J=G-((D<F)?D:F)
}else{if(D>F){I=G=D,B=120,H=F-A
}else{I=G=F,B=240,H=A-D
}J=G-((A<F)?A:F)
}if(G!=0){K=Math.floor((J*100)/G+0.5)
}else{K=0
}if(K!=0){C=(B+Math.floor(H*120/(J*2)+0.5))%360;
if(C<0){C+=360
}}else{C=0
}I=Math.floor(I*100/255+0.5);
return{hue:C,sat:K,brt:I}
},HSBtoRGB:function(C){var G=this.toNumber(C.brt);
if(G<0){G=0
}if(G>100){G=100
}G=G*255/100;
var I=this.toNumber(C.sat);
if(I<=0){G=Math.floor(G+0.5);
return{r:G,g:G,b:G}
}if(I>100){I=100
}var D=this.toNumber(C.hue);
D=D%360;
if(D<0){D+=360
}var H=G*I/100;
var B=(H*((D*256/60)%256))/256;
var A,E,F;
switch(Math.floor(D/60)){case 0:A=G;
E=G-H+B;
F=G-H;
break;
case 1:A=G-B;
E=G;
F=G-H;
break;
case 2:A=G-H;
E=G;
F=G-H+B;
break;
case 3:A=G-H;
E=G-B;
F=G;
break;
case 4:A=G-H+B;
E=G-H;
F=G;
break;
case 5:A=G;
E=G-H;
F=G-B;
break
}A=Math.floor(A+0.5);
E=Math.floor(E+0.5);
F=Math.floor(F+0.5);
if(A<0){A=0
}if(A>255){A=255
}if(E<0){E=0
}if(E>255){E=255
}if(F<0){F=0
}if(F>255){F=255
}return{r:A,g:E,b:F}
},acceptAndClose:function(){if(this.options.onAcceptClick){this.options.onAcceptClick(this,"acceptclick")
}if(this.options.mode=="popup"){this.close()
}},cancelAndClose:function(){if(this.options.onCancelClick){this.options.onCancelClick(this,"cancelclick")
}if(this.options.mode=="popup"){this.close()
}},closeOnDoubleClick:function(D){var A=D.pointerX(),E=D.pointerY();
var B=new Date;
var C=B.getTime();
if(Math.abs(this.dblclk.x-A)<3&&Math.abs(this.dblclk.y-E)<3&&C-this.dblclk.time<=500){this.dblclk.time=0;
this.acceptAndClose();
return true
}else{this.dblclk.x=A;
this.dblclk.y=E;
this.dblclk.time=C;
return false
}},brtFromPoint:function(A,D){var C=this.img_bar_upper.getDimensions();
var B=this.img_bar_upper.cumulativeOffset();
if(D<B.top){return 100
}else{if(D>=B.top+C.height){return 0
}else{return((B.top+C.height-1-D)*100/C.height)
}}},hueSatFromPoint:function(A,H){var G=this.img_wheel_rgb.getDimensions();
var F=this.img_wheel_rgb.cumulativeOffset();
var B=(H-(F.top+G.height/2))/((G.height-4)/2);
var E=(A-(F.left+G.width/2))/((G.width-4)/2);
var D=Math.sqrt(B*B+E*E)*100+0.5;
var C=Math.atan2(B,E)*180/Math.PI+90;
if(D<=0){C=D=0
}if(D>100){D=100
}if(C<0){C+=360
}return{sat:D,hue:C}
},colorFromPalette:function(B,G){var F=this.img_palette.getDimensions();
var E=this.img_palette.cumulativeOffset();
if(B<E.left||B>=E.left+F.width){return false
}B=Math.floor((B-E.left)/11);
if(G>=E.top&&G<E.top+12){line="000333666999CCCFFF"
}else{if(G>E.top+20&&G<E.top+20+this.palette.length*11){line=this.palette[Math.floor((G-(E.top+20))/11)]
}else{return false
}}var D=parseInt(line.substr(B*3,1),16);
var C=parseInt(line.substr(B*3+1,1),16);
var A=parseInt(line.substr(B*3+2,1),16);
return{r:D*16+D,g:C*16+C,b:A*16+A}
},updateByMode:function(A){this.update(A,{r:this.r_edit.value,g:this.g_edit.value,b:this.b_edit.value,hue:this.hue_edit.value,sat:this.sat_edit.value,brt:this.brt_edit.value},[A])
},onCloseEvent:function(C){switch(C.type){case"keydown":switch(C.keyCode){case Event.KEY_RETURN:case 32:if(this.options.onCloseButton){if(!this.options.onCloseButton(this,"closebutton")){break
}}if(this.options.mode=="popup"){this.close()
}break
}break;
case"mouseover":if(!this.img_close.trackingMouse){this.img_close.setStyle({backgroundPosition:"0px -16px"})
}break;
case"mouseout":if(!this.img_close.trackingMouse){this.img_close.setStyle({backgroundPosition:"0px 0px"})
}break;
case"mousedown":this.img_close.trackingMouse=true;
this.img_close.setStyle({backgroundPosition:"0px -32px"});
C.stop();
if(this.img_close.focus){this.img_close.focus()
}var B=true;
var A=new MouseCapture;
A.setCursor("default");
A.begin((function(E,D){switch(D){case"mouseup":case"keyup":A.end();
this.img_close.trackingMouse=false;
if(!B){this.img_close.setStyle({backgroundPosition:"0px 0px"})
}else{this.img_close.setStyle({backgroundPosition:"0px -16px"});
if(this.options.onCloseButton){if(!this.options.onCloseButton(this,"closebutton")){break
}}if(this.options.mode=="popup"){this.close()
}}break;
case"mousemove":B=(this.img_close.getStyle("backgroundPosition")=="0px -32px");
if(this.img_close.isEventIn(E)!=B){B=!B;
if(!B){this.img_close.setStyle({backgroundPosition:"0px 0px"})
}else{this.img_close.setStyle({backgroundPosition:"0px -32px"})
}}break
}}).bind(this));
break
}},onBarEvent:function(G){switch(G.type){case"keydown":var E=this;
var F=this.toNumber(E.brt_edit.value),B=F;
var D=G.shiftKey||G.ctrlKey||G.altKey;
switch(G.keyCode){case Event.KEY_UP:F+=D?10:1;
G.stop();
break;
case Event.KEY_DOWN:F-=D?10:1;
G.stop();
break;
case Event.KEY_PAGEUP:F+=D?25:10;
G.stop();
break;
case Event.KEY_PAGEDOWN:F-=D?25:10;
G.stop();
break;
case Event.KEY_HOME:F=100;
G.stop();
break;
case Event.KEY_END:F=0;
G.stop();
break
}if(F<0){F=0
}if(F>100){F=100
}if(E.options.onChanging&&(B!=F)){E.options.onChanging(E,"changing")
}E.update("hsb",{hue:E.hue_edit.value,sat:E.sat_edit.value,brt:F},[]);
if(E.options.onChanged&&(B!=F)){E.options.onChanged(E,"changed")
}break;
case"mousedown":G.stop();
var E=this;
E.oldcolor=E.color;
if(E.img_bar_dragger.focus){E.img_bar_dragger.focus()
}var C=function(I){var H={hue:E.hue_edit.value,sat:E.sat_edit.value,brt:E.brtFromPoint(I.pointerX(),I.pointerY())};
E.queuedUpdate("hsb",H,[]);
if(E.options.onChanging){E.options.onChanging(E,"changing")
}};
C(G);
if(this.closeOnDoubleClick(G)){break
}var A=new MouseCapture;
A.setCursor("default");
A.begin(function(I,H){switch(H){case"mouseup":case"keyup":A.end();
E.finalUpdate();
if(E.options.onChanged&&E.oldcolor!=E.color){E.options.onChanged(E,"changed")
}break;
case"mousemove":C(I);
break
}});
break
}},onWheelEvent:function(E){switch(E.type){case"keydown":var I=this;
var D=this.toNumber(I.hue_edit.value),A=D;
var C=this.toNumber(I.sat_edit.value),G=C;
var F=E.shiftKey||E.ctrlKey||E.altKey;
switch(E.keyCode){case Event.KEY_UP:C+=F?10:1;
E.stop();
break;
case Event.KEY_DOWN:C-=F?10:1;
E.stop();
break;
case Event.KEY_LEFT:D-=F?10:1;
E.stop();
break;
case Event.KEY_RIGHT:D+=F?10:1;
E.stop();
break;
case Event.KEY_PAGEUP:C+=F?25:10;
E.stop();
break;
case Event.KEY_PAGEDOWN:C-=F?25:10;
E.stop();
break;
case Event.KEY_HOME:C=100;
E.stop();
break;
case Event.KEY_END:C=0;
E.stop();
break
}if(C<0){C=0
}if(C>100){C=100
}D=D%360;
if(D<0){D+=360
}if(I.options.onChanging&&(A!=D||G!=C)){I.options.onChanging(I,"changing")
}I.update("hsb",{hue:D,sat:C,brt:I.brt_edit.value},[]);
if(I.options.onChanged&&(A!=D||G!=C)){I.options.onChanged(I,"changed")
}break;
case"mousedown":E.stop();
var I=this;
I.oldcolor=I.color;
if(I.img_wheel_dragger.focus){I.img_wheel_dragger.focus()
}var B=function(K){var J=I.hueSatFromPoint(K.pointerX(),K.pointerY());
J.brt=I.brt_edit.value;
I.queuedUpdate("hsb",J,[]);
if(I.options.onChanging){I.options.onChanging(I,"changing")
}};
B(E);
if(this.closeOnDoubleClick(E)){break
}var H=new MouseCapture;
H.setCursor("default");
H.begin(function(K,J){switch(J){case"mouseup":case"keyup":H.end();
I.finalUpdate();
if(I.options.onChanged&&I.oldcolor!=I.color){I.options.onChanged(I,"changed")
}break;
case"mousemove":B(K);
break
}});
break
}},onPaletteEvent:function(D){switch(D.type){case"mousedown":var C=this;
C.oldcolor=C.color;
if(C.img_palette.focus){C.img_palette.focus()
}var B=function(F){var E=C.colorFromPalette(F.pointerX(),F.pointerY());
if(E){C.queuedUpdate("rgb",E,[])
}if(C.options.onChanging){C.options.onChanging(C,"changing")
}return E
};
if(!B(D)){break
}D.stop();
if(this.closeOnDoubleClick(D)){break
}var A=new MouseCapture;
A.setCursor("default");
A.begin(function(F,E){switch(E){case"mouseup":case"keyup":A.end();
C.finalUpdate();
if(C.options.onChanged&&C.oldcolor!=C.color){C.options.onChanged(C,"changed")
}break;
case"mousemove":B(F);
break
}});
break
}},onNumberBox:function(F,G,E,A,D){var C=Event.element(F);
switch(F.type){case"keypress":if(!F||F.ctrlKey||F.altKey){F.stop()
}else{if((F.charCode>=48&&F.charCode<=57)||(F.keyCode>=48&&F.keyCode<=57)){}else{if(F.keyCode>0&&F.keyCode<48){}else{F.stop()
}}}break;
case"keyup":if(F.keyCode!=Event.KEY_TAB){this.updateByMode(G);
if(this.options.onChanging){this.options.onChanging(this,"changing")
}}if(F.keyCode==Event.KEY_RETURN){this.acceptAndClose();
F.stop()
}if(F.keyCode==Event.KEY_ESC){this.cancelAndClose();
F.stop()
}break;
case"focus":this.oldcolor=this.color;
break;
case"blur":var B=this.toNumber(C.value);
if(B<E||B>A){if(D){B%=D;
if(B<0){B+=D
}}else{if(B<E){B=E
}else{B=A
}}C.value=B;
this.updateByMode(G)
}if(this.options.onChanged&&this.oldcolor!=this.color){this.options.onChanged(this,"changed")
}break
}},onInput:function(B){switch(B.type){case"keyup":if(B.keyCode!=Event.KEY_TAB){this.update("rgb",this.decodeHexColor(this.input.value),["input"]);
if(this.options.onChanging){this.options.onChanging(this,"changing")
}}if(B.keyCode==Event.KEY_RETURN){this.acceptAndClose();
B.stop()
}if(B.keyCode==Event.KEY_ESC){this.cancelAndClose();
B.stop()
}break;
case"focus":this.oldcolor=this.color;
break;
case"blur":var A=this.decodeHexColor(this.input.value);
this.update("rgb",A,[]);
if(this.oldcolor!=this.color){this.input.value=this.internalFormatOutput(A,this.RGBtoHSB(A),this.options.outputFormat);
if(this.options.onChanged){this.options.onChanged(this,"changed")
}}break
}},handleCloseClick:function(B){var A=$(Event.element(B));
if(A==this.div||A.descendantOf(this.div)){return 
}if(A==this.input||A.descendantOf(this.input)){return 
}this.cancelAndClose()
},handleKeyPress:function(A){if(A.keyCode==Event.KEY_ESC){this.cancelAndClose()
}},attachButton:function(E,C){E=$(E);
if(!E){return 
}var F;
if(C.imgPath){F=C.imgPath
}else{F=""
}var D=$(document.createElement("a"));
D.setStyle({display:"inline-block",visibility:"visible",border:"0px",textDecoration:"none",verticalAlign:"bottom",width:"40px",height:"24px",padding:"0px",marginLeft:"2px",backgroundImage:"url("+F+"drop.png)",backgroundPosition:"0px 0px",backgroundRepeat:"no-repeat",cursor:"default"});
D.href="#";
for(var A in this.buttonMembers){D[A]=this.buttonMembers[A]
}var B=C.color;
D.buttonHandler=D.eventHandler.bindAsEventListener(D);
D.options=Object.clone(C);
D.options.input=E;
D.options.pc=this;
delete D.options.color;
if(!D.options.outputFormat){D.options.outputFormat="#{RR}{GG}{BB}"
}Event.observe(D,"click",D.buttonHandler);
Event.observe(D,"mouseover",D.buttonHandler);
Event.observe(D,"mouseout",D.buttonHandler);
Event.observe(D,"mousedown",D.buttonHandler);
Event.observe(D,"mouseup",D.buttonHandler);
Event.observe(D,"keydown",D.buttonHandler);
Event.observe(D,"keyup",D.buttonHandler);
if(E.nextSibling){E.parentNode.insertBefore(D,E.nextSibling)
}else{E.parentNode.appendChild(D)
}D.inputHandler=D.onInput.bindAsEventListener(D);
D.observeInput();
if(B){E.value=B
}D.colorSync(true);
return D
},buttonMembers:{pressed:false,hovered:false,inputHandler:false,options:{},setImg:function(A){this.setStyle({backgroundPosition:"0px "+(A*-24)+"px"})
},observeInput:function(){Event.observe(this.options.input,"keyup",this.inputHandler);
Event.observe(this.options.input,"focus",this.inputHandler);
Event.observe(this.options.input,"blur",this.inputHandler)
},stopObservingInput:function(){Event.stopObserving(this.options.input,"keyup",this.inputHandler);
Event.stopObserving(this.options.input,"focus",this.inputHandler);
Event.stopObserving(this.options.input,"blur",this.inputHandler)
},toggle:function(){if(this.pressed){this.setImg(this.hovered?1:0);
this.pressed=false;
if(this.popup){this.popup.close();
this.popup=null
}this.observeInput()
}else{var A=this;
this.setImg(2);
this.pressed=true;
this.stopObservingInput();
this.popup=new ProColor(Object.extend(Object.clone(this.options),{mode:"popup",closeButton:true,onClosed:function(C,B){A.popup=null;
A.setImg(this.hovered?1:0);
A.pressed=false;
A.observeInput();
if(A.options.onClosed){A.options.onClosed(C,B)
}},parent:null}))
}},colorSync:function(C){var D=this.options.pc.decodeHexColor(this.options.input.value);
if(D){if(this.options.showInField){var A=this.options.pc.computeTextColor(D);
this.options.input.setStyle({backgroundColor:"#"+D.r.toColorPart()+D.g.toColorPart()+D.b.toColorPart(),color:"#"+A.r.toColorPart()+A.g.toColorPart()+A.b.toColorPart()})
}var B=this.options.pc.internalFormatOutput(D,this.options.pc.RGBtoHSB(D),this.options.outputFormat);
if(B!=this.options.input.value&&this.options.onChanging){this.options.onChanging(this.options.input,"changing")
}if(C){if(B!=this.options.input.value){this.options.input.value=B;
if(this.options.onChanged){this.options.onChanged(this.options.input,"changed")
}}}}},onInput:function(A){switch(A.type){case"keyup":if(A.keyCode!=Event.KEY_TAB&&this.options.showInField){this.colorSync(false)
}break;
case"focus":case"blur":this.colorSync(true);
break
}},eventHandler:function(B){switch(B.type){case"click":B.stop();
break;
case"keydown":switch(B.keyCode){case Event.KEY_RETURN:case 32:this.toggle();
B.stop();
break
}break;
case"keyup":break;
case"mousedown":this.focus();
var A=this;
setTimeout(function(){A.toggle()
},20);
break;
case"mouseup":break;
case"mouseover":if(this.pressed){this.setImg(2)
}else{this.setImg(1)
}this.hovered=true;
break;
case"mouseout":if(this.pressed){this.setImg(2)
}else{this.setImg(0)
}this.hovered=false;
break
}}}});
Event.observe(window,"load",function(){$$("input.procolor").each(function(A){ProColor.prototype.attachButton(A,ProColor.prototype.options)
})
});