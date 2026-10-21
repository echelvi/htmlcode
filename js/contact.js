/* Contact page behaviour only: phone = digits only, exactly 10 */
(function(){
  var p=document.getElementById('fPhone');if(!p)return;
  function chk(){p.setCustomValidity(p.value&&!/^[0-9]{10}$/.test(p.value)?'Enter a 10-digit phone number':'');}
  p.addEventListener('input',function(){p.value=p.value.replace(/\D/g,'').slice(0,10);chk();});
  chk();
})();
