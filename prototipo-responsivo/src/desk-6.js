/* ---------- modais da unidade ---------- */
function docsModal(c){
  const sel=new Set(); let q='';
  const tbl=()=>{const list=DOCS.map((d,i)=>({d,i})).filter(x=>!q||x.d.join(' ').toLowerCase().includes(q)),n=list.filter(x=>sel.has(x.i)).length;
    return `<div class="d-card d-tw"><table class="d-t"><thead><tr><th class="cbc">${cbAll(n,list.length,'mall')}</th><th>Nome do documento</th><th>Categoria</th><th>Autor</th><th>Data</th><th>Tamanho</th><th></th></tr></thead><tbody>${list.map(({d,i})=>`<tr class="${sel.has(i)?'sel':''}"><td class="cbc">${cb(sel.has(i),`data-d="msel" data-i="${i}"`)}</td><td class="strong">${d[0]}</td><td>${d[1]}</td><td>${d[2]}</td><td>${d[3]}</td><td>${d[4]}</td><td><button type="button" class="d-ibtn plain" data-d="dl" aria-label="Baixar ${esc(d[0])}">${X('dl',16)}</button></td></tr>`).join('')}</tbody></table></div>`;};
  openModal({title:'Documentação condominial',sub:c.name,size:'lg',body:`<div style="display:flex;gap:12px"><div class="d-inp" style="width:280px"><span>${X('search',18)}</span><input type="search" id="mq" placeholder="Buscar" aria-label="Buscar documento"></div><span style="flex:1"></span><button type="button" class="d-btn pri" id="mdl" disabled>${X('dl',16)}Baixar</button></div><div id="mt">${tbl()}</div>`,
    onMount(b){const s=()=>{$('#mt',b).innerHTML=tbl();const d=$('#mdl',b);d.disabled=!sel.size;d.innerHTML=X('dl',16)+'Baixar'+(sel.size?` (${sel.size})`:'');};
      $('#mq',b).oninput=e=>{q=e.target.value.toLowerCase();s();};
      b.addEventListener('click',e=>{const t=e.target.closest('[data-d]');if(!t)return; if(t.dataset.d==='msel'){const i=+t.dataset.i;sel.has(i)?sel.delete(i):sel.add(i);s();} if(t.dataset.d==='mall'){const ids=DOCS.map((d,i)=>i).filter(i=>!q||DOCS[i].join(' ').toLowerCase().includes(q));const all=ids.every(i=>sel.has(i));ids.forEach(i=>all?sel.delete(i):sel.add(i));s();}});
      $('#mdl',b).onclick=()=>{toast(`${plural(sel.size,'documento baixado','documentos baixados')} (simulação).`);sel.clear();s();};}});
}
function regProcModal(u){
  const bols=bolsOf(u).filter(b=>!b.ced&&b.status!=='Pago'), sel=new Set(); let adic=false;
  const sums=()=>{const f=k=>brl(bols.reduce((a,b)=>a+b.n[k],0));return {v:f('v'),m:f('m'),j:f('j'),c:f('c'),e:f('e'),s:f('sub')};};
  const tbl=()=>{const S=sums(),n=sel.size;return `<div class="d-card d-tw" style="max-height:320px;overflow:auto"><table class="d-t"><thead><tr><th class="cbc">${cbAll(n,bols.length,'rall')}</th><th>Referência</th><th>Vencimento</th><th>Valor<br><small>(${S.v})</small></th><th>Multa<br><small>(${S.m})</small></th><th>Juros<br><small>(${S.j})</small></th><th>Correção<br><small>(${S.c})</small></th><th>Encargos<br><small>(${S.e})</small></th><th>Adicionais<br><small>(R$ 0,00)</small></th><th>Total<br><small>(${S.s})</small></th></tr></thead><tbody>
    ${bols.map(b=>`<tr class="${sel.has(b.i)?'sel':''}"><td class="cbc">${cb(sel.has(b.i),`data-d="rsel" data-i="${b.i}"`)}</td><td><span class="ref">${b.t}</span></td><td>${b.venc}${b.dias>0?`<span class="d-dd">${b.dias}D</span>`:''}</td><td>${b.valor}</td><td>${b.multa}</td><td>${b.juros}</td><td>${b.corr}</td><td>${b.enc}</td><td>${adic?'R$ 0,00':'—'}</td><td class="b">${b.total}</td></tr>`).join('')}</tbody></table></div>`;};
  openModal({title:'Registrar processo',sub:`${u.condo} · ${unitTitle(u)}`,size:'xl',
    body:`<div class="d-g4"><div class="d-fld"><label for="rp-n">Número do processo <span class="rq">*</span></label><div class="d-inp lg"><input id="rp-n" placeholder="0000000-00.2026.8.13.0000"></div></div><div class="d-fld"><label for="rp-d">Data de distribuição <span class="rq">*</span></label><div class="d-inp lg"><input id="rp-d" type="date"></div></div><div class="d-fld"><label>Data de cálculo (hoje) <span class="rq">*</span></label><div class="d-inp lg dis"><input value="${HOJE}" disabled></div></div><div class="d-fld"><label for="rp-t">Tipo de ação <span class="rq">*</span> ${note('tipoacao')}</label><div class="d-inp lg"><select id="rp-t"><option value="">Selecione...</option><option>Justiça Comum</option><option>Juizado Especial Cível</option></select>${X('cd',16)}</div></div>
      <div class="d-fld"><label for="rp-a">Advogado(a) <span class="rq">*</span></label><div class="d-inp lg"><select id="rp-a"><option value="">Selecione...</option>${ADVS.map(a=>`<option>${a}</option>`).join('')}</select>${X('cd',16)}</div></div></div>
      <div style="display:flex;align-items:center;gap:8px"><button type="button" class="d-chk" role="checkbox" aria-checked="false" id="rp-ad"><span class="d-cb"></span><b style="color:var(--text)">Adicionais</b></button><span class="d-hint">Inclui a coluna "Adicionais" no cálculo do Total.</span></div>
      <div id="rp-tb">${tbl()}</div><p class="d-hint" id="rp-h">Selecione pelo menos um boleto para o processo.</p>`,
    foot:`<button type="button" class="d-btn sec lg" data-d="close">Cancelar</button><span style="flex:1"></span><button type="button" class="d-btn pri lg" id="rp-s" disabled>Salvar</button>`,
    onMount(b){const s=()=>{$('#rp-tb',b).innerHTML=tbl();const ok=$('#rp-n',b).value.trim()&&$('#rp-d',b).value&&$('#rp-t',b).value&&$('#rp-a',b).value&&sel.size;$('#rp-s',b).disabled=!ok;$('#rp-h',b).textContent=sel.size?plural(sel.size,'boleto selecionado','boletos selecionados')+'.':'Selecione pelo menos um boleto para o processo.';};
      b.querySelector('.d-mod,.mb')&&b.addEventListener('input',()=>s()); b.addEventListener('change',()=>s());
      b.addEventListener('click',e=>{const t=e.target.closest('[data-d],#rp-ad');if(!t)return;
        if(t.id==='rp-ad'){adic=!adic;t.setAttribute('aria-checked',adic);t.firstElementChild.className='d-cb'+(adic?' on':'');t.firstElementChild.innerHTML=adic?X('check',12,3):'';s();}
        if(t.dataset.d==='rsel'){const i=+t.dataset.i;sel.has(i)?sel.delete(i):sel.add(i);s();}
        if(t.dataset.d==='rall'){const all=bols.every(x=>sel.has(x.i));bols.forEach(x=>all?sel.delete(x.i):sel.add(x.i));s();}});
      $('#rp-s',b).onclick=()=>{closeModal();toast(`Processo ${esc($('#rp-n',b).value)} registrado com ${plural(sel.size,'boleto','boletos')} (simulação).`);};}});
}
function extratoDrawer(u){
  const p=procsOf(u)[0];
  const box=openModal({drawer:true,title:'Emitir extrato de cobrança',sub:`${p?p.n:'Sem processo'} · ${u.ind}`,
    body:`<div class="grp"><span class="gt">Parâmetros de cálculo</span><div class="d-fld"><label for="ex-c">Data de cálculo <span class="rq">*</span></label><div class="d-inp lg"><input id="ex-c" type="date" value="2026-07-23"></div><span class="d-hint">Base para correção monetária e juros.</span></div><div class="d-g2"><div class="d-fld"><label for="ex-de">Período · De <span class="rq">*</span></label><div class="d-inp lg"><input id="ex-de" type="date"></div></div><div class="d-fld"><label for="ex-ate">Até <span class="rq">*</span></label><div class="d-inp lg"><input id="ex-ate" type="date"></div></div></div></div>
      <div class="grp"><span class="gt">Lançamentos jurídicos</span>${chk('ex1','Isentar correções de lançamentos jurídicos')}</div>
      <div class="grp"><span class="gt">Máscara de informações</span>${chk('ex2','Ocultar nome do condomínio')}${chk('ex3','Ocultar indicador de cobrança')}</div>
      <div class="grp"><span class="gt">Status do boleto ${note('extrato')}</span>${['Todos','Vencidos','A vencer'].map((l,i)=>`<button type="button" class="d-chk" role="radio" aria-checked="${!i}" data-rad="${l}"><span class="d-cb rad ${i?'':'on'}"></span>${l}</button>`).join('')}</div><div id="ex-ok"></div>`,
    foot:`<button type="button" class="d-btn sec" data-d="close">Cancelar</button><button type="button" class="d-btn pri" id="ex-g" disabled>Gerar</button>`,
    onMount(b){const s=()=>{$('#ex-g',b).disabled=!($('#ex-c',b).value&&$('#ex-de',b).value&&$('#ex-ate',b).value);};b.addEventListener('input',s);
      b.addEventListener('click',e=>{const t=e.target.closest('[data-rad],[data-chk]');if(!t)return; if(t.dataset.rad){$$('[data-rad]',b).forEach(x=>{const on=x===t;x.setAttribute('aria-checked',on);x.firstElementChild.className='d-cb rad'+(on?' on':'');});} if(t.dataset.chk){const on=t.getAttribute('aria-checked')!=='true';t.setAttribute('aria-checked',on);t.firstElementChild.className='d-cb'+(on?' on':'');t.firstElementChild.innerHTML=on?X('check',12,3):'';}});
      $('#ex-g',b).onclick=()=>{$('#ex-ok',b).innerHTML=`<div class="note" style="border-color:var(--success-200);background:var(--success-50);color:var(--success-700)">${X('okc',16)}<span><b>Extrato gerado.</b> Pronto para baixar ou enviar ao morador.</span></div><button type="button" class="d-btn pri" data-d="dl" style="justify-self:start">${X('dl',16)}Baixar extrato (PDF)</button>`;$('#ex-g',b).textContent='Gerar novamente';$('#ex-ok',b).scrollIntoView({block:'nearest'});};}});
  return box;
}
const chk=(id,l)=>`<button type="button" class="d-chk" role="checkbox" aria-checked="false" data-chk="${id}"><span class="d-cb"></span>${l}</button>`;
function histModal(k){
  const h=D.hist.find(x=>x.k===k);
  if(h.custom){ openModal({title:h.title,sub:`${h.who}, ${h.when}`,body:`<div class="d-ro"><b>Assunto</b><span>${esc(h.desc)}</span></div><div class="d-ro"><b>Mensagem</b><span>${esc(h.msg)||'—'}</span></div><div class="d-ro"><b>Telefone</b><span>${esc(h.tel)||'—'}</span></div>`}); return; }
  openModal({title:h.title,sub:`${h.who}, ${h.when}${h.tipo?' | '+h.desc:''}`,body:histBody(k,true)});
}
function histNewModal(){
  openModal({title:'Novo histórico',size:'sm',body:`<div class="d-fld"><label for="hn-a">Assunto</label><div class="d-inp lg"><input id="hn-a"></div></div><div class="d-fld"><label for="hn-m">Mensagem</label><div class="d-inp ta"><textarea id="hn-m" rows="4"></textarea></div></div><div class="d-fld"><label for="hn-t">Telefone</label><div class="d-inp lg">${X('phone',16)}<input id="hn-t" inputmode="tel" placeholder="(00) 0 0000-0000"></div></div>`,
    foot:`<button type="button" class="d-btn sec" data-d="close">Cancelar</button><span style="flex:1"></span><button type="button" class="d-btn pri" id="hn-s" disabled>Incluir</button>`,
    onMount(b){$('#hn-a',b).oninput=e=>{$('#hn-s',b).disabled=!e.target.value.trim();};
      $('#hn-s',b).onclick=()=>{const d=new Date(),hh=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
        D.hist.unshift({k:'n'+Date.now(),who:'Dr. Rafael Monteiro',when:HOJE+' - '+hh,desc:$('#hn-a',b).value.trim(),msg:$('#hn-m',b).value.trim(),tel:$('#hn-t',b).value.trim(),title:'Novo histórico de atividade da unidade',custom:true});
        closeModal(); upd('hlist'); toast('Registro incluído no histórico.');};}});
}
function procBolModal(u,i){
  const p=procsOf(u)[i], list=bolsOf(u).filter(b=>b.proc===p.n);
  openModal({title:'Boletos do processo',sub:`${p.n} · ${plural(list.length,'boleto','boletos')} ${note('verbol')}`,size:'xl',
    body:list.length?`<div class="d-card d-tw"><table class="d-t"><thead><tr><th>Referência</th><th>Vencimento (dias em atraso)</th><th>Valor</th><th>Multa</th><th>Juros</th><th>Correção</th><th>Encargo</th><th>Adicionais</th><th>Subtotal</th><th>Total</th><th>Data de pagamento</th><th>Valor pago</th><th>Status</th></tr></thead><tbody>${list.map(b=>`<tr><td><span class="ref">${b.ced?`<span class="ced">${X('ban',14)}</span>`:`<span class="z">${X('zap',14)}</span>`}${b.t}</span></td><td>${b.venc}${b.dias>0?`<span class="d-dd">${b.dias}D</span>`:''}</td><td>${b.valor}</td><td>${b.multa}</td><td>${b.juros}</td><td>${b.corr}</td><td>${b.enc}</td><td>${b.adic}</td><td class="b">${b.sub}</td><td class="b">${b.total}</td><td>${b.pag}</td><td style="${b.status==='Pago'?'color:var(--success)':''}">${b.pago}</td><td><span class="d-b ${SBADGE[b.status]}">${b.status}</span></td></tr>`).join('')}</tbody></table></div>`:emptyBox('Nenhum boleto neste processo','Os boletos vinculados ao processo aparecem aqui.')});
}
function logoutModal(){
  openModal({title:'Saindo do Portal Jurídico',sub:'Você será desconectado até que faça login novamente.',size:'sm',nob:true,body:'',
    foot:`<button type="button" class="d-btn sec lg" data-d="close" style="flex:1">Agora não</button><button type="button" class="d-btn danger lg" data-d="dologout" style="flex:1">Sair</button>`});
  const mb=$('.d-mod .mb'); if(mb) mb.remove();
}

