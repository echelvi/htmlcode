(function(){
  var triggers=[].slice.call(document.querySelectorAll('.nav [data-menu]'));
  var panels={};
  triggers.forEach(function(t){panels[t.dataset.menu]=document.getElementById('mega-'+t.dataset.menu);});
  var header=document.querySelector('.header'),timer;

  function introP(el){var m=el.closest('.mega');return m&&m.querySelector('.mega-intro p');}
  function resetIntro(el){
    var m=el.closest('.mega'),p=introP(el);
    if(p&&p.dataset.def&&!m.querySelector('.mi-acc.open'))p.textContent=p.dataset.def;
  }
  function collapseAcc(){
    document.querySelectorAll('.mi-acc.open').forEach(function(a){
      a.classList.remove('open');a.firstElementChild.setAttribute('aria-expanded','false');resetIntro(a);
    });
  }
  function closeAll(){
    collapseAcc();
    triggers.forEach(function(t){t.setAttribute('aria-expanded','false');});
    Object.keys(panels).forEach(function(k){panels[k].classList.remove('open');panels[k].style.minHeight='';});
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

  // submenus: open while you hover their item; opening one closes the others.
  // Closing a submenu above shifts the items below it UP, which would leave the pointer outside the
  // panel and close the whole menu. So whenever something closes, the panel keeps its current height
  // (min-height) until the pointer moves back inside the real content; the panel never shrinks away
  // from under the pointer.
  var canHover=window.matchMedia&&window.matchMedia('(hover:hover)').matches;
  function syncIntro(m){
    var p=m.querySelector('.mega-intro p');if(!p||!p.dataset.def)return;
    var o=m.querySelectorAll('.mi-acc.open'),last=o[o.length-1];
    p.textContent=(last&&last.dataset.desc)||p.dataset.def;
  }
  function closeAcc(acc){
    acc.classList.remove('open');acc.firstElementChild.setAttribute('aria-expanded','false');
  }
  function closeOthers(mega,keep){
    var h=mega.offsetHeight,any=false;
    mega.querySelectorAll('.mi-acc.open').forEach(function(o){if(o!==keep){closeAcc(o);any=true;}});
    if(any)mega.style.minHeight=h+'px';       // hold the height so the pointer stays inside
    syncIntro(mega);
  }
  Object.keys(panels).forEach(function(k){
    var m=panels[k],inn=m.querySelector('.mega-in');
    m.addEventListener('mousemove',function(e){
      if(m.style.minHeight&&e.clientY<=inn.getBoundingClientRect().bottom-90)m.style.minHeight=''; // shrink only once the pointer is well inside the content
    });
    m.addEventListener('mouseleave',function(){m.style.minHeight='';});
  });
  document.querySelectorAll('.mi-acc').forEach(function(acc){
    var b=acc.firstElementChild,mega=acc.closest('.mega');
    function openAcc(){
      closeOthers(mega,acc);acc.classList.add('open');b.setAttribute('aria-expanded','true');
      var p=introP(acc);
      if(p&&acc.dataset.desc){if(!p.dataset.def)p.dataset.def=p.textContent;p.textContent=acc.dataset.desc;}
    }
    acc.addEventListener('mouseenter',openAcc);
    acc.addEventListener('focusin',openAcc);
    b.addEventListener('click',function(){
      if(canHover)return;                       // mouse users: hover only
      acc.classList.contains('open')?(closeAcc(acc),syncIntro(mega)):openAcc(); // touch: tap toggles
    });
  });
  // plain links (no submenu) behave the same way when hovered
  document.querySelectorAll('.mega a.mi').forEach(function(a){
    a.addEventListener('mouseenter',function(){closeOthers(a.closest('.mega'),a);});
  });

  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeAll();});
  document.addEventListener('click',function(e){if(!header.contains(e.target))closeAll();});
})();
