/* ---------- infraestrutura de interface ---------- */
let popEl=null, popAnchor=null, ovEl=null, toastEl=null, toastT=null;
function closePop(){ if(popEl){popEl.remove();popEl=null;} if(popAnchor){popAnchor.classList.remove('on');popAnchor.setAttribute('aria-expanded','false');popAnchor=null;} }
function openPop(anchor,html,{cls='',onMount,align='left',width}={}){
  const same=popAnchor===anchor; closePop(); if(same) return null;
  popEl=document.createElement('div'); popEl.className='d-pop '+cls; popEl.setAttribute('role','dialog'); popEl.innerHTML=html;
  if(width) popEl.style.width=width+'px';
  document.body.appendChild(popEl);
  const r=anchor.getBoundingClientRect(), pw=popEl.offsetWidth;
  let left=align==='right'?r.right-pw:r.left; left=Math.max(8,Math.min(left,window.innerWidth-pw-8));
  let top=r.bottom+6; const ph=popEl.offsetHeight; if(top+ph>window.innerHeight-8&&r.top-ph-6>8) top=r.top-ph-6;
  popEl.style.left=(left+window.scrollX)+'px'; popEl.style.top=(top+window.scrollY)+'px';
  popAnchor=anchor; if(anchor.classList.contains('d-btn')) anchor.classList.add('on'); anchor.setAttribute('aria-expanded','true');
  if(onMount) onMount(popEl);
  const f=popEl.querySelector('input,button'); if(f&&cls.indexOf('nofocus')<0) setTimeout(()=>{try{f.focus({preventScroll:true});}catch(e){}},0);
  return popEl;
}
document.addEventListener('mousedown',e=>{ if(!popEl) return; if(popEl.contains(e.target)||(popAnchor&&popAnchor.contains(e.target))) return; closePop(); },true);
window.addEventListener('resize',closePop); window.addEventListener('scroll',()=>{ if(popEl&&!popEl.classList.contains('stay')) closePop(); },true);

function openModal({title,sub='',body,foot='',size='',cls='',onMount,drawer=false,nob=false}){
  closeModal(); closePop();
  ovEl=document.createElement('div'); ovEl.className='d-ovl'+(drawer?' drw':''); ovEl.dataset.d='ovl';
  const head=`<div class="mh ${nob?'nob':''}"><div class="tt"><h3 id="d-mt">${title}</h3>${sub?`<p>${sub}</p>`:''}</div><button type="button" class="d-ibtn plain" data-d="close" aria-label="Fechar">${X('x',20)}</button></div>`;
  ovEl.innerHTML=`<div class="${drawer?'d-drw':'d-mod '+size} ${cls}" role="dialog" aria-modal="true" aria-labelledby="d-mt">${head}<div class="mb">${body}</div>${foot?`<div class="mf">${foot}</div>`:''}</div>`;
  document.body.appendChild(ovEl);
  const box=ovEl.firstElementChild;
  if(onMount) onMount(box);
  setTimeout(()=>{const f=box.querySelector('.mb input:not([disabled]),.mb select'); if(f) f.focus({preventScroll:true}); else box.querySelector('[data-d=close]').focus({preventScroll:true});},0);
  return box;
}
function closeModal(){ if(ovEl){ovEl.remove();ovEl=null;} }
function toast(msg){
  if(toastEl) toastEl.remove(); clearTimeout(toastT);
  toastEl=document.createElement('div'); toastEl.className='d-toast'; toastEl.setAttribute('role','status');
  toastEl.innerHTML=`<span class="ok">${X('okc',20)}</span><span class="msg">${msg}</span><button type="button" class="d-ibtn plain" aria-label="Fechar aviso">${X('x',16)}</button>`;
  toastEl.querySelector('button').onclick=()=>{toastEl.remove();toastEl=null;};
  document.body.appendChild(toastEl); toastT=setTimeout(()=>{if(toastEl){toastEl.remove();toastEl=null;}},3600);
}
function noteFor(k,anchor){
  const [t,txt]=NOTES[k];
  openPop(anchor,`<div class="pt">${X('info',14,2)}Ponto em aberto · ${t}</div><div class="pb">${txt}</div>`,{cls:'d-notepop nofocus',width:320});
}

/* ---------- navegação ---------- */
function nav(n,p={}){ closePop(); closeModal(); D.r={n,p}; render(); window.scrollTo(0,0); }
const AUTH=['login','criarSenha','esqueci','codigoEnviado','digitarCodigo','novaSenha','senhaOk','doisFatores'];
function render(keep){
  const y=window.scrollY; closePop();
  const v=V[D.r.n]; if(!v){D.r={n:'condominios',p:{}};return render();}
  root.innerHTML=AUTH.includes(D.r.n)?authShell(v.html(D.r.p)):appShell(v.html(D.r.p));
  if(v.mount) v.mount(root,D.r.p);
  if(keep) window.scrollTo(0,y);
}
function upd(part){ const el=$(`[data-part="${part}"]`,root); const v=V[D.r.n]; if(el&&v.parts&&v.parts[part]){el.innerHTML=v.parts[part](D.r.p);} }

