/* ---------- 10 · histórico processual ---------- */
const INFO_HIST=`<div class="d-banner">${X('info',16)}<span>Os dados apresentados no histórico refletem os eventos ocorridos durante o processo. Você pode consultar informações como boletos, acordos, alterações e movimentações realizadas. Importante: este histórico não representa os dados ou débitos atuais da unidade. Para consultar a situação atual, a unidade precisa estar vinculada a um processo ativo.</span></div>`;
V.historico={
  html:()=>{const q=D.aq.toLowerCase(),list=ARQ.filter(a=>!q||Object.values(a).join(' ').toLowerCase().includes(q));
    return `<div class="d-ph"><div><h1>Histórico processual</h1><p class="sub">Processos concluídos, cancelados ou transferidos · ${plural(ARQ.length,'processo arquivado','processos arquivados')}</p></div><div class="acts"><button type="button" class="d-btn pri" data-d="aplan">${X('dl',16)}Gerar planilha</button></div></div>${INFO_HIST}
    <div class="d-kpis" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="d-kpi"><span class="l">Processos no histórico</span><span class="v">${ARQ.length}</span><span class="s">no acervo</span></div><div class="d-kpi"><span class="l">Concluídos</span><span class="v c-ok">${ARQ.filter(a=>a.sit==='Concluído').length}</span><span class="s">processo concluído</span></div><div class="d-kpi"><span class="l">Cancelados</span><span class="v c-err">${ARQ.filter(a=>a.sit==='Cancelado').length}</span><span class="s">processo cancelado</span></div></div>
    <div class="d-card"><div class="d-tb"><div class="d-inp"><span>${X('search',18)}</span><input type="search" data-d-in="aq" placeholder="Buscar processo, condomínio ou advogado" aria-label="Buscar no histórico processual" value="${esc(D.aq)}"></div></div><div data-part="atbl">${V.historico.parts.atbl()}</div></div>`;},
  parts:{atbl:()=>{const q=D.aq.toLowerCase(),list=ARQ.filter(a=>!q||Object.values(a).join(' ').toLowerCase().includes(q));
    if(!list.length) return emptyBox('Nenhum processo encontrado','Tente buscar por outro termo.');
    return `<div class="d-tw"><table class="d-t"><thead><tr><th>Processo</th><th>Advogado</th><th>Bloco</th><th>Unidade</th><th>Condomínio</th><th>Situação</th><th>Encerrado em</th><th>Valor final</th><th></th></tr></thead><tbody>${list.map((a,i)=>`<tr class="click" data-d="openproc" data-i="${ARQ.indexOf(a)}"><td class="strong">${a.n}</td><td>${a.adv}</td><td>${a.bloco}</td><td>${a.un}</td><td>${a.condo}</td><td><span class="d-b ${a.sit==='Concluído'?'ok':'err'}">${a.sit}</span></td><td>${a.fim}</td><td class="b" style="${a.valor==='Quitado'?'color:var(--success)':''}">${a.valor}</td><td style="color:var(--text-4)">${X('cr',16)}</td></tr>`).join('')}</tbody></table></div>`;}}
};
V.processo={
  html:p=>{const a=ARQ[p.i], tab=p.tab||'boletos', u=UNITS[0];
    const tabs=`<div class="d-tabs" role="tablist">${[['boletos','Boletos'],['dados','Dados da Unidade']].map(([id,l])=>`<button type="button" role="tab" class="d-tab ${tab===id?'on':''}" aria-selected="${tab===id}" data-d="ptab" data-tab="${id}">${l}</button>`).join('')}</div>`;
    return crumb([[X('archive',18),'go','data-to="historico"','Histórico processual'],['Histórico processual','go','data-to="historico"'],[a.n]])+
    `<div class="d-ph"><div><h1 style="display:flex;align-items:center;gap:10px">Processo ${a.n}<span class="d-b ${a.sit==='Concluído'?'ok':'err'}">${a.sit}</span></h1><p class="sub">Unidade ${a.un} · ${a.condo} · ${a.cnpj}</p></div></div><div class="d-hr"></div>${INFO_HIST}
    <div class="d-ind" style="grid-template-columns:repeat(6,minmax(0,1fr))">${[['Número do processo',a.n],['Data de cadastro',a.cad],['Data de encerramento',a.fim],['Tipo de ação',a.tipo],['Advogado',a.adv],['Status',a.sit]].map(([l,v])=>`<div><div class="l">${l}</div><div class="v" title="${v}">${v}</div></div>`).join('')}</div><div class="d-hr"></div>${tabs}
    ${tab==='boletos'?`<div class="d-split"><div class="d-card" style="min-width:0">${bolToolbar(u,true)}<div data-part="btbl">${bolTable(u,true)}</div></div>${histPanel(true)}</div>`:dadosTab(Object.assign({},u,{bloco:a.bloco,un:a.un,condo:a.condo,cnpj:a.cnpj}),true)}`;},
  parts:{btbl:()=>bolTable(UNITS[0],true),hlist:()=>histItems()}
};

