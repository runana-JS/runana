import * as DBC from "./DBController.mod.js";
import * as ConstP from "../css/const_panel_css.js" ;

export class Panel{
  constructor(opts){
    opts			= opts			|| {};
    this._container =opts.container || document.body;
    this.database  = opts.database || new DBC.DataBase();
    this.parent =opts.parent || null;
    this.panelDataU =opts.dataU || new DBC.DataUnit();
    this.version = opts.version || 'undefine';

    this.selectedPosition=0;
    this.cap1=null;
    this.cap2=null;
    var __bind	= function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
    this._$onClick	= __bind(this._onClick	, this);
    this._$onChange	= __bind(this._onChange	, this);
    this._container.addEventListener( 'click', this._$onClick, { passive: false } );
    this._container.addEventListener( 'change', this._$onChange, { passive: false } );
 
  }
  /*                             */
  /* Methods for User Interface  */
  /*                             */
  _onClick(event){
    const name=event.target.name;
    this._onClickByName(name);
  }

  _onClickByName(clickname){
    const CaptionEdge=ConstP.CaptionEdge;      
    const extselect=this._container.querySelector("[name='extselect']");        
    switch(clickname){
      case 'firstStart':
        const jsontext=this._container.querySelector("[name='jsonArea']").value;
        this.parent.ExitFirstPage(jsontext);
        break;
      case 'firstUpdate':
        navigator.serviceWorker.getRegistration()
        .then(registration => {
          registration.unregister();
        })
        location.reload();
        break;
      case 'commonCancel': //Cancel
        this.parent.CancelPanel();
        break;
      case 'commonOK': //OK
        if(this.panelDataU.type==0){//edge
          this.panelDataU.val=this._container.querySelector("[name='input1']").value;
        } else if(this.panelDataU.type<4000){ //cube
          const select=this._container.querySelector("[name='select']");
          this.panelDataU.name=select.options[select.selectedIndex].text;
          this.panelDataU.type=select.options[select.selectedIndex].value;
          let newval=[];
          const input1=this._container.querySelector("[name='input1']");
          const input2=this._container.querySelector("[name='input2']");
          if(input1.style.display=="block")newval=[input1.value];
          if(input2.style.display=="block")newval=[input1.value,input2.value];
          this.panelDataU.val=newval;
        }else{ //ext
          const select=this._container.querySelector("[name='selectext']");
          this.panelDataU.name=select.options[select.selectedIndex].text;
          this.panelDataU.type=4000;
        }
        this.parent.SubmitPanel(this.panelDataU);
        break;    
      case 'extButton1_0': //Edit
        if(extselect.selectedIndex>=0){
          this.parent.ExtPanel('Edit',extselect.options[extselect.selectedIndex].value);
        }
        break;
      case 'extButton1_1': //DEL
        if(extselect.selectedIndex>=0){
          const num=extselect.options[extselect.selectedIndex].value;
          if(num>0)this.parent.ExtPanel('DEL',num);
          this._setExtSelect();
        }
        break;
      case 'extButton2_0': //New
        const name=this._container.querySelector("[name='input1']").value;
        if(name!=""){
          this.parent.ExtPanel('New',name);
          this._setExtSelect();
        }
        break;
      case 'extButton2_1': //Copy
        if(extselect.selectedIndex>=0){
          const name=this._container.querySelector("[name='input1']").value;
          const num=extselect.options[extselect.selectedIndex].value;
          if(name!=""&&num>=0){
            this.parent.ExtPanel('Copy',{num1:num,name1:name});
            this._setExtSelect();
          }
        }
        break;
      case 'extButton2_2': //Rename
        if(extselect.selectedIndex>=0){
          const name=this._container.querySelector("[name='input1']").value;
          const num=extselect.options[extselect.selectedIndex].value;
          if(name!=""&&num>0){
            this.parent.ExtPanel('Rename',{num1:num,name1:name});
            this._setExtSelect();
          }
        }
        break;
      case CaptionEdge[0]:
      case CaptionEdge[1]:
      case CaptionEdge[2]:
      case CaptionEdge[3]:
      case CaptionEdge[4]:
      case CaptionEdge[5]:
        const questr="[name='"+clickname+"']";
        let obj =this._container.querySelector(questr);
        let cnum;
        for(let i=0;i<6;++i){
          if(clickname== CaptionEdge[i])cnum=i;
        }
        const prestr=["N","E","S","W","U","D"];
        let str=prestr[cnum];
        const bnum=(1<<cnum);
        if((this.panelDataU.dir&bnum)>0){
          this.panelDataU.dir-=bnum;
        } else{
          this.panelDataU.dir+=bnum;
          str+=" out";
        }
        obj.value=str;
        break;
      default: //
        break;
    }    
  }

