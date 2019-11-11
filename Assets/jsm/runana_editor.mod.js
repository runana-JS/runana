import * as DBC from "./DBController.mod.js";
import * as Prefabs from "./Prefabs.mod.js";
import * as PanelC from "./PanelController.mod.js" ;
import * as ConstE from "../css/const_editor_css.js" ;

/*  Constance */
const colors=['#808080', 'blue','red','green','yellow','white']; 
var tapCount=0;

export class Editor{
  constructor(opts) {
    opts			= opts			|| {};
    this._container =opts.container || document.body;
    this.dataset  = opts.dataset || new DBC.DataSet();
    this.texture = opts.texture || new THREE.TextureLoader().load( "./textures/basic.png" );
    this.parent =opts.parent || null;

    this.editor=RcreateElement(ConstE.editor);
    this.viewData =RcreateElement(ConstE.viewData);
    this.editor.appendChild(this.viewData);
    this.panel=RcreateElement(ConstE.panel);
    this.panelController=new PanelC.Panel({container:this.panel,parent:this});
    this.menu=RcreateElement(ConstE.menu);
    
    this.selectedPosition=0; //selected position
    this.selectedMenuPosition=-1; //selected position
    this.tempPosition=-1; // drag&drop temporary position
    this.copyDataU=null;
    this.dragObj=null;
    this.L=new THREE.Group();
    //Initialize
    this.camera = new THREE.PerspectiveCamera(45, 1);
    this.camera.position.set(250,250,800);
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

    for(let i=0;i<36;+-++i){
      let tray= new Prefabs.Tray();
      tray.position.set(100*(i%6)+4,100*Math.floor(i/6)+4,0);
      tray.num=i;
      tray.class="tray";
      this.L.add(tray);
    }
    this.scene.add(this.L); 
    var __bind	= function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
		this._$onDblClick	= __bind(this._onDblClick	, this);
		this._$onMouseDown	= __bind(this._onMouseDown	, this);
		this._$onMouseUp	= __bind(this._onMouseUp	, this);
		this._$onMouseMove	= __bind(this._onMouseMove	, this);
    this._$onClickMenu	= __bind(this._onClickMenu	, this);

    this.menu.addEventListener( 'click', this._$onClickMenu, { passive: false } );
    this.editor.addEventListener( 'dblclick', this._$onDblClick, { passive: false } );
    this.editor.addEventListener( 'mousedown',this._$onMouseDown, { passive: false } );
    this.editor.addEventListener( 'mouseup', this._$onMouseUp, { passive: false } );
    this.editor.addEventListener( 'mousemove', this._$onMouseMove, { passive: false } );
    this.editor.addEventListener( 'mouseout', this._$onMouseUp, { passive: false } );

    this._$touchMove	= __bind(this._touchMove	, this);
		this._$dbltouch	= __bind(this._dbltouch	, this);
    this.editor.addEventListener( 'touchmove', this._$touchMove,{ passive: false } );
    this.editor.addEventListener( 'touchend', this._$onMouseUp, { passive: false } );
    this.editor.addEventListener( "touchstart", this._$dbltouch, { passive: false }) ;

    this.editor.appendChild(this.renderer.domElement);
    this._container.appendChild(this.editor);
    this._setSelectedTray();
    this._render();
  }
  /*                             */
  /* Methods for User Interface  */
  /*                             */
  _dbltouch(e){
    if( tapCount==0 ) {
      ++tapCount ;
      setTimeout( function() {
        tapCount = 0 ;
      }, 350 ) ;
      this._mouseDown(e,1);        
    } else {
      this._onDblClick(e);
      tapCount = 0 ;
    }
  }

  _onDblClick(event){
    event.preventDefault();
    if(this.selectedPosition==-1){
      this.parent.OnClickESC();
    }else{
      const dataU=DBC.GetDataUnit4DS(this.dataset,this.selectedPosition);
      if(dataU&&(dataU.pos == this.selectedPosition)){
        this._openMenu('edit');
      }else{
        this._openMenu('new');
      } 
    }
  }

