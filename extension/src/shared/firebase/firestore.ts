/**
 * Firestore Client for Extension
 * Fetches products, policies, and user settings from Firestore
 */

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore"
import { app } from "./config"
import { Product, Policy, UserSettings } from "../storage/cache-storage"

const db = getFirestore(app)

/**
 * Convert Firestore Timestamp to Date
 */
function convertTimestamps(data: any): any {
  if (data && typeof data === "object") {
    const converted: any = {}
    for (const key in data) {
      if (data[key] instanceof Timestamp) {
        converted[key] = data[key].toDate()
      } else if (typeof data[key] === "object" && data[key] !== null) {
        converted[key] = convertTimestamps(data[key])
      } else {
        converted[key] = data[key]
      }
    }
    return converted
  }
  return data
}

/**
 * Format Firestore errors for users
 */
function formatFirestoreError(error: any, operation: string): Error {
  const errorCode = error?.code || "unknown"
  const errorMessage = error?.message || "An unknown error occurred"

  console.error(`[Firestore] ${operation} error:`, {
    code: errorCode,
    message: errorMessage,
  })

  if (errorCode === "permission-denied") {
    return new Error(
      "Permission denied. Please ensure you're logged in and have access to this data."
    )
  }

  if (errorCode === "unavailable") {
    return new Error(
      "Firestore is temporarily unavailable. Please check your internet connection."
    )
  }

  if (errorCode === "unauthenticated") {
    return new Error("You must be logged in to access this data.")
  }

  return new Error(`${operation} failed: ${errorMessage}`)
}

/**
 * Fetch all products for a user
 */
export async function fetchProducts(userId: string): Promise<Product[]> {
  try {
    console.log(`[Firestore] Fetching products for user: ${userId}`)
    const productsRef = collection(db, "users", userId, "products")
    const q = query(productsRef, orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Product[]

    console.log(`[Firestore] Fetched ${products.length} products`)
    return products
  } catch (error) {
    throw formatFirestoreError(error, "Fetch products")
  }
}

/**
 * Fetch all policies for a user
 */
export async function fetchPolicies(userId: string): Promise<Policy[]> {
  try {
    console.log(`[Firestore] Fetching policies for user: ${userId}`)
    const policiesRef = collection(db, "users", userId, "policies")
    const snapshot = await getDocs(policiesRef)

    const policies = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Policy[]

    console.log(`[Firestore] Fetched ${policies.length} policies`)
    return policies
  } catch (error) {
    throw formatFirestoreError(error, "Fetch policies")
  }
}

/**
 * Fetch user settings
 */
export async function fetchUserSettings(
  userId: string
): Promise<UserSettings | null> {
  try {
    console.log(`[Firestore] Fetching settings for user: ${userId}`)
    const settingsRef = doc(db, "users", userId, "settings", "general")
    const settingsSnap = await getDoc(settingsRef)

    if (!settingsSnap.exists()) {
      console.log("[Firestore] No settings found, returning null")
      return null
    }

    const settings = convertTimestamps(settingsSnap.data()) as UserSettings
    console.log("[Firestore] Settings fetched successfully")
    return settings
  } catch (error) {
    throw formatFirestoreError(error, "Fetch settings")
  }
}

/**
 * Fetch all user data at once (products, policies, settings)
 */
export async function fetchAllUserData(userId: string): Promise<{
  products: Product[]
  policies: Policy[]
  settings: UserSettings | null
}> {
  console.log(`[Firestore] Fetching all data for user: ${userId}`)

  const [products, policies, settings] = await Promise.all([
    fetchProducts(userId),
    fetchPolicies(userId),
    fetchUserSettings(userId),
  ])

  console.log("[Firestore] All data fetched successfully")
  return { products, policies, settings }
}
