export const defaults=()=>({
  bitrate:8,frameRate:60,resolution:'1280x720',volume:100,constantFps:false
});
export function normalizeQuality(value={
}) {
  const d=defaults();
  if(!value||typeof value!=='object')return d;
  if(Number.isInteger(value.bitrate)&&value.bitrate>=1&&value.bitrate<=50)d.bitrate=value.bitrate;
  if([30,60].includes(value.frameRate))d.frameRate=value.frameRate;
  if(['1024x768','1280x720','1280x800','1366x768','1600x900','1680x1050','1920x1080','1920x1200','2560x1440','2560x1600','3440x1440','3840x2160'].includes(value.resolution))d.resolution=value.resolution;
  if(Number.isFinite(value.volume)&&value.volume>=0&&value.volume<=100)d.volume=Math.round(value.volume);
  d.constantFps=value.constantFps===true;
  return d;
}
export function readPreference(key,fallback,normalize=x=>x){
  try{
    return normalize(JSON.parse(localStorage.getItem(key))??fallback);
  }catch{
    return normalize(fallback);
  }
}
export function writePreference(key,value){
  try{
    localStorage.setItem(key,JSON.stringify(value));
    return true;
  }catch{
    return false;
  }
}
export function streamConfig(quality){
  const q=normalizeQuality(quality),[width,height]=q.resolution.split('x').map(Number);
  return {
    encoder_bitrate:q.bitrate,encoder_fps:q.frameRate,server_resolution_x:width,server_resolution_y:height,full_fps:q.constantFps
  };
}
