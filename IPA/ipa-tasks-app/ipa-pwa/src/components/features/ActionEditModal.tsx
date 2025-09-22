import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline'
import type { TaskAction } from '../../types'

interface ActionEditModalProps {
  action: TaskAction | null
  isOpen: boolean
  onClose: () => void
  onSave: (actionId: string, updates: Partial<TaskAction>) => Promise<void>
  loading?: boolean
}

export function ActionEditModal({
  action,
  isOpen,
  onClose,
  onSave,
  loading = false
}: ActionEditModalProps) {
  const [actionText, setActionText] = useState('')
  const [contexte, setContexte] = useState('')
  const [priorite, setPriorite] = useState<'normal' | 'urgent'>('normal')
  const [echeance, setEcheance] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Reset form when action changes
  useEffect(() => {
    if (action) {
      setActionText(action.action)
      setContexte(action.contexte || '')
      setPriorite(action.priorite)
      setEcheance(action.echeance || '')
      setNotes(action.notes || '')
    }
  }, [action])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!action) return

    setIsSaving(true)
    try {
      const updates: Partial<TaskAction> = {
        action: actionText,
        priorite
      }

      // Only add fields if they have values
      if (contexte) {
        updates.contexte = contexte
      }

      if (echeance) {
        updates.echeance = echeance
      }

      if (notes) {
        updates.notes = notes
      }

      await onSave(action.id, updates)
      onClose()
    } catch (error) {
      console.error('Failed to save action:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      onClose()
    }
  }

  if (!action) return null

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
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md sm:max-w-lg transform overflow-hidden rounded-2xl bg-white p-4 sm:p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <Dialog.Title as="h3" className="text-base sm:text-lg font-medium leading-6 text-gray-900 flex items-center space-x-2">
                    <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    <span>Modifier l'action</span>
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    disabled={isSaving}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-3 sm:space-y-4">
                  {/* Action */}
                  <div>
                    <label htmlFor="action" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Action *
                    </label>
                    <input
                      type="text"
                      id="action"
                      value={actionText}
                      onChange={(e) => setActionText(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="APPELER, REGARDER, PROGRAMMER..."
                      required
                      disabled={isSaving}
                    />
                  </div>

                  {/* Contexte */}
                  <div>
                    <label htmlFor="contexte" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Contexte
                    </label>
                    <input
                      type="text"
                      id="contexte"
                      value={contexte}
                      onChange={(e) => setContexte(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Dossier, RCP, Urgence..."
                      disabled={isSaving}
                    />
                  </div>

                  {/* Priorité et Échéance - Mobile: stacked, Desktop: grid */}
                  <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
                    <div>
                      <label htmlFor="priorite" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Priorité
                      </label>
                      <select
                        id="priorite"
                        value={priorite}
                        onChange={(e) => setPriorite(e.target.value as 'normal' | 'urgent')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSaving}
                      >
                        <option value="normal">⚪ Normal</option>
                        <option value="urgent">🔴 Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="echeance" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Échéance
                      </label>
                      <input
                        type="datetime-local"
                        id="echeance"
                        value={echeance}
                        onChange={(e) => setEcheance(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:rows-3"
                      placeholder="Notes additionnelles..."
                      disabled={isSaving}
                    />
                  </div>

                  {/* Info statut */}
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-md">
                    <p className="text-xs sm:text-sm text-gray-600">
                      <span className="font-medium">Statut:</span> {action.statut === 'fait' ? '✅ Terminée' : '⏳ En attente'}
                    </p>
                    {action.date_completion && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        <span className="font-medium">Terminée le:</span> {new Date(action.date_completion).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>

                  {/* Buttons - Mobile: stacked, Desktop: horizontal */}
                  <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSaving}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 order-2 sm:order-1"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || loading}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 order-1 sm:order-2"
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