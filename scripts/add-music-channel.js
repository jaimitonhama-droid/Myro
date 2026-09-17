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

async function addChannel() {
  console.log("Adicionando novo canal de música no banco de dados...");
  
  await addDoc(collection(db, 'channels'), {
    name: "Destaque Tela Inicial",
    label: "Destaque",
    emoji: "⭐",
    category: "Hero",
    description: "Vídeo principal da tela inicial",
    youtubeId: "WyNdH_K4xJ0",
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
    active: true,
    accentColor: "#e50914"
  });
  
  console.log("Canal adicionado com sucesso!");
  process.exit(0);
}

addChannel().catch(console.error);
