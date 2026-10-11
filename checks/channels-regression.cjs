const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};const empty=()=>({innerHTML:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},querySelectorAll(){return []},querySelector(){return null},insertAdjacentHTML(pos,html){this.innerHTML+=html},addEventListener(){},focus(){},setAttribute(){}});
elements.app=empty();elements.toast=empty();const listeners=[];const doc={body:empty(),title:'',activeElement:empty(),getElementById:id=>elements[id]||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn,capture){listeners.push({type,fn,capture})},createElement:()=>({...empty(),content:empty()})};
const loc={_hash:'',search:'',origin:'https://example.chatgpt.site',pathname:'/',get hash(){return this._hash},set hash(v){this._hash=v.startsWith('#')?v:'#'+v}};
const ctx=vm.createContext({document:doc,location:loc,URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},print(){}},setTimeout:()=>0,clearTimeout(){},navigator:{clipboard:{writeText(){}}},console,Blob,URL});
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);for(const name of scripts)vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),ctx,{filename:name});
function run(s){return vm.runInContext(s,ctx)}



run("beginEvent('greenday')");assert.match(run('basicInfo()'),/id="event-channel" required/);
for(const [id,value] of Object.entries({'event-name':'온라인 테스트 행사','event-start':'2026-10-10','event-end':'2026-10-12','event-type':'브랜드 프로모션','event-place':'','basic-brand':'greenday','event-channel':''}))elements[id]={value};
run("submitBasics({preventDefault(){}})");assert.equal(run('route()'),'event-basic');
elements['event-channel'].value='온라인';run("submitBasics({preventDefault(){}})");assert.equal(run('route()'),'templates');assert.equal(run('state.basic.channel'),'온라인');
assert.equal(run('state.selectedTemplate'),'');
assert.equal(run('state.gameDraft'),null);
assert(run("state.eventMemory[eventKey('greenday','온라인 테스트 행사')]"));
run("openWorkspaceEvent({dataset:{eventBrand:'greenday',openEvent:'온라인 테스트 행사'}})");
assert.equal(run('route()'),'editor');
assert.match(run('editor()'),/게임을 선택해주세요/);
assert.doesNotMatch(run('editor()'),/id="layer-canvas"|data-action="to-review"|class="studio-bottom"/);
run("action('select-event-game')");assert.equal(run('route()'),'templates');
run("useTemplate('nova-scratch');retainEvent()");assert.equal(run('route()'),'editor');
assert.equal(run('state.selectedTemplate'),'nova-scratch');
assert.match(run('editor()'),/id="layer-canvas"/);
run("go('home');openWorkspaceEvent({dataset:{eventBrand:'greenday',openEvent:'온라인 테스트 행사'}})");
assert.equal(run('state.selectedTemplate'),'nova-scratch');
assert.doesNotMatch(run('editor()'),/게임을 선택해주세요/);
run("go('home');state.eventChannelFilters.home='온라인';render()");assert.match(run('eventTable()'),/온라인 테스트 행사/);assert.doesNotMatch(run('eventTable()'),/루미에르 성수 팝업 룰렛/);assert.match(run('eventTable()'),/<th>운영 방식<\/th>/);assert.match(run('eventTable()'),/게임 제작/);
run("state.brandFilter='lumiere';render()");assert.match(run('eventTable()'),/조건에 맞는 행사가 없습니다/);
run("go('events');state.eventChannelFilters.events='오프라인';render()");assert.doesNotMatch(run('eventTable()'),/온라인 테스트 행사/);assert.match(run('eventTable()'),/루미에르 뷰티 위크/);
run("enterBrandWorkspace('greenday');state.eventChannelFilters['workspace-detail']='온라인';render()");assert.match(run('brandDetail()'),/온라인 테스트 행사/);assert.doesNotMatch(run('brandRows(currentBrand(),false)'),/그린데이 가을 신제품 퀴즈/);
run("openWorkspaceEvent({dataset:{eventBrand:'greenday',openEvent:'온라인 테스트 행사'}})");assert.equal(run('state.basic.channel'),'온라인');
run("state.eventName='';state.creationFlow=false;go('templates')");
assert.doesNotMatch(run('templates()'),/data-use-prompt-example|예시 사용/);
const example='가을 리빙 박람회에서 사용할 룰렛을 만들어줘. 따뜻한 오렌지와 크림색으로 구성하고, 5개의 보기에 머그컵, 에코백, 커피 쿠폰, 할인 쿠폰, 꽝을 넣어줘.';
for(const blank of ['', '   ']){
 elements['create-prompt']={value:blank,placeholder:example,focus(){this.focused=true}};
 run("go('templates')");
 run("createAction('generate')");
 assert.equal(run('route()'),'templates');
 assert(elements['create-prompt'].focused);
 assert.equal(elements['create-prompt'].value,example);
 run("createAction('generate')");
 assert.equal(run('state.createPrompt'),example);
 assert.equal(run('state.gameDraft.kind'),'wheel');
 assert.equal(run('state.gameDraft.count'),5);
 assert.deepEqual(Array.from(run('state.gameDraft.labels')),['머그컵','에코백','커피 쿠폰','할인 쿠폰','꽝']);
 assert.equal(run('route()'),'game-draft');
}
const custom='여름 박람회에서 사용할 스크래치를 만들어줘. 보기 3개로 구성해줘.';
elements['create-prompt']={value:custom,placeholder:example};run("createAction('generate')");
assert.equal(elements['create-prompt'].value,custom);
assert.equal(run('state.createPrompt'),custom);
assert.equal(run('state.gameDraft.kind'),'scratch');
console.log('PASS: channel persistence and filters, empty/whitespace example generation, custom prompt preservation');
