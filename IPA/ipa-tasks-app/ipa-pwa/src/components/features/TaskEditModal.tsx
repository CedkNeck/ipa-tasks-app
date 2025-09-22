import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline'
import type { Task, Category } from '../../types'

interface TaskEditModalProps {
  task: Task | null
  categories: Category[]
  isOpen: boolean
  onClose: () => void
  onSave: (taskId: string, updates: Partial<Task>) => Promise<void>
  loading?: boolean
}

export function TaskEditModal({
  task,
  categories,
  isOpen,
  onClose,
  onSave,
  loading = false
}: TaskEditModalProps) {
  const [titre, setTitre] = useState('')
  const [categorieId, setCategorieId] = useState<string>('')
  const [patientInitiales, setPatientInitiales] = useState('')
  const [patientNumero, setPatientNumero] = useState('')
  const [priorite, setPriorite] = useState<'normal' | 'urgent'>('normal')
  const [isSaving, setIsSaving] = useState(false)

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setTitre(task.titre)
      setCategorieId(task.categorie_id || '')
      setPatientInitiales(task.patient_initiales || '')
      setPatientNumero(task.patient_numero_anonymise || '')
      setPriorite(task.priorite)
    }
  }, [task])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return

    setIsSaving(true)
    try {
      const updates: Partial<Task> = {
        titre,
        priorite
      }

      // Only add fields if they have values
      if (categorieId) {
        updates.categorie_id = categorieId
      } else {
        updates.categorie_id = null // Explicitly set to null to clear the category
      }

      if (patientInitiales) {
        updates.patient_initiales = patientInitiales
      }

      if (patientNumero) {
        updates.patient_numero_anonymise = patientNumero
      }

      await onSave(task.id, updates)
      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      onClose()
    }
  }

  if (!task) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex items-center space-x-2">
                    <PencilIcon className="h-5 w-5 text-blue-600" />
                    <span>Modifier la tâche</span>
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    disabled={isSaving}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  {/* Titre */}
                  <div>
                    <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
                      Titre de la tâche
                    </label>
                    <input
                      type="text"
                      id="titre"
                      value={titre}
                      onChange={(e) => setTitre(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isSaving}
                    />
                  </div>

                  {/* Catégorie */}
                  <div>
                    <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie
                    </label>
                    <select
                      id="categorie"
                      value={categorieId}
                      onChange={(e) => setCategorieId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSaving}
                    >
                      <option value="">Aucune catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icone} {cat.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Patient */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="initiales" className="block text-sm font-medium text-gray-700 mb-1">
                        Initiales patient
                      </label>
                      <input
                        type="text"
                        id="initiales"
                        value={patientInitiales}
                        onChange={(e) => setPatientInitiales(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Mme D."
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro patient
                      </label>
                      <input
                        type="text"
                        id="numero"
                        value={patientNumero}
                        onChange={(e) => setPatientNumero(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123456789"
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  {/* Priorité */}
                  <div>
                    <label htmlFor="priorite" className="block text-sm font-medium text-gray-700 mb-1">
                      Priorité
                    </label>
                    <select
                      id="priorite"
                      value={priorite}
                      onChange={(e) => setPriorite(e.target.value as 'normal' | 'urgent')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSaving}
                    >
                      <option value="normal">⚪ Normal</option>
                      <option value="urgent">🔴 Urgent</option>
                    </select>
                  </div>


                  {/* Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSaving}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isSaving && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}