/* ---------- 09.10 / 09.11 · novo vencimento e novo acordo ---------- */
const COMPS=[['j','Juros'],['c','Correção monetária'],['e','Encargos'],['m','Multa']];
function calcState(u){ const bs=bolsOf(u).filter(b=>D.bsel.has(b.i)); return {bs,desc:{j:{t:'R$',v:0},c:{t:'R$',v:0},e:{t:'R$',v:0},m:{t:'R$',v:0},tar:{t:'R$',v:0},acr:{t:'R$',v:0}},isTar:false,venc:'',parc:3,datas:{},opt1:true,opt2:false}; }
function calcTotals(C){
  const base=k=>C.bs.reduce((a,b)=>a+b.n[k],0), dval=(k,amt)=>{const d=C.desc[k];return Math.min(amt,d.t==='%'?amt*d.v/100:d.v);};
  const v=base('v'); let sub=v; COMPS.forEach(([k])=>{const a=base(k);sub+=a-dval(k,a);});
  const tar=C.isTar?0:3.98-dval('tar',3.98); const tot=Math.max(0,sub+tar);
  return {v,sub,tar,tot,base};
}
let CS=null;
function compRows(C,withLimit){const T=calcTotals(C);
  return COMPS.map(([k,l])=>`<div style="display:grid;gap:4px"><span class="d-lbl" style="font-size:13px">${l}</span><div class="d-comp"><div class="calc">${brl(T.base(k))}</div><span class="d-seg" role="group" aria-label="Tipo de desconto: ${l}"><button type="button" class="${C.desc[k].t==='R$'?'on':''}" data-seg="${k}" data-t="R$">R$</button><button type="button" class="${C.desc[k].t==='%'?'on':''}" data-seg="${k}" data-t="%">%</button></span><div class="d-inp"><input inputmode="decimal" data-desc="${k}" placeholder="0,00" aria-label="Desconto em ${l}" value="${C.desc[k].v?fmt2(C.desc[k].v):''}"></div></div>${withLimit?'<span class="d-hint" style="text-align:right;font-size:12px">Até R$ 500,00 sem aprovação</span>':''}</div>`).join('');}
