import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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
  const q = query(collection(db, 'channels'), where('category', '==', 'Músicas'));
  const snapshot = await getDocs(q);
  
  const targetNames = ['Istambul 4K', 'Música Mix 1', 'Música Mix 2', 'Música Mix 3'];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    if (targetNames.includes(data.name) || data.name.includes('Mix')) {
      if (targetNames.includes(data.name)) {
        console.log(`ID: ${doc.id}`);
        console.log(`Name: ${data.name}`);
        console.log(`Thumbnail: ${data.thumbnail}`);
        console.log(`YoutubeID: ${data.youtubeId}`);
        console.log('---');
      }
    }
  });
  
  process.exit(0);
}

main().catch(err => console.error(err));
