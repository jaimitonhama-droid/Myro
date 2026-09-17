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

const videoIds = [
  "y7M4UHH6jPQ",
  "JUgYDl5edTo",
  "d835bZ9Dn3U",
  "eG54DTL33IE"
];

async function addMusics() {
  console.log("A obter informações dos vídeos no YouTube...");
  
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`);
    const data = await res.json();
    
    if (!data.items || data.items.length === 0) {
      console.log("Nenhum vídeo encontrado.");
      process.exit(1);
    }

    for (const item of data.items) {
      const videoId = item.id;
      const title = item.snippet.title;
      // Trunca o título se for muito grande
      const shortTitle = title.length > 35 ? title.substring(0, 35) + "..." : title;
      
      console.log(`A adicionar: ${shortTitle}`);
      
      await addDoc(collection(db, 'channels'), {
        name: shortTitle,
        label: "Músicas",
        emoji: "🎵",
        category: "Músicas",
        description: title,
        youtubeId: videoId,
        // Gera um mix automático para este vídeo
        youtubeListId: `RD${videoId}`,
        thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        active: true,
        accentColor: "#e50914"
      });
    }
    
    console.log("Todos os vídeos foram adicionados com sucesso à categoria Músicas!");
    process.exit(0);
    
  } catch (error) {
    console.error("Erro:", error);
    process.exit(1);
  }
}

addMusics();
