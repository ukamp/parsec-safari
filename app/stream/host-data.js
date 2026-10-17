// Parse only observed user-data envelopes; never log their text payloads.
export function hostData(message,buffer){
  if(message.type!==17||![11,12].includes(message.data1))return null;
  const length=message.data0;
  if(!Number.isInteger(length)||length<1||length>65536||length>buffer.byteLength-13)return null;
  try{
    const bytes=new Uint8Array(buffer,13,length);
    const end=bytes.at(-1)===0?bytes.length-1:bytes.length;
    const data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(0,end)));
    if(message.data1===12&&Array.isArray(data)){
      const displays=data.slice(0,32).filter(x=>x&&typeof x.id==='string'&&x.id.length>0&&x.id.length<=128&&!/[\x00-\x1f]/.test(x.id)).map(x=>({id:x.id,name:typeof x.name==='string'?x.name.slice(0,160):x.id}));
      return {displays};
    }
    return null;
  }catch{return null;}
}
