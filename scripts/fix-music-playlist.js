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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixPlaylistId() {
  const channelsRef = collection(db, 'channels');
  const snapshot = await getDocs(channelsRef);
  
  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data();
    if (data.youtubeId === "n3x-6opJ3_c") {
      console.log(`Corrigindo playlist ID para o canal: ${data.name}`);
      await updateDoc(doc(db, 'channels', docSnapshot.id), {
        youtubeListId: "RDn3x-6opJ3_c"
      });
      console.log("Atualizado com sucesso!");
    }
  }
  process.exit(0);
}

fixPlaylistId().catch(console.error);
