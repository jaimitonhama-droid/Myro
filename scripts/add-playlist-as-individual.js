import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

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

// Videos extraidos manualmente do mix
// Playlist: https://www.youtube.com/watch?v=XBFv-ae26po&list=RDGMEMG3m0BcxBmd8gfjPOrZPGKwVMXBFv-ae26po
// Este e um mix automatico de Kizomba/Semba/Afrobeats
const videoIds = [
  "XBFv-ae26po", // SHOTGANG - Let Me Be
  "y7M4UHH6jPQ",
  "JUgYDl5edTo",
  "d835bZ9Dn3U",
  "eG54DTL33IE",
  "e-3v6sM9Rb4",
  "PJXHQ8Iyxl4",
  "sRix4ubhPVc",
  "2vmXU5gAWJQ",
  "PeOZMhEiMxY",
  "m8-GOhHnJO4",
  "wNk68J_fFdQ",
  "nxgIEwHvI1o",
  "9IxHXmXaEAU",
  "dVD3QXKv0N4",
  "NqCNVFbJFkw",
  "IZ2sg7mOKok",
  "g0-u0v-YwUI",
  "UxRQDDSP4qU",
  "mHONNcZbwDY",
];

async function getExistingYoutubeIds() {
  const snapshot = await getDocs(query(collection(db, 'channels'), where('category', '==', 'Músicas')));
  const ids = new Set();
  snapshot.forEach(doc => {
    const d = doc.data();
    if (d.youtubeId) ids.add(d.youtubeId);
  });
  return ids;
}

async function fetchVideoDetails(ids) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids.join(',')}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.items || [];
}

async function addToFirestore(snippet, videoId) {
  const title = snippet.title;
  if (title === 'Private video' || title === 'Deleted video') return false;
  
  const shortTitle = title.length > 40 ? title.substring(0, 40) + '...' : title;
  const thumbnail =
    snippet.thumbnails?.maxres?.url ||
    snippet.thumbnails?.high?.url ||
    snippet.thumbnails?.medium?.url ||
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  await addDoc(collection(db, 'channels'), {
    name: shortTitle,
    label: 'Músicas',
    emoji: '🎵',
    category: 'Músicas',
    description: title,
    youtubeId: videoId,
    youtubeListId: `RD${videoId}`,
    thumbnail,
    active: true,
    accentColor: '#e50914'
  });

  console.log(`  ✅ ${shortTitle}`);
  return true;
}

async function searchByTerm(term, maxResults = 15) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(term)}&maxResults=${maxResults}&videoCategoryId=10&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) {
    console.log(`Erro na busca "${term}": ${data.error.message}`);
    return [];
  }
  return (data.items || []).map(i => ({ id: i.id.videoId, snippet: i.snippet })).filter(i => i.id);
}

async function main() {
  console.log('🎵 A adicionar músicas individualmente à categoria Músicas...\n');

  // Verifica IDs já existentes para evitar duplicatas
  console.log('📋 A verificar músicas já existentes...');
  const existingIds = await getExistingYoutubeIds();
  console.log(`   ${existingIds.size} músicas já na categoria.\n`);

  let added = 0;

  // 1. Adiciona os IDs da lista manual (filtrando duplicatas)
  const newIds = videoIds.filter(id => !existingIds.has(id));
  
  if (newIds.length > 0) {
    console.log(`🎯 A processar ${newIds.length} vídeos da lista...\n`);
    const chunks = [];
    for (let i = 0; i < newIds.length; i += 50) chunks.push(newIds.slice(i, i + 50));
    
    for (const chunk of chunks) {
      const videos = await fetchVideoDetails(chunk);
      for (const video of videos) {
        const ok = await addToFirestore(video.snippet, video.id);
        if (ok) { added++; existingIds.add(video.id); }
      }
    }
  }

  // 2. Busca mais músicas similares via search
  console.log('\n🔍 A buscar mais músicas Kizomba/Afrobeats similares...\n');
  const searchTerms = [
    'Kizomba 2024 mix',
    'Semba music Angola',
    'Afrobeats hits 2024',
    'Zouk love music',
    'Cabo Verde music 2024',
  ];

  for (const term of searchTerms) {
    const results = await searchByTerm(term, 10);
    for (const result of results) {
      if (!existingIds.has(result.id)) {
        const ok = await addToFirestore(result.snippet, result.id);
        if (ok) { added++; existingIds.add(result.id); }
      }
    }
    // Pequena pausa para nao sobrecarregar a API
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n🎉 Total: ${added} músicas novas adicionadas à categoria Músicas!`);
  process.exit(0);
}

main().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});
