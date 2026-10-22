const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};const empty=()=>({innerHTML:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},querySelectorAll(){return []},querySelector(){return null},insertAdjacentHTML(pos,html){this.innerHTML+=html},addEventListener(){},focus(){},setAttribute(){}});
elements.app=empty();elements.toast=empty();const listeners=[];const doc={body:empty(),title:'',activeElement:empty(),getElementById:id=>elements[id]||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn,capture){listeners.push({type,fn,capture})},createElement:()=>({...empty(),content:empty()})};
const loc={_hash:'',search:'',origin:'https://example.chatgpt.site',pathname:'/',get hash(){return this._hash},set hash(v){this._hash=v.startsWith('#')?v:'#'+v}};
const ctx=vm.createContext({document:doc,location:loc,URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},print(){}},setTimeout:()=>0,clearTimeout(){},navigator:{clipboard:{writeText(){}}},console,Blob,URL});
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);for(const name of scripts)vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),ctx,{filename:name});
function run(s){return vm.runInContext(s,ctx)}




assert.match(run('templates()'),/행사 목적에 맞는 게임 추천/);
run('state.v3Recommend.ready=true');
assert.equal((run('templates()').match(/data-v3-use=/g)||[]).length,3);
assert.match(run('operate()'),/운영 데이터 분석/);
assert.match(run('report()'),/운영 중 성과 분석/);
console.log('PASS: v3 recommendation Top 3, operations analytics and performance analytics render');

run("state.v3Recommend.purpose='custom';state.v3Recommend.customPurpose='재방문 쿠폰 제공';state.v3Recommend.ready=true");
let html=run('templates()');assert.match(html,/id="v3-custom-purpose"/);assert.match(html,/value="재방문 쿠폰 제공"/);assert(html.indexOf('data-v3-use="nova-scratch"')<html.indexOf('data-v3-use="lumiere-wheel"'));
assert.doesNotMatch(html,/추천 로직 시연|실제 500회|기존 게임 템플릿 기반|고객 정보 수집 ·/);
run("state.aiReport=false;state.reportPublished=false;state.settings.includeAISummary=true");html=run('report()');assert.match(html,/AI 성과 분석 요약/);assert.match(html,/고객 공유용 요약/);assert.doesNotMatch(html,/id="report-text"/);assert.match(html,/data-action="edit-summary"/);assert.doesNotMatch(html,/data-action="ai-report"/);assert(run('state.aiReport'));assert(!run('state.confirmedReport'));
const saved=run('state.reportText');run('report()');assert.equal(run('state.reportText'),saved);
const purposeButton={dataset:{v3Purpose:'custom'}},recommendButton={},customInput={value:'',focus(){this.focused=true}};
elements['v3-custom-purpose']=customInput;
elements.app.querySelectorAll=q=>q==='[data-v3-purpose]'?[purposeButton]:q==='[data-v3-recommend]'?[recommendButton]:[];
run('bind()');customInput.oninput();recommendButton.onclick();assert(!run('state.v3Recommend.ready'));assert(customInput.focused);
customInput.value='신제품 인지';customInput.oninput();recommendButton.onclick();assert(run('state.v3Recommend.ready'));assert.match(run('templates()'),/value="신제품 인지"/);
console.log('PASS: custom-purpose input and recommendation, removed copy, automatic editable summary and confirmation gate');

run("state.v3Recommend.ready=true");const cards=run('templates()').match(/<div class="v3-result">[\s\S]*?<\/section>/)[0];assert.equal((cards.match(/class="v3-game-screen"/g)||[]).length,3);assert.equal((cards.match(/class="sample-mobile"/g)||[]).length,3);assert.doesNotMatch(cards,/미리보기/);assert.match(run('templates()'),/추천해드려요/);
const operation=run('operate()');assert.doesNotMatch(operation,/시연 데이터 · 실제 수집\/실시간 연동 전/);assert.match(operation,/완료된 1시간 구간/);assert.match(operation,/100건 이상·이탈률 30% 이상/);assert.match(operation,/38.0%/);assert.match(operation,/원인을 확정할 수는 없습니다/);
console.log('PASS: recommendation game screens and snapshot-based insight policy');

// Edit mode is opt-in, cancel discards changes, and confirmation closes it.
elements.app.querySelectorAll=()=>[];
run("state.reportPublished=false;state.settings.includeAISummary=true;go('report')");
const originalSummary=run('state.reportText');run("action('edit-summary')");assert.match(run('report()'),/id="report-text"/);assert.match(run('report()'),/data-action="cancel-summary"/);
elements['report-text']={value:'취소할 수정',focus(){}};run('bind()');elements['report-text'].oninput();assert.equal(run('state.reportText'),originalSummary);
run("action('cancel-summary')");assert.equal(run('state.reportText'),originalSummary);assert.doesNotMatch(run('report()'),/id="report-text"/);
run("action('edit-summary')");elements['report-text'].value='확정한 새 요약';run('bind()');elements['report-text'].oninput();run("action('confirm-report')");assert.equal(run('state.reportText'),'확정한 새 요약');assert(run('state.confirmedReport'));assert.doesNotMatch(run('report()'),/id="report-text"/);
run('state.reportPublished=true');run("action('edit-summary')");assert.doesNotMatch(run('report()'),/id="report-text"|data-action="edit-summary"/);
console.log('PASS: summary reading, opt-in editing, cancel, confirmation and published lock');
