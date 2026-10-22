// Billing stays internal; client reports receive performance metrics only.
function trafficNumber(value){return Number(value).toLocaleString('ko-KR')}
function nextBillingDate(){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit'}).formatToParts(new Date()),y=+p.find(v=>v.type==='year').value,m=+p.find(v=>v.type==='month').value;return `${m===12?y+1:y}-${String(m===12?1:m+1).padStart(2,'0')}-10`}
function billingUsage(record=state){
 const b=record.settings.billing||{},d=isGangnamDemo(record)?(record.settings.demoTraffic||{participations:21000,included:20000,unitPrice:5,cardLast4:'1234'}):null;
 const included=Number(b.included??d?.included??20000),unitPrice=Number(b.unitPrice??d?.unitPrice??5);
 const participations=Number((record.ended?b.finalParticipation:undefined)??b.participations??(record.published?(d?.participations??3412):0)),excess=Math.max(0,participations-included);
 return {participations,included,unitPrice,excess,amount:excess*unitPrice,cardLast4:b.cardLast4||d?.cardLast4||'1234',billingDate:b.billingDate||d?.billingDate||nextBillingDate(),status:b.status||'결제 예정',paidAt:b.paidAt||''};
}
function freezeBilling(record=state){const t=billingUsage({...record,ended:false});record.settings.billing={included:t.included,unitPrice:t.unitPrice,cardLast4:t.cardLast4,billingDate:t.billingDate,status:t.status,...record.settings.billing,finalParticipation:t.participations}}
function billingDateLabel(value=billingUsage().billingDate){return `${Number(value.slice(0,4))}년 ${Number(value.slice(5,7))}월 ${Number(value.slice(8,10))}일`}
function demoTrafficDisplay(html){
 if(!state.published)return html;
 const t=billingUsage(),failed=currentFailedSends(),success=854-failed,rate=success===854?'100%':(success/854*100).toFixed(1)+'%';
 return html.replaceAll('3,412',trafficNumber(t.participations)).replaceAll('99.4%',rate).replaceAll('849 / 854',success+' / 854');
}
function demoSettlementBox(){
 const t=billingUsage();if(!state.ended||t.amount<=0)return '';
 return `<section class="panel internal-billing settlement-summary"><div><strong class="point-label">추가 이용료 정산 안내</strong><p>${t.excess?`기본 포함량을 초과한 ${trafficNumber(t.excess)}회에 대한 추가 이용료는 <strong>${trafficNumber(t.amount)}원</strong>입니다.`:'기본 포함량 이내로 운영되어 추가 이용료는 0원입니다.'}</p><p class="small dim">${t.amount?(t.status==='결제 완료'?'등록 카드로 결제가 완료되었습니다.':`${billingDateLabel()} 월 정산 시 등록 카드로 결제됩니다.`):'발송 수수료는 별도 내역에서 확인할 수 있습니다.'}</p><p class="mini-label">이 정산 정보는 고객 공유 리포트에 포함되지 않습니다.</p></div><button class="btn secondary" data-action="settlement-details">정산 내역 보기</button></section>`;
}
const overageOperate=operate;operate=function(){
 let h=demoTrafficDisplay(overageOperate());const t=billingUsage(),count=currentFailedSends();
 const items=[];
 if(t.excess>0)items.push(`<div class="operation-notice-item"><strong class="point-label">기본 포함량 초과 (${trafficNumber(t.participations)}/${trafficNumber(t.included)}회)</strong><p>초과 ${trafficNumber(t.excess)}회 · 현재 추가 이용료 <strong>${trafficNumber(t.amount)}원</strong><br>1회당 ${t.unitPrice}원 · 월 정산 시 결제</p></div>`);
 if(count>0)items.push(`<div class="operation-notice-item"><strong class="point-label">경품 발송 실패 ${count}건</strong><p>발송실패목록을 확인해주세요.</p></div>`);
 const notice=`<section class="panel review-confirmation operation-notices internal-billing" aria-label="운영 확인 사항"><div class="operation-notice-list">${items.join('')}</div></section>`;
 return h.replace(/<section class="panel review-confirmation operation-notices">[\s\S]*?<\/section>/,t.excess>0||count>0?notice:'');
};
const overageReport=report;report=function(){
 let h=demoTrafficDisplay(overageReport());
 if(state.ended){h=h.replace(statusNotice('최종 리포트','행사가 종료되어 최종 집계 결과를 표시합니다.'),statusNotice('행사 종료','행사가 종료되었습니다. 최종 집계 결과를 확인할 수 있습니다.'));h=h.replace('<section class="panel data-summary">',demoSettlementBox()+'<section class="panel data-summary">')}
 return h;
};
const overageBrandReport=brandReport;brandReport=function(){return demoTrafficDisplay(overageBrandReport())};
const overageCheckout=checkout;checkout=function(){
 const t=billingUsage();let h=overageCheckout();
 const terms=`<div class="internal-billing pass-overage-terms"><h3>패스 이용 조건</h3><p>기본 포함량 <strong>${trafficNumber(t.included)}회</strong> · 초과 단가 <strong>1회당 ${t.unitPrice}원</strong></p><p class="small dim">초과 이용료는 월 정산 시 등록 카드로 결제됩니다. 발송 수수료는 별도입니다.</p></div>`;
 if(state.published)return shell(`${title('','행사 패스·결제',esc(state.eventName),'')}<section class="panel"><h2>행사 패스가 활성화되었습니다.</h2>${terms}<a class="btn secondary" href="#operate">운영 화면으로</a></section>`);
 return h.replace('<h2>비용 미리 확인</h2>','<h2>비용 미리 확인</h2>'+terms).replace('구간·단가 확정 예정',`1회당 ${t.unitPrice}원`).replace('예상 참여량을 초과해도 운영은 지속됩니다.<br>초과분은 안내된 구간·단가에 따라 행사 종료 후 정산합니다.',`패스 기본 포함량 ${trafficNumber(t.included)}회를 초과해도 운영은 지속됩니다.<br>초과 이용료는 1회당 ${t.unitPrice}원이며 월 정산 시 등록 카드로 결제됩니다.`);
};
function settlement(){
 const t=billingUsage();
 if(t.amount<=0){location.hash='#report';return report()}
 if(!state.ended)return shell(`${title('', '정산 내역', '', '')}<section class="panel"><p>행사 종료 후 정산 내역을 확인할 수 있습니다.</p><a class="btn secondary mt" href="#operate">운영 화면으로</a></section>`);
 return shell(`${title('', '정산 내역', settlementContext(), '')}<section class="panel internal-billing settlement-page"><div class="panel-head"><h2>추가 이용료 정산 내역</h2><strong class="point-label">${t.status}</strong></div><p>행사가 종료되었습니다.</p><p class="sub mt">총 참여 ${trafficNumber(t.participations)}회 중 기본 패스 포함량 ${trafficNumber(t.included)}회${t.excess?`를 초과한 ${trafficNumber(t.excess)}회에 대해 추가 이용료 ${trafficNumber(t.amount)}원이 발생했습니다.`:' 이내로 운영되어 추가 이용료는 0원입니다.'}</p><dl class="settlement-details"><div><dt>초과 이용료</dt><dd>${trafficNumber(t.excess)}회 × ${t.unitPrice}원 = ${trafficNumber(t.amount)}원</dd></div><div><dt>초과 단가</dt><dd>1회당 ${t.unitPrice}원</dd></div><div><dt>${t.status==='결제 완료'?'결제일':'결제 예정일'}</dt><dd>${t.amount?billingDateLabel(t.status==='결제 완료'&&t.paidAt?t.paidAt:t.billingDate):'해당 없음'}</dd></div><div><dt>결제 수단</dt><dd>${t.amount?'등록 카드 끝자리 '+esc(t.cardLast4):'해당 없음'}</dd></div><div><dt>결제 상태</dt><dd>${t.status}</dd></div></dl><p class="small dim">${t.status==='결제 완료'?'추가 이용료 결제가 완료되었습니다.':'추가 이용료는 월 정산 시 결제됩니다.'} 발송 수수료는 별도 내역에서 확인할 수 있습니다.</p><p class="mini-label mt">이 정산 정보는 고객 공유 리포트에 포함되지 않습니다.</p><a class="btn secondary mt" href="#report">성과 화면으로</a></section>`);
}
function settlementContext(){const b=state.basic,start=b.start?b.start+' '+(b.startTime||'10:00'):'기간 미설정',end=b.end?b.end+' '+(b.endTime||'16:00'):'';return esc(currentBrand().name+' · '+state.eventName+' · '+start+(end?' — '+end:''))}
function openDemoSettlement(){if(!state.ended||billingUsage().amount<=0)return;retainEvent();go('settlement')}
screens.push(['settlement','C-SETTLEMENT','정산 내역']);pageTitles.settlement='정산 내역';
const billingRetain=retainEvent;retainEvent=function(){
 if(state.eventName&&!state.gameDraftMode&&(state.paid||state.published||state.ended)){
  if(!state.settings.billing){const t=billingUsage();state.settings.billing={included:t.included,unitPrice:t.unitPrice,cardLast4:t.cardLast4,billingDate:t.billingDate,status:'결제 예정'}}
  if(state.ended&&state.settings.billing.finalParticipation===undefined)state.settings.billing.finalParticipation=billingUsage().participations;
 }
 return billingRetain();
};
const overageAction=action;action=function(a,n){
 if(a==='confirm-event-end'&&!state.ended)freezeBilling();
 if(a==='demo-settlement'||a==='settlement-details'){openDemoSettlement();return}
 if(a==='ai-report'&&isGangnamDemo(state)&&!reportLocked()){
  const t=billingUsage(),failed=currentFailedSends();state.aiReport=true;state.confirmedReport=false;
  state.reportText=`총 ${trafficNumber(t.participations)}회의 게임 참여와 2,980명의 순참여자를 기록했습니다. 경품 당첨은 860건이며, 모바일 경품 발송 대상 854건 중 ${854-failed}건을 발송했습니다.${failed?' 실패 '+failed+'건은 재발송 확인이 필요합니다.':''} 현장 경품 당첨자 6명은 모두 수령을 완료했습니다.`;
  retainEvent();render();toast('집계 기반 AI 요약 초안을 생성했습니다.');return;
 }
 if(a==='csv'&&isGangnamDemo(state)){
  const failed=currentFailedSends();download('gangnam-report.csv','\ufeff지표,값\n참여 수,'+billingUsage().participations+'\n순참여자,2980\n당첨 수,860\n모바일 발송 대상,854\n발송 성공,'+(854-failed)+'\n발송 실패,'+failed+'\n','text/csv');return;
 }
 return overageAction(a,n);
};
render();
