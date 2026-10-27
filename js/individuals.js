/* For Individuals: course calendar.
   Content (rows, filter options, count, pager) is always rendered in the HTML - this script only adds behaviour.

   Two modes, chosen by the backend:
   - Server mode  <ul id="clist" data-server>: the server filters, sorts and pages (GET ?course=&type=&state=&month=&sort=&page=).
     The script only submits the form when "Sort by" changes and clears the filters on Reset.
   - Browser mode (no data-server): all upcoming courses are in the page; the script hides past courses,
     filters, sorts, pages (6 per page) and writes the "(N)" counts on the month options.
   Rows: data-course, data-type, data-state, data-date (YYYY-MM-DD). Month option values: n30, n90 or YYYY-MM. */
(function(){
  var list=document.getElementById('clist');if(!list)return;
  var form=document.getElementById('ffil'),sortEl=document.getElementById('fSort'),reset=document.getElementById('fReset');
  var f={course:document.getElementById('fCourse'),type:document.getElementById('fType'),state:document.getElementById('fState'),month:document.getElementById('fMonth')};

  /* ---------- server mode ---------- */
  if(list.hasAttribute('data-server')){
    sortEl.addEventListener('change',function(){form.submit();});
    reset.addEventListener('click',function(){location.href=location.pathname+'#finder';});
    return;
  }

  /* ---------- browser mode ---------- */
  var PAGE=6;
  var rows=[].slice.call(list.querySelectorAll('.crow'));
  var countEl=document.getElementById('fCount'),empty=document.getElementById('cEmpty'),pager=document.getElementById('cPager');
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var active={course:'',type:'',state:'',month:''},page=1;

  function iso(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
  var now=new Date(),today=iso(now);
  var in30=iso(new Date(now.getFullYear(),now.getMonth(),now.getDate()+30));
  var in3m=iso(new Date(now.getFullYear(),now.getMonth()+3,now.getDate()));

  /* courses that have already started are never shown */
  rows=rows.filter(function(r){if(r.dataset.date<today){r.remove();return false;}return true;});

  function inMonth(r,v){
    if(!v)return true;
    var d=r.dataset.date;
    if(v==='n30')return d<=in30;
    if(v==='n90')return d<=in3m;
    return d.slice(0,7)===v;
  }
  /* month options come from the HTML; here we only add "(N)" and grey out months with nothing to show.
     Counts follow the other three dropdowns. Past months are hidden. */
  var mOpts=[].slice.call(f.month.querySelectorAll('option')).filter(function(o){return o.value;});
  mOpts.forEach(function(o){o.dataset.label=o.textContent.replace(/\s*\(\d+\)$/,'');});
  function countMonths(){
    var c=f.course.value,t=f.type.value,s=f.state.value,thisMonth=today.slice(0,7);
    var pool=rows.filter(function(r){return (!c||r.dataset.course===c)&&(!t||r.dataset.type===t)&&(!s||r.dataset.state===s);});
    mOpts.forEach(function(o){
      var past=/^\d{4}-\d{2}$/.test(o.value)&&o.value<thisMonth;
      o.hidden=past;
      var n=past?0:pool.filter(function(r){return inMonth(r,o.value);}).length;
      o.textContent=o.dataset.label+' ('+n+')';o.disabled=!n;
    });
    [].forEach.call(f.month.querySelectorAll('optgroup'),function(g){
      g.hidden=![].some.call(g.children,function(o){return !o.hidden;});
    });
    if(f.month.selectedOptions[0]&&f.month.selectedOptions[0].disabled)f.month.value='';
  }
  [f.course,f.type,f.state].forEach(function(el){el.addEventListener('change',countMonths);});

  function match(r){
    return (!active.course||r.dataset.course===active.course)&&(!active.type||r.dataset.type===active.type)&&
           (!active.state||r.dataset.state===active.state)&&inMonth(r,active.month);
  }
  function current(){
    var l=rows.filter(match),dir=sortEl.value==='old'?1:-1;
    return l.sort(function(a,b){return a.dataset.date<b.dataset.date?-dir:a.dataset.date>b.dataset.date?dir:0;});
  }
  function render(animate){
    var l=current(),pages=Math.max(1,Math.ceil(l.length/PAGE));page=Math.min(page,pages);
    rows.forEach(function(r){r.hidden=true;r.classList.remove('shown');});
    l.forEach(function(r,i){list.appendChild(r);if(i>=(page-1)*PAGE&&i<page*PAGE){r.hidden=false;if(animate&&!reduce){void r.offsetWidth;r.classList.add('shown');}}});
    countEl.textContent=l.length;empty.hidden=l.length>0;
    var h='<button type="button" data-p="prev"'+(page===1?' disabled':'')+'>Prev</button>';
    for(var i=1;i<=pages;i++)h+='<button type="button" data-p="'+i+'"'+(i===page?' class="on" aria-current="page"':'')+'>'+i+'</button>';
    h+='<button type="button" data-p="next"'+(page===pages?' disabled':'')+'>Next</button>';
    pager.innerHTML=h;pager.style.display=pages>1?'':'none';
  }
  function top(){document.getElementById('finder').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});}

  form.addEventListener('submit',function(e){
    e.preventDefault();for(var k in f)active[k]=f[k].value;page=1;render(true);
  });
  reset.addEventListener('click',function(){
    for(var k in f){f[k].value='';active[k]='';}countMonths();page=1;render(true);
  });
  sortEl.addEventListener('change',function(){page=1;render(true);});
  pager.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||b.disabled)return;
    var p=b.dataset.p;page=p==='prev'?page-1:p==='next'?page+1:+p;render(true);top();
  });
  countMonths();render(false);
})();
