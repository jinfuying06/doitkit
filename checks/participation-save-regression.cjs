const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};const empty=()=>({innerHTML:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},querySelectorAll(){return []},querySelector(){return null},insertAdjacentHTML(pos,html){this.innerHTML+=html},addEventListener(){},focus(){},setAttribute(){}});
elements.app=empty();elements.toast=empty();const listeners=[];const doc={body:empty(),title:'',activeElement:empty(),getElementById:id=>elements[id]||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn,capture){listeners.push({type,fn,capture})},createElement:()=>({...empty(),content:empty()})};
const loc={_hash:'',search:'',origin:'https://example.chatgpt.site',pathname:'/',get hash(){return this._hash},set hash(v){this._hash=v.startsWith('#')?v:'#'+v}};
const ctx=vm.createContext({document:doc,location:loc,URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},print(){}},setTimeout:()=>0,clearTimeout(){},navigator:{clipboard:{writeText(){}}},console,Blob,URL});
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);for(const name of scripts)vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),ctx,{filename:name});
function run(s){return vm.runInContext(s,ctx)}



run("openWorkspaceEvent({dataset:{eventBrand:'lumiere',openEvent:'루미에르 성수 팝업 룰렛'}})");
assert.doesNotMatch(run('operate()'),/패스 이용 현황|기본 포함량 초과/);
assert.match(run('operate()'),/<strong class="point-label">경품 발송 실패 5건<\/strong>/);
run("state.settings.failedCount=0;state.settings.failureIds=[];state.retried=true");
assert.doesNotMatch(run('operate()'),/패스 이용 현황|기본 포함량 초과|경품 발송 실패 0건/);
run("state.published=false;state.approved=false;state.consent=false;state.settings.designSaved=false;go('editor')");
assert.doesNotMatch(run('editorForm()'),/consent-check|setup-confirm/);
elements['consent-text']={value:''};run("action('save')");
assert(!run('state.consent'));assert.match(elements.toast.textContent,/동의 문구를 입력/);assert.equal(run('route()'),'editor');
elements['consent-text'].value='이벤트 참여를 위한 개인정보 수집 동의';run("action('save')");
assert(run('state.consent'));assert.equal(run('route()'),'editor');
run("action('to-review')");assert.equal(run('route()'),'review');
console.log('PASS: conditional pass notice, whole failure label accent, checkbox removal, saved participation completion and blank consent guard');
