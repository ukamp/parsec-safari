// One overlay subpage at a time; stream actions remain outside the panels.
export function setupMenuNavigation($){
  const panels=[...document.querySelectorAll('[data-menu-panel]')];
  const buttons=[...document.querySelectorAll('[data-menu-target]')];
  let current='home';
  function show(name,focus=true){
    current=name;
    for(const panel of panels)panel.hidden=panel.dataset.menuPanel!==name;
    $('menuBack').hidden=name==='home';
    if(focus)(name==='home'?buttons[0]:$('menuBack'))?.focus({preventScroll:true});
    $('streamMenu').scrollTop=0;
  }
  for(const button of buttons)button.onclick=()=>show(button.dataset.menuTarget);
  $('menuBack').onclick=()=>show('home');
  $('streamMenu').addEventListener('keydown',event=>{
    if(event.key==='Escape'&&current!=='home'){
      event.preventDefault();event.stopImmediatePropagation();show('home');
    }
  });
  return {reset:()=>show('home',false)};
}
export function setupDiagnosticTabs($){
  const tabs=[$('diagnosticsOverviewTab'),$('diagnosticsTestsTab')];
  function select(index,focus=false){
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    $('diagnosticsOverview').hidden=index!==0;$('diagnosticsTests').hidden=index!==1;
    if(focus)tabs[index].focus();
  }
  tabs.forEach((tab,index)=>{
    tab.onclick=()=>select(index);
    tab.addEventListener('keydown',event=>{
      if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
        event.preventDefault();select(event.key==='Home'?0:event.key==='End'?1:1-index,true);
      }
    });
  });
  select(0);
}
