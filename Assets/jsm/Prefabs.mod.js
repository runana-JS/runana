//Edge
export var Edge =function(){
  var obj= new THREE.Group();
  obj.rotation.set(Math.PI/2,0,0);
  for(let i=0;i<6;++i)obj.add(edge(i));
  obj.class="Edge";
  return obj;
}

//Cube Object
export var Cube =function(opts){
  opts			= opts			|| {};
  const texture = opts.texture || new THREE.TextureLoader().load( "./textures/basic.png" );
  let geometry = new THREE.BoxGeometry(60, 60, 60);
  let material = new THREE.MeshPhongMaterial({color:0xffffff,map:texture});
  let obj= new THREE.Mesh(geometry, material);
  obj.rotation.set(Math.PI/2,0,0);
  for(let i=0;i<6;++i)obj.add(edge(i));
  obj.class="Cube";
  return obj;
}

// Sphere object
export var Sphere =function(opts){
  opts			= opts			|| {};
  const texture = opts.texture || new THREE.TextureLoader().load( "./textures/basic.png" );
  var geometry = new THREE.SphereGeometry( 30, 60, 60 );
  var material = new THREE.MeshToonMaterial( {color: 0xffffff,map:texture} );
  var obj= new THREE.Mesh(geometry, material);
  obj.rotation.set(Math.PI/2,0,0);
  for(let i=0;i<6;++i)obj.add(edge(i));
  obj.class="Sphere";
  return obj;
}
// Capsule Object
export var Capsule =function(opts){
  opts			= opts			|| {};
  const texture = opts.texture || new THREE.TextureLoader().load( "./textures/basic.png" );
  var geometry = new THREE.CylinderGeometry(30,30,60,50);
  var material = new THREE.MeshToonMaterial( {color: 0xffffff,map:texture} );
  var obj= new THREE.Mesh(geometry, material);
  obj.rotation.set(Math.PI/2,0,0);
  for(let i=0;i<6;++i)obj.add(edge(i));
  obj.class="Capsule";
  return obj;
}
//Ext Object
export var ExtObj =function(){
  var obj= new THREE.Mesh(new THREE.BoxGeometry(60, 60, 60), new THREE.MeshToonMaterial( {color: 0xffffff} ));
  obj.rotation.set(Math.PI/2,0,0);
  for(let i=0;i<6;++i)obj.add(edge(i));
  obj.class="Ext";
  return obj;
}

export var Tray = function(){
  var geometry = new THREE.BoxGeometry(92, 92, 10);
  var material = new THREE.MeshStandardMaterial({color:0x00ffff,transparent:true,opacity:0.4});
  return new THREE.Mesh(geometry, material);
}

//making edge
function edge(num){    
//  var e = new THREE.Mesh(new THREE.CylinderGeometry(10,10,20,30), new THREE.MeshPhongMaterial({color:0xff0000}));
  var e = new THREE.Mesh(new THREE.CylinderGeometry(15,15,50,30), new THREE.MeshPhongMaterial({color:'green'}));// 0xff0000
  if(num==0){ //edge_n;
    e.rotation.set(Math.PI/2,0,0);
    e.position.set(0,0,-25);
    e.class="edge_n";  
  }
  if(num==1){
    e.rotation.set(0,0,Math.PI/2);
    e.position.set(25,0,0);
    e.class="edge_e";  
  }
  if(num==2){
    e.rotation.set(Math.PI/2,0,0);
    e.position.set(0,0,25);
    e.class="edge_s";
  }
  if(num==3){
    e.rotation.set(0,0,Math.PI/2);
    e.position.set(-25,0,0);
    e.class="edge_w";
  }
  if(num==4){
    e.rotation.set(0,Math.PI/2,0);
    e.position.set(0,25,0);
    e.class="edge_u";
    e.visible=false;
  }  
  if(num==5){
    e.rotation.set(0,Math.PI/2,0);
    e.position.set(0,-25,0);
    e.class="edge_d";
    e.visible=false;
  }
  return e;
}

export function init(){
  const basictexture = new THREE.TextureLoader().load( "./textures/basic.png" );
}

