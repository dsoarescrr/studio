// src/lib/firebase-config.ts
import type { FirebaseOptions } from 'firebase/app';

/**
 * ATTENTION:
 * 
 * Insira as suas credenciais do Firebase aqui. Pode encontrá-las em:
 * Firebase Console > Definições do Projeto > Geral > As suas apps > Configuração do SDK
 * https://console.firebase.google.com/
 */
export const firebaseConfig: FirebaseOptions = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
