import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBq22BlwDCE07fDqbEmFMBXznKqQF2Bv14",
  authDomain: "carla-v5.firebaseapp.com",
  projectId: "carla-v5",
  storageBucket: "carla-v5.firebasestorage.app",
  messagingSenderId: "118871134461",
  appId: "1:118871134461:web:7b806115a162302c7aae94"
};

const YOUTUBE_API_KEY = "AIzaSyDe4IDUOcPHE7v3Q2-TCnOdaf9iYiXSsXA";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to convert ISO 8601 duration (e.g. PT1H2M10S) to HH:MM:SS or MM:SS
function formatDuration(isoString) {
  const match = isoString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  
  let formatted = "";
  if (hours > 0) {
    formatted += `${hours}:`;
    formatted += `${minutes.toString().padStart(2, '0')}:`;
  } else {
    formatted += `${minutes}:`;
  }
  formatted += `${seconds.toString().padStart(2, '0')}`;
  
  return formatted;
}

async function fetchDurations() {
  console.log("Iniciando actualização das durações dos vídeos...");
  const snapshot = await getDocs(collection(db, 'channels'));
  
  for (const channelDoc of snapshot.docs) {
    const data = channelDoc.data();
    
    // Skip if it's a playlist or doesn't have a youtubeId
    if (!data.youtubeId || data.youtubeListId) {
      console.log(`A ignorar: ${data.name} (Playlist ou sem ID)`);
      continue;
    }
    
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${data.youtubeId}&part=contentDetails&key=${YOUTUBE_API_KEY}`);
      const ytData = await response.json();
      
      if (ytData.items && ytData.items.length > 0) {
        const isoDuration = ytData.items[0].contentDetails.duration;
        const formattedDuration = formatDuration(isoDuration);
        
        // Se a duração for PT0S (ao vivo), não definimos duração
        if (isoDuration !== "P0D" && isoDuration !== "PT0S" && formattedDuration) {
          console.log(`A actualizar ${data.name} com a duração: ${formattedDuration}`);
          await updateDoc(doc(db, 'channels', channelDoc.id), {
            duration: formattedDuration
          });
        } else {
          console.log(`${data.name} parece ser um canal Ao Vivo (Live Stream).`);
        }
      } else {
        console.log(`Não foi possível obter dados do YouTube para: ${data.name}`);
      }
    } catch (error) {
      console.error(`Erro ao buscar dados para ${data.name}:`, error);
    }
  }
  
  console.log("Actualização concluída com sucesso!");
  process.exit(0);
}

fetchDurations().catch(console.error);
