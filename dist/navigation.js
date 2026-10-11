// Keep back navigation inside the site and restore the previous work context.
const pageTrail=[];
let lastPage=null,returningToPage=false;
function pageContext(){return {route:route(),brandId:state.brandId,eventName:state.eventName,event:captureEvent(),wsTab:state.wsTab,editorTab:state.editorTab,studioPage:state.studioPage,gameDraftMode:state.gameDraftMode,creationFlow:state.creationFlow,taskFilter:state.taskFilter,filter:state.filter,brandFilter:state.brandFilter,channelFilter:state.eventChannelFilters[route()]||'전체'}}
function samePage(a,b){return a&&a.route===b.route&&a.brandId===b.brandId&&a.eventName===b.eventName}
function backTarget(r){return ({'workspace-detail':'workspace','event-basic':'workspace',templates:'home','game-draft':'templates',editor:'workspace-detail',prizes:'editor',review:'editor',publish:'review',checkout:'publish',operate:'workspace-detail',report:'operate',settlement:'report','brand-review':'review','brand-report':'report',game:'start',result:'game'})[r]||'home'}
function navigateBack(){
  retainEvent();state.notificationsOpen=false;
  const previous=pageTrail.pop();returningToPage=true;
  if(previous){
    const record=state.eventMemory[eventKey(previous.brandId,previous.eventName)]||previous.event;
    restoreEvent(record);
    for(const key of ['brandId','eventName','wsTab','editorTab','studioPage','gameDraftMode','creationFlow','taskFilter','filter','brandFilter'])state[key]=previous[key];
    state.eventChannelFilters[previous.route]=previous.channelFilter||'전체';
    state.layers=state.pageLayers[state.studioPage]||state.layers;
    go(previous.route);
  }else{
    if(route()==='event-basic'||route()==='templates')state.creationFlow=false;
    go(backTarget(route()));
  }
}
function backButton(){return `<button class="page-back" data-page-back aria-label="이전 화면으로 돌아가기"><span aria-hidden="true">←</span>뒤로</button>`}
const backShell=shell;shell=function(body){let h=backShell(body);if(route()!=='home')h=h.replace('<header class="topbar">','<header class="topbar">'+backButton());return h};
const backExternal=external;external=function(body,kind){return backExternal(body,kind).replace('<header class="external-header">','<header class="external-header">'+backButton()).replace(/<a class="btn secondary report-back"[^>]*>[^<]*<\/a>/,'')};
const backMobile=mobile;mobile=function(mode){return backMobile(mode).replace('<main class="mobile-outer">','<main class="mobile-outer">'+backButton())};
const navigationBind=bind;bind=function(){navigationBind();app.querySelectorAll('[data-page-back]').forEach(n=>n.onclick=navigateBack);app.querySelectorAll('[data-task-filter]').forEach(n=>{const click=n.onclick;n.onclick=()=>{click();app.querySelector('.desk-events')?.scrollIntoView?.({behavior:'smooth',block:'start'})}})};
const navigationRender=render;render=function(){
  if(route()==='home'&&lastPage&&lastPage.route!=='home'){state.brandFilter='전체';state.filter='전체';state.taskFilter='전체';state.creationFlow=false;state.eventChannelFilters.home='전체'}
  if(route()==='events'&&lastPage&&lastPage.route!=='events'){state.brandFilter='전체';state.filter='전체';state.taskFilter='전체';state.eventChannelFilters.events='전체'}
  const next=pageContext();
  if(lastPage&&!samePage(lastPage,next)&&!returningToPage)pageTrail.push(lastPage);
  returningToPage=false;navigationRender();lastPage=pageContext();
};
render();

// Customer preview returns to the checkout that opened it.
const checkoutPreviewReview=brandReview;brandReview=function(){
 const h=checkoutPreviewReview();
 if(pageTrail.at(-1)?.route!=='checkout')return h;
 return h.replace('<a href="#review" class="btn secondary">검토 화면으로</a>','<button class="btn secondary" data-page-back>결제 화면으로 돌아가기</button>');
};
