const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};const empty=()=>({innerHTML:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},querySelectorAll(){return []},querySelector(){return null},insertAdjacentHTML(pos,html){this.innerHTML+=html},addEventListener(){},focus(){},setAttribute(){}});
elements.app=empty();elements.toast=empty();const listeners=[];const doc={body:empty(),title:'',activeElement:empty(),getElementById:id=>elements[id]||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn,capture){listeners.push({type,fn,capture})},createElement:()=>({...empty(),content:empty()})};
const loc={_hash:'',search:'',origin:'https://example.chatgpt.site',pathname:'/',get hash(){return this._hash},set hash(v){this._hash=v.startsWith('#')?v:'#'+v}};
const ctx=vm.createContext({document:doc,location:loc,URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},print(){}},setTimeout:()=>0,clearTimeout(){},navigator:{clipboard:{writeText(){}}},console,Blob,URL});
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);for(const name of scripts)vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),ctx,{filename:name});
function run(s){return vm.runInContext(s,ctx)}



run("openWorkspaceEvent({dataset:{eventBrand:'lumiere',openEvent:'루미에르 성수 팝업 룰렛'}});state.published=false;state.approved=false;state.consent=false;state.settings.designSaved=false;state.settings.reviewRequested=false;delete state.settings.reviewComments;go('editor')");
run("action('to-review')");assert.equal(run('route()'),'editor');
run("go('brand-review');render()");assert.equal(run('route()'),'editor');
assert.doesNotMatch(run('editorForm()'),/consent-check|setup-confirm/);
run("action('save')");assert(run('state.consent'));assert.equal(run('route()'),'editor');assert.equal(run('deriveEventFlow(captureEvent()).entry'),'editor');
run("state.consent=false;state.settings.consentText='수정된 동의 문구';action('to-review')");assert.equal(run('route()'),'editor');assert.match(elements.toast.textContent,/저장/);
run("action('save');action('to-review')");assert.equal(run('route()'),'review');assert.equal(run('deriveEventFlow(captureEvent()).entry'),'review');
assert.equal(run('state.settings.reviewComments.length'),2);assert.match(run('review()'),/참여 버튼 문구/);assert.match(run('brandReview()'),/현장 경품 수령 위치/);
run("action('approve')");assert(run('approvalCurrent()'));assert(run("state.settings.reviewComments.every(c=>c.status==='검토 완료')"));assert.equal(run('state.settings.openComments'),0);assert.doesNotMatch(run('reviewOpinions()'),/확인 중|data-review-opinion=/);assert.match(run('review()'),/href="#brand-review">고객 검토 화면 열기/);
run("state.approved=false;state.published=false;state.gameDraft=null;go('editor');state.layerId='game'");assert.doesNotMatch(run('properties()'),/id="wheel-labels"/);assert.match(run('properties()'),/data-wheel-choice="0"/);
const quantity=run('rewards()[0].quantity'),probability=run('rewards()[0].probability');
const choice={dataset:{wheelChoice:'0'},value:'새로운 경품 이름'};elements.app.querySelectorAll=q=>q==='[data-wheel-choice]'?[choice]:[];
run('bind()');choice.onchange();assert.equal(run('rewards()[0].name'),'새로운 경품 이름');assert.equal(run('rewards()[0].quantity'),quantity);assert.equal(run('rewards()[0].probability'),probability);
console.log('PASS: save/request separation, consent gate, direct-link gate, example opinions, approved review link, prize-preserving wheel edits');
