import React from 'react'

interface DumbbellIconProps {
  className?: string
  size?: number
}

export function DumbbellIcon({ className = 'w-6 h-6', size }: DumbbellIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1" />
      <path d="m3 3 1 1" />
      <path d="m18 22 4-4" />
      <path d="m2 6 4-4" />
      <path d="m3 10 7-7" />
      <path d="m14 21 7-7" />
    </svg>
  )
}

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'light' | 'dark'
  className?: string
}

export function NoWaitFitLogo({ size = 'md', variant = 'light', className = '' }: LogoProps) {
  const fontSizes = {
    sm: 'text-lg tracking-tight',
    md: 'text-2xl tracking-tighter',
    lg: 'text-3xl sm:text-4xl tracking-tighter',
  }

  const iconSizes = {
    sm: 'w-4 h-4 text-emerald-400',
    md: 'w-5 h-5 text-emerald-400',
    lg: 'w-7 h-7 text-emerald-400',
  }

  const textColor = variant === 'dark' ? 'text-slate-900' : 'text-white'

  return (
    <span
      className={`inline-flex items-center font-black select-none ${fontSizes[size]} ${textColor} ${className}`}
    >
      <span>N</span>
      <span className="relative inline-flex items-center justify-center mx-[1px]">
        <span className="relative z-0">O</span>
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none -rotate-12 scale-90">
          <DumbbellIcon className={iconSizes[size]} />
        </span>
      </span>
      <span className="bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
        WaitFit
      </span>
    </span>
  )
}
