/* Instructor application: step navigation + per-step validation (no content stored here) */
(function(){
  var form=document.getElementById('iaForm');if(!form)return;
  var steps=[].slice.call(form.querySelectorAll('.step')),bar=[].slice.call(form.querySelectorAll('.ia-steps li'));
  var panel=document.getElementById('iaPanel'),thanks=document.getElementById('iaThanks');
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var cur=0;
  function go(i,focus){
    cur=i;
    steps.forEach(function(s,n){s.classList.toggle('cur',n===i);});
    bar.forEach(function(li,n){
      li.classList.toggle('on',n===i);li.classList.toggle('done',n<i);
      if(n===i)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');
    });
    if(focus!==false){var h=steps[i].querySelector('h2');if(h)h.focus({preventScroll:true});}
    var top=panel.getBoundingClientRect().top;
    if(top<0)window.scrollTo({top:window.pageYOffset+top-70,behavior:reduce?'auto':'smooth'});
  }
  function valid(step){
    var f=[].slice.call(step.querySelectorAll('input,select,textarea'));
    for(var k=0;k<f.length;k++){
      if(!f[k].checkValidity()){
        var qa=f[k].closest('.qa');if(qa)openQa(qa,true);
        f[k].focus();f[k].reportValidity();return false;
      }
    }
    return true;
  }
  form.addEventListener('click',function(e){
    var n=e.target.closest('.btn-next:not([type=submit])');
    if(n){if(valid(steps[cur]))go(cur+1);return;}
    if(e.target.closest('.btn-back')){go(cur-1);return;}
    var b=e.target.closest('.ia-steps button');
    if(b){var i=+b.dataset.go;if(i<cur)go(i);return;}
    var q=e.target.closest('.qa-h');if(q)openQa(q.parentNode,q.getAttribute('aria-expanded')!=='true');
  });
  function openQa(qa,open){
    /* only one question open at a time: opening one closes the others */
    if(open){[].forEach.call(qa.parentNode.querySelectorAll('.qa'),function(o){if(o!==qa)setQa(o,false);});}
    setQa(qa,open);
  }
  function setQa(qa,open){
    var h=qa.querySelector('.qa-h');h.setAttribute('aria-expanded',open);qa.querySelector('.qa-b').hidden=!open;qa.classList.toggle('open',open);
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    for(var i=0;i<steps.length;i++){if(!valid(steps[i])){go(i,false);valid(steps[i]);return;}}
    /* DYNAMIC: in Laravel this posts to the server and the success view is this Thank you panel */
    form.hidden=true;thanks.hidden=false;thanks.focus({preventScroll:true});
    var top=panel.getBoundingClientRect().top;if(top<0)window.scrollTo({top:window.pageYOffset+top-70,behavior:reduce?'auto':'smooth'});
  });
  /* digits only for phone / postal code */
  [].forEach.call(form.querySelectorAll('input[inputmode=numeric]'),function(el){
    el.addEventListener('input',function(){el.value=el.value.replace(/\D/g,'').slice(0,el.maxLength>0?el.maxLength:10);});
  });
  /* same as present address */
  var same=document.getElementById('sameAddr'),pa=form.elements.present_address,pp=form.elements.present_pin,ma=form.elements.permanent_address,mp=form.elements.permanent_pin;
  function copy(){if(!same.checked)return;ma.value=pa.value;mp.value=pp.value;}
  if(same){
    same.addEventListener('change',function(){ma.readOnly=mp.readOnly=same.checked;copy();});
    [pa,pp].forEach(function(el){el.addEventListener('input',copy);});
  }
  /* chosen file name */
  [].forEach.call(form.querySelectorAll('.file input'),function(inp){
    inp.addEventListener('change',function(){inp.parentNode.querySelector('.fn').textContent=inp.files.length?inp.files[0].name:'Choose File';});
  });
})();
