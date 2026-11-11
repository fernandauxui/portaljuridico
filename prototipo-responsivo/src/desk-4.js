/* ================= telas ================= */
const V={};
/* ---------- 02–04 · acesso ---------- */
V.login={html:()=>{const L=D.login;let al='';
  if(L.erro==='bloqueado') al=`<div class="alert">${X('alert',20)}<div><b>Conta bloqueada</b><p>Você ultrapassou o limite de tentativas. Use "Esqueci minha senha" para criar uma nova senha ou fale com a LLZ.</p></div></div>`;
  if(L.erro==='inativo') al=`<div class="alert">${X('alert',20)}<div><b>Acesso indisponível</b><p>Seu acesso ao Portal Jurídico não está ativo. Fale com a LLZ para verificar seu cadastro e o vínculo com o escritório.</p></div></div>`;
  return `<div class="hd"><h2>Entrar na sua conta</h2><p>Use o e-mail cadastrado no SIGGA</p></div>${al}<form id="lf" novalidate style="display:grid;gap:16px">
  <div class="d-fld"><label for="le">E-mail</label><div class="d-inp lg"><input id="le" type="email" autocomplete="username" value="${esc(L.email)}" placeholder="nome@escritorio.com.br"></div></div>
  <div class="d-fld"><label for="lp">Senha</label><div class="d-inp lg ${L.erro==='senha'?'err':''}"><input id="lp" type="password" autocomplete="current-password" value="${esc(L.senha)}" placeholder="••••••••"><button type="button" class="d-ibtn plain" data-d="eye" aria-label="Mostrar senha" style="width:24px;height:24px">${X('eyeoff',16)}</button></div>${L.erro==='senha'?'<span class="d-hint err">E-mail ou senha incorretos.</span>':''}</div>
  <button type="submit" class="d-btn pri lg">Entrar</button></form><button type="button" class="d-link" data-d="go" data-to="esqueci" style="justify-self:start">Esqueci minha senha</button>
  <p class="demo">Protótipo com dados fictícios · veja os cenários em "Protótipo", no canto da tela.</p>`;},
  mount(el){$('#lf',el).onsubmit=e=>{e.preventDefault();const L=D.login;L.email=$('#le',el).value;L.senha=$('#lp',el).value;L.erro=null;const u=L.email.trim().toLowerCase().split('@')[0];
    if(u==='bloqueado'){L.erro='bloqueado';return render();} if(u==='inativo'){L.erro='inativo';return render();} if(u==='primeiro') return nav('criarSenha');
    if(L.senha!=='Teste@123'){L.erro='senha';return render();} if(u==='2fa') return nav('doisFatores'); enterApp();};}
};
V.criarSenha=newPw({title:'Criar nova senha',sub:'Crie uma senha segura para o seu primeiro acesso.',cta:'Salvar',back:true,next:()=>enterApp()});
V.esqueci={html:()=>`<div class="hd"><span class="fi brand" style="width:40px;height:40px;margin-bottom:8px">${X('key',20)}</span><h2>Recuperar senha</h2><p>Informe o e-mail da sua conta. Enviaremos um código de 6 dígitos para você redefinir a senha.</p></div>
  <form id="ef" novalidate style="display:grid;gap:16px"><div class="d-fld"><label for="re">E-mail</label><div class="d-inp lg"><input id="re" type="email" value="${esc(D.recEmail)}" placeholder="nome@escritorio.com.br"></div></div><button type="submit" class="d-btn pri lg">Enviar código</button></form>
  <button type="button" class="d-link gray" data-d="go" data-to="login" style="justify-self:start">${X('cl',16)}Voltar para o login</button>`,
  mount(el){$('#ef',el).onsubmit=e=>{e.preventDefault();D.recEmail=$('#re',el).value.trim()||'nome@escritorio.com.br';nav('codigoEnviado');};}};
V.codigoEnviado={html:()=>`<div class="hd ctr"><span class="fi brand" style="width:56px;height:56px;margin-bottom:8px">${X('mail',26)}</span><h2>E-mail enviado</h2><p>Enviamos um código de 6 dígitos para<br><span class="strong">${esc(D.recEmail)}</span></p></div>
  <div class="note">${X('clock',16)}<span>O código expira em 5 minutos. Verifique também a pasta de spam.</span></div>
  <button type="button" class="d-btn pri lg" data-d="go" data-to="digitarCodigo">Já tenho o código · Definir nova senha</button><button type="button" class="d-link gray" data-d="go" data-to="login" style="justify-self:center">Voltar para o login</button>`};
