/* ================= DESKTOP (≥ 1024 px) ================= */
(function(){
'use strict';
const {ic,LOGO,UNITS,BOLETOS,STATUS,TIPOS,HIST,DOCS,FAQ,ADVS,ESC,brl,parseBRL,plural,histBody,CONDO_TXT}=window.SH;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const root=document.getElementById('desk');
const X=(n,s=16,w=1.8)=>ic(n,s,w);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));
const HOJE='23/07/2026';
const fmt2=n=>Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const ADVS_D=ADVS.concat(['Dra. Camila Ferraz']);
const P1='0001847-22.2024.8.13.0024',P2='0004521-77.2024.8.13.0024';

/* ---------- dados complementares do desktop (fictícios) ---------- */
const CNPJ=['11.222.333/0001-44','22.333.444/0001-55','33.444.555/0001-66','55.666.777/0001-88','66.777.888/0001-99','44.555.666/0001-77','77.888.999/0001-10','88.999.000/0001-21','99.000.111/0001-32','10.111.222/0001-43','21.222.333/0001-54','32.333.444/0001-65','43.444.555/0001-76','54.555.666/0001-87','65.666.777/0001-98','76.777.888/0001-09','87.888.999/0001-19','12.121.212/0001-12'];
const DOCI=['512.673.489-20','312.445.876-09','12.345.678/0001-90','234.567.890-12','345.678.901-23','456.789.012-34','567.890.123-45','678.901.234-56','789.012.345-67','890.123.456-78','901.234.567-89','321.654.987-00','654.321.098-11','987.654.321-22','111.222.333-44','555.666.777-88','999.888.777-66','298.554.671-30'];
UNITS.forEach((u,i)=>{u.cnpj=CNPJ[i];u.doc=DOCI[i];u.advs=u.id===2740?[u.adv,'Dra. Camila Ferraz']:[u.adv];});
const unitById=id=>UNITS.find(u=>u.id===+id);
const unitTitle=u=>(u.bloco.startsWith('Torre')?u.bloco:'Bl. '+u.bloco)+' - Ap. '+u.un;
const CONDOS=UNITS.map(u=>({id:u.id,name:u.condo,cnpj:u.cnpj,units:[u],com:u.procs.length?1:0,sem:u.procs.length?0:1,valor:u.procs.length?u.valor:null,cidade:u.cidade}));
const condoById=id=>CONDOS.find(c=>c.id===+id);
const ARQ=[
  {n:'0007234-12.2023.8.13.0024',adv:'Dra. Ana Lima',bloco:'E',un:'107',condo:'Parque Residencial Alphaville',cnpj:'77.888.999/0001-10',sit:'Concluído',fim:'01/07/2024',cad:'20/06/2023',valor:'Quitado',tipo:'—'},
  {n:'0009145-05.2023.8.13.0024',adv:'Dr. Rafael Monteiro',bloco:'B',un:'204',condo:'Residencial Morada das Flores',cnpj:'21.222.333/0001-54',sit:'Cancelado',fim:'15/03/2024',cad:'11/01/2023',valor:'R$ 8.400,00',tipo:'Justiça Comum'}
];
function procsOf(u){
  if(u.id===2740) return [{n:P1,dist:'03/05/2025',calc:HOJE,tipo:'Justiça Comum',acr:'0%',esc:'Monteiro &amp; Associados',adv:'Dr. Rafael Monteiro',bols:6,val:'R$ 18.450,75'},{n:P2,dist:'18/09/2025',calc:HOJE,tipo:'Justiça Comum',acr:'0%',esc:'Ferraz Advocacia',adv:'Dra. Camila Ferraz',bols:3,val:'R$ 9.870,00',outro:true}];
  return u.procs.map(n=>({n,dist:'03/05/2025',calc:HOJE,tipo:'Justiça Comum',acr:'0%',esc:ESC[u.adv],adv:u.adv,bols:9,val:brl(u.valor)}));
}
function bolsOf(u){
  return BOLETOS.map((b,i)=>{const c=Object.assign({},b,{i});
    if(u.id!==2740) c.proc=b.proc?(u.procs[b.proc===P1?0:u.procs.length-1]||null):null;
    return c;});
}

/* ---------- textos dos pontos em aberto (não decididos) ---------- */
const NOTES={
  valor:['Nome do filtro de valor','No desktop o filtro se chama "Débito da unidade"; no mobile, "Valor da ação". Falta definir um nome único.'],
  docs:['Botão repetido','Com a nova aba Documentos, o botão "Documentos do condomínio" do topo fica repetido. Falta decidir se ele continua.'],
  verbol:['"Ver boletos" do processo','Abre um modal (como no 09.23). Alternativa em discussão: levar para a aba Boletos já filtrada pelo processo.'],
  ordenar:['Ordenação','No desktop a ordenação é pelo cabeçalho da tabela; no mobile existe o botão "Ordenar". Falta alinhar os dois.'],
  pago:['Inconsistência nos dados do Figma','Boleto Pago com valor pago (R$ 125,17) menor que o total (R$ 155,33). Mantido como no Figma e no mobile; confirmar a regra de exibição.'],
  revisao:['Etapa de revisão do acordo','"Gerar Simulação" não confirma o acordo. A tela de revisão antes de efetivar ainda não foi desenhada.'],
  tipoacao:['Lista de tipos de ação','As opções do campo "Tipo de ação" são exemplos. Confirmar a lista oficial.'],
  selall:['"Selecionar todos" no relatório','O seletor de unidades do relatório ainda tem "Selecionar todos"; nos filtros esse item foi removido.'],
  juridico:['Revisão jurídica','Descontos, juros, encargos e envio de boletos têm impacto de CDC, LGPD e Bacen. Validar regras e textos com o Jurídico antes de produção.'],
  extrato:['Extrato gerado','A tela 09.09 (extrato gerado) foi simulada; os campos de "Status do boleto" além de "Todos" são exemplos.']
};
const note=k=>`<button type="button" class="d-note" data-d="note" data-k="${k}" title="Ponto em aberto: ${esc(NOTES[k][0])}" aria-label="Ponto em aberto: ${esc(NOTES[k][0])}">${X('info',12,2.2)}</button>`;

/* ---------- estado ---------- */
const emptyUF=()=>({meses:{preset:null,min:null,max:null},valor:{min:null,max:null},proc:[],advs:[]});
const emptyBF=()=>({status:[],tipos:[],procs:[],dias:{preset:null,min:null,max:null}});
const D={
  r:{n:'login',p:{}}, side:true,
  login:{email:'nome@escritorio.com.br',senha:'Teste@123',erro:null}, recEmail:'nome@escritorio.com.br',
  uq:'', uf:emptyUF(), usel:new Set(), usort:{k:null,dir:1},
  cq:'', cf:{valor:{min:null,max:null},proc:[]}, csel:new Set(), csort:{k:'name',dir:1},
  cuq:'', cuf:emptyUF(), cusel:new Set(),
  bq:'', bf:emptyBF(), bsel:new Set(), busy:false,
  hq:'', hist:HIST.map(h=>Object.assign({},h)),
  dq:'', dsel:new Set(),
  aq:'', rq:'',
  rep:null, perfTel:'(11) 98376-9876', faq:0,
};
function resetUnitState(){D.bq='';D.bf=emptyBF();D.bsel=new Set();D.hq='';D.dq='';D.dsel=new Set();}
