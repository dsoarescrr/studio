import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
let adminApp: App;

export function initializeAdminApp() {
  if (getApps().length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    adminApp = initializeApp({
      credential: cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
  } else {
    adminApp = getApps()[0];
  }

  return adminApp;
}

export function getAdminAuth() {
  const app = initializeAdminApp();
  return getAuth(app);
}

export function getAdminFirestore() {
  const app = initializeAdminApp();
  return getFirestore(app);
}