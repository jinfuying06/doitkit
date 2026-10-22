/* Doitkit v3.0: additive enhancements, mock data only. */
(function(){
const initial={purpose:'lead',venue:'popup',people:1000,budget:100,customPurpose:'',ready:false};
state.v3Recommend=state.v3Recommend||initial;
const labels={lead:'고객 정보 수집',stay:'체류 시간 증가',awareness:'신제품 인지',return:'재방문 유도'};
const templatesV3={lead:['lumiere-wheel','nova-scratch','green-quiz'],stay:['green-quiz','lumiere-wheel','nova-scratch'],awareness:['green-quiz','nova-scratch','lumiere-wheel'],return:['nova-scratch','lumiere-wheel','green-quiz']};
const reasons={lead:['즉각적인 경품 보상으로 참여를 유도해 정보 수집까지 연결하기 좋아요.','짧은 게임 시간으로 현장 참여 부담을 낮춰요.','브랜드 메시지를 전달하면서 참여 정보를 확보할 수 있어요.'],stay:['제품 관련 문제를 풀며 브랜드와 머무는 시간을 늘릴 수 있어요.','대기 중 쉽게 참여할 수 있어 현장 체험을 보완해요.','즉각적인 결과가 다음 체험 참여를 유도해요.'],awareness:['제품 특성을 문제로 구성해 자연스럽게 이해하도록 도와요.','경품 공개와 함께 제품 이미지를 각인할 수 있어요.','참여 장벽이 낮아 신제품 노출 범위를 넓힐 수 있어요.'],return:['다음 방문에 사용할 쿠폰 보상과 연결하기 좋아요.','재방문 쿠폰을 경품으로 제공하기 좋아요.','제품 퀴즈와 다음 방문 혜택을 연계할 수 있어요.']};
function recommendationPurpose(){
 const s=state.v3Recommend;
 if(s.purpose!=='custom')return s.purpose;
 const text=s.customPurpose||'';
 if(/재방문|재구매|쿠폰/.test(text))return 'return';
 if(/체류|머무|체험|대기/.test(text))return 'stay';
 if(/인지|신제품|홍보|브랜드|제품/.test(text))return 'awareness';
 return 'lead';
}
const oldTemplates=templates;
templates=function(){
 let h=oldTemplates();
 const s=state.v3Recommend;
 const choices=Object.entries(labels).map(([key,label])=>'<button type="button" class="v3-choice '+(s.purpose===key?'selected':'')+'" data-v3-purpose="'+key+'">'+label+'</button>').join('')+'<button type="button" class="v3-choice '+(s.purpose==='custom'?'selected':'')+'" data-v3-purpose="custom">직접 입력</button>';
 const panel='<section class="panel v3-recommend"><div class="between"><div><span class="eyebrow">CAMPAIGN GAME MATCH</span><h2>행사 목적에 맞는 게임 추천</h2><p class="sub">목표와 운영 조건을 알려주면 적합한 템플릿 3개를 추천해드려요.</p></div></div><div class="v3-form"><div class="v3-field v3-wide"><label>가장 중요한 행사 목적</label><div class="v3-choices">'+choices+'</div><input id="v3-custom-purpose" type="text" maxlength="300" aria-label="행사 목적 직접 입력" placeholder="행사 목적을 직접 입력해 주세요" value="'+esc(s.customPurpose||'')+'"'+(s.purpose==='custom'?'':' hidden')+'></div><div class="v3-field"><label for="v3-venue">운영 장소</label><select id="v3-venue"><option value="popup" '+(s.venue==='popup'?'selected':'')+'>오프라인 팝업 · 현장</option><option value="online" '+(s.venue==='online'?'selected':'')+'>온라인</option></select></div><div class="v3-field"><label for="v3-people">예상 참여 인원 (명)</label><input id="v3-people" type="number" min="1" max="1000000" value="'+s.people+'"></div><div class="v3-field"><label for="v3-budget">경품 예산 (만원)</label><input id="v3-budget" type="number" min="0" max="100000" value="'+s.budget+'"></div></div><div class="v3-submit-row"><button class="btn v3-submit" data-v3-recommend>✧ 적합한 게임 추천받기 →</button></div>'+(s.ready?renderRecommendations():'')+'</section>';
 const loc=h.indexOf('<section class="create-hero">');
 if(loc>=0)return h.slice(0,loc)+panel+h.slice(loc);
 const anchor='<div class="create-divider">';
 return h.includes(anchor)?h.replace(anchor,panel+anchor):h.replace('</main>',panel+'</main>');
};
function renderRecommendations(){
 const s=state.v3Recommend,purpose=recommendationPurpose(),byId=templatesV3[purpose];
 const matches=byId.map(id=>gameTemplates.find(t=>t.id===id)).filter(Boolean).slice(0,3);
 return '<div class="v3-result"><h3>추천 템플릿 Top 3</h3><div class="v3-cards">'+matches.map((t,i)=>'<article class="v3-card"><div class="v3-rank">'+(i+1)+'위 · '+esc(t.type)+'</div><div class="v3-game-screen">'+templateStage(t,false)+'</div><h3>'+esc(t.title)+'</h3><p>'+reasons[purpose][i]+'</p><button class="btn secondary" data-v3-use="'+esc(t.id)+'">이 템플릿으로 초안 만들기 →</button></article>').join('')+'</div></div>';
}
const oldBind=bind;
bind=function(){
 oldBind();
 app.querySelectorAll('[data-v3-purpose]').forEach(el=>el.onclick=()=>{state.v3Recommend.purpose=el.dataset.v3Purpose;state.v3Recommend.ready=false;render()});
 for(const [id,key] of [['v3-venue','venue'],['v3-people','people'],['v3-budget','budget']]){let el=document.getElementById(id);if(el)el.onchange=()=>{state.v3Recommend[key]=el.type==='number'?Math.max(key==='people'?1:0,Number(el.value)||0):el.value;state.v3Recommend.ready=false}};
 const custom=document.getElementById('v3-custom-purpose');
 if(custom)custom.oninput=()=>{state.v3Recommend.customPurpose=custom.value;state.v3Recommend.ready=false;app.querySelector('.v3-result')?.remove()};
 app.querySelectorAll('[data-v3-recommend]').forEach(el=>el.onclick=()=>{if(state.v3Recommend.purpose==='custom'&&!state.v3Recommend.customPurpose.trim()){custom?.focus();toast('행사 목적을 입력해 주세요.');return}state.v3Recommend.ready=true;render()});
 app.querySelectorAll('[data-v3-use]').forEach(el=>el.onclick=()=>useTemplate(el.dataset.v3Use));
};
const analytics={
 times:[380,690,1050,1320,1900,1730,1380,1050,700],
 stages:[['QR 스캔',12400],['게임 시작',10200],['정보 입력·동의 완료',6324],['게임 완료',5950],['경품 수령',4820]]
};
function funnelHTML(){
 return '<div class="v3-funnel">'+analytics.stages.map(([name,n],i)=>{const prev=i?analytics.stages[i-1][1]:n;const drop=i?((prev-n)/prev*100).toFixed(1)+'%':'—';return '<div class="v3-funnel-step"><div class="between"><strong>'+name+'</strong><span>'+n.toLocaleString()+'건 · 단계 이탈 '+drop+'</span></div><div class="v3-track"><div style="width:'+(100*n/analytics.stages[0][1]).toFixed(1)+'%"></div></div></div>'}).join('')+'</div>';
}
// Product policy for a completed aggregate snapshot; no per-event AI calls.
const insightPolicy={minimumStageCount:100,dropThreshold:30};
function insightHTML(reportMode){
 const stages=analytics.stages,total=stages[0][1],complete=stages[3][1];
 const peak=analytics.times.indexOf(Math.max(...analytics.times))+10;
 const candidates=stages.slice(1).map(([name,count],i)=>({name,previous:stages[i][1],drop:100*(stages[i][1]-count)/stages[i][1]})).filter(x=>x.previous>=insightPolicy.minimumStageCount&&x.drop>=insightPolicy.dropThreshold).sort((a,b)=>b.drop-a.drop);
 const focus=candidates[0];
 const observation=focus?'집계 구간에서 '+esc(focus.name)+' 단계 이탈률이 <b>'+focus.drop.toFixed(1)+'%</b>로 나타났습니다.':'집계 구간에서는 점검 기준을 넘는 단계 이탈이 확인되지 않았습니다.';
 const suggestion=focus?'입력 항목과 동의 안내, 화면 오류 여부를 점검해 보세요. 이탈률만으로 원인을 확정할 수는 없습니다.':'다음 집계 구간에서도 같은 기준으로 추이를 확인해 주세요.';
 const summary=reportMode?'<p>QR 스캔 '+total.toLocaleString()+'건 중 게임 완료는 '+complete.toLocaleString()+'건으로 완료 전환율은 '+(100*complete/total).toFixed(1)+'%입니다.</p>':'';
 const policy=reportMode?(state.ended?'행사 종료 후 확정 집계를 기준으로 성과를 정리합니다.':'운영 중 현재 집계까지의 중간 성과를 정리합니다.'):'완료된 1시간 구간을 종료 10분 후 집계하고, 시간당 1회 제공합니다. 진행 중인 구간은 분석에서 제외합니다.';
 return '<div class="v3-insight"><strong>✧ '+(reportMode?'AI 성과 분석 요약':'운영 인사이트')+'</strong><div class="v3-insight-meta">집계 범위 10:00–19:00 · '+(reportMode?(state.ended?'종료 집계 기준':'현재 집계 기준'):'완료 구간 기준')+'</div>'+summary+'<p>'+observation+'</p><p>'+suggestion+' '+peak+'시 구간에 게임 시작이 가장 많았습니다. 다음 회차 인력 배치를 검토할 때 참고해 주세요.</p><details class="v3-insight-policy"><summary>분석 제공 기준</summary><p>'+policy+' 직전 단계 100건 이상·이탈률 30% 이상인 경우 점검 항목으로 안내합니다. 표본이 부족하면 판단을 보류하며, 확인된 수치와 운영 제안을 구분합니다.</p></details></div>';
}
function analyticsPanels(reportMode){
 const bars=analytics.times.map((v,i)=>'<div class="v3-bar-cell"><div style="height:'+(100*v/1900).toFixed(1)+'%"></div><small>'+(10+i)+'시</small></div>').join('');
 const summary=reportMode?(state.ended?'종료 후 성과 분석':'운영 중 성과 분석'):'운영 데이터 분석';
 return '<section class="panel v3-analytics"><div class="between"><div><span class="eyebrow">CAMPAIGN ANALYTICS</span><h2>'+summary+'</h2></div></div><div class="v3-statrow"><div><small>QR 스캔</small><strong>12,400</strong></div><div><small>게임 시작</small><strong>10,200</strong></div><div><small>게임 완료</small><strong>5,950</strong></div><div><small>QR → 완료</small><strong>48.0%</strong></div></div><div class="v3-analytics-grid"><div><h3>시간대별 게임 시작 추이</h3><p class="mini-label">14시 피크 · 시간대별 시연 수치</p><div class="v3-bars">'+bars+'</div></div><div><h3>참여 퍼널</h3><p class="mini-label">직전 단계 대비 이탈률</p>'+funnelHTML()+'</div></div>'+insightHTML(reportMode)+'</section>';
}
const oldOperate=operate;operate=function(){let h=oldOperate();return h.replace(/(<div class="grid cols-4 mb">)/,analyticsPanels(false)+'$1')};
let summaryEditor=null;
const expandedReportPreviews=new Set();
function summaryKey(){return state.brandId+'|'+state.eventName}
// One analysis summary is edited in place and reused by preview and shared report.
function analysisSummaryText(){return [...insightHTML(true).matchAll(/<p>([\s\S]*?)<\/p>/g)].slice(0,3).map(m=>m[1].replace(/<[^>]+>/g,'')).join('\n\n')}
function elementRange(html,opening,tag){
 const start=html.indexOf(opening);if(start<0)return null;
 const tokens=new RegExp('<'+tag+'\\b[^>]*>|</'+tag+'>','g');tokens.lastIndex=start;
 let depth=0,match;while((match=tokens.exec(html))){depth+=match[0].startsWith('</')?-1:1;if(!depth)return {start,end:tokens.lastIndex,html:html.slice(start,tokens.lastIndex)}}return null;
}
function sharedPerformanceContent(preview=false){
 const summaryText=preview&&summaryEditor?.key===summaryKey()?summaryEditor.draft:state.reportText;
 let analysis=analyticsPanels(true),insight=elementRange(analysis,'<div class="v3-insight">','div');
 const summary='<div class="v3-insight"><strong>✧ AI 성과 분석 요약</strong><p class="v3-summary-text" data-shared-summary>'+esc(summaryText)+'</p><p class="mini-label">'+(state.confirmedReport?'담당자 확정':'확정 전 미리보기')+' · 규칙 기반 시연 분석</p></div>';
 if(insight)analysis=analysis.slice(0,insight.start)+summary+analysis.slice(insight.end);
 return demoTrafficDisplay(dataSummary())+analysis;
}
const oldReport=report;report=function(){
 if(!reportLocked()){state.metricVisibility=[true,true,true,true];state.settings.includeAISummary=true;state.includeAISummary=true;}

 if(state.settings.includeAISummary!==false&&!state.aiReport&&!reportLocked()){
  state.aiReport=true;state.confirmedReport=false;
  state.reportText=analysisSummaryText();
 }
 let h=oldReport();
 h=h.replace('✧ AI 결과 요약','고객 공유용 요약').replace('AI 결과 요약 포함','고객 공유용 요약 포함');
 h=h.replace(/<button[^>]*data-action="ai-report"[^>]*>[\s\S]*?<\/button>/g,'');
 const editing=summaryEditor?.key===summaryKey()&&!reportLocked();
 if(!editing){
  h=h.replace(/<textarea id="report-text"[^>]*>[\s\S]*?<\/textarea>/,'<p class="v3-summary-text">'+esc(state.reportText)+'</p>');
  h=h.replace(/<div class="between mt"><button[^>]*data-action="confirm-report"[^>]*>[\s\S]*?<\/button><\/div>/,'<div class="v3-summary-actions">'+(reportLocked()?'<span class="mini-label">공개된 요약</span>':'<button class="btn secondary" data-action="edit-summary">요약 수정</button>'+(state.confirmedReport?'<span class="mini-label">확정 완료</span>':'<button class="btn" data-action="confirm-report">문장 확정</button>'))+'</div>');
 }else{
  h=h.replace(/(<textarea id="report-text"[^>]*>)[\s\S]*?(<\/textarea>)/,(_,open,close)=>open+esc(summaryEditor.draft)+close);
  h=h.replace('<textarea id="report-text"','<p class="mini-label">수정한 문장을 확인한 뒤 확정해 주세요.</p><textarea id="report-text"');
  h=h.replace(/(<div class="between mt">)(<button[^>]*data-action="confirm-report")/,'$1<button class="btn secondary" data-action="cancel-summary">취소</button>$2');
 }
 h=h.replace('확정된 보고문이 여기에 표시됩니다.',esc(state.reportText));
 const editor=elementRange(h,'<div class="ai-panel mt">','div');
 let analysis=analyticsPanels(true);
 if(editor){
  const summary=editor.html.replace('고객 공유용 요약','AI 성과 분석 요약').replace('<div class="ai-panel mt">','<div class="ai-panel mt report-analysis-summary">').replace('</h3>','</h3><span class="mini-label">고객 공유용 요약 · 이 문장이 미리보기와 공유 화면에 함께 반영됩니다.</span>');
  const insight=elementRange(analysis,'<div class="v3-insight">','div');
  const policy=insightHTML(true).match(/<details class="v3-insight-policy">[\s\S]*?<\/details>/)?.[0]||'';
  if(insight)analysis=analysis.slice(0,insight.start)+summary+policy+analysis.slice(insight.end);
  const controlsStart=h.lastIndexOf('<h3>리포트 구성</h3>',editor.start);
  h=h.slice(0,controlsStart>=0?controlsStart:editor.start)+h.slice(editor.end);
 }
 h=h.replace('성과 리포트 작성','고객 공유 설정');
 h=h.replace('<div class="field"><label>공개 시점</label>','<p class="report-sharing-note">위 데이터 요약과 성과 분석을 그대로 공유합니다. 분석 요약을 확인·확정한 뒤 공개 시점을 선택해주세요.</p><div class="field"><label>공개 시점</label>');
 const preview=elementRange(h,'<section class="panel report-preview"','section');
 if(preview){
  const share=preview.html.match(/<div class="report-preview-actions">[\s\S]*?<\/div>/)?.[0]||'';
  const content='<div class="report-sharing-preview"><details class="report-preview-disclosure"'+(expandedReportPreviews.has(summaryKey())?' open':'')+'><summary>고객 공유 미리보기<span class="preview-disclosure-label" aria-hidden="true"></span></summary><section class="panel report-preview" style="--report-brand:'+esc(currentBrand().color)+'"><div class="panel-head"><h2>고객 공유 미리보기</h2></div><p class="mini-label">데이터 요약 · 성과 분석 · 분석 요약</p><div class="external-logo">'+esc(state.logo)+'</div><h2 class="mt">'+esc(state.eventName||state.basic.name||'행사 성과')+'</h2><div class="shared-performance-content">'+sharedPerformanceContent(true)+'</div></section></details>'+share+'</div>';
  h=h.slice(0,preview.start)+content+h.slice(preview.end);
 }
 return h.replace(/(<div class="grid report-grid">|<div class="grid" style="grid-template-columns:minmax\(0,1fr\) 430px">)/,analysis+'$1');
};
brandReport=function(){return external('<a class="btn secondary report-back" href="#report">리포트 작성으로 돌아가기</a>'+title('CAMPAIGN PERFORMANCE',esc(state.eventName||state.basic.name||'행사 성과'),'행사 성과 리포트 · 시연 데이터','')+'<div class="alert purple">'+(state.ended?'최종 리포트':'중간 리포트')+'</div><div class="shared-performance-content">'+sharedPerformanceContent()+'</div><div class="export-note">Prepared by '+esc(state.logo)+' · 고객 공유 화면</div>')};
const summaryAction=action;action=function(a,n){
 if(a==='edit-summary'){if(reportLocked())return;summaryEditor={key:summaryKey(),draft:state.reportText};render();document.getElementById('report-text')?.focus();return}
 if(a==='cancel-summary'){summaryEditor=null;render();return}
 if(a==='share-report'&&summaryEditor?.key===summaryKey())return toast('수정한 요약을 확정하거나 취소한 뒤 공유해 주세요.');
 if(a==='confirm-report'&&!reportLocked()){
  const text=document.getElementById('report-text');
  if(text&&!text.value.trim())return toast('요약 문장을 입력해 주세요.');
  summaryEditor=null;
  if(text)return summaryAction(a,n);
  state.confirmedReport=true;retainEvent();render();toast('보고문을 확정했습니다.');return;
 }
 return summaryAction(a,n);
};
const summaryBind=bind;bind=function(){
 summaryBind();const disclosure=app.querySelector('.report-preview-disclosure');
 if(disclosure){const key=summaryKey();disclosure.ontoggle=()=>{if(disclosure.open)expandedReportPreviews.add(key);else expandedReportPreviews.delete(key)};}
 const text=document.getElementById('report-text');
 if(text&&!reportLocked()&&summaryEditor?.key===summaryKey())text.oninput=()=>{summaryEditor.draft=text.value;const preview=app.querySelector('[data-shared-summary]');if(preview)preview.textContent=text.value;};
};
render();
})();
