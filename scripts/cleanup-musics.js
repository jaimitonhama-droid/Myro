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

const videoIdsToRemove = [
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

async function searchByTerm(term, maxResults = 15) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(term)}&maxResults=${maxResults}&videoCategoryId=10&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) return [];
  return (data.items || []).map(i => i.id.videoId).filter(Boolean);
}

async function main() {
  console.log('Removendo músicas indesejadas...');

  const searchTerms = [
    'Kizomba 2024 mix',
    'Semba music Angola',
    'Afrobeats hits 2024',
    'Zouk love music',
    'Cabo Verde music 2024',
  ];

  const idsToRemove = new Set(videoIdsToRemove);

  for (const term of searchTerms) {
    const results = await searchByTerm(term, 10);
    for (const id of results) {
      idsToRemove.add(id);
    }
  }

  const snapshot = await getDocs(query(collection(db, 'channels'), where('category', '==', 'Músicas')));
  
  let removedCount = 0;
  
  for (const document of snapshot.docs) {
    const data = document.data();
    if (idsToRemove.has(data.youtubeId)) {
      console.log(`Removendo: ${data.name}`);
      await deleteDoc(doc(db, 'channels', document.id));
      removedCount++;
    }
  }

  console.log(`Total removido: ${removedCount}`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
