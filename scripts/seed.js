import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';

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

const MOCK_ACTIVITY = [
  { id: '1', user: 'Carlos Nhantumbo',  action: 'subscreveu o plano Semanal via M-Pesa.', time: 'há 3 min', color: 'green' },
  { id: '2', user: 'Fátima Cossa',      action: 'criou uma conta nova.',                  time: 'há 11 min', color: 'blue' },
  { id: '3', user: 'João Sitoe',        action: '— trial com 1 dia restante.',            time: 'há 22 min', color: 'purple' },
  { id: '4', user: 'Ana Muiambo',       action: 'subscreveu o plano Mensal via M-Pesa.',  time: 'há 45 min', color: 'green' },
  { id: '5', user: 'Pedro Nhampossa',   action: 'cancelou a renovação automática.',       time: 'há 2 horas', color: 'red' },
];

const WEEK_REVENUE = [
  { day: 'Seg', val: 1950 },
  { day: 'Ter', val: 3200 },
  { day: 'Qua', val: 1800 },
  { day: 'Qui', val: 4100 },
  { day: 'Sex', val: 5200 },
  { day: 'Sáb', val: 6800 },
  { day: 'Dom', val: 4500 },
];

const KPI_STATS = {
  totalUsers: { value: '1.847', delta: '+12% este mês' },
  activeNow: { value: '234', delta: 'ao vivo' },
  revenueTotal: { value: '42.890', delta: '+8% esta semana' },
  activeSubs: { value: '389', delta: '+23 hoje' }
};

async function seed() {
  console.log("Iniciando a inserção de dados no Firebase...");
  const batch = writeBatch(db);

  // KPIs
  const statsRef = doc(db, 'stats', 'dashboard');
  batch.set(statsRef, KPI_STATS);

  // Activities
  MOCK_ACTIVITY.forEach((act) => {
    const actRef = doc(db, 'activities', act.id);
    batch.set(actRef, act);
  });

  // Revenue
  const revRef = doc(db, 'stats', 'revenue');
  batch.set(revRef, { weekly: WEEK_REVENUE });

  await batch.commit();
  console.log("Dados inseridos com sucesso!");
  process.exit(0);
}

seed().catch(console.error);
