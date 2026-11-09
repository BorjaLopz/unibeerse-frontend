import { initializeApp } from "firebase/app";
import { getAuth, type User } from "firebase/auth";

// Solo usamos Firebase para iniciar sesión. Los datos viven en nuestra API.
const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);

export function getAuthUserSync(): User | null {
  return auth.currentUser;
}

export async function getToken(forceRefresh = false): Promise<string | null> {
  await auth.authStateReady();
  return auth.currentUser ? auth.currentUser.getIdToken(forceRefresh) : null;
}
