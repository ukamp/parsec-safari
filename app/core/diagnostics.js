export function createDiagnostics($){
  const history=[],lastStage=new Map();
  function note(stage,text){
    $('status').textContent=text;
    history.push({
      time:new Date().toISOString(),stage
    });
    if(history.length>300)history.shift();
    $('log').textContent=history.map(x=>x.time+' · '+x.stage+(x.metrics?' · '+JSON.stringify(x.metrics):'')).join('\n');
  }
  function diagnostic(stage,metrics={
  }){
    const now=Date.now();
    if(now-(lastStage.get(stage)||0)<1000)return;
    lastStage.set(stage,now);
    const safe={
    };
    for(const key of ['packets','receivedBytes','appended','completed','queuedBytes','waitingForInit','sourceOpen','bufferedRanges','readyState','mediaError','paused','firstPacketBytes','controlPackets','audioPackets','audioBytes','streamRequested','shutter','hostCode','submitted','decoded','dropped','waitingForKeyframe','decodeQueueSize','width','height','audioReceivedPackets','audioDecodedPackets','audioScheduledFrames','audioDroppedPackets','audioDecodeErrors','audioUnsupportedPackets','audioNonSilentBuffers','audioDecoderReady','audioNativeDecoder','audioContextRunning','gamepads','standardGamepads','activeInputs','rtPresses','rtReleases','rtValue','focusLosses','pageFocused','focusTarget']){
      const value=metrics[key];
      if(typeof value==='boolean'||(typeof value==='number'&&Number.isFinite(value)&&(key==='hostCode'||value>=0)))safe[key]=value;
    }history.push({
      time:new Date().toISOString(),stage,metrics:safe
    });
    if(history.length>300)history.shift();
    $('log').textContent=history.map(x=>x.time+' · '+x.stage+(x.metrics?' · '+JSON.stringify(x.metrics):'')).join('\n');
  }
  return {
    note,diagnostic,events:()=>history.map(event=>({
      ...event
    }))
  };
}
