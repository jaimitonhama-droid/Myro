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

const updates = [
  { id: '6qK0qJO8JuPCcgKMsbOR', thumbnail: '/covers/cine_pipoca.jpg' },
  { id: 'c6irKoBHv6Mg0Z5U9hzv', thumbnail: '/covers/acao_24h.jpg' },
  { id: 'dewF38nG61YZiiwmNLDt', thumbnail: '/covers/sessao_vip.jpg' },
  { id: 'm7fdrAUIBTOAzlwxEzYF', thumbnail: '/covers/noticias_globais.jpg' }
];

async function main() {
  for (const update of updates) {
    const channelRef = doc(db, 'channels', update.id);
    await updateDoc(channelRef, { thumbnail: update.thumbnail });
    console.log(`Updated ${update.id} with ${update.thumbnail}`);
  }
  process.exit(0);
}

main().catch(err => console.error(err));
