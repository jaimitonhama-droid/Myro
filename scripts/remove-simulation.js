import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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

async function removeSimulation() {
  console.log("Procurando o canal de simulação em Animes...");
  const snapshot = await getDocs(collection(db, 'channels'));
  let found = false;
  
  for (const channelDoc of snapshot.docs) {
    const data = channelDoc.data();
    if (data.name === "Naruto Marathon" || (data.category === "Animes" && data.name.includes("Marathon"))) {
      console.log(`Encontrado canal de simulação: ${data.name}. A apagar...`);
      await deleteDoc(doc(db, 'channels', channelDoc.id));
      found = true;
    }
  }
  
  if (found) {
    console.log("Canal de simulação removido com sucesso!");
  } else {
    console.log("Não foi possível encontrar o canal de simulação.");
  }
  process.exit(0);
}

removeSimulation().catch(console.error);
