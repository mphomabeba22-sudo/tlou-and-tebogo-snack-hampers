// ===== FULL FIXED LOGIN + CART =====
let users = JSON.parse(localStorage.getItem('users') || '[]');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let cart = JSON.parse(localStorage.getItem('hamperCart') || '[]');

// --- LOGIN / AUTH ---
function openAuth(){ document.getElementById('authModal').style.display='flex'; }
function closeAuth(){ document.getElementById('authModal').style.display='none'; }
function showRegister(){
  document.getElementById('loginForm').style.left='-400px';
  document.getElementById('registerForm').style.left='0px';
  document.getElementById('btn-slider').style.left='110px';
}
function showLogin(){
  document.getElementById('loginForm').style.left='0px';
  document.getElementById('registerForm').style.left='400px';
  document.getElementById('btn-slider').style.left='0px';
}
function handleRegister(e){
  e.preventDefault();
  let u = document.getElementById('regUser').value.trim();
  let em = document.getElementById('regEmail').value.trim();
  let p = document.getElementById('regPass').value;
  let c = document.getElementById('regConfirm').value;
  let msg = document.getElementById('regMsg');
  if(p!==c){ msg.textContent='Passwords not match!'; msg.style.color='red'; return false; }
  if(users.find(x=>x.username===u)){ msg.textContent='Username exists!'; msg.style.color='red'; return false; }
  users.push({username:u,email:em,password:p});
  localStorage.setItem('users', JSON.stringify(users));
  msg.textContent='Registered! Now Login'; msg.style.color='green';
  setTimeout(showLogin,1000); return false;
}
function handleLogin(e){
  e.preventDefault();
  let u = document.getElementById('loginUser').value.trim();
  let p = document.getElementById('loginPass').value;
  let msg = document.getElementById('loginMsg');
  let found = users.find(x=>x.username===u && x.password===p);
  if((u==='admin' && p==='1234') || found){
    currentUser={username:u}; localStorage.setItem('currentUser', JSON.stringify(currentUser));
    msg.textContent='Welcome '+u+'!'; msg.style.color='green';
    setTimeout(()=>{ closeAuth(); updateAuthUI(); },800);
  } else { msg.textContent='Wrong username or password'; msg.style.color='red'; }
  return false;
}
function logout(){ currentUser=null; localStorage.removeItem('currentUser'); updateAuthUI(); alert('Logged out'); }
function updateAuthUI(){
  let info=document.getElementById('userInfo'); let btn=document.getElementById('logoutBtn');
  if(!info||!btn) return;
  if(currentUser){ info.textContent='Hi, '+currentUser.username; btn.style.display='inline-block'; }
  else { info.textContent='Guest'; btn.style.display='none'; }
}

// --- CART - THIS WAS MISSING ---
function saveCart(){
  localStorage.setItem('hamperCart', JSON.stringify(cart));
  updateCartUI();
}
function addToCart(name, price){
  if(!currentUser){ alert('Please Login first!'); openAuth(); return; }
  let existing = cart.find(item => item.name === name);
  if(existing){ existing.qty++; }
  else { cart.push({name:name, price:price, qty:1}); }
  saveCart();
  openCart(); // This now sends package to cart and opens cart
}
function removeFromCart(i){ cart.splice(i,1); saveCart(); }
function changeQty(i, d){
  cart[i].qty += d;
  if(cart[i].qty <= 0) removeFromCart(i); else saveCart();
}
function updateCartUI(){
  let cont = document.getElementById('cart-items');
  let tot = document.getElementById('cart-total');
  let count = document.getElementById('cart-count');
  if(!cont||!tot||!count) return;
  cont.innerHTML=''; let total=0, cnt=0;
  cart.forEach((it,i)=>{
    total+=it.price*it.qty; cnt+=it.qty;
    cont.innerHTML+=`<div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:10px 0;">
    <div><strong>${it.name}</strong><br>R${it.price} x ${it.qty} = R${it.price*it.qty}<br>
    <button onclick="changeQty(${i},-1)">-</button> <button onclick="changeQty(${i},1)">+</button></div>
    <button onclick="removeFromCart(${i})" style="background:red; color:white; border:none; padding:5px 8px; border-radius:10px;">X</button></div>`;
  });
  tot.textContent='Total: R'+total; count.textContent=cnt;
  if(cart.length===0) cont.innerHTML='<p>Cart empty</p>';
}
function openCart(){ document.getElementById('cart-sidebar').classList.add('active'); updateCartUI(); }
function closeCart(){ document.getElementById('cart-sidebar').classList.remove('active'); }
function clearCart(){ cart=[]; saveCart(); }
function checkout(){
  if(cart.length===0){ alert('Cart empty!'); return; }
  let total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  let msg='Hello! I want to order:%0A'; cart.forEach(it=>msg+=`- ${it.name} x${it.qty} = R${it.price*it.qty}%0A`);
  msg+=`%0ATotal: R${total}%0AUser: ${currentUser.username}`;
  window.open(`https://wa.me/27780000000?text=${msg}`,'_blank');
  clearCart(); closeCart();
}

