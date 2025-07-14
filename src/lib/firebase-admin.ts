// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// This is for server-side Genkit, which uses the GenAI key.
// The key is hardcoded here for simplicity in this environment.
// In a production app, use environment variables.
process.env.GOOGLE_API_KEY = "AIzaSyDPbqjR3o8mSQ1itdaoUQzyOmPEaUtaTI8";

if (typeof window === 'undefined') {
  if (admin.apps.length === 0) {
    try {
      // Use application default credentials provided by the environment
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } catch (error: any) {
      console.error("Firebase admin initialization error:", error.stack);
    }
  }
}

export const adminAuth = admin.apps.length > 0 ? admin.auth() : ({} as admin.auth.Auth);
export const adminDb = admin.apps.length > 0 ? admin.firestore() : ({} as admin.firestore.Firestore);

export const initializeAdminApp = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  return admin.initializeApp();
};
