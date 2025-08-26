"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { type Material, type Lend, createLend, updateLend } from "@/lib/database"
import { useNotification } from "@/hooks/use-notification"
import { Plus } from "lucide-react"

interface LendsTabProps {
  materials: Material[]
  lends: Lend[]
  setLends: (lends: Lend[]) => void
  confirmDialog: any
  setConfirmDialog: (dialog: any) => void
}

export default function LendsTab({ materials, lends, setLends }: LendsTabProps) {
  const { showSuccess, showError } = useNotification()
  const [isAddLendOpen, setIsAddLendOpen] = useState(false)

  const handleAddLend = async (formData: FormData) => {
    try {
      const materialId = formData.get("material-id") as string
      const material = materials.find((m) => m.id === materialId)
      const newLend = {
        materialId,
        item_name: material?.name ?? "",
        category: material?.category ?? "",
        quantity: Number(formData.get("quantity") as string),
        date: new Date().toISOString(),
        borrower: formData.get("student-name") as string,
        delivered_by: "", // Fill with appropriate value if available
        studentName: formData.get("student-name") as string, // If not needed, remove this line
        authorized_by: "", // Provide appropriate value if available
        due_date: new Date().toISOString(), // Set due date as needed
      }
      const created = await createLend(newLend)
      setLends([...lends, created])
      showSuccess("Empréstimo registrado!")
      setIsAddLendOpen(false)
    } catch (error) {
      console.error(error)
      showError("Erro ao registrar empréstimo")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Dialog open={isAddLendOpen} onOpenChange={setIsAddLendOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#d09c91] hover:bg-[#b8877e] flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Registrar Empréstimo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Registrar Empréstimo</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleAddLend(formData)
              }}
              className="grid gap-4 py-4"
            >
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Nome do Material</label>
                <input
                  name="material-name"
                  placeholder="Digite o nome do material"
                  required
                  className="input"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Material</label>
                <select name="material-id" required className="input">
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Qtd: {m.quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Quantidade</label>
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  max={materials.reduce((max, m) => Math.max(max, m.quantity), 0)}
                  placeholder="Quantidade"
                  required
                  className="input"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddLendOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#d09c91] hover:bg-[#b8877e]">
                  Registrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-[#7f6e62] mb-4">Empréstimos Registrados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lends.map((lend) => {
            const material = materials.find((m) => m.id === lend.materialId)
            return (
              <Card key={lend.id} className="bg-white/90 backdrop-blur-sm">
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[#7f6e62]">{lend.materialId}</h4>
                    {material && <Badge variant="secondary">{material.category}</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Material: {material?.name ?? "Desconhecido"}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">Quantidade: {lend.quantity}</p>
                  <p className="text-xs text-gray-500">Data: {new Date(lend.date).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
