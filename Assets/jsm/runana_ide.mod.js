import * as ConstIDE from "../css/const_ide_css.js";
import * as DBC from "./DBController.mod.js";
import * as PanelC from "./PanelController.mod.js";
import * as RDebug from "./runana_debugger.mod.js";
import * as REdit from "./runana_editor.mod.js";
import * as RView from "./runana_view.mod.js";

export class Runana_IDE{
  constructor(opts) {
    opts			= opts			|| {};
    this._container =opts.container || document.body;
    this.database  = opts.database || new DBC.DataBase();
    this.texture = opts.texture || new THREE.TextureLoader().load( "./textures/basic.png" );    
    this.parent =opts.parent || null;
    this.version=opts.version || 'undefine';

    this.selectedMenuPosition=0;
    this.flgVE=false;
    this.editor=RcreateElement(ConstIDE.editor);
    this.editorController=new REdit.Editor({container:this.editor,parent:this,texture:this.texture});
    this.debugger=new RDebug.Runana_Debugger({parent:this});
    this.viewer=RcreateElement(ConstIDE.viewer);
    this.viewerController=new RView.Viewer({container:this.viewer,parent:this,texture:this.texture});
    this.panel=RcreateElement(ConstIDE.panel);
    this.panelController=new PanelC.Panel({container:this.panel,parent:this,version:this.version});
    this.menu=RcreateElement(ConstIDE.menu);
    this._openFirstPage();

    var __bind	= function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
    this._$onClick	= __bind(this._onClickMenu	, this);
    this.menu.addEventListener( 'click', this._$onClick, { passive: false } );
  }
  /*                             */
  /* Methods for User Interface  */
  /*                             */
  Joystick(buttonName,deltaX,deltaY){
    //0:r 1:d 2:l 3:u
    console.log('here');
    if(this._container.children[0]==this.panel)this.panelController.Joystick(buttonName,deltaX,deltaY);
    else if(this._container.children[0]==this.viewer)this.viewerController.Joystick(buttonName,deltaX,deltaY);
    else if(this._container.children[0]==this.editor)this.editorController.Joystick(buttonName,deltaX,deltaY);
    else if(this._container.children[0]==this.menu){
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
    }
  }
  /*                             */
  /* Methods for myself          */
  /*                             */

  OnResize() {
    if(this._container.children[0]==this.viewer)this.viewerController.OnResize();
    if(this._container.children[0]==this.editor)this.editorController.OnResize();
    if(this._container.children[0]==this.panel)this.panelController.OnResize();
  }
  
  _openFirstPage(){
    while(this._container.children.length>0)this._container.removeChild(this._container.children[0]);
    this.panelController.OpenFirstPage(DBC.SaveDB(this.database));
    this._container.appendChild(this.panel);
  }

  _openExtPanel(){
    while(this._container.children.length>0)this._container.removeChild(this._container.children[0]);
    this._container.appendChild(this.panel);
    this.panelController.OpenExtPanel();
  }

  ExitFirstPage(jsontext){
    while(this._container.children.length>0)this._container.removeChild(this._container.children[0]);
    this.database=DBC.OpenDB(jsontext);
    DBC.SetDnum(this.database,0);
    this.editorController._setDataSet(DBC._getDataSet(this.database));
    this.editorController._setupLayer();
    this._container.appendChild(this.editor);
    this.editorController.OnResize();
  }

  OpenMenu(){
    const menuInfo=[0,5];
    while(this.menu.children.length>0)this.menu.removeChild(this.menu.children[0]);
    let com=new Array(menuInfo[1]);
    for(let i=0;i<menuInfo[1];++i){
      com[i]= RcreateElement(ConstIDE.menuItem);
      com[i].style.height =Math.floor(100/menuInfo[1])+"%"; 
      com[i].value=ConstIDE.CaptionMenu[menuInfo[0]+i];
      this.menu.appendChild(com[i]);
    }
    if(this._container.children[0]==this.viewer)this.flgVE=true;
    if(this._container.children[0]==this.editor)this.flgVE=false;
    while(this._container.children.length>0)this._container.removeChild(this._container.children[0]);    
    this._container.appendChild(this.menu);
    this._setSelectedMenuItem(0);
  }