function bolsMini(C){return `<div class="d-card d-tw"><table class="d-t"><thead><tr><th>Nosso número</th><th>Referência</th><th>Vencimento</th><th>Valor</th></tr></thead><tbody>${C.bs.map(b=>`<tr><td>000000000000000</td><td class="strong">${b.t}</td><td>${b.venc}${b.dias>0?`<span class="d-dd">${b.dias}D</span>`:''}</td><td>${b.valor}</td></tr>`).join('')}</tbody></table></div>`;}
function calcBind(el,after){
  el.addEventListener('click',e=>{const t=e.target.closest('[data-seg],[data-copt],[data-tar]');if(!t)return;
    if(t.dataset.seg){CS.desc[t.dataset.seg].t=t.dataset.t;after(true);} if(t.dataset.copt){CS[t.dataset.copt]=!CS[t.dataset.copt];after(true);} if(t.dataset.tar!=null){CS.isTar=!CS.isTar;after(true);} });
  el.addEventListener('input',e=>{const t=e.target; if(t.dataset.desc){CS.desc[t.dataset.desc].v=parseBRL(t.value)||0;after(false);} if(t.dataset.cv){CS.venc=t.value;after(false);} if(t.dataset.parc){CS.parc=Math.max(1,Math.min(24,+t.value.replace(/\D/g,'')||1));after(true);} if(t.dataset.pd){CS.datas[t.dataset.pd]=t.value;} });
}
const copt=(k,l)=>`<button type="button" class="d-chk" role="checkbox" aria-checked="${CS[k]}" data-copt="${k}"><span class="d-cb ${CS[k]?'on':''}">${CS[k]?X('check',12,3):''}</span>${l}</button>`;
V.novoVencimento={
  html:p=>{const u=unitById(p.id); if(!CS||CS.u!==u.id||CS.kind!=='nv'){CS=calcState(u);CS.u=u.id;CS.kind='nv';} const T=calcTotals(CS);
    return crumb([[X('home',18),'go','data-to="unidades"','Unidades'],['Unidades','go','data-to="unidades"'],[u.condo+' - '+unitTitle(u),'go',`data-to="unidade" data-id="${u.id}"`],['Novo vencimento']])+
    `<div class="d-ph"><div><h1>Novo vencimento</h1><p class="sub">Consolida os boletos selecionados em um único boleto com nova data. ${note('juridico')}</p></div><div class="d-tot" data-part="tot"><small>Total do novo boleto</small><b>${brl(T.tot)}</b></div></div>
    <div class="d-calc"><div style="display:grid;gap:20px;align-content:start"><div class="d-fld"><span class="d-lbl">Boletos selecionados</span>${bolsMini(CS)}</div>
      <div class="d-fld"><span class="d-lbl">Parâmetros de cálculo</span><div class="d-g3"><div class="d-fld"><label>Índice de correção</label><div class="d-inp lg dis"><input value="INPC - IBGE" disabled></div></div><div class="d-fld"><label for="nv-d">Vencimento (novo) <span class="rq">*</span></label><div class="d-inp lg"><input id="nv-d" type="date" data-cv="1" min="2026-07-23" value="${CS.venc}"></div></div><div class="d-fld"><label>Data de cálculo</label><div class="d-inp lg dis"><input value="${HOJE}" disabled></div></div></div></div>
      <div class="d-fld"><span class="d-lbl">Opções do boleto</span><div class="d-card" style="padding:14px;display:grid;gap:10px">${copt('opt1','Detalhar composição com dados dos boletos originais.')}${copt('opt2','Isentar correções de lançamentos jurídicos.')}</div></div></div>
    <div style="display:grid;gap:12px;align-content:start"><div><b style="font-weight:600;color:var(--text-2)">Ajustar valores e descontos</b><p class="d-hint">Alterações recalculam o total em tempo real.</p></div><div style="display:grid;gap:12px" data-part="comps">${compRows(CS)}</div>
      <div data-part="nvsum">${nvSum()}</div></div></div>
    <div class="d-bar"><button type="button" class="d-btn sec lg" data-d="go" data-to="unidade" data-id="${u.id}">Cancelar</button><button type="button" class="d-btn pri lg" data-d="nvgo" ${CS.venc?'':'disabled'}>Gerar boleto</button><span class="d-hint">${CS.venc?'':'Informe o novo vencimento para gerar o boleto.'}</span></div>`;},
  parts:{tot:()=>`<small>Total do novo boleto</small><b>${brl(calcTotals(CS).tot)}</b>`,nvsum:()=>nvSum(),comps:()=>compRows(CS)},
  mount(el,p){calcBind(el,full=>{if(full) render(true); else {upd('tot');upd('nvsum');const g=$('[data-d=nvgo]',el);g.disabled=!CS.venc;g.nextElementSibling.textContent=CS.venc?'':'Informe o novo vencimento para gerar o boleto.';}});}
};
function nvSum(){const T=calcTotals(CS);return `<div style="display:grid;gap:10px"><div class="d-sub"><span>Subtotal</span><span>${brl(T.sub)}</span></div><button type="button" class="d-chk" role="checkbox" aria-checked="${CS.isTar}" data-tar="1"><span class="d-cb ${CS.isTar?'on':''}">${CS.isTar?X('check',12,3):''}</span>Isentar tarifa bancária</button>
  <div style="display:grid;gap:4px"><span class="d-lbl" style="font-size:13px">Tarifa bancária</span><div class="d-comp"><div class="calc">${CS.isTar?'R$ 0,00':'R$ 3,98'}</div><span></span><span></span></div></div><div style="display:grid;gap:4px"><span class="d-lbl" style="font-size:13px">Acréscimos</span><div class="d-comp"><div class="calc">R$ 0,00</div><span></span><span></span></div></div></div>`;}