/* ---------- 11 · relatório de inadimplência ---------- */
V.relatorio={
  html:()=>`<div class="d-ph"><div><h1>Relatório de inadimplência</h1><p class="sub">Escolha um condomínio para ver a situação de inadimplência dele.</p></div></div>
  <div class="d-card"><div class="d-tb" style="border-bottom:0"><div class="d-inp"><span>${X('search',18)}</span><input type="search" data-d-in="rq" placeholder="Buscar condomínio, código ou CNPJ" aria-label="Buscar condomínio" value="${esc(D.rq)}"></div></div><div data-part="rlist">${V.relatorio.parts.rlist()}</div></div>`,
  parts:{rlist:()=>{const q=D.rq.toLowerCase(),list=CONDOS.slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).filter(c=>!q||(c.id+' '+c.name+' '+c.cnpj).toLowerCase().includes(q));
    return list.length?list.map(c=>`<button type="button" class="d-crow" data-d="go" data-to="relatorioCondo" data-id="${c.id}"><span class="d-fi">${X('condo',16)}</span><span class="b"><b>${c.id} - ${c.name}</b><span>${c.cnpj} · ${plural(c.units.length,'unidade','unidades')}</span></span><span style="color:var(--text-4)">${X('cr',16)}</span></button>`).join(''):emptyBox('Nenhum condomínio encontrado','Tente buscar por outro termo.');}}
};

/* ---------- 12 · meu perfil ---------- */
V.perfil={
  html:()=>`<div class="d-ph"><div><h1>Meu perfil</h1><p class="sub">Dados da sua conta de acesso ao Portal Jurídico</p></div></div>
  <div class="d-sec" style="border-bottom:0"><div class="st"><b>Dados pessoais</b><span>Edite o seu telefone. Os demais dados são mantidos pela LLZ no cadastro do SIGGA.</span></div><div class="sc"><div class="sb"><div class="d-g2">${[['Nome completo','Rafael Monteiro'],['CPF','***.891.234-**'],['E-mail corporativo','rafael.monteiro@escritorio.com.br'],['Situação','Ativo'],['OAB','SP 123.456'],['Escritório','Monteiro &amp; Associados'],['Grupo de acesso','Advogado parceiro']].map(([l,v])=>`<div class="d-ro"><b>${l}</b><span>${v}</span></div>`).join('')}</div>
  <div class="d-fld" style="max-width:340px"><label for="pf-t">Telefone</label><div class="d-inp lg"><input id="pf-t" inputmode="tel" value="${esc(D.perfTel)}"></div></div></div><div class="sf"><button type="button" class="d-btn sec" id="pf-c" disabled>Cancelar</button><button type="button" class="d-btn pri" id="pf-s" disabled>Salvar</button></div></div></div>`,
  mount(el){const i=$('#pf-t',el),c=$('#pf-c',el),s=$('#pf-s',el);const sync=()=>{const ch=i.value!==D.perfTel;c.disabled=!ch;s.disabled=!ch||i.value.replace(/\D/g,'').length<10;};i.oninput=sync;c.onclick=()=>{i.value=D.perfTel;sync();};s.onclick=()=>{D.perfTel=i.value;sync();toast('Telefone atualizado.');};}
};

/* ---------- 13 · suporte ---------- */
const FAQ_D=FAQ.map(([q,a],i)=>[q,i===0?'Em Meu perfil, você pode editar o seu telefone. Os demais dados são mantidos pela LLZ no cadastro do SIGGA.':a]);
V.suporte={
  html:()=>{const ch=(i,l,v,a)=>`<div class="d-chan"><span class="d-fi">${X(i,16)}</span><span class="b"><b>${l}</b><span>${v}</span>${a?`<button type="button" class="d-link" data-d="canal" style="justify-self:start;font-size:13px">${a}</button>`:''}</span></div>`;
    return `<div class="d-ph"><div><h1>Suporte</h1><p class="sub">Fale com a LLZ ou consulte as dúvidas mais comuns.</p></div></div>
    <div class="d-sec"><div class="st"><b>Canais de atendimento</b><span>Fale com a LLZ pelo canal de sua preferência.</span></div><div class="sc">${ch('chat','WhatsApp','(31) 98361-6650','Conversar')}${ch('mail','E-mail','suporte@llzgarantidora.com.br','Enviar e-mail')}${ch('phone','Telefone','(31) 4004-4939','Ligar')}${ch('clock','Horário de atendimento','Segunda a sexta-feira de 08:00 às 18:00.<br>Sábado e Domingo fechado.')}</div></div>
    <div class="d-sec"><div class="st"><b>Perguntas frequentes</b><span>Consulte as dúvidas mais comuns sobre o acesso ao Portal.</span></div><div style="max-width:720px">${FAQ_D.map(([q,a],i)=>`<div class="d-acc ${D.faq===i?'open':''}"><button type="button" data-d="faq" data-i="${i}" aria-expanded="${D.faq===i}">${q}<span class="chev">${X('cd',18)}</span></button>${D.faq===i?`<div class="ab">${a}</div>`:''}</div>`).join('')}</div></div>`;}
};
