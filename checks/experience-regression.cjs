const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};const empty=()=>({innerHTML:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},querySelectorAll(){return []},querySelector(){return null},insertAdjacentHTML(pos,html){this.innerHTML+=html},addEventListener(){},focus(){},setAttribute(){}});
elements.app=empty();elements.toast=empty();const listeners=[];const doc={body:empty(),title:'',activeElement:empty(),getElementById:id=>elements[id]||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn,capture){listeners.push({type,fn,capture})},createElement:()=>({...empty(),content:empty()})};
const loc={_hash:'',search:'',origin:'https://example.chatgpt.site',pathname:'/',get hash(){return this._hash},set hash(v){this._hash=v.startsWith('#')?v:'#'+v}};
const ctx=vm.createContext({document:doc,location:loc,URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},print(){}},setTimeout:()=>0,clearTimeout(){},navigator:{clipboard:{writeText(){}}},console,Blob,URL});
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);for(const name of scripts)vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),ctx,{filename:name});
function run(s){return vm.runInContext(s,ctx)}



run("openWorkspaceEvent({dataset:{eventBrand:'lumiere',openEvent:'루미에르 성수 팝업 룰렛'}});go('editor');state.published=false;state.approved=false;state.consent=false;state.settings.designSaved=false;delete state.settings.savedEditorSignature");
run("action('to-review')");assert.match(elements.toast.textContent,/게임을 저장/);assert.equal(run('state.editorTab'),'디자인');
run("state.settings.designSaved=true;action('to-review')");assert.match(elements.toast.textContent,/참여 정보 설정을 저장/);assert.equal(run('state.editorTab'),'수집·동의');assert.doesNotMatch(run('editorForm()'),/consent-check|setup-confirm/);
run("state.gameDraftMode=true;state.editorTab='디자인'");assert.equal(run('editorSections()'),'');assert.doesNotMatch(run("steps('editor')"),/class="demo-badge">게임 초안/);
run("state.gameDraftMode=false;state.selectedTemplate='lumiere-wheel';state.layerId='game';state.editorTab='디자인'");assert.match(run('gameSketch(currentTemplate())'),/data-wheel-sector="0"/);assert.match(run('properties()'),/data-wheel-choice="0"/);assert.doesNotMatch(run('properties()'),/wheel-choice-row/);
run("state.wheelChoiceIndex=2");assert.match(run('properties()'),/data-wheel-choice="2"/);
for(const [id,names] of [['lumiere',['박지은','김민서']],['novahome',['이현준','정수진']],['greenday',['최하나','윤서연']]]){run(`state.brandId='${id}';state.wsTab='멤버'`);for(const name of names)assert(run('brandDetail()').includes(name));assert.equal(run('demoReviewOpinions()[0].author'),names[0])}
run("state.brandId='lumiere';state.basic={start:'2026-10-16',end:'2026-10-16',startTime:'10:00',endTime:'16:00'};state.published=true;state.ended=false;go('operate')");
const end=run('eventEndAt(state.basic)');ctx.checkNow=end-1;assert(run('endPrompt(checkNow).early'));ctx.checkNow=end;assert(!run('endPrompt(checkNow).early'));assert(!run('endPrompt(checkNow).automatic'));ctx.checkNow=end+3600000;assert(run('endPrompt(checkNow).automatic'));
run("action('end')");assert(!run('state.ended'));assert.match(elements.app.innerHTML,/end-confirmation/);run("action('confirm-event-end')");assert(run('state.ended'));assert.match(run('operate()'),/data-action="pause"[^>]*disabled/);assert.match(run('operate()'),/data-action="end"[^>]*disabled/);run("action('pause')");assert(!run('state.paused'));
run("state.ended=false;state.published=true;retainEvent()");assert(run('applyScheduledChanges(checkNow)'));assert(run('state.ended'));
run("go('report');state.settings.reportTiming='지정 일시'");assert.match(run('report()'),/id="report-publish-at" type="datetime-local" step="60"/);
run("state.aiReport=false;state.settings.reportTiming='지정 일시';go('report')");
elements['report-timing']={value:'지정 일시'};elements['report-publish-at']={value:'2099-10-16T16:45'};
run("action('share-report')");assert(run('state.settings.reportScheduledAt'));assert(!run('state.reportPublished'));ctx.scheduledAt=run('state.settings.reportScheduledAt');assert(run('applyScheduledChanges(scheduledAt)'));assert(run('state.reportPublished'));
run("beginEvent('lumiere')");assert.match(run('basicInfo()'),/id="event-end-time" type="time" step="60" required/);
console.log('PASS: distinct review guards, required confirmation, design-only draft, direct wheel sectors, brand authors, minute times, end confirmation/lock, automatic boundary, scheduled report picker');
