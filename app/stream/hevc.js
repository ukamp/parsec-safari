// HEVC Annex-B profile_tier_level, ISO/IEC 14496-15 codec string.
export function nalUnits(bytes){
  const starts=[];
  for(let i=0;i+3<bytes.length;i++){
    if(bytes[i]||bytes[i+1])continue;
    const size=bytes[i+2]===1?3:bytes[i+2]===0&&bytes[i+3]===1?4:0;
    if(size&&i+size<bytes.length){if(starts.length>=1024)return [];starts.push({start:i,at:i+size});i+=size-1;}
  }
  return starts.map((n,i)=>({...n,bytes:bytes.subarray(n.at,starts[i+1]?.start??bytes.length)}));
}
export function hevcCodec(sps){
  const rbsp=[];
  for(let i=2;i<sps.length;i++){
    if(i>=4&&sps[i]===3&&sps[i-1]===0&&sps[i-2]===0)continue;
    rbsp.push(sps[i]);
  }
  if(rbsp.length<13)throw Error('truncated HEVC SPS');
  const profile=rbsp[1],space=['','A','B','C'][profile>>6],tier=profile&32?'H':'L';
  let compatibility=0;
  for(let i=0;i<32;i++)if(rbsp[2+(i>>3)]&(128>>(i%8)))compatibility=(compatibility+2**i)>>>0;
  const constraints=rbsp.slice(6,12);
  while(constraints.length&&constraints.at(-1)===0)constraints.pop();
  return 'hvc1.'+space+(profile&31)+'.'+compatibility.toString(16).toUpperCase()+'.'+tier+rbsp[12]+(constraints.length?'.'+constraints.map(x=>x.toString(16).padStart(2,'0').toUpperCase()).join('.'):'');
}
export function inspectHevc(bytes){
  let codec=null,key=false;
  const units=nalUnits(bytes);
  for(const unit of units){
    const n=unit.bytes,type=(n[0]>>1)&63;
    if(n.length<2||(n[0]&128)||(n[1]&7)===0)throw Error('invalid HEVC NAL');
    if(type===33)codec=hevcCodec(n);
    if(type>=16&&type<=21)key=true;
  }
  return {codec,key,nals:units.length,units};
}
export async function supportsHevc(){
  try{return !!(await globalThis.VideoDecoder?.isConfigSupported({codec:'hvc1.1.6.L93.B0',optimizeForLatency:true}))?.supported;}catch{return false;}
}
