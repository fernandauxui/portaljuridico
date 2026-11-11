/* ---------- interações ---------- */
function menuPop(a,items){ const s=openPop(a,items.map(([k,l,cls])=>`<button type="button" class="mi ${cls||''}" data-mi="${k}">${l}</button>`).join(''),{align:'right',width:220}); return s; }
function bolFilter(a,f){
  const u=unitById(D.r.n==='processo'?UNITS[0].id:D.r.p.id), F=D.bf, done=()=>{D.bsel.clear();render(true);};
  if(f==='b-status') checkPop(a,{title:'Status',opts:STATUS.map(s=>[s[0],s[0]]),cur:F.status,onApply:d=>{F.status=d;done();}});
  if(f==='b-tipo') checkPop(a,{title:'Tipo',opts:TIPOS.map(t=>[t,t]),cur:F.tipos,onApply:d=>{F.tipos=d;done();}});
  if(f==='b-proc'){const ps=u.id===2740?[P1,P2]:u.procs; checkPop(a,{title:'Processo',width:340,opts:[['__sem','Sem processo']].concat(ps.map(p=>[p,`<span style="font-variant-numeric:tabular-nums">${p}</span>`])),cur:F.procs,onApply:d=>{F.procs=d;done();}});}
  if(f==='b-dias') rangePop(a,{title:'Dias em atraso',presets:[30,60,90,180],unit:['dia','dias'],hint:'Em dias de atraso.',cur:F.dias,onApply:d=>{F.dias=d;done();}});
}
function repUnitsPop(a){
  const c=condoById(D.rep.id); let d=D.rep.units.slice();
  const s=openPop(a,`<div class="pb" id="ru" style="gap:4px;padding-top:12px"></div>${popFoot()}`,{width:320,align:'right'}); if(!s) return;
  const sync=()=>{const all=d.length===c.units.length;$('#ru',s).innerHTML=`<button type="button" class="opt" data-v="__all" role="checkbox" aria-checked="${all}"><span class="d-cb ${all?'on':''}">${all?X('check',12,3):''}</span>Selecionar todos</button>`+c.units.map(u=>{const on=d.includes(u.id);return `<button type="button" class="opt" data-v="${u.id}" role="checkbox" aria-checked="${on}"><span class="d-cb ${on?'on':''}">${on?X('check',12,3):''}</span>${u.bloco} - ${u.un} | ${u.ind}</button>`;}).join('');};
  s.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return; if(b.dataset.v==='__all'){d=d.length===c.units.length?[]:c.units.map(u=>u.id);sync();} else if(b.dataset.v){const v=+b.dataset.v;d=d.includes(v)?d.filter(x=>x!==v):d.concat(v);sync();}
    if(b.dataset.p==='clear'){d=[];sync();} if(b.dataset.p==='apply'){D.rep.units=d;D.rep.gerado=false;closePop();render(true);}});
  sync();
}
function refreshBtn(btn,label,part){
  btn.classList.add('busy');btn.disabled=true;btn.setAttribute('aria-busy','true');
  const list=$(`[data-part="${part}"]`,root); if(list) list.classList.add('busy-list');
  setTimeout(()=>{ if(part==='btbl'){D.busy=false;upd('btbl');upd('bacts');} else {btn.classList.remove('busy');btn.disabled=false;btn.removeAttribute('aria-busy');if(list)list.classList.remove('busy-list');}
    const d=new Date(),hh=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); toast(`${label} às ${hh}.`); },900);
}
document.addEventListener('click',e=>{
  if(SHELL.mode!=='desktop') return;
  const mi=e.target.closest('[data-mi]'); if(mi){ const k=mi.dataset.mi; closePop(); return menuAct(k); }
  const a=e.target.closest('[data-d]'); if(!a) return;
  const act=a.dataset.d, id=a.dataset.id;
  if(act==='ovl'){ if(e.target===a) closeModal(); return; }
  switch(act){
    case 'go': { const to=a.dataset.to; if(to==='unidade') nav('unidade',{id:+id||D.r.p.id,tab:'boletos'}); else nav(to,id?{id:+id}:{}); break; }
    case 'pjump': closePop(); if(a.dataset.to==='unidade'){resetUnitState();nav('unidade',{id:2740,tab:'boletos'});} else nav(a.dataset.to); break;
    case 'side': D.side=!D.side; render(true); break;
    case 'acct': menuPop(a,[['perfil','Meu perfil'],['suporte','Suporte'],['sair','Sair do Portal','danger']]); break;
    case 'proto': protoPanel(a); break;
    case 'note': noteFor(a.dataset.k,a); e.stopPropagation(); break;
    case 'close': closeModal(); break;
    case 'eye': { const i=a.parentElement.querySelector('input'); const show=i.type==='password'; i.type=show?'text':'password'; a.innerHTML=X(show?'eye':'eyeoff',16); a.setAttribute('aria-label',show?'Ocultar senha':'Mostrar senha'); break; }
    case 'resend': toast('Enviamos um novo código para o seu e-mail (simulação).'); break;
    case 'flt': { const f=a.dataset.f; if(f.startsWith('u-')||f.startsWith('cu-')) openUnitFilter(a,f);
      else if(f==='c-valor') moneyPop(a,{title:'Valor da ação',cur:D.cf.valor,onApply:d=>{D.cf.valor=d;D.csel.clear();render(true);}});
      else if(f==='c-proc') checkPop(a,{title:'Processo',opts:[['sem','Sem processo'],['com','Com processo']],cur:D.cf.proc,onApply:d=>{D.cf.proc=d;D.csel.clear();render(true);}});
      else bolFilter(a,f); break; }
    case 'uclear': { if(a.dataset.s==='u'){D.uf=emptyUF();D.uq='';D.usel.clear();} else {D.cuf=emptyUF();D.cuq='';D.cusel.clear();} render(true); break; }
    case 'usel': { const s=a.dataset.s==='u'?D.usel:D.cusel, i=+id; s.has(i)?s.delete(i):s.add(i); a.dataset.s==='u'?(upd('utbl'),upd('ubtn')):(upd('cutbl'),upd('cubtn')); break; }
    case 'uall': { const sc=a.dataset.s, s=sc==='u'?D.usel:D.cusel, base=sc==='u'?UNITS:condoById(D.r.p.id).units, ids=unitsList(base,sc==='u'?D.uf:D.cuf,sc==='u'?D.uq:D.cuq).map(u=>u.id), all=ids.every(i=>s.has(i)); ids.forEach(i=>all?s.delete(i):s.add(i)); sc==='u'?(upd('utbl'),upd('ubtn')):(upd('cutbl'),upd('cubtn')); break; }
    case 'usort': { const k=a.dataset.k; D.usort=D.usort.k===k?{k,dir:-D.usort.dir}:{k,dir:k==='condo'?1:-1}; upd(D.r.n==='unidades'?'utbl':'cutbl'); break; }
    case 'openunit': resetUnitState(); nav('unidade',{id:+id,tab:'boletos'}); break;
    case 'uplan': planilhaModal('u',D.usel.size,UNITS.length,()=>{D.usel.clear();upd('utbl');upd('ubtn');}); break;
    case 'cuplan': planilhaModal('u',D.cusel.size,condoById(D.r.p.id).units.length,()=>{D.cusel.clear();upd('cutbl');upd('cubtn');}); break;
    case 'cplan': planilhaModal('c',D.csel.size,CONDOS.length,()=>{D.csel.clear();upd('ctbl');upd('cbtn');}); break;
    case 'csel': { const i=+id; D.csel.has(i)?D.csel.delete(i):D.csel.add(i); upd('ctbl'); upd('cbtn'); break; }
    case 'call': { const ids=condosList().map(c=>c.id), all=ids.every(i=>D.csel.has(i)); ids.forEach(i=>all?D.csel.delete(i):D.csel.add(i)); upd('ctbl'); upd('cbtn'); break; }
    case 'csort': { const k=a.dataset.k; D.csort=D.csort.k===k?{k,dir:-D.csort.dir}:{k,dir:k==='name'?1:-1}; upd('ctbl'); break; }
    case 'cclear': D.cq='';D.cf={valor:{min:null,max:null},proc:[]};D.csel.clear(); render(true); break;
    case 'opencondo': D.cuf=emptyUF();D.cuq='';D.cusel.clear(); nav('condominio',{id:+id}); break;
    case 'cdocs': docsModal(condoById(id)); break;
    case 'utab': D.r.p.tab=a.dataset.tab; closePop(); render(true); break;
    case 'ptab': D.r.p.tab=a.dataset.tab; render(true); break;
    case 'bsel': { const i=+a.dataset.i; D.bsel.has(i)?D.bsel.delete(i):D.bsel.add(i); upd('btbl'); upd('bacts'); break; }
    case 'ball': { const u=unitById(D.r.p.id), ids=bolsOf(u).filter(b=>!b.ced&&bolMatch(b,D.bf,D.bq)).map(b=>b.i), all=ids.every(i=>D.bsel.has(i)); ids.forEach(i=>all?D.bsel.delete(i):D.bsel.add(i)); upd('btbl'); upd('bacts'); break; }
    case 'bclear': D.bf=emptyBF(); D.bq=''; D.bsel.clear(); render(true); break;
    case 'nv': CS=null; nav('novoVencimento',{id:D.r.p.id}); break;
    case 'na': CS=null; nav('novoAcordo',{id:D.r.p.id}); break;
    case 'extrato': extratoDrawer(unitById(D.r.p.id)); break;
    case 'bmore': menuPop(a,[['bdl','Baixar boletos'],['bsend','Enviar boletos']]); break;
    case 'brow': menuPop(a,[['bdl1','Baixar boleto'],['bview','Visualizar boleto'],['bsend1','Enviar boleto']]); break;
    case 'brefresh': D.busy=true; upd('bacts'); refreshBtn($('[data-d=brefresh]',root),'Boletos atualizados','btbl'); break;
    case 'hrefresh': refreshBtn(a,'Histórico atualizado','hlist'); break;
    case 'hopen': histModal(a.dataset.k); break;
    case 'hnew': histNewModal(); break;
    case 'regproc': regProcModal(unitById(D.r.p.id)); break;
    case 'pbol': procBolModal(unitById(D.r.p.id),+a.dataset.i); break;
    case 'dsel': { const i=+a.dataset.i; D.dsel.has(i)?D.dsel.delete(i):D.dsel.add(i); upd('dtbl'); const b=$('[data-part=dbtn]',root); if(b) b.innerHTML=dlBtn(); break; }
    case 'dall': { const q=D.dq.toLowerCase(), ids=DOCS.map((d,i)=>i).filter(i=>!q||DOCS[i].join(' ').toLowerCase().includes(q)), all=ids.every(i=>D.dsel.has(i)); ids.forEach(i=>all?D.dsel.delete(i):D.dsel.add(i)); upd('dtbl'); const b=$('[data-part=dbtn]',root); if(b) b.innerHTML=dlBtn(); break; }
    case 'dlsel': toast(`${plural(D.dsel.size,'documento baixado','documentos baixados')} (simulação).`); D.dsel.clear(); upd('dtbl'); { const b=$('[data-part=dbtn]',root); if(b) b.innerHTML=dlBtn(); } break;
    case 'dl': toast('No protótipo o download não é feito.'); break;
    case 'fcancel': render(true); break;
    case 'fsave': { const f=a.closest('form'); $$('.sf button',f).forEach(b=>b.disabled=true); toast(`Dados de ${a.dataset.t.toLowerCase()} salvos (simulação).`); break; }
    case 'nvgo': D.bsel.clear(); nav('unidade',{id:D.r.p.id,tab:'boletos'}); toast('Novo boleto gerado (simulação). Ele aparece na lista de boletos depois da emissão.'); break;
    case 'nago': toast('Simulação do acordo gerada. A etapa de revisão ainda não foi desenhada.'); break;
    case 'openproc': resetUnitState(); nav('processo',{i:+a.dataset.i,tab:'boletos'}); break;
    case 'aplan': toast(`Planilha gerada com ${plural(ARQ.length,'processo','processos')}.`); break;
    case 'repunits': repUnitsPop(a); break;
    case 'repcols': checkPop(a,{title:'Colunas',opts:COLS.map(c=>[c,c]),cur:D.rep.cols,width:280,onApply:d=>{D.rep.cols=d;D.rep.gerado=false;render(true);}}); break;
    case 'repck': D.rep[a.dataset.k]=!D.rep[a.dataset.k]; if(D.rep.gerado){} render(true); break;
    case 'repclear': D.rep=repDefaults(condoById(D.rep.id)); render(true); break;
    case 'repgo': D.rep.gerado=true; render(true); toast('Filtros aplicados.'); break;
    case 'repdl': toast('Relatório baixado (simulação).'); break;
    case 'faq': { const i=+a.dataset.i; D.faq=D.faq===i?-1:i; render(true); break; }
    case 'canal': toast('No protótipo o contato não é aberto.'); break;
    case 'dologout': closeModal(); SHELL.logged=false; D.login.erro=null; nav('login'); toast('Você saiu do Portal Jurídico.'); break;
  }
});
function menuAct(k){
  if(k==='perfil'||k==='suporte') return nav(k);
  if(k==='sair') return logoutModal();
  if(k==='bdl') return toast(D.bsel.size?`${plural(D.bsel.size,'boleto baixado','boletos baixados')} (simulação).`:'Todos os boletos da lista foram baixados (simulação).');
  if(k==='bsend') return toast(D.bsel.size?`${plural(D.bsel.size,'boleto enviado','boletos enviados')} ao morador (simulação).`:'Boletos da lista enviados ao morador (simulação).');
  if(k==='bdl1') return toast('Boleto baixado (simulação).');
  if(k==='bview') return toast('No protótipo o PDF do boleto não é aberto.');
  if(k==='bsend1') return toast('Boleto enviado ao morador (simulação).');
}
document.addEventListener('input',e=>{
  if(SHELL.mode!=='desktop') return;
  const t=e.target, k=t.dataset&&t.dataset.dIn;
  if(k){ const v=t.value;
    if(k==='uq'){D.uq=v;D.usel.clear();upd('utbl');upd('usub');upd('ubtn');}
    if(k==='cuq'){D.cuq=v;D.cusel.clear();upd('cutbl');upd('cubtn');}
    if(k==='cq'){D.cq=v;D.csel.clear();upd('ctbl');upd('csub');upd('cbtn');}
    if(k==='bq'){D.bq=v;upd('btbl');}
    if(k==='hq'){D.hq=v;upd('hlist');}
    if(k==='dq'){D.dq=v;upd('dtbl');}
    if(k==='aq'){D.aq=v;upd('atbl');}
    if(k==='rq'){D.rq=v;upd('rlist');}
    return; }
  const f=t.closest&&t.closest('form[data-form]'); if(f){ $$('.sf button',f).forEach(b=>b.disabled=false); }
});
document.addEventListener('keydown',e=>{ if(SHELL.mode!=='desktop'||e.key!=='Escape') return; if(popEl) closePop(); else if(ovEl) closeModal(); });

