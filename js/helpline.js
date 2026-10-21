/* Helpline page behaviour only: jump list highlight + Show Less / Show More for the helpline table */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var nav=document.querySelector('#dfjump nav'),links=[].slice.call(nav.querySelectorAll('a'));
  var targets=links.map(function(a){return document.getElementById(a.getAttribute('href').slice(1));});
  function spy(){
    var cur=0;targets.forEach(function(t,i){if(t&&t.getBoundingClientRect().top<150)cur=i;});
    links.forEach(function(a,i){a.classList.toggle('on',i===cur);});
  }
  nav.addEventListener('click',function(e){
    var a=e.target.closest('a');if(!a)return;e.preventDefault();
    var t=document.getElementById(a.getAttribute('href').slice(1));if(!t)return;   /* sections not designed yet: nothing to jump to */
    window.scrollTo({top:t.getBoundingClientRect().top+window.pageYOffset-88,behavior:reduce?'auto':'smooth'});
  });
  window.addEventListener('scroll',spy,{passive:true});spy();

  var rows=[].slice.call(document.querySelectorAll('#hltable tbody tr')),btn=document.getElementById('hltoggle'),SHOW=6,open=true;
  btn.addEventListener('click',function(){
    open=!open;rows.forEach(function(r,i){r.hidden=!open&&i>=SHOW;});
    btn.setAttribute('aria-expanded',open?'true':'false');btn.firstElementChild.textContent=open?'Show Less':'Show More';
  });
})();