  _onChange(event){
    const name=event.target.name;
    if(name=='select')this._onChangeSelect();
    if(name=='extselect')this._onChangeExtSelect();
  }

  Joystick(buttonName,deltaX,deltaY){
    switch(buttonName){
      case 'button_X':
      case 'button_A':
        this._onClickByName('commonCancel');
        break;
      case 'button_B':
        const list=this._container.querySelectorAll('input');
        const name=list[this.selectedPosition].name;
        this._onClickByName(name);
        break;
      default:
          if(buttonName=='button_Up')this._setSelectedPanel(this.selectedPosition-1);
          if(buttonName=='button_Down')this._setSelectedPanel(this.selectedPosition+1);
        break;
    }
  }

   /*  Open first psage */
  OpenFirstPage(jsontext){
    while(this._container.children.length>0)this._container.removeChild(this._container.children[0]);
    let base=RcreateElement(this._container, ConstP.firstPage);
    let Title=RcreateElement(base,ConstP.firstPageTitle);
    let SubTitle=RcreateElement(base,ConstP.firstPageSubTitle);
    SubTitle.value=this.version;
    let jsonArea =RcreateElement(base,ConstP.jsonArea); 
    jsonArea.textContent=jsontext;
    let startButton = RcreateElement(base,ConstP.firstStart);
  }
  /* Open Panel for dataUnit */
  OpenPanel(dataU){
    while(this._container.children.length)this._container.removeChild(this._container.children[0]);
    let panel = RcreateElement(this._container,ConstP.panel);
    let Title= RcreateElement(panel,ConstP.panelTitle);
    this.panelDataU=dataU;
  
    if(dataU.type==0){
      Title.textContent='Edge Editor';
      let item1= RcreateElement(panel,ConstP.cap);
      let item2= RcreateElement(panel,ConstP.input);
      item1.textContent="Time";
      item2.value=dataU.val[0];

    }else if(dataU.type<4000){
      Title.textContent='Cube Editor';
      const cap= RcreateElement(panel,ConstP.cap);
      let select =RcreateElement(panel,ConstP.select);
      this.cap1= RcreateElement(panel,ConstP.cap);
      let input1= RcreateElement(panel,ConstP.input);
      input1.name='input1';
      this.cap2= RcreateElement(panel,ConstP.cap);
      let input2= RcreateElement(panel,ConstP.input);
      input2.name='input2';
      let cubetype=Math.floor(dataU.type/1000);
      let index=0;
      let selectedindex=0;
      const cfgDataSet=ConstP.cfgDataSet;

      for (let i in cfgDataSet.cubelist) {
        if (Math.floor(cfgDataSet.cubelist[i].type/1000)==cubetype) {
          let option = document.createElement("option");
          option.text = cfgDataSet.cubelist [i].name;
          option.value = cfgDataSet.cubelist [i].type;
          select.appendChild(option);
          if(dataU.type == cfgDataSet.cubelist [i].type)selectedindex=index;
          ++index;
        }
      }
      select.options[selectedindex].selected=true;
      this._onChangeSelect();
  
    }else{//ext panel
      Title.textContent='Ext Editor';
      let select =RcreateElement(panel,ConstP.selectext);
      const sprite = DBC.GetSprite(this.parent.GetDataBase());
      ///Caution make select without root i=0
      for(let i in sprite.dataS){
        let option = document.createElement("option");
        option.text = sprite.dataS[i].name;
        option.value = i;
        select.appendChild(option);
        if(option.text==dataU.name)select.selectedIndex=i;
      }  
    }
    const edgeConfig=RcreateElement(panel,ConstP.edgeConfig);
    let edge =new Array(6);
    edge[0]=RcreateElement(edgeConfig,ConstP.edge_N);
    edge[1]=RcreateElement(edgeConfig,ConstP.edge_E);
    edge[2]=RcreateElement(edgeConfig,ConstP.edge_S);
    edge[3]=RcreateElement(edgeConfig,ConstP.edge_W);
    edge[4]=RcreateElement(edgeConfig,ConstP.edge_U);
    edge[5]=RcreateElement(edgeConfig,ConstP.edge_D);
    const img=RcreateElement(edgeConfig,ConstP.img);
    //edge data setting
    const prestr=["N","E","S","W","U","D"];
    for(let i=0;i<6;++i){//NESWUD
      let str=prestr[i];
      const bnum=(1<<i);
      if((this.panelDataU.dir&bnum)>0)str+=" out";
      edge[i].value=str;
    }
    const commonB=RcreateElement(panel,ConstP.commonB);
    const commonOK=RcreateElement(commonB,ConstP.commonOK);
    const commonCancel=RcreateElement(commonB,ConstP.commonCancel);
  
    this.selectedPosition=-1;
    this._setSelectedPanel(0);  
  }
  /* Open Panel for Extension */
  OpenExtPanel(){
    while(this._container.children.length)this._container.removeChild(this._container.children[0]);
    let panel = RcreateElement(this._container,ConstP.panel);
    let Title= RcreateElement(panel,ConstP.panelTitle);
    Title.textContent='Ext Editor';
    let select =RcreateElement(panel,ConstP.extselect);
    const CaptionExtButton=["Edit","DEL","New","Copy","Rename"];
    let extUnit1=RcreateElement(panel,ConstP.extUnit);
    for(let i=0;i<2;++i){
      let item = RcreateElement(extUnit1,ConstP.extButton1);
      item.name=item.name+String(i)
      item.value=CaptionExtButton[i];
    }
    let input1= RcreateElement(panel,ConstP.input);
    this._setExtSelect();
    
    let extUnit2=RcreateElement(panel,ConstP.extUnit);
    for(let i=0;i<3;++i){
      let item = RcreateElement(extUnit2,ConstP.extButton2);
      item.name=item.name+String(i)
      item.value=CaptionExtButton[i+2];
    }
    const commonB=RcreateElement(panel,ConstP.commonB);
    const commonExit=RcreateElement(commonB,ConstP.commonExit);  
    this.selectedPosition=-1;
    this._setSelectedPanel(0);  
  }
  /*                         */
  /*    Methods for myself   */
  /*                         */
  _setSelectedPanel(num){
    let list=this._container.querySelectorAll('input');//B          
    let i=num;
    while(1){
      if(i<0||i==list.length)break;
      if(list[i].style.display!="none"){
        this.selectedPosition=i;
        break;
      }
      if(num>this.selectedPosition)++i;
      if(num<this.selectedPosition)--i;
    }
    for(let item of list)item.style.backgroundColor='white';
    list[this.selectedPosition].style.backgroundColor='yellow';
  }

