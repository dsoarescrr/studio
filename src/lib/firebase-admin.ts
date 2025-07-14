// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// This is a simplified check. In a real app, you'd want a more robust
// way to ensure server-side code isn't run on the client.
if (typeof window === 'undefined') {
  if (admin.apps.length === 0) {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } catch (error: any) {
      console.error("Firebase admin initialization error", error.stack);
    }
  }
}

export const adminAuth = admin.apps.length > 0 ? admin.auth() : ({} as admin.auth.Auth);
export const adminDb = admin.apps.length > 0 ? admin.firestore() : ({} as admin.firestore.Firestore);

// This export is kept for compatibility with API routes, but might be refactored
// to use the adminDb and adminAuth exports directly.
export const initializeAdminApp = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  // This part is problematic and likely won't work as expected without
  // proper environment variable setup for server-side.
  // The above check is safer.
  return admin.initializeApp();
};
