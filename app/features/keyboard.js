import { t } from '../core/i18n.js';
const modifiers=['ControlLeft','AltLeft','ShiftLeft','MetaLeft'];
export function textKeys(text){
  if(text.length>256)return null;
  const result=[];
  for(const char of text){
    let code,shift=false;
    if(/[a-z]/i.test(char)){code='Key'+char.toUpperCase();shift=char===char.toUpperCase();}
    else if(/[0-9]/.test(char))code='Digit'+char;
    else code=({' ':'Space','\n':'Enter','\t':'Tab','.':'Period',',':'Comma','-':'Minus','=':'Equal','/':'Slash',';':'Semicolon',"'":'Quote','[':'BracketLeft',']':'BracketRight','\\':'Backslash','`':'Backquote'})[char];
    if(!code)return null;
    result.push({code,shift});
  }
  return result;
}
export function setupKeyboard({$,getClient,closeMenu,doc=document}){
  const held=new Set(),buttons=new Map();
  const send=(code,down)=>getClient()?.input.specialKey(code,down);
  const reset=()=>{for(const code of held)send(code,false);held.clear();for(const button of buttons.values())button.setAttribute('aria-pressed','false');};
  const close=()=>{reset();$('keyboardPanel').hidden=true;$('keyboardText').value='';getClient()?.input.video.focus({preventScroll:true});};
  $('showKeyboard').onclick=()=>{closeMenu();$('keyboardPanel').hidden=false;$('keyboardText').focus();};
  $('closeKeyboard').onclick=close;
  $('streamMenuButton').addEventListener('click',()=>{if(!$('keyboardPanel').hidden)close();});
  const codes=['Escape','Tab','Enter','Backspace','Delete',...modifiers,'ArrowLeft','ArrowUp','ArrowDown','ArrowRight',...Array.from({length:12},(_,i)=>'F'+(i+1))];
  for(const code of codes){
    const button=doc.createElement('button');button.type='button';
    button.textContent=({ControlLeft:'Ctrl',AltLeft:'Alt',ShiftLeft:'Shift',MetaLeft:'Win',ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓'})[code]||code;
    if(modifiers.includes(code))button.setAttribute('aria-pressed','false');
    button.onclick=()=>{
      if(modifiers.includes(code)){const down=!held.has(code);if(down)held.add(code);else held.delete(code);send(code,down);button.setAttribute('aria-pressed',String(down));}
      else {send(code,true);send(code,false);}
    };
    buttons.set(code,button);$('specialKeys').appendChild(button);
  }
  function commit(event){
    if(event?.isComposing)return;
    const input=$('keyboardText'),text=input.value;input.value='';
    const keys=textKeys(text);
    if(!keys){$('keyboardStatus').textContent=t('keyboard.unsupported');return;}
    if(!getClient()||getClient().input.paused){$('keyboardStatus').textContent=t('keyboard.paused');return;}
    for(const key of keys){
      const ownShift=key.shift&&!held.has('ShiftLeft');
      if(ownShift)send('ShiftLeft',true);send(key.code,true);send(key.code,false);if(ownShift)send('ShiftLeft',false);
    }
    $('keyboardStatus').textContent=t('keyboard.layoutHelp');
  }
  $('keyboardText').addEventListener('input',commit);
  $('keyboardText').addEventListener('compositionend',commit);
  $('keyboardText').addEventListener('keydown',event=>{
    if(['Backspace','Enter','Tab'].includes(event.code)){event.preventDefault();send(event.code,true);send(event.code,false);}
  });
  window.addEventListener('blur',reset);window.addEventListener('hashchange',close);
  document.addEventListener?.('visibilitychange',()=>{if(document.hidden)reset();});
  return {close};
}
