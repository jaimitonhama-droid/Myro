import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

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

async function main() {
  const q = query(collection(db, 'channels'), where('category', '==', 'Filmes'));
  const snapshot = await getDocs(q);
  
  snapshot.forEach(d => {
    const data = d.data();
    console.log(`ID: ${d.id}, Name: ${data.name}, Thumbnail: ${data.thumbnail}, url: ${data.url}, youtubeId: ${data.youtubeId}`);
  });
  
  process.exit(0);
}

main().catch(err => console.error(err));
