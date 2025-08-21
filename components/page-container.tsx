import type { ReactNode } from "react"

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return <div className={`min-h-screen bg-gradient-to-br from-[#c8cbba] to-[#d5c4aa] ${className}`}>{children}</div>
}
