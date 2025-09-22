import { useState, useRef, useEffect, useMemo } from 'react'
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/outline'
import type { ParsedTask, Category, ActionCustom } from '../../types'
import { createTaskParser } from '../../services/taskParser'

interface TaskInputProps {
  categories: Category[]
  actions: ActionCustom[]
  onSubmit: (task: ParsedTask) => void
  loading?: boolean
}

export function TaskInput({ categories, actions, onSubmit, loading = false }: TaskInputProps) {
  const [input, setInput] = useState('')
  const [parsedTask, setParsedTask] = useState<ParsedTask | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const parser = useMemo(() => createTaskParser(categories, actions), [categories, actions])

  useEffect(() => {
    if (input.trim()) {
      const parsed = parser.parse(input)
      setParsedTask(parsed)
      setShowPreview(true)
    } else {
      setParsedTask(null)
      setShowPreview(false)
    }
  }, [input, parser])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (parsedTask) {
      onSubmit(parsedTask)
      setInput('')
      setParsedTask(null)
      setShowPreview(false)
      inputRef.current?.focus()
    }
  }

  const getCategoryIcon = (categoryName?: string) => {
    const category = categories.find(c => c.nom === categoryName)
    return category?.icone || '📋'
  }

  const getCategoryColor = (categoryName?: string) => {
    const category = categories.find(c => c.nom === categoryName)
    return category?.couleur || '#6B7280'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="flex-1">
            <label htmlFor="task-input" className="sr-only">
              Nouvelle tâche
            </label>
            <input
              ref={inputRef}
              id="task-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Appeler Mme D. 2022458 résultat ECBU urgent vendredi"
              className="block w-full border-0 bg-transparent text-gray-900 placeholder-gray-400 focus:ring-0 text-base sm:text-lg placeholder:text-sm sm:placeholder:text-base"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors space-x-2 text-sm sm:text-base"
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Ajouter</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>

        {showPreview && parsedTask && (
          <div className="mt-3 sm:mt-4 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-2 mb-3">
              <SparklesIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Parsing automatique</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
              {parsedTask.categorie_detectee && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 text-xs sm:text-sm">Catégorie:</span>
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${getCategoryColor(parsedTask.categorie_detectee)}20`, color: getCategoryColor(parsedTask.categorie_detectee) }}
                  >
                    {getCategoryIcon(parsedTask.categorie_detectee)} {parsedTask.categorie_detectee}
                  </span>
                </div>
              )}

              {parsedTask.action && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 text-xs sm:text-sm">Action:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {parsedTask.action}
                  </span>
                </div>
              )}

              {parsedTask.patient_initiales && (
                <div className="flex items-start space-x-2 sm:col-span-2">
                  <span className="text-gray-500 text-xs sm:text-sm flex-shrink-0">Patient:</span>
                  <span className="font-medium text-gray-900 text-xs sm:text-sm">
                    {parsedTask.patient_initiales}
                    {parsedTask.patient_numero_anonymise && (
                      <span className="block sm:inline sm:ml-1 text-gray-600">
                        ({parsedTask.patient_numero_anonymise})
                      </span>
                    )}
                  </span>
                </div>
              )}

              {parsedTask.priorite === 'urgent' && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 text-xs sm:text-sm">Priorité:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    🔴 Urgent
                  </span>
                </div>
              )}

              {parsedTask.echeance && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 text-xs sm:text-sm">Échéance:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    📅 {new Date(parsedTask.echeance).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}

              {parsedTask.contexte && (
                <div className="flex items-start space-x-2 sm:col-span-2">
                  <span className="text-gray-500 text-xs sm:text-sm flex-shrink-0">Contexte:</span>
                  <span className="font-medium text-gray-900 text-xs sm:text-sm">{parsedTask.contexte}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  )
}