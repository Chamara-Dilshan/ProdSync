import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  DocumentData,
  Timestamp,
} from "firebase/firestore"
import { db } from "./config"
import { Product, Policy, UserSettings } from "@/types"

// Helper function to convert Firestore Timestamp to Date
function convertTimestamps<T = DocumentData>(data: T): T {
  if (data !== null && data !== undefined && typeof data === "object") {
    const converted: Record<string, unknown> = {}
    for (const key in data) {
      const value = data[key]
      if (value instanceof Timestamp) {
        converted[key] = value.toDate()
      } else if (typeof value === "object" && value !== null) {
        converted[key] = convertTimestamps(value)
      } else {
        converted[key] = value
      }
    }
    return converted as T
  }
  return data
}

// Helper function to normalize Product data from Firestore
// Ensures array fields are always arrays, not strings
function normalizeProduct(data: DocumentData): Product {
  const normalizeArrayField = (value: unknown): string[] | undefined => {
    if (value === undefined || value === null) {
      return undefined
    }
    if (Array.isArray(value)) {
      // Ensure all elements are strings
      return value.filter((item): item is string => typeof item === "string")
    }
    if (typeof value === "string") {
      // Convert comma-separated string to array
      const items = value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
      return items.length > 0 ? items : undefined
    }
    return undefined
  }

  return {
    ...data,
    sizes: normalizeArrayField(data.sizes),
    colors: normalizeArrayField(data.colors),
    materials: normalizeArrayField(data.materials),
    tags: normalizeArrayField(data.tags),
  } as Product
}

// Helper function to remove undefined fields from an object
// Firestore doesn't accept undefined values - they must be omitted
function removeUndefinedFields<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  const cleaned: Partial<T> = {}
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key]
    }
  }
  return cleaned
}

// Helper function to format Firebase errors for users
function formatFirebaseError(error: unknown, operation: string): Error {
  const errorCode = (error as { code?: string })?.code ?? "unknown"
  const errorMessage =
    (error as { message?: string })?.message ?? "An unknown error occurred"

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

    return snapshot.docs.map((doc) => {
      const data = convertTimestamps(doc.data())
      return {
        id: doc.id,
        ...normalizeProduct(data),
      }
    })
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

  if (!productSnap.exists()) {
    return null
  }

  const data = convertTimestamps(productSnap.data())
  return {
    id: productSnap.id,
    ...normalizeProduct(data),
  }
}

export async function createProduct(
  userId: string,
  product: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const productsRef = collection(db, "users", userId, "products")
    const newProductRef = doc(productsRef)

    // Remove undefined fields before saving to Firestore
    const cleanedProduct = removeUndefinedFields(product)

    await setDoc(newProductRef, {
      ...cleanedProduct,
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

    // Remove undefined fields before saving to Firestore
    const cleanedUpdates = removeUndefinedFields(updates)

    await updateDoc(productRef, {
      ...cleanedUpdates,
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

  if (!policySnap.exists()) {
    return null
  }

  return { id: policySnap.id, ...policySnap.data() } as Policy
}

export async function createPolicy(
  userId: string,
  policy: Omit<Policy, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const policiesRef = collection(db, "users", userId, "policies")
    const newPolicyRef = doc(policiesRef)

    // Remove undefined fields before saving to Firestore
    const cleanedPolicy = removeUndefinedFields(policy)

    await setDoc(newPolicyRef, {
      ...cleanedPolicy,
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

    // Remove undefined fields before saving to Firestore
    const cleanedUpdates = removeUndefinedFields(updates)

    await updateDoc(policyRef, {
      ...cleanedUpdates,
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

    if (!settingsSnap.exists()) {
      return null
    }

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

  return products.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(query)
    const descMatch = product.description?.toLowerCase().includes(query)
    const tagMatch = product.tags?.some((tag) =>
      tag.toLowerCase().includes(query)
    )
    return nameMatch || descMatch || tagMatch
  })
}
