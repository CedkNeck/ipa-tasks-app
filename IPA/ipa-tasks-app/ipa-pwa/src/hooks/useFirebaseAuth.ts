import { useState, useEffect } from 'react'
import { firebaseAuthService, type AuthUser } from '../services/firebaseAuthService'

interface UseFirebaseAuthReturn {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
  clearError: () => void
}

export const useFirebaseAuth = (): UseFirebaseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChange((authUser) => {
      setUser(authUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      await firebaseAuthService.signIn(email, password)
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, displayName?: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      await firebaseAuthService.signUp(email, password, displayName)
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      await firebaseAuthService.signOut()
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setError(null)
      await firebaseAuthService.resetPassword(email)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateProfile = async (updates: { displayName?: string; photoURL?: string }): Promise<void> => {
    try {
      setError(null)
      await firebaseAuthService.updateUserProfile(updates)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      setError(null)
      await firebaseAuthService.updateUserPassword(currentPassword, newPassword)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const clearError = (): void => {
    setError(null)
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    updatePassword,
    clearError
  }
}