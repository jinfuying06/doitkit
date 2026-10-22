function currentFailedSends(){const row=allEventRows().find(r=>r.brand.id===state.brandId&&r.e[0]===state.eventName);return row?taskCounts(row).failed:0}
const conciseOperate=operate;operate=function(){
 let h=conciseOperate();
 const old=statusNotice('예상 참여 수 초과','예상 참여 3,000회를 넘어 3,412회가 참여했습니다. 운영은 계속되며, 초과 구간과 추가 정산액은 확정 예정입니다.');
 const count=currentFailedSends();
 const notice=`<section class="panel review-confirmation operation-notices"><div><strong class="point-label">예상 참여 수 초과 (3,412/3,000)</strong>${count?`<p>경품 발송 실패 ${count}건 · 발송실패목록을 확인해주세요.</p>`:''}</div></section>`;
 return h.replace(old,notice);
};
const publishingReview=review;review=function(){return publishingReview().replace('<a class="btn secondary" href="#brand-review">고객 검토 화면 열기</a>','<a class="btn secondary" href="#brand-review">고객 검토 화면 열기</a>'+(!state.published?'<button class="btn" data-action="review-publish">게시하기</button>':''))};
function openReviewPublishConfirmation(){
 qaModalOpener=document.activeElement;
 app.insertAdjacentHTML('beforeend',`<div class="modal-overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="review-publish-title"><h2 id="review-publish-title">고객사와 협의가 완료되었나요?</h2><p class="sub mt">현재 게임 화면, 참여정보와 경품·지급 방식에 대한 협의를 확인하고 게시를 진행합니다.</p><div class="end-confirmation-actions"><button class="btn secondary" data-qa-close>취소</button><button class="btn" data-action="confirm-review-publish">협의 완료 · 게시 진행</button></div></section></div>`);
 bind();activateModal();
}
const noticeAction=action;action=function(a,n){
 if(a==='review-publish'){if(!state.published)openReviewPublishConfirmation();return}
 if(a==='confirm-review-publish'){
  closeQaModal();if(state.published)return;
  if(!approvalCurrent())noticeAction('approve',n);
  if(!approvalCurrent())return;
  if(!state.paid){go('publish');toast('행사 패스를 활성화한 뒤 게시할 수 있습니다.');return}
  studioAction('publish');if(state.published){retainEvent();go('operate')}
  return;
 }
 const result=noticeAction(a,n);
 if(a==='confirm-event-end'&&state.ended){retainEvent();go('report')}
 return result;
};
render();
