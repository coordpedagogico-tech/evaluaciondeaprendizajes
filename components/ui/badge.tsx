import * as React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
}

const variantClasses: Record<string, string> = {
  default: 'bg-blue-100 text-blue-800 border-transparent',
  secondary: 'bg-gray-100 text-gray-800 border-transparent',
  destructive: 'bg-red-100 text-red-800 border-transparent',
  outline: 'text-gray-700 border-gray-300',
  success: 'bg-green-100 text-green-800 border-transparent',
  warning: 'bg-yellow-100 text-yellow-800 border-transparent'
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
