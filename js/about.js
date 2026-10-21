/* About page behaviour only (no content stored here): program tabs + arrow buttons for the timeline and team sliders */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var tabs=[].slice.call(document.querySelectorAll('#abTabs [role=tab]'));
  function show(t){
    tabs.forEach(function(b){
      var on=b===t;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;
      document.getElementById(b.getAttribute('aria-controls')).hidden=!on;
    });
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){show(t);});
    t.addEventListener('keydown',function(e){
      var n=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:-1;
      if(n<0||n>=tabs.length)return;e.preventDefault();show(tabs[n]);tabs[n].focus();
    });
  });
  [].forEach.call(document.querySelectorAll('[data-for]'),function(b){
    var tr=document.getElementById(b.dataset.for);if(!tr)return;
    function step(){var c=tr.firstElementChild;return c?c.getBoundingClientRect().width+(parseFloat(getComputedStyle(tr).columnGap)||0):300;}
    b.addEventListener('click',function(){tr.scrollBy({left:step()*(+b.dataset.dir),behavior:reduce?'auto':'smooth'});});
  });
  function sync(tr){
    [].forEach.call(document.querySelectorAll('[data-for="'+tr.id+'"]'),function(b){
      var end=tr.scrollLeft+tr.clientWidth>=tr.scrollWidth-2;
      b.disabled=+b.dataset.dir<0?tr.scrollLeft<=2:end;
    });
  }
  ['tl','tm'].forEach(function(id){
    var tr=document.getElementById(id);if(!tr)return;
    tr.addEventListener('scroll',function(){sync(tr);},{passive:true});sync(tr);window.addEventListener('resize',function(){sync(tr);});
  });
})();

/* Scroll animations (this page only). Marks elements, reveals them when they enter the screen, counts up the key numbers.
   Without JS or with reduced motion nothing is hidden. */
(function(){
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  if(!('IntersectionObserver' in window))return;
  var q=function(s){return [].slice.call(document.querySelectorAll(s));};
  function mark(sel,type,step,base){q(sel).forEach(function(el,i){el.setAttribute('data-ab',type);el.style.setProperty('--d',((base||0)+i*(step||0))+'ms');});}
  mark('.ab-stat-card','up',0,200);
  mark('.ab-stat-card li','up',90,300);
  mark('.ab-prog-grid>img','left');
  mark('.ab-tabs','right',0,120);
  mark('.ab-story-grid>div','left');mark('.ab-story-grid>img','right',0,120);
  mark('.ab-vision','left');mark('.ab-mission','right',0,120);
  mark('.ab-work-grid>img','left');
  mark('.ab-work-grid>div>.ab-pill,.ab-work-grid>div>h2','up',80);
  mark('.ab-work li','right',130,150);
  mark('.ab-work li b','pop',0,300);
  mark('body.pg-about section h2:not(.ab-panel h2):not(.ab-vm h2):not(.ab-story h2):not(.ab-work h2),.ab-sub','up',0,0);
  q('.ab-sub').forEach(function(el){el.style.setProperty('--d','120ms');});
  mark('.ab-prin-grid article','up',70);
  mark('.tl-i','right',110);
  mark('.ab-arrows','up',0,500);
  mark('.tm','up',110);
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(!e.isIntersecting)return;e.target.classList.add('ab-in');io.unobserve(e.target);
      if(e.target.classList.contains('ab-stat-card'))count(e.target);});
  },{threshold:.15,rootMargin:'0px 0px -30px 0px'});
  document.documentElement.classList.add('ab-js');
  q('[data-ab]').forEach(function(el){io.observe(el);});
  function count(card){
    [].forEach.call(card.querySelectorAll('b'),function(b,i){
      var t=b.textContent.trim(),m=t.match(/^(\D*)([\d,]+)(.*)$/);if(!m)return;
      var to=parseInt(m[2].replace(/,/g,''),10),from=m[1]?1900:0,start=null;
      b.setAttribute('aria-label',t);
      function f(ts){
        if(start===null)start=ts+i*120;
        var p=Math.max(0,Math.min(1,(ts-start)/1600)),e=p===1?1:1-Math.pow(2,-10*p);
        var v=Math.round(from+(to-from)*e);b.textContent=m[1]+(m[1]?v:v.toLocaleString('en-US'))+m[3];
        if(p<1)requestAnimationFrame(f);
      }
      b.textContent=m[1]+(m[1]?from:from.toLocaleString('en-US'))+m[3];
      requestAnimationFrame(f);
    });
  }
})();