V.novoAcordo={
  html:p=>{const u=unitById(p.id); if(!CS||CS.u!==u.id||CS.kind!=='na'){CS=calcState(u);CS.u=u.id;CS.kind='na';} const T=calcTotals(CS);
    return crumb([[X('home',18),'go','data-to="unidades"','Unidades'],['Unidades','go','data-to="unidades"'],[u.condo+' - '+unitTitle(u),'go',`data-to="unidade" data-id="${u.id}"`],['Novo acordo']])+
    `<div class="d-ph"><div><h1>Acordo jurídico</h1><p class="sub">Consolidação e parcelamento dos boletos selecionados. ${note('juridico')}</p></div><div class="acts"><div class="d-tot ok"><small>Crédito disponível</small><b>R$ 0,00</b></div><div class="d-tot" data-part="tot"><small>Total do acordo</small><b>${brl(T.tot)}</b></div></div></div><div class="d-hr"></div>
    <div class="d-ac3"><div style="display:grid;gap:12px"><div class="d-box"><div class="bt">Boletos selecionados<small>${plural(CS.bs.length,'boleto','boletos')} · ${brl(T.v)} em principal</small></div>${bolsMini(CS)}</div><div class="d-box"><div class="bt">Detalhes do boleto</div><div class="bb">${copt('opt1','Detalhar composição com dados dos boletos originais.')}${copt('opt2','Isentar correções de lançamentos jurídicos.')}</div></div></div>
    <div class="d-box"><div class="bt">Ajustar valores e descontos<small>Alterações recalculam o total e as parcelas em tempo real.</small></div><div class="bb"><div data-part="comps" style="display:grid;gap:12px">${compRows(CS,true)}</div><div data-part="nasum">${naSum()}</div></div></div>
    <div class="d-box"><div class="bt">Parcelamento</div><div class="bb"><div class="d-fld"><label>Data de cálculo</label><div class="d-inp lg dis"><input value="${HOJE}" disabled></div></div><div class="d-fld"><label for="na-p">Número de parcelas</label><div class="d-inp lg"><input id="na-p" inputmode="numeric" data-parc="1" value="${CS.parc}"></div></div><div class="d-fld"><label>Entrada mínima</label><div class="d-inp lg dis"><input value="R$ 10,00" disabled></div></div><div data-part="parcs" style="display:grid;gap:8px">${parcs()}</div></div></div></div>
    <div class="d-bar"><button type="button" class="d-btn sec lg" data-d="go" data-to="unidade" data-id="${u.id}">Cancelar</button><button type="button" class="d-btn pri lg" data-d="nago">${X('check',16,2.4)}Gerar simulação</button><span class="sp"></span><span class="d-hint">"Gerar simulação" não confirma o acordo: uma etapa de revisão será exibida antes de efetivar. ${note('revisao')}</span></div>`;},
  parts:{tot:()=>`<small>Total do acordo</small><b>${brl(calcTotals(CS).tot)}</b>`,nasum:()=>naSum(),parcs:()=>parcs(),comps:()=>compRows(CS,true)},
  mount(el){calcBind(el,full=>{if(full){const k=document.activeElement&&document.activeElement.dataset.parc;render(true);if(k){const i=$('[data-parc]',root);i.focus();i.setSelectionRange(i.value.length,i.value.length);}} else {upd('tot');upd('nasum');upd('parcs');}});}
};
function naSum(){const T=calcTotals(CS);return `<div style="display:grid;gap:10px;margin-top:4px"><div class="d-sub"><span>Subtotal</span><span>${brl(T.sub)}</span></div><div class="d-sub ok"><span>Crédito utilizado</span><span>R$ 0,00</span></div><button type="button" class="d-chk" role="checkbox" aria-checked="${CS.isTar}" data-tar="1"><span class="d-cb ${CS.isTar?'on':''}">${CS.isTar?X('check',12,3):''}</span>Isentar tarifa bancária</button><div class="d-sub" style="background:var(--bg-2);color:var(--text-2)"><span>Tarifa bancária</span><span>${CS.isTar?'R$ 0,00':'R$ 3,98'}</span></div></div>`;}
function parcs(){const T=calcTotals(CS),n=CS.parc,cents=Math.round(T.tot*100),base=Math.floor(cents/n),rest=cents-base*n;
  return Array.from({length:n},(_,i)=>{const v=(base+(i<rest?1:0))/100;return `<div class="d-parc"><span class="d-lbl" style="font-size:12px">Parcela ${i+1}</span><div class="pr"><div class="d-fld"><label for="pd${i}" style="font-size:12px">Vencimento</label><div class="d-inp"><input id="pd${i}" type="date" data-pd="${i}" value="${CS.datas[i]||''}"></div></div><div class="d-fld"><label style="font-size:12px">Valor</label><div class="d-inp dis"><input value="${fmt2(v)}" disabled aria-label="Valor da parcela ${i+1}"></div></div></div></div>`;}).join('');}
