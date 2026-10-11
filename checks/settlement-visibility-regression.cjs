const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};const empty=()=>({innerHTML:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},querySelectorAll(){return []},querySelector(){return null},insertAdjacentHTML(pos,html){this.innerHTML+=html},addEventListener(){},focus(){},setAttribute(){}});
elements.app=empty();elements.toast=empty();const listeners=[];const doc={body:empty(),title:'',activeElement:empty(),getElementById:id=>elements[id]||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn,capture){listeners.push({type,fn,capture})},createElement:()=>({...empty(),content:empty()})};
const loc={_hash:'',search:'',origin:'https://example.chatgpt.site',pathname:'/',get hash(){return this._hash},set hash(v){this._hash=v.startsWith('#')?v:'#'+v}};
const ctx=vm.createContext({document:doc,location:loc,URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},print(){}},setTimeout:()=>0,clearTimeout(){},navigator:{clipboard:{writeText(){}}},console,Blob,URL});
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);for(const name of scripts)vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),ctx,{filename:name});
function run(s){return vm.runInContext(s,ctx)}




run("openWorkspaceEvent({dataset:{eventBrand:'lumiere',openEvent:'루미에르 성수 팝업 룰렛'}});go('operate')");
assert.match(run('operate()'),/<strong class="point-label">경품 발송 실패 5건<\/strong>/);assert.doesNotMatch(run('operate()'),/기본 포함량 초과|현재 추가 이용료/);
run("action('end');action('confirm-event-end')");assert.doesNotMatch(run('report()'),/settlement-summary|settlement-details/);run("action('settlement-details')");assert.equal(run('route()'),'report');run("go('settlement')");assert.equal(run('route()'),'report');assert.doesNotMatch(elements.app.innerHTML,/settlement-page|追加|追加 이용료 없음/);
run("openWorkspaceEvent({dataset:{eventBrand:'novahome',openEvent:'노바홈 가전박람회 스크래치'}});state.published=true;state.ended=false;state.settings.billing={participations:21000,included:20000,unitPrice:5,finalParticipation:0};retainEvent();go('operate')");
assert.match(run('operate()'),/기본 포함량 초과 \(21,000\/20,000회\)/);assert.equal(run('billingUsage().amount'),5000);
run("action('end')");assert.doesNotMatch(elements.app.innerHTML,/end-billing-notice|현재 초과/);run("action('confirm-event-end')");assert.equal(run('billingUsage().amount'),5000);assert.equal(run('state.settings.billing.finalParticipation'),21000);assert.match(run('report()'),/5,000원/);
run("action('settlement-details')");assert.match(elements.app.innerHTML,/노바홈 · 노바홈 가전박람회 스크래치 · 2026-10-20 10:00 — 2026-10-22 16:00/);assert.doesNotMatch(elements.app.innerHTML,/추가 이용료 없음/);
run("state.ended=false;state.settings.billing.finalParticipation=0;retainEvent()");assert(run('applyScheduledChanges(Date.parse("2100-01-01"))'));assert.equal(run('billingUsage().amount'),5000);
console.log('PASS: highlighted failures, zero-billing hidden and direct-route blocked, live/end/settlement consistency with stale snapshots, context and automatic-end freeze');
