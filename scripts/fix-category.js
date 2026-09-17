import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBq22BlwDCE07fDqbEmFMBXznKqQF2Bv14",
  authDomain: "carla-v5.firebaseapp.com",
  projectId: "carla-v5",
  storageBucket: "carla-v5.firebasestorage.app",
  messagingSenderId: "118871134461",
  appId: "1:118871134461:web:7b806115a162302c7aae94"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixCategory() {
  console.log("Procurando o canal Cine Pipoca...");
  const snapshot = await getDocs(collection(db, 'channels'));
  let found = false;
  
  for (const channelDoc of snapshot.docs) {
    const data = channelDoc.data();
    if (data.name && data.name.includes("Pipoca") && data.category === "Músicas") {
      console.log(`Encontrado: ${data.name}. Movendo para Filmes...`);
      await updateDoc(doc(db, 'channels', channelDoc.id), {
        category: "Filmes"
      });
      found = true;
    }
  }
  
  if (found) {
    console.log("Canal movido com sucesso!");
  } else {
    console.log("Canal Cine Pipoca não encontrado na categoria Músicas. Tentando encontrar qualquer canal com 'Músicas' no nome que seja um filme...");
  }
  process.exit(0);
}

fixCategory().catch(console.error);
