import { initializeApp } from 'firebase/app'
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDk8Kv3U0JwndvQ_rki8UzT4NuRvrI8diE",
  authDomain: "ipa-tasks-bf8f7.firebaseapp.com",
  projectId: "ipa-tasks-bf8f7",
  storageBucket: "ipa-tasks-bf8f7.firebasestorage.app",
  messagingSenderId: "1022629962384",
  appId: "1:1022629962384:web:45f725d9a42b32c8912e15",
  measurementId: "G-Z57QWPRQSY"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Auth
export const auth = getAuth(app)

// Connect to emulators in development - DISABLED for now
// if (import.meta.env.DEV && !window.location.hostname.includes('firebase')) {
//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080)
//     connectAuthEmulator(auth, 'http://localhost:9099')
//   } catch (error) {
//     console.log('Emulators not available or already connected')
//   }
// }

// Enable offline persistence
let persistenceEnabled = false

export const enableOfflinePersistence = async (): Promise<void> => {
  if (persistenceEnabled) return

  try {
    await enableIndexedDbPersistence(db)
    persistenceEnabled = true
    console.log('✅ Firestore offline persistence enabled')
  } catch (err: any) {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time')
    } else if (err.code === 'unimplemented') {
      console.error('❌ The current browser does not support offline persistence')
    } else {
      console.error('❌ Failed to enable offline persistence:', err)
    }
  }
}

// Auto-enable persistence
enableOfflinePersistence()

export default app