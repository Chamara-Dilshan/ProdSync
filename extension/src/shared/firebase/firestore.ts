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
import { createLogger } from "../utils/logger"

const logger = createLogger("Firestore")

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

  logger.error(`${operation} failed`, error, {
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
  const startTime = performance.now()
  try {
    logger.info("Fetching products", { userId })
    const productsRef = collection(db, "users", userId, "products")
    const q = query(productsRef, orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Product[]

    const elapsed = Math.round(performance.now() - startTime)
    logger.info(`Fetched ${products.length} products`, { elapsed: `${elapsed}ms` })
    return products
  } catch (error) {
    throw formatFirestoreError(error, "Fetch products")
  }
}

/**
 * Fetch all policies for a user
 */
export async function fetchPolicies(userId: string): Promise<Policy[]> {
  const startTime = performance.now()
  try {
    logger.info("Fetching policies", { userId })
    const policiesRef = collection(db, "users", userId, "policies")
    const snapshot = await getDocs(policiesRef)

    const policies = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Policy[]

    const elapsed = Math.round(performance.now() - startTime)
    logger.info(`Fetched ${policies.length} policies`, { elapsed: `${elapsed}ms` })
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
  const startTime = performance.now()
  try {
    logger.info("Fetching settings", { userId })
    const settingsRef = doc(db, "users", userId, "settings", "general")
    const settingsSnap = await getDoc(settingsRef)

    if (!settingsSnap.exists()) {
      logger.info("No settings found, returning null")
      return null
    }

    const settings = convertTimestamps(settingsSnap.data()) as UserSettings
    const elapsed = Math.round(performance.now() - startTime)
    logger.info("Settings fetched successfully", { elapsed: `${elapsed}ms` })
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
  const startTime = performance.now()
  logger.info("Fetching all user data", { userId })

  const [products, policies, settings] = await Promise.all([
    fetchProducts(userId),
    fetchPolicies(userId),
    fetchUserSettings(userId),
  ])

  const elapsed = Math.round(performance.now() - startTime)
  logger.info("All data fetched successfully", {
    elapsed: `${elapsed}ms`,
    counts: {
      products: products.length,
      policies: policies.length,
      hasSettings: settings !== null,
    },
  })
  return { products, policies, settings }
}

/**
 * Fetch user's encryption salt from Firestore
 * Used for decrypting API keys
 */
export async function getEncryptionSalt(
  userId: string
): Promise<string | null> {
  try {
    logger.info("Fetching encryption salt", { userId })
    const securityRef = doc(db, "users", userId, "security", "encryption")
    const securitySnap = await getDoc(securityRef)

    if (securitySnap.exists()) {
      const data = securitySnap.data()
      const salt = (data.salt as string) ?? null
      logger.info("Encryption salt fetched successfully")
      return salt
    }

    logger.info("No encryption salt found (user may not have encrypted keys)")
    return null
  } catch (error) {
    logger.error("Failed to fetch encryption salt", error, { userId })
    return null
  }
}
