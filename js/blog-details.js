/* Blog details page: reads ?slug=... and fills everything from window.BLOGS (data/blogs-data.js) or window.BLOG_API */
(function(){
  var U=window.BlogUtil,esc=U.esc,reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var slug=new URLSearchParams(location.search).get('slug');
  var $=function(id){return document.getElementById(id);};
  var LABEL={workplace:'Workplace',college:'College & University',disorders:'Disorders'};
  function label(c){return LABEL[c]||(c||'').charAt(0).toUpperCase()+(c||'').slice(1);}
  function slugify(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'section';}

  U.load(function(list){
    list=list||[];
    var b=list.filter(function(x){return x.slug===slug;})[0]||null;
    if(!b){
      document.title='Blog not found | Mental Health First Aid India';
      $('ptitle').textContent='Blog not found';
      $('bcrumb').textContent='Not found';
      $('bwho').remove();document.querySelector('.bd-share').remove();$('bdate').remove();$('bimg').remove();
      $('pbody').innerHTML='<p>Sorry, we could not find that blog. <a href="blogs.html">Go back to all blogs</a>.</p>';
      document.querySelector('.bd-side').remove();return;
    }
    document.title=b.title+' | Mental Health First Aid India';
    $('bcrumb').textContent=b.title;
    $('ptitle').textContent=b.title;
    $('bwho').innerHTML='<img class="av" src="'+esc(b.author.avatar)+'" alt="" width="24" height="24">'+esc(b.author.name)+
      (b.author.linkedin?'<a class="li" href="'+esc(b.author.linkedin)+'" aria-label="LinkedIn profile" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.9 8.6H3.6V20h3.3V8.6zM5.3 3.4a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8zM20.4 13.5c0-3-1.6-4.1-3.7-4.1-1.7 0-2.5.9-2.9 1.6V8.6h-3.3V20h3.3v-6.1c0-1.6.3-3.1 2.2-3.1s1.9 1.8 1.9 3.2V20h3.3l.2-6.5z"/></svg></a>':'');
    $('bdate').innerHTML=esc(U.fmt(b.date))+' &nbsp;•&nbsp; '+esc(b.readTime)+' min read';
    $('bimg').innerHTML='<img src="'+esc(b.image)+'" alt="'+esc(b.title)+'" decoding="async"><span class="tag">'+esc(label(b.category))+'</span>';

    /* share buttons */
    var href=location.href,t=encodeURIComponent(b.title),u=encodeURIComponent(href);
    $('shFb').href='https://www.facebook.com/sharer/sharer.php?u='+u;
    $('shWa').href='https://wa.me/?text='+t+'%20'+u;
    $('shX').href='https://twitter.com/intent/tweet?text='+t+'&url='+u;
    $('shIn').href='https://www.linkedin.com/sharing/share-offsite/?url='+u;
    $('shMail').href='mailto:?subject='+t+'&body='+u;
    $('shCopy').addEventListener('click',function(e){
      e.preventDefault();
      function done(){var c=$('copied');c.classList.add('on');setTimeout(function(){c.classList.remove('on');},1600);}
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(href).then(done,done);
      else{var i=document.createElement('input');i.value=href;document.body.appendChild(i);i.select();try{document.execCommand('copy');}catch(x){}i.remove();done();}
    });

    /* article (content is HTML from the admin panel – sanitise it on the server) + FAQ */
    var html=b.content||'';
    if(b.faqs&&b.faqs.length){
      html+='<div class="bd-faq"><h2>Frequently Asked Questions</h2>'+b.faqs.map(function(f,i){
        return '<details name="bdfaq"'+(i===0?' open':'')+'><summary>'+esc(f.q)+'</summary><p>'+esc(f.a)+'</p></details>';
      }).join('')+'</div>';
    }
    var art=$('pbody');art.innerHTML=html;

    /* table of contents: Introduction + every h2 */
    var hs=[].slice.call(art.querySelectorAll('h2')),used={},items=[];
    var firstP=art.firstElementChild;
    art.insertAdjacentHTML('afterbegin','<span id="intro"></span>');
    items.push({id:'intro',text:'Introduction'});
    hs.forEach(function(h){
      var id=slugify(h.textContent),n=used[id]=(used[id]||0)+1;if(n>1)id+='-'+n;
      h.id=id;items.push({id:id,text:h.textContent});
    });
    var toc=$('toc');
    toc.innerHTML=items.map(function(it,i){return '<li><a href="#'+it.id+'"'+(i===0?' class="on"':'')+'>'+esc(it.text)+'</a></li>';}).join('');
    toc.addEventListener('click',function(e){
      var a=e.target.closest('a');if(!a)return;e.preventDefault();
      var el=document.getElementById(a.getAttribute('href').slice(1));if(!el)return;
      var y=(a.getAttribute('href')==='#intro'?art.getBoundingClientRect().top:el.getBoundingClientRect().top)+window.pageYOffset-84;
      window.scrollTo({top:y,behavior:reduce?'auto':'smooth'});
    });
    /* highlight the section being read */
    var links=[].slice.call(toc.querySelectorAll('a'));
    function spy(){
      var cur=0,line=140;
      items.forEach(function(it,i){var el=document.getElementById(it.id);if(el&&el.getBoundingClientRect().top<line)cur=i;});
      if(window.innerHeight+window.pageYOffset>=document.body.scrollHeight-4)cur=items.length-1;
      links.forEach(function(a,i){a.classList.toggle('on',i===cur);});
    }
    window.addEventListener('scroll',spy,{passive:true});spy();

    /* search -> blogs page */
    $('sch').addEventListener('submit',function(e){
      e.preventDefault();var q=$('schq').value.trim();location.href='blogs.html'+(q?'?q='+encodeURIComponent(q):'')+'#all';
    });

    /* recent posts: newest blogs other than this one */
    var others=list.filter(function(x){return x.slug!==b.slug;}).sort(function(x,y){return x.date<y.date?1:x.date>y.date?-1:0;}).slice(0,3);
    if(others.length){
      $('bgrid').innerHTML=others.map(function(o){
        return '<article><a class="cimg" href="'+U.url(o)+'"><img src="'+esc(o.image)+'" alt="" width="314" height="178" loading="lazy"></a><small>'+esc(U.fmt(o.date))+' &nbsp;•&nbsp; '+esc(o.readTime)+' min</small><h3><a href="'+U.url(o)+'">'+esc(o.title)+'</a></h3><p>'+esc(o.excerpt)+'</p><a href="'+U.url(o)+'" class="more">Learn More '+U.arrow+'</a></article>';
      }).join('');
      $('related').hidden=false;
    }
    window.scrollTo(0,0);
  });
})();