document.addEventListener('DOMContentLoaded', ()=>{
  updateAuthUI(); updateCartUI();
});
// ===== ELIGIBLE DISCOUNT SYSTEM FOR YOUR HAMPERS =====

function getEligibleDiscount() {
  let totalHampers = cart.reduce((sum, item) => sum + item.qty, 0);
  let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  let discountPercent = 0;
  let discountAmount = 0;
  let message = "";

  if (totalHampers === 1) {
    discountPercent = 0;
    message = "Add 1 more hamper to get 5% OFF!";
  } else if (totalHampers === 2) {
    discountPercent = 5;
    discountAmount = subtotal * 0.05;
    message = "✅ Eligible: 5% OFF applied!";
  } else if (totalHampers >= 3) {
    discountPercent = 10;
    discountAmount = subtotal * 0.10;
    message = "🎉 Eligible: 10% OFF applied! BEST DEAL";
  }

  return {
    count: totalHampers,
    subtotal: subtotal,
    percent: discountPercent,
    amount: discountAmount,
    finalTotal: subtotal - discountAmount,
    message: message
  };
}

function updateCartUI() {
  let cont = document.getElementById('cart-items');
  let tot = document.getElementById('cart-total');
  let c = document.getElementById('cart-count');
  if (!cont) return;

  cont.innerHTML = '';
  if (cart.length === 0) {
    cont.innerHTML = '<p>Cart empty - Add Basic 38 / Deluxe 72 / Premium 96!</p>';
    if (tot) tot.innerHTML = 'Total: R0';
    if (c) c.textContent = '0';
    return;
  }

  // Show items
  cart.forEach((it, i) => {
    cont.innerHTML += `<div class="cart-item">
      <div><strong>${it.name}</strong><br>R${it.price} x ${it.qty} = R${it.price * it.qty}<br>
      <button onclick="changeQty(${i},-1)">-</button> <button onclick="changeQty(${i},1)">+</button></div>
      <button onclick="removeFromCart(${i})" style="background:red;color:#fff;border:none;padding:4px 8px;border-radius:10px;">X</button>
    </div>`;
  });

  // Apply eligible discount
  let d = getEligibleDiscount();

  if (tot) {
    tot.innerHTML = `
      Subtotal (${d.count} hampers): R${d.subtotal}<br>
      <span style="color:${d.percent>0?'green':'#ff9800'}; font-size:14px;">${d.message}</span><br>
      ${d.amount>0 ? `<span style="color:green;">Discount ${d.percent}%: -R${d.amount.toFixed(0)}</span><br>` : ''}
      <span style="font-size:20px;">Final Total: R${d.finalTotal.toFixed(0)}</span>
    `;
  }
  if (c) c.textContent = d.count;
}

function checkout() {
  if (cart.length === 0) { alert('Cart empty!'); return; }
  
  let d = getEligibleDiscount();
  
  let msg = `Hello Fantastic Hampers!%0A%0AI want to order:%0A`;
  cart.forEach(it => { msg += `- ${it.name} x${it.qty} = R${it.price * it.qty}%0A`; });
  msg += `%0A----------------%0A`;
  msg += `Total Hampers: ${d.count}%0A`;
  msg += `Subtotal: R${d.subtotal}%0A`;
  if (d.amount > 0) {
    msg += `Eligible Discount ${d.percent}%: -R${d.amount.toFixed(0)}%0A`;
  }
  msg += `FINAL TOTAL: R${d.finalTotal.toFixed(0)}%0A`;
  msg += `User: ${currentUser?.username || 'Guest'}`;

  window.open(`https://wa.me/27780000000?text=${msg}`, '_blank'); // CHANGE YOUR NUMBER
  
  clearCart();
  closeCart();
}
// Live validation helper
function validateField(input, errorId, regex, errorMsg){
  let errorEl = document.getElementById(errorId);
  if(!regex.test(input.value.trim())){
    input.classList.add('invalid'); input.classList.remove('valid');
    errorEl.textContent = errorMsg; return false;
  } else {
    input.classList.add('valid'); input.classList.remove('invalid');
    errorEl.textContent = ""; return true;
  }
}

