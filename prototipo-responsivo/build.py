#!/usr/bin/env python3
"""Monta prototipo-responsivo/index.html e prototipo-mobile/index.html a partir do protótipo mobile original (src/mobile-base.html) + telas desktop.
Uso: python3 build.py   (rodar dentro de prototipo-responsivo/)"""
import base64, pathlib, re, sys

HERE = pathlib.Path(__file__).resolve().parent
MOB = (HERE / 'src' / 'mobile-base.html').read_text(encoding='utf-8')  # protótipo mobile original (base)
SRC = HERE / 'src'

def cut(text, start, end):
    i = text.index(start); j = text.index(end, i)
    return text[i:j]

def rep(text, old, new, count=1):
    n = text.count(old)
    if n != count:
        sys.exit(f'Trecho esperado {count}x, achado {n}x:\n{old[:120]}')
    return text.replace(old, new)

# ---------- CSS do mobile (sem o "palco" do computador) ----------
css = cut(MOB, '<style>', '</style>')[len('<style>'):]
css = re.sub(r'/\* ---------- stage \(desktop\) ---------- \*/.*?/\* ---------- screens ---------- \*/',
             '/* ---------- screens ---------- */', css, flags=re.S)
assert '.stage' not in css

# ---------- JS do mobile ----------
js = cut(MOB, "<script>\n(function(){", '</script>')[len('<script>\n'):]

ICONS_EXTRA = """  building:'M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 7h.01M9 11h.01M9 15h.01M15 7h.01M15 11h.01M15 15h.01',
  info:'M12 16v-4M12 8h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
  condo:'M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 10h.01M15 10h.01M9 13.5h.01M15 13.5h.01',
  archive:'M21 8v13H3V8M1 3h22v5H1zM10 12h4',
  bars:'M3 21h18M7 17v-6M12 17V6M17 17v-3',
  updown:'m7 15 5 5 5-5M7 9l5-5 5 5',
  dbl:'m11 17-5-5 5-5M18 17l-5-5 5-5',
  thumb:'M7 10v12M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 8a2 2 0 0 1-2 1.7H7V10l4-8a3 3 0 0 1 3 3.9Z',
  ban:'M4.9 4.9l14.2 14.2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
  zap:'M13 2 3 14h9l-1 8 10-12h-9l1-8Z',
  dots:'M12 5h.01M12 12h.01M12 19h.01',
  add:'M12 5v14M5 12h14',
  filetext:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M8 13h8M8 17h5',
  arrowup:'M12 19V5M6 11l6-6 6 6',
  arrowdown:'M12 5v14M6 13l6 6 6-6'"""
js = rep(js, "  building:'M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 7h.01M9 11h.01M9 15h.01M15 7h.01M15 11h.01M15 15h.01'", ICONS_EXTRA)

# boletos: mesma lista nos dois fluxos (14 boletos do Figma 09.x, com datas variadas)
old_bol = cut(js, "const B=(t,tipo,status,proc,venc,dias", "const STATUS=")
new_bol = """const REFD=new Date(2026,6,23);
const _dd=s=>{const[d,m,y]=s.split('/').map(Number);return Math.round((REFD-new Date(y,m-1,d))/864e5);};
const _f=n=>'R$ '+Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
[2740,1832,1789].forEach(id=>{UNITS.find(u=>u.id===id).outro=true;});
const PR1='0001847-22.2024.8.13.0024',PR2='0004521-77.2024.8.13.0024';
const BB=(t,tipo,status,proc,venc,v,m,j,c,e,pag,pago,ced)=>{const sub=Math.round((v+m+j+c+e)*100)/100;return {t,tipo,status,proc,venc,dias:_dd(venc),valor:_f(v),multa:_f(m),juros:_f(j),corr:_f(c),enc:_f(e),adic:_f(0),sub:_f(sub),total:_f(sub),pag:pag||'—',pago:_f(pago||0),comp:'—',ced:!!ced,n:{v,m,j,c,e,sub}};};
const BOLETOS=[
 BB('Original Jan - 2025','Original','Pago',PR1,'16/01/2025',100,2,19.98,7.46,25.89,'10/03/2025',125.17),
 BB('Original Jun - 2025','Original','Vencido',PR1,'16/06/2025',150,3,21.18,6.65,36.17),
 BB('Boleto de Crédito','Crédito','Vencido',null,'30/07/2025',10,0,1.25,0.42,2.37),
 BB('Original Jul - 2025','Original','Vencido',PR2,'05/08/2025',100,2,12.28,3.74,23.60),
 BB('Original Jun - 2025','Original','Vencido',PR1,'03/09/2025',100,2,11.22,3.22,23.29,null,0,true),
 BB('Original Jun - 2025','Original','Vencido',PR1,'05/09/2025',100,2,11.15,3.22,23.27),
 BB('Original Nov - 2025','Original','Vencido',PR1,'12/11/2025',182,3.64,15.88,4.58,41.22),
 BB('Original Jan - 2026','Original','Vencido',PR1,'15/01/2026',120,2.40,7.78,2.26,26.49),
 BB('Original Jan - 2026','Original','Vencido',PR2,'16/01/2026',120,2.40,7.73,2.26,26.48),
 BB('Original Jan - 2026','Original','Vencido',PR2,'06/04/2026',120,2.40,4.40,1.18,25.60,null,0,true),
 BB('Original Abr - 2026','Original','Vencido',null,'29/04/2026',160,3.20,4.62,1.58,33.88),
 BB('Original Abr - 2026','Original','Aguardando pagamento',null,'05/05/2026',50,1,1.34,0.36,10.54),
 BB('Original Jun - 2026','Original','Aguardando emissão',null,'15/06/2026',150,3,1.93,0.71,31.13),
 BB('Original Jul - 2026','Original','A vencer',null,'05/08/2026',690,0,0,0,0)
];
"""
js = js.replace(old_bol, new_bol)

