import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
  type UserCredential
} from 'firebase/auth'
import { auth } from './firebase'
import { firebaseCategoriesService } from './firebaseCategoriesService'
import { firebaseActionsCustomService } from './firebaseActionsCustomService'

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export class FirebaseAuthService {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      console.log('✅ User signed in:', user.uid)

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }
    } catch (error: any) {
      console.error('❌ Sign in error:', error)
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, displayName?: string): Promise<AuthUser> {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update display name if provided
      if (displayName) {
        await updateProfile(user, { displayName })
      }

      console.log('✅ User signed up:', user.uid)

      // Create default categories and actions for new user
      try {
        await Promise.all([
          firebaseCategoriesService.createDefaultCategories(user.uid),
          firebaseActionsCustomService.createDefaultActions(user.uid)
        ])
        console.log('✅ Default data created for new user')
      } catch (error) {
        console.warn('⚠️ Failed to create default data:', error)
      }

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }
    } catch (error: any) {
      console.error('❌ Sign up error:', error)
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth)
      console.log('✅ User signed out')
    } catch (error) {
      console.error('❌ Sign out error:', error)
      throw error
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
      console.log('✅ Password reset email sent')
    } catch (error: any) {
      console.error('❌ Password reset error:', error)
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: { displayName?: string; photoURL?: string }): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user')
      }

      await updateProfile(auth.currentUser, updates)
      console.log('✅ Profile updated')
    } catch (error) {
      console.error('❌ Profile update error:', error)
      throw error
    }
  }

  /**
   * Update user password
   */
  async updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error('No authenticated user')
      }

      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword)
      await reauthenticateWithCredential(auth.currentUser, credential)

      // Update password
      await updatePassword(auth.currentUser, newPassword)
      console.log('✅ Password updated')
    } catch (error: any) {
      console.error('❌ Password update error:', error)
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    if (!auth.currentUser) return null

    return {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName,
      photoURL: auth.currentUser.photoURL
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        })
      } else {
        callback(null)
      }
    })
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser
  }

  /**
   * Wait for auth initialization
   */
  waitForAuth(): Promise<AuthUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe()
        if (user) {
          resolve({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          })
        } else {
          resolve(null)
        }
      })
    })
  }

  /**
   * Convert Firebase error codes to user-friendly messages
   */
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Adresse email invalide'
      case 'auth/user-disabled':
        return 'Ce compte a été désactivé'
      case 'auth/user-not-found':
        return 'Aucun compte trouvé avec cette adresse email'
      case 'auth/wrong-password':
        return 'Mot de passe incorrect'
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée'
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères'
      case 'auth/operation-not-allowed':
        return 'Cette opération n\'est pas autorisée'
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Veuillez réessayer plus tard'
      case 'auth/requires-recent-login':
        return 'Cette action nécessite une reconnexion récente'
      default:
        return 'Une erreur est survenue lors de l\'authentification'
    }
  }
}

// Singleton instance
export const firebaseAuthService = new FirebaseAuthService()