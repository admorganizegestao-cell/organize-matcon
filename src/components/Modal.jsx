import React from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
        {footer && <div className="flex gap-3 mt-6">{footer}</div>}
      </div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium text-white mb-2 block">{label}</label>
      {children}
    </div>
  )
}

export const inputClass = 'w-full px-3 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]'