# card de boleto: "A vencer" e boletos sem atraso mostram o status, não dias negativos
js = rep(js, "const badge=b.status==='Pago'?`<span class=\"badge sm success\">Pago</span>`:`<span class=\"badge sm error\">${b.dias} dias em atraso</span>`;",
  "const badge=b.status==='Pago'?`<span class=\"badge sm success\">Pago</span>`:b.dias>0&&b.status!=='A vencer'?`<span class=\"badge sm error\">${b.dias} dias em atraso</span>`:`<span class=\"badge sm gray\">${b.status}</span>`;")
js = rep(js, "${fld('No processo',b.proc||'—')}", "${fld('No processo',b.proc||'—')}${b.ced?fld('Situação','Cedido'):''}")

# histórico: no desktop o e-mail enviado aparece (no celular, só o aviso)
js = rep(js, "function histBody(k){", "function histBody(k,DESK){")
js = rep(js, "<div class=\"mblk\"><span class=\"fl\">Cobrança enviada</span><div class=\"note\">${ic('monitor',16)}<span>A visualização do e-mail enviado está disponível apenas no Portal pelo computador.</span></div></div>`;",
  "<div class=\"mblk\"><span class=\"fl\">Cobrança enviada</span>${DESK?mail('Fernanda Ribeiro Souza'):`<div class=\"note\">${ic('monitor',16)}<span>A visualização do e-mail enviado está disponível apenas no Portal pelo computador.</span></div>`}</div>`;")

# login / logout avisam a casca
js = rep(js, "function enterApp(){ reset('unidades'); showAck(); }", "function enterApp(){ SHELL.logged=true; reset('unidades'); S.ack=false; showAck(); }")
js = rep(js, "case 'do-logout': closeSheet(true);", "case 'do-logout': SHELL.logged=false; closeSheet(true);")

# eventos só valem no fluxo ativo
js = rep(js, "document.addEventListener('click',e=>{\n  const j=e.target.closest('[data-jump]');", "document.addEventListener('click',e=>{\n  if(SHELL.mode!=='mobile') return;\n  const j=e.target.closest('[data-jump]');")
js = rep(js, "document.addEventListener('keydown',e=>{if(e.key==='Escape')", "document.addEventListener('keydown',e=>{if(SHELL.mode!=='mobile') return; if(e.key==='Escape')")

# sem painel lateral nem escala de aparelho
js = rep(js, "$('#scenarios').innerHTML=scenarioItems();", "")
js = rep(js, "window.addEventListener('resize',fit); fit();", "")

