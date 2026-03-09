import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-heading font-bold uppercase tracking-[0.1em] transition-all duration-300 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]'

    const variants = {
      primary: 'bg-[#ccff00] hover:bg-[#b3e600] text-black shadow-[0_0_15px_rgba(204,255,0,0.15)] hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]',
      secondary: 'bg-white hover:bg-zinc-200 text-black',
      outline: 'border border-white/20 text-white hover:border-[#ccff00] hover:text-[#ccff00] bg-transparent',
      ghost: 'text-zinc-400 hover:bg-white/5 hover:text-white',
      danger: 'bg-[#ff3366] hover:bg-[#e6004c] text-white',
    }

    const sizes = {
      sm: 'px-4 py-2 text-[10px] gap-1.5',
      md: 'px-6 py-3 text-xs gap-2',
      lg: 'px-8 py-4 text-sm gap-2.5',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export default Button