  _searchMousePosition(event,num){
    let result=-1;
    const element = event.currentTarget;
    const target_rect = element.getBoundingClientRect();
    let x = event.clientX - target_rect.left;
    let y = event.clientY - target_rect.top;
    if(num==1){
      x = event.touches[0].clientX - target_rect.left;
      y = event.touches[0].clientY - target_rect.top;  
    }
    const w = element.offsetWidth;
    const h = element.offsetHeight;
    let mouse = new THREE.Vector2();
    mouse.x = ( x / w ) * 2 -1;
    mouse.y = -( y / h ) * 2 + 1;
    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( mouse, this.camera );
    const intersects = raycaster.intersectObjects( this.L.children );
    const item=intersects.find((v) => v.object.class=="tray");
    if(item)result=item.object.num+(this.dataset.selectedLayer)*36;
    return result;  
  }

  _onMouseDown(event){
    this._mouseDown(event,0);
  }
  
  _mouseDown(event,num){//0:mouse 1:touch
    event.preventDefault();
    var self=this;
    this.selectedPosition=this._searchMousePosition(event,num);
    if(this.selectedPosition>=0){
      this.timer=setTimeout( function() {
        self.tempPosition=self.selectedPosition;
        self.dragObj=self._searchCube(self.selectedPosition);
        self._viewData(true);  
      }, 350 ) ;
    }
    this._setSelectedTray();
    this._render(); 
  }   

  _onMouseUp(event){
    event.preventDefault();
    clearInterval(this.timer);
    if(this.dragObj!=null&&this.selectedPosition!=this.tempPosition){ //drop method
      if(DBC.GetDataUnit4DS(this.dataset,this.tempPosition)==null){
        this.dragObj.pos=this.tempPosition;
        let dataU=DBC.GetDataUnit4DS(this.dataset,this.selectedPosition);
        dataU.pos=this.tempPosition;
        DBC.SetDataUnit4DS(this.dataset,dataU);
        DBC.EraseDataUnit4DS(this.dataset,this.selectedPosition)
        this.selectedPosition=this.tempPosition; 
        this._setSelectedTray(); 
      }else{ //cancel
        this.dragObj.position.copy(calc3DPosition(this.selectedPosition));
      }
    }
    this.dragObj=null;
    this._render();   
    this.flgMouse=false;
    this._viewData(false);       
  }

  _onMouseMove(event){
    this._mouseMove(event,0);
  }

  _touchMove(event){
    this._mouseMove(event,1);
  }

  _mouseMove(event,num){
    event.preventDefault();
//    clearInterval(this.timer);
    if(this.dragObj!=null){ //on drag
      const mousePos=this._searchMousePosition(event,num);
      if(mousePos>=0&&this.tempPosition!=mousePos){
        this.tempPosition=mousePos;
        this.dragObj.position.copy(calc3DPosition(this.tempPosition));
        this._viewData(true);
        this._render(); // rendering 
      }
    }
  }

  _onMouseOut(event){
    event.preventDefault();
    if(this.dragObj!=null){//drop cancel method
      this.dragObj.position.copy(calc3DPosition(this.selectedPosition));
      this.dragObj=null;
      this._viewData(false);        
      this._render();
    }
    this.flgMouse=false;
  }
  
