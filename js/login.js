/* Login page behaviour only: role tabs change the welcome text and the hidden "role" field */
(function(){
  var tabs=[].slice.call(document.querySelectorAll('.lg-tabs [role=tab]'));
  if(!tabs.length)return;
  var r=document.getElementById('lgRole'),s=document.getElementById('lgSub'),hs=[].slice.call(document.querySelectorAll('.lg-role-in'));
  function pick(t){
    if(t.getAttribute('aria-selected')==='true')return;
    /* switching role starts again from the first screen with clean fields */
    document.querySelectorAll('.lg-pane form, form.lg-pane').forEach(function(f){f.reset();});
    document.querySelectorAll('.lg-err').forEach(function(x){x.hidden=true;});
    document.querySelectorAll('.lg-f input.bad,.lg-boxes input.on').forEach(function(x){x.classList.remove('bad','on');});
    document.querySelectorAll('.lg-eye input').forEach(function(x){x.type='password';});
    document.querySelectorAll('.lg-show').forEach(function(x){x.classList.remove('on');});
    if(window.lgShow)window.lgShow('lgPass',true);
    tabs.forEach(function(b){var on=b===t;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;});
    r.textContent=t.dataset.role;s.textContent=t.dataset.sub;hs.forEach(function(h){h.value=t.dataset.role;});
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){pick(t);});
    t.addEventListener('keydown',function(e){
      var n=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:-1;
      if(n<0||n>=tabs.length)return;e.preventDefault();pick(tabs[n]);tabs[n].focus();
    });
  });
})();

/* OTP login: switches between password / send-OTP / verify panes. All text lives in the HTML. */
(function(){
  var panes=[].slice.call(document.querySelectorAll('.lg-pane'));
  if(panes.length<3)return;
  var idIn=document.getElementById('lgId'),idErr=document.getElementById('lgIdErr'),
      f1=document.getElementById('lgOtp1'),f2=document.getElementById('lgOtp2'),
      boxes=[].slice.call(document.querySelectorAll('.lg-boxes input')),
      val=document.getElementById('lgOtpVal'),err=document.getElementById('lgOtpErr'),
      mask=document.getElementById('lgMasked'),hid=document.getElementById('lgIdHid'),
      timer=document.getElementById('lgTimer'),resend=document.getElementById('lgResend'),t=null;
  function show(id,noFocus){
    panes.forEach(function(p){var on=p.id===id;p.classList.toggle('cur',on);
      if(on)p.removeAttribute('inert');else p.setAttribute('inert','');});
    var p=document.getElementById(id),first=p.querySelector('input:not([type=hidden])');
    if(first&&!noFocus)setTimeout(function(){first.focus();},60);
  }
  window.lgShow=show;
  panes.forEach(function(p){if(!p.classList.contains('cur'))p.setAttribute('inert','');});
  document.querySelectorAll('[data-pane]').forEach(function(b){
    b.addEventListener('click',function(){
      if(b.dataset.pane==='lgPass')clearInterval(t);
      show(b.dataset.pane);
    });
  });
  function maskId(v){
    if(v.indexOf('@')>0){var a=v.split('@');return a[0].charAt(0)+'***'+a[0].slice(-1)+'@'+a[1];}
    return '******'+v.slice(-4);
  }
  function start(){
    var n=+timer.dataset.secs;resend.hidden=true;timer.hidden=false;clearInterval(t);
    function tick(){
      timer.textContent=timer.dataset.label+' 0:'+(n<10?'0':'')+n;
      if(n--<=0){clearInterval(t);timer.hidden=true;resend.hidden=false;}
    }
    tick();t=setInterval(tick,1000);
  }
  function clearBoxes(){boxes.forEach(function(b){b.value='';b.classList.remove('on');});err.hidden=true;}
  f1.addEventListener('submit',function(e){
    e.preventDefault();
    var v=idIn.value.trim(),ok=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)||/^[0-9]{10}$/.test(v);
    if(!ok){idErr.textContent=v?idErr.dataset.bad:idErr.dataset.empty;idErr.hidden=false;idIn.classList.add('bad');idIn.focus();return;}
    idErr.hidden=true;idIn.classList.remove('bad');
    hid.value=v;mask.textContent=maskId(v);clearBoxes();show('lgOtp2');start();
    /* Laravel: POST to the send-OTP route here, then show the verify pane on success */
  });
  idIn.addEventListener('input',function(){idErr.hidden=true;idIn.classList.remove('bad');});
  document.getElementById('lgChange').addEventListener('click',function(){clearInterval(t);show('lgOtp1');});
  resend.addEventListener('click',function(){clearBoxes();start();boxes[0].focus();/* Laravel: call resend route */});
  boxes.forEach(function(b,i){
    b.addEventListener('input',function(){
      b.value=b.value.replace(/\D/g,'').slice(-1);b.classList.toggle('on',!!b.value);err.hidden=true;
      if(b.value&&boxes[i+1])boxes[i+1].focus();
    });
    b.addEventListener('keydown',function(e){
      if(e.key==='Backspace'&&!b.value&&boxes[i-1]){boxes[i-1].focus();}
      if(e.key==='ArrowLeft'&&boxes[i-1])boxes[i-1].focus();
      if(e.key==='ArrowRight'&&boxes[i+1])boxes[i+1].focus();
    });
    b.addEventListener('paste',function(e){
      var d=(e.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'').slice(0,6);
      if(!d)return;e.preventDefault();
      boxes.forEach(function(x,k){x.value=d.charAt(k)||'';x.classList.toggle('on',!!x.value);});
      boxes[Math.min(d.length,5)].focus();
    });
  });
  f2.addEventListener('submit',function(e){
    var code=boxes.map(function(b){return b.value;}).join('');
    val.value=code;
    if(code.length<6){e.preventDefault();err.textContent=err.dataset.short;err.hidden=false;
      boxes[code.length].focus();}
    else e.preventDefault(); /* demo: Laravel posts the form for real */
  });
})();

