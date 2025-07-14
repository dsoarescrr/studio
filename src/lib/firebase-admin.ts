
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

interface ServiceAccount {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
}

const serviceAccount: ServiceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: serverRuntimeConfig.FIREBASE_CLIENT_EMAIL,
  privateKey: (serverRuntimeConfig.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

export const initializeAdminApp = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } catch (error: any) {
    console.error("Firebase admin initialization error", error.stack);
    throw error;
  }
};
