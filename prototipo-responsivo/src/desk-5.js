/* ---------- 09 · detalhe da unidade ---------- */
const SBADGE={'Pago':'ok','Aguardando pagamento':'warn','Aguardando emissão':'info','Vencido':'err','Cancelado':'ind','A vencer':'vio'};
function bolMatch(b,F,q){
  if(q&&!(b.t+' '+b.venc+' '+b.valor+' '+b.status).toLowerCase().includes(q.toLowerCase())) return false;
  if(F.status.length&&!F.status.includes(b.status)) return false;
  if(F.tipos.length&&!F.tipos.includes(b.tipo)) return false;
  if(F.procs.length){ const sem=F.procs.includes('__sem'); if(!(b.proc?F.procs.includes(b.proc):sem)) return false; }
  const d=F.dias; if(d.preset!=null&&b.dias<d.preset) return false; if(d.min!=null&&b.dias<d.min) return false; if(d.max!=null&&b.dias>d.max) return false;
  return true;
}
const anyBF=F=>F.status.length||F.tipos.length||F.procs.length||hasRange(F.dias);
function procFilterLabel(F,procs){ const a=F.procs; if(!a.length) return 'Processo'; const sem=a.includes('__sem'),ps=a.filter(x=>x!=='__sem'),com=procs.length&&procs.every(p=>ps.includes(p));
  if(sem&&com) return 'Com e sem processo'; if(sem&&!ps.length) return 'Sem processo'; if(com&&!sem) return 'Com processo'; return (sem?'Sem processo':ps[0].slice(0,12)+'…')+((sem?1:0)+ps.length-1>0?' +'+((sem?1:0)+ps.length-1):''); }
function bolToolbar(u,ro){
  const F=D.bf, procs=u.id===2740?[P1,P2]:u.procs.slice();
  return `<div class="d-tb" style="border-bottom:0;padding-bottom:6px"><div class="d-inp" style="flex:0 1 240px;min-width:180px"><span>${X('search',18)}</span><input type="search" data-d-in="bq" placeholder="Buscar boleto" aria-label="Buscar boleto" value="${esc(D.bq)}"></div>
    ${filterBtn('b-status',listLabel(F.status,'Status'),F.status.length>0)}${filterBtn('b-tipo',listLabel(F.tipos,'Tipo'),F.tipos.length>0)}${filterBtn('b-proc',procFilterLabel(F,procs),F.procs.length>0)}${ro?'':filterBtn('b-dias',rangeLabel(F.dias,'Dias em atraso',['dia','dias']),hasRange(F.dias))}</div>
  ${ro?'':`<div class="d-tb" style="padding-top:6px" data-part="bacts">${bolActs()}</div>`}`;
}
function bolActs(){const n=D.bsel.size;return `<button type="button" class="d-btn sec sm" data-d="nv" ${n?'':'disabled'}>${X('cal',16)}Novo vencimento</button><button type="button" class="d-btn sec sm" data-d="na" ${n?'':'disabled'}>${X('thumb',16)}Novo acordo</button>${note('juridico')}<span class="sep"></span>
  <button type="button" class="d-btn sec sm" data-d="extrato">${X('filetext',16)}Extrato de cobrança</button><button type="button" class="d-ibtn" data-d="bmore" aria-label="Mais ações" aria-haspopup="menu">${X('dots',16,3)}</button><button type="button" class="d-ibtn ${D.busy?'busy':''}" data-d="brefresh" aria-label="Atualizar boletos" ${D.busy?'disabled':''}>${X('refresh',16)}</button>${n?`<span class="d-hint">${plural(n,'boleto selecionado','boletos selecionados')}</span>`:''}`;}
