import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBq22BlwDCEO7fDqbEmFMbXznKqQF2BV14",
  authDomain: "carla-v5.firebaseapp.com",
  projectId: "carla-v5",
  storageBucket: "carla-v5.firebasestorage.app",
  messagingSenderId: "118871134461",
  appId: "1:118871134461:web:7b806115a162302c7aae94"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const CANAIS = [
  { 
    name: 'Música Mix 3', 
    label: 'Mix 3', 
    emoji: '🎧', 
    category: 'Músicas',
    description: 'Som de alta qualidade ao vivo.', 
    youtubeId: 'O1TcEbDxhk8', 
    url: '', 
    accentColor: '#3b82f6', 
    active: true,
    thumbnail: 'https://img.youtube.com/vi/O1TcEbDxhk8/maxresdefault.jpg'
  }
];

async function seed() {
  console.log("A adicionar canais de música...");
  for (const canal of CANAIS) {
    await addDoc(collection(db, 'channels'), canal);
  }
  console.log("Canais adicionados com sucesso!");
  process.exit(0);
}
seed().catch(console.error);
