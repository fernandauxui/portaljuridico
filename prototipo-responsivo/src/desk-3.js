/* ---------- filtros genéricos (pop-over com Limpar e Aplicar) ---------- */
const hasRange=m=>m&&(m.preset!=null||m.min!=null||m.max!=null);
function rangeLabel(m,def,unit){ // unit: ['mês','meses'] / ['dia','dias']
  if(m.preset!=null) return m.preset+'+ '+(m.preset===1?unit[0]:unit[1]);
  if(m.min!=null&&m.max!=null) return `${m.min} a ${m.max} ${unit[1]}`;
  if(m.min!=null) return 'A partir de '+plural(m.min,unit[0],unit[1]);
  if(m.max!=null) return 'Até '+plural(m.max,unit[0],unit[1]);
  return def;
}
function moneyLabel(v,def){ if(v.min!=null&&v.max!=null) return `${brl(v.min)} – ${brl(v.max)}`; if(v.min!=null) return 'A partir de '+brl(v.min); if(v.max!=null) return 'Até '+brl(v.max); return def; }
const listLabel=(a,def,map)=>a.length?(map?map[a[0]]:a[0])+(a.length>1?' +'+(a.length-1):''):def;
function popFoot(){return `<div class="pf"><button type="button" class="d-btn sec sm" data-p="clear">Limpar</button><button type="button" class="d-btn pri sm" data-p="apply">Aplicar</button></div>`;}

