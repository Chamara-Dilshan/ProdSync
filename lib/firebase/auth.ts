import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "./config"

const googleProvider = new GoogleAuthProvider()

export interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt: Date
}

// Create user document in Firestore
async function createUserDocument(user: User): Promise<void> {
  const userRef = doc(db, "users", user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
    })

    // Initialize default settings
    await setDoc(doc(db, "users", user.uid, "settings", "general"), {
      selectedProvider: "openai",
      selectedModel: "gpt-4o-mini",
      defaultTone: "professional",
      apiKeys: {
        openai: "",
        gemini: "",
        anthropic: "",
      },
    })
  }
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )

  // Update display name
  await updateProfile(userCredential.user, { displayName })

  // Create user document
  await createUserDocument(userCredential.user)

  return userCredential.user
}

// Sign in with email and password
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

// Sign in with Google
export async function signInWithGoogle(): Promise<User> {
  const userCredential = await signInWithPopup(auth, googleProvider)
  await createUserDocument(userCredential.user)
  return userCredential.user
}

// Sign out
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

// Subscribe to auth state changes
export function onAuthChange(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback)
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser
}
