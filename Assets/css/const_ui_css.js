
export const canvas={
  tag:'div',
  class:'canvas',
  css:{
    position: 'absolute',
    width:'100%',
    height:'100%',
    'backgroundcolor':'0x3300ff'  
  }
}

export const leftUI={
  tag:'div',
  class:'leftUI',
  css:{
    position: 'absolute',
    left: '0px',
    top: '0px',
    width:'25%',
    height:'100%'
  }
}

export const rightUI={
  tag:'div',
  class:'rightUI',
  css:{
    position: 'absolute',
    left: '75%',
    top: '0px',
    width:'25%',
    height:'100%'
  }
}

export const joystick={
  tag:'div',
  class:'joystick',
  css:{
    position: 'absolute',
    '-webkit-user-select'	: 'none',
    '-moz-user-select'	: 'none',
    top:'50%',
    width:'100%',
    height:'50%',
  }
}

export const inputX={
  tag:'input',
  type:'button',
  value:'X',
  class:'inputX',
  css:{
    position: 'absolute',
    top:'0%',
    width:'100%',
    height:'50%',
    opacity: '0'
  }
}

export const inputA={
  tag:'input',
  type:'button',
  value:'A',
  class:'inputA',
  css:{
    position: 'absolute',
    top:'0%',
    width:'100%',
    height:'50%',
    opacity: '0'
  }
}

export const inputB={
  tag:'input',
  type:'button',
  value:'B',
  class:'inputB',
  css:{
    position: 'absolute',
    top:'50%',
    width:'100%',
    height:'50%',
    opacity: '0'
  }
}
