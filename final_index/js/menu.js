(function(){
  var triggers=[].slice.call(document.querySelectorAll('.nav [data-menu]'));
  var panels={};
  triggers.forEach(function(t){panels[t.dataset.menu]=document.getElementById('mega-'+t.dataset.menu);});
  var header=document.querySelector('.header'),timer;

  function collapseAcc(){
    document.querySelectorAll('.mi-acc.open').forEach(function(a){
      a.classList.remove('open');a.firstElementChild.setAttribute('aria-expanded','false');
    });
  }
  function closeAll(){
    collapseAcc();
    triggers.forEach(function(t){t.setAttribute('aria-expanded','false');});
    Object.keys(panels).forEach(function(k){panels[k].classList.remove('open');});
  }
  function closeAllPanels(){
    triggers.forEach(function(t){t.setAttribute('aria-expanded','false');});
    Object.keys(panels).forEach(function(k){panels[k].classList.remove('open');});
  }
  function open(t){
    clearTimeout(timer);
    if(t.getAttribute('aria-expanded')!=='true')collapseAcc();
    closeAllPanels();
    t.setAttribute('aria-expanded','true');
    panels[t.dataset.menu].classList.add('open');
  }
  function later(){clearTimeout(timer);timer=setTimeout(closeAll,150);}

  triggers.forEach(function(t){
    t.addEventListener('mouseenter',function(){open(t);});
    t.addEventListener('click',function(e){
      e.preventDefault();
      t.getAttribute('aria-expanded')==='true'?closeAll():open(t);
    });
  });
  Object.keys(panels).forEach(function(k){
    panels[k].addEventListener('mouseenter',function(){clearTimeout(timer);});
  });
  header.addEventListener('mouseleave',later);

  // items with no sub-items become plain links with a right arrow
  var RIGHT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
  document.querySelectorAll('.mi-acc').forEach(function(acc){
    if(acc.querySelector('.mi-sub a'))return;
    var a=document.createElement('a');
    a.className='mi';a.href='#';
    a.innerHTML='<span>'+acc.querySelector('.mi span').innerHTML+'</span><i class="ic">'+RIGHT+'</i>';
    acc.parentNode.replaceChild(a,acc);
  });

  // submenus: shown only while hovering (or focusing) their item
  var canHover=window.matchMedia&&window.matchMedia('(hover:hover)').matches;
  document.querySelectorAll('.mi-acc').forEach(function(acc){
    var b=acc.firstElementChild,t;
    function openAcc(){clearTimeout(t);collapseAcc();acc.classList.add('open');b.setAttribute('aria-expanded','true');}
    function closeAcc(){acc.classList.remove('open');b.setAttribute('aria-expanded','false');}
    acc.addEventListener('mouseenter',openAcc);
    acc.addEventListener('mouseleave',function(){clearTimeout(t);t=setTimeout(closeAcc,80);});
    acc.addEventListener('focusin',openAcc);
    acc.addEventListener('focusout',function(e){if(!acc.contains(e.relatedTarget))closeAcc();});
    b.addEventListener('click',function(){
      if(canHover)return;                       // mouse users: hover only
      acc.classList.contains('open')?closeAcc():openAcc(); // touch: tap toggles
    });
  });

  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeAll();});
  document.addEventListener('click',function(e){if(!header.contains(e.target))closeAll();});
})();