  Joystick(buttonName,deltaX,deltaY){
    //0:r 1:d 2:l 3:u
    if(this._container.children[0]==this.panel){
      this.panelController.Joystick(buttonName,deltaX,deltaY);
    }else if(this._container.children[0]==this.menu){
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
          this.parent.OpenMenu();//IDE
          break;
        case 'button_B':
          if(DBC.DataExist4DS(this.dataset,this.selectedPosition)){
            this._openMenu('edit');//menu cubeConfig method
          }else{
            this._openMenu('new');//mene new cube 
          }
          break;
        default:
          let x=this.selectedPosition%6;
          let y=Math.floor((this.selectedPosition%36)/6);
          let z=Math.floor(this.selectedPosition/36);
          if(buttonName=='button_Right') x=(x+1)%6;
          if(buttonName=='button_Left') x=(x+5)%6;
          if(buttonName=='button_Up') y=(y+1)%6;
          if(buttonName=='button_Down') y=(y+5)%6;
          const tempselectedPosition = x + y*6 + z*36;
          if(this.selectedPosition != tempselectedPosition){
            this.selectedPosition = tempselectedPosition;
            this._setSelectedTray();
          }
          break;
      }
    }
  }
  /*                             */
  /* Methods from Menu           */
  /*                             */
  _onClickMenu(event){  //for menu
    this._onClickMenuDo(event.target.value);
  }

  _onClickMenuDo(value){
    let num = -1;
    for(let i in ConstE.CaptionMenu){
      if(value==ConstE.CaptionMenu[i])num=i;
    }
    switch(Number(num)){
      case 0:
      case 8://changeLayer
        this._openMenu('layer');
        return;
      case 1://New Edge
      case 2://New Do
      case 3://New Interface
      case 4://New variable
      case 5://New Ext        
        let dataU=new DBC.DataUnit({pos:this.selectedPosition,type:(num-1)});
        DBC.SetDataUnit4DS(this.dataset,dataU);
        this._openPanel(dataU);
        return;
      case 6: //Paste Cube
        if(this.copyDataU!=null){
          this.copyDataU.pos=this.selectedPosition;
          DBC.SetDataUnit4DS(this.dataset,this.copydataU);
        }  
        break;
      case 9: // edit Cube
        this._openPanel(DBC.GetDataUnit4DS(this.dataset,this.selectedPosition));
        return;
      case 10: // cut Cube
        this.copyDataU=DBC.GetDataUnit4DS(this.dataset,this.selectedPosition);
        DBC.EraseDataUnit4DS(this.dataset,this.selectedPosition);
        break;
      case 11: //copy Cube
        this.copyDataU= DBC.GetDataUnit4DS(this.dataset,this.selectedPosition);
        break;
      case 7:
      case 12:
      case 19://Cancel
        break;
      case 13:
      case 14:
      case 15:
      case 16:
      case 17:
      case 18:
        this.dataset.selectedLayer=18-num;
        this.selectedPosition=this.dataset.selectedLayer*36;
        break;
      default:
        break;
    }
    while(this._container.children.length>0)this._container.removeChild(this._container.children[0]);
    this._container.appendChild(this.editor);
    this._setupLayer(); 
  }

  _setSelectedTray(){
    for(let item of this.L.children){
      if(item.class=="tray"){
        if((this.selectedPosition>=0)&&(item.num==this.selectedPosition%36)){
          item.material.color.set(0xff0000);
        }else{
          item.material.color.set(0x00ffff);
        }
      }
    }
    this._render();  
  } 
  /*                             */
  /* Methods for myself          */
  /*                             */
  _viewData(flg){
    if(flg){
      let text="";
      if(DBC.GetDataUnit4DS(this.dataset,this.tempPosition)){
        const dataU=DBC.GetDataUnit4DS(this.dataset,this.tempPosition);
        text='pos : '+dataU.pos+'\n';
        text+='name: '+dataU.name+'\n';
        text+='type: '+dataU.type+'\n';
        text+='dir : '+dataU.dir+'\n';
        for(let j in dataU.val){
          text+='val : '+dataU.val[j]+'\n';
        }
      }else{
        const console_log=this.parent.Debug();
        text='debug mode\n'+console_log;
      }
      this.viewData.style.display="block";
      if(this.tempPosition%6>2){
        this.viewData.style.left="0px";
      }else{
        this.viewData.style.left="60%";
      }
      this.viewData.textContent=text;   
    } else{
      this.viewData.style.display="none";
    }
  }        
  //setup Layer 
  _setupLayer(){
    this._clearAll();
    const lnum=this.dataset.selectedLayer;
    for (let key in this.dataset.dataU){
      const dataU = Object.assign({},this.dataset.dataU[key]);
      if((dataU.pos>=36*lnum)&&(dataU.pos<36*lnum+36)){
        this._setCube(this._createCube(dataU),dataU);   
      }
    }
    this._render();
    this._setSelectedTray();
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
    this.L.add(newObj);
    return newObj;
  }

  _setCube(obj,dataU){
    if(obj.class!="Edge")obj.material.color.set(colors[Math.floor(dataU.type/100)%10]);    
    for(let i=0;i<6;++i){
      let item = obj.children.find( (v) => v.class == ConstE.strEdge[i]);
      item.visible=true;
      if((dataU.dir&(1<<i))==0)item.visible=false;
    }
  } 

  _clearAll(){
    let j=0;
    while(this.L.children.length>36){
      if(this.L.children[j].class!=="tray"){
        this.L.remove(this.L.children[j]);
      }else{
        j++;
      }
    }
  }
  // Search cube by selectedPosition
  _searchCube(num){
    return this.L.children.find((v)=>(v.class!="tray"&&v.pos==num));
  }

  _render(){
    this.renderer.render(this.scene, this.camera);  
  }

  OnResize() {
    const newsize=this._container.offsetWidth;
    this.renderer.setSize( newsize,newsize);
    this.camera.updateProjectionMatrix();
    this._render(); // rendering
  }

  _openPanel(dataU){
    while(this._container.children.length>0)this._container.removeChild(this._container.children[0]);
    this._container.appendChild(this.panel);
    this.panelController.OpenPanel(Object.assign({},dataU));
  }

  GetDataBase(){
    return this.parent.GetDataBase();
  }

  GetDataSet(){
    return Object.assign({},this.dataset);
  }

  _getDataSet(){
    return this.dataset;
  }

  SetDataSet(dataset){
    this.dataset=Object.assign({},dataset);
  }

  _setDataSet(dataset){
    this.dataset=dataset;
  }

  _openMenu(type){
    let menuInfo;
    if(type=='new') menuInfo=[0,8];
    if(type=='edit') menuInfo=[8,5];
    if(type=='layer' )menuInfo=[13,7];
    while(this.menu.children.length>0) this.menu.removeChild(this.menu.children[0]);
    let com=new Array(menuInfo[1]);
    for(let i=0;i<menuInfo[1];++i){
      com[i] = document.createElement("input");
      com[i].type='button';
      com[i].style.cssText =" font-size: 6vmin; text-align: center; width:100%; height:"+Math.floor(100/menuInfo[1])+"%;"; 
      com[i].value=ConstE.CaptionMenu[menuInfo[0]+i];
      this.menu.appendChild(com[i]);
    }

    while(this._container.children.length>0)this._container.removeChild(this._container.children[0]);    
    this._container.appendChild(this.menu);
    this._setSelectedMenuItem(0);
  }

  _setSelectedMenuItem(num){
    let list=this._container.querySelectorAll('input');//B          
    if(num<0||num==list.length)return;
    this.selectedMenuPosition=num;
    for(let item of list)item.style.backgroundColor='white';
    list[this.selectedMenuPosition].style.backgroundColor='yellow';
  } 

  /*                             */
  /* Methods from Panel          */
  /*                             */
  CancelPanel(){
    this._container.removeChild(this.panel);
    this._container.appendChild(this.editor);
    this._setupLayer();
  }

  SubmitPanel(dataU){
    DBC.SetDataUnit4DS(this.dataset,dataU);
    this._container.removeChild(this.panel);
    this._container.appendChild(this.editor);
    this._setupLayer();
  }
}
/*                             */
/* Methods for Global          */
/*                             */
function calc3DPosition(num){
  return new THREE.Vector3(100*(num%6)+4,100*Math.floor((num%36)/6)+4,50);
}

function RcreateElement(opts){
  let result=document.createElement(opts.tag);
  for(let prop in opts){
    if(prop!='tag'&&prop!='css') result[prop] = opts[prop];
  }  
  for(let prop in opts.css) result.style[prop] = opts.css[prop];
  return result;
}