/* ---------- casca do app ---------- */
const MENU=[['condominios','condo','Condomínios'],['unidades','home','Unidades'],['historico','archive','Histórico processual'],['relatorio','bars','Relatório de inadimplência']];
const SECTION={condominios:'condominios',condominio:'condominios',relatorioCondo:'condominios',unidades:'unidades',unidade:'unidades',novoVencimento:'unidades',novoAcordo:'unidades',historico:'historico',processo:'historico',relatorio:'relatorio',perfil:'perfil',suporte:'suporte'};
function appShell(main){
  const cur=SECTION[D.r.n];
  const it=(id,icn,l)=>`<button type="button" class="d-nav ${cur===id?'on':''}" data-d="go" data-to="${id}" title="${l}" ${cur===id?'aria-current="page"':''}>${X(icn,18)}<span>${l}</span></button>`;
  return `<div class="d-app"><aside class="d-side ${D.side?'':'mini'}" aria-label="Menu principal">
    <div class="d-logo">${D.side?LOGO('logo'):`<svg viewBox="0 0 43 25" role="img" aria-label="LLZ">${LOGO().match(/<path fill[^>]+>/g).slice(0,3).join('')}</svg>`}</div>
    <nav>${MENU.map(m=>it(...m)).join('')}</nav><div class="d-grow"></div>
    <nav style="padding-bottom:12px">${it('perfil','user','Meu perfil')}${it('suporte','chat','Suporte')}</nav>
    <div class="d-foot"><button type="button" class="d-nav" data-d="proto" title="Sobre o protótipo" style="height:36px" aria-haspopup="dialog">${X('info',16)}<span>Sobre o protótipo</span></button><button type="button" class="d-nav" data-d="side" title="${D.side?'Recolher menu':'Expandir menu'}" style="height:36px">${D.side?X('dbl',16):`<span style="display:inline-grid;transform:rotate(180deg)">${X('dbl',16)}</span>`}<span>${D.side?'Recolher menu':'Expandir menu'}</span></button>
    <div class="d-acct"><span class="d-av">RM</span><span class="who"><b>Dr. Rafael Monteiro</b><span>Monteiro &amp; Associados</span></span><button type="button" class="d-ibtn plain" data-d="acct" aria-label="Opções da conta" aria-haspopup="menu" aria-expanded="false">${X('updown',16)}</button></div>
    ${D.side?'':`<button type="button" class="d-nav" data-d="acct" title="Opções da conta" style="justify-content:center"><span class="d-av" style="width:28px;height:28px">RM</span></button>`}</div></aside>
    <main class="d-main" id="d-main"><div class="d-wrap">${main}</div></main></div>`;
}
function protoBtn(){return `<div class="d-proto"><button type="button" data-d="proto" aria-haspopup="dialog">${X('info',14,2)}Protótipo · dados fictícios</button></div>`;}
function protoPanel(a){
  const sc=[['nome@escritorio.com.br','Senha Teste@123 entra no Portal.'],['primeiro@escritorio.com.br','Primeiro acesso: pede para criar a senha.'],['2fa@escritorio.com.br','Pede o código de autenticação em duas etapas.'],['bloqueado@escritorio.com.br','Conta bloqueada.'],['inativo@escritorio.com.br','Acesso indisponível.'],['Outra senha','E-mail ou senha incorretos.']];
  const jumps=SHELL.logged?[['condominios','Condomínios'],['unidades','Unidades'],['unidade','Detalhe da unidade'],['historico','Histórico processual'],['relatorio','Relatório'],['perfil','Meu perfil'],['suporte','Suporte']]:[['login','Login']];
  openPop(a,`<div class="pt">Protótipo do Portal Jurídico</div><div class="pb d-ppanel">
    <p class="d-hint">Acima de 1024 px mostra o desktop com todas as ações. Abaixo disso, ou no celular, mostra só o fluxo mobile de consulta. Redimensione a janela para trocar.</p>
    <div><h4>Ir para</h4><div class="jmp">${jumps.map(([k,l])=>`<button type="button" class="d-pill" data-d="pjump" data-to="${k}">${l}</button>`).join('')}</div></div>
    <div><h4>Cenários de login</h4><ul>${sc.map(([c,t])=>`<li><code>${c}</code> ${t}</li>`).join('')}</ul></div>
    <div><h4>Pontos em aberto</h4><ul>${Object.keys(NOTES).filter(k=>k!=='juridico').map(k=>`<li><b>${NOTES[k][0]}.</b> ${NOTES[k][1]}</li>`).join('')}
      <li><b>Inconsistências do desktop original corrigidas só aqui.</b> O modal de documentos (09.12) mostrava o condomínio errado; todos os boletos tinham a mesma data (16/01/2025 · 553D); a tabela da 09.15 passava da largura da página. Ajustar no Figma.</li></ul></div>
    <div class="warn"><b>Cobrança e boletos:</b> ${NOTES.juridico[1]} Nenhum dado deste protótipo é real.</div></div>`,{cls:'stay',width:400});
}

