// Event channels are stored in basic information, independently of event type.
const channelBasicView=basicInfo;basicInfo=function(){let h=channelBasicView();const field=`<div class="field"><label for="event-channel">운영 방식 <span class="required">*</span></label><select id="event-channel" required><option value="">선택</option>${['온라인','오프라인'].map(t=>`<option value="${t}" ${state.basic.channel===t?'selected':''}>${t}</option>`).join('')}</select></div>`;return h.replace('<div class="grid cols-2"><div class="field"><label for="event-start">',field+'<div class="grid cols-2"><div class="field"><label for="event-start">')};
const channelHomeView=home;home=function(){return channelHomeView().replace('<div class="filters">','<div class="filters">'+channelFilterControl())};
const channelEventsView=events;events=function(){return channelEventsView().replace('<div class="filters">','<div class="filters">'+channelFilterControl())};
const channelWorkspaceView=brandDetail;brandDetail=function(){let h=channelWorkspaceView();if(state.wsTab==='행사'){const count=currentBrand().list.filter(v=>v[1]!=='종료'&&eventChannelMatches(state.eventMemory[eventKey(state.brandId,v[0])]?.basic)).length;h=h.replace('<section class="panel"><div class="panel-head"><h2>진행 중·예정 행사',`<div class="filters workspace-channel-toolbar">${channelFilterControl()}</div><section class="panel"><div class="panel-head"><h2>진행 중·예정 행사`).replace(/(진행 중·예정 행사<\/h2><span class="mini-label">)\d+개/,(_,prefix)=>prefix+count+'개')}return h};
// Empty submissions use the example currently displayed by the composer.
const exampleCreateAction=createAction;createAction=function(action){
 if(action==='generate'){
  const prompt=document.getElementById('create-prompt');
  if(prompt&&!prompt.value.trim()){prompt.value=prompt.placeholder.replace(/^예:\s*/,'').trim();state.createPrompt=prompt.value;prompt.focus();return}
 }
 return exampleCreateAction(action);
};
const channelsBind=bind;bind=function(){channelsBind();app.querySelectorAll('[data-channel-filter]').forEach(n=>n.onchange=()=>{state.eventChannelFilters[route()]=n.value;render()})};
// An event can be registered before a game is chosen.
function eventNeedsGame(){return !!state.eventName&&!state.gameDraftMode&&!state.selectedTemplate}
const registeredEventEditor=editor;editor=function(prizes=false){
 if(!eventNeedsGame())return registeredEventEditor(prizes);
 return shell(`${steps('editor')}<section class="panel event-game-empty"><h2>게임을 선택해주세요</h2><p class="sub">행사 정보가 저장되었습니다. 템플릿을 선택하거나 AI로 게임 초안을 만들 수 있습니다.</p><button class="btn" data-action="select-event-game">게임 선택</button></section>`);
};
const registeredEventAction=action;action=function(a,n){
 if(a==='select-event-game'){state.creationFlow=true;state.createPrompt='';go('templates');return}
 if(eventNeedsGame()&&['save','to-review','approve'].includes(a))return toast('게임을 먼저 선택해주세요.');
 return registeredEventAction(a,n);
};
render();
