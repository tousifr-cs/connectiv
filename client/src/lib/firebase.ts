import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCkPiKS0L_iO_iglf7oTBi77djZn_moC14",
  authDomain: "proconnectiv-3ce77.firebaseapp.com",
  projectId: "proconnectiv-3ce77",
  storageBucket: "proconnectiv-3ce77.firebasestorage.app",
  messagingSenderId: "1018964196739",
  appId: "1:1018964196739:web:9b84d0c1e8f21131d0cab6",
  measurementId: "G-GG7RRF71Y9",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
