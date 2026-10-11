const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};const empty=()=>({innerHTML:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},querySelectorAll(){return []},querySelector(){return null},insertAdjacentHTML(pos,html){this.innerHTML+=html},addEventListener(){},focus(){},setAttribute(){}});
elements.app=empty();elements.toast=empty();const listeners=[];const doc={body:empty(),title:'',activeElement:empty(),getElementById:id=>elements[id]||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn,capture){listeners.push({type,fn,capture})},createElement:()=>({...empty(),content:empty()})};
const loc={_hash:'',search:'',origin:'https://example.chatgpt.site',pathname:'/',get hash(){return this._hash},set hash(v){this._hash=v.startsWith('#')?v:'#'+v}};
const ctx=vm.createContext({document:doc,location:loc,URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},print(){}},setTimeout:()=>0,clearTimeout(){},navigator:{clipboard:{writeText(){}}},console,Blob,URL});
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);for(const name of scripts)vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),ctx,{filename:name});
function run(s){return vm.runInContext(s,ctx)}



run("openWorkspaceEvent({dataset:{eventBrand:'lumiere',openEvent:'루미에르 성수 팝업 룰렛'}});state.published=false;state.paid=false;go('checkout')");
assert.match(run('checkout()'),/data-action="pay">행사 패스 활성화/);assert.doesNotMatch(run('checkout()'),/시연 결제 ·/);
run("go('brand-review')");assert.equal(run('route()'),'brand-review');
assert.match(run('brandReview()'),/data-page-back>결제 화면으로 돌아가기/);
run('navigateBack()');assert.equal(run('route()'),'checkout');
run("go('review');go('brand-review')");assert.match(run('brandReview()'),/href="#review" class="btn secondary">검토 화면으로/);
run('navigateBack()');assert.equal(run('route()'),'review');
run("go('report');state.aiReport=false");assert.match(run('report()'),/초안 생성/);assert.doesNotMatch(run('report()'),/요약 초안 생성/);
console.log('PASS: checkout preview return context, ordinary review return and button labels');