/* Forgot password: send OTP -> verify OTP -> new password -> done. All text lives in the HTML. */
(function(){
  var f1=document.getElementById('lgFg1');if(!f1)return;
  var f2=document.getElementById('lgFg2'),f3=document.getElementById('lgFg3'),
      idIn=document.getElementById('lgFgId'),idErr=document.getElementById('lgFgIdErr'),
      boxes=[].slice.call(f2.querySelectorAll('.lg-boxes input')),
      val=document.getElementById('lgFgOtpVal'),err=document.getElementById('lgFgOtpErr'),
      mask=document.getElementById('lgFgMasked'),hid=document.getElementById('lgFgHid'),
      timer=document.getElementById('lgFgTimer'),resend=document.getElementById('lgFgResend'),t=null;
  function go(id){window.lgShow(id);}
  function maskId(v){
    if(v.indexOf('@')>0){var a=v.split('@');return a[0].charAt(0)+'***'+a[0].slice(-1)+'@'+a[1];}
    return '******'+v.slice(-4);
  }
  function start(){
    var n=+timer.dataset.secs;resend.hidden=true;timer.hidden=false;clearInterval(t);
    function tick(){timer.textContent=timer.dataset.label+' 0:'+(n<10?'0':'')+n;
      if(n--<=0){clearInterval(t);timer.hidden=true;resend.hidden=false;}}
    tick();t=setInterval(tick,1000);
  }
  function clear(){boxes.forEach(function(b){b.value='';b.classList.remove('on');});err.hidden=true;}
  document.querySelectorAll('[data-pane=lgPass]').forEach(function(b){b.addEventListener('click',function(){clearInterval(t);});});
  f1.addEventListener('submit',function(e){
    e.preventDefault();
    var v=idIn.value.trim(),ok=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)||/^[0-9]{10}$/.test(v);
    if(!ok){idErr.textContent=v?idErr.dataset.bad:idErr.dataset.empty;idErr.hidden=false;idIn.classList.add('bad');idIn.focus();return;}
    idErr.hidden=true;idIn.classList.remove('bad');
    hid.value=v;mask.textContent=maskId(v);clear();go('lgFg2');start();
    /* Laravel: POST forgot/send, then show the verify screen */
  });
  idIn.addEventListener('input',function(){idErr.hidden=true;idIn.classList.remove('bad');});
  document.getElementById('lgFgChange').addEventListener('click',function(){clearInterval(t);go('lgFg1');});
  resend.addEventListener('click',function(){clear();start();boxes[0].focus();/* Laravel: forgot/resend */});
  boxes.forEach(function(b,i){
    b.addEventListener('input',function(){
      b.value=b.value.replace(/\D/g,'').slice(-1);b.classList.toggle('on',!!b.value);err.hidden=true;
      if(b.value&&boxes[i+1])boxes[i+1].focus();
    });
    b.addEventListener('keydown',function(e){
      if(e.key==='Backspace'&&!b.value&&boxes[i-1])boxes[i-1].focus();
      if(e.key==='ArrowLeft'&&boxes[i-1])boxes[i-1].focus();
      if(e.key==='ArrowRight'&&boxes[i+1])boxes[i+1].focus();
    });
    b.addEventListener('paste',function(e){
      var d=(e.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'').slice(0,6);
      if(!d)return;e.preventDefault();
      boxes.forEach(function(x,k){x.value=d.charAt(k)||'';x.classList.toggle('on',!!x.value);});
      boxes[Math.min(d.length,5)].focus();
    });
  });
  f2.addEventListener('submit',function(e){
    e.preventDefault();
    var code=boxes.map(function(b){return b.value;}).join('');val.value=code;
    if(code.length<6){err.textContent=err.dataset.short;err.hidden=false;boxes[code.length].focus();return;}
    clearInterval(t);go('lgFg3');/* Laravel: POST forgot/verify, store the returned token in f3 [name=token] */
  });
  var p1=document.getElementById('lgNew'),p2=document.getElementById('lgNew2'),pe=document.getElementById('lgNewErr');
  f3.querySelectorAll('.lg-show').forEach(function(b){
    b.addEventListener('click',function(){
      var i=b.previousElementSibling,on=i.type==='password';i.type=on?'text':'password';
      b.classList.toggle('on',on);b.setAttribute('aria-label',on?'Hide password':'Show password');
    });
  });
  [p1,p2].forEach(function(i){i.addEventListener('input',function(){pe.hidden=true;});});
  f3.addEventListener('submit',function(e){
    e.preventDefault();
    var v=p1.value,msg='';
    if(v.length<8||!/[A-Za-z]/.test(v)||!/[0-9]/.test(v)){msg=pe.dataset.rule;p1.focus();}
    else if(v!==p2.value){msg=pe.dataset.match;p2.focus();}
    if(msg){pe.textContent=msg;pe.hidden=false;return;}
    go('lgFg4');/* Laravel: POST forgot/reset, then show the success screen */
  });
})();
