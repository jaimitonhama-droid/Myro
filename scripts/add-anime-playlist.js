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

async function addAnimePlaylist() {
  const playlistId = "PLDOijcJgf2tkcIcszza4K4DOL1nrWdALt";
  const videoId = "U_7rVCLW56Y";
  
  console.log("A adicionar playlist à categoria Animes...");
  
  await addDoc(collection(db, 'channels'), {
    name: "Anime Playlist 4",
    label: "Animes 24h",
    emoji: "📺",
    category: "Animes",
    description: "Vários episódios de Anime",
    youtubeId: videoId,
    youtubeListId: playlistId,
    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    active: true,
    accentColor: "#e50914"
  });
  
  console.log("Playlist adicionada com sucesso à categoria Animes!");
  process.exit(0);
}

addAnimePlaylist().catch(console.error);
