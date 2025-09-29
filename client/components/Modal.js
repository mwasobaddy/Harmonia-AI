import { X } from 'lucide-react'

export default function Modal({
  isOpen,
  onClose,
  icon: Icon,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  iconColor = 'text-blue-500',
  titleColor = 'text-gray-900',
  confirmButtonColor = 'bg-blue-500 hover:bg-blue-600'
}) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/50 backdrop-blur-md w-screen top-0 left-0">
      <div className="bg-[#0f2b2fcc] rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {Icon && <Icon className={`h-6 w-6 ${iconColor}`} />}
            <h3 className={`text-lg font-semibold ${titleColor}`}>{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#73cfd0] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-white">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 flex items-center gap-2 text-white rounded-md transition-colors ${confirmButtonColor}`}
          >
            {Icon && <Icon className={`h-4 w-4`} />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}