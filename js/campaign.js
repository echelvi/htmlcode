/* Campaign details: behaviour only (all content is in the HTML).
   - share buttons (built from the page URL + H1), copy link
   - table of contents: smooth scroll + highlight the section being read (links to #ids only)
   - FAQ: one answer open at a time
   - "Join the campaign" form: required/email check. DYNAMIC: post to Laravel (@csrf) and show the .ok message on success */
(function(){
  var $=function(id){return document.getElementById(id);};
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* share */
  var h1=document.querySelector('.bd-title'),t=encodeURIComponent(h1?h1.textContent.trim():document.title),u=encodeURIComponent(location.href);
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

  /* table of contents */
  var toc=$('toc');
  if(toc){
    var links=[].slice.call(toc.querySelectorAll('a[href^="#"]'));
    var secs=links.map(function(a){return document.getElementById(a.getAttribute('href').slice(1));});
    toc.addEventListener('click',function(e){
      var a=e.target.closest('a[href^="#"]');if(!a)return;
      var el=document.getElementById(a.getAttribute('href').slice(1));if(!el)return;
      e.preventDefault();
      window.scrollTo({top:el.getBoundingClientRect().top+window.pageYOffset-84,behavior:reduce?'auto':'smooth'});
      history.replaceState(null,'',a.getAttribute('href'));
    });
    var ticking=false;
    function spy(){
      ticking=false;var cur=0;
      secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<160)cur=i;});
      links.forEach(function(a,i){a.classList.toggle('on',i===cur);});
    }
    window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(spy);}},{passive:true});
    spy();
  }

  /* FAQ: one open at a time (also done natively by <details name> in new browsers) */
  var faq=document.querySelector('.bd-faq');
  if(faq)faq.addEventListener('toggle',function(e){
    var d=e.target;if(!d.open)return;
    [].forEach.call(faq.querySelectorAll('details[open]'),function(o){if(o!==d)o.open=false;});
  },true);

  /* join form */
  var jf=$('joinForm');
  if(jf)jf.addEventListener('submit',function(e){
    e.preventDefault();var bad=null;
    [].forEach.call(jf.querySelectorAll('input[required]'),function(i){
      var ok=i.checkValidity()&&i.value.trim()!=='';i.setAttribute('aria-invalid',ok?'false':'true');if(!ok&&!bad)bad=i;
    });
    if(bad){bad.focus();bad.reportValidity();return;}
    /* DYNAMIC: send with fetch + CSRF token; on success: */
    jf.reset();$('joinOk').hidden=false;
  });
})();
