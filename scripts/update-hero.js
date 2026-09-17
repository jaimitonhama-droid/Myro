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

async function updateHero() {
  console.log("Procurando o vídeo de Destaque da Tela Inicial...");
  const snapshot = await getDocs(collection(db, 'channels'));
  let found = false;
  
  for (const channelDoc of snapshot.docs) {
    const data = channelDoc.data();
    if (data.category === "Hero") {
      console.log(`Encontrado vídeo de Destaque. Actualizando o YouTube ID...`);
      await updateDoc(doc(db, 'channels', channelDoc.id), {
        youtubeId: "VBS8g_paOnI"
      });
      found = true;
    }
  }
  
  if (found) {
    console.log("Vídeo de Destaque actualizado com sucesso!");
  } else {
    console.log("Não foi possível encontrar o vídeo de Destaque.");
  }
  process.exit(0);
}

updateHero().catch(console.error);
