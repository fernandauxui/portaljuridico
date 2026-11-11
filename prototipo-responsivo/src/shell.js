/* ================= TROCA DE FLUXO (desktop ⇄ mobile) =================
   Abaixo de 1024 px, ou em celular/tablet, mostra só o fluxo mobile (consulta).
   Ao cruzar o breakpoint, vai para a tela equivalente do outro fluxo. */
(function(){
'use strict';
function isHandheld(){
  const ua=navigator.userAgent||'';
  if(/Android|iPhone|iPod|iPad|Windows Phone|Mobile/i.test(ua)) return true;
  const touchOnly=window.matchMedia&&matchMedia('(pointer:coarse)').matches&&!matchMedia('(any-pointer:fine)').matches;
  return !!(touchOnly&&navigator.maxTouchPoints>0); /* iPad em modo "computador" */
}
const want=()=>(window.innerWidth<1024||isHandheld())?'mobile':'desktop';
function apply(first){
  const m=want(); if(m===SHELL.mode) return;
  const prev=SHELL.mode;
  const snap=first?{logged:false,screen:'login'}:(prev==='mobile'?MOB.snapshot():DESK.snapshot());
  if(prev==='mobile') MOB.leave(); if(prev==='desktop') DESK.leave();
  SHELL.mode=m;
  document.documentElement.classList.toggle('m-mode',m==='mobile');
  document.documentElement.classList.toggle('d-mode',m==='desktop');
  window.scrollTo(0,0);
  (m==='mobile'?MOB:DESK).enter(snap);
}
let t; window.addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(()=>apply(false),120);});
apply(true);
})();
