import * as DBC from "./DBController.mod.js";
import * as Prefabs from "./Prefabs.mod.js";
import * as ConstV from "../css/const_viewer_css.js" ;



/*  Constance */
const ZoomSpeed = 0.005;
const colors=['white', 'blue','red','green','yellow']; 

var tapCount = 0 ; //technical note 001

export class Viewer{
  constructor(opts){
    opts			= opts			|| {};
    this._container =opts.container || document.body;
    this.dataset  = opts.dataset || new DBC.DataSet();
    this.texture = opts.texture || new THREE.TextureLoader().load( "./textures/basic.png" );
    this.parent =opts.parent || null;


    this.flgMouse=false;
    this.orgX;
    this.orgY;
    this.rotX=0;
    this.rotY=0;

    this.viewer=RcreateElement(ConstV.viewer);
    this.menu=RcreateElement(ConstV.menu);

    this.camera = new THREE.PerspectiveCamera(45, 1);
    this.camera.rotation.set(Math.PI/2,0,0);
    this.camera.position.set(250,-750,250);

    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x3300ff, 1.0)

    const directionalLight = new THREE.DirectionalLight(0xcccccc);
    directionalLight.position.set(0.2, 0.2, 1);
    this.scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0xffffff,0.5);
    this.scene.add( ambientLight );
    this.L =new Array(6); //Layer Group
    for(let i=0;i<6;++i){
      this.L[i]=new THREE.Group();
      this.L[i].position.set(0,0,100*i);
      for(let j=0;j<36;+-++j){
        let tray= new Prefabs.Tray();
        tray.position.set(100*(j%6)+4,100*Math.floor(j/6)+4,0);
        tray.num=i*36+j;
        tray.class="tray";
        this.L[i].add(tray);
      }
      this.scene.add(this.L[i]);
    }
    for(let key in this.dataset.dataU){
      const dataU = Object.assign({},this.dataset.dataU[key]);
      this._setCube(this._createCube(dataU),dataU);  
    }  

    this.viewer.appendChild(this.renderer.domElement);
    this._container.appendChild(this.viewer);
    this._render();

    var __bind	= function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
		this._$onDblClick	= __bind(this._onDblClick	, this);
		this._$onMouseDown	= __bind(this._onMouseDown	, this);
		this._$onMouseUp	= __bind(this._onMouseUp	, this);
		this._$onMouseMove	= __bind(this._onMouseMove	, this);
    this._$onWheel	= __bind(this._onWheel	, this);
    this._$onClickMenu	= __bind(this._onClickMenu	, this);

    this.menu.addEventListener( 'click', this._$onClickMenu, { passive: false } );
    this.viewer.addEventListener( 'dblclick', this._$onDblClick, { passive: false } );
    this.viewer.addEventListener( 'mousedown',this._$onMouseDown, { passive: false } );
    this.viewer.addEventListener( 'mouseup', this._$onMouseUp, { passive: false } );
    this.viewer.addEventListener( 'mousemove', this._$onMouseMove, { passive: false } );
    this.viewer.addEventListener( 'mouseout', this._$onMouseUp, { passive: false } );
    this.viewer.addEventListener( 'wheel', this._$onWheel, { passive: false } );

    this._$touchMove	= __bind(this._touchMove	, this);
		this._$dbltouch	= __bind(this._dbltouch	, this);
    this.viewer.addEventListener( 'touchmove', this._$touchMove,{ passive: false } );
    this.viewer.addEventListener( 'touchend', this._$onMouseUp, { passive: false } );
    this.viewer.addEventListener( "touchstart", this._$dbltouch, { passive: false }) ;

  }
  /*                             */
  /* Methods for User Interface  */
  /*                             */
  _dbltouch(e){
    if( !tapCount ) {
      ++tapCount ;
      this._mouseDown(e,1);        
      setTimeout( function() {
        tapCount = 0 ;
      }, 350 ) ;
    } else {
      this.OnDblClick(e);
      tapCount = 0 ;
    }

  }

  _onDblClick(event){
    event.preventDefault();
    this.parent.OnClickESC();
  }
 
  _onMouseDown(event){
    this._mouseDown(event,0);
  }
 
  _mouseDown(event,num){//0:mouse 1:touch
    event.preventDefault();
    if(num==0){
      this.orgX = event.clientX;
      this.orgY = event.clientY;
    }else{
      this.orgX = event.touches[0].clientX;
      this.orgY = event.touches[0].clientY;
    }
    this.flgMouse=true;
  }
  
  _onMouseUp(event){
    event.preventDefault();
    this.flgMouse=false;
  }
   
  _rotationView(x,y){
    this.rotX += x  * 360 * 0.0002;
    this.rotY += y  * 360 * 0.0002;
    if(this.rotY>90)this.rotY=90;
    if(this.rotY<-90)this.rotY=-90;
    const radianX = this.rotX * Math.PI / 180;
    const radianY = this.rotY * Math.PI / 180;
    this.camera.position.y = -1000 *Math.cos(radianY)+250*Math.sin(radianX+Math.PI/4)/Math.cos(Math.PI/4);
    this.camera.position.z = 1000 *Math.sin(radianY)+250;
    this.camera.position.x= 250*Math.cos(radianX+Math.PI/4)/Math.cos(Math.PI/4);
    this.camera.rotation.x=Math.PI/2-radianY;
    for(let i=0;i<6;++i)this.L[i].rotation.z=radianX;
    this._render();  
  }
  
  _onMouseMove(event){
    this._mouseMove(event,0);
  }

  _touchMove(event){
    this._mouseMove(event,1);
  }

  _mouseMove(event,num){
    event.preventDefault();
    let x,y;
    if(num==0){
      x = event.clientX-this.orgX;
      y = event.clientY-this.orgY;
      this.orgX = event.clientX;
      this.orgY = event.clientY;    
    }else{
      x = event.touches[0].clientX-this.orgX;
      y = event.touches[0].clientY-this.orgY;
      this.orgX = event.touches[0].clientX;
      this.orgY = event.touches[0].clientY;    
    }
    if(this.flgMouse)this._rotationView(x,y);
  }
   // mouse wheel zoom inout
  _onWheel(event){
    let fov=this.camera.fov;
    fov+=event.deltaY*ZoomSpeed;
    if(fov>60)fov=60;
    if(fov<20)fov=20;
    this.camera.fov=fov;
    this.camera.updateProjectionMatrix();
    this._render();     
  }
  
  Joystick(buttonName,deltaX,deltaY){
    if(this._container.children[0]==this.menu){
      switch(buttonName){
        case 'button_X':
        case 'button_A':
          this._onClickMenuDo('Cancel');//cancel
          break;
        case 'button_B':
          const list=this._container.querySelectorAll('input');
          this._onClickMenuDo(list[this.selectedMenuPosition].value);
          break;
        default:
          if(buttonName=='button_Up')this._setSelectedMenuItem(this.selectedMenuPosition-1);
          if(buttonName=='button_Down')this._setSelectedMenuItem(this.selectedMenuPosition+1);
          break;
      }
    }else{
      switch(buttonName){
        case 'button_X':
        case 'button_A':
          this.parent.OnClickESC();
          break;
        case 'button_B':
          this._openMenu();
          break;
        default:
          this._rotationView(deltaX,deltaY);
          break;
      }
    }
  }

  _clearAll(){
    for(let i=0;i<6;++i){
      while(this.L[i].children.length>36){
        let item=this.L[i].children.find((v)=>v.class!="tray");
        if(item)this.L[i].remove(item);
      }  
    }
  }
