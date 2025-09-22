import type { ParsedTask, Category, ActionCustom } from '../types'

interface ParsingContext {
  categories: Category[]
  actions: ActionCustom[]
}

export class TaskParser {
  private actions: ActionCustom[]

  constructor(context: ParsingContext) {
    this.actions = context.actions
  }

  parse(input: string): ParsedTask {
    const cleaned = input.trim()
    
    return {
      titre: cleaned,
      action: this.extractAction(cleaned),
      contexte: this.extractContext(cleaned),
      patient_initiales: this.extractPatientInitials(cleaned),
      patient_numero_anonymise: this.extractPatientNumber(cleaned),
      priorite: this.extractPriority(cleaned),
      echeance: this.extractDeadline(cleaned),
      categorie_detectee: this.detectCategory(cleaned)
    }
  }

  private extractAction(text: string): string | undefined {
    const actionNames = this.actions.map(a => a.nom.toLowerCase())
    const words = text.toLowerCase().split(/\s+/)
    
    // Look for exact action matches
    for (const actionName of actionNames) {
      if (words.includes(actionName.toLowerCase())) {
        return actionName.toUpperCase()
      }
    }

    // Look for action verbs at the beginning
    const actionPatterns = [
      /^(appeler|appel|tel)/i,
      /^(contrôler|controler|vérifier|check)/i,
      /^(programmer|planifier|prévoir)/i,
      /^(regarder|voir|consulter|examiner)/i,
      /^(discuter|parler|échanger)/i,
      /^(rencontrer|rdv|rendez-vous)/i,
      /^(organiser|préparer|mettre en place)/i
    ]

    const actionMappings = [
      'APPELER', 'CONTROLER', 'PROGRAMMER', 
      'REGARDER', 'DISCUTER', 'RENCONTRER', 'ORGANISER'
    ]

    for (let i = 0; i < actionPatterns.length; i++) {
      if (actionPatterns[i].test(text)) {
        return actionMappings[i]
      }
    }

    return undefined
  }

