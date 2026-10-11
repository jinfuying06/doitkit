const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};const empty=()=>({innerHTML:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},querySelectorAll(){return []},querySelector(){return null},insertAdjacentHTML(pos,html){this.innerHTML+=html},addEventListener(){},focus(){},setAttribute(){}});
elements.app=empty();elements.toast=empty();const listeners=[];const doc={body:empty(),title:'',activeElement:empty(),getElementById:id=>elements[id]||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn,capture){listeners.push({type,fn,capture})},createElement:()=>({...empty(),content:empty()})};
const loc={_hash:'',search:'',origin:'https://example.chatgpt.site',pathname:'/',get hash(){return this._hash},set hash(v){this._hash=v.startsWith('#')?v:'#'+v}};
const ctx=vm.createContext({document:doc,location:loc,URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},print(){}},setTimeout:()=>0,clearTimeout(){},navigator:{clipboard:{writeText(){}}},console,Blob,URL});
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);for(const name of scripts)vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),ctx,{filename:name});
function run(s){return vm.runInContext(s,ctx)}



run("openWorkspaceEvent({dataset:{eventBrand:'lumiere',openEvent:'루미에르 성수 팝업 룰렛'}});go('editor')");
assert.doesNotMatch(run('editor()'),/템플릿 변경|data-action="to-review"|data-action="save"/);
const originalLayers=run('JSON.stringify(state.layers)');run("changeLayer('text','운영 중 수정')");assert.equal(run('JSON.stringify(state.layers)'),originalLayers);
const originalSending=run('JSON.stringify(sendingRows())');
const quantity=run('rewards()[0].quantity');assert(run('addPrizeStock(0,5)'));assert.equal(run('rewards()[0].quantity'),quantity+5);assert(run('approvalCurrent()'));assert.equal(run('JSON.stringify(sendingRows())'),originalSending);
run("action('pause');startPrizeRevision()");assert.equal(run('route()'),'prizes');assert(run('prizeRevisionEditing()'));assert.match(run('editor(true)'),/변경 검토 요청/);
run("rewards()[0].name='새 경품';rewards()[0].probability=1;invalidateApproval();retainEvent();action('pause')");assert(run('state.paused'),'Cannot resume an unapproved revision');
run("action('to-review')");assert.equal(run('route()'),'review');run("action('approve')");assert(run('approvalCurrent()'));assert.match(run('review()'),/변경 적용 후 재개/);
run("action('pause')");assert(!run('state.paused'));assert(!run('state.settings.operationBaseline'));assert.equal(run('rewards()[0].name'),'새 경품');assert.equal(run('operationHistory().length'),2);assert.equal(run('JSON.stringify(sendingRows())'),originalSending);
run("action('pause');startPrizeRevision();rewards()[0].name='취소할 수정';invalidateApproval();cancelPrizeRevision()");assert.equal(run('rewards()[0].name'),'새 경품');assert(run('approvalCurrent()'));assert(run('state.paused'));assert.equal(run('operationHistory().length'),2);
assert.match(run("mobile('start')"),/잠시 참여를 중단했습니다/);
run("action('pause');action('end');action('confirm-event-end')");assert.doesNotMatch(run('operate()'),/data-operation="stock"|data-operation="revise"/);
console.log('PASS: published read-only, stock addition, paused revision, approval gate, apply/cancel, previous sending records');
