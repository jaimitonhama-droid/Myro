import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';

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

// Função para converter ISO 8601 duration (PT#M#S) para segundos
function parseISO8601Duration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  return (hours * 3600) + (minutes * 60) + seconds;
}

async function fetchVideoDurations(videoIds) {
  const chunks = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    chunks.push(videoIds.slice(i, i + 50));
  }

  const results = {};
  
  for (const chunk of chunks) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${chunk.join(',')}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.items) {
      for (const item of data.items) {
        // Ignora videos em directo (live streams)
        if (item.snippet?.liveBroadcastContent === 'live' || item.snippet?.liveBroadcastContent === 'upcoming') {
          results[item.id] = -1; // -1 significa ignorar (não eliminar)
          continue;
        }
        
        const durationStr = item.contentDetails?.duration;
        results[item.id] = parseISO8601Duration(durationStr);
      }
    }
  }
  
  return results;
}

async function main() {
  console.log('A analisar vídeos na categoria Músicas...\n');

  const snapshot = await getDocs(query(collection(db, 'channels'), where('category', '==', 'Músicas')));
  
  const docsMap = {}; // youtubeId -> document
  const videoIds = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.youtubeId) {
      videoIds.push(data.youtubeId);
      docsMap[data.youtubeId] = { id: doc.id, data };
    }
  });
  
  console.log(`Encontrados ${videoIds.length} vídeos para verificar.\n`);
  
  const durations = await fetchVideoDurations(videoIds);
  
  let deletedCount = 0;
  
  for (const videoId of videoIds) {
    const durationSeconds = durations[videoId];
    const docInfo = docsMap[videoId];
    
    if (durationSeconds === undefined) {
      // Vídeo foi eliminado ou bloqueado no YouTube
      console.log(`⚠️  Vídeo indisponível (a remover): ${docInfo.data.name}`);
      await deleteDoc(doc(db, 'channels', docInfo.id));
      deletedCount++;
    } else if (durationSeconds > 600) { // 600 segundos = 10 minutos
      const mins = Math.floor(durationSeconds / 60);
      const secs = durationSeconds % 60;
      console.log(`🗑️  A remover vídeo longo (${mins}m ${secs}s): ${docInfo.data.name}`);
      await deleteDoc(doc(db, 'channels', docInfo.id));
      deletedCount++;
    } else if (durationSeconds === -1) {
      // Live stream
      console.log(`📡 Mantendo Live Stream: ${docInfo.data.name}`);
    }
  }
  
  console.log(`\n🎉 Concluído! ${deletedCount} vídeos com mais de 10 minutos (ou indisponíveis) foram eliminados.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});
