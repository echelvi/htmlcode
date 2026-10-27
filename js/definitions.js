/* Definitions page behaviour only: highlight the term being read, smooth jump from the list */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var nav=document.querySelector('#dfjump nav'),links=[].slice.call(nav.querySelectorAll('a'));
  var terms=links.map(function(a){return document.getElementById(a.getAttribute('href').slice(1));});
  function spy(){
    var cur=0;terms.forEach(function(t,i){if(t&&t.getBoundingClientRect().top<150)cur=i;});
    if(window.innerHeight+window.pageYOffset>=document.body.scrollHeight-4)cur=terms.length-1;
    links.forEach(function(a,i){a.classList.toggle('on',i===cur);});
  }
  nav.addEventListener('click',function(e){
    var a=e.target.closest('a');if(!a)return;e.preventDefault();
    var t=document.getElementById(a.getAttribute('href').slice(1));if(!t)return;
    window.scrollTo({top:t.getBoundingClientRect().top+window.pageYOffset-88,behavior:reduce?'auto':'smooth'});
  });
  window.addEventListener('scroll',spy,{passive:true});spy();
})();
