import {readPreference,writePreference} from './preferences.js';
import {t} from './i18n.js';
export function createDiagnostics($){
  let enabled=readPreference('parsec-detail-diagnostics',false,x=>x===true);
  const history=[],lastStage=new Map();
  function setEnabled(value){
    enabled=value===true;lastStage.clear();
    writePreference('parsec-detail-diagnostics',enabled);
    const toggle=$('detailDiagnostics'),state=$('detailDiagnosticsStatus');
    if(toggle)toggle.checked=enabled;
    if(state)state.textContent=t(enabled?'diagnostics.recordingOn':'diagnostics.recordingOff');
  }
  const toggle=$('detailDiagnostics');
  if(toggle){toggle.checked=enabled;toggle.onchange=()=>setEnabled(toggle.checked);}
  const state=$('detailDiagnosticsStatus');if(state)state.textContent=t(enabled?'diagnostics.recordingOn':'diagnostics.recordingOff');
  function note(stage,text){
    $('status').textContent=text;
    if(!enabled)return;
    history.push({
      time:new Date().toISOString(),stage
    });
    if(history.length>300)history.shift();
    $('log').textContent=history.map(x=>x.time+' · '+x.stage+(x.metrics?' · '+JSON.stringify(x.metrics):'')).join('\n');
  }
  function diagnostic(stage,metrics={
  }){
    if(!enabled)return;
    const now=Date.now();
    if(now-(lastStage.get(stage)||0)<1000)return;
    lastStage.set(stage,now);
    const safe={
    };
    for(const key of ['packets','receivedBytes','appended','completed','queuedBytes','waitingForInit','sourceOpen','bufferedRanges','readyState','mediaError','paused','firstPacketBytes','controlPackets','audioPackets','audioBytes','streamRequested','shutter','hostCode','submitted','decoded','dropped','waitingForKeyframe','decodeQueueSize','width','height','requestedWidth','requestedHeight','reportedWidth','reportedHeight','displayCount','slotCount','videoIndex','displayIndex','selectedDisplayIndex','selectedMatch','audioReceivedPackets','audioDecodedPackets','audioScheduledFrames','audioDroppedPackets','audioDecodeErrors','audioUnsupportedPackets','audioNonSilentBuffers','audioDecoderReady','audioNativeDecoder','audioContextRunning','gamepads','standardGamepads','activeInputs','rtPresses','rtReleases','rtValue','focusLosses','pageFocused','focusTarget']){
      const value=metrics[key];
      if(typeof value==='boolean'||(typeof value==='number'&&Number.isFinite(value)&&(key==='hostCode'||value>=0)))safe[key]=value;
    }history.push({
      time:new Date().toISOString(),stage,metrics:safe
    });
    if(history.length>300)history.shift();
    $('log').textContent=history.map(x=>x.time+' · '+x.stage+(x.metrics?' · '+JSON.stringify(x.metrics):'')).join('\n');
  }
  return {
    note,diagnostic,setEnabled,enabled:()=>enabled,events:()=>history.map(event=>({
      ...event
    }))
  };
}
