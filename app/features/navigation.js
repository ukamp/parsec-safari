// Compact horizontal tabs; stream actions stay available above every panel.
export function setupMenuNavigation($){
  const panels=[...document.querySelectorAll('[data-menu-panel]')];
  const buttons=[...document.querySelectorAll('[data-menu-target]')];
  let current='picture';
  function show(name,focus=false){
    current=name;
    for(const panel of panels)panel.hidden=panel.dataset.menuPanel!==name;
    for(const button of buttons){
      const selected=button.dataset.menuTarget===name;
      button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;
      if(selected&&focus)button.focus({preventScroll:true});
    }
    $('streamMenu').scrollTop=0;
  }
  buttons.forEach((button,index)=>{
    button.onclick=()=>show(button.dataset.menuTarget);
    button.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:buttons.length-1))%buttons.length;
      show(buttons[next].dataset.menuTarget,true);
    });
  });
  show(current);
  return {reset:()=>show(current)};
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
