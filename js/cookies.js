/* Cookie consent: banner + preferences panel, choice saved for 12 months.
   Read the choice anywhere with window.mhfaConsent.get() -> {necessary,preferences,performance,marketing}
   or listen for:  document.addEventListener('mhfa:consent', function(e){ e.detail ... })
   Any element with data-cookie-settings (e.g. a footer "Cookie Settings" link) reopens the panel.
   DYNAMIC: point COOKIE_NOTICE_URL at the real Cookies Notice page. */
(function(){
  var KEY='mhfa_consent',VERSION=1,DAYS=365,COOKIE_NOTICE_URL='#';
  var CATS=[
    {id:'necessary',name:'Strictly Necessary',fixed:true,desc:'Essential for the website to work, such as page navigation, security and forms. These cannot be switched off.'},
    {id:'preferences',name:'Preference Cookies',desc:'Remember your choices, such as language or region, to give you a more personal experience.'},
    {id:'performance',name:'Performance Cookies',desc:'Help us understand how visitors use the site so we can improve its speed and content.'},
    {id:'marketing',name:'Marketing Cookies',desc:'Used to show you relevant information about our courses on other websites and measure campaigns.'}
  ];

  function read(){
    var v=null;
    try{v=JSON.parse(localStorage.getItem(KEY));}catch(e){}
    if(!v){var m=document.cookie.match(new RegExp('(?:^|; )'+KEY+'=([^;]*)'));if(m){try{v=JSON.parse(decodeURIComponent(m[1]));}catch(e){}}}
    if(!v||v.v!==VERSION||(v.t&&Date.now()-v.t>DAYS*864e5))return null;
    return v;
  }
  function save(c){
    var v={v:VERSION,t:Date.now(),necessary:true,preferences:!!c.preferences,performance:!!c.performance,marketing:!!c.marketing};
    var s=JSON.stringify(v);
    try{localStorage.setItem(KEY,s);}catch(e){}
    document.cookie=KEY+'='+encodeURIComponent(s)+';max-age='+DAYS*86400+';path=/;SameSite=Lax'+(location.protocol==='https:'?';Secure':'');
    try{document.dispatchEvent(new CustomEvent('mhfa:consent',{detail:v}));}catch(e){}
    return v;
  }
  window.mhfaConsent={get:read,open:function(){openPanel();}};

  var bar,modal,lastFocus;
  function build(){
    bar=document.createElement('div');
    bar.className='ck-bar';bar.setAttribute('role','region');bar.setAttribute('aria-label','Cookie consent');bar.hidden=true;
    bar.innerHTML='<div class="ck-in"><p class="ck-txt">We and our partners use cookies on this website for different purposes. We use strictly necessary cookies that are essential for basic website functionality and cannot be switched off. We also use other cookies such as preference, performance, and marketing cookies to provide you with the best possible digital experience, enhance the performance of this website, optimize our services, and to show you relevant information. Accept all cookies allow us to use cookies for the purposes stated above. Customize your preferences to choose which cookies you want us to enable. Discover more in our <a href="'+COOKIE_NOTICE_URL+'">Cookies Notice</a>.</p>'+
      '<div class="ck-btns"><button type="button" class="ck-btn ol" data-ck="custom">Customize Preferences</button><button type="button" class="ck-btn" data-ck="necessary">Accept Strictly Necessary Only</button><button type="button" class="ck-btn" data-ck="all">Accept All Cookies</button></div></div>';
    document.body.appendChild(bar);

    modal=document.createElement('div');
    modal.className='ck-modal';modal.hidden=true;
    var rows=CATS.map(function(c){
      var ctl=c.fixed?'<span class="ck-on">Always active</span>':'<label class="ck-sw"><input type="checkbox" data-cat="'+c.id+'" aria-label="'+c.name+'"><span></span></label>';
      return '<div class="ck-cat"><div class="ck-row"><h3>'+c.name+'</h3>'+ctl+'</div><p>'+c.desc+'</p></div>';
    }).join('');
    modal.innerHTML='<div class="ck-box" role="dialog" aria-modal="true" aria-labelledby="ckTitle"><div class="ck-hd"><h2 id="ckTitle">Cookie Preferences</h2><button type="button" class="ck-x" data-ck="close" aria-label="Close">&times;</button></div>'+
      '<div class="ck-bd"><p>Choose which cookies you allow. You can change these settings at any time.</p>'+rows+'</div>'+
      '<div class="ck-ft"><button type="button" class="ck-btn ol" data-ck="all">Accept All Cookies</button><button type="button" class="ck-btn" data-ck="save">Save My Preferences</button></div></div>';
    document.body.appendChild(modal);

    document.addEventListener('click',function(e){
      var s=e.target.closest('[data-cookie-settings]');
      if(s){e.preventDefault();openPanel();return;}
      var b=e.target.closest('[data-ck]');
      if(!b){if(e.target===modal)closePanel();return;}
      var a=b.getAttribute('data-ck');
      if(a==='custom')openPanel();
      else if(a==='necessary'){save({});done();}
      else if(a==='all'){save({preferences:1,performance:1,marketing:1});done();}
      else if(a==='save'){var c={};[].forEach.call(modal.querySelectorAll('[data-cat]'),function(i){c[i.getAttribute('data-cat')]=i.checked;});save(c);done();}
      else if(a==='close')closePanel();
    });
    document.addEventListener('keydown',function(e){
      if(modal.hidden)return;
      if(e.key==='Escape'){closePanel();return;}
      if(e.key==='Tab'){
        var f=[].slice.call(modal.querySelectorAll('button,input,a[href]'));var first=f[0],last=f[f.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    });
  }
  function showBar(){bar.hidden=false;requestAnimationFrame(function(){requestAnimationFrame(function(){bar.classList.add('show');});});}
  function hideBar(){bar.classList.remove('show');setTimeout(function(){bar.hidden=true;},400);}
  function openPanel(){
    if(!modal)build();
    var v=read()||{};
    [].forEach.call(modal.querySelectorAll('[data-cat]'),function(i){i.checked=!!v[i.getAttribute('data-cat')];});
    lastFocus=document.activeElement;modal.hidden=false;document.documentElement.style.overflow='hidden';
    modal.querySelector('.ck-x').focus();
  }
  function closePanel(){
    modal.hidden=true;document.documentElement.style.overflow='';
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  function done(){if(!modal.hidden)closePanel();hideBar();}

  function init(){build();if(!read())showBar();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
