import type { ReactNode } from "react"

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`relative flex w-full min-h-screen bg-transparent ${className}`}>

      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      <div className="relative z-10 w-full">{children}</div>
    </div>
  )
}
