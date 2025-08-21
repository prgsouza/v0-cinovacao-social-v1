import { toast } from "@/hooks/use-toast"

export function useNotification() {
  const showSuccess = (message: string, description?: string) => {
    toast({
      title: "Sucesso",
      description: message,
      variant: "default",
    })
  }

  const showError = (message: string, description?: string) => {
    toast({
      title: "Erro",
      description: message,
      variant: "destructive",
    })
  }

  const showInfo = (message: string, description?: string) => {
    toast({
      title: "Informação",
      description: message,
      variant: "default",
    })
  }

  const showWarning = (message: string, description?: string) => {
    toast({
      title: "Atenção",
      description: message,
      variant: "destructive",
    })
  }

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  }
}
