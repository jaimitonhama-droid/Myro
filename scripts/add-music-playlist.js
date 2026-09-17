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

async function addMusicPlaylist() {
  const playlistId = "RDGMEMZ9GwBBziaNfoa5-QltjvvA";
  const videoId = "n3x-6opJ3_c";
  
  console.log("A adicionar playlist à categoria Músicas...");
  
  await addDoc(collection(db, 'channels'), {
    name: "YouTube Mix 2",
    label: "Músicas",
    emoji: "🎵",
    category: "Músicas",
    description: "Playlist de Músicas 2",
    youtubeId: videoId,
    youtubeListId: playlistId,
    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    active: true,
    accentColor: "#e50914"
  });
  
  console.log("Playlist adicionada com sucesso à categoria Músicas!");
  process.exit(0);
}

addMusicPlaylist().catch(console.error);