  OnClickESC(){
    this.OpenMenu();
  }

  _setSelectedMenuItem(num){
    let list=this._container.querySelectorAll('input');//B          
    if(num<0||num==list.length)return;
    this.selectedMenuPosition=num;
    for(let item of list){
      item.style.backgroundColor='#e0e0e0';
    }
      list[this.selectedMenuPosition].style.backgroundColor='yellow';
  } 
  /*                             */
  /* Methods from Menu           */
  /*                             */
  _onClickMenu(event){  //for menu
    this._onClickMenuDo(event.target.value);
  }

  _onClickMenuDo(value){
    let num = -1;
    for(let i in ConstIDE.CaptionMenu){
      if(value==ConstIDE.CaptionMenu[i])num=i;
    }
    switch(Number(num)){
      case 0: //FullScreen off
        if(document.fullscreen){ //cancelFullScreen
          if (document.webkitRequestFullscreen) document.webkitExitFullScreen();
          if (document.mozRequestFullScreen) document.mozCancelFullScreen(); 
          if (document.msRequestFullscreen) document.msExitFullscreen(); 
            document.exitFullscreen(); 
        }else{ //fullScreen
          let target=document.body;
          if (target.webkitRequestFullscreen) target.webkitRequestFullscreen(); 
          else if (target.mozRequestFullScreen) target.mozRequestFullScreen(); 
          else if (target.msRequestFullscreen) target.msRequestFullscreen(); 
          else if(target.requestFullscreen) target.requestFullscreen(); 
        }
        break;
      case 1: // ChangeVE
        while(this._container.children.length>0)this._container.removeChild(this._container.children[0]);
        if(this.flgVE){
          this._container.appendChild(this.editor);
        }else{
          const dataS=this.editorController.GetDataSet();
          this._container.appendChild(this.viewer);
          this.viewerController.OpenView(dataS);
        }
        return;
      case 2: //ChangeLayer
        this._openExtPanel();
        return;
      case 3: //Save&Exit
        this._openFirstPage();
        return;
      case 4://Cancel 5
        break;
    }
    while(this._container.children.length>0)this._container.removeChild(this._container.children[0]);
    if(this.flgVE){
      this._container.appendChild(this.viewer);
    }else{
      this._container.appendChild(this.editor);
    }
  }
  /*                             */
  /* Methods from Panel          */
  /*                             */
  ExtPanel(type,opts){
    if(type=='Edit'){ //edit //procedure for changeing DB
      DBC.SetDnum(this.database,opts);
      DBC.SetSelectedLayer(this.database,0);
      this.editorController._setDataSet(DBC._getDataSet(this.database));
      this._container.removeChild(this.panel);
      this._container.appendChild(this.editor);
      this.editorController._setupLayer();  
    }
    if(type=='DEL')DBC.DelDataSet(this.database,opts);//DEL
    if(type=='New')DBC.AddDataSet(this.database,opts);//New
    if(type=='Copy')DBC.CopyDataSet(this.database,opts.num1,opts.name1);//Copy
    if(type=='Rename')DBC.RenameDataSet(this.database,opts.num1,opts.name1);//Rename
  }

  CancelPanel(){
    this._container.removeChild(this.panel);
    this._container.appendChild(this.editor);
    this.editorController._setupLayer();
  }

  GetDataBase(){
    return Object.assign({},this.database);
  }

  SetDataBase(database){
    const newDB=Object.assign({},database);
    this.database=newDB;
  }

  Debug(){
    return this.debugger.start(this.database);
  }
}
/*                             */
/* Methods for Global          */
/*                             */

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
