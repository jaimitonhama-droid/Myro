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

const YOUTUBE_API_KEY = "AIzaSyDe4IDUOcPHE7v3Q2-TCnOdaf9iYiXSsXA";

const playlistId = "PL10dDwraatm5AGMRPntktL1uF_BsB0pR7";
const videoId = "y7M4UHH6jPQ"; // Primeiro video da playlist

async function addPlaylist() {
  console.log("A obter informações da playlist no YouTube...");
  
  try {
    // Buscar info da playlist para ter o título original
    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`);
    const data = await res.json();
    
    if (!data.items || data.items.length === 0) {
      console.log("Playlist não encontrada.");
      process.exit(1);
    }

    const item = data.items[0];
    const title = item.snippet.title;
    const shortTitle = title.length > 35 ? title.substring(0, 35) + "..." : title;
    
    console.log(`A adicionar: ${shortTitle}`);
    
    await addDoc(collection(db, 'channels'), {
      name: shortTitle,
      label: "Músicas",
      emoji: "🎧",
      category: "Músicas",
      description: title,
      youtubeId: videoId,
      youtubeListId: playlistId,
      thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      active: true,
      accentColor: "#e50914"
    });
    
    console.log("A playlist foi adicionada com sucesso à categoria Músicas!");
    process.exit(0);
    
  } catch (error) {
    console.error("Erro:", error);
    process.exit(1);
  }
}

addPlaylist();
