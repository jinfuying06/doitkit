// All mock event times use Korea time and minute precision.
function eventEndAt(basic){return basic?.end?Date.parse(`${basic.end}T${basic.endTime||'16:00'}:00+09:00`):NaN}
function endPrompt(now=Date.now()){const end=isGangnamDemo(state)?now-5*60000:eventEndAt(state.basic);return {early:Number.isFinite(end)&&now<end,automatic:Number.isFinite(end)&&now>=end+3600000,end}}
const timedBasicInfo=basicInfo;basicInfo=function(){return timedBasicInfo().replace('<div class="grid cols-2"><div class="field"><label for="event-type">',`<div class="grid cols-2"><div class="field"><label for="event-start-time">시작 시간 <span class="required">*</span></label><input id="event-start-time" type="time" step="60" required value="${state.basic.startTime||'10:00'}"></div><div class="field"><label for="event-end-time">종료 시간 <span class="required">*</span></label><input id="event-end-time" type="time" step="60" required value="${state.basic.endTime||'16:00'}"></div></div><div class="grid cols-2"><div class="field"><label for="event-type">`)};
const timedStoreBasics=storeBasics;storeBasics=function(){timedStoreBasics();state.basic.startTime=document.getElementById('event-start-time')?.value||'10:00';state.basic.endTime=document.getElementById('event-end-time')?.value||'16:00'};
const timedSubmitBasics=submitBasics;submitBasics=function(e){
 const start=document.getElementById('event-start')?.value,end=document.getElementById('event-end')?.value;
 const startTime=document.getElementById('event-start-time')?.value||'10:00',endTime=document.getElementById('event-end-time')?.value||'16:00';
 if(start&&end&&`${end}T${endTime}`<=`${start}T${startTime}`){e.preventDefault();return toast('종료 일시는 시작 일시 이후로 선택해주세요.')}
 return timedSubmitBasics(e);
};
function openEndConfirmation(){
 if(state.ended)return;
 const p=endPrompt();if(p.automatic){applyScheduledChanges();render();return}
 const title=p.early?'예정 시간 전에 행사를 종료할까요?':'행사를 종료할까요?';
 const message=p.early?`예정 종료는 ${state.basic.end} ${state.basic.endTime||'16:00'}입니다. 지금 종료하면 참여와 경품 당첨이 중단됩니다.`:'예정 종료 시간으로부터 1시간 후 자동 종료됩니다. 자동 종료 전에 지금 종료하시겠습니까?';
 qaModalOpener=document.activeElement;
 app.insertAdjacentHTML('beforeend',`<div class="modal-overlay"><section class="modal end-confirmation" role="dialog" aria-modal="true" aria-labelledby="end-confirmation-title"><h2 id="end-confirmation-title">${title}</h2><p class="sub mt">${message}</p><div class="end-confirmation-actions"><button class="btn secondary" data-qa-close>취소</button><button class="btn" data-action="confirm-event-end">행사 종료</button></div></section></div>`);
 bind();activateModal();
}
const endedOperate=operate;operate=function(){let h=endedOperate();if(state.ended)h=h.replace(/(<button[^>]*data-action="(?:pause|end)"[^>]*)(>)/g,'$1 disabled aria-disabled="true"$2');return h};
const timedReport=report;report=function(){
 let h=timedReport().replace(steps('report'),steps('report')+statusNotice(state.ended?'최종 리포트':'중간 리포트',state.ended?'행사가 종료되어 최종 집계 결과를 표시합니다.':'운영 중 집계 결과이며 행사 종료 전까지 업데이트됩니다.')).replace(/<span class="pill[^"]*">(?:최종|중간) 리포트<\/span>/g,'').replace(/<select id="report-timing">[\s\S]*?<\/select>/,`<select id="report-timing">${['즉시 공개','행사 종료 후','지정 일시'].map(v=>`<option ${v===(state.settings.reportTiming||'즉시 공개')?'selected':''}>${v}</option>`).join('')}</select>`);
 if(state.settings.reportTiming==='지정 일시')h=h.replace('</select></div><div class="inline">','</select></div><div class="field"><label for="report-publish-at">공개 일시 <span class="required">*</span></label><input id="report-publish-at" type="datetime-local" step="60" required value="'+esc(state.settings.reportAt||'')+'"><p class="mini-label">한국 시간 기준</p></div><div class="inline">');
 return h;
};
const scheduleAction=action;action=function(a,n){
 if(state.ended&&['end','pause','confirm-event-end'].includes(a))return;
 if(a==='end'){openEndConfirmation();return}
 if(a==='confirm-event-end'){closeQaModal();scheduleAction('end',n);return}
 if(a==='share-report'&&document.getElementById('report-timing')?.value==='지정 일시'){
  if(state.aiReport&&!state.confirmedReport)return toast('공유 전에 AI 요약 문장을 확정해주세요.');
  const value=document.getElementById('report-publish-at')?.value,at=Date.parse(value+':00+09:00');
  if(!value||!Number.isFinite(at)||at<=Date.now())return toast('공개할 미래 일자와 시간을 선택해주세요.');
  state.settings.reportAt=value;state.settings.reportScheduledAt=at;state.reportPublished=false;retainEvent();render();toast('리포트 공개를 예약했습니다.');return;
 }
 return scheduleAction(a,n);
};
function applyScheduledChanges(now=Date.now()){
 let changed=false;
 for(const r of allEventRows()){
  const record=r.record,end=eventEndAt(record.basic);let updated=false;
  if(record.published&&!record.ended&&!isGangnamDemo(record)&&Number.isFinite(end)&&now>=end+3600000){freezeBilling(record);record.ended=true;record.paused=false;record.settings.endedAutomatically=true;r.e[2]='종료';r.e[3]='성과';r.e[5]='report';const item=r.brand.list.find(v=>v[0]===r.e[0]);if(item)item[1]='종료';updated=true}
  if(record.settings.reportScheduledAt&&now>=record.settings.reportScheduledAt){record.reportPublished=true;record.settings.reportShared=true;delete record.settings.reportScheduledAt;updated=true}
  if(updated){changed=true;r.brand.active=r.brand.list.filter(v=>v[1]!=='종료').length;if(state.brandId===r.brand.id&&state.eventName===r.e[0]){state.ended=record.ended;state.paused=record.paused;state.reportPublished=record.reportPublished;Object.assign(state.settings,record.settings);if(!record.settings.reportScheduledAt)delete state.settings.reportScheduledAt}}
 }
 return changed;
}
const scheduleBind=bind;bind=function(){scheduleBind();const timing=document.getElementById('report-timing');if(timing)timing.onchange=()=>{state.settings.reportTiming=timing.value;retainEvent();render()};const at=document.getElementById('report-publish-at');if(at)at.onchange=()=>{state.settings.reportAt=at.value;retainEvent()}};
const scheduledRender=render;render=function(){applyScheduledChanges();scheduledRender()};
if(typeof setInterval==='function')setInterval(()=>{if(applyScheduledChanges())render()},30000);
render();
