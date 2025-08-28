import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Server-only Firebase Admin initialization
// Requires env vars (do NOT prefix with NEXT_PUBLIC):
// - FIREBASE_PROJECT_ID
// - FIREBASE_CLIENT_EMAIL
// - FIREBASE_PRIVATE_KEY (with \n literals)

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey && privateKey.includes('\\n')) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

function init() {
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  }
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey as string,
      }),
    });
  } else {
    // Reuse existing app
    getApp();
  }
}

init();

export const adminAuth = getAuth();
export const adminDb = getFirestore();

export async function verifyBearerToken(authHeader?: string) {
  if (!authHeader) throw new Error('Missing Authorization header');
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) throw new Error('Invalid Authorization header format');
  return adminAuth.verifyIdToken(token);
}