/* ---------- casca de acesso ---------- */
function authShell(box){return `<div class="d-auth"><div class="img" role="img" aria-label="Escritório com vista para a cidade"></div><div class="side"><div class="box">${LOGO('logo')}${box}</div></div></div>${protoBtn()}`;}
const pwF=(id,l,err,hint='')=>`<div class="d-fld"><label for="${id}">${l}</label><div class="d-inp lg ${err?'err':''}" id="${id}w"><input id="${id}" type="password" autocomplete="new-password" placeholder="••••••••"><button type="button" class="d-ibtn plain" data-d="eye" aria-label="Mostrar senha" style="width:24px;height:24px">${X('eyeoff',16)}</button></div>${hint}</div>`;
const reqL=v=>{const R=[[v.length>=8,'Mínimo 8 caracteres'],[/[A-Z]/.test(v),'Letra maiúscula'],[/[a-z]/.test(v),'Letra minúscula'],[/\d/.test(v),'Número'],[/[^A-Za-z0-9]/.test(v),'Caractere especial (!@#$...)']];return {ok:R.every(r=>r[0]),html:`<div class="req">${R.map(([o,l])=>`<div><span class="${o?'ok':'no'}">${X(o?'okc':'xc',16)}</span>${l}</div>`).join('')}</div>`};};
function newPw({title,sub,cta,back,next}){return {
  html:()=>`<div class="hd"><h2>${title}</h2><p>${sub}</p></div>${pwF('np1','Nova senha',false,'<div id="np-req"></div>')}${pwF('np2','Confirmar nova senha',false,'<span class="d-hint err" id="np-err" hidden>As senhas não coincidem</span>')}<button type="button" class="d-btn pri lg" id="np-save" disabled>${cta}</button>${back?`<button type="button" class="d-link gray" data-d="go" data-to="login" style="justify-self:start">${X('cl',16)}Voltar para o login</button>`:''}`,
  mount(el){const a=$('#np1',el),b=$('#np2',el),s=$('#np-save',el);const sync=()=>{const r=reqL(a.value);$('#np-req',el).innerHTML=a.value?r.html:'';const mis=b.value&&b.value!==a.value;$('#np-err',el).hidden=!mis;$('#np2w',el).classList.toggle('err',!!mis);s.disabled=!(r.ok&&b.value===a.value);};a.oninput=sync;b.oninput=sync;s.onclick=next;}
};}
function codeScr({title,sub,icon,backTo,expire,after}){return {
  html:()=>`<div class="hd ctr"><span class="fi brand" style="width:48px;height:48px;margin-bottom:8px">${X(icon,24)}</span><h2>${title}</h2><p>${typeof sub==='function'?sub():sub}</p></div>
  <div class="code" id="code">${Array.from({length:6},(_,i)=>`<input inputmode="numeric" maxlength="1" placeholder="0" aria-label="Dígito ${i+1}">`).join('')}</div>${expire?`<p class="d-hint" style="text-align:center">${expire}</p>`:''}
  <button type="button" class="d-btn pri lg" id="code-ok" disabled>Verificar código</button>
  <div class="links"><button type="button" class="d-link gray" data-d="go" data-to="${backTo}">${backTo==='login'?'Voltar para o login':'Voltar'}</button><button type="button" class="d-link gray" data-d="resend">Reenviar código</button></div>`,
  mount(el){const ins=$$('#code input',el),ok=$('#code-ok',el);const sync=()=>{ok.disabled=!ins.every(i=>/\d/.test(i.value));};
    ins.forEach((inp,i)=>{inp.oninput=()=>{inp.value=inp.value.replace(/\D/g,'').slice(-1);if(inp.value&&ins[i+1])ins[i+1].focus();sync();};inp.onkeydown=e=>{if(e.key==='Backspace'&&!inp.value&&ins[i-1])ins[i-1].focus();};inp.onpaste=e=>{const t=(e.clipboardData.getData('text')||'').replace(/\D/g,'').slice(0,6);if(!t)return;e.preventDefault();t.split('').forEach((c,j)=>{if(ins[j])ins[j].value=c;});sync();};});
    ins[0].focus(); ok.onclick=after;}
};}
function enterApp(){ SHELL.logged=true; nav('condominios'); }
