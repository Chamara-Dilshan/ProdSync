import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "./config"
import { generateSalt } from "@/lib/crypto/encryption"

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

    // Generate and store encryption salt for API key encryption
    const salt = generateSalt()
    await setDoc(doc(db, "users", user.uid, "security", "encryption"), {
      salt,
      createdAt: serverTimestamp(),
      algorithm: "AES-256-GCM",
      iterations: 100000, // PBKDF2 iterations
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

/**
 * Get encryption salt for user
 * Used for deriving encryption key from password
 * @param userId - User ID
 * @returns Base64 encoded salt, or null if not found
 */
export async function getEncryptionSalt(
  userId: string
): Promise<string | null> {
  try {
    const securityRef = doc(db, "users", userId, "security", "encryption")
    const securitySnap = await getDoc(securityRef)

    if (securitySnap.exists()) {
      const data = securitySnap.data()
      return (data.salt as string) ?? null
    }

    return null
  } catch (error) {
    console.error("Failed to fetch encryption salt:", error)
    return null
  }
}

/**
 * Send password reset email to user
 * Uses Firebase's built-in password reset system
 * @param email - User's email address
 * @returns Promise that resolves when email is sent
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  await firebaseSendPasswordResetEmail(auth, email)
}
