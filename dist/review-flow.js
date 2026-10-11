// Saving a draft and requesting customer review are separate actions.
function demoReviewOpinions(brandId=state.brandId){const members=brands.find(b=>b.id===brandId)?.members||[];return [
 {author:members[0]?.name||'브랜드 담당자',memberId:members[0]?.id,text:'참여 버튼 문구를 더 짧게 바꿔주세요.',status:'확인 중'},
 {author:members[1]?.name||members[0]?.name||'브랜드 담당자',memberId:members[1]?.id||members[0]?.id,text:'현장 경품 수령 위치를 결과 화면에서도 확인할 수 있으면 좋겠습니다.',status:'확인 중'}
]}
for(const row of allEventRows())if(row.record.settings.reviewRequested&&!row.record.settings.reviewComments)row.record.settings.reviewComments=demoReviewOpinions(row.brand.id);
function reviewOpinions(){
 const comments=state.settings.reviewComments||[];
 if(!comments.length)return '';
 return `<div class="review-opinions"><h3>검토 의견</h3>${comments.map((c,i)=>`<article class="review-opinion"><div class="between"><strong>${esc(c.author)}</strong><span class="mini-label">${esc(c.status)}</span></div><p>${esc(c.text)}</p>${c.status==='확인 중'&&route()==='review'?`<button class="btn secondary review-opinion-done" data-review-opinion="${i}">반영 완료</button>`:''}</article>`).join('')}</div>`;
}
const opinionsReview=review;review=function(){return opinionsReview().replace('<div class="review-share mt">',reviewOpinions()+'<div class="review-share mt">')};
const opinionsCustomerReview=brandReview;brandReview=function(){let h=opinionsCustomerReview(),list=reviewOpinions();return h.includes('<div class="field"><label for="client-comment">')?h.replace('<div class="field"><label for="client-comment">',list+'<div class="field"><label for="client-comment">'):h.replace('</section></div><div class="review-footer',list+'</section></div><div class="review-footer')};
const requestedNavigation=navigateEventStep;navigateEventStep=function(target){
 requestedNavigation(target);
 if(target==='review'&&route()==='review'&&!state.settings.reviewComments){state.settings.reviewComments=demoReviewOpinions();retainEvent();render()}
};
const reviewedAction=action;action=function(a,n){
 if(a==='approve'){
  reviewedAction(a,n);
  if(approvalCurrent()){
   (state.settings.reviewComments||[]).forEach(c=>{if(c.status==='확인 중')c.status='검토 완료'});
   state.settings.openComments=0;retainEvent();render();
  }
  return;
 }
 if(a==='comment'){
  const input=document.getElementById('client-comment'),text=input?.value.trim();
  if(!text)return toast('의견을 입력해주세요.');
  (state.settings.reviewComments||(state.settings.reviewComments=[])).push({author:currentBrand().members?.[0]?.name||'브랜드 담당자',memberId:currentBrand().members?.[0]?.id,text,status:'확인 중'});
  state.settings.openComments=state.settings.reviewComments.filter(c=>c.status==='확인 중').length;
  retainEvent();render();toast('검토 의견을 남겼습니다.');return;
 }
 return reviewedAction(a,n);
};
const reviewFlowBind=bind;bind=function(){
 reviewFlowBind();
 const consent=document.getElementById('consent-check');
 if(consent){const change=consent.onchange;consent.onchange=e=>{if(change)change(e);invalidateApproval();retainEvent();updateSaveButtons()}}
 app.querySelectorAll('[data-review-opinion]').forEach(n=>n.onclick=()=>{state.settings.reviewComments[+n.dataset.reviewOpinion].status='반영 완료';state.settings.openComments=state.settings.reviewComments.filter(c=>c.status==='확인 중').length;retainEvent();render()});
 app.querySelectorAll('[data-wheel-choice]').forEach(n=>n.onchange=()=>{
  const value=n.value.trim(),index=+n.dataset.wheelChoice;
  const labels=[...(state.gameDraft?.labels||rewards().map(p=>p.name).concat('꽝'))],previous=labels[index];
  if(!value){n.value=previous;return}
  const reward=rewards().find(p=>p.name===previous);
  if((/^(꽝|미당첨)$/.test(previous))!==(/^(꽝|미당첨)$/.test(value))){n.value=previous;toast('경품과 미당첨 구성은 경품 설정에서 변경해주세요.');return}
  labels[index]=value;
  if(!state.gameDraft)state.gameDraft={kind:'wheel',baseId:state.selectedTemplate,labels,count:labels.length,recommendations:[],title:currentTemplate().title};
  else state.gameDraft.labels=labels;
  if(reward)reward.name=value;
  invalidateApproval();retainEvent();render();
 });
};
const gatedReviewRender=render;render=function(){
 if(['review','brand-review'].includes(route())&&!deriveEventFlow(captureEvent()).done.editor){state.editorTab=state.consent?'디자인':'수집·동의';location.hash='#editor'}
 gatedReviewRender();
};
render();
