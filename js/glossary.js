/* Glossary page behaviour only (no content stored here): category switch + search over the terms already in the HTML */
(function(){
  var $=function(id){return document.getElementById(id);};
  var side=$('glside'),panels=[].slice.call(document.querySelectorAll('.gl-panel')),none=$('glnone'),q=$('glq');
  function reset(p){[].forEach.call(p.querySelectorAll('details,.gl-letter'),function(n){n.hidden=false;});}
  function show(c){
    panels.forEach(function(p){p.hidden=p.dataset.cat!==String(c);reset(p);});
    [].forEach.call(side.children,function(b){b.classList.toggle('on',b.dataset.cat===String(c));});
    none.hidden=true;
  }
  side.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;q.value='';show(b.dataset.cat);});
  function search(){
    var t=q.value.trim().toLowerCase();
    if(!t){show(0);return;}
    var hits=0;
    [].forEach.call(side.children,function(b){b.classList.remove('on');});
    panels.forEach(function(p){
      var any=false;
      [].forEach.call(p.querySelectorAll('.gl-letter'),function(L){
        var some=false;
        [].forEach.call(L.querySelectorAll('details'),function(d){
          var ok=d.textContent.toLowerCase().indexOf(t)>-1;d.hidden=!ok;if(ok){some=true;hits++;}
        });
        L.hidden=!some;if(some)any=true;
      });
      p.hidden=!any;
    });
    none.hidden=hits>0;
  }
  q.addEventListener('input',search);
  $('gls').addEventListener('submit',function(e){e.preventDefault();search();});
})();
