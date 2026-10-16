/* Blogs page: everything is built from window.BLOGS (data/blogs-data.js) or from window.BLOG_API */
(function(){
  var U=window.BlogUtil,esc=U.esc,reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var PAGE=9,MAXPOP=6,SHOW=4,off=0,all=[],filter='all',sortBy='new',page=1,cur=0,hold=false,timer=null;

  function byDate(a,b){return (a.date<b.date?-1:a.date>b.date?1:a.id-b.id);}
  function meta(b){return esc(U.fmt(b.date))+' &nbsp;•&nbsp; '+esc(b.readTime)+' min';}

  /* ---------- featured slider (left) ---------- */
  var feat=document.getElementById('feat'),dots=document.getElementById('fdots');
  function mkSlide(b,on){
    var d=document.createElement('div');d.className='slide'+(on?' on':'');d.setAttribute('aria-hidden',on?'false':'true');d.dataset.slug=b.slug;
    d.innerHTML='<img class="s-img" src="'+esc(b.image)+'" alt="" decoding="async">'+
      '<div class="s-body"><h2>'+esc(b.title)+'</h2><a href="'+U.url(b)+'" class="s-btn">Read Now '+U.circ+'</a></div>'+
      '<div class="s-meta"><span class="by"><img src="'+esc(b.author.avatar)+'" alt="" width="21" height="21">'+esc(b.author.name)+'</span><span>'+meta(b)+'</span></div>';
    return d;
  }
  function buildSlider(list){
    var items=popularList(list);   /* the left slider scrolls through exactly the blogs listed in Popular Reads */
    [].slice.call(feat.querySelectorAll('.slide')).forEach(function(n){n.remove();});
    dots.innerHTML='';
    items.forEach(function(b,i){
      var d=mkSlide(b,i===0);feat.insertBefore(d,dots);
      var dot=document.createElement('i');dot.onclick=function(){show(i);restart();};dots.appendChild(dot);
    });
    show(0);restart();
  }
  function slides(){return feat.querySelectorAll('.slide');}
  function mark(){
    var on=feat.querySelector('.slide.on'),slug=on&&on.dataset.slug;
    [].forEach.call(document.querySelectorAll('#plist .pitem'),function(a){a.classList.toggle('on',a.dataset.slug===slug);});
    scrollList();
  }
  function show(n){
    var s=feat.querySelectorAll('.slide:not(.pick)');if(!s.length)return;cur=(n+s.length)%s.length;
    var pick=feat.querySelector('.slide.pick');if(pick)pick.remove();
    [].forEach.call(s,function(x,i){x.classList.toggle('on',i===cur);x.setAttribute('aria-hidden',i===cur?'false':'true');});
    [].forEach.call(dots.children,function(d,i){d.classList.toggle('on',i===cur);});
    mark();
  }
  /* clicking a Popular Read shows that blog in the big slider on the left */
  function pickBlog(slug){
    var b=all.filter(function(x){return x.slug===slug;})[0];if(!b)return;
    var s=[].slice.call(feat.querySelectorAll('.slide:not(.pick)')),idx=-1;
    s.forEach(function(x,i){if(x.dataset.slug===slug)idx=i;});
    if(idx>=0){show(idx);}
    else{
      var old=feat.querySelector('.slide.pick');if(old)old.remove();
      s.forEach(function(x){x.classList.remove('on');x.setAttribute('aria-hidden','true');});
      [].forEach.call(dots.children,function(d){d.classList.remove('on');});
      var d=mkSlide(b,false);d.classList.add('pick');feat.insertBefore(d,dots);
      void d.offsetWidth;d.classList.add('on');d.setAttribute('aria-hidden','false');mark();
    }
    restart();
    if(window.innerWidth<=1000)feat.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
  }
  function restart(){clearInterval(timer);if(!reduce&&slides().length>1)timer=setInterval(function(){if(!hold&&!document.hidden)show(cur+1);},5000);}
  feat.addEventListener('mouseenter',function(){hold=true;});
  feat.addEventListener('mouseleave',function(){hold=false;});

  /* ---------- popular reads (right) ---------- */
  function popularList(list){
    var items=list.filter(function(b){return b.popular;}).sort(function(a,b){return (b.views||0)-(a.views||0);}).slice(0,MAXPOP);
    if(!items.length)items=list.slice().sort(function(a,b){return (b.views||0)-(a.views||0);}).slice(0,MAXPOP);
    return items;
  }
  function buildPopular(list){
    var items=popularList(list);
    document.getElementById('plist').innerHTML='<div class="ptrack" id="ptrack">'+items.map(function(b){
      return '<a href="'+U.url(b)+'" class="pitem" data-slug="'+esc(b.slug)+'"><img src="'+esc(b.thumb||b.image)+'" alt="" width="65" height="50" loading="lazy"><span><b>'+esc(b.title)+'</b><em>Read Now '+U.circ+'</em></span></a>';
    }).join('')+'</div>';
    sizeList();
  }
  /* right list shows 4 rows; the others stay hidden and slide into view as the big slider reaches them */
  function sizeList(){
    var box=document.getElementById('plist'),it=box.querySelectorAll('.pitem');if(!it.length)return;
    var n=Math.min(SHOW,it.length),last=it[n-1];
    box.style.height=(last.offsetTop+last.offsetHeight-it[0].offsetTop)+'px';
    box.dataset.pitch=it.length>1?(it[1].offsetTop-it[0].offsetTop):0;
  }
  function scrollList(){
    var box=document.getElementById('plist'),track=document.getElementById('ptrack');if(!track)return;
    var it=[].slice.call(track.children),idx=-1;it.forEach(function(a,i){if(a.classList.contains('on'))idx=i;});
    if(idx<0)return;
    if(idx<off)off=idx;else if(idx>=off+SHOW)off=idx-SHOW+1;
    off=Math.max(0,Math.min(off,Math.max(0,it.length-SHOW)));
    track.style.transform='translateY(-'+(off*(+box.dataset.pitch||0))+'px)';
  }
  window.addEventListener('resize',function(){sizeList();scrollList();});

  document.getElementById('plist').addEventListener('click',function(e){
    var a=e.target.closest('.pitem');if(!a)return;
    if(e.target.closest('em')||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;   /* "Read Now" opens the blog page */
    e.preventDefault();pickBlog(a.dataset.slug);
  });

  /* ---------- tabs, sort, cards, pagination ---------- */
  var tabs=document.getElementById('tabs'),sortEl=document.getElementById('sort'),grid=document.getElementById('bgrid'),pager=document.getElementById('pager');
  var LABEL={workplace:'Workplace',college:'College & University',disorders:'Disorders'};
  function label(c){return LABEL[c]||c.charAt(0).toUpperCase()+c.slice(1);}
  function buildTabs(list){
    var cats=[];list.forEach(function(b){if(b.category&&cats.indexOf(b.category)<0)cats.push(b.category);});
    tabs.innerHTML='<button type="button" class="on" data-f="all" role="tab" aria-selected="true">All</button>'+
      cats.map(function(c){return '<button type="button" data-f="'+esc(c)+'" role="tab" aria-selected="false">'+esc(label(c))+'</button>';}).join('');
  }
  function current(){
    var q=(new URLSearchParams(location.search).get('q')||'').toLowerCase();
    var l=all.filter(function(b){return (filter==='all'||b.category===filter)&&(!q||(b.title+' '+b.excerpt).toLowerCase().indexOf(q)>-1);});
    l.sort(function(a,b){return sortBy==='new'?byDate(b,a):byDate(a,b);});return l;
  }
  function renderGrid(animate){
    var l=current(),pages=Math.max(1,Math.ceil(l.length/PAGE));page=Math.min(page,pages);
    var slice=l.slice((page-1)*PAGE,page*PAGE);
    grid.innerHTML=slice.map(function(b){
      return '<article class="'+(animate&&!reduce?'shown':'')+'"><a class="cimg" href="'+U.url(b)+'"><img src="'+esc(b.image)+'" alt="" width="314" height="178" loading="lazy" decoding="async"></a>'+
        '<small>'+meta(b)+'</small><h3><a href="'+U.url(b)+'">'+esc(b.title)+'</a></h3><p>'+esc(b.excerpt)+'</p>'+
        '<a href="'+U.url(b)+'" class="more">Learn More '+U.arrow+'</a></article>';
    }).join('')||'<p class="empty">No blogs in this category yet.</p>';
    var h='<button type="button" data-p="prev"'+(page===1?' disabled':'')+'>Prev</button>';
    for(var i=1;i<=pages;i++)h+='<button type="button" data-p="'+i+'"'+(i===page?' class="on" aria-current="page"':'')+'>'+i+'</button>';
    h+='<button type="button" data-p="next"'+(page===pages?' disabled':'')+'>Next</button>';
    pager.innerHTML=h;pager.style.display=pages>1?'':'none';
  }
  tabs.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    [].forEach.call(tabs.children,function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-selected',x===b?'true':'false');});
    filter=b.dataset.f;page=1;renderGrid(true);
  });
  sortEl.addEventListener('change',function(){sortBy=sortEl.value;page=1;renderGrid(true);});
  pager.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||b.disabled)return;
    var p=b.dataset.p;page=p==='prev'?page-1:p==='next'?page+1:+p;renderGrid(true);
    document.getElementById('all').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  });
  document.getElementById('pmore').addEventListener('click',function(e){
    e.preventDefault();filter='all';sortBy='new';sortEl.value='new';page=1;
    [].forEach.call(tabs.children,function(x){var on=x.dataset.f==='all';x.classList.toggle('on',on);x.setAttribute('aria-selected',on?'true':'false');});
    renderGrid(true);document.getElementById('all').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  });

  U.load(function(list){
    all=list||[];buildSlider(all);buildPopular(all);mark();buildTabs(all);renderGrid(false);
  });
})();
