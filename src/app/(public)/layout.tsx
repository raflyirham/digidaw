import PublicLayout from '@/components/layout/PublicLayout'

export default function PublicGroup({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      {children}
    </PublicLayout>
  )
}
