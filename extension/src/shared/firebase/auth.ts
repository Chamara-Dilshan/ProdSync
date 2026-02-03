import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  UserCredential,
} from "firebase/auth"
import { auth } from "./config"
import { AuthStorage } from "../storage/auth-storage"

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  const credential = await signInWithEmailAndPassword(auth, email, password)

  // Store auth data in Chrome Storage
  const token = await credential.user.getIdToken()
  const expiry = Date.now() + 60 * 60 * 1000 // 1 hour

  await AuthStorage.setAuthData({
    token,
    expiry,
    userId: credential.user.uid,
    email: credential.user.email || "",
  })

  return credential
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider()
  const credential = await signInWithPopup(auth, provider)

  // Store auth data in Chrome Storage
  const token = await credential.user.getIdToken()
  const expiry = Date.now() + 60 * 60 * 1000 // 1 hour

  await AuthStorage.setAuthData({
    token,
    expiry,
    userId: credential.user.uid,
    email: credential.user.email || "",
  })

  return credential
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
  await AuthStorage.clearAuth()
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(
  callback: (_user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback)
}

/**
 * Get fresh ID token
 * Used by background script to refresh expired tokens
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = getCurrentUser()
  if (!user) return null

  const token = await user.getIdToken(forceRefresh)

  // Update stored token if refreshed
  if (forceRefresh) {
    const expiry = Date.now() + 60 * 60 * 1000
    await AuthStorage.setAuthData({
      token,
      expiry,
      userId: user.uid,
      email: user.email || "",
    })
  }

  return token
}
