import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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

async function addSingleDestaque() {
  const ids = ["3ZGYrKDo3wk"];
  
  console.log("A adicionar novos vídeos à categoria Destaque...");
  
  let i = 14;
  for (const youtubeId of ids) {
    await addDoc(collection(db, 'channels'), {
      name: `Destaque ${i}`,
      label: "Destaques 24h",
      emoji: "⭐",
      category: "Destaque",
      description: "Vídeo recomendado em destaque",
      youtubeId: youtubeId,
      thumbnail: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      active: true,
      accentColor: "#e50914"
    });
    i++;
  }
  
  console.log("Vídeo adicionado com sucesso à categoria Destaque!");
  process.exit(0);
}

addSingleDestaque().catch(console.error);
