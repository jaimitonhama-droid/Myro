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

const NOVO_CANAL = { 
  name: 'AnimaKids', 
  label: 'Kids TV 2', 
  emoji: '🧩', 
  category: 'Infantil',
  description: 'Diversão garantida para os mais pequenos.', 
  youtubeId: 'L3o5yg773RE', 
  url: '', 
  accentColor: '#f59e0b', 
  active: true,
  thumbnail: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&q=80'
};

async function seed() {
  console.log("A adicionar o segundo canal do YouTube (L3o5yg773RE) à categoria Infantil...");
  await addDoc(collection(db, 'channels'), NOVO_CANAL);
  console.log("Canal adicionado com sucesso!");
  process.exit(0);
}
seed().catch(console.error);
