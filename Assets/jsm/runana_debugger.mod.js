import * as DBC from "./DBController.mod.js";

var _Global_Var={};
var console_log='';

export class Runana_Debugger{
  constructor(opts){
    opts			= opts			|| {};
    this.database  = opts.database || new DBC.DataSet();
    this.parent =opts.parent || null;

    this.input=null;
  } 
  start(database){
    this.database=database;
    console_log='';
    var debugDataS=new _debugDataS(database.sprite[0].dataS[0]);
    debugDataS.exe();
    return console_log;
  }
  getLog(){
    return console_log;
  }
}

class _debugDataS{
  constructor(dataS){
    this.que=[];
    this.mark=[];  
    this.dataS =dataS;
    for (let key in dataS.dataU){  
      switch(Number(dataS.dataU[key].type)){
        case  3101:   //mark
          this.mark.push({pos:key,name:dataS.dataU[key].val[0]});
          break;
        case  3302:   //start
          this.que.push({from:key,to:key,tof:true,wait:0});
          break;
        case  3000:   //val          
          eval(parseVar(dataS.dataU[key].val[0]+"="+dataS.dataU[key].val[1]));
          break;
      }
    }
  }
  caldir(num){
    const div=[[0,5,0],[1,0,0],[0,1,0],[5,0,0],[0,0,1],[0,0,5]]
    let res=[-1,-1,-1,-1,-1,-1];
    for(let i=0;i<6;++i){
      const intD=(1<<i);
      if ((this.dataS.dataU[num].dir&intD)==intD){
        res[i]=(((num%6)+div[i][0])%6)+((parseInt(num/6)%6+div[i][1])%6)*6+((parseInt(num/36)+div[i][2])%6)*36;
      }
    }
    return res;  
  }
  exe(){
    while(this.que.length>0){
      let d=this.que.shift();
      if(!DBC.DataExist4DS(this.dataS,d.to))continue;
      const to=d.to;
      const from=d.from;
      let tof=d.tof;
      let wait=d.wait;
      const dtype=Number(this.dataS.dataU[to].type);
      if(dtype==0)continue;
      if((tof==false) && !(dtype==1302 ||(dtype==1)))continue;
      if((tof==true) && (dtype==1302))continue;
      tof=this.exeDataU(to,tof);
      if (dtype==1 ){
        if(wait==0) {
          wait=parseInt(this.dataS.dataU[to].val[0]);
        }else{
          wait-=1;
        }
        if(wait>0){
          this.que.push({from:from,to:to,tof:tof,wait:wait});
          continue;
        }
      }
      const newdir=this.caldir(to);
      for(let i=0;i<6;++i){
        if ((newdir[i]>=0) && (newdir[i]!=from))this.que.push({from:to,to:newdir[i],tof:tof,wait:wait});
      }
    } 
  }
  exeDataU(pos,tof){
    const dataU=this.dataS.dataU[pos];
    const type=Number(dataU.type);
    const val=dataU.val;
    switch(type){
      case 1000:
      case 1401:  //eval
        eval(parseVar(val[0]));
        break;
      case 3000:
      case 2000:       //eval,LINE
        eval(parseVar(val[0]+"="+val[1]));
        break;
      case 1201: //sort
        eval(parseVar(val[0]+"="+val[0]+".sort(this.compareFunc)"));
        break;
      case 1202: //rsort
        eval(parseVar(val[0]+"="+val[0]+".sort(this.compareFuncR)"));
        break;
      case 1301:
      case 1303:
      case 1304:       //f,for,while
        return eval(parseVar(val[0]));
        break;
      case 1302:       //rev  
        tof=true;
        break; 
      case 2101:       //gets
        if(flgCoder){
          eval(parseVar(val[0]+"=input["+tnum+"]"));
          tnum++;
        } else{
          eval((val[0]+"= readline()"));
        } 
        break;
      case 2102:       //in[]
        if(flgCoder){
          eval((val[0]+"=input["+tnum+"]"));
          tnum++;
        } else{
          eval(parseVar(val[0]+"= readline()"));
        }
        eval(parseVar(val[0]+" = "+val[0]+".split('"+val[1]+"')"));
        break;
      case  2304:       //out[]

        eval(parseVar("console.log("+val[0]+".join('"+val[1]+"'))"));
        break;
      case 2302:
      case 2303:       //puts,print
        eval(parseVar("console.log("+val[0]+")"));
        break;
      case 3201: //toi
        eval(parseVar(val[0]+"= parseInt("+val[0]+")"));
        break;
      case 3203: //tos
        eval(parseVar(val[0]+"= String("+val[0]+")"));
        break;
      case 3205: //tof
        eval(parseVar(val[0]+"= parseFloat("+val[0]+")"));
        break;
      case 3202: //mtoi
        eval(parseVar(val[0]+"= "+val[0]+".map(str => parseInt(str))"));
        break;
      case 3204: //mtof
        eval(parseVar(val[0]+"= "+val[0]+".map(str => parseFloat(str))"));
        break;
      case 3206: //mtos
        eval(parseVar(val[0]+"= "+val[0]+".map(str => String(str))"))
        break;
      }
    return tof;
  }
  compareFunc(a, b) {
    return a > b;
  }
  compareFuncR(a, b) {
    return  b > a;
  }
  getDataS(num){
    return this.dataS[num];
  }
}

function parseVar(str){
  const orgstr=new String(str);
  let newstr='';
  let flgD=false;
  let flgS=false;
  for(let i=0;i<orgstr.length;++i){
    if(!flgD&&!flgS){
      if(orgstr[i]=="@"){
        if(orgstr[i+1]=="@"){
          i++;
          newstr+='_Global_Var.';
        }else{
          newstr+='this.';
        }  
      }else if(orgstr[i]=="$"){
        newstr+='_Global_Var.';
      }else if(orgstr[i]=="."){
        if(orgstr[i+1]=="."){
          if(orgstr[i+2]=="."){
            i+=2;
            newstr+='_Global_Var.';
          }else{
            i++;
            newstr+='this.';
          }  
        }else{
          newstr+=orgstr[i];
        }  
      }else{
        newstr+=orgstr[i];
      }        
    }else if(orgstr[i]=='"'){
      if(flgD)flgD=false;
      else flgD=true;
    }else if(orgstr[i]=="'"){
      if(flgS)flgS=false;
      else flgS=true;
    }else {
      newstr+=orgstr[i];
    }
  }
  return newstr;
}

console.log = function (log) {
  console_log += "> "+log + "\n";
}
