import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple'
  className?: string
}

export default function Badge({ children, variant = 'blue', className }: BadgeProps) {
  const variants = {
    blue: 'bg-black text-[#00f0ff] border-[#00f0ff]/30',
    green: 'bg-black text-[#ccff00] border-[#ccff00]/30',
    yellow: 'bg-black text-[#facc15] border-[#facc15]/30',
    red: 'bg-black text-[#ff3366] border-[#ff3366]/30',
    gray: 'bg-[#1a1a1a] text-white border-white/20',
    purple: 'bg-black text-[#b026ff] border-[#b026ff]/30',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold tracking-[0.15em] border font-heading backdrop-blur-md',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
