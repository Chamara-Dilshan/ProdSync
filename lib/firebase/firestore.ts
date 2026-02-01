import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  DocumentData,
  QueryConstraint,
  Timestamp,
} from "firebase/firestore"
import { db } from "./config"
import { Product, Policy, UserSettings } from "@/types"

// Helper function to convert Firestore Timestamp to Date
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

// Helper function to format Firebase errors for users
function formatFirebaseError(error: any, operation: string): Error {
  const errorCode = error?.code || "unknown"
  const errorMessage = error?.message || "An unknown error occurred"

  console.error(`Firebase ${operation} error:`, {
    code: errorCode,
    message: errorMessage,
    fullError: error,
  })

  // Provide helpful error messages based on error code
  if (errorCode === "permission-denied") {
    return new Error(
      "Permission denied. Please ensure Firebase Security Rules are configured correctly. " +
        "Visit: https://console.firebase.google.com/project/prodsync-872b1/firestore/rules"
    )
  }

  if (errorCode === "unavailable") {
    return new Error(
      "Firebase is temporarily unavailable. Please check your internet connection and try again."
    )
  }

  if (errorCode === "unauthenticated") {
    return new Error("You must be logged in to perform this action.")
  }

  if (errorCode.includes("index")) {
    return new Error(
      "Missing Firestore index. Visit Firebase Console to create the required index: " +
        "https://console.firebase.google.com/project/prodsync-872b1/firestore/indexes"
    )
  }

  // Return original error message for other cases
  return new Error(`${operation} failed: ${errorMessage}`)
}

// ==================== PRODUCTS ====================

export async function getProducts(userId: string): Promise<Product[]> {
  try {
    const productsRef = collection(db, "users", userId, "products")
    const q = query(productsRef, orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Product[]
  } catch (error) {
    throw formatFirebaseError(error, "Load products")
  }
}

export async function getProduct(
  userId: string,
  productId: string
): Promise<Product | null> {
  const productRef = doc(db, "users", userId, "products", productId)
  const productSnap = await getDoc(productRef)

  if (!productSnap.exists()) {return null}

  return { id: productSnap.id, ...productSnap.data() } as Product
}

export async function createProduct(
  userId: string,
  product: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const productsRef = collection(db, "users", userId, "products")
    const newProductRef = doc(productsRef)

    await setDoc(newProductRef, {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return newProductRef.id
  } catch (error) {
    throw formatFirebaseError(error, "Create product")
  }
}

export async function updateProduct(
  userId: string,
  productId: string,
  updates: Partial<Product>
): Promise<void> {
  try {
    const productRef = doc(db, "users", userId, "products", productId)
    await updateDoc(productRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    throw formatFirebaseError(error, "Update product")
  }
}

export async function deleteProduct(
  userId: string,
  productId: string
): Promise<void> {
  try {
    const productRef = doc(db, "users", userId, "products", productId)
    await deleteDoc(productRef)
  } catch (error) {
    throw formatFirebaseError(error, "Delete product")
  }
}

export async function bulkCreateProducts(
  userId: string,
  products: Omit<Product, "id" | "createdAt" | "updatedAt">[]
): Promise<string[]> {
  const ids: string[] = []

  for (const product of products) {
    const id = await createProduct(userId, product)
    ids.push(id)
  }

  return ids
}

// ==================== POLICIES ====================

export async function getPolicies(userId: string): Promise<Policy[]> {
  try {
    const policiesRef = collection(db, "users", userId, "policies")
    const snapshot = await getDocs(policiesRef)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Policy[]
  } catch (error) {
    throw formatFirebaseError(error, "Load policies")
  }
}

export async function getPolicy(
  userId: string,
  policyId: string
): Promise<Policy | null> {
  const policyRef = doc(db, "users", userId, "policies", policyId)
  const policySnap = await getDoc(policyRef)

  if (!policySnap.exists()) {return null}

  return { id: policySnap.id, ...policySnap.data() } as Policy
}

export async function createPolicy(
  userId: string,
  policy: Omit<Policy, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const policiesRef = collection(db, "users", userId, "policies")
    const newPolicyRef = doc(policiesRef)

    await setDoc(newPolicyRef, {
      ...policy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return newPolicyRef.id
  } catch (error) {
    throw formatFirebaseError(error, "Create policy")
  }
}

export async function updatePolicy(
  userId: string,
  policyId: string,
  updates: Partial<Policy>
): Promise<void> {
  try {
    const policyRef = doc(db, "users", userId, "policies", policyId)
    await updateDoc(policyRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    throw formatFirebaseError(error, "Update policy")
  }
}

export async function deletePolicy(
  userId: string,
  policyId: string
): Promise<void> {
  try {
    const policyRef = doc(db, "users", userId, "policies", policyId)
    await deleteDoc(policyRef)
  } catch (error) {
    throw formatFirebaseError(error, "Delete policy")
  }
}

// ==================== SETTINGS ====================

export async function getUserSettings(
  userId: string
): Promise<UserSettings | null> {
  try {
    const settingsRef = doc(db, "users", userId, "settings", "general")
    const settingsSnap = await getDoc(settingsRef)

    if (!settingsSnap.exists()) {return null}

    return convertTimestamps(settingsSnap.data()) as UserSettings
  } catch (error) {
    throw formatFirebaseError(error, "Load settings")
  }
}

export async function updateUserSettings(
  userId: string,
  updates: Partial<UserSettings>
): Promise<void> {
  try {
    const settingsRef = doc(db, "users", userId, "settings", "general")
    // Use setDoc with merge:true to create document if it doesn't exist
    await setDoc(settingsRef, updates, { merge: true })
  } catch (error) {
    throw formatFirebaseError(error, "Update settings")
  }
}

// ==================== SEARCH ====================

export async function searchProducts(
  userId: string,
  searchQuery: string
): Promise<Product[]> {
  // Firestore doesn't support full-text search natively
  // We'll fetch all products and filter client-side for now
  // For production, consider Algolia or Elasticsearch
  const products = await getProducts(userId)
  const query = searchQuery.toLowerCase()

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.tags?.some((tag) => tag.toLowerCase().includes(query))
  )
}
