/* Blogs page behaviour only (no content is stored here): slider, Popular Reads, category tabs, sort, search filter (?q=), pagination.
   It works on the slides and cards that are already in the HTML (same approach as js/news.js). */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var PAGE=9,SHOW=4,off=0,cur=0,hold=false,timer=null,page=1,sortBy='new',filter='all';
  var $=function(id){return document.getElementById(id);};

  /* ---------- slider (left) ---------- */
  var feat=$('feat'),dots=$('fdots'),slides=[].slice.call(feat.querySelectorAll('.slide'));
  slides.forEach(function(s,i){var d=document.createElement('i');d.onclick=function(){show(i);restart();};dots.appendChild(d);});
  function mark(){
    var on=slides[cur]&&slides[cur].dataset.slug;
    [].forEach.call(document.querySelectorAll('#plist .pitem'),function(a){a.classList.toggle('on',a.dataset.slug===on);});
    scrollList();
  }
  function show(n){
    if(!slides.length)return;cur=(n+slides.length)%slides.length;
    slides.forEach(function(x,i){x.classList.toggle('on',i===cur);x.setAttribute('aria-hidden',i===cur?'false':'true');});
    [].forEach.call(dots.children,function(d,i){d.classList.toggle('on',i===cur);});
    mark();
  }
  function restart(){clearInterval(timer);if(!reduce&&slides.length>1)timer=setInterval(function(){if(!hold&&!document.hidden)show(cur+1);},5000);}
  feat.addEventListener('mouseenter',function(){hold=true;});
  feat.addEventListener('mouseleave',function(){hold=false;});

  /* ---------- Popular Reads (right): 4 rows visible, the rest slide in ---------- */
  var box=$('plist'),track=$('ptrack');
  function sizeList(){
    var it=box.querySelectorAll('.pitem');if(!it.length)return;
    var n=Math.min(SHOW,it.length),last=it[n-1];
    box.style.height=(last.offsetTop+last.offsetHeight-it[0].offsetTop)+'px';
    box.dataset.pitch=it.length>1?(it[1].offsetTop-it[0].offsetTop):0;
  }
  function scrollList(){
    var it=[].slice.call(track.children),idx=-1;it.forEach(function(a,i){if(a.classList.contains('on'))idx=i;});
    if(idx<0)return;
    if(idx<off)off=idx;else if(idx>=off+SHOW)off=idx-SHOW+1;
    off=Math.max(0,Math.min(off,Math.max(0,it.length-SHOW)));
    track.style.transform='translateY(-'+(off*(+box.dataset.pitch||0))+'px)';
  }
  window.addEventListener('resize',function(){sizeList();scrollList();});
  /* clicking a Popular Read shows it in the big slider; "Read Now" opens the blog */
  box.addEventListener('click',function(e){
    var a=e.target.closest('.pitem');if(!a)return;
    if(e.target.closest('em')||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
    e.preventDefault();
    var i=slides.map(function(s){return s.dataset.slug;}).indexOf(a.dataset.slug);
    if(i>-1){show(i);restart();if(window.innerWidth<=1000)feat.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});}
  });

  /* ---------- cards: category tabs, sort, search (?q=), pagination ---------- */
  var grid=$('bgrid'),pager=$('pager'),sortEl=$('sort'),empty=$('empty'),tabs=$('tabs');
  var cards=[].slice.call(grid.querySelectorAll('article')).map(function(a,i){a._i=i;return a;});
  var q=(new URLSearchParams(location.search).get('q')||'').toLowerCase();
  function list(){
    var l=cards.filter(function(a){return (filter==='all'||a.dataset.cat===filter)&&(!q||a.textContent.toLowerCase().indexOf(q)>-1);});
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
    var h='<button type="button" data-p="prev"'+(page===1?' disabled':'')+'>Prev</button>';
    for(var i=1;i<=pages;i++)h+='<button type="button" data-p="'+i+'"'+(i===page?' class="on" aria-current="page"':'')+'>'+i+'</button>';
    h+='<button type="button" data-p="next"'+(page===pages?' disabled':'')+'>Next</button>';
    pager.innerHTML=h;pager.style.display=pages>1?'':'none';
  }
  function setTab(f){
    filter=f;
    [].forEach.call(tabs.children,function(x){var on=x.dataset.f===f;x.classList.toggle('on',on);x.setAttribute('aria-selected',on?'true':'false');});
  }
  tabs.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;setTab(b.dataset.f);page=1;render(true);
  });
  sortEl.addEventListener('change',function(){sortBy=sortEl.value;page=1;render(true);});
  pager.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||b.disabled)return;
    var p=b.dataset.p;page=p==='prev'?page-1:p==='next'?page+1:+p;render(true);
    $('all').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  });
  $('pmore').addEventListener('click',function(e){
    e.preventDefault();q='';setTab('all');sortBy='new';sortEl.value='new';page=1;render(true);
    $('all').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  });

  sizeList();show(0);restart();render(false);
})();