  _onChangeSelect(){
    let input1=this._container.querySelector("[name='input1']");
    let input2=this._container.querySelector("[name='input2']");

    this.cap1.style.display='none';
    this.cap2.style.display='none';
    input1.style.display='none';
    input2.style.display='none';
    let select=this._container.querySelector("[name='select']");		
    
    let varcap= ConstP.cfgDataSet.cubelist.find((v)=>v.type== select.value).varcap;
    if(varcap.length>0){
      this.cap1.style.display='block';
      input1.style.display='block';
      this.cap1.textContent =varcap[0];
      if(0<this.panelDataU.val.length){
        input1.value =this.panelDataU.val[0];
      }else{
        input1.value ="";
      }
      if(varcap.length>1){
        this.cap2.style.display='block';
        input2.style.display='block';
        this.cap2.textContent =varcap[1];
        if(1<this.panelDataU.val.length){
          input2.value =this.panelDataU.val[1];
        }else{
          input2.value ="";
        }
      }
    }
  }

  _onChangeExtSelect(){
    let input1=this._container.querySelector("[name='input1']");
    let select=this._container.querySelector("[name='extselect']");
    input1.value=select.options[select.selectedIndex].text;
  }

  OnResize(){
    
  }

  _setExtSelect(){
    let select=this._container.querySelector("[name='extselect']");
    while(select.options.length>0)select.removeChild(select.options[0]);
    const sprite = DBC.GetSprite(this.parent.GetDataBase());
    for(let i in sprite.dataS){
      let option = document.createElement("option");
      option.text = sprite.dataS[i].name;
      option.value = i;
      select.appendChild(option);
    }
  }
}

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
