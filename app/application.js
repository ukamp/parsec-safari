import { t } from './core/i18n.js';
import { createSessionStore } from './core/session-store.js';
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
const sessionStore=createSessionStore();
let session=null,client=null,generation=0,controller=null,pollTimer=null,frameTimer=null,fullscreenView=null,streamState=t("connection.connecting");
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
  getClient:()=>client,getController:()=>controller,$,diagnostic,controls
});
function controls(){
  const busy=!!controller;
  $('connectionBadge').textContent=client?streamState:session?t("connection.signedIn"):t("connection.notConnected");
  $('auth').hidden=!!session;
  $('start').disabled=busy||!!session;
  for(const id of ['email','password','tfa'])$(id).disabled=busy||!!session;
  $('cancel').hidden=!busy;
  $('logout').hidden=!session;
  $('hostsPanel').hidden=!session;
  $('refresh').disabled=busy||!!client;
  $('stop').disabled=!client;
  $('menuDisconnect').disabled=!client;
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
  note('auth-cancelled',t("text.signInAttemptCancelled"));
};
$('logout').onclick=()=>{
  stop();
  cancel();
  session=null;
  sessionStore.clear();
  $('remember').checked=false;
  $('email').value='';
  $('password').value='';
  $('tfa').value='';
  hostList.clear();
  controls();
  note('local-session-cleared',t("text.localSessionClearedTheSessionMayStillRemainValid"));
};
$('auth').onsubmit=async event=>{
  event.preventDefault();
  if(controller||session)return;
  const email=$('email').value.trim();
  let password=$('password').value;
  let tfa=$('tfa').value.trim();
  if(!email||!password){
    note('credentials-required',t("text.pleaseEnterYourParsecEmailAddressAndPassword"));
    return;
  }
  const id=++generation;
  const activeController=new AbortController();
  controller=activeController;
  const timeout=setTimeout(()=>activeController.abort(),15000);
  controls();
  note('personal-auth-start',t("text.signingInDirectlyWithParsec"));
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
      const reason=result.status===403?t("text.pleaseCheckYour2FACodeAccountPermissionsAndCredentials"):result.status===429?t("text.tooManyAttemptsPleaseWaitBeforeTryingAgain"):result.malformed?t("text.theResponseDoesNotMatchTheDocumentedLegacySign"):t("text.credentialsAccountPermissionsOrAPIChangesMayBeResponsible");
      note('personal-auth-http-'+result.status+(result.malformed?'-malformed':''),t("text.signInNotConfirmedHTTP")+result.status+'). '+reason);
      return;
    }
    session=result.id;
    if($('remember').checked){
      if(!sessionStore.save(session))note('session-storage-unavailable',t("text.thisBrowserCouldNotSaveTheSessionForStaying"));
    }else sessionStore.clear();
    controller=null;
    $('email').value='';
    controls();
    note('personal-authenticated',t("text.parsecReturnedASessionTokenLoadingHosts"));
    await hosts();
  }catch{
    if(id!==generation)return;
    controller=null;
    controls();
    note('personal-auth-unreadable',t("text.noReadableSignInResponseATimeoutNetworkIssue"));
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
  $('hosts').textContent=t("text.loadingHosts");
  try{
    const r=await request('/v2/hosts?mode=desktop&public=false',{
      headers:{
        Authorization:'Bearer '+token
      }
    });
    if(id!==generation||token!==session)return;
    if(r.status===401||r.status===403){
      session=null;
      sessionStore.clear();
      hostList.clear();
      note('session-expired',t("text.yourSessionHasExpiredPleaseSignInAgain"));
      return;
    }
    if(r.status!==200||!Array.isArray(r.data))throw apiError(r.status);
    hostList.set(r.data);
    note('hosts-loaded',t("text.hostsLoadedSelectYourExistingWindowsHost"));
  }catch(e){
    if(id!==generation)return;
    $('hosts').textContent=t("text.unableToLoadHostsCheckYourSessionBrowserPermissions");
    note('host-list-failed',t("text.unableToLoadHosts"));
  }finally{
    controls();
  }
}
$('refresh').onclick=hosts;
async function connect(peer){
  if(!session||client)return;
  if(!window.RTCPeerConnection){
    note('webrtc-unavailable',t("text.webrtcIsUnavailable"));
    return;
  }if(!window.VideoDecoder||!window.EncodedVideoChunk){
    note('webcodecs-unavailable',t("text.thisClientRequiresTheWebCodecsH264DecoderPlease"));
    return;
  }streamState=t("connection.connecting");note('connecting',t("text.connectingWithTheExperimentalAdapterConnectionNotYetConfirmed"));
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
      }if(event.type==='connect'){streamState=t("connection.waitingForVideo");controls();
        note('control-open',t("text.transportChannelOpenWaitingForTheStreamResponseAnd"));
        frameTimer=setTimeout(()=>{
          if(client!==current)return;
          stop();
          note('video-timeout',t("text.theControlChannelOpenedButNoVideoFrameWas"));
        },20000);
      }else if(event.type==='frame'){streamState=t("connection.active");controls();
        wake.setActive(true);
        statistics.start(current);
        clearTimeout(frameTimer);
        note('video-frame-decoded',t("text.firstVideoFrameDecodedAndDisplayedPleaseCheckMotion"));
      }else if(event.type==='exit'){
        statistics.stop();
        wake.stop();
        fullscreenView?.exit();
        clearTimeout(frameTimer);
        client=null;
        controls();
        note('connection-ended-'+Number(event.code),t("text.connectionEndedCode")+Number(event.code)+t("text.protocolHostPermissionsOrNetworkIssuesMayBeResponsible"));
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
    note('connection-setup-failed',t("text.connectionSetupFailedCompatibilityOfTheExperimentalAdapterHas"));
  }
}
$('stop').onclick=$('menuDisconnect').onclick=()=>{
  stop();
  note('disconnected-by-user',t("text.disconnected"));
};
function getFullscreenView(){
  if(!fullscreenView)fullscreenView=new FullscreenView({
    screen:$('screen'),canvas:$('video'),exitButton:$('exitFullscreen'),notice:$('fullscreenNotice'),report:stage=>{
      diagnostic(stage);
      $('fullscreenStatus').textContent=stage==='fullscreen-exit-blocked'?t("text.safariHasNotLeftFullscreenYetCloseItUsing"):stage==='fullscreen-native'?t("text.nativeBrowserFullscreenActiveSystemControlsAreManagedBy"):stage==='fullscreen-controller'?t("text.controllerViewWithoutNativeSafariFullscreenBrowserBarsMay"):stage==='fullscreen-viewport'?t("text.safariDidNotGrantNativeFullscreenExpandedViewActive"):t("text.fullscreenEnded");
    }
  });
  return fullscreenView;
}
$('fullscreen').onclick=async()=>{await getFullscreenView().toggle();client?.input.syncGamepad();};
$('controllerFullscreen').onclick=async()=>{
  const view=getFullscreenView();
  gamepads.close();
  await view.controller();
  client?.input.syncGamepad();
};
$('download').onclick=()=>{
  client?.reportAudio();
  const blob=new Blob([JSON.stringify({
    version:2,build:'1.0.0',experimental:true,events:diagnostics.events()
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
  note('api-probe-start',t("text.testingAPIAccessFromThisBrowserWithoutAReal"));
  try{
    const r=await request('/v2/hosts?mode=desktop&public=false',{
      headers:{
        Authorization:'Bearer safari-compatibility-test-not-a-session'
      }
    });
    if(r.status===401)note('api-probe-401',t("text.apiResponseIsReadableInTheBrowserHTTP401"));
    else note('api-probe-http-'+r.status,t("text.apiRespondedWithHTTP")+r.status+t("text.signInAndConnectionHaveNotBeenConfirmed"));
  }catch{
    note('api-probe-unreadable',t("text.apiResponseIsUnreadableCORSOrNetworkIssuesMay"));
  }finally{
    $('probe').disabled=false;
  }
};
window.addEventListener('hashchange',()=>client?.input.setPaused(window.location.hash!=='#stream'||gamepads.isMenuOpen()));

// Validate a remembered session with Parsec before showing any hosts.
session=sessionStore.load();
if(session){$('remember').checked=true;controls();void hosts();}
