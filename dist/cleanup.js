// Review comments: remove onboarding chrome and tighten the list/card composition.
startGuide=function(){return ''};
const compactHome=home;home=function(){return compactHome().replace('행사 운영, 한눈에.','확인할 작업').replace(/(<div class="desk-heading"><div><h1>[\s\S]*?<\/h1>)<p class="sub">[\s\S]*?<\/p>/,'$1')};
const compactBranding=whitelabel;whitelabel=function(){return compactBranding().replace('공유 화면에 우리 브랜드를 담으세요.','브랜딩 설정')};
const compactScope=shell;shell=function(body){return compactScope(body).replaceAll('브랜드 워크스페이스','워크스페이스')};
const compactEventTable=eventTable;eventTable=function(){return compactEventTable().replace('<table>','<table class="event-table">').replace('<th></th>','').replace(/<td class="row-arrow">[\s\S]*?<\/td>/g,'')};
const compactWorkspace=workspace;workspace=function(){return compactWorkspace().replaceAll('브랜드 워크스페이스','워크스페이스')};
screens.find(s=>s[0]==='workspace')[2]='워크스페이스';
render();
