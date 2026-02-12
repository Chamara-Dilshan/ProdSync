import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { createLogger } from "../utils/logger"

const logger = createLogger("Firebase")

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase only if it hasn't been initialized
let app: FirebaseApp
let auth: Auth

if (getApps().length === 0) {
  logger.info("Initializing Firebase", { projectId: firebaseConfig.projectId })
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  logger.info("Firebase initialized successfully")
} else {
  logger.debug("Firebase already initialized, reusing existing app")
  app = getApps()[0]
  auth = getAuth(app)
}

export { app, auth }
export default app