  private extractContext(text: string): string | undefined {
    // Remove action verbs and patient info to get context
    let context = text
    
    // Remove action verbs
    const actionVerbs = [
      /^(appeler|appel|tel)\s+/i,
      /^(contrôler|controler|vérifier|check)\s+/i,
      /^(programmer|planifier|prévoir)\s+/i,
      /^(regarder|voir|consulter|examiner)\s+/i,
      /^(discuter|parler|échanger)\s+/i,
      /^(rencontrer|rdv|rendez-vous)\s+/i,
      /^(organiser|préparer|mettre en place)\s+/i
    ]

    for (const pattern of actionVerbs) {
      context = context.replace(pattern, '')
    }

    // Remove patient initials and numbers
    context = context.replace(/\b[A-Z][a-z]*\.?\s+[A-Z]\.?\s+\d+/g, '')
    context = context.replace(/\b\d{4,8}\b/g, '')

    // Remove priority keywords
    context = context.replace(/\b(urgent|important|normal)\b/gi, '')

    // Remove time expressions
    context = context.replace(/\b(demain|aujourd'hui|vendredi|lundi|mardi|mercredi|jeudi|samedi|dimanche)\b/gi, '')
    context = context.replace(/\b(dans\s+\d+\s+(jours?|semaines?|mois))\b/gi, '')

    return context.trim() || undefined
  }

  private extractPatientInitials(text: string): string | undefined {
    // Pattern 1: Mme/M./Mlle + Name + Initial (e.g., "Mme Dupont D.")
    const fullNamePattern = /\b(Mme?\.?|M\.?|Mlle\.?)\s+([A-Z][a-z]*\.?)\s+([A-Z]\.?)/g
    const fullMatch = fullNamePattern.exec(text)

    if (fullMatch) {
      return `${fullMatch[1]} ${fullMatch[2]} ${fullMatch[3]}`
    }

    // Pattern 2: Mme/M./Mlle + Single initial/name (e.g., "Mme D." or "Mme Dupont")
    const singleNamePattern = /\b(Mme?\.?|M\.?|Mlle\.?)\s+([A-Z][a-z]*\.?)/g
    const singleMatch = singleNamePattern.exec(text)

    if (singleMatch) {
      return `${singleMatch[1]} ${singleMatch[2]}`
    }

    // Pattern 3: Just initials (e.g., "D. M.")
    const simplePattern = /\b([A-Z]\.\s*[A-Z]\.?)\b/g
    const simpleMatch = simplePattern.exec(text)

    if (simpleMatch) {
      return simpleMatch[1]
    }

    return undefined
  }

  private extractPatientNumber(text: string): string | undefined {
    // Pattern: 4+ digit numbers (patient numbers) - extended range
    const numberPattern = /\b(\d{4,12})\b/g
    const match = numberPattern.exec(text)

    return match ? match[1] : undefined
  }

  private extractPriority(text: string): 'urgent' | 'normal' {
    const urgentPattern = /\b(urgent|urgente|prioritaire|asap|rapidement)\b/gi
    
    return urgentPattern.test(text) ? 'urgent' : 'normal'
  }

  private extractDeadline(text: string): string | undefined {
    const today = new Date()
    
    // Named days
    const dayPatterns = [
      { pattern: /\b(demain)\b/gi, offset: 1 },
      { pattern: /\b(après-demain)\b/gi, offset: 2 },
      { pattern: /\b(lundi)\b/gi, dayOfWeek: 1 },
      { pattern: /\b(mardi)\b/gi, dayOfWeek: 2 },
      { pattern: /\b(mercredi)\b/gi, dayOfWeek: 3 },
      { pattern: /\b(jeudi)\b/gi, dayOfWeek: 4 },
      { pattern: /\b(vendredi)\b/gi, dayOfWeek: 5 },
      { pattern: /\b(samedi)\b/gi, dayOfWeek: 6 },
      { pattern: /\b(dimanche)\b/gi, dayOfWeek: 0 }
    ]

    for (const { pattern, offset, dayOfWeek } of dayPatterns) {
      if (pattern.test(text)) {
        if (offset !== undefined) {
          const date = new Date(today)
          date.setDate(date.getDate() + offset)
          return date.toISOString().split('T')[0]
        }
        
        if (dayOfWeek !== undefined) {
          const date = new Date(today)
          const diff = (dayOfWeek + 7 - date.getDay()) % 7
          date.setDate(date.getDate() + (diff === 0 ? 7 : diff))
          return date.toISOString().split('T')[0]
        }
      }
    }

    // Relative dates
    const relativePattern = /\bdans\s+(\d+)\s+(jours?|semaines?|mois)\b/gi
    const relativeMatch = relativePattern.exec(text)
    
    if (relativeMatch) {
      const amount = parseInt(relativeMatch[1])
      const unit = relativeMatch[2].toLowerCase()
      const date = new Date(today)
      
      if (unit.startsWith('jour')) {
        date.setDate(date.getDate() + amount)
      } else if (unit.startsWith('semaine')) {
        date.setDate(date.getDate() + (amount * 7))
      } else if (unit.startsWith('mois')) {
        date.setMonth(date.getMonth() + amount)
      }
      
      return date.toISOString().split('T')[0]
    }

    // Absolute dates (DD/MM/YYYY or DD/MM)
    const absolutePattern = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/g
    const absoluteMatch = absolutePattern.exec(text)
    
    if (absoluteMatch) {
      const day = parseInt(absoluteMatch[1])
      const month = parseInt(absoluteMatch[2]) - 1 // JS months are 0-indexed
      const year = absoluteMatch[3] ? parseInt(absoluteMatch[3]) : today.getFullYear()
      
      const date = new Date(year, month, day)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
    }

    return undefined
  }

  private detectCategory(text: string): string | undefined {
    const lowerText = text.toLowerCase()

    // Patient-related keywords
    const patientKeywords = [
      'patient', 'mme', 'm.', 'mlle', 'ecbu', 'résultat', 'analyse',
      'examen', 'bilan', 'chimio', 'traitement', 'effet', 'toxicité',
      'surveillance', 'suivi', 'appeler', 'rappeler', 'mr'
    ]

    // Project-related keywords  
    const projectKeywords = [
      'projet', 'recherche', 'étude', 'protocole', 'inclure', 'inclusion',
      'amélioration', 'qualité', 'évaluation', 'audit', 'développement'
    ]

    // Administrative keywords
    const adminKeywords = [
      'formation', 'dpc', 'réunion', 'staff', 'planning', 'congés',
      'administratif', 'rapport', 'document', 'procédure', 'protocole',
      'certification', 'accréditation'
    ]

    // Team-related keywords
    const teamKeywords = [
      'dr', 'docteur', 'médecin', 'équipe', 'collègue', 'discuter',
      'rencontrer', 'coordination', 'transmission', 'relai'
    ]

    // Count matches for each category
    const scores = {
      patient: patientKeywords.filter(keyword => lowerText.includes(keyword)).length,
      projet: projectKeywords.filter(keyword => lowerText.includes(keyword)).length,
      administratif: adminKeywords.filter(keyword => lowerText.includes(keyword)).length,
      equipe: teamKeywords.filter(keyword => lowerText.includes(keyword)).length
    }

    // Find category with highest score
    const maxScore = Math.max(...Object.values(scores))
    if (maxScore === 0) return undefined

    const detectedCategory = Object.entries(scores).find(([, score]) => score === maxScore)?.[0]

    // Map to actual category names
    const categoryMap: Record<string, string> = {
      patient: 'Patient',
      projet: 'Projet', 
      administratif: 'Administratif',
      equipe: 'Équipe'
    }

    return detectedCategory ? categoryMap[detectedCategory] : undefined
  }
}

export function createTaskParser(categories: Category[], actions: ActionCustom[]): TaskParser {
  return new TaskParser({ categories, actions })
}