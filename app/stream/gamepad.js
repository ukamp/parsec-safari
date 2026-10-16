// Standard Gamepad layout only; no device names or identifiers are logged.
export class GamepadManager {
  constructor(onButton,onAxis,onDisconnect,onStatus=()=>{
  },options={
  }) {
    Object.assign(this,{
      onButton,onAxis,onDisconnect,onStatus
    });
    this.provider=options.provider||(()=>navigator.getGamepads?.()||[]);
    this.state={
    };
    this.paused=options.paused===true;
    this.closed=false;
    this.lastStatus='';
    this.cancel=options.cancel||(id=>clearInterval(id));
    this.interval=(options.schedule||setInterval)(()=>this._poll(),20);
    this._poll();
  }
  neutral(index,state){
    for(let b=0;
    b<state.buttons.length;
    b++)if(state.buttons[b])this.onButton(index,b,0);
    for(let a=0;
    a<state.axes.length;
    a++)if(state.axes[a])this.onAxis(index,a,0);
  }
  _poll(){
    if(this.closed)return;
    let pads;
    try{
      pads=this.provider()||[];
    }catch{
      pads=[];
    }
    let connected=0,standard=0,activeInputs=0;
    const pressedButtons=new Set();
    for(let i=0;
    i<4;
    i++){
      const pad=pads[i]?.connected===false?null:pads[i];
      if(pad){
        connected++;
        if(pad.mapping==='standard')standard++;
      }
      if(this.paused||!pad||pad.mapping!=='standard'){
        if(this.state[i]){
          this.neutral(i,this.state[i]);
          this.onDisconnect(i);
          delete this.state[i];
        }continue;
      }
      const previous=this.state[i]||{
        buttons:[],axes:[]
      },next={
        buttons:[],axes:[]
      };
      for(let b=0;
      b<Math.min(pad.buttons.length,17);
      b++){
        const raw=Number(pad.buttons[b]?.value)||0,value=b===6||b===7?Math.max(0,Math.min(1,Math.round(raw*1024)/1024)):(pad.buttons[b]?.pressed||raw>=.5?1:0);
        next.buttons[b]=value;
        if(value){
          activeInputs++;
          pressedButtons.add(b);
        }if(value!==(previous.buttons[b]||0))this.onButton(i,b,value);
      }
      for(let a=0;
      a<Math.min(pad.axes.length,4);
      a++){
        const raw=Number(pad.axes[a])||0,clamped=Math.max(-1,Math.min(1,raw));
        const value=Math.abs(clamped)<=.12?0:Math.round(Math.sign(clamped)*(Math.abs(clamped)-.12)/.88*1024)/1024;
        next.axes[a]=value;
        if(value)activeInputs++;
        if(value!==(previous.axes[a]||0))this.onAxis(i,a,value);
      }
      this.state[i]=next;
    }
    const status={
      gamepads:connected,standardGamepads:standard,activeInputs,paused:this.paused,pressedButtons:[...pressedButtons]
    },key=JSON.stringify(status);
    if(key!==this.lastStatus){
      this.lastStatus=key;
      this.onStatus(status);
    }
  }
  pause(){
    if(this.closed)return;
    this.paused=true;
    this._poll();
  }
  resume(){
    if(this.closed)return;
    this.paused=false;
    this._poll();
  }
  destroy(){
    if(this.closed)return;
    this.cancel(this.interval);
    for(const [i,state] of Object.entries(this.state)){
      this.neutral(Number(i),state);
      this.onDisconnect(Number(i));
    }this.state={
    };
    this.closed=true;
  }
}