//procedure for changeing DB
  OpenView(dataset){
    this.dataset=dataset;
    this._clearAll();
    for(let key in dataset.dataU){
      const dataU = Object.assign({},this.dataset.dataU[key]);
      this._setCube(this._createCube(dataU),dataU);  
    }  
    this.OnResize();
  }

//Select Layer L(lnum)
  SelectLayer(lnum){
    for (let i = 0; i < 6; ++i)this.L[i].visible=false;
    this.L[lnum].visible=true;
    this._render();
  }

  // create cube
  _createCube(dataU){
    const pos=dataU.pos;
    const num=Math.floor(dataU.type/1000);
    let newObj;
    if(num==0)newObj=new Prefabs.Edge();
    if(num==1)newObj=new Prefabs.Cube({texture:this.texture});
    if(num==2)newObj=new Prefabs.Capsule({texture:this.texture});
    if(num==3)newObj=new Prefabs.Sphere({texture:this.texture});
    if(num==4)newObj=new Prefabs.ExtObj();
    newObj.pos=pos;
    newObj.position.copy(calc3DPosition(pos));
    this.L[Math.floor(pos/36)].add(newObj);
    return newObj;
  }

  _setCube(obj,dataU){
    if(obj.class!="Edge")obj.material.color.set(colors[Math.floor(dataU.type/100)%10]);    
    for(let i=0;i<6;++i){
      let item = obj.children.find( (v) => v.class == ConstV.strEdge[i]);
      item.visible=true;
      if((dataU.dir&(1<<i))==0)item.visible=false;
    }
  } 

  _render(){
    this.renderer.render(this.scene, this.camera);  
  }

  _openMenu(){
    const menuInfo=[0,8];
    while(this.menu.children.length>0)this.menu.removeChild(this.menu.children[0]);
    let com=new Array(menuInfo[1]);
    for(let i=0;i<menuInfo[1];++i){
      com[i] = document.createElement("input");
      com[i].type='button';
      com[i].style.cssText =" font-size: 6vmin; text-align: center; width:100%; height:"+Math.floor(100/menuInfo[1])+"%;"; 
      com[i].value=ConstV.CaptionMenu[menuInfo[0]+i];
      this.menu.appendChild(com[i]);
    }
    while(this._container.children.length>0)this._container.removeChild(this._container.children[0]);    
    this._container.appendChild(this.menu);
    this._setSelectedMenuItem(0);
  }
 /*                             */
  /* Methods from Menu           */
  /*                             */
  _onClickMenu(event){  //for menu
    this._onClickMenuDo(event.target.value);
  }

  _onClickMenuDo(value){
    let num = -1;
    for(let i in ConstV.CaptionMenu){
      if(value==ConstV.CaptionMenu[i])num=i;
    }
    while(this._container.children.length>0)this._container.removeChild(this._container.children[0]);
    this._container.appendChild(this.viewer);
    switch(Number(num)){
      case 7://Cancel
        break;
      case 0:
        for(let i=0;i<6;++i)this.L[i].visible=true;
        break;
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
        for(let i=0;i<6;++i)this.L[i].visible=false;
        this.dataset.selectedLayer=5-num;
        this.L[6-num].visible=true;
        break;
      default:
        break;
    }
    this._render();
  }

  _setSelectedMenuItem(num){
    let list=this._container.querySelectorAll('input');//B          
    if(num<0||num==list.length)return;
    this.selectedMenuPosition=num;
    for(let item of list){
      item.style.backgroundColor='white';
    }
    list[this.selectedMenuPosition].style.backgroundColor='yellow';
  } 

  OnResize() {
    const newsize=this._container.offsetWidth;
    this.renderer.setSize( newsize,newsize);
    this.camera.updateProjectionMatrix();
    this._render(); // rendering
  } 
}

function calc3DPosition(num){
  return new THREE.Vector3(100*(num%6)+4,100*Math.floor((num%36)/6)+4,50);
}

function RcreateElement(opts){
  let result=document.createElement(opts.tag);
  for(let prop in opts){
    if(prop!='tag'&&prop!='css'){
      result[prop] = opts[prop]
    }
  }  
  for(let prop in opts.css)result.style[prop] = opts.css[prop];
  return result;
}