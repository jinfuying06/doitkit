/* Doitkit v3.0: additive enhancements, mock data only. */
(function(){
const initial={purpose:'lead',venue:'popup',people:1000,budget:100,ready:false};
state.v3Recommend=state.v3Recommend||initial;
const labels={lead:'고객 정보 수집',stay:'체류 시간 증가',awareness:'신제품 인지',return:'재방문 유도'};
const templatesV3={lead:['lumiere-wheel','nova-scratch','green-quiz'],stay:['green-quiz','lumiere-wheel','nova-scratch'],awareness:['green-quiz','nova-scratch','lumiere-wheel'],return:['nova-scratch','lumiere-wheel','green-quiz']};
const reasons={lead:['즉각적인 경품 보상으로 참여를 유도해 정보 수집까지 연결하기 좋아요.','짧은 게임 시간으로 현장 참여 부담을 낮춰요.','브랜드 메시지를 전달하면서 참여 정보를 확보할 수 있어요.'],stay:['제품 관련 문제를 풀며 브랜드와 머무는 시간을 늘릴 수 있어요.','대기 중 쉽게 참여할 수 있어 현장 체험을 보완해요.','즉각적인 결과가 다음 체험 참여를 유도해요.'],awareness:['제품 특성을 문제로 구성해 자연스럽게 이해하도록 도와요.','경품 공개와 함께 제품 이미지를 각인할 수 있어요.','참여 장벽이 낮아 신제품 노출 범위를 넓힐 수 있어요.'],return:['다음 방문에 사용할 쿠폰 보상과 연결하기 좋아요.','재방문 쿠폰을 경품으로 제공하기 좋아요.','제품 퀴즈와 다음 방문 혜택을 연계할 수 있어요.']};
const oldTemplates=templates;
templates=function(){
 let h=oldTemplates();
 const s=state.v3Recommend;
 const choices=Object.entries(labels).map(([key,label])=>'<button type="button" class="v3-choice '+(s.purpose===key?'selected':'')+'" data-v3-purpose="'+key+'">'+label+'</button>').join('');
 const panel='<section class="panel v3-recommend"><div class="between"><div><span class="eyebrow">CAMPAIGN GAME MATCH</span><h2>행사 목적에 맞는 게임 추천</h2><p class="sub">목표와 운영 조건을 알려주면 적합한 템플릿 3개를 추천해요.</p></div><span class="mini-label">추천 로직 시연 · 실제 AI 연동 전</span></div><div class="v3-form"><div class="v3-field v3-wide"><label>가장 중요한 행사 목적</label><div class="v3-choices">'+choices+'</div></div><div class="v3-field"><label for="v3-venue">운영 장소</label><select id="v3-venue"><option value="popup" '+(s.venue==='popup'?'selected':'')+'>오프라인 팝업 · 현장</option><option value="online" '+(s.venue==='online'?'selected':'')+'>온라인</option></select></div><div class="v3-field"><label for="v3-people">예상 참여 인원 (명)</label><input id="v3-people" type="number" min="1" max="1000000" value="'+s.people+'"></div><div class="v3-field"><label for="v3-budget">경품 예산 (만원)</label><input id="v3-budget" type="number" min="0" max="100000" value="'+s.budget+'"></div></div><button class="btn v3-submit" data-v3-recommend>✧ 적합한 게임 추천받기 →</button>'+(s.ready?renderRecommendations():'')+'</section>';
 const loc=h.indexOf('<section class="create-hero">');
 if(loc>=0)return h.slice(0,loc)+panel+h.slice(loc);
 const anchor='<div class="create-divider">';
 return h.includes(anchor)?h.replace(anchor,panel+anchor):h.replace('</main>',panel+'</main>');
};
function renderRecommendations(){
 const s=state.v3Recommend,byId=templatesV3[s.purpose]||templatesV3.lead;
 const matches=byId.map(id=>gameTemplates.find(t=>t.id===id)).filter(Boolean).slice(0,3);
 return '<div class="v3-result"><div class="between"><div><h3>추천 템플릿 Top 3</h3><p class="mini-label">'+labels[s.purpose]+' · '+(s.venue==='online'?'온라인':'오프라인')+' · '+Number(s.people).toLocaleString()+'명 · '+s.budget+'만원</p></div><span class="mini-label">기존 게임 템플릿 기반</span></div><div class="v3-cards">'+matches.map((t,i)=>'<article class="v3-card"><div class="v3-rank">'+(i+1)+'위 · '+esc(t.type)+'</div><h3>'+esc(t.title)+'</h3><p>'+reasons[s.purpose][i]+'</p><button class="btn secondary" data-v3-use="'+esc(t.id)+'">이 템플릿으로 초안 만들기 →</button></article>').join('')+'</div><p class="mini-label">추천 순위는 목적별 규칙을 기반으로 한 예시이며, 실제 500회 캠페인 데이터에 연동되어 있지 않습니다.</p></div>';
}
const oldBind=bind;
bind=function(){
 oldBind();
 app.querySelectorAll('[data-v3-purpose]').forEach(el=>el.onclick=()=>{state.v3Recommend.purpose=el.dataset.v3Purpose;state.v3Recommend.ready=false;render()});
 for(const [id,key] of [['v3-venue','venue'],['v3-people','people'],['v3-budget','budget']]){let el=document.getElementById(id);if(el)el.onchange=()=>{state.v3Recommend[key]=el.type==='number'?Math.max(key==='people'?1:0,Number(el.value)||0):el.value;state.v3Recommend.ready=false}};
 app.querySelectorAll('[data-v3-recommend]').forEach(el=>el.onclick=()=>{state.v3Recommend.ready=true;render()});
 app.querySelectorAll('[data-v3-use]').forEach(el=>el.onclick=()=>useTemplate(el.dataset.v3Use));
};
const analytics={
 times:[280,490,650,920,1350,1250,980,760,430],
 stages:[['QR 스캔',12400],['게임 시작',10200],['정보 입력·동의 완료',6324],['게임 완료',5950],['경품 수령',4820]]
};
function funnelHTML(){
 return '<div class="v3-funnel">'+analytics.stages.map(([name,n],i)=>{const prev=i?analytics.stages[i-1][1]:n;const drop=i?((prev-n)/prev*100).toFixed(1)+'%':'—';return '<div class="v3-funnel-step"><div class="between"><strong>'+name+'</strong><span>'+n.toLocaleString()+'건 · 단계 이탈 '+drop+'</span></div><div class="v3-track"><div style="width:'+(100*n/analytics.stages[0][1]).toFixed(1)+'%"></div></div></div>'}).join('')+'</div>';
}
function analyticsPanels(reportMode){
 const bars=analytics.times.map((v,i)=>'<div class="v3-bar-cell"><div style="height:'+(100*v/1350).toFixed(1)+'%"></div><small>'+(10+i)+'시</small></div>').join('');
 const summary=reportMode?'종료 후 성과 분석':'운영 데이터 분석';
 return '<section class="panel v3-analytics"><div class="between"><div><span class="eyebrow">CAMPAIGN ANALYTICS</span><h2>'+summary+'</h2></div><span class="mini-label">시연 데이터 · 실제 수집/실시간 연동 전</span></div><div class="v3-statrow"><div><small>QR 스캔</small><strong>12,400</strong></div><div><small>게임 시작</small><strong>10,200</strong></div><div><small>게임 완료</small><strong>5,950</strong></div><div><small>QR → 완료</small><strong>48.0%</strong></div></div><div class="v3-analytics-grid"><div><h3>시간대별 게임 시작 추이</h3><p class="mini-label">14시 피크 · 시간대별 시연 수치</p><div class="v3-bars">'+bars+'</div></div><div><h3>참여 퍼널</h3><p class="mini-label">직전 단계 대비 이탈률</p>'+funnelHTML()+'</div></div><div class="v3-insight"><strong>✧ '+(reportMode?'성과 인사이트 및 다음 행사 제안':'운영 인사이트')+'</strong><p>정보 입력·동의 단계에서 <b>38.0% 이탈</b>이 발생합니다. 필수 입력 항목을 줄이고 동의 문구를 간결하게 정리해 보세요. 14시 전후에는 안내 인력을 집중 배치하는 것이 좋겠습니다.</p></div></section>';
}
const oldOperate=operate;operate=function(){let h=oldOperate();return h.replace(/(<div class="grid cols-4 mb">)/,analyticsPanels(false)+'$1')};
const oldReport=report;report=function(){let h=oldReport();return h.replace(/(<div class="grid" style="grid-template-columns:minmax\(0,1fr\) 430px">)/,analyticsPanels(true)+'$1')};
})();
