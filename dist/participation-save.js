// Saving records participation setup; a second confirmation checkbox is unnecessary.
const participationSaveAction=action;action=function(a,n){
 if(a==='save'&&!state.gameDraftMode&&!gameLocked()&&['editor','prizes'].includes(route())&&state.selectedTemplate){
  if(state.prizeError)return participationSaveAction(a,n);
  const input=document.getElementById('consent-text');
  const text=(input?input.value:state.settings.consentText??'이벤트 참여 및 경품 지급을 위해 이름과 휴대전화 번호를 수집합니다. 수집 목적과 보유 기간을 행사에 맞게 입력하세요.').trim();
  if((state.settings.collectName!==false||state.settings.collectPhone!==false)&&!text){state.editorTab='수집·동의';go('editor');return toast('참여자에게 표시할 동의 문구를 입력해주세요.')}
  state.settings.consentText=text;
  state.consent=true;
 }
 return participationSaveAction(a,n);
};
render();