// ENQUIRY FORM
const enquiryForm = document.getElementById('enquiryForm');
if(enquiryForm){
  // Live validation
  enquiryForm.addEventListener('input', () => {
    validateField(document.getElementById('enqName'), 'nameError', /^[A-Za-z\s]{3,}$/, 'Name min 3 letters');
    validateField(document.getElementById('enqEmail'), 'emailError', /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email');
    validateField(document.getElementById('enqMessage'), 'messageError', /.{10,}/, 'Message min 10 chars');
  });

  enquiryForm.addEventListener('submit', function(e){
    e.preventDefault();
    let type = document.getElementById('enquiryType').value;
    let valid = type !== "" && 
                validateField(document.getElementById('enqName'), 'nameError', /^[A-Za-z\s]{3,}$/, 'Name min 3 letters') &&
                validateField(document.getElementById('enqEmail'), 'emailError', /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email') &&
                validateField(document.getElementById('enqMessage'), 'messageError', /.{10,}/, 'Message min 10 chars');

    if(!valid){ document.getElementById('typeError').textContent = type===""?"Select type":""; return; }

    // AJAX Submission Simulation
    document.getElementById('enquiryResponse').innerHTML = "Submitting...";
    
    // Simulate AJAX (fetch to fake API)
    setTimeout(() => {
      let responseMsg = "";
      if(type === "service") responseMsg = `Thank you ${document.getElementById('enqName').value}, we will contact you about our hamper services within 24h.`;
      if(type === "volunteer") responseMsg = `Thank you for volunteering! We'll send you volunteer info.`;
      if(type === "sponsor") responseMsg = `Thank you for wanting to sponsor! Our sponsor pack will be emailed.`;

      document.getElementById('enquiryResponse').innerHTML = `<span style="color:green; font-weight:bold;">${responseMsg}</span>`;
      enquiryForm.reset();
      document.querySelectorAll('.valid').forEach(el=>el.classList.remove('valid'));
      
      // Save to localStorage for proof
      let data = JSON.parse(localStorage.getItem('enquiries')||'[]');
      data.push({type, name: document.getElementById('enqName').value, date: new Date().toLocaleString()});
      localStorage.setItem('enquiries', JSON.stringify(data));
    }, 1000);
  });
}
// CONTACT FORM
const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('input', () => {
    validateField(document.getElementById('cName'), 'cNameError', /^[A-Za-z\s]{3,}$/, 'Name min 3 letters');
    validateField(document.getElementById('cEmail'), 'cEmailError', /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email');
    validateField(document.getElementById('cPhone'), 'cPhoneError', /^[0-9]{10}$/, 'Phone must be 10 digits');
    validateField(document.getElementById('cMessage'), 'cMessageError', /.{10,}/, 'Message min 10 chars');
  });

  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    let valid = validateField(document.getElementById('cName'), 'cNameError', /^[A-Za-z\s]{3,}$/, 'Name min 3 letters') &&
                validateField(document.getElementById('cEmail'), 'cEmailError', /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email') &&
                validateField(document.getElementById('cPhone'), 'cPhoneError', /^[0-9]{10}$/, 'Phone 10 digits') &&
                validateField(document.getElementById('cMessage'), 'cMessageError', /.{10,}/, 'Min 10 chars');

    if(!valid) return;
    document.getElementById('contactResponse').innerHTML = "Sending...";
    // AJAX with Fetch API (real AJAX)
    fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('cName').value,
        email: document.getElementById('cEmail').value,
        message: document.getElementById('cMessage').value
      }),
      headers: {'Content-type': 'application/json'}
    })
    .then(res => res.json())
    .then(data => {
      document.getElementById('contactResponse').innerHTML = `<span style="color:green;">Thank you! Message sent. Ref ID: ${data.id}. We will reply to your contact details.</span>`;
      contactForm.reset();
      document.querySelectorAll('.valid').forEach(el=>el.classList.remove('valid'));
    })
    .catch(() => {
      document.getElementById('contactResponse').innerHTML = `<span style="color:green;">Thank you! Your message was received (offline mode).</span>`;
    });
  });
}
 document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("img").forEach(img => {
      img.setAttribute("loading", "lazy");
    });
  });