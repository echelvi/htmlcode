/* Course details pages: behaviour only (all content is in the HTML).
   share links + copy link, syllabus open/close, FAQ one-open-at-a-time, course video popup (YouTube URL in data-video), scroll fade-in. */
(function(){
  var $=function(id){return document.getElementById(id);};
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* share */
  var h1=document.querySelector('.cs-hero h1'),t=encodeURIComponent(h1?h1.textContent.trim():document.title),u=encodeURIComponent(location.href);
  var SH={shFb:'https://www.facebook.com/sharer/sharer.php?u='+u,shWa:'https://wa.me/?text='+t+'%20'+u,shX:'https://twitter.com/intent/tweet?text='+t+'&url='+u,
          shIn:'https://www.linkedin.com/sharing/share-offsite/?url='+u,shMail:'mailto:?subject='+t+'&body='+u};
  for(var k in SH){var a=$(k);if(a)a.href=SH[k];}
  var cp=$('shCopy');
  if(cp)cp.addEventListener('click',function(e){
    e.preventDefault();
    function done(){var c=$('copied');c.classList.add('on');setTimeout(function(){c.classList.remove('on');},1600);}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(location.href).then(done,done);
    else{var i=document.createElement('input');i.value=location.href;document.body.appendChild(i);i.select();try{document.execCommand('copy');}catch(x){}i.remove();done();}
  });

  /* syllabus accordions (open by default) */
  [].forEach.call(document.querySelectorAll('.cs-acc-h'),function(b){
    var acc=b.closest('.cs-acc'),body=$(b.getAttribute('aria-controls'));
    b.addEventListener('click',function(){
      var open=b.getAttribute('aria-expanded')!=='true';
      b.setAttribute('aria-expanded',open?'true':'false');acc.classList.toggle('shut',!open);
      if(open)body.removeAttribute('inert');else body.setAttribute('inert','');
    });
  });

  /* FAQ: one answer open at a time (also native via <details name> in new browsers) */
  var faq=document.querySelector('.cs-faq');
  if(faq)faq.addEventListener('toggle',function(e){
    var d=e.target;if(!d.open)return;
    [].forEach.call(faq.querySelectorAll('details[open]'),function(o){if(o!==d)o.open=false;});
  },true);

  /* course video popup */
  var vb=$('csVideo'),modal=$('vmodal'),frame=$('vframe');
  if(vb&&modal){
    var last=null;
    function open(){
      var url=vb.getAttribute('data-video')||'',m=url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
      if(!m)return;last=document.activeElement;
      frame.innerHTML='<iframe src="https://www.youtube.com/embed/'+m[1]+'?autoplay=1&rel=0" title="Course video" allow="autoplay; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
      modal.querySelector('.vmodal-box').classList.toggle('vertical',/shorts\//.test(url));
      modal.classList.add('on');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('vclose').focus();
    }
    function close(){
      if(!modal.classList.contains('on'))return;
      modal.classList.remove('on');modal.setAttribute('aria-hidden','true');frame.innerHTML='';document.body.style.overflow='';
      if(last&&last.focus)last.focus();
    }
    vb.addEventListener('click',open);
    $('vclose').addEventListener('click',close);
    modal.addEventListener('click',function(e){if(e.target===modal)close();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  }

  /* fade-in on scroll (uses the site's .reveal styles; nothing hidden without JS or with reduced motion) */
  if(reduce||!('IntersectionObserver' in window))return;
  document.documentElement.classList.add('js');
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  /* each block's children appear one after another (stagger restarts per block) */
  ['.cs-body>section','.cs-side','.touch .tgrid'].forEach(function(s){
    [].forEach.call(document.querySelectorAll(s),function(parent){
      [].forEach.call(parent.children,function(el,i){
        if(el.classList.contains('reveal'))return;
        el.classList.add('reveal');el.style.setProperty('--d',Math.min(i,5)*70+'ms');io.observe(el);
      });
    });
  });
})();
