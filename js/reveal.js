/* Fade-up on scroll. Without JS (or with reduced motion) everything simply shows. */
(function(){
  var root=document.documentElement;
  if(window.CSS&&CSS.supports&&CSS.supports('animation-timeline:view()')&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches)){document.documentElement.classList.add('js','sd');}
  if(!('IntersectionObserver' in window)||(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches))return;
  root.classList.add('js');
  var groups=['.what-grid .steps>*','.gcards>*','.acards>*','.why-grid>.wcard','.icards>*','.bgrid>*'];
  var singles=['.what .h2','.gain h2','.audience h2','.why h2','.reviews h2','.rgrid>*','.impact h2','.cta .container>*','.faq h2','.hub h2','h2.h2','.touch .tgrid>*'];
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  function add(el,i){el.classList.add('reveal');el.style.setProperty('--d',(i*80)+'ms');io.observe(el);}
  groups.forEach(function(s){document.querySelectorAll(s).forEach(add);});
  singles.forEach(function(s){document.querySelectorAll(s).forEach(function(el){if(!el.classList.contains('reveal'))add(el,0);});});


  /* Footer social icons pop in when the footer reaches the screen (own trigger: they sit at the page edge) */
  (function(){
    var s=document.querySelector('.social');if(!s)return;
    var io4=new IntersectionObserver(function(es){if(es[0].isIntersecting){s.classList.add('in-view');io4.disconnect();}},{threshold:0});
    io4.observe(s);
  })();

  /* Count-up numbers. Skipped automatically if js/count.js is also loaded, so the two never clash. */
  (function(){
    var els=[].slice.call(document.querySelectorAll('.hero-stats b,.lbox .right b'));
    if(!els.length)return;
    function run(el,delay){
      if(el.classList.contains('count')||el.dataset.done)return;
      el.dataset.done='1';
      var m=el.textContent.trim().match(/^([\d.]+)(.*)$/);if(!m)return;
      var end=parseFloat(m[1]),dec=(m[1].split('.')[1]||'').length,suf=m[2],text=el.textContent.trim(),t0=null,dur=1700;
      el.style.display='inline-block';el.style.minWidth=el.getBoundingClientRect().width+'px';
      el.textContent=(0).toFixed(dec)+suf;
      function frame(ts){
        if(t0===null)t0=ts+delay;
        var k=Math.max(0,Math.min(1,(ts-t0)/dur)),e=k===1?1:1-Math.pow(2,-10*k);
        el.textContent=(end*e).toFixed(dec)+suf;
        if(k<1)requestAnimationFrame(frame);else el.textContent=text;
      }
      requestAnimationFrame(frame);
    }
    var io3=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting)return;io3.unobserve(e.target);run(e.target,els.indexOf(e.target)%3*140);
    });},{threshold:.6});
    els.forEach(function(el){io3.observe(el);});
  })();
})();
