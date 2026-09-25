import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

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

const updates = {
  // Istambul 4K - vamos substituir por um feed ao vivo 4K da Turquia ou Lofi
  'VXZltC44yRXwuvOCUFU6': 'v=aYn9B6WJ3wI', // Se nao encontrar, Lofi Girl: jfKfPfyJRdk
  // Música Mix 1 - Lofi Girl
  'dJTXQ1gZ3olyPHYY5LDv': 'jfKfPfyJRdk',
  // Música Mix 2 - Chillhop
  'waa1eN5tAyjknxO3PHrg': '5yx6BWlEVVg',
  // Música Mix 3 - Synthwave Radio
  'wmA1d1zJdwc2qMoIs2wy': '4xDzrUhVKcg' 
};

// Istambul live camera: d2vXjNn3UoE or something. Let's use Lofi Synthwave: 4xDzrUhVKcg
// Let's search for live streams.

async function fetchVideoDetails(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.items ? data.items[0] : null;
}

async function searchLive(query) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&eventType=live&type=video&q=${encodeURIComponent(query)}&maxResults=1&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.items ? data.items[0] : null;
}

async function main() {
  const newStreams = [
    { id: 'VXZltC44yRXwuvOCUFU6', query: 'Istanbul 4k live cam' },
    { id: 'dJTXQ1gZ3olyPHYY5LDv', query: 'lofi hip hop radio live' },
    { id: 'waa1eN5tAyjknxO3PHrg', query: 'chillhop live radio' },
    { id: 'wmA1d1zJdwc2qMoIs2wy', query: 'synthwave live radio' }
  ];

  for (const stream of newStreams) {
    console.log(`Buscando nova live para: ${stream.query}`);
    const liveVideo = await searchLive(stream.query);
    
    if (liveVideo) {
      const videoId = liveVideo.id.videoId;
      const snippet = liveVideo.snippet;
      const thumbnail = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url;
      
      console.log(`Encontrado: ${snippet.title} (${videoId})`);
      
      await updateDoc(doc(db, 'channels', stream.id), {
        youtubeId: videoId,
        thumbnail: thumbnail,
        name: stream.query.includes('Istanbul') ? 'Istambul 4K' : snippet.title.substring(0, 35)
      });
      console.log(`✅ Atualizado com sucesso.`);
    } else {
      console.log(`❌ Não encontrado.`);
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
