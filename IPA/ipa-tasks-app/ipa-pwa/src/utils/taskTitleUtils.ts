import type { ParsedTask, Category } from '../types'

/**
 * Generates a neutral task title based on the parsed task data
 * Format: "Category Patient (ID)" or just "Category" if no patient
 */
export function generateNeutralTaskTitle(
  parsedTask: ParsedTask,
  category?: Category
): string {
  const categoryName = category?.nom || parsedTask.categorie_detectee || 'Tâche'

  // For patient tasks, try multiple approaches to get patient info
  if (categoryName === 'Patient') {
    // Use patient_initiales if available
    if (parsedTask.patient_initiales) {
      const patientNumber = parsedTask.patient_numero_anonymise
        ? ` (${parsedTask.patient_numero_anonymise})`
        : ''
      return `${categoryName} ${parsedTask.patient_initiales}${patientNumber}`
    }

    // Fallback: if we have a patient number but no initials, show just the number
    if (parsedTask.patient_numero_anonymise) {
      return `${categoryName} (${parsedTask.patient_numero_anonymise})`
    }

    // Last fallback: try to extract patient info from title
    const patientMatch = parsedTask.titre.match(/\b(Mme?\.?|M\.?|Mlle\.?)\s+([A-Z][a-z]*\.?)/i)
    if (patientMatch) {
      const patientInfo = `${patientMatch[1]} ${patientMatch[2]}`
      const patientNumber = parsedTask.patient_numero_anonymise
        ? ` (${parsedTask.patient_numero_anonymise})`
        : ''
      return `${categoryName} ${patientInfo}${patientNumber}`
    }
  }

  // For non-patient tasks, include some context
  if (parsedTask.contexte && categoryName !== 'Patient') {
    const contextPreview = parsedTask.contexte.length > 30
      ? parsedTask.contexte.substring(0, 30) + '...'
      : parsedTask.contexte
    return `${categoryName} - ${contextPreview}`
  }

  return categoryName
}

/**
 * Extracts the core task information for evolutionary tasks
 * This helps maintain consistency when the same "task container" evolves
 */
export function extractTaskCore(parsedTask: ParsedTask) {
  return {
    patient_initiales: parsedTask.patient_initiales,
    patient_numero_anonymise: parsedTask.patient_numero_anonymise,
    categorie_detectee: parsedTask.categorie_detectee
  }
}

/**
 * Extracts the action-specific information that will vary between actions
 */
export function extractActionDetails(parsedTask: ParsedTask) {
  return {
    action: parsedTask.action,
    contexte: parsedTask.contexte,
    priorite: parsedTask.priorite,
    echeance: parsedTask.echeance,
    texte_original: parsedTask.titre
  }
}