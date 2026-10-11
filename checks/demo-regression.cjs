const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};const empty=()=>({innerHTML:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},querySelectorAll(){return []},querySelector(){return null},insertAdjacentHTML(pos,html){this.innerHTML+=html},addEventListener(){},focus(){},setAttribute(){}});
elements.app=empty();elements.toast=empty();const listeners=[];const doc={body:empty(),title:'',activeElement:empty(),getElementById:id=>elements[id]||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn,capture){listeners.push({type,fn,capture})},createElement:()=>({...empty(),content:empty()})};
const loc={_hash:'',search:'',origin:'https://example.chatgpt.site',pathname:'/',get hash(){return this._hash},set hash(v){this._hash=v.startsWith('#')?v:'#'+v}};
const ctx=vm.createContext({document:doc,location:loc,URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},print(){}},setTimeout:()=>0,clearTimeout(){},navigator:{clipboard:{writeText(){}}},console,Blob,URL});
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);for(const name of scripts)vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),ctx,{filename:name});
function run(s){return vm.runInContext(s,ctx)}




run("beginEvent('lumiere')");
for(const [id,value] of Object.entries({'event-name':'루미에르 강남 팝업 룰렛','event-start':'2099-10-10','event-end':'2099-10-12','event-type':'팝업스토어','event-place':'강남','basic-brand':'lumiere','event-channel':'오프라인'}))elements[id]={value};
run("submitBasics({preventDefault(){}})");assert.equal(run('route()'),'templates');assert.equal(run('state.selectedTemplate'),'');
run("useTemplate('lumiere-wheel');state.consent=true;action('save');action('to-review')");assert.equal(run('route()'),'review');assert.equal(run('state.published'),false);
run("action('approve');state.paid=true;studioAction('publish');go('operate')");assert(run('state.published'));assert.equal(run('state.settings.failedCount'),2);assert.equal(run('failureIds(allEventRows().find(r=>r.e[0]===GANGNAM_DEMO_NAME)).length'),2);
assert.equal(run('endPrompt().early'),false);assert.equal(run('endPrompt().automatic'),false);
run('applyScheduledChanges(Date.parse("2100-01-01"))');assert.equal(run('state.ended'),false);
run("action('end')");assert.match(elements.app.innerHTML,/1시간 후 자동 종료/);assert.doesNotMatch(elements.app.innerHTML,/예정 시간 전에 행사를 종료할까요/);
run("closeQaModal();state.settings.failedCount=0;state.settings.failureIds=[];state.retried=true;retainEvent();go('home');openWorkspaceEvent({dataset:{eventBrand:'lumiere',openEvent:GANGNAM_DEMO_NAME}})");assert.equal(run('state.settings.failedCount'),0);
run("action('end');action('confirm-event-end')");assert(run('state.ended'));
run("openWorkspaceEvent({dataset:{eventBrand:'lumiere',openEvent:'루미에르 성수 팝업 룰렛'}});state.basic.end='2099-10-12';state.ended=false");assert(run('endPrompt().early'));assert.equal(run('isGangnamDemo(state)'),false);
run("go('report');state.aiReport=false");let html=run('report()');assert.equal((html.match(/data-action="ai-report"/g)||[]).length,1);assert.doesNotMatch(html,/전체 화면 ↗/);assert.match(html,/<section class="panel report-preview"[\s\S]*report-preview-actions[\s\S]*data-action="share-report"/);
run("state.aiReport=true");html=run('report()');assert.equal((html.match(/data-action="ai-report"/g)||[]).length,1);assert.doesNotMatch(html,/요약 초안 생성|AI 초안 · 검토 필요/);assert.match(html,/<button class="btn\s*" data-action="confirm-report"/);
console.log('PASS: named demo lifecycle, two failures seeded once, isolated virtual clock, end confirmation, persistent retry state, report actions');
