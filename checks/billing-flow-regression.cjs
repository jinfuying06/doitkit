const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};const empty=()=>({innerHTML:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},querySelectorAll(){return []},querySelector(){return null},insertAdjacentHTML(pos,html){this.innerHTML+=html},addEventListener(){},focus(){},setAttribute(){}});
elements.app=empty();elements.toast=empty();const listeners=[];const doc={body:empty(),title:'',activeElement:empty(),getElementById:id=>elements[id]||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn,capture){listeners.push({type,fn,capture})},createElement:()=>({...empty(),content:empty()})};
const loc={_hash:'',search:'',origin:'https://example.chatgpt.site',pathname:'/',get hash(){return this._hash},set hash(v){this._hash=v.startsWith('#')?v:'#'+v}};
const ctx=vm.createContext({document:doc,location:loc,URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},print(){}},setTimeout:()=>0,clearTimeout(){},navigator:{clipboard:{writeText(){}}},console,Blob,URL});
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);for(const name of scripts)vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),ctx,{filename:name});
function run(s){return vm.runInContext(s,ctx)}




run("openWorkspaceEvent({dataset:{eventBrand:'lumiere',openEvent:'루미에르 성수 팝업 룰렛'}});go('checkout')");
let html=run('checkout()');assert.match(html,/기본 포함량 <strong>20,000회/);assert.match(html,/1회당 5원/);assert.match(html,/월 정산 시 등록 카드로 결제/);assert.doesNotMatch(html,/구간·단가 확정 예정/);
run("state.settings.billing={included:20000,unitPrice:5,participations:20500,cardLast4:'5678',billingDate:'2026-11-10',status:'결제 예정'};state.ended=false;go('operate')");
html=run('operate()');assert.match(html,/초과 500회/);assert.match(html,/2,500원/);
run("state.settings.billing.participations=21000;render()");assert.match(run('operate()'),/5,000원/);
run("action('end')");assert.doesNotMatch(elements.app.innerHTML,/end-billing-notice|현재 초과|종료 시 즉시 결제/);assert.match(elements.app.innerHTML,/data-action="confirm-event-end">행사 종료/);
run("action('confirm-event-end')");assert.equal(run('route()'),'report');assert.equal(run('state.settings.billing.finalParticipation'),21000);
html=run('report()');assert(html.indexOf('행사 종료')<html.indexOf('추가 이용료 정산 안내'));assert(html.indexOf('추가 이용료 정산 안내')<html.indexOf('데이터 요약'));
run("action('settlement-details')");assert.equal(run('route()'),'settlement');assert.match(elements.app.innerHTML,/1,000회 × 5원 = 5,000원/);assert.match(elements.app.innerHTML,/2026년 11월 10일/);assert.match(elements.app.innerHTML,/등록 카드 끝자리 5678/);assert.match(elements.app.innerHTML,/결제 예정/);assert.equal(doc.title,'정산 내역 · 두잇킷');
run("state.settings.billing.status='결제 완료';state.settings.billing.paidAt='2026-11-10';render()");assert.match(elements.app.innerHTML,/결제일/);assert.match(elements.app.innerHTML,/추가 이용료 결제가 완료/);assert.doesNotMatch(elements.app.innerHTML,/<dt>결제 예정일/);
html=run('brandReport()');assert.doesNotMatch(html,/5,000원|5678|월 정산|정산 안내/);
run("go('report');navigateBack()");assert.equal(run('route()'),'settlement');
run("openWorkspaceEvent({dataset:{eventBrand:'greenday',openEvent:'그린데이 가을 신제품 퀴즈'}});state.published=true;state.ended=true;retainEvent();go('report')");assert.doesNotMatch(run('report()'),/추가 이용료 정산 안내|settlement-details/);assert.equal(run('billingUsage().amount'),0);
console.log('PASS: shared billing terms, live usage calculation, end confirmation, frozen final counts, settlement page/date/card/status, report exclusion and cross-event isolation');
