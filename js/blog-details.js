/* Blog details page behaviour only (all content is in the HTML):
   share links + copy link, table of contents (smooth scroll + highlight the section being read),
   FAQ one-open-at-a-time, search box -> blogs page (?q=) */
(function(){
  var $=function(id){return document.getElementById(id);};
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* share */
  var href=location.href,t=encodeURIComponent($('ptitle').textContent.trim()),u=encodeURIComponent(href);
  function set(id,v){var a=$(id);if(a)a.href=v;}
  set('shFb','https://www.facebook.com/sharer/sharer.php?u='+u);
  set('shWa','https://wa.me/?text='+t+'%20'+u);
  set('shX','https://twitter.com/intent/tweet?text='+t+'&url='+u);
  set('shIn','https://www.linkedin.com/sharing/share-offsite/?url='+u);
  set('shMail','mailto:?subject='+t+'&body='+u);
  $('shCopy').addEventListener('click',function(e){
    e.preventDefault();
    function done(){var c=$('copied');c.classList.add('on');setTimeout(function(){c.classList.remove('on');},1600);}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(href).then(done,done);
    else{var i=document.createElement('input');i.value=href;document.body.appendChild(i);i.select();try{document.execCommand('copy');}catch(x){}i.remove();done();}
  });

  /* table of contents: links point to #intro and to the ids of the H2s */
  var toc=$('toc'),art=$('pbody');
  var links=[].slice.call(toc.querySelectorAll('a[href^="#"]'));
  var items=links.map(function(a){return document.getElementById(a.getAttribute('href').slice(1));});
  toc.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="#"]');if(!a)return;
    var el=document.getElementById(a.getAttribute('href').slice(1));if(!el)return;
    e.preventDefault();
    var y=(a.getAttribute('href')==='#intro'?art.getBoundingClientRect().top:el.getBoundingClientRect().top)+window.pageYOffset-84;
    window.scrollTo({top:y,behavior:reduce?'auto':'smooth'});
  });
  var ticking=false;
  function spy(){
    ticking=false;var cur=0,line=140;
    items.forEach(function(el,i){if(el&&el.getBoundingClientRect().top<line)cur=i;});
    if(window.innerHeight+window.pageYOffset>=document.body.scrollHeight-4)cur=items.length-1;
    links.forEach(function(a,i){a.classList.toggle('on',i===cur);});
  }
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(spy);}},{passive:true});
  spy();

  /* FAQ: one answer open at a time (also done natively by <details name> in new browsers) */
  var faq=art.querySelector('.bd-faq');
  if(faq)faq.addEventListener('toggle',function(e){
    var d=e.target;if(!d.open)return;
    [].forEach.call(faq.querySelectorAll('details[open]'),function(o){if(o!==d)o.open=false;});
  },true);

  /* search -> blogs page */
  $('sch').addEventListener('submit',function(e){
    e.preventDefault();var q=$('schq').value.trim();location.href='blogs.html'+(q?'?q='+encodeURIComponent(q):'')+'#all';
  });
})();
