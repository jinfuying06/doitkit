const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};const empty=()=>({innerHTML:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},querySelectorAll(){return []},querySelector(){return null},insertAdjacentHTML(pos,html){this.innerHTML+=html},addEventListener(){},focus(){},setAttribute(){}});
elements.app=empty();elements.toast=empty();const listeners=[];const doc={body:empty(),title:'',activeElement:empty(),getElementById:id=>elements[id]||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn,capture){listeners.push({type,fn,capture})},createElement:()=>({...empty(),content:empty()})};
const loc={_hash:'',search:'',origin:'https://example.chatgpt.site',pathname:'/',get hash(){return this._hash},set hash(v){this._hash=v.startsWith('#')?v:'#'+v}};
const ctx=vm.createContext({document:doc,location:loc,URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},print(){}},setTimeout:()=>0,clearTimeout(){},navigator:{clipboard:{writeText(){}}},console,Blob,URL});
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);for(const name of scripts)vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),ctx,{filename:name});
function run(s){return vm.runInContext(s,ctx)}



const menu={dataset:{},onclick:null},bottom={dataset:{},onclick:null},picker={dataset:{},onclick:null};
elements.app.querySelectorAll=q=>q==='.sidebar a[href="#templates"]'||q==='.sidebar nav a,.logo'?[menu]:q==='.studio-bottom a[href="#templates"]'?[bottom]:q==='a[href="#templates"]'?[menu,bottom]:q==='[data-pick-template]'?[picker]:[];
run("openWorkspaceEvent({dataset:{eventBrand:'novahome',openEvent:'노바홈 가전박람회 스크래치'}});go('editor');state.creationFlow=true;bind()");
menu.onclick({preventDefault(){}});
assert.equal(run('route()'),'templates');assert.equal(run('state.eventName'),'');assert(!run('state.creationFlow'));assert.doesNotMatch(run('templates()'),/class="creation-steps"|class="template-picker"/);
run("openWorkspaceEvent({dataset:{eventBrand:'novahome',openEvent:'노바홈 가전박람회 스크래치'}});go('editor');bind()");
bottom.onclick({preventDefault(){}});assert.equal(run('route()'),'editor');assert.match(elements.app.innerHTML,/class="modal template-picker"/);
assert.match(run('home()'),/진행 중·예정 행사/);assert.match(run('workspace()'),/전체 행사/);assert.match(run('brandReview()'),/게임 확정/);assert.doesNotMatch(run('brandReview()'),/브랜드 게임 확정|브랜디드 게임 확정/);
console.log('PASS: independent template menu, local template picker, campaign naming');
