// The presentation clock is scoped to this named event, never the browser clock.
const GANGNAM_DEMO_NAME='루미에르 강남 팝업 룰렛';
function isGangnamDemo(record){return (record.eventName||record.basic?.name)==GANGNAM_DEMO_NAME}
function demoTraffic(){return isGangnamDemo(state)?(state.settings.demoTraffic||{participations:21000,included:20000,unitPrice:5,cardLast4:'1234'}):null}
function demoOverage(){if(!isGangnamDemo(state))return null;if(typeof billingUsage==='function')return billingUsage();const t=demoTraffic();if(!t)return null;const excess=Math.max(0,t.participations-t.included);return {...t,excess,amount:excess*t.unitPrice}}
const demoRetainEvent=retainEvent;retainEvent=function(){
 if(!state.gameDraftMode&&state.published&&isGangnamDemo(state)&&!state.settings.demoInitialized){
  state.settings.demoScenario='gangnam-popup';
  state.settings.demoInitialized=true;
  state.settings.failedCount=2;
  state.settings.failureIds=[0,1];
  state.retried=false;
 }
 if(!state.gameDraftMode&&state.published&&isGangnamDemo(state)&&!state.settings.demoTraffic){
  const now=new Date();const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit'}).formatToParts(now);const year=Number(parts.find(p=>p.type==='year').value),month=Number(parts.find(p=>p.type==='month').value);
  state.settings.demoTraffic={participations:21000,included:20000,unitPrice:5,cardLast4:'1234',billingDate:`${month===12?year+1:year}-${String(month===12?1:month+1).padStart(2,'0')}-10`};
 }
 return demoRetainEvent();
};
const demoStudioAction=studioAction;studioAction=function(a){
 const result=demoStudioAction(a);
 if(a==='publish'&&state.published){retainEvent();render()}
 return result;
};