function bolTable(u,ro){
  const all=bolsOf(u), list=all.filter(b=>bolMatch(b,D.bf,D.bq)), any=anyBF(D.bf)||D.bq;
  const selectable=list.filter(b=>!b.ced).map(b=>b.i), n=selectable.filter(i=>D.bsel.has(i)).length;
  const res=`<div class="d-res" style="border-top:1px solid var(--border-2)"><b>${plural(list.length,'boleto','boletos')}</b>${any?`<button type="button" class="d-link" data-d="bclear">Limpar filtros</button>`:''}</div>`;
  if(!list.length) return res+emptyBox('Nenhum boleto encontrado','Altere os filtros selecionados e tente novamente.',`<button type="button" class="d-btn sec" data-d="bclear">Limpar filtros</button>`);
  return res+`<div class="d-tw ${D.busy?'busy-list':''}"><table class="d-t"><thead><tr>${ro?'':`<th class="cbc">${cbAll(n,selectable.length,'ball')}</th>`}<th>Referência</th><th>Vencimento (dias em atraso)</th><th>Valor</th><th>Multa</th><th>Juros</th><th>Correção</th><th>Encargo</th><th>Adicionais</th><th>Subtotal</th><th>Total</th><th>Data de pagamento</th><th>Valor pago ${b0Note()}</th><th>Competências relac.</th><th>No processo</th><th>Status</th>${ro?'':'<th>Ação</th>'}</tr></thead><tbody>
  ${list.map(b=>{const on=!ro&&D.bsel.has(b.i);return `<tr class="${on?'sel':''}">${ro?'':`<td class="cbc">${b.ced?`<span class="ced" title="Boleto cedido: não pode ser selecionado">${X('ban',16)}</span>`:cb(on,`data-d="bsel" data-i="${b.i}"`)}</td>`}
    <td><span class="ref"><span class="z">${X('zap',14)}</span>${b.t}</span></td><td>${b.venc}${b.dias>0&&b.status!=='A vencer'?`<span class="d-dd">${b.dias}D</span>`:''}</td>
    <td>${b.valor}</td><td>${b.multa}</td><td>${b.juros}</td><td>${b.corr}</td><td>${b.enc}</td><td>${b.adic}</td><td class="b">${b.sub}</td><td class="b">${b.total}</td><td>${b.pag}</td><td style="${b.status==='Pago'?'color:var(--success)':''}">${b.pago}</td><td>${b.comp}</td>
    <td>${b.proc?`<span class="d-chip" title="${b.proc}">${X('scales',12)}…${b.proc.slice(-7)}</span>`:'—'}</td>
    <td><span style="display:inline-flex;gap:4px"><span class="d-b ${SBADGE[b.status]||'gray'}">${b.status}</span>${b.ced?'<span class="d-b warn">Cedido</span>':''}</span></td>
    ${ro?'':`<td>${b.ced?'':`<button type="button" class="d-ibtn plain" data-d="brow" data-i="${b.i}" aria-label="Ações do boleto ${b.t}" aria-haspopup="menu">${X('dots',16,3)}</button>`}</td>`}</tr>`;}).join('')}</tbody></table></div>`;
}
const b0Note=()=>note('pago');
function histPanel(ro){
  const q=D.hq.toLowerCase(), list=D.hist.filter(h=>!q||(h.who+' '+h.when+' '+h.desc).toLowerCase().includes(q));
  return `<aside class="d-card d-hist" aria-label="Histórico da unidade"><div class="hh"><b>Histórico</b>${ro?'':`<button type="button" class="d-btn sec sm act" data-d="hnew">${X('add',16)}Novo</button>`}</div>
  <div class="hs"><div class="d-inp"><span>${X('search',16)}</span><input type="search" data-d-in="hq" placeholder="Buscar" aria-label="Buscar no histórico" value="${esc(D.hq)}"></div>${ro?'':`<button type="button" class="d-ibtn" data-d="hrefresh" aria-label="Atualizar histórico">${X('refresh',16)}</button>`}</div>
  <div class="hl" data-part="hlist">${histItems(list)}</div></aside>`;
}
function histItems(list){ if(!list) {const q=D.hq.toLowerCase(); list=D.hist.filter(h=>!q||(h.who+' '+h.when+' '+h.desc).toLowerCase().includes(q));}
  return list.length?list.map(h=>`<button type="button" class="d-hi" data-d="hopen" data-k="${h.k}"><span class="b"><span class="w">${h.who}</span><span class="t">${h.when}</span><span class="x">${h.desc}</span></span><span style="color:var(--text-4)">${X('cr',16)}</span></button>`).join(''):`<p class="d-hint" style="padding:16px">Nenhum registro encontrado.</p>`; }