# entrada/saída do fluxo mobile + dados compartilhados
API = """
const MAUTH=['login','criarSenha','esqueci','codigoEnviado','digitarCodigo','novaSenha','senhaOk','doisFatores'];
const CHAIN={criarSenha:['login'],doisFatores:['login'],esqueci:['login'],codigoEnviado:['login','esqueci'],digitarCodigo:['login','esqueci','codigoEnviado'],novaSenha:['login','esqueci','codigoEnviado','digitarCodigo'],senhaOk:[]};
function snapshot(){ const c=current(); if(!c) return {logged:false,screen:'login'};
  if(MAUTH.includes(c.name)) return {logged:false,screen:c.name};
  if(c.name==='detalhe') return {logged:true,screen:'unidade',unitId:S.unit.id,tab:S.tab};
  return {logged:true,screen:c.name}; }
function enter(s){
  closeSheet(true); closeMenu(true);
  if(!SHELL.logged){ S.login.erro=null; const n=MAUTH.includes(s.screen)?s.screen:'login';
    S.stack=(CHAIN[n]||[]).map(name=>({name,params:{},scroll:0})); if(n==='login') S.stack=[]; S.stack.push({name:n,params:{},scroll:0}); render('fade'); return; }
  if(s.screen==='unidade'){ const u=UNITS.find(x=>x.id===s.unitId)||UNITS[0];
    if(S.unit!==u){ S.hq='';S.bq='';S.dq='';S.BF={status:[],tipos:[],procs:[],dias:{preset:null,min:null,max:null}}; }
    S.unit=u; S.tab=TABS[s.tab]?s.tab:'resumo'; S.stack=[{name:'unidades',params:{},scroll:0},{name:'detalhe',params:{},scroll:0}]; render('fade'); }
  else if(s.screen==='perfil'||s.screen==='suporte') reset(s.screen);
  else reset('unidades');
  S.ack=false; showAck();
}
function leave(){ closeSheet(true); closeMenu(true); if(ackEl){ackEl.remove();ackOv.remove();ackEl=ackOv=null;} }
window.MOB={snapshot,enter,leave};
window.SH={P,ic,LOGO,UNITS,BOLETOS,STATUS,TIPOS,HIST,DOCS,FAQ,PERFIL,ESC,ADVS,BL24,CONDO_TXT,brl,parseBRL,plural,histBody};
"""
js = rep(js, "reset('login');\n})();", API + "})();")

# ---------- monta o HTML ----------
bg = base64.b64encode((HERE / 'login-bg.jpg').read_bytes()).decode()
desk_css = (SRC / 'desk.css').read_text(encoding='utf-8').replace('url(LOGIN_BG)', f"url(data:image/jpeg;base64,{bg})")
desk_js = ''.join((SRC / f'desk-{i}.js').read_text(encoding='utf-8') for i in range(1, 9))
shell_css = (SRC / 'shell.css').read_text(encoding='utf-8')
shell_js = (SRC / 'shell.js').read_text(encoding='utf-8')

device = cut(MOB, '<div class="device" id="device">', '\n  </div>\n</div>')

html = f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Portal Jurídico</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
<!-- Protótipo responsivo do Portal Jurídico (LLZ). Dados 100% fictícios.
     Desktop (≥ 1024 px): todas as telas e ações. Celular/tablet (< 1024 px): só o fluxo mobile de consulta.
     Gerado por prototipo-responsivo/build.py a partir de prototipo-mobile/index.html + src/. -->
<style>{css}</style>
<style>{shell_css}</style>
<style>{desk_css}</style>
<style>[hidden]{{display:none!important}}</style>
</head>
<body>
<div id="mob" aria-hidden="false">
  {device}
</div>
<div id="desk"></div>
<script>window.SHELL={{mode:null,logged:false}};</script>
<script>
{js}</script>
<script>
{desk_js}</script>
<script>
{shell_js}</script>
</body>
</html>
"""
(HERE / 'index.html').write_text(html, encoding='utf-8')
# o link público antigo (prototipo-mobile/) passa a servir a versão responsiva
(HERE.parent / 'prototipo-mobile').mkdir(exist_ok=True)
(HERE.parent / 'prototipo-mobile' / 'index.html').write_text(html, encoding='utf-8')
print('ok', len(html)//1024, 'KB')

# ---------- versão para artefato (o host fornece doctype/head/body) ----------
art = html.split('<head>',1)[1]
art = art.replace('<meta charset="utf-8">\n','').replace('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n','')
art = art.replace('</head>\n<body>\n','').replace('</body>\n</html>\n','')
art = art.replace('<title>Portal Jurídico</title>','<title>Portal Jurídico Responsivo</title>\n<style>:root{color-scheme:light}</style>',1)
(HERE / 'artifact.html').write_text(art, encoding='utf-8')
print('artifact ok')