function rangePop(a,{title,presets,unit,hint,cur,onApply}){
  let d=clone(cur);
  const s=openPop(a,`<div class="pt">${title}</div><div class="pb"><div style="display:grid;gap:8px"><span class="d-lbl">Atalhos (${unit[1]} em atraso)</span><div class="presets">${presets.map(n=>`<button type="button" class="d-pill" data-v="${n}">${n}+ ${n===1?unit[0]:unit[1]}</button>`).join('')}</div></div>
    <div style="display:grid;gap:8px"><span class="d-lbl">Personalizar intervalo</span><div class="d-g2" style="gap:10px"><div class="d-fld"><label for="r-min">A partir de</label><div class="d-inp"><input id="r-min" inputmode="numeric" placeholder="0"></div></div><div class="d-fld"><label for="r-max">Até</label><div class="d-inp"><input id="r-max" inputmode="numeric" placeholder="0"></div></div></div><span class="d-hint" id="r-h">${hint}</span></div></div>${popFoot()}`,{width:340});
  if(!s) return; const mn=$('#r-min',s),mx=$('#r-max',s),ap=$('[data-p=apply]',s),cl=$('[data-p=clear]',s);
  if(d.min!=null) mn.value=d.min; if(d.max!=null) mx.value=d.max;
  const sync=()=>{ $$('.d-pill',s).forEach(b=>b.classList.toggle('on',d.preset===+b.dataset.v)); const ok=!(d.min!=null&&d.max!=null&&d.min>d.max);
    $$('.d-inp',s).forEach(i=>i.classList.toggle('err',!ok)); const h=$('#r-h',s); h.classList.toggle('err',!ok); h.textContent=ok?hint:'O valor "a partir de" não pode ser maior que "até".';
    ap.disabled=!ok||(!hasRange(d)&&!hasRange(cur)); cl.disabled=!hasRange(d); };
  const inp=()=>{mn.value=mn.value.replace(/\D/g,'');mx.value=mx.value.replace(/\D/g,'');d={preset:null,min:mn.value===''?null:+mn.value,max:mx.value===''?null:+mx.value};sync();};
  mn.oninput=inp; mx.oninput=inp;
  s.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.v){const n=+b.dataset.v;d={preset:d.preset===n?null:n,min:null,max:null};mn.value='';mx.value='';sync();}
    if(b.dataset.p==='clear'){d={preset:null,min:null,max:null};mn.value='';mx.value='';sync();}
    if(b.dataset.p==='apply'){closePop();onApply(d);} });
  sync();
}
function moneyPop(a,{title,cur,onApply,extra=''}){
  let d=clone(cur); const f=n=>n==null?'':fmt2(n);
  const s=openPop(a,`<div class="pt">${title} ${extra}</div><div class="pb"><div class="d-g2" style="gap:10px"><div class="d-fld"><label for="m-min">A partir de</label><div class="d-inp"><span class="lead">R$</span><input id="m-min" inputmode="decimal" placeholder="0,00"></div></div><div class="d-fld"><label for="m-max">Até</label><div class="d-inp"><span class="lead">R$</span><input id="m-max" inputmode="decimal" placeholder="0,00"></div></div></div><span class="d-hint" id="m-h">O valor "a partir de" deve ser menor ou igual ao valor "até".</span></div>${popFoot()}`,{width:340});
  if(!s) return; const mn=$('#m-min',s),mx=$('#m-max',s),ap=$('[data-p=apply]',s),cl=$('[data-p=clear]',s);
  mn.value=f(d.min); mx.value=f(d.max);
  const sync=()=>{const ok=!(d.min!=null&&d.max!=null&&d.min>d.max); $$('.d-inp',s).forEach(i=>i.classList.toggle('err',!ok)); const h=$('#m-h',s); h.classList.toggle('err',!ok); h.textContent=ok?'O valor "a partir de" deve ser menor ou igual ao valor "até".':'O valor "a partir de" não pode ser maior que "até".'; ap.disabled=!ok||(d.min==null&&d.max==null&&cur.min==null&&cur.max==null); cl.disabled=d.min==null&&d.max==null;};
  const inp=()=>{d={min:parseBRL(mn.value),max:parseBRL(mx.value)};sync();}; mn.oninput=inp; mx.oninput=inp;
  [mn,mx].forEach(i=>i.onblur=()=>{i.value=f(parseBRL(i.value));});
  s.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.p==='clear'){d={min:null,max:null};mn.value='';mx.value='';sync();}
    if(b.dataset.p==='apply'){closePop();onApply(d);} });
  sync();
}
function checkPop(a,{title,opts,cur,onApply,width=300}){
  let d=cur.slice();
  const s=openPop(a,`<div class="pt">${title}</div><div class="pb" id="cp-o" style="gap:4px"></div>${popFoot()}`,{width});
  if(!s) return; const ap=$('[data-p=apply]',s),cl=$('[data-p=clear]',s);
  const sync=()=>{ $('#cp-o',s).innerHTML=opts.map(([v,l])=>{const on=d.includes(v);return `<button type="button" class="opt" role="checkbox" aria-checked="${on}" data-v="${esc(v)}"><span class="d-cb ${on?'on':''}">${on?X('check',12,3):''}</span><span>${l}</span></button>`;}).join('');
    ap.disabled=!d.length&&!cur.length; cl.disabled=!d.length; };
  s.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.v!=null){const v=b.dataset.v;d=d.includes(v)?d.filter(x=>x!==v):d.concat(v);d=opts.map(o=>o[0]).filter(x=>d.includes(x));sync();}
    if(b.dataset.p==='clear'){d=[];sync();}
    if(b.dataset.p==='apply'){closePop();onApply(d);} });
  sync();
}
function filterBtn(id,label,on,extra=''){return `<button type="button" class="d-btn sm ${on?'act':'sec'}" data-d="flt" data-f="${id}" aria-haspopup="dialog" aria-expanded="false">${label}${X('cd',16,2)}</button>${extra}`;}
function emptyBox(t,p,btn){return `<div class="d-empty"><div class="ring">${X('search',22)}</div><div style="display:grid;gap:4px"><h3>${t}</h3><p>${p}</p></div>${btn||''}</div>`;}
const cb=(on,attrs,dis)=>`<button type="button" class="d-chk" role="checkbox" aria-checked="${on}" ${attrs} ${dis?'disabled':''} aria-label="Selecionar"><span class="d-cb ${on?'on':''} ${dis?'dis':''}">${on?X('check',12,3):''}</span></button>`;
const cbAll=(n,tot,act)=>{const on=tot>0&&n===tot,ind=n>0&&!on;return `<button type="button" class="d-chk" role="checkbox" aria-checked="${on?'true':ind?'mixed':'false'}" data-d="${act}" aria-label="Selecionar todas as linhas desta lista"><span class="d-cb ${on||ind?'on':''}">${on?X('check',12,3):ind?X('minus',12,3):''}</span></button>`;};
const thS=(l,k,s,act)=>`<th class="sort ${s.k===k?'sorted':''}" data-d="${act}" data-k="${k}" aria-sort="${s.k===k?(s.dir>0?'ascending':'descending'):'none'}">${l}<span class="ar">${X(s.k===k&&s.dir<0?'arrowdown':'arrowup',12,2)}</span></th>`;

