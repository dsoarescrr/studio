import { getApps, initializeApp, cert, App } from 'firebase-admin/app';

// This function initializes and returns the Firebase Admin App instance.
// It ensures that the app is initialized only once.
export function initializeAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // The service account key is retrieved from environment variables.
  // This is a secure way to handle credentials, especially in a server environment.
  // The private key may contain newline characters that need to be parsed correctly.
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  // Initialize the Firebase Admin App with the provided credentials.
  const adminApp = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  });

  return adminApp;
}
