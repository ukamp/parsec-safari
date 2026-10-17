import {showControllerFullscreenWarning} from './browser/controller-fullscreen-warning.js';
import {setupDiagnosticTabs} from './features/navigation.js';
import { setupBrowserCapabilities } from './features/browser-capabilities.js';
import { setupKeyboard } from './features/keyboard.js';
import { setupViewport } from './features/viewport.js';
import { AccountView } from './features/account.js';
import { Reconnect } from './core/reconnect.js';
import { readPreference,writePreference } from './core/preferences.js';
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
setupDiagnosticTabs($);
const sessionStore=createSessionStore();
let session=null,lastPeer=null,client=null,generation=0,controller=null,pollTimer=null,frameTimer=null,fullscreenView=null,streamState=t("connection.connecting");
const diagnostics=createDiagnostics($),{
  note,diagnostic
}=diagnostics;
const request=createApi(()=>controller?.signal),router=createRouter();
const hostList=new HostList($('hosts'),$('hostSearch'),peer=>connect(peer));
const account=new AccountView({$,request,getSession:()=>session});
$('accountRefresh').onclick=()=>account.load();
$('showAvatars').checked=readPreference('parsec-avatars',false,x=>x===true);
hostList.showAvatars=$('showAvatars').checked;
$('showAvatars').onchange=()=>{hostList.showAvatars=$('showAvatars').checked;writePreference('parsec-avatars',hostList.showAvatars);hostList.render();};
const viewport=setupViewport({$,getClient:()=>client,closeMenu:()=>gamepads.close(),openMenu:()=>gamepads.open()});
const quality=setupQuality({
  getClient:()=>client,$
}),statistics=new StreamStatistics($('streamStats'));
const gamepads=setupGamepads({
  getClient:()=>client,$,diagnostic,onStatus:status=>{viewport.refreshCapabilities();showControllerFullscreenWarning($('controllerFullscreenWarning'),status.gamepads>0);}
}),wake=setupWake({
  getClient:()=>client,$,diagnostic
});
const browserCapabilities=setupBrowserCapabilities({$,getClient:()=>client});
const keyboard=setupKeyboard({$,getClient:()=>client,closeMenu:()=>gamepads.close()});
setupMediaTests({
  getClient:()=>client,getController:()=>controller,$,diagnostic,controls
});
const reconnect=new Reconnect({
  connect:peer=>connect(peer,true),
  allowed:()=>!!session&&!document.hidden&&readPreference('parsec-auto-reconnect',true,x=>x!==false),
  status:attempt=>{note('reconnect-scheduled',t('connection.retrying')+' '+attempt+'/3');controls();}
});
$('autoReconnect').checked=readPreference('parsec-auto-reconnect',true,x=>x!==false);
$('autoReconnect').onchange=()=>{writePreference('parsec-auto-reconnect',$('autoReconnect').checked);if(!$('autoReconnect').checked)reconnect.stop();};
function controls(){
  const busy=!!controller;
  const retryPending=reconnect?.timer!==null;
  $('streamEmpty').hidden=!!client;
  $('streamEmptyText').textContent=lastPeer?t('stream.disconnectedReady'):t('stream.chooseHost');
  $('resumeStream').hidden=!lastPeer;
  $('resumeStream').disabled=!session||!!client||busy||retryPending;
  $('connectionBadge').textContent=client?streamState:session?t("connection.signedIn"):t("connection.notConnected");
  $('authPanel').hidden=!!session;
  $('auth').hidden=!!session;
  $('start').disabled=busy||!!session;
  for(const id of ['email','password','tfa'])$(id).disabled=busy||!!session;
  $('cancel').hidden=!busy;
  $('logout').hidden=!session;
  $('hostsPanel').hidden=!session;
  $('refresh').disabled=busy||!!client;
  $('stop').disabled=!client&&reconnect?.timer===null;
  $('menuDisconnect').disabled=!client&&reconnect?.timer===null;
  for(const id of ['showKeyboard','pip'])$(id).disabled=!client;
  viewport.refreshCapabilities();
  if(!client){$('displaySelection').disabled=true;$('touchCursor').hidden=true;}
}
function apiError(status){
  return new Error('HTTP '+status)
}
function stop(){
  const current=client;client=null;
  reconnect.stop();
  keyboard.close();
  viewport.cleanup();
  browserCapabilities.cleanup();
  statistics.stop();
  gamepads.close();
  wake.stop();
  fullscreenView?.exit();
  clearTimeout(frameTimer);
  frameTimer=null;
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
  session=null;lastPeer=null;
  sessionStore.clear();
  $('remember').checked=false;
  $('email').value='';
  $('password').value='';
  $('tfa').value='';
  hostList.clear();
  account.clear();
  $('hostsUpdated').textContent='';
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
      session=null;lastPeer=null;
      sessionStore.clear();
      hostList.clear();
      account.clear();
      $('hostsUpdated').textContent='';
      note('session-expired',t("text.yourSessionHasExpiredPleaseSignInAgain"));
      return;
    }
    if(r.status!==200||!Array.isArray(r.data))throw apiError(r.status);
    hostList.set(r.data);
    $('hostsUpdated').textContent=t('hosts.updatedAt')+' '+new Date().toLocaleString(document.documentElement?.lang||'de')+(r.hasMore?' · '+t('account.moreAvailable'):'');
    void account.load();
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
async function connect(peer,retrying=false){
  if(!session||client)return;
  if(!retrying)reconnect.start(peer);
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
      if(event.type==='codec'){$('codecStatus').textContent=t('codec.'+event.state);return;}
      if(event.type==='host-config-pending'||event.type==='host-config-unavailable'){$('displayStatus').textContent=t(event.type==='host-config-pending'?'display.configPending':'display.configUnavailable');return;}
      if(event.type==='display-selection-required'){$('displayStatus').textContent=t('display.explicitRequired');return;}
      if(event.type==='display-mapping-unavailable'){$('displayStatus').textContent=t('display.mappingUnavailable');return;}
      if(event.type==='displays'){
        $('displaySelection').textContent='';
        const currentOption=document.createElement('option');currentOption.value='';currentOption.textContent=event.displays.length?t('display.currentUnknown'):t('display.waiting');currentOption.disabled=true;$('displaySelection').appendChild(currentOption);
        for(const display of event.displays){const option=document.createElement('option');option.value=display.id;option.textContent=display.name;$('displaySelection').appendChild(option);}
        $('displaySelection').value=event.displays.some(display=>display.id===event.selected)?event.selected:'';
        $('displaySelection').disabled=!event.displays.length;
        $('displayStatus').textContent=event.displays.length?t(event.requiresSelection?'display.explicitRequired':'display.available'):t('display.unavailable');
        return;
      }
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
      }else if(event.type==='frame'){lastPeer=peer;reconnect.recovered();streamState=t("connection.active");controls();
        wake.setActive(true);
        statistics.start(current);
        clearTimeout(frameTimer);
        note('video-frame-decoded',t("text.firstVideoFrameDecodedAndDisplayedPleaseCheckMotion"));
      }else if(event.type==='exit'){
        keyboard.close();viewport.cleanup();browserCapabilities.cleanup();
        $('displaySelection').disabled=true;
        statistics.stop();
        wake.stop();
        fullscreenView?.exit();
        clearTimeout(frameTimer);
        client=null;
        controls();
        const scheduled=reconnect.failed(Number(event.code));
        controls();
        if(!scheduled)note('connection-ended-'+Number(event.code),t("text.connectionEndedCode")+Number(event.code)+t("text.protocolHostPermissionsOrNetworkIssuesMayBeResponsible"));
      }else if(event.type==='stage'){
        note(event.stage,event.text);
      }
    });
    client=current;
    $('codecStatus').textContent=t('codec.default');
    $('displaySelection').textContent='';const waitingDisplay=document.createElement('option');waitingDisplay.value='';waitingDisplay.textContent=t('display.waiting');$('displaySelection').appendChild(waitingDisplay);$('displaySelection').disabled=true;$('displayStatus').textContent=t('display.waiting');
    viewport.apply();
    current.input.onZoom=viewport.setZoom;current.input.getZoom=viewport.getZoom;
    current.input.setBindings(gamepads.settings());
    current.input.setPaused(gamepads.isMenuOpen());
    quality.beginStream();
    router.go('stream');
    controls();
    $('video').focus();
    await current.unlockAudio();
    if(client!==current||current.closed)return;
    const output=readPreference('parsec-display-'+peer,'',x=>typeof x==='string'&&x.length<=128&&!/[\x00-\x1f]/.test(x)?x:'');
    await current.connect(session,peer,{...quality.config(),...(output?{output}:{})});
  }catch(e){
    stop();
    note('connection-setup-failed',t("text.connectionSetupFailedCompatibilityOfTheExperimentalAdapterHas"));
  }
}
$('displaySelection').onchange=()=>{const selected=$('displaySelection').value,sent=client?.selectDisplay(selected);if(sent&&client.peer)writePreference('parsec-display-'+client.peer,selected);$('displayStatus').textContent=sent?t(client?.pendingDisplayChoice?'display.configPending':'display.requested'):t(client?.displayMappingMissing?'display.mappingUnavailable':'display.unavailable');};
$('stop').onclick=$('menuDisconnect').onclick=()=>{
  stop();
  note('disconnected-by-user',t("text.disconnected"));
};
function getFullscreenView(){
  if(!fullscreenView)fullscreenView=new FullscreenView({
    screen:$('screen'),canvas:$('video'),exitButton:$('exitFullscreen'),notice:$('fullscreenNotice'),report:stage=>{
      diagnostic(stage);
      showControllerFullscreenWarning($('controllerFullscreenWarning')); 
      $('fullscreenStatus').textContent=stage==='fullscreen-exit-blocked'?t("text.safariHasNotLeftFullscreenYetCloseItUsing"):stage==='fullscreen-native'?t("text.nativeBrowserFullscreenActiveSystemControlsAreManagedBy"):stage==='fullscreen-controller'?t("text.controllerViewWithoutNativeSafariFullscreenBrowserBarsMay"):stage==='fullscreen-viewport'?t("text.safariDidNotGrantNativeFullscreenExpandedViewActive"):t("text.fullscreenEnded");
    }
  });
  return fullscreenView;
}
$('fullscreen').onclick=async()=>{
  gamepads.close();
  await getFullscreenView().browser();
  client?.input.syncGamepad();
};
$('controllerView').onclick=$('controllerFullscreen').onclick=async()=>{
  gamepads.close();
  await getFullscreenView().controller();
  client?.input.syncGamepad();
};
$('chooseComputer').onclick=async()=>{await fullscreenView?.exit();router.go('computers');};
$('resumeStream').onclick=()=>{if(session&&lastPeer&&!client&&reconnect.timer===null)void connect(lastPeer);};
$('download').onclick=()=>{
  client?.reportAudio();
  const blob=new Blob([JSON.stringify({
    version:2,build:'1.3.13',experimental:true,diagnosticsEnabled:diagnostics.enabled(),events:diagnostics.events()
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
  session=null;lastPeer=null;controls();
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
function restoreRememberedSession(){
  if(session)return;
  session=sessionStore.load();
  if(session){$('remember').checked=true;controls();return hosts();}
}
void restoreRememberedSession();
window.addEventListener('pageshow',event=>{if(event.persisted)return restoreRememberedSession();});

document.addEventListener('visibilitychange',()=>{if(document.hidden)reconnect.stop();});

for(const event of ['fullscreenchange','webkitfullscreenchange','gamepadconnected','gamepaddisconnected'])window.addEventListener(event,()=>showControllerFullscreenWarning($('controllerFullscreenWarning')));
