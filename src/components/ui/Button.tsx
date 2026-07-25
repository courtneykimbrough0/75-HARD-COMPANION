import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-purple-500 text-white hover:bg-purple-400 active:bg-purple-600',
  secondary: 'bg-gray-800 text-gray-100 hover:bg-gray-700 active:bg-gray-900 border border-gray-700',
  danger: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700',
  ghost: 'bg-transparent text-gray-300 hover:bg-gray-800',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-xl px-4 py-3 font-semibold transition-all duration-200 active:scale-[0.97] active:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  )
}
