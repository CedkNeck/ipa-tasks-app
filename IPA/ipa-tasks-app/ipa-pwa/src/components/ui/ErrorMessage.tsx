import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ErrorMessageProps {
  title?: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function ErrorMessage({ title = 'Erreur', message, action }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex">
        <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <p className="text-sm text-red-700 mt-1">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-900"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}