const presentationReport=report;report=function(){
 let h=presentationReport();
 if(state.aiReport){
  h=h.replace(/<div class="report-ai-actions">[\s\S]*?<\/div>/,'');
  h=h.replace(/(<div class="between mt">)<span class="mini-label">[\s\S]*?<\/span>(<button[^>]*data-action="confirm-report")/,'$1<button class="btn secondary" data-action="ai-report">재생성</button>$2');
  h=h.replace('<textarea id="report-text"','<p class="report-lock-note">리포트 공개 후에는 내용을 수정할 수 없습니다.</p><textarea id="report-text"');
 }
 h=h.replace('<section class="panel report-preview">','<section class="panel report-preview" style="--report-brand:'+esc(currentBrand().color)+'">');
 const share=h.match(/<button[^>]*data-action="share-report"[^>]*>[\s\S]*?<\/button>/)?.[0];
 if(share){
  h=h.replace(share,'').replace(/<div class="inline">\s*<\/div>/g,'');
  h=h.replace(/(<section class="panel report-preview"[^>]*>[\s\S]*?)(<\/section>)/,`$1<div class="report-preview-actions">${share}</div>$2`);
 }
 if(reportLocked())h=h.replace(/(<textarea id="report-text"[^>]*)(>)/,'$1 readonly aria-readonly="true"$2').replace(/(<button[^>]*data-action="(?:ai-report|confirm-report|share-report)"[^>]*)(>)/g,'$1 disabled aria-disabled="true"$2').replace(/(<input[^>]*(?:data-metric|id="include-ai-summary")[^>]*)(>)/g,'$1 disabled$2').replace(/(<select id="report-timing"|<input id="report-publish-at")/g,'$1 disabled');
 return h.replaceAll('요약 초안 생성','초안 생성');
};
function reportLocked(){return !!state.reportPublished}
const lockedReportAction=action;action=function(a,n){
 if(reportLocked()&&(['ai-report','confirm-report','share-report'].includes(a)||(a==='save'&&route()==='report')))return toast('공개된 리포트는 수정할 수 없습니다.');
 return lockedReportAction(a,n);
};
const lockedReportBind=bind;bind=function(){
 lockedReportBind();
 if(reportLocked()){
  const text=document.getElementById('report-text');if(text)text.oninput=()=>{text.value=state.reportText};
  for(const selector of ['[data-metric]','#include-ai-summary','#report-timing','#report-publish-at'])app.querySelectorAll(selector).forEach(n=>{n.disabled=true;n.onchange=null});
 }
};
render();
