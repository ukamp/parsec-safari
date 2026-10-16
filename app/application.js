import { Client } from './stream/client.js';
import { FullscreenView } from './browser/fullscreen.js';
import { authenticatePersonal } from './core/personal-auth.js';
import { createApi } from './core/api.js';
import { createDiagnostics } from './core/diagnostics.js';
import { createRouter } from './features/router.js';
import { HostList } from './features/host-list.js';
import { setupQuality } from './features/quality-settings.js';
import { StreamStatistics } from './features/statistics.js';
import { setupGamepads } from './features/gamepad-panel.js';
import { setupWake } from './features/wake-controller.js';
import { setupMediaTests } from './features/media-tests.js';
const $=id=>document.getElementById(id);
let session=null,client=null,generation=0,controller=null,pollTimer=null,frameTimer=null,fullscreenView=null;
const diagnostics=createDiagnostics($),{
  note,diagnostic
}=diagnostics;
const request=createApi(()=>controller?.signal),router=createRouter();
const hostList=new HostList($('hosts'),$('hostSearch'),peer=>connect(peer));
const quality=setupQuality({
  getClient:()=>client,$
}),statistics=new StreamStatistics($('streamStats'));
const gamepads=setupGamepads({
  getClient:()=>client,$,diagnostic
}),wake=setupWake({
  getClient:()=>client,$,diagnostic
});
setupMediaTests({
  getClient:()=>client,getController:()=>controller,$,diagnostic
});
function controls(){
  const busy=!!controller;
  $('connectionBadge').textContent=client?'Stream aktiv':session?'Angemeldet':'Nicht verbunden';
  $('auth').hidden=!!session;
  $('start').disabled=busy||!!session;
  for(const id of ['email','password','tfa'])$(id).disabled=busy||!!session;
  $('cancel').hidden=!busy;
  $('logout').hidden=!session;
  $('hostsPanel').hidden=!session;
  $('refresh').disabled=busy||!!client;
  $('stop').disabled=!client;
  $('play').disabled=!client;
}
function apiError(status){
  return new Error('HTTP '+status)
}
function stop(){
  statistics.stop();
  gamepads.close();
  wake.stop();
  fullscreenView?.exit();
  clearTimeout(frameTimer);
  frameTimer=null;
  const current=client;
  client=null;
  if(current)current.destroy(0);
  controls();
}
function cancel(){
  generation++;
  controller?.abort();
  controller=null;
  clearTimeout(pollTimer);
  $('password').value='';
  $('tfa').value='';
  controls();
}
$('cancel').onclick=()=>{
  cancel();
  note('auth-cancelled','Anmeldeversuch abgebrochen.');
};
$('logout').onclick=()=>{
  stop();
  cancel();
  session=null;
  $('email').value='';
  $('password').value='';
  $('tfa').value='';
  hostList.clear();
  controls();
  note('local-session-cleared','Lokale Sitzung verworfen. Die Freigabe bei Parsec bleibt gegebenenfalls bestehen.');
};
$('auth').onsubmit=async event=>{
  event.preventDefault();
  if(controller||session)return;
  const email=$('email').value.trim();
  let password=$('password').value;
  let tfa=$('tfa').value.trim();
  if(!email||!password){
    note('credentials-required','Bitte Parsec-E-Mail-Adresse und Passwort eintragen.');
    return;
  }
  const id=++generation;
  const activeController=new AbortController();
  controller=activeController;
  const timeout=setTimeout(()=>activeController.abort(),15000);
  controls();
  note('personal-auth-start','Anmeldung wird direkt an Parsec gesendet …');
  try{
    const result=await authenticatePersonal({
      email,password,tfa
    },activeController.signal);
    password='';
    tfa='';
    $('password').value='';
    $('tfa').value='';
    if(id!==generation)return;
    if((result.status!==200&&result.status!==201)||result.malformed||!result.id){
      controller=null;
      controls();
      const reason=result.status===403?'Bitte 2FA-Code, Kontofreigabe und Zugangsdaten prüfen.':result.status===429?'Zu viele Versuche. Bitte warten und nicht wiederholt anmelden.':result.malformed?'Die Antwort passt nicht zum dokumentierten älteren Anmeldeformat.':'Zugangsdaten, Kontofreigabe oder API-Version können die Ursache sein.';
      note('personal-auth-http-'+result.status+(result.malformed?'-malformed':''),'Anmeldung nicht bestätigt (HTTP '+result.status+'). '+reason);
      return;
    }
    session=result.id;
    controller=null;
    $('email').value='';
    controls();
    note('personal-authenticated','Parsec hat eine Sitzungskennung zurückgegeben. Hosts werden geladen …');
    await hosts();
  }catch{
    if(id!==generation)return;
    controller=null;
    controls();
    note('personal-auth-unreadable','Keine lesbare Anmeldeantwort. Zeitlimit, Netzwerk oder CORS können die Ursache sein. Keine Anmeldung bestätigt.');
  }finally{
    clearTimeout(timeout);
    password='';
    tfa='';
    $('password').value='';
    $('tfa').value='';
  }
};
async function hosts(){
  if(!session||client)return;
  const id=generation,token=session;
  $('refresh').disabled=true;
  $('hosts').textContent='Hosts werden geladen …';
  try{
    const r=await request('/v2/hosts?mode=desktop&public=false',{
      headers:{
        Authorization:'Bearer '+token
      }
    });
    if(id!==generation||token!==session)return;
    if(r.status!==200||!Array.isArray(r.data))throw apiError(r.status);
    hostList.set(r.data);
    note('hosts-loaded','Hostliste geladen. Wähle deinen vorhandenen Windows-Host.');
  }catch(e){
    if(id!==generation)return;
    $('hosts').textContent='Hostliste nicht abrufbar. Sitzung, Browserfreigabe (CORS) und API-Version prüfen.';
    note('host-list-failed','Hostliste konnte nicht geladen werden.');
  }finally{
    controls();
  }
}
$('refresh').onclick=hosts;
async function connect(peer){
  if(!session||client)return;
  if(!window.RTCPeerConnection){
    note('webrtc-unavailable','WebRTC ist nicht verfügbar.');
    return;
  }if(!window.VideoDecoder||!window.EncodedVideoChunk){
    note('webcodecs-unavailable','Dieser Test benötigt den H.264-Decoder von WebCodecs. Bitte einen Browser mit VideoDecoder verwenden.');
    return;
  }note('connecting','Experimenteller Verbindungsaufbau … Noch keine Verbindung bestätigt.');
  let current;
  try{
    current=new Client($('video'),event=>{
      if(client!==current&&event.type!=='diagnostic')return;
      if(event.type==='gamepad'){
        gamepads.show(event.status);
        return;
      }if(event.type==='diagnostic'){
        diagnostic(event.stage,event.metrics);
        return;
      }if(event.type==='connect'){
        note('control-open','Transportkanal offen. Warte auf Stream-Antwort und Videobild …');
        frameTimer=setTimeout(()=>{
          if(client!==current)return;
          stop();
          note('video-timeout','Steuerkanal war offen, aber innerhalb von 20 Sekunden wurde kein Videobild bestätigt.');
        },20000);
      }else if(event.type==='frame'){
        wake.setActive(true);
        statistics.start(current);
        clearTimeout(frameTimer);
        note('video-frame-decoded','Erstes Videobild decodiert und dargestellt. Bitte Bildfluss, Ton und Eingaben prüfen.');
      }else if(event.type==='exit'){
        statistics.stop();
        wake.stop();
        fullscreenView?.exit();
        clearTimeout(frameTimer);
        client=null;
        controls();
        note('connection-ended-'+Number(event.code),'Verbindung beendet (Code '+Number(event.code)+'). Protokoll, Hostfreigabe oder Netzwerk können die Ursache sein.');
      }else if(event.type==='stage'){
        note(event.stage,event.text);
      }
    });
    client=current;
    current.input.setBindings(gamepads.settings());
    current.input.setPaused(gamepads.isMenuOpen());
    quality.applyVolume();
    router.go('stream');
    controls();
    $('video').focus();
    await current.unlockAudio();
    if(client!==current||current.closed)return;
    await current.connect(session,peer,quality.config());
  }catch(e){
    stop();
    note('connection-setup-failed','Verbindungsaufbau fehlgeschlagen. Der experimentelle Adapter ist nicht als kompatibel bestätigt.');
  }
}
$('stop').onclick=()=>{
  stop();
  note('disconnected-by-user','Verbindung getrennt.');
};
$('play').onclick=async()=>{
  if(!client)return;
  const active=client;
  try{
    const running=await active.unlockAudio();
    if(client!==active)return;
    active.reportAudio();
    note(running?'playback-resumed':'playback-blocked',running?'Audioausgabe ist aktiv. Ob Host-Ton ankommt, zeigt der Verbindungsbericht.':'Audioausgabe ist noch blockiert oder unterbrochen. Bitte erneut auf Ton freigeben tippen.');
  }catch{
    if(client!==active)return;
    note('playback-blocked','Wiedergabe konnte nicht gestartet werden. Bitte erneut antippen.');
  }
};
$('fullscreen').onclick=()=>{
  if(!fullscreenView)fullscreenView=new FullscreenView({
    screen:$('screen'),canvas:$('video'),exitButton:$('exitFullscreen'),notice:$('fullscreenNotice'),report:stage=>{
      diagnostic(stage);
      $('fullscreenStatus').textContent=stage==='fullscreen-native'?'Natives Browser-Vollbild aktiv. Systemelemente werden von iPadOS gesteuert.':stage==='fullscreen-viewport'?'Safari hat kein natives Vollbild gewährt. Vergrößerte Bildschirmansicht aktiv; iPadOS-Leisten können sichtbar bleiben.':'Vollbild beendet.';
    }
  });
  fullscreenView.toggle();
};
$('download').onclick=()=>{
  client?.reportAudio();
  const blob=new Blob([JSON.stringify({
    version:2,build:'app-v7',experimental:true,events:diagnostics.events()
  },null,2)],{
    type:'application/json'
  }),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;
  a.download='parsec-connection-report.json';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),10000);
};
window.addEventListener('pagehide',()=>{
  stop();
  cancel();
  session=null;
});
controls();
$('probe').onclick=async()=>{
  if(controller||session||client)return;
  $('probe').disabled=true;
  note('api-probe-start','API-Zugriff aus diesem Browser wird ohne echte Sitzung geprüft …');
  try{
    const r=await request('/v2/hosts?mode=desktop&public=false',{
      headers:{
        Authorization:'Bearer safari-compatibility-test-not-a-session'
      }
    });
    if(r.status===401)note('api-probe-401','API-Antwort ist im Browser lesbar (HTTP 401 wie erwartet). Das bestätigt den API-Zugriff, noch keine Anmeldung.');
    else note('api-probe-http-'+r.status,'API antwortet mit HTTP '+r.status+'. Anmeldung und Verbindung sind damit nicht bestätigt.');
  }catch{
    note('api-probe-unreadable','API-Antwort nicht lesbar. CORS oder Netzwerk können einen direkten Zugriff von GitHub Pages verhindern.');
  }finally{
    $('probe').disabled=false;
  }
};
window.addEventListener('hashchange',()=>client?.input.setPaused(window.location.hash!=='#stream'||gamepads.isMenuOpen()));
