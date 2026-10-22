const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};const empty=()=>({innerHTML:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},querySelectorAll(){return []},querySelector(){return null},insertAdjacentHTML(pos,html){this.innerHTML+=html},addEventListener(){},focus(){},setAttribute(){}});
elements.app=empty();elements.toast=empty();const listeners=[];const doc={body:empty(),title:'',activeElement:empty(),getElementById:id=>elements[id]||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn,capture){listeners.push({type,fn,capture})},createElement:()=>({...empty(),content:empty()})};
const loc={_hash:'',search:'',origin:'https://example.chatgpt.site',pathname:'/',get hash(){return this._hash},set hash(v){this._hash=v.startsWith('#')?v:'#'+v}};
const ctx=vm.createContext({document:doc,location:loc,URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},print(){}},setTimeout:()=>0,clearTimeout(){},navigator:{clipboard:{writeText(){}}},console,Blob,URL});
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);for(const name of scripts)vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),ctx,{filename:name});
function run(s){return vm.runInContext(s,ctx)}



run("go('events')");
const filterButtons=['전체','진행 중','검토 중','시작 예정','종료'].map(status=>({dataset:{filter:status}}));
elements.app.querySelectorAll=q=>q==='[data-filter]'?filterButtons:[];
function press(status){run('bind()');filterButtons.find(button=>button.dataset.filter===status).onclick()}
function displayedStatuses(){return [...run('eventTable()').matchAll(/data-event-status="([^"]+)"/g)].map(m=>m[1])}
press('진행 중');assert.deepEqual(displayedStatuses(),['진행 중','진행 중']);
press('시작 예정');assert.deepEqual(displayedStatuses(),['진행 중','진행 중','시작 예정']);
let html=run('events()');assert.doesNotMatch(html,/status-filter-check/);assert.match(html,/data-filter="전체"[^>]*aria-pressed="false"/);assert.match(html,/data-filter="진행 중"[^>]*aria-pressed="true"/);assert.match(html,/data-filter="시작 예정"[^>]*aria-pressed="true"/);
press('진행 중');assert.deepEqual(displayedStatuses(),['시작 예정']);
press('시작 예정');assert.equal(displayedStatuses().length,5);assert.match(run('events()'),/data-filter="전체"[^>]*aria-pressed="true"/);
press('검토 중');press('종료');assert.deepEqual(displayedStatuses(),['검토 중','종료']);
press('전체');assert.equal(displayedStatuses().length,5);assert.equal(run('state.filter'),'전체');
press('진행 중');press('시작 예정');run("state.brandFilter='greenday';state.eventChannelFilters.events='온라인';render()");assert.deepEqual(displayedStatuses(),['진행 중']);assert.match(run('eventTable()'),/그린데이 온라인 런칭 퀴즈/);assert.doesNotMatch(run('eventTable()'),/그린데이 가을 신제품 퀴즈/);
run("go('home')");press('진행 중');press('시작 예정');assert.deepEqual(displayedStatuses(),['진행 중','진행 중','시작 예정']);assert.doesNotMatch(run('home()'),/data-filter="종료"/);press('전체');assert.equal(displayedStatuses().length,4);
console.log('PASS: actual multi-select clicks, OR status matching, selected chip states, all/reset/last deselect, combined brand-channel filters and home parity');
