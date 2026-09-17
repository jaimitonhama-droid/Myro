import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, addDoc, doc } from 'firebase/firestore';

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

async function setupDestaques() {
  console.log("A remover antigos vídeos de Destaque ou Hero...");
  const snapshot = await getDocs(collection(db, 'channels'));
  
  for (const channelDoc of snapshot.docs) {
    const data = channelDoc.data();
    if (data.category === "Hero" || data.category === "Destaque") {
      await deleteDoc(doc(db, 'channels', channelDoc.id));
      console.log(`Apagado antigo canal: ${data.name}`);
    }
  }

  const videos = [
    { id: "WyNdH_K4xJ0", name: "Destaque 1" },
    { id: "UB0swEshWS8", name: "Destaque 2" },
    { id: "gE4z2Utknu0", name: "Destaque 3" },
    { id: "5ycuSRFHRgs", name: "Destaque 4" },
    { id: "VBS8g_paOnI", name: "Destaque 5" }
  ];

  console.log("A adicionar novos vídeos de Destaque...");
  for (const v of videos) {
    await addDoc(collection(db, 'channels'), {
      name: v.name,
      label: "Destaques 24h",
      emoji: "⭐",
      category: "Destaque",
      description: "Vídeo recomendado em destaque",
      youtubeId: v.id,
      thumbnail: `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`,
      active: true,
      accentColor: "#e50914"
    });
    console.log(`Adicionado: ${v.name}`);
  }
  
  console.log("Processo concluído com sucesso!");
  process.exit(0);
}

setupDestaques().catch(console.error);