V.digitarCodigo=codeScr({title:'Digite o código',sub:()=>`Enviamos um código de 6 dígitos para <span class="strong">${esc(D.recEmail)}</span>.`,icon:'mail',backTo:'codigoEnviado',expire:'O código expira em 5 minutos.',after:()=>nav('novaSenha')});
V.novaSenha=newPw({title:'Definir nova senha',sub:'Crie uma senha segura para sua conta.',cta:'Redefinir senha',back:false,next:()=>nav('senhaOk')});
V.senhaOk={html:()=>`<div class="hd ctr"><span class="fi success" style="width:56px;height:56px;margin-bottom:8px">${X('okc',26)}</span><h2>Senha redefinida!</h2><p>Sua senha foi alterada com sucesso. Use-a no próximo login.</p></div><button type="button" class="d-btn pri lg" data-d="go" data-to="login">Ir para o login</button>`};
V.doisFatores=codeScr({title:'Autenticação em duas etapas',sub:'Enviamos um código de 6 dígitos para o seu e-mail.',icon:'shield',backTo:'login',expire:'O código expira em 10 minutos.',after:()=>enterApp()});

/* ---------- 06 · condomínios ---------- */
function condosList(){
  const q=D.cq.toLowerCase(), F=D.cf;
  let r=CONDOS.filter(c=>{ if(q&&!(c.name+' '+c.cnpj+' '+c.id).toLowerCase().includes(q)) return false;
    if(F.valor.min!=null||F.valor.max!=null){ if(c.valor==null) return false; if(F.valor.min!=null&&c.valor<F.valor.min) return false; if(F.valor.max!=null&&c.valor>F.valor.max) return false; }
    if(F.proc.length&&!F.proc.some(x=>(x==='com'&&c.com)||(x==='sem'&&c.sem))) return false; return true; });
  const s=D.csort; r.sort((a,b)=>{ if(s.k==='name') return a.name.localeCompare(b.name,'pt-BR')*s.dir; const k=s.k; return ((a[k]==null?-1:k==='units'?a.units.length:a[k])-(b[k]==null?-1:k==='units'?b.units.length:b[k]))*s.dir; });
  return r;
}
V.condominios={
  html:()=>{const tot=CONDOS.length, un=UNITS.length, com=CONDOS.filter(c=>c.com).length, sem=tot-com, list=condosList();
    return `<div class="d-ph"><div><h1>Condomínios</h1><p class="sub" data-part="csub">${list.length} de ${tot} condomínios · ${sem} sem processo</p></div><div class="acts" data-part="cbtn">${V.condominios.parts.cbtn()}</div></div>
    <div class="d-kpis"><div class="d-kpi"><span class="l">Total de condomínios</span><span class="v">${tot}</span><span class="s">cadastrados</span></div><div class="d-kpi"><span class="l">Total de unidades</span><span class="v c-brand">${un}</span><span class="s">nos condomínios</span></div><div class="d-kpi"><span class="l">Com processo</span><span class="v c-ok">${com}</span><span class="s">com unidade(s) em processo</span></div><div class="d-kpi"><span class="l">Sem processo</span><span class="v c-warn">${sem}</span><span class="s">nenhuma unidade em processo</span></div></div>
    <div class="d-card"><div class="d-tb"><div class="d-inp"><span>${X('search',18)}</span><input type="search" data-d-in="cq" placeholder="Buscar condomínio ou CNPJ" aria-label="Buscar condomínio" value="${esc(D.cq)}"></div>
    ${filterBtn('c-valor',moneyLabel(D.cf.valor,'Valor da ação'),D.cf.valor.min!=null||D.cf.valor.max!=null)}<span class="sp"></span>${filterBtn('c-proc',listLabel(D.cf.proc,'Processo',PROC_L),D.cf.proc.length>0)}</div>
    <div data-part="ctbl">${V.condominios.parts.ctbl()}</div></div>`;},
  parts:{
    cbtn:()=>`<button type="button" class="d-btn pri" data-d="cplan">${X('dl',16)}Gerar planilha${D.csel.size?` (${D.csel.size})`:''}</button>`,
    csub:()=>`${condosList().length} de ${CONDOS.length} condomínios · ${CONDOS.filter(c=>c.sem).length} sem processo`,
    ctbl:()=>{const list=condosList(), any=D.cq||D.cf.proc.length||D.cf.valor.min!=null||D.cf.valor.max!=null, s=D.csort, ids=list.map(c=>c.id), n=ids.filter(i=>D.csel.has(i)).length;
      if(!list.length) return emptyBox('Nenhum condomínio encontrado','Altere os filtros selecionados e tente novamente.',`<button type="button" class="d-btn sec" data-d="cclear">Limpar filtros</button>`);
      return `<div class="d-res"><b>${plural(list.length,'condomínio','condomínios')}</b>${D.csel.size?`<span>${plural(D.csel.size,'selecionado','selecionados')}</span>`:''}${any?`<button type="button" class="d-link" data-d="cclear">Limpar filtros</button>`:''}</div>
      <div class="d-tw"><table class="d-t"><thead><tr><th class="cbc">${cbAll(n,ids.length,'call')}</th><th>CNPJ</th>${thS('Condomínio','name',s,'csort')}${thS('Qtd. unidades','units',s,'csort')}${thS('Com processo','com',s,'csort')}<th>Sem processo</th>${thS('Valor da ação','valor',s,'csort')}<th aria-label="Abrir"></th></tr></thead><tbody>
      ${list.map(c=>{const on=D.csel.has(c.id);return `<tr class="click ${on?'sel':''}" data-d="opencondo" data-id="${c.id}"><td class="cbc">${cb(on,`data-d="csel" data-id="${c.id}"`)}</td><td>${c.cnpj}</td><td class="strong">${c.name}</td><td>${c.units.length}</td><td><span class="d-num ${c.com?'ok':'zero'}">${c.com}</span></td><td><span class="d-num ${c.sem?'warn':'zero'}">${c.sem}</span></td><td class="b">${c.valor!=null?brl(c.valor)+' ('+c.units[0].procs.length+')':'—'}</td><td style="color:var(--text-4)">${X('cr',16)}</td></tr>`;}).join('')}</tbody></table></div>`;}
  }
};

