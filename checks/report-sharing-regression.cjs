const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};const empty=()=>({innerHTML:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},querySelectorAll(){return []},querySelector(){return null},insertAdjacentHTML(pos,html){this.innerHTML+=html},addEventListener(){},focus(){},setAttribute(){}});
elements.app=empty();elements.toast=empty();const listeners=[];const doc={body:empty(),title:'',activeElement:empty(),getElementById:id=>elements[id]||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn,capture){listeners.push({type,fn,capture})},createElement:()=>({...empty(),content:empty()})};
const loc={_hash:'',search:'',origin:'https://example.chatgpt.site',pathname:'/',get hash(){return this._hash},set hash(v){this._hash=v.startsWith('#')?v:'#'+v}};
const ctx=vm.createContext({document:doc,location:loc,URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},print(){}},setTimeout:()=>0,clearTimeout(){},navigator:{clipboard:{writeText(){}}},console,Blob,URL});
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);for(const name of scripts)vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),ctx,{filename:name});
function run(s){return vm.runInContext(s,ctx)}



run("openWorkspaceEvent({dataset:{eventBrand:'lumiere',openEvent:'루미에르 성수 팝업 룰렛'}});go('report')");
let html=run('report()');
assert.doesNotMatch(html,/리포트 구성|data-metric=|include-ai-summary|<h2>성과 리포트 작성/);
assert.match(html,/고객 공유 설정/);assert.match(html,/<details class="report-preview-disclosure">/);assert(html.indexOf('data-action="share-report"')>html.indexOf('</details>',html.indexOf('report-preview-disclosure')));assert.match(html,/고객 공유 미리보기/);
assert.equal((html.match(/data-action="edit-summary"/g)||[]).length,1);
assert(html.indexOf('data-action="edit-summary"')<html.indexOf('고객 공유 설정'));
assert.match(run('state.reportText'),/12,400.*5,950/);assert.match(run('state.reportText'),/38.0%/);
const disclosure={open:true};elements.app.querySelector=q=>q==='.report-preview-disclosure'?disclosure:null;
run('bind()');disclosure.ontoggle();assert.match(run('report()'),/<details class="report-preview-disclosure" open>/);
disclosure.open=false;disclosure.ontoggle();assert.match(run('report()'),/<details class="report-preview-disclosure">/);
elements.app.querySelector=()=>null;
const saved=run('state.reportText');
run("action('edit-summary')");elements['report-text']={value:'고객에게 공유할 확정 분석',focus(){}};
const preview={textContent:''};elements.app.querySelector=q=>q==='[data-shared-summary]'?preview:null;
run('bind()');elements['report-text'].oninput();assert.equal(preview.textContent,'고객에게 공유할 확정 분석');assert.equal(run('state.reportText'),saved);
run("action('cancel-summary')");assert.equal(run('state.reportText'),saved);
run("action('edit-summary');bind()");elements['report-text'].oninput();run("action('confirm-report')");
html=run('report()');assert(run('state.confirmedReport'));
const previewBody=html.split('<div class="shared-performance-content">')[1].split('</div></section></details>')[0];
const sharedBody=run('brandReport()').split('<div class="shared-performance-content">')[1].split('</div><div class="export-note">')[0];
assert.equal(previewBody,sharedBody,'Preview and client page use the same data, analysis and confirmed summary');
assert.match(sharedBody,/고객에게 공유할 확정 분석/);assert.match(sharedBody,/데이터 요약/);assert.match(sharedBody,/참여 퍼널/);assert.doesNotMatch(sharedBody,/data-action="edit-summary"|추가 이용료/);
elements['report-timing']={value:'즉시 공개'};run("action('share-report')");assert(run('state.reportPublished'));
run("go('report');action('edit-summary')");assert.doesNotMatch(run('report()'),/id="report-text"|data-action="edit-summary"/);
assert.match(run('operate()'),/발송실패목록을 확인해주세요\./);
console.log('PASS: one editable analysis, simple sharing settings, live draft preview/cancel, preview-client parity and published lock');
