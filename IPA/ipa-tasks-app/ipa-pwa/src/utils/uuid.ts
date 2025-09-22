/**
 * Générateur d'UUID compatible avec tous les navigateurs
 */

// Fallback UUID v4 generator for browsers that don't support crypto.randomUUID
function generateUUIDFallback(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Génère un UUID v4 avec support pour les anciens navigateurs
 */
export function generateUUID(): string {
  // Vérifier si crypto.randomUUID est disponible
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID()
    } catch (error) {
      console.warn('crypto.randomUUID failed, using fallback:', error)
    }
  }

  // Fallback pour les navigateurs plus anciens
  return generateUUIDFallback()
}

/**
 * Vérifie si un UUID est valide
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}