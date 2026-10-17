// Independent browser implementation: gestures never inspect or log content.
export class TouchSurface {
  constructor({move,button,wheel,zoom=()=>{},getZoom=()=>1,schedule=setTimeout,cancel=clearTimeout,now=()=>performance.now()}){
    Object.assign(this,{move,button,wheel,zoom,getZoom,schedule,cancel,now});this.points=new Map();this.timer=null;this.dragging=false;
  }
  pair(){const a=[...this.points.values()];return {x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2,d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};}
  down(e){
    e.preventDefault();
    this.points.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(this.points.size===1){
      this.started=this.now();this.origin={x:e.clientX,y:e.clientY};this.multi=false;this.moved=false;this.gesture=null;
      this.move(e.clientX,e.clientY,0,0,true);
      this.timer=this.schedule(()=>{this.timer=null;if(this.points.size===1&&!this.moved&&!this.multi){this.button(1,true);this.dragging=true;}},450);
    }else{
      this.cancelTimer();if(this.dragging){this.button(1,false);this.dragging=false;}
      this.multi=true;this.gesture=null;
      if(this.points.size===2){this.initial=this.pair();this.previous=this.initial;this.initialZoom=this.getZoom();}
    }
  }
  moveEvent(e){
    const previous=this.points.get(e.pointerId);if(!previous)return;
    e.preventDefault();this.points.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(this.points.size===2){
      const p=this.pair();
      if(!this.gesture){
        if(Math.abs(p.d-this.initial.d)>12)this.gesture='zoom';
        else if(Math.hypot(p.x-this.initial.x,p.y-this.initial.y)>7)this.gesture='scroll';
      }
      if(this.gesture==='zoom'&&this.initial.d>0)this.zoom(this.initialZoom*p.d/this.initial.d);
      else if(this.gesture==='scroll')this.wheel(-(p.x-this.previous.x),-(p.y-this.previous.y));
      this.previous=p;return;
    }
    if(this.multi)return;
    if(Math.hypot(e.clientX-this.origin.x,e.clientY-this.origin.y)>7){this.moved=true;this.cancelTimer();}
    this.move(e.clientX,e.clientY,e.clientX-previous.x,e.clientY-previous.y,false);
  }
  up(e){
    if(!this.points.has(e.pointerId))return;e.preventDefault();this.cancelTimer();this.points.delete(e.pointerId);
    if(this.points.size)return;
    if(this.dragging){this.button(1,false);this.dragging=false;}
    else if(this.multi&&!this.gesture&&this.now()-this.started<400){this.button(3,true);this.button(3,false);}
    else if(!this.multi&&!this.moved&&this.now()-this.started<400){this.button(1,true);this.button(1,false);}
    this.multi=false;
  }
  cancelTimer(){if(this.timer!==null)this.cancel(this.timer);this.timer=null;}
  reset(){this.cancelTimer();if(this.dragging)this.button(1,false);this.dragging=false;this.points.clear();this.multi=false;}
}
