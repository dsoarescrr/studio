// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config'; // Import the configuration directly

let app: FirebaseApp;

// Since this file can be imported on the server, we need to be careful
// not to execute client-side Firebase logic there.
// getFirebaseApp ensures we only initialize on the client.
function getFirebaseApp() {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      return initializeApp(firebaseConfig);
    } else {
      return getApp();
    }
  }
  return null; // Return null on the server
}

const clientApp = getFirebaseApp();

// We need to handle the case where app might not be fully initialized on the server
const auth = clientApp ? getAuth(clientApp) : ({} as any); 
const db = clientApp ? getFirestore(clientApp) : ({} as any);

// Initialize providers for social login
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();
const githubProvider = new GithubAuthProvider();

export { 
  auth, 
  db, 
  googleProvider, 
  facebookProvider, 
  twitterProvider, 
  githubProvider,
};
