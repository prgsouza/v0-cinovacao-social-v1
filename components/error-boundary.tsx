"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorBoundaryProps {
  error?: string
  onRetry?: () => void
  showRetry?: boolean
}

export function ErrorBoundary({ error = "Ocorreu um erro inesperado", onRetry, showRetry = true }: ErrorBoundaryProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md bg-red-50 border-red-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-red-800">Erro</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-red-700 text-sm">{error}</p>
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