/* ---------- API para a troca de fluxo ---------- */
const MOBILE_EQ=['unidades','unidade','perfil','suporte'];
window.DESK={
  snapshot(){ const n=D.r.n, p=D.r.p;
    if(AUTH.includes(n)) return {logged:false,screen:n};
    if(n==='unidade') return {logged:true,screen:'unidade',unitId:p.id,tab:p.tab||'boletos'};
    if(n==='novoVencimento'||n==='novoAcordo') return {logged:true,screen:'unidade',unitId:p.id,tab:'boletos'};
    return {logged:true,screen:MOBILE_EQ.includes(n)?n:'unidades'}; },
  enter(s){ closePop(); closeModal();
    if(!SHELL.logged){ D.login.erro=null; return nav(AUTH.includes(s.screen)?s.screen:'login'); }
    if(s.screen==='unidade'&&unitById(s.unitId)){ const tab={resumo:'boletos',historico:'boletos'}[s.tab]||s.tab||'boletos'; if(D.r.p.id!==s.unitId) resetUnitState(); return nav('unidade',{id:s.unitId,tab}); }
    if(s.screen==='perfil'||s.screen==='suporte') return nav(s.screen);
    nav('unidades'); },
  leave(){ closePop(); closeModal(); if(toastEl){toastEl.remove();toastEl=null;} }
};
})();
