import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-heading font-bold text-white uppercase tracking-wider mb-1">
            {label}
            {props.required && <span className="text-[#ff3366] ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-3 border text-sm text-white placeholder:text-zinc-500',
            'transition-all duration-200 bg-[#121212]',
            'focus:ring-1 focus:ring-[#ccff00] focus:border-[#ccff00]',
            error
              ? 'border-[#ff3366] focus:ring-[#ff3366] focus:border-[#ff3366]'
              : 'border-white/10 hover:border-white/30',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export default Input
