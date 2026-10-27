/* FAQs page behaviour only (no content is stored here): category switch + search over the FAQs already in the HTML */
(function(){
  var $=function(id){return document.getElementById(id);};
  var side=$('fqside'),panels=[].slice.call(document.querySelectorAll('.fq-panel')),none=$('fqnone'),q=$('fqq');
  function show(c){
    panels.forEach(function(p){p.hidden=p.dataset.cat!==String(c);[].forEach.call(p.querySelectorAll('details'),function(d){d.hidden=false;});});
    [].forEach.call(side.children,function(b){b.classList.toggle('on',b.dataset.cat===String(c));});
    none.hidden=true;
  }
  side.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;q.value='';show(b.dataset.cat);});
  function search(){
    var t=q.value.trim().toLowerCase();
    if(!t){show(0);return;}
    var seen={},hits=0;
    [].forEach.call(side.children,function(b){b.classList.remove('on');});
    panels.forEach(function(p){
      var any=false;
      [].forEach.call(p.querySelectorAll('details'),function(d){
        var key=d.querySelector('summary').textContent.trim().toLowerCase();
        var ok=(d.textContent.toLowerCase().indexOf(t)>-1)&&!seen[key];
        if(ok)seen[key]=1;d.hidden=!ok;if(ok){any=true;hits++;}
      });
      p.hidden=!any;
    });
    none.hidden=hits>0;
  }
  q.addEventListener('input',search);
  $('fqs').addEventListener('submit',function(e){e.preventDefault();search();});
})();
