
function UncompressJSON2Open(jsontext){
	let uCS;
	try{
		uCS=JSON.parse(jsontext);
	}catch(e){
		return new DataBase();
	}
	return uCS;			
}
function CompressSave2JSON(dataBase){
	return JSON.stringify(dataBase);
}

export function DataBase(){
	this.sprite=new Array(1);
	this.sprite[0]=new Sprite();
	this.selectedSprite=0;
}

export function Sprite(){
  this.name="common";
	this.dataS=new Array(1);
	this.dataS[0]=new DataSet();
	this.selectedDataSet=0;
}

export function DataSet(){
	this.name="root";
	this.dataU={};
	this.selectedLayer=0;
} 

export function DataUnit(opts){
	opts			= opts			|| {};
	this.pos =opts.pos || 0;
	this.name  = opts.name || 'n';
	this.type = opts.type || 0; //0:EDGE 1:Function(関数) 2:Line(入出力) 3: Variable(変数) 4:Class
	this.dir =opts.dir || 15;
	this.val =opts.val || ["",""];
	if(this.type>=0){
		const name=["EDG","EVAL","LINE","VAR","EXT"];
		this.name=name[this.type];	
		if(this.type==0){
			this.val=["0"];
		}else{
			this.val=["",""];
		}
		this.type=this.type	*1000;
	}
}

export function OpenDB(jsonstr){
	return UncompressJSON2Open(jsonstr);
}
//Save database to json string
export function SaveDB(database){
	return CompressSave2JSON(database);
}

export function DataExist(database,pnum){
	let res=true;
	if(GetDataUnit(database,pnum)==null)res=false;
	return res;
}

export function DataExist4DS(dataset,pnum){
	let res=true;
	if(GetDataUnit4DS(dataset,pnum)==null)res=false;
	return res;
}

export function GetDnum(database){
	const selectedSprite=database.selectedSprite;
	return database.sprite[selectedSprite].selectedDataSet;
}

export function SetDnum(database,newNum){
	const selectedSprite=database.selectedSprite;
	database.sprite[selectedSprite].selectedDataSet=newNum;
}
// create new DataUnit at idnum by type
export function CreateDataUnit(IDnum,type){
	let dataU=new DataUnit();
	dataU.type=type*1000;
	const name=["EDG","EVAL","LINE","VAR","EXT"];
	dataU.name=name[type];
	dataU.pos=IDnum;
	if(type==0){
		dataU.val=["0"];
	}else{
		dataU.val=["",""];
	}
	return dataU;	
}
// Set DataUnit
export function SetDataUnit(database,dataU){
	const copyDataU=Object.assign({},dataU)
	_getDataSet(database).dataU [dataU.pos]=copyDataU;
}

export function SetDataUnit4DS(dataset,dataU){
	const copyDataU=Object.assign({},dataU)
	dataset.dataU [dataU.pos]=copyDataU;
}

//get dataunit
export function GetDataUnit(database,pnum){
	let result=null;
	if(_getDataUnit(database,pnum))result=Object.assign({},_getDataUnit(database,pnum));
	return 	result;
}

export function GetDataUnit4DS(dataset,pnum){
	let result=null;
	if(_getDataUnit4DS(dataset,pnum))result=Object.assign({},_getDataUnit4DS(dataset,pnum));
	return 	result;
}

function _getDataUnit(database,pnum){
	return _getDataSet(database).dataU [pnum];
}

function _getDataUnit4DS(dataset,pnum){
	return dataset.dataU [pnum];
}


export function SetDataSet(database,dataset){
	const newDS=Object.assign({},dataset)
	const selectedDataset=_getSprite(database).selectedDataSet;
	_getSprite(database).dataS[selectedDataset]=newDS;
}

export function GetDataSet(database){
	const result=Object.assign({},_getDataSet(database));
	return result;
}

export function GetSprite(database){
	const result=Object.assign({},_getSprite(database));
	return result;
}

export function _getSprite(database){
	const selectedSprite=database.selectedSprite;
	return database.sprite[selectedSprite];
}

export function EraseDataUnit(database,pnum){
	delete	_getDataSet(database).dataU [pnum];
}

export function EraseDataUnit4DS(dataset,pnum){
	delete	dataset.dataU [pnum];
}

export function AddDataSet(database,name1){
	let dataS=new DataSet();
	dataS.name=name1;
	_getSprite(database).dataS.push(dataS);
}

export function CopyDataSet(database,num1,name1){
	let orgDS=Object.assign({},GetSprite(database).dataS[num1]);
	orgDS.name=name1;
	GetSprite(database).dataS.push(orgDS);
}

export function DelDataSet(database,num1){
	_getSprite(database).dataS.splice(num1,1);
	if(GetDnum(database)==num1)SetDnum(database,0);
}
		
export function RenameDataSet(database,num,name){
	_getSprite(database).dataS[num].name=name;;
}		

export function GetSelectedLayer(database){
	return GetDataSet(database).selectedLayer;
}

export function _getDataSet(database){
	const selectedDataset=_getSprite(database).selectedDataSet;
	return _getSprite(database).dataS[selectedDataset];
}

export function SetSelectedLayer(database,num){
	_getDataSet(database).selectedLayer=num;
}