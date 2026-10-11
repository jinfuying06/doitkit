// Template editing is independent of event participation and delivery settings.
const designOnlySections=editorSections;editorSections=function(){return state.gameDraftMode?'':designOnlySections()};
const designOnlyEditor=editor;editor=function(p=false){if(state.gameDraftMode)state.editorTab='디자인';return designOnlyEditor(p)};
const requiredConsentForm=editorForm;editorForm=function(){return requiredConsentForm().replace(/<label class="checkbox setup-confirm">[\s\S]*?<\/label>/,'')};
const detailedReviewNavigation=navigateEventStep;navigateEventStep=function(target){
 if(target==='review'&&!state.published&&!state.approved){
  if(!state.settings.designSaved){state.editorTab='디자인';go('editor');return toast('게임을 저장한 뒤 검토를 요청해주세요.')}
  if(!state.consent){state.editorTab='수집·동의';go('editor');return toast('참여 정보 설정을 저장해주세요.')}
  if(state.settings.savedEditorSignature&&!editorSaved())return toast('변경한 내용을 저장한 뒤 검토를 요청해주세요.');
 }
 return detailedReviewNavigation(target);
};
const outsideCustomerReview=review;review=function(){return outsideCustomerReview().replace('</div></main>','<div class="customer-review-action"><a class="btn secondary" href="#brand-review">고객 검토 화면 열기</a></div></div></main>')};
function wheelLabels(){return state.gameDraft?.labels||rewards().map(p=>p.name).concat('꽝')}
function selectedWheelChoice(){return Math.max(0,Math.min(state.wheelChoiceIndex||0,wheelLabels().length-1))}
const directWheelProperties=properties;properties=function(){let h=directWheelProperties();if(state.layerId!=='game'||currentTemplate().kind!=='wheel')return h;const start=h.indexOf('<div class="field"><label>룰렛 칸</label>');if(start<0)return h;const i=selectedWheelChoice();return h.slice(0,start)+`<div class="field"><label for="selected-wheel-choice">선택한 룰렛 칸</label><input id="selected-wheel-choice" data-wheel-choice="${i}" value="${esc(wheelLabels()[i])}"></div>`};
const directWheelSketch=gameSketch;gameSketch=function(t){
 const editing=t.id===state.selectedTemplate&&['editor','game-draft'].includes(route())&&state.editorTab==='디자인';
 if(t.kind!=='wheel'||!editing)return directWheelSketch(t);
 const labels=wheelLabels(),size=labels.length,selected=selectedWheelChoice(),colors=[t.accent,t.stage,'#ead4ac',t.paper];
 const point=(a,r)=>[100+r*Math.sin(a*Math.PI/180),100-r*Math.cos(a*Math.PI/180)];
 return `<svg class="editable-wheel" viewBox="0 0 200 200" role="group" aria-label="룰렛 칸 선택">${labels.map((name,i)=>{const a=i*360/size,b=(i+1)*360/size,[x1,y1]=point(a,94),[x2,y2]=point(b,94),[x,y]=point((a+b)/2,62);return `<path d="M100 100 L${x1} ${y1} A94 94 0 ${b-a>180?1:0} 1 ${x2} ${y2} Z" fill="${colors[i%4]}" class="wheel-sector ${selected===i?'selected':''}" data-wheel-sector="${i}" role="button" tabindex="0" aria-label="${esc(name)} 칸 편집" aria-pressed="${selected===i}"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${esc(name)}</text>`}).join('')}<circle cx="100" cy="100" r="20" fill="white"/><text x="100" y="100" text-anchor="middle" dominant-baseline="middle">GO</text></svg>`;
};
const exampleMembers={
 lumiere:[{id:'lumiere-jieun',name:'박지은',email:'jieun@lumiere.example.com'},{id:'lumiere-minseo',name:'김민서',email:'minseo@lumiere.example.com'}],
 novahome:[{id:'nova-hyunjun',name:'이현준',email:'hyunjun@novahome.example.com'},{id:'nova-sujin',name:'정수진',email:'sujin@novahome.example.com'}],
 greenday:[{id:'green-hana',name:'최하나',email:'hana@greenday.example.com'},{id:'green-seoyeon',name:'윤서연',email:'seoyeon@greenday.example.com'}]
};
for(const b of brands)b.members=exampleMembers[b.id]||b.members||[];
for(const row of allEventRows())if(row.record.settings.reviewComments)row.record.settings.reviewComments.forEach((c,i)=>{const m=row.brand.members[i%row.brand.members.length];if(m){c.author=m.name;c.memberId=m.id}});
function brandMemberList(){return `<div class="brand-member-list">${(currentBrand().members||[]).map(m=>`<div class="brand-member"><div class="member-initial">${esc(m.name[0])}</div><div><strong>${esc(m.name)}</strong><p class="mini-label">${esc(m.email)}</p></div></div>`).join('')}</div>`}
const assignedBrandDetail=brandDetail;brandDetail=function(){const h=assignedBrandDetail();return state.wsTab==='멤버'?h.replace('<h2>브랜드 담당자</h2>','<h2>브랜드 담당자</h2>'+brandMemberList()):h};
const editorExperienceBind=bind;bind=function(){
 editorExperienceBind();
 app.querySelectorAll('[data-revision="invite"]').forEach(n=>n.onclick=()=>{const input=document.getElementById('member-email'),email=input?.value.trim();if(!email||!input.checkValidity())return toast('이메일 주소를 확인해주세요.');const b=currentBrand();b.members=b.members||[];if(b.members.some(m=>m.email===email))return toast('이미 등록된 담당자입니다.');b.members.push({id:b.id+'-'+b.members.length,name:email.split('@')[0],email});render();toast('담당자 초대를 시연했습니다. 실제 메일은 발송되지 않습니다.')});
 app.querySelectorAll('[data-wheel-sector]').forEach(n=>{const select=e=>{e.preventDefault();e.stopPropagation();state.wheelChoiceIndex=+n.dataset.wheelSector;state.layerId='game';state.toolTab='속성';render();document.getElementById('selected-wheel-choice')?.focus()};n.onclick=select;n.onkeydown=e=>{if(e.key==='Enter'||e.key===' ')select(e)}});
};
render();