/* ---------- 07 · detalhe do condomínio ---------- */
const crumb=items=>`<nav class="d-crumb" aria-label="Você está em">${items.map((x,i)=>i===items.length-1?`<span class="cur" aria-current="page">${x[0]}</span>`:`<button type="button" ${x[1]?`data-d="${x[1]}" ${x[2]||''}`:''} ${x[3]?`aria-label="${x[3]}"`:''}>${x[0]}</button><span class="sep">${X('cr',14)}</span>`).join('')}</nav>`;
V.condominio={
  html:p=>{const c=condoById(p.id), us=c.units, inad=us.length, val=us.reduce((a,u)=>a+(u.procs.length?u.valor:0),0);
    return crumb([[X('condo',18),'go','data-to="condominios"','Condomínios'],['Condomínios','go','data-to="condominios"'],[c.name]])+
    `<div class="d-ph"><div><h1>${c.name}</h1><p class="sub">${c.cnpj}</p></div><div class="acts"><button type="button" class="d-btn sec" data-d="cdocs" data-id="${c.id}">${X('file',16)}Documentos do condomínio</button><button type="button" class="d-btn sec" data-d="go" data-to="relatorioCondo" data-id="${c.id}">${X('bars',16)}Relatórios de inadimplência</button><span data-part="cubtn">${V.condominio.parts.cubtn()}</span></div></div><div class="d-hr"></div>
    <div class="d-card" style="padding:12px 16px;margin-bottom:8px"><b style="font-weight:600;color:var(--text-2)">Unidades</b><div class="d-g3" style="margin-top:4px"><div class="d-kpi" style="border:0;padding:0"><span class="l">Total de unidades</span><span class="v">${us.length}</span></div><div class="d-kpi" style="border:0;padding:0 0 0 16px;border-left:1px solid var(--border-2);border-radius:0"><span class="l">Unidades inadimplentes</span><span class="v">${inad}</span><span class="s">100% do condomínio</span></div><div class="d-kpi" style="border:0;padding:0 0 0 16px;border-left:1px solid var(--border-2);border-radius:0"><span class="l">Com este escritório</span><span class="v">${us.length}</span><span class="s">100% das unidades inadimplentes</span></div></div></div>
    <div class="d-card" style="padding:12px 16px;margin-bottom:16px"><b style="font-weight:600;color:var(--text-2)">Valores da inadimplência</b><div class="d-g4" style="margin-top:4px">${[['Sob gestão deste escritório',brl(val),'Total no cond.: '+brl(val)],['Valor principal','R$ 0,00'],['Valor de acordo','R$ 0,00'],['Valor de novo vencimento','R$ 0,00']].map((k,i)=>`<div class="d-kpi" style="border:0;padding:0 ${i?'0 0 16px':'0'};${i?'border-left:1px solid var(--border-2);border-radius:0':''}"><span class="l">${k[0]}</span><span class="v">${k[1]}</span>${k[2]?`<span class="s">${k[2]}</span>`:''}</div>`).join('')}</div></div>
    <div class="d-card"><div class="d-tb">${unitFilterBar('cu')}</div><div data-part="cutbl">${unitTable('cu',us)}</div></div>`;},
  parts:{cubtn:()=>`<button type="button" class="d-btn pri" data-d="cuplan">${X('dl',16)}Gerar planilha${D.cusel.size?` (${D.cusel.size})`:''}</button>`,cutbl:p=>unitTable('cu',condoById(p.id).units)}
};

