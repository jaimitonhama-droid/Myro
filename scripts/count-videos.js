import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function countVideos() {
  try {
    const snapshot = await getDocs(collection(db, 'channels'));
    console.log(`TOTAL_VIDEOS:${snapshot.size}`);
    process.exit(0);
  } catch (error) {
    console.error("Erro:", error);
    process.exit(1);
  }
}

countVideos();