function unitHeader(u){
  return `<div class="d-ph" style="margin-bottom:0"><div><h1>${unitTitle(u)} - ${u.condo}</h1><p class="sub">${u.cidade} - Recebida em ${u.rec}</p></div><div class="acts" style="align-self:flex-end"><span style="display:inline-flex;align-items:center;gap:6px">${note('docs')}<button type="button" class="d-btn sec" data-d="cdocs" data-id="${u.id}">${X('file',16)}Documentos do condomínio</button></span><button type="button" class="d-btn pri" data-d="regproc">${X('add',16)}Registrar processo</button></div></div><div class="d-hr"></div>
  <div class="d-dk"><div class="d-kpi" style="grid-template-columns:1fr 1fr;column-gap:16px"><span class="l">Dívida original</span><span class="l">Dívida atualizada</span><span class="v">R$ 1.162,00</span><span class="v c-err">R$ 1.574,21</span><span class="s">10 títulos vencidos</span><span></span></div><div class="d-kpi"><span class="l">Dias de atraso</span><span class="v c-err">402d</span><span class="s">vencimento mais antigo em aberto</span></div><div class="d-kpi"><span class="l">Crédito da unidade</span><span class="v">R$ 0,00</span><span class="s">nenhum crédito registrado</span></div></div>
  <div class="d-ind"><div><div class="l">Indicador de cobrança</div><span class="d-b brand sq">Inquilino</span></div><div><div class="l">Nome</div><div class="v">${u.ind}</div></div><div><div class="l">${u.doc.length>14?'CNPJ':'CPF'}</div><div class="v">${u.doc}</div></div><div><div class="l">E-mail</div><div class="v">${u.id===2740?'fernanda.souza@outlook.com':'morador@exemplo.com'}</div></div><div><div class="l">Telefone</div><div class="v">(11) 98765-4321</div></div></div><div class="d-hr"></div>`;
}
const UTABS=[['boletos','Boletos'],['documentos','Documentos'],['processos','Processos'],['dados','Dados da Unidade']];
V.unidade={
  html:p=>{const u=unitById(p.id), tab=p.tab||'boletos', np=procsOf(u).length;
    const tabs=`<div class="d-tabs" role="tablist">${UTABS.map(([id,l])=>`<button type="button" role="tab" class="d-tab ${tab===id?'on':''}" aria-selected="${tab===id}" data-d="utab" data-tab="${id}">${l}${id==='documentos'?`<span class="n">${DOCS.length}</span>`:id==='processos'&&np?`<span class="n">${np}</span>`:''}</button>`).join('')}</div>`;
    let body='';
    if(tab==='boletos') body=`<div class="d-split"><div class="d-card" style="min-width:0">${bolToolbar(u)}<div data-part="btbl">${bolTable(u)}</div></div>${histPanel()}</div>`;
    if(tab==='documentos') body=docsTab(u);
    if(tab==='processos') body=procsTab(u);
    if(tab==='dados') body=dadosTab(u,false);
    return crumb([[X('home',18),'go','data-to="unidades"','Unidades'],['Unidades','go','data-to="unidades"'],[u.condo+' - '+unitTitle(u)]])+unitHeader(u)+tabs+body;},
  parts:{btbl:p=>bolTable(unitById(p.id)),bacts:()=>bolActs(),hlist:()=>histItems(),dtbl:p=>docsTable()}
};
function docsTable(){
  const q=D.dq.toLowerCase(), list=DOCS.map((d,i)=>({d,i})).filter(x=>!q||x.d.join(' ').toLowerCase().includes(q)), n=list.filter(x=>D.dsel.has(x.i)).length;
  if(!list.length) return emptyBox('Nenhum documento encontrado','Tente buscar por outro termo.');
  return `<div class="d-tw"><table class="d-t"><thead><tr><th class="cbc">${cbAll(n,list.length,'dall')}</th><th>Nome do documento</th><th>Categoria</th><th>Autor</th><th>Data</th><th>Tamanho</th><th aria-label="Baixar"></th></tr></thead><tbody>
  ${list.map(({d,i})=>{const on=D.dsel.has(i);return `<tr class="${on?'sel':''}"><td class="cbc">${cb(on,`data-d="dsel" data-i="${i}"`)}</td><td class="strong">${d[0]}</td><td>${d[1]}</td><td>${d[2]}</td><td>${d[3]}</td><td>${d[4]}</td><td><button type="button" class="d-ibtn plain" data-d="dl" aria-label="Baixar ${esc(d[0])}">${X('dl',16)}</button></td></tr>`;}).join('')}</tbody></table></div>`;
}
function docsTab(){return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><div class="d-inp" style="width:280px"><span>${X('search',18)}</span><input type="search" data-d-in="dq" placeholder="Buscar documento" aria-label="Buscar documento" value="${esc(D.dq)}"></div><span style="flex:1"></span><span data-part="dbtn">${dlBtn()}</span></div><div class="d-card" data-part="dtbl">${docsTable()}</div>`;}
const dlBtn=()=>`<button type="button" class="d-btn pri" data-d="dlsel" ${D.dsel.size?'':'disabled'}>${X('dl',16)}Baixar${D.dsel.size?` (${D.dsel.size})`:''}</button>`;
function procsTab(u){const ps=procsOf(u);
  if(!ps.length) return emptyBox('Nenhum processo nesta unidade','Quando houver um processo, ele aparece aqui. Use "Registrar processo" para incluir um.');
  return ps.map((p,i)=>`<div class="d-pcard"><div class="ph"><span class="d-fi">${X('scales',16)}</span><b>${p.n}</b><span class="d-b ok">Ativo</span>${p.outro?`<span class="d-b gray">${X('lock',12,2)}Somente leitura</span>`:''}<button type="button" class="d-btn sec sm act" data-d="pbol" data-i="${i}">${X('receipt',16)}Ver boletos</button>${i===0?note('verbol'):''}</div>
  <div class="pb">${[['Data de distribuição',p.dist],['Data de cálculo',p.calc],['Tipo de ação',p.tipo],['Acréscimos',p.acr],['Escritório',p.esc],['Advogado',p.adv],['Boletos',plural(p.bols,'boleto','boletos')],['Valor atualizado',p.val]].map(([l,v])=>`<div class="d-ro"><b>${l}</b><span>${v}</span></div>`).join('')}</div></div>`).join('');}
function dadosTab(u,allRO){
  const LJ='Para alterar estes dados, fale com a LLZ.';
  const ro=(title,sub,rows)=>`<div class="d-sec"><div class="st"><b>${title}</b><span>${sub}</span></div><div class="sc"><div class="sb"><div class="d-g2">${rows.map(([l,v])=>`<div class="d-ro"><b>${l}</b><span>${v}</span></div>`).join('')}</div><div class="d-lock">${X('lock',14)}${LJ}</div></div></div></div>`;
  const pes=(id,title,n,doc,tel,em)=>allRO?ro(title,'Somente leitura.',[['Nome completo',n],['CPF/CNPJ',doc],['Telefone',tel],['WhatsApp','—'],['Celular','—'],['E-mail',em||'—'],['E-mail secundário','—']]):
    `<div class="d-sec"><div class="st"><b>${title}</b><span>Todos os dados desta seção podem ser editados.</span></div><form class="sc" data-form="${id}"><div class="sb"><div class="d-fld"><label>Nome completo <span class="rq">*</span></label><div class="d-inp lg"><input value="${esc(n)}" required></div></div>
    <div class="d-g2"><div class="d-fld"><label>CPF/CNPJ <span class="rq">*</span></label><div class="d-inp lg"><input value="${esc(doc)}" required></div></div><div class="d-fld"><label>Telefone</label><div class="d-inp lg"><input value="${esc(tel)}"></div></div><div class="d-fld"><label>WhatsApp</label><div class="d-inp lg"><input></div></div><div class="d-fld"><label>Celular</label><div class="d-inp lg"><input></div></div><div class="d-fld"><label>E-mail</label><div class="d-inp lg"><input type="email" value="${esc(em||'')}"></div></div><div class="d-fld"><label>E-mail secundário</label><div class="d-inp lg"><input type="email"></div></div></div></div>
    <div class="sf"><button type="button" class="d-btn sec" data-d="fcancel" disabled>Cancelar</button><button type="button" class="d-btn pri" data-d="fsave" data-t="${title}" disabled>Salvar</button></div></form></div>`;
  return `<div>${ro('Unidade','Somente leitura.',[['Bloco',u.bloco],['Unidade',u.un]])}
  ${ro('Condomínio','Somente leitura. Os dados do condomínio valem para todas as unidades vinculadas a ele.',[['CNPJ',u.cnpj],['Razão social','Condomínio '+u.condo.replace(/^(Condomínio|Edifício) /,'')],['Nome fantasia',u.condo],['Inscrição municipal','—'],['Inscrição estadual','—'],['CEP','00000-000'],['Logradouro','Rua Exemplo'],['Número','100'],['Complemento','—'],['Bairro','Vila Olímpia'],['Apelido',u.condo.replace(/^(Residencial|Condomínio|Edifício) /,'')],['Síndico','Marcos Vinícius Tavares'],['Responsável','Marcos Vinícius Tavares'],['Cargo do responsável','Síndico']])}
  ${ro('Cobrança','Somente leitura.',[['Indicador de cobrança','Inquilino'],['CEP','00000-000'],['Logradouro','Rua das Acácias'],['Número','450'],['Complemento',unitTitle(u).replace(' - ',' · ')],['Bairro','Vila Olímpia'],['Cidade',u.cidade.split(', ')[0]],['Estado',u.cidade.split(', ')[1]]])}
  ${pes('prop','Proprietário','Carlos Eduardo Mendes','423.891.234-56','(11) 98376-9876','')}${pes('inq','Inquilino',u.ind,u.doc,'(11) 98765-4321',u.id===2740?'fernanda.souza@outlook.com':'')}${pes('imob','Imobiliária','Imobiliária Exemplo Ltda.','22.333.444/0001-55','(11) 3000-0000','contato@imobiliariaexemplo.com.br')}</div>`;
}