/* ---------- 07.04–07.07 · relatório de inadimplência do condomínio ---------- */
const COLS=['Documentos','Referência','Vencimento','Detalhe','Antecipado','Valor original','Multa','Correção','Juros','Encargos','Atualizado'];
function repDefaults(c){return {id:c.id,ini:'',fim:'',calc:'2026-07-23',units:c.units.map(u=>u.id),cols:COLS.slice(),status:'Vencido',ant:'Todas',proc:'Todas',ocultas:false,acordo:false,cedidos:false,gerado:false};}
V.relatorioCondo={
  html:p=>{const c=condoById(p.id); if(!D.rep||D.rep.id!==c.id) D.rep=repDefaults(c); const R=D.rep;
    const uLab=R.units.length?R.units.map(id=>{const u=unitById(id);return `${u.bloco}-${u.un} | ${u.ind}`;}).join(', '):'Selecione';
    const sel=(id,l,v,opts)=>`<div class="d-fld"><label for="${id}">${l}</label><div class="d-inp lg"><select id="${id}" data-rep="${id}">${opts.map(o=>`<option ${o===v?'selected':''}>${o}</option>`).join('')}</select>${X('cd',16)}</div></div>`;
    const ck=(k,l)=>`<button type="button" class="d-chk" role="checkbox" aria-checked="${R[k]}" data-d="repck" data-k="${k}"><span class="d-cb ${R[k]?'on':''}">${R[k]?X('check',12,3):''}</span>${l}</button>`;
    return crumb([[X('condo',18),'go','data-to="condominios"','Condomínios'],['Condomínios','go','data-to="condominios"'],[c.name,'go',`data-to="condominio" data-id="${c.id}"`],['Relatório de inadimplência']])+
    `<div class="d-ph"><div><h1>${c.name}</h1><p class="sub">${c.cnpj}</p></div><div class="acts"><button type="button" class="d-btn sec" data-d="repdl" ${R.gerado?'':'disabled'}>${X('dl',16)}Baixar documento</button></div></div>
    <div class="d-g4"><div class="d-fld"><label for="r-ini">Início</label><div class="d-inp lg"><input id="r-ini" type="date" value="${R.ini}" data-rep="ini"></div></div><div class="d-fld"><label for="r-fim">Fim</label><div class="d-inp lg"><input id="r-fim" type="date" value="${R.fim}" data-rep="fim"></div></div><div class="d-fld"><label for="r-calc">Data de cálculo</label><div class="d-inp lg"><input id="r-calc" type="date" value="${R.calc}" data-rep="calc"></div></div>
    <div class="d-fld"><span class="d-lbl">Unidades (${R.units.length}) ${note('selall')}</span><button type="button" class="d-inp lg" data-d="repunits" style="text-align:left" aria-haspopup="dialog"><span class="val">${uLab}</span>${X('cd',16)}</button></div>
    <div class="d-fld"><span class="d-lbl">Colunas (${R.cols.length})</span><button type="button" class="d-inp lg" data-d="repcols" style="text-align:left" aria-haspopup="dialog"><span class="val">${R.cols.join(', ')||'Selecione'}</span>${X('cd',16)}</button></div>
    ${sel('status','Status do boleto',R.status,['Vencido','Todos','A vencer','Pago'])}${sel('ant','Antecipado',R.ant,['Todas','Sim','Não'])}${sel('proc','Processo da unidade',R.proc,['Todas','Com processo','Sem processo','Não pertence ao escritório'])}</div>
    <div style="display:flex;gap:20px;align-items:center;margin-top:16px;flex-wrap:wrap">${ck('ocultas','Não contabilizar colunas ocultas')}${ck('acordo','Mostrar boletos em acordo')}${ck('cedidos','Mostrar boletos cedidos')}<span style="flex:1"></span><button type="button" class="d-btn sec" data-d="repclear">Limpar</button><button type="button" class="d-btn pri" data-d="repgo" ${R.units.length&&R.cols.length?'':'disabled'}>${X('search',16)}Pesquisar</button></div>
    <div class="d-hr"></div>${R.gerado?repDoc(c,R):emptyBox('Nenhum relatório gerado ainda','Preencha os filtros e clique em Pesquisar para gerar o relatório de inadimplência.')}`;},
  mount(el){ $$('[data-rep]',el).forEach(i=>i.onchange=()=>{D.rep[i.dataset.rep]=i.value;}); }
};
function repDoc(c,R){
  const cols=COLS.filter(x=>R.cols.includes(x)), money=['Valor original','Multa','Correção','Juros','Encargos','Atualizado'];
  const rows=BOLETOS.filter(b=>R.status==='Todos'||b.status===R.status||(R.status==='A vencer'&&b.status==='A vencer')).filter(b=>R.cedidos||!b.ced).slice(0,4);
  const val=(b,k)=>({'Documentos':'—','Referência':b.t,'Vencimento':b.venc,'Detalhe':'—','Antecipado':'Não','Valor original':b.valor,'Multa':b.multa,'Correção':b.corr,'Juros':b.juros,'Encargos':b.enc,'Atualizado':b.total})[k];
  const sum=k=>brl(rows.reduce((a,b)=>a+({'Valor original':b.n.v,'Multa':b.n.m,'Correção':b.n.c,'Juros':b.n.j,'Encargos':b.n.e,'Atualizado':b.n.sub})[k],0));
  const us=R.units.map(unitById); let tv=0; rows.forEach(b=>tv+=b.n.sub);
  return `<div class="d-rep"><div class="rh"><b class="l">LLZ</b><div>LLZ GARANTIDORA | Rua dos Guajajaras, nº 1611, 6º andar - Belo Horizonte/MG<br>Tel: 4004-4939 · contato@llzgarantidora.com.br</div></div>
  <p style="font-weight:600;color:var(--text);font-size:13px">${c.id} - ${c.name} - CNPJ ${c.cnpj}</p><p class="d-hint" style="margin-bottom:12px">Relatório de Inadimplência - Emissão: ${HOJE} 08:03:25</p>
  <div class="d-card d-tw"><table class="d-t"><thead><tr>${cols.map(k=>`<th style="${money.includes(k)?'text-align:right':''}">${k}</th>`).join('')}</tr></thead><tbody>
  ${us.map(u=>`<tr class="grp"><td colspan="${cols.length}">${u.bloco} - ${u.un}</td></tr>${rows.map(b=>`<tr>${cols.map(k=>`<td style="${money.includes(k)?'text-align:right':''}">${val(b,k)}</td>`).join('')}</tr>`).join('')}<tr class="subt">${cols.map((k,i)=>`<td style="${money.includes(k)?'text-align:right':''}">${i===0?'Subtotal':money.includes(k)?sum(k):''}</td>`).join('')}</tr>`).join('')}
  </tbody></table></div><div class="tot"><b>Total (${rows.length*us.length} taxas em ${plural(us.length,'unidade','unidades')})</b><span>Valor atualizado <b style="color:var(--brand)">${brl(tv*us.length)}</b></span></div></div>`;
}

