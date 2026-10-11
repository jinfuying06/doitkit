const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};const empty=()=>({innerHTML:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},querySelectorAll(){return []},querySelector(){return null},insertAdjacentHTML(pos,html){this.innerHTML+=html},addEventListener(){},focus(){},setAttribute(){}});
elements.app=empty();elements.toast=empty();const listeners=[];const doc={body:empty(),title:'',activeElement:empty(),getElementById:id=>elements[id]||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn,capture){listeners.push({type,fn,capture})},createElement:()=>({...empty(),content:empty()})};
const loc={_hash:'',search:'',origin:'https://example.chatgpt.site',pathname:'/',get hash(){return this._hash},set hash(v){this._hash=v.startsWith('#')?v:'#'+v}};
const ctx=vm.createContext({document:doc,location:loc,URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},print(){}},setTimeout:()=>0,clearTimeout(){},navigator:{clipboard:{writeText(){}}},console,Blob,URL});
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);for(const name of scripts)vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),ctx,{filename:name});
function run(s){return vm.runInContext(s,ctx)}


const before=run('JSON.stringify(allEventRows().map(r=>[r.brand.id,r.e[0],r.flow.entry,r.record.approved]))');
for(const row of JSON.parse(run('JSON.stringify(allEventRows().map(r=>({brand:r.brand.id,name:r.e[0],entry:r.flow.entry})))'))){
  run(`openWorkspaceEvent({dataset:{eventBrand:${JSON.stringify(row.brand)},openEvent:${JSON.stringify(row.name)}}})`);
  assert.equal(run('route()'),row.entry,'Saved stage determines entry screen');
}
run("selectScope('novahome');go('home');selectScope('greenday');go('home')");
assert.equal(run('JSON.stringify(allEventRows().map(r=>[r.brand.id,r.e[0],r.flow.entry,r.record.approved]))'),before,'Brand navigation must not clone or change events');
run("state.taskFilter='failed';state.filter='진행 중';state.brandFilter='lumiere';go('workspace');selectScope('novahome');go('home')");
assert.equal(run('JSON.stringify([state.brandFilter,state.filter,state.taskFilter])'),'["전체","전체","전체"]');
for(const name of ['루미에르 성수 팝업 룰렛','노바홈 가전박람회 스크래치','그린데이 가을 신제품 퀴즈'])assert(run('eventTable()').includes(name));
run("selectTaskFilter('failed');go('events')");assert.match(run('eventTable()'),/노바홈 가전박람회 스크래치/);assert.match(run('eventTable()'),/루미에르 뷰티 위크/);
run("openWorkspaceEvent({dataset:{eventBrand:'novahome',openEvent:'노바홈 가전박람회 스크래치'}});action('approve');enterBrandWorkspace('novahome')");
assert.match(run('brandDetail()'),/게시 준비/);run("go('home')");assert.match(run('eventTable()'),/게시 준비/);
run("openWorkspaceEvent({dataset:{eventBrand:'novahome',openEvent:'노바홈 가전박람회 스크래치'}})");assert.equal(run('route()'),'publish');
run("state.published=true;retainEvent();enterBrandWorkspace('novahome')");assert.match(run('brandDetail()'),/운영 중/);
run("openWorkspaceEvent({dataset:{eventBrand:'novahome',openEvent:'노바홈 가전박람회 스크래치'}});action('end');action('confirm-event-end');enterBrandWorkspace('novahome')");assert.match(run('brandDetail()'),/종료된 행사/);run("go('home')");assert.doesNotMatch(run('eventTable()'),/노바홈 가전박람회 스크래치/);
console.log('PASS: saved-stage entry, cross-brand isolation, home/global filters, review/publish/operate/end lifecycle');
