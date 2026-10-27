/* Count-up for the key numbers (91.5%, 81.2%, 78.5%, 100%).
   Starts when the number scrolls into view; with reduced motion the final number just shows. */
(function(){
  var els=[].slice.call(document.querySelectorAll('.hero-stats b,.lbox .right b'));
  if(!els.length)return;
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  function parse(el){
    var m=el.textContent.trim().match(/^([\d.]+)(.*)$/);
    if(!m)return null;
    var dec=(m[1].split('.')[1]||'').length;
    return {to:parseFloat(m[1]),dec:dec,suffix:m[2],text:el.textContent.trim()};
  }
  function ease(t){return t===1?1:1-Math.pow(2,-10*t);}           // fast start, soft landing
  function run(el,d,delay){
    el.setAttribute('aria-label',d.text);
    var dur=1700,start=null;
    el.textContent=(0).toFixed(d.dec)+d.suffix;
    function frame(ts){
      if(start===null)start=ts+delay;
      var t=Math.max(0,Math.min(1,(ts-start)/dur));
      el.textContent=(d.to*ease(t)).toFixed(d.dec)+d.suffix;
      if(t<1)requestAnimationFrame(frame);
      else{el.textContent=d.text;el.classList.add('count-done');}
    }
    requestAnimationFrame(frame);
  }
  els.forEach(function(el){el.classList.add('count');});
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting)return;
      io.unobserve(e.target);
      var d=parse(e.target); if(!d)return;
      var i=els.indexOf(e.target)%3;
      run(e.target,d,i*140);
    });
  },{threshold:.6});
  els.forEach(function(el){io.observe(el);});
})();
