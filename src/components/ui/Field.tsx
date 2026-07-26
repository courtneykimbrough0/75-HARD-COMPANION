import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

export const FIELD_INPUT_CLASS =
  'w-full rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-gray-100 placeholder:text-gray-600 transition-colors focus-visible:border-purple-500/40 focus-visible:ring-2 focus-visible:ring-purple-500/40 focus-visible:outline-none'

interface FieldProps {
  label: string
  error?: string
  children: ReactNode
  className?: string
}

export function Field({ label, error, children, className = '' }: FieldProps) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
        {label}
      </span>
      {children}
      {error && <span className="text-[11px] font-medium text-red-400">{error}</span>}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return <input className={`${FIELD_INPUT_CLASS} ${className}`} {...rest} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props
  return <textarea className={`${FIELD_INPUT_CLASS} resize-y ${className}`} {...rest} />
}
