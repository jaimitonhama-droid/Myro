import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBq22BlwDCE07fDqbEmFMBXznKqQF2Bv14",
  authDomain: "carla-v5.firebaseapp.com",
  projectId: "carla-v5",
  storageBucket: "carla-v5.firebasestorage.app",
  messagingSenderId: "118871134461",
  appId: "1:118871134461:web:7b806115a162302c7aae94"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function sendReset() {
  try {
    await sendPasswordResetEmail(auth, "jaimitonhama@gmail.com");
    console.log("Email de recuperação enviado com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar email:", error);
  }
  process.exit(0);
}

sendReset();
