<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
  import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
  import { getStorage } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";

  // TODO: Remplacez par vos vraies valeurs du projet Firebase
  const firebaseConfig = {
    apiKey: "VOTRE_API_KEY",
    authDomain: "tano-garage.firebaseapp.com",
    projectId: "tano-garage",
    storageBucket: "tano-garage.firebasestorage.app",
    appId: "VOTRE_APP_ID"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db   = getFirestore(app);
  const sto  = getStorage(app);

  // Persistance offline Firestore
  enableIndexedDbPersistence(db).catch(()=>{});

  // Expose en global pour les autres scripts
  window.firebaseAuth = auth;
  window.firebaseDB   = db;
  window.firebaseSto  = sto;
</script>