/* ---------- unidades: dados filtrados ---------- */
function matchU(u,F,q){
  if(q){const t=[u.condo,u.bloco,u.un,u.ind,u.id,u.cnpj,u.doc].concat(u.procs).join(' ').toLowerCase(); if(!t.includes(q.toLowerCase())) return false;}
  const m=F.meses; if(m.preset!=null&&u.meses<m.preset) return false; if(m.min!=null&&u.meses<m.min) return false; if(m.max!=null&&u.meses>m.max) return false;
  const v=F.valor; if(v.min!=null||v.max!=null){ if(u.valor==null) return false; if(v.min!=null&&u.valor<v.min) return false; if(v.max!=null&&u.valor>v.max) return false; }
  if(F.proc.length&&!F.proc.some(x=>(x==='com'&&u.procs.length>0)||(x==='sem'&&!u.procs.length)||(x==='outro'&&u.outro))) return false;
  if(F.advs.length&&!F.advs.some(a=>u.advs.includes(a))) return false;
  return true;
}
const anyUF=F=>hasRange(F.meses)||F.valor.min!=null||F.valor.max!=null||F.proc.length||F.advs.length;
const dnum=s=>{const [d,m,y]=s.split('/').map(Number);return y*10000+m*100+d;};
function unitsList(base,F,q,sort){
  const r=base.filter(u=>matchU(u,F,q));
  if(sort&&sort.k){const k=sort.k;r.sort((a,b)=>{let x,y;if(k==='condo'){x=a.condo;y=b.condo;return x.localeCompare(y,'pt-BR')*sort.dir;} if(k==='rec'){x=dnum(a.rec);y=dnum(b.rec);} if(k==='valor'){x=a.valor||0;y=b.valor||0;} if(k==='meses'){x=a.meses;y=b.meses;} return (x-y)*sort.dir;});}
  return r;
}
const PROC_L={sem:'Sem processo',com:'Com processo',outro:'Não pertence ao escritório'};
function unitFilterBar(scope){
  const F=scope==='u'?D.uf:D.cuf;
  return `<div class="d-inp"><span>${X('search',18)}</span><input type="search" data-d-in="${scope}q" placeholder="${scope==='u'?'Buscar unidade, condomínio ou nome':'Buscar unidade ou nome'}" aria-label="Buscar unidade" value="${esc(scope==='u'?D.uq:D.cuq)}"></div>
  ${filterBtn(scope+'-meses',rangeLabel(F.meses,'Meses de inadimplência',['mês','meses']),hasRange(F.meses))}
  ${filterBtn(scope+'-valor',moneyLabel(F.valor,'Débito da unidade'),F.valor.min!=null||F.valor.max!=null)} ${note('valor')}
  <span class="sp"></span>
  ${filterBtn(scope+'-proc',listLabel(F.proc,'Processo',PROC_L),F.proc.length>0)}
  ${filterBtn(scope+'-adv',listLabel(F.advs,'Advogado'),F.advs.length>0)}`;
}
function openUnitFilter(a,id){
  const scope=id.split('-')[0], k=id.split('-')[1], F=scope==='u'?D.uf:D.cuf;
  const done=()=>{ if(scope==='u') D.usel.clear(); else D.cusel.clear(); render(true); };
  if(k==='meses') rangePop(a,{title:'Meses de inadimplência',presets:[1,3,6,12],unit:['mês','meses'],hint:'Em meses de atraso.',cur:F.meses,onApply:d=>{F.meses=d;done();}});
  if(k==='valor') moneyPop(a,{title:'Débito da unidade',cur:F.valor,onApply:d=>{F.valor=d;done();}});
  if(k==='proc') checkPop(a,{title:'Processo',opts:[['sem','Sem processo'],['com','Com processo'],['outro','Não pertence ao escritório']],cur:F.proc,onApply:d=>{F.proc=d;done();}});
  if(k==='adv') checkPop(a,{title:'Advogado',opts:ADVS_D.map(x=>[x,x]),cur:F.advs,onApply:d=>{F.advs=d;done();}});
}
function unitRows(list,scope){
  const sel=scope==='u'?D.usel:D.cusel, full=scope==='u';
  return list.map(u=>{const on=sel.has(u.id);
    const pr=u.procs.length>1?`<div class="two"><span class="d-chip" style="justify-self:start">${plural(u.procs.length,'processo','processos')}</span><span class="trunc">${u.procs.join(', ')}</span></div>`:u.procs.length?`<span class="lnk trunc">${u.procs[0]}</span>`:'—';
    return `<tr class="click ${on?'sel':''}" data-d="openunit" data-id="${u.id}">
      <td class="cbc">${cb(on,`data-d="usel" data-s="${scope}" data-id="${u.id}"`)}</td>
      ${full?`<td>${u.id}</td><td>${u.cnpj}</td><td class="strong" style="font-size:15px">${u.condo}</td>`:''}
      <td>${u.bloco}</td><td>${u.un}</td>
      <td><div class="two"><b class="trunc w2">${u.ind}</b><span>${u.doc}</span></div></td>
      <td>${pr}</td><td><span class="trunc">${u.advs.join(', ')}</span></td>
      <td>${u.procs.length?'<span class="d-b ok">Processo ativo</span>':'<span class="d-b warn">Sem processo</span>'}</td>
      <td>${u.rec}</td><td class="b">${u.procs.length?brl(u.valor)+' ('+u.procs.length+')':'—'}</td>
      <td><span class="d-b err sq">${plural(u.meses,'mês','meses')}</span></td>
      <td style="color:var(--text-4)">${X('cr',16)}</td></tr>`;}).join('');
}
function unitTable(scope,base){
  const F=scope==='u'?D.uf:D.cuf, q=scope==='u'?D.uq:D.cuq, sort=D.usort, sel=scope==='u'?D.usel:D.cusel;
  const list=unitsList(base,F,q,sort), any=anyUF(F)||q, full=scope==='u';
  const ids=list.map(u=>u.id), n=ids.filter(i=>sel.has(i)).length;
  if(!list.length) return `<div class="d-res"><b>0 unidades</b>${any?`<button type="button" class="d-link" data-d="uclear" data-s="${scope}">Limpar filtros</button>`:''}</div>`+emptyBox('Nenhuma unidade encontrada','Altere os filtros selecionados e tente novamente.',`<button type="button" class="d-btn sec" data-d="uclear" data-s="${scope}">Limpar filtros</button>`);
  return `<div class="d-res"><b>${plural(list.length,'unidade','unidades')}</b>${sel.size?`<span>${plural(sel.size,'selecionada','selecionadas')}</span>`:''}${any?`<button type="button" class="d-link" data-d="uclear" data-s="${scope}">Limpar filtros</button>`:''}<span style="flex:1"></span>${note('ordenar')}</div>
  <div class="d-tw"><table class="d-t"><thead><tr><th class="cbc">${cbAll(n,ids.length,'uall" data-s="'+scope)}</th>
  ${full?`<th>ID</th><th>CNPJ</th>${thS('Condomínio','condo',sort,'usort')}`:''}<th>Bloco</th><th>Unidade</th><th>Indicador de cobrança</th><th>Processo(s)</th><th>Advogado</th><th>Status</th>
  ${thS('Unidade recebida em','rec',sort,'usort')}${thS('Valor da ação','valor',sort,'usort')}${thS('Meses de inadimplência','meses',sort,'usort')}<th aria-label="Abrir"></th></tr></thead>
  <tbody>${unitRows(list,scope)}</tbody></table></div>`;
}

