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
const playlistId = "PLgmSHggeSsrjHA_MTS697IhoNN_SCejbF";

async function addAmapianoMusics() {
  console.log("A obter informações da playlist no YouTube...");
  
  try {
    let allItems = [];
    let nextPageToken = '';
    
    // Fetch all pages (up to a reasonable limit or until done)
    do {
      const pageTokenParam = nextPageToken ? `&pageToken=${nextPageToken}` : '';
      const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}${pageTokenParam}`);
      const data = await res.json();
      
      if (data.items) {
        allItems = allItems.concat(data.items);
      }
      
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);
    
    if (allItems.length === 0) {
      console.log("Nenhum vídeo encontrado na playlist.");
      process.exit(1);
    }

    for (const item of allItems) {
      // Pula vídeos deletados ou privados
      if (item.snippet.title === "Private video" || item.snippet.title === "Deleted video") {
        continue;
      }

      const videoId = item.snippet.resourceId.videoId;
      const title = item.snippet.title;
      // Trunca o título se for muito grande
      const shortTitle = title.length > 35 ? title.substring(0, 35) + "..." : title;
      
      console.log(`A adicionar: ${shortTitle}`);
      
      await addDoc(collection(db, 'channels'), {
        name: shortTitle,
        label: "Amapiano",
        emoji: "🎹",
        category: "Amapiano",
        description: title,
        youtubeId: videoId,
        // Gera um mix automático para este vídeo
        youtubeListId: `RD${videoId}`,
        thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || "",
        active: true,
        accentColor: "#e50914"
      });
    }
    
    console.log(`Todos os vídeos da playlist foram adicionados com sucesso à categoria Amapiano!`);
    process.exit(0);
    
  } catch (error) {
    console.error("Erro:", error);
    process.exit(1);
  }
}

addAmapianoMusics();
