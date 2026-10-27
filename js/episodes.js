/* Podcasts + Webinars + Books + Campaigns page behaviour only (no content stored here): sort + pagination over the cards already in the HTML */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var PAGE=+(document.getElementById('bgrid').dataset.page)||9,page=1,sortBy='new';
  var $=function(id){return document.getElementById(id);};
  var grid=$('bgrid'),pager=$('pager'),sortEl=$('sort'),empty=$('empty');
  var cards=[].slice.call(grid.querySelectorAll('article')).map(function(a,i){a._i=i;return a;});
  function list(){
    var l=cards.slice();
    l.sort(function(a,b){
      var d=a.dataset.date<b.dataset.date?-1:a.dataset.date>b.dataset.date?1:0;
      return sortBy==='new'?(d?-d:a._i-b._i):(d?d:b._i-a._i);
    });
    return l;
  }
  function render(animate){
    var l=list(),pages=Math.max(1,Math.ceil(l.length/PAGE));page=Math.min(page,pages);
    cards.forEach(function(a){a.hidden=true;a.classList.remove('shown');});
    l.forEach(function(a,i){grid.appendChild(a);if(i>=(page-1)*PAGE&&i<page*PAGE){a.hidden=false;if(animate&&!reduce){void a.offsetWidth;a.classList.add('shown');}}});
    empty.hidden=l.length>0;
    var fc=$('found');if(fc)fc.textContent=fc.dataset.format==='showing'?'Showing '+Math.max(0,Math.min(PAGE,l.length-(page-1)*PAGE))+' of '+l.length+' results':'Found '+l.length+' '+(fc.dataset.noun||'items');
    var h='<button type="button" data-p="prev"'+(page===1?' disabled':'')+'>Prev</button>';
    for(var i=1;i<=pages;i++)h+='<button type="button" data-p="'+i+'"'+(i===page?' class="on" aria-current="page"':'')+'>'+i+'</button>';
    h+='<button type="button" data-p="next"'+(page===pages?' disabled':'')+'>Next</button>';
    pager.innerHTML=h;
  }
  sortEl.addEventListener('change',function(){sortBy=sortEl.value;page=1;render(true);});
  pager.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||b.disabled)return;
    var p=b.dataset.p;page=p==='prev'?page-1:p==='next'?page+1:+p;render(true);
    $('all').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  });
  render(false);
})();

/* ---------- episode popup: filled from the <template class="pod-detail"> inside the clicked card ---------- */
(function(){
  var $=function(id){return document.getElementById(id);};
  var dlg=$('podModal');if(!dlg)return;
  var media=$('podMedia'),img=$('podImg'),title=$('podTitle'),body=$('podBody'),play=$('podPlay'),video='',last=null;
  function open(card,trigger){
    var t=card.querySelector('template.pod-detail');if(!t)return;
    last=trigger;
    var ci=card.querySelector('.cimg img');
    img.src=ci.currentSrc||ci.src;img.alt='';
    title.textContent=card.querySelector('h3').textContent.trim();
    body.innerHTML='';body.appendChild(t.content.cloneNode(true));
    video=t.dataset.video||'';
    var f=media.querySelector('iframe');if(f)f.remove();media.classList.remove('playing');
    if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');
    document.body.classList.add('pod-open');
    $('podX').focus();
    if(t.dataset.autoplay&&video)play.click();   /* video-only popup (Webinar): start playing right away */
  }
  function close(){if(dlg.open)dlg.close();}
  dlg.addEventListener('close',function(){
    var f=media.querySelector('iframe');if(f)f.remove();media.classList.remove('playing');
    document.body.classList.remove('pod-open');if(last)last.focus();
  });
  $('podX').addEventListener('click',close);
  dlg.addEventListener('click',function(e){if(e.target===dlg)close();});   /* click on the dark backdrop */
  play.addEventListener('click',function(){
    if(!video)return;                                                        /* no video URL set for this episode yet */
    var f=document.createElement('iframe');
    f.src=video+(video.indexOf('?')>-1?'&':'?')+'autoplay=1&rel=0';
    f.allow='autoplay; encrypted-media; picture-in-picture';f.allowFullscreen=true;f.title=title.textContent;
    media.appendChild(f);media.classList.add('playing');
  });
  body.addEventListener('click',function(e){
    var pl=e.target.closest('.pod-pl');
    if(pl&&pl.getAttribute('href')==='#'){e.preventDefault();return;}   /* placeholder link: no real URL yet, do nothing */
    var tg=e.target.closest('.pod-tg');
    if(tg){var l=tg.parentNode,c=l.classList.toggle('collapsed');tg.textContent=c?'Show More':'Show Less';tg.setAttribute('aria-expanded',c?'false':'true');}
  });
  /* open from the card image, the title or "Listen Now" */
  $('bgrid').addEventListener('click',function(e){
    var a=e.target.closest('.cimg,h3 a,.pod-more');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
    e.preventDefault();open(a.closest('article'),a);
  });
})();
