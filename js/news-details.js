/* News details page behaviour only: share links, copy link, search box */
(function(){
  var $=function(id){return document.getElementById(id);};
  var href=location.href,t=encodeURIComponent(document.querySelector('.bd-title').textContent.trim()),u=encodeURIComponent(href);
  function set(id,v){var a=$(id);if(a)a.href=v;}
  set('shFb','https://www.facebook.com/sharer/sharer.php?u='+u);
  set('shWa','https://wa.me/?text='+t+'%20'+u);
  set('shX','https://twitter.com/intent/tweet?text='+t+'&url='+u);
  set('shIn','https://www.linkedin.com/sharing/share-offsite/?url='+u);
  set('shMail','mailto:?subject='+t+'&body='+u);
  $('shCopy').addEventListener('click',function(e){
    e.preventDefault();
    function done(){var c=$('copied');c.classList.add('on');setTimeout(function(){c.classList.remove('on');},1600);}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(href).then(done,done);
    else{var i=document.createElement('input');i.value=href;document.body.appendChild(i);i.select();try{document.execCommand('copy');}catch(x){}i.remove();done();}
  });
  $('sch').addEventListener('submit',function(e){
    e.preventDefault();var q=$('schq').value.trim();location.href='news.html'+(q?'?q='+encodeURIComponent(q):'')+'#all';
  });
})();