/* ---------- 08 · unidades ---------- */
V.unidades={
  html:()=>{const tot=UNITS.length, com=UNITS.filter(u=>u.procs.length).length;
    return `<div class="d-ph"><div><h1>Unidades</h1><p class="sub" data-part="usub">${V.unidades.parts.usub()}</p></div><div class="acts" data-part="ubtn">${V.unidades.parts.ubtn()}</div></div>
    <div class="d-kpis"><div class="d-kpi"><span class="l">Total de unidades</span><span class="v">${tot}</span><span class="s">cadastradas</span></div><div class="d-kpi"><span class="l">Com processo</span><span class="v c-ok">${com}</span><span class="s">em andamento</span></div><div class="d-kpi"><span class="l">Sem processo</span><span class="v c-warn">${tot-com}</span><span class="s">aguardando</span></div><div class="d-kpi"><span class="l">Novas</span><span class="v c-brand">0</span><span class="s">recém cadastradas</span></div></div>
    <div class="d-card"><div class="d-tb">${unitFilterBar('u')}</div><div data-part="utbl">${unitTable('u',UNITS)}</div></div>`;},
  parts:{
    usub:()=>`${unitsList(UNITS,D.uf,D.uq).length} de ${UNITS.length} unidades · ${UNITS.filter(u=>!u.procs.length).length} sem processo`,
    ubtn:()=>`<button type="button" class="d-btn pri" data-d="uplan">${X('dl',16)}Gerar planilha${D.usel.size?` (${D.usel.size})`:''}</button>`,
    utbl:()=>unitTable('u',UNITS)
  }
};
