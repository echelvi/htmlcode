/* Careers page behaviour only (no content stored here): description toggle, sort, "Apply Now" fills the form panel from the card's data-* attributes */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var $=function(id){return document.getElementById(id);};
  var list=$('roles'),sortEl=$('sort');
  var cards=[].slice.call(list.querySelectorAll('.role')).map(function(a,i){a._i=i;return a;});
  function toggle(btn,open){
    var p=$(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded',open);p.hidden=!open;
    btn.firstElementChild.textContent=open?'See Less':'View Full Description';
  }
  list.addEventListener('click',function(e){
    var t=e.target.closest('.role-tog');
    if(t){toggle(t,t.getAttribute('aria-expanded')!=='true');return;}
    var a=e.target.closest('.role-apply');
    if(a){
      var c=a.closest('.role'),m=c.querySelector('.role-more');
      $('apTitle').textContent=c.dataset.title;$('apExp').textContent=c.dataset.exp;$('apLoc').textContent=c.dataset.loc;
      $('apDesc').innerHTML=m.innerHTML;$('fPos').value=c.dataset.title;
      e.preventDefault();var t=$('apply');t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});if(history.replaceState)history.replaceState(null,'','#apply');
    }
  });
  sortEl.addEventListener('change',function(){
    var s=sortEl.value;
    cards.slice().sort(function(a,b){var d=a.dataset.date<b.dataset.date?-1:a.dataset.date>b.dataset.date?1:0;return s==='new'?(d?-d:a._i-b._i):(d?d:b._i-a._i);})
      .forEach(function(x){list.appendChild(x);});
  });
  var f=$('fFile');
  f.addEventListener('change',function(){$('fileName').textContent=f.files.length?f.files[0].name:'Choose File';});
})();

/* Phone: digits only, exactly 10 */
(function(){
  var p=document.getElementById('fPhone');if(!p)return;
  function chk(){p.setCustomValidity(p.value&&!/^[0-9]{10}$/.test(p.value)?'Enter a 10-digit phone number':'');}
  p.addEventListener('input',function(){p.value=p.value.replace(/\D/g,'').slice(0,10);chk();});
  chk();
})();
