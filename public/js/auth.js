<script type="module">
  import {
    onAuthStateChanged, signInWithEmailAndPassword,
    createUserWithEmailAndPassword, signOut
  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
  import {
    doc, getDoc, setDoc, collection, query, where, getDocs, addDoc
  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

  const auth = window.firebaseAuth;
  const db   = window.firebaseDB;

  const $ = (sel)=>document.querySelector(sel);
  const show = (el, on=true)=> el && (el.style.display = on ? '' : 'none');

  const form = $("#auth-form");
  const email = $("#auth-email");
  const pass  = $("#auth-pass");
  const btnToggle = $("#auth-toggle");
  const btnLogout = $("#logout-btn");

  const blocGarage  = $("#garage-panel");
  const blocClient  = $("#client-panel");
  const blocLogin   = $("#login-panel");

  let mode = "signup"; // "login" | "signup"
  if (btnToggle) btnToggle.addEventListener("click", () => {
    mode = (mode === "signup" ? "login" : "signup");
    btnToggle.textContent = (mode === "signup") ? "J'ai déjà un compte" : "Créer un compte";
  });

  if (form) form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    try{
      if(mode==='signup'){
        const cred = await createUserWithEmailAndPassword(auth, email.value, pass.value);
        await setDoc(doc(db, "users", cred.user.uid), { email: email.value, role: "CUSTOMER", createdAt: Date.now() }, { merge: true });
      }else{
        await signInWithEmailAndPassword(auth, email.value, pass.value);
      }
    }catch(err){ alert(err.message); }
  });

  if (btnLogout) btnLogout.addEventListener("click", ()=> signOut(auth));

  async function getRole(uid){
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? (snap.data().role || "CUSTOMER") : "CUSTOMER";
  }

  onAuthStateChanged(auth, async (user)=>{
    if(!user){
      show(blocLogin, true); show(blocGarage, false); show(blocClient, false); return;
    }
    show(blocLogin, false);
    const role = await getRole(user.uid);
    if (role === "ADMIN" || role === "MECHANIC"){
      show(blocGarage, true); show(blocClient, false); loadGarageList();
    } else {
      show(blocGarage, false); show(blocClient, true); loadClientList(user.uid);
    }
  });

  async function loadGarageList(){
    const snap = await getDocs(collection(db,'workOrders'));
    const ul = $("#garage-wo-list"); if(!ul) return;
    ul.innerHTML='';
    snap.forEach(d=>{
      const it=d.data();
      const li=document.createElement('li');
      li.textContent = `OR ${d.id} — statut: ${it.status||'DRAFT'} — total: ${it.estimateTotal||0}€`;
      ul.appendChild(li);
    });
  }

  async function loadClientList(uid){
    const userSnap = await getDoc(doc(db,'users',uid));
    const cid = userSnap.exists()? userSnap.data().customerId : null;
    const ul = $("#client-wo-list"); if(!ul) return;
    if(!cid){ ul.innerHTML='<li>Compte client non associé.</li>'; return; }
    const vehicles = await getDocs(query(collection(db,'vehicles'), where('customerId','==', cid)));
    const vids = vehicles.docs.map(d=>d.id);
    const all = await getDocs(collection(db,'workOrders'));
    ul.innerHTML='';
    all.forEach(d=>{
      const it = d.data();
      if (vids.includes(it.vehicleId)){
        const li=document.createElement('li');
        li.textContent = `OR ${d.id} — statut: ${it.status||'DRAFT'} — total: ${it.estimateTotal||0}€`;
        ul.appendChild(li);
      }
    });
  }

  const newBtn = $("#garage-new-wo");
  const vehicleIdInput = $("#garage-vehicle-id");
  if (newBtn) newBtn.addEventListener("click", async ()=>{
    const v = vehicleIdInput?.value?.trim();
    if(!v) return alert('vehicleId requis');
    await addDoc(collection(db,'workOrders'), { vehicleId:v, status:'DRAFT', estimateTotal:0, createdAt: Date.now() });
    await loadGarageList();
  });
</script>
