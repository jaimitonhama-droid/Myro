import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

const API_KEY = 'AIzaSyBq22BlwDCE07fDqbEmFMBXznKqQF2Bv14'; // YouTube and Firebase API Key

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: "carla-v5.firebaseapp.com",
  projectId: "carla-v5",
  storageBucket: "carla-v5.firebasestorage.app",
  messagingSenderId: "118871134461",
  appId: "1:118871134461:web:7b806115a162302c7aae94"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to format ISO 8601 duration (e.g. PT1H2M10S) to HH:MM:SS
function formatDuration(isoString) {
  if (!isoString) return '';
  const match = isoString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = match[1] ? parseInt(match[1]) : 0;
  const m = match[2] ? parseInt(match[2]) : 0;
  const s = match[3] ? parseInt(match[3]) : 0;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

async function fetchYoutubeVideos(playlistId) {
  const videos = [];
  // Let's fetch up to 50 videos for now (1 page) to prevent massive spam, but can be adjusted.
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    
    // Get all video IDs to fetch durations in a batch
    const videoIds = data.items.map(item => item.contentDetails.videoId).join(',');
    
    // Fetch durations
    const durationUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${API_KEY}`;
    const durationRes = await fetch(durationUrl);
    const durationData = await durationRes.json();
    
    const durationMap = {};
    if (durationData.items) {
      durationData.items.forEach(v => {
        durationMap[v.id] = formatDuration(v.contentDetails.duration);
      });
    }

    for (const item of data.items) {
      const snippet = item.snippet;
      const vId = snippet.resourceId.videoId;
      // Prefer maxres, fallback to high, then medium
      const thumb = snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '';
      
      videos.push({
        name: snippet.title,
        youtubeId: vId,
        thumbnail: thumb,
        description: snippet.description || '',
        duration: durationMap[vId] || '',
        channelTitle: snippet.videoOwnerChannelTitle || ''
      });
    }
    return videos;
  } catch (error) {
    console.error("Erro ao buscar no YouTube:", error.message);
    process.exit(1);
  }
}

async function main() {
  const inputId = process.argv[2];
  const category = process.argv[3];

  if (!inputId || !category) {
    console.log("Uso: node import-youtube.js <CHANNEL_ID ou PLAYLIST_ID> <CATEGORIA>");
    console.log("Exemplo Canal: node import-youtube.js UC_x5XG1OV2P6uZZ5FSM9Ttw Filmes");
    console.log("Exemplo Playlist: node import-youtube.js PLbpi6ZahtTX_2uYh444c2084606 Filmes");
    process.exit(1);
  }

  // Se o usuário passar um ID de canal (começa com UC), a playlist de uploads é o mesmo ID mas começando com UU
  let playlistId = inputId;
  if (inputId.startsWith('UC')) {
    playlistId = 'UU' + inputId.substring(2);
    console.log(`ID de Canal detectado. Convertido para Playlist de Uploads: ${playlistId}`);
  }

  console.log(`🔍 A buscar vídeos da playlist ${playlistId}...`);
  const videos = await fetchYoutubeVideos(playlistId);
  console.log(`✅ ${videos.length} vídeos encontrados no YouTube.`);

  let added = 0;
  let duplicates = 0;

  for (const video of videos) {
    // Check if video exists
    const q = query(collection(db, 'channels'), where('youtubeId', '==', video.youtubeId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      await addDoc(collection(db, 'channels'), {
        name: video.name,
        category: category,
        youtubeId: video.youtubeId,
        thumbnail: video.thumbnail,
        duration: video.duration,
        channelName: video.channelTitle,
        createdAt: serverTimestamp(),
        isOffline: false,
        url: '' // empty string as fallback
      });
      console.log(`➕ Adicionado: ${video.name}`);
      added++;
    } else {
      console.log(`⏭️ Ignorado (já existe): ${video.name}`);
      duplicates++;
    }
  }

  console.log(`\n🎉 Concluído!`);
  console.log(`Novos adicionados: ${added}`);
  console.log(`Duplicados ignorados: ${duplicates}`);
  process.exit(0);
}

main().catch(console.error);
