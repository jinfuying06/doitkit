const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};const empty=()=>({innerHTML:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},querySelectorAll(){return []},querySelector(){return null},insertAdjacentHTML(pos,html){this.innerHTML+=html},addEventListener(){},focus(){},setAttribute(){}});
elements.app=empty();elements.toast=empty();const listeners=[];const doc={body:empty(),title:'',activeElement:empty(),getElementById:id=>elements[id]||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn,capture){listeners.push({type,fn,capture})},createElement:()=>({...empty(),content:empty()})};
const loc={_hash:'',search:'',origin:'https://example.chatgpt.site',pathname:'/',get hash(){return this._hash},set hash(v){this._hash=v.startsWith('#')?v:'#'+v}};
const ctx=vm.createContext({document:doc,location:loc,URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},print(){}},setTimeout:()=>0,clearTimeout(){},navigator:{clipboard:{writeText(){}}},console,Blob,URL});
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);for(const name of scripts)vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),ctx,{filename:name});
function run(s){return vm.runInContext(s,ctx)}




run("openWorkspaceEvent({dataset:{eventBrand:'lumiere',openEvent:'루미에르 성수 팝업 룰렛'}});go('operate')");
let html=run('operate()');assert.doesNotMatch(html,/패스 이용 현황/);assert.doesNotMatch(html,/확정 예정/);assert.match(html,/경품 발송 실패 5건<\/strong>/);
run("state.settings.failedCount=0;state.settings.failureIds=[];state.retried=true;retainEvent()");assert.doesNotMatch(run('operate()'),/경품 발송 실패 \d+건/);
run("action('end');action('confirm-event-end')");assert(run('state.ended'));assert.equal(run('route()'),'report');
run("state.aiReport=true;state.reportText='확정할 보고문';state.confirmedReport=false;state.reportPublished=false;go('report')");html=run('report()');assert.match(html,/<div class="between mt"><button class="btn secondary" data-action="ai-report">재생성<\/button><button[^>]*data-action="confirm-report"/);assert.doesNotMatch(html,/AI 초안 · 검토 필요|✓ 담당자 확정/);assert.match(html,/--report-brand:#b77ba2/);
elements['report-text']={value:'최종 보고문'};run("action('confirm-report')");elements['report-timing']={value:'즉시 공개'};run("action('share-report')");assert(run('state.reportPublished'));
const snapshot=run('state.reportText');run("go('report');action('ai-report');action('confirm-report')");assert.equal(run('state.reportText'),snapshot);html=run('report()');assert.match(html,/<textarea id="report-text"[^>]*readonly/);assert.match(html,/data-action="confirm-report"[^>]*disabled/);assert.match(html,/공개 후에는 내용을 수정/);
run("openWorkspaceEvent({dataset:{eventBrand:'greenday',openEvent:'그린데이 가을 신제품 퀴즈'}});state.published=false;state.paid=false;go('review')");assert.match(run('review()'),/고객 검토 화면 열기[\s\S]*게시하기/);run("action('review-publish')");assert.match(elements.app.innerHTML,/고객사와 협의가 완료/);assert(!run('state.published'));run("action('confirm-review-publish')");assert.equal(run('route()'),'publish');assert(!run('state.published'));
run("state.paid=true;go('review');action('review-publish');action('confirm-review-publish')");assert(run('state.published'));assert.equal(run('route()'),'operate');
console.log('PASS: completion routing, failure notice/count, report action row, brand chart token, immutable published report, confirmed review publication with pass gate');
