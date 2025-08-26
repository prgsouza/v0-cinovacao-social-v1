"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NavigationHeader } from "@/components/navigation-header"
import { PageContainer } from "@/components/page-container"
import { useNotification } from "@/hooks/use-notification"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import MaterialsTab from "./MaterialsTab"
import LendsTab from "./LendsTab"
import Loading from "./loading"

import { getMaterials, getLends, type Material, type Lend } from "@/lib/database"

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [lends, setLends] = useState<Lend[]>([])
  const [loading, setLoading] = useState(true)
  const { showError } = useNotification()

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    onConfirm: () => void
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [materialsData, lendsData] = await Promise.all([getMaterials(), getLends()])
        setMaterials(materialsData)
        setLends(lendsData)
      } catch (error) {
        console.error(error)
        showError("Erro ao carregar dados do banco")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <Loading />

  return (
    <PageContainer>
      <NavigationHeader title="Gestão de Materiais" />
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="materials" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/90 backdrop-blur-sm">
            <TabsTrigger value="materials" className="data-[state=active]:bg-[#88957d] data-[state=active]:text-white">
              Materiais
            </TabsTrigger>
            <TabsTrigger value="lends" className="data-[state=active]:bg-[#d09c91] data-[state=active]:text-white">
              Empréstimos Solidários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials">
            <MaterialsTab
              materials={materials}
              setMaterials={setMaterials}
              confirmDialog={confirmDialog}
              setConfirmDialog={setConfirmDialog}
            />
          </TabsContent>

          <TabsContent value="lends">
            <LendsTab
              materials={materials}
              lends={lends}
              setLends={setLends}
              confirmDialog={confirmDialog}
              setConfirmDialog={setConfirmDialog}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  )
}