/* ---------- planilha ---------- */
function planilhaModal(kind,sel,total,onDone){
  let fmt='csv', inc=sel>0?'sel':'all'; const nome=kind==='u'?['unidade','unidades']:['condomínio','condomínios'];
  const opt=(v,l,dis)=>`<button type="button" class="opt d-inp lg" data-inc="${v}" ${dis?'disabled':''} style="justify-content:flex-start;gap:10px;${dis?'opacity:.5;cursor:not-allowed':''}"><span class="d-cb rad ${inc===v?'on':''}"></span>${l}</button>`;
  const box=openModal({title:'Gerar planilha',sub:`Escolha o formato e quais ${nome[1]} incluir no arquivo.`,size:'sm',nob:true,
    body:`<div class="d-fld"><span class="d-lbl">Formato do arquivo</span><div class="d-g2" style="gap:8px" id="pf"></div></div><div class="d-fld"><span class="d-lbl">${kind==='u'?'Unidades incluídas':'Condomínios incluídos'}</span><div style="display:grid;gap:8px" id="pi"></div></div>`,
    foot:`<button type="button" class="d-btn sec lg" data-d="close" style="flex:1">Cancelar</button><button type="button" class="d-btn pri lg" id="pg" style="flex:1">Gerar planilha</button>`,
    onMount(b){
      const sync=()=>{ $('#pf',b).innerHTML=[['csv','Excel (CSV)'],['pdf','PDF']].map(([v,l])=>`<button type="button" class="d-btn lg ${fmt===v?'sec on':'sec'}" data-fmt="${v}">${l}</button>`).join('');
        $('#pi',b).innerHTML=opt('sel',`${kind==='u'?'Unidades selecionadas':'Condomínios selecionados'} (${sel})`,sel===0)+opt('all',`Todos ${kind==='u'?'as unidades':'os condomínios'} (${total})`.replace('Todos as','Todas as')); };
      b.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return; if(t.dataset.fmt){fmt=t.dataset.fmt;sync();} if(t.dataset.inc&&!t.disabled){inc=t.dataset.inc;sync();}});
      $('#pg',b).onclick=()=>{closeModal(); const n=inc==='sel'?sel:total; toast(`Planilha ${fmt==='csv'?'Excel (CSV)':'PDF'} gerada com ${plural(n,nome[0],nome[1])}.`); onDone&&onDone();};
      sync(); }
  });
}
