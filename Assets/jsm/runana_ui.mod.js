import * as RE from './runana_ide.mod.js'
import * as JS from './virtualjoystick.js'
import * as ConstUI from "../css/const_ui_css.js" ;

var VERSION='v 0.3.0.2';
var _container=document.getElementById('game_wrapper');
var canvas=RcreateElement(_container,ConstUI.canvas);
var runana_ide=new RE.Runana_IDE({container:canvas,version:VERSION});
var leftUI=RcreateElement(_container,ConstUI.leftUI);
var rightUI=RcreateElement(_container,ConstUI.rightUI);
var inputA=RcreateElement(rightUI,ConstUI.inputA);
var inputB=RcreateElement(rightUI,ConstUI.inputB);
var inputX=RcreateElement(leftUI,ConstUI.inputX);
var panelJoystick=RcreateElement(leftUI,ConstUI.joystick);
var joystick	= new JS.VirtualJoystick({
    container	: panelJoystick,
    mouseSupport	: true,
    strokeStyle: 'white'
    });

setInterval(function(){
  if(joystick.right())runana_ide.Joystick('button_Right',joystick.deltaX(),joystick.deltaY());
  if(joystick.down())runana_ide.Joystick('button_Down',joystick.deltaX(),joystick.deltaY());
  if(joystick.left())runana_ide.Joystick('button_Left',joystick.deltaX(),joystick.deltaY());
  if(joystick.up())runana_ide.Joystick('button_Up',joystick.deltaX(),joystick.deltaY());
}, 1/3 * 1000);

inputA.onclick=function(e){
  runana_ide.Joystick('button_A',null,null);
}
inputB.onclick=function(e){
  runana_ide.Joystick('button_B',null,null);
}
inputX.onclick=function(e){
  runana_ide.Joystick('button_X',null,null);
};

window.addEventListener( 'resize', OnWindowResize, false );
OnWindowResize();

function OnWindowResize() {
  //Max canvas
  const winWidth=window.innerWidth;
  const winHeight=window.innerHeight;
  let canvasWH;

  if(winWidth<winHeight){ //portrait
    canvasWH = winWidth;
    leftUI.style.height = (winHeight-canvasWH)+'px';
    leftUI.style.width = canvasWH/2+'px';
    leftUI.style.top = canvasWH+'px';
    rightUI.style.height = (winHeight-canvasWH)+'px';
    rightUI.style.width = canvasWH/2+'px';
    rightUI.style.top = canvasWH+'px';
    rightUI.style.left = canvasWH/2+'px';
  }else{ //landscape
    canvasWH=winHeight;
    leftUI.style.height = canvasWH+'px';
    leftUI.style.width = (winWidth-canvasWH)/2+'px';
    leftUI.style.top='0px';
    rightUI.style.height = canvasWH+'px';
    rightUI.style.width = (winWidth-canvasWH)/2+'px';
    rightUI.style.top = '0px';
    rightUI.style.left = (winWidth+canvasWH)/2+'px';
  }
  canvas.style.left = (winWidth-canvasWH)/2+'px';
  canvas.style.width = canvasWH+'px';
  canvas.style.height = canvasWH+'px';
  _container.style.fontSize=canvasWH/100+'px';
  runana_ide.OnResize();
}
//  not used another window style
function OnWindowResizeBalance() {
  let winWidth=window.innerWidth;
  let winHeight=window.innerHeight;
  let canvasWH;

  if(winWidth<winHeight){ //portrait
    if((winWidth*2-10)<winHeight){
      winWidth=winWidth-10;
      winHeight=winWidth*2;
    }else{
      winHeight=winHeight-10;
      winWidth=winHeight/2;
    }
    canvasWH = winWidth;
    canvas.style.left = '0px';
    canvas.style.width = canvasWH+'px';
    canvas.style.height = canvasWH+'px';
    leftUI.style.height = (winHeight-winWidth)+'px';
    leftUI.style.width = winWidth/2+'px';
    leftUI.style.top = winWidth+'px';
    rightUI.style.height = (winHeight-winWidth)+'px';
    rightUI.style.width = winWidth/2+'px';
    rightUI.style.top = winWidth+'px';
    rightUI.style.left = winWidth/2+'px';
  }else{ //landscape
    if(winWidth<winHeight*2-10){
      winWidth=winWidth-10;
      winHeight=winWidth/2;
    }else{
      winHeight=winHeight-10;
      winWidth=winHeight*2;
    }
    canvasWH=winHeight;
    canvas.style.left = (winWidth-winHeight)/2+'px';
    canvas.style.width = canvasWH+'px';
    canvas.style.height = canvasWH+'px';
    leftUI.style.height = winHeight+'px';
    leftUI.style.width = (winWidth-winHeight)/2+'px';
    leftUI.style.top='0px';
    rightUI.style.height = winHeight+'px';
    rightUI.style.width = (winWidth-winHeight)/2+'px';
    rightUI.style.top = '0px';
    rightUI.style.left = (winWidth+winHeight)/2+'px';
  }
  runana_ide.OnResize();
}
//common runana create element
function RcreateElement(container,opts){
let result=document.createElement(opts.tag);
for(let prop in opts){
  if(prop!='tag'&&prop!='css'){
    result[prop] = opts[prop]
  }
}  
for(let prop in opts.css)result.style[prop] = opts.css[prop];
container.appendChild(result);
return result;
}



