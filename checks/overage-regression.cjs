const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};const empty=()=>({innerHTML:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},querySelectorAll(){return []},querySelector(){return null},insertAdjacentHTML(pos,html){this.innerHTML+=html},addEventListener(){},focus(){},setAttribute(){}});
elements.app=empty();elements.toast=empty();const listeners=[];const doc={body:empty(),title:'',activeElement:empty(),getElementById:id=>elements[id]||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn,capture){listeners.push({type,fn,capture})},createElement:()=>({...empty(),content:empty()})};
const loc={_hash:'',search:'',origin:'https://example.chatgpt.site',pathname:'/',get hash(){return this._hash},set hash(v){this._hash=v.startsWith('#')?v:'#'+v}};
const ctx=vm.createContext({document:doc,location:loc,URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},print(){}},setTimeout:()=>0,clearTimeout(){},navigator:{clipboard:{writeText(){}}},console,Blob,URL});
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);for(const name of scripts)vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),ctx,{filename:name});
function run(s){return vm.runInContext(s,ctx)}




run("beginEvent('lumiere')");
for(const [id,value] of Object.entries({'event-name':'루미에르 강남 팝업 룰렛','event-start':'2099-10-10','event-end':'2099-10-12','event-type':'팝업스토어','event-place':'강남','basic-brand':'lumiere','event-channel':'오프라인'}))elements[id]={value};
run("submitBasics({preventDefault(){}});useTemplate('lumiere-wheel');state.consent=true;action('save');action('to-review');action('approve');state.paid=true;studioAction('publish');go('operate')");
assert.equal(run('demoOverage().excess'),1000);assert.equal(run('demoOverage().amount'),5000);assert.equal(run('state.settings.demoTraffic.participations'),21000);
let html=run('operate()');assert.match(html,/기본 포함량 초과 \(21,000\/20,000회\)/);assert.match(html,/5,000원/);assert.match(html,/경품 발송 실패 2건<\/strong>/);assert.doesNotMatch(html,/3,412/);
run("go('publish')");assert.doesNotMatch(run('publish()'),/5,000원|초과 단가|정산 안내/);
run("go('report')");assert.doesNotMatch(run('report()'),/추가 이용료 정산 안내/);
run("go('operate');action('end');action('confirm-event-end')");assert.equal(run('route()'),'report');html=run('report()');assert.match(html,/추가 이용료 정산 안내/);assert.match(html,/5,000원/);assert.match(html,/이 정산 정보는 고객 공유 리포트에 포함되지 않습니다/);
run("action('demo-settlement')");assert.match(elements.app.innerHTML,/등록 카드 끝자리 1234/);assert.match(elements.app.innerHTML,/1,000회 × 5원 = 5,000원/);
run("action('ai-report')");assert.match(run('state.reportText'),/총 21,000회/);assert.match(run('state.reportText'),/실패 2건/);assert.doesNotMatch(run('state.reportText'),/5,000|결제|정산|1234/);
html=run('brandReport()');assert.match(html,/21,000/);assert.doesNotMatch(html,/internal-billing|5,000|1234|정산 안내|초과 단가/);
ctx.exported=null;run('download=function(name,contents){globalThis.exported=contents};action("csv")');assert.match(ctx.exported,/참여 수,21000/);assert.doesNotMatch(ctx.exported,/5000|1234|정산|결제/);
run("retainEvent();go('home');openWorkspaceEvent({dataset:{eventBrand:'lumiere',openEvent:GANGNAM_DEMO_NAME}})");assert.equal(run('demoOverage().amount'),5000);
run("openWorkspaceEvent({dataset:{eventBrand:'lumiere',openEvent:'루미에르 성수 팝업 룰렛'}})");assert.equal(run('demoOverage()'),null);assert.doesNotMatch(run('operate()'),/패스 이용 현황/);
assert.match(fs.readFileSync('dist/qa-fixes.css','utf8'),/@media print\{\.internal-billing\{display:none!important\}\}/);
console.log('PASS: demo overage calculation, two failures, lifecycle settlement, exact exported counts, billing excluded from client/CSV/print, restored event isolation');
