// Current control layout corroborated by lowlat's independent browser client:
// three big-endian int32 arguments, then the opcode at byte 12.
function control(type,a=0,b=0,c=0,body) {
  const out=new ArrayBuffer(13+(body?.byteLength||0)),v=new DataView(out);
  v.setInt32(0,a);
  v.setInt32(4,b);
  v.setInt32(8,c);
  v.setUint8(12,type);
  if(body)new Uint8Array(out,13).set(body);
  return out;
}
function text(type,id,value) {
  const encoded=new TextEncoder().encode(value),body=new Uint8Array(encoded.byteLength+1);
  body.set(encoded);
  return control(type,body.byteLength,id,0,body);
}
export function init(cfg={
}) {
  return text(11,0,JSON.stringify({
    _version:1,_max_w:60000,_max_h:60000,_flags:0,
    resolutionX:cfg.server_resolution_x||1280,resolutionY:cfg.server_resolution_y||720,
    mediaContainer:0,refreshRate:60
  }));
}
export function config(cfg={
}) {
  return text(17,11,JSON.stringify({
    video:[{
      encoderMaxBitrate:cfg.encoder_bitrate||8,encoderFPS:cfg.encoder_fps||60,fullFPS:false
    }]
  }));
}
export function reinit(){
  return control(13,0,0,1);
}
export function abort(){
  return control(10);
}
export function motion(relative,x,y){
  return control(3,relative,x,y);
}
export function mouse(button,down){
  return control(1,button,down);
}
export function kb(code,mod,down){
  return control(0,code,mod,down);
}
export function mouseWheel(x,y){
  return control(2,x,y);
}
export function button(button,down,id){
  return control(4,button,down,id);
}
export function axis(axis,value,id){
  return control(5,axis,value,id);
}
export function unplug(id){
  return control(6,0,0,id);
}
export function release(){
  return control(24);
}
export function unpack(buf) {
  if(!(buf instanceof ArrayBuffer)||buf.byteLength<13||buf.byteLength>1024*1024)throw Error('control size');
  const v=new DataView(buf),m={
    type:v.getUint8(12),data0:v.getInt32(0),data1:v.getInt32(4),data2:v.getInt32(8)
  };
  if(m.type===9){
    if(buf.byteLength<34)throw Error('cursor size');
    const size=v.getInt32(16);
    if(size<0||size>buf.byteLength-34)throw Error('cursor payload');
    const flags=v.getUint16(32);
    m.relative=!!(flags&256);
    m.hidden=!!(flags&512);
  }
  return m;
}
