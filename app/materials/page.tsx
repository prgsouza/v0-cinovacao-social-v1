"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NavigationHeader } from "@/components/navigation-header"
import { PageContainer } from "@/components/page-container"
import { useNotification } from "@/hooks/use-notification"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import {
  Search,
  Filter,
  Plus,
  Minus,
  AlertTriangle,
  Calendar,
  User,
  BookOpen,
  Gamepad2,
  Wrench,
  Palette,
  ChevronDown,
  Edit,
} from "lucide-react"

// Mock data
const shortageItems = [
  { id: 1, name: "Lápis de Cor", quantity: 2, needed: 20, category: "Arte" },
  { id: 2, name: "Cadernos", quantity: 5, needed: 30, category: "Escolar" },
  { id: 3, name: "Bolas de Futebol", quantity: 1, needed: 5, category: "Esporte" },
]

const initialMaterials = [
  { id: 1, name: "Lápis", quantity: 150, category: "Escolar", description: "Lápis HB para escrita" },
  { id: 2, name: "Borrachas", quantity: 80, category: "Escolar", description: "Borrachas brancas pequenas" },
  {
    id: 3,
    name: "Livros Infantis",
    quantity: 45,
    category: "Educação",
    description: "Livros para crianças de 6-10 anos",
  },
  { id: 4, name: "Tintas", quantity: 25, category: "Arte", description: "Tintas guache coloridas" },
  { id: 5, name: "Jogos de Tabuleiro", quantity: 12, category: "Recreação", description: "Jogos educativos diversos" },
  { id: 6, name: "Ferramentas", quantity: 8, category: "Manutenção", description: "Ferramentas básicas de manutenção" },
]

const overdueLends = [
  {
    id: 1,
    item: "Livro: O Pequeno Príncipe",
    borrower: "Maria Silva",
    dueDate: "2024-01-15",
    daysOverdue: 5,
    description: "Empréstimo para leitura em casa",
    authorizedBy: "Prof. João",
    deliveredBy: "Ana",
  },
  {
    id: 2,
    item: "Jogo de Xadrez",
    borrower: "João Santos",
    dueDate: "2024-01-10",
    daysOverdue: 10,
    description: "Para prática de xadrez",
    authorizedBy: "Prof. Maria",
    deliveredBy: "Carlos",
  },
  {
    id: 3,
    item: "Calculadora Científica",
    borrower: "Ana Costa",
    dueDate: "2024-01-12",
    daysOverdue: 8,
    description: "Para aulas de matemática",
    authorizedBy: "Prof. Pedro",
    deliveredBy: "Sofia",
  },
]

const initialLends = [
  {
    id: 1,
    item: "Livro: Dom Casmurro",
    borrower: "Pedro Lima",
    dueDate: "2024-02-01",
    category: "Livros",
    description: "Empréstimo para projeto escolar",
    authorizedBy: "Prof. Ana",
    deliveredBy: "Maria",
  },
  {
    id: 2,
    item: "Bola de Basquete",
    borrower: "Carla Mendes",
    dueDate: "2024-01-30",
    category: "Esporte",
    description: "Para treino da equipe",
    authorizedBy: "Prof. Carlos",
    deliveredBy: "João",
  },
  {
    id: 3,
    item: "Kit de Pintura",
    borrower: "Lucas Oliveira",
    dueDate: "2024-02-05",
    category: "Arte",
    description: "Para aula de artes",
    authorizedBy: "Prof. Sofia",
    deliveredBy: "Ana",
  },
  {
    id: 4,
    item: "Jogo Monopoly",
    borrower: "Sofia Rodrigues",
    dueDate: "2024-01-28",
    category: "Jogos",
    description: "Para atividade recreativa",
    authorizedBy: "Prof. Pedro",
    deliveredBy: "Carlos",
  },
]

const categories = [
  { name: "Todos", icon: BookOpen, color: "bg-gray-500" },
  { name: "Livros", icon: BookOpen, color: "bg-[#88957d]" },
  { name: "Jogos", icon: Gamepad2, color: "bg-[#d09c91]" },
  { name: "Ferramentas", icon: Wrench, color: "bg-[#7f6e62]" },
  { name: "Arte", icon: Palette, color: "bg-[#d9b396]" },
]

const materialCategories = ["Todos", "Escolar", "Arte", "Esporte", "Educação", "Recreação", "Manutenção"]

export default function MaterialsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState("Todos")
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false)
  const [isAddLendOpen, setIsAddLendOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null)
  const [selectedLend, setSelectedLend] = useState<any>(null)
  const [isEditingLend, setIsEditingLend] = useState(false)
  const [materials, setMaterials] = useState(initialMaterials)
  const [lends, setLends] = useState(initialLends)
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)
  const [showLendsCategoryFilter, setShowLendsCategoryFilter] = useState(false)
  const [editingQuantity, setEditingQuantity] = useState<number | null>(null)
  const { showSuccess, showError } = useNotification()
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

  const filteredMaterials = materials.filter(
    (material) =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedMaterialCategory === "Todos" || material.category === selectedMaterialCategory),
  )

  const filteredLends = lends.filter(
    (lend) =>
      lend.item.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "Todos" || lend.category === selectedCategory),
  )

  const handleAddMaterial = (formData: FormData) => {
    const newMaterial = {
      id: materials.length + 1,
      name: formData.get("item-name") as string,
      quantity: Number.parseInt(formData.get("quantity") as string),
      category: formData.get("category") as string,
      description: formData.get("description") as string,
    }
    setMaterials([...materials, newMaterial])
    showSuccess("Material cadastrado com sucesso!")
    setIsAddMaterialOpen(false)
  }

  const handleAddLend = (formData: FormData) => {
    const newLend = {
      id: lends.length + 1,
      item: formData.get("item-select") as string,
      borrower: formData.get("borrower") as string,
      dueDate: formData.get("delivery-date") as string,
      category: "Geral",
      description: formData.get("description") as string,
      authorizedBy: formData.get("authorized-by") as string,
      deliveredBy: formData.get("delivered-by") as string,
    }
    setLends([...lends, newLend])
    showSuccess("Empréstimo cadastrado com sucesso!")
    setIsAddLendOpen(false)
  }

  const handleStockAdjustment = (materialId: number, action: "add" | "remove") => {
    const material = materials.find((m) => m.id === materialId)
    if (!material) return

    setMaterials(
      materials.map((m) =>
        m.id === materialId ? { ...m, quantity: action === "add" ? m.quantity + 1 : Math.max(0, m.quantity - 1) } : m,
      ),
    )
    showSuccess(`Estoque de ${material.name} atualizado!`)
  }

  const handleQuantityEdit = (materialId: number, newQuantity: string) => {
    const quantity = Number.parseInt(newQuantity) || 0
    const material = materials.find((m) => m.id === materialId)
    if (!material) return

    setMaterials(materials.map((m) => (m.id === materialId ? { ...m, quantity: Math.max(0, quantity) } : m)))
    setEditingQuantity(null)
    showSuccess(`Quantidade de ${material.name} atualizada para ${quantity}!`)
  }

  const handleEditLend = (formData: FormData) => {
    if (!selectedLend) return

    const updatedLend = {
      ...selectedLend,
      borrower: formData.get("edit-borrower") as string,
      dueDate: formData.get("edit-due-date") as string,
      description: formData.get("edit-description") as string,
      authorizedBy: formData.get("edit-authorized-by") as string,
      deliveredBy: formData.get("edit-delivered-by") as string,
    }

    setLends(lends.map((lend) => (lend.id === selectedLend.id ? updatedLend : lend)))
    showSuccess("Empréstimo atualizado com sucesso!")
    setIsEditingLend(false)
    setSelectedLend(null)
  }

  const handleReturnLend = (lendId: number) => {
    setConfirmDialog({
      open: true,
      title: "Confirmar Devolução",
      description: "Deseja marcar este empréstimo como devolvido?",
      onConfirm: () => {
        setLends(lends.filter((l) => l.id !== lendId))
        showSuccess("Empréstimo marcado como devolvido!")
        setSelectedLend(null)
        setConfirmDialog({ ...confirmDialog, open: false })
      },
    })
  }

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

          {/* Materials Tab */}
          <TabsContent value="materials" className="space-y-8">
            {/* Shortage Carousel */}
            <div>
              <h2 className="text-2xl font-bold text-[#7f6e62] text-center mb-6">Materiais que estão em falta</h2>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {shortageItems.map((item) => (
                  <Card key={item.id} className="min-w-[280px] bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <Badge variant="destructive">Falta</Badge>
                      </div>
                      <h3 className="font-semibold text-[#7f6e62] mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Atual: {item.quantity} | Necessário: {item.needed}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Categoria: {item.category}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar materiais..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    {selectedMaterialCategory}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  {showCategoryFilter && (
                    <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-10 min-w-[150px]">
                      {materialCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedMaterialCategory(category)
                            setShowCategoryFilter(false)
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                            selectedMaterialCategory === category ? "bg-[#88957d] text-white" : ""
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Dialog open={isAddMaterialOpen} onOpenChange={setIsAddMaterialOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#88957d] hover:bg-[#7f6e62]">
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Material
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Material</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      handleAddMaterial(formData)
                    }}
                  >
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="item-name">Item</Label>
                        <Input name="item-name" placeholder="Nome do material" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantidade</Label>
                        <Input name="quantity" type="number" placeholder="Quantidade inicial" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea name="description" placeholder="Descrição do material" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select name="category" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Escolar">Escolar</SelectItem>
                            <SelectItem value="Arte">Arte</SelectItem>
                            <SelectItem value="Esporte">Esporte</SelectItem>
                            <SelectItem value="Educação">Educação</SelectItem>
                            <SelectItem value="Recreação">Recreação</SelectItem>
                            <SelectItem value="Manutenção">Manutenção</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddMaterialOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-[#88957d] hover:bg-[#7f6e62]">
                        Cadastrar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Materials Grid */}
            <div>
              <h3 className="text-xl font-semibold text-[#7f6e62] mb-4">Materiais Gerais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMaterials.map((material) => (
                  <Card
                    key={material.id}
                    className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedMaterial(material)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#7f6e62]">{material.name}</h4>
                        <Badge variant="secondary">{material.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Quantidade: {material.quantity}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStockAdjustment(material.id, "remove")
                          }}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        {editingQuantity === material.id ? (
                          <Input
                            type="number"
                            defaultValue={material.quantity}
                            className="w-16 h-8 text-center text-sm"
                            autoFocus
                            onBlur={(e) => handleQuantityEdit(material.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleQuantityEdit(material.id, e.currentTarget.value)
                              }
                              if (e.key === "Escape") {
                                setEditingQuantity(null)
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span
                            className="px-3 py-1 bg-gray-100 rounded text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingQuantity(material.id)
                            }}
                          >
                            {material.quantity}
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStockAdjustment(material.id, "add")
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Lends Tab */}
          <TabsContent value="lends" className="space-y-8">
            {/* Overdue Carousel */}
            <div>
              <h2 className="text-2xl font-bold text-[#7f6e62] text-center mb-6">
                Empréstimos que passaram da data de devolução
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {overdueLends.map((lend) => (
                  <Card key={lend.id} className="min-w-[300px] bg-orange-50 border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        <Badge variant="destructive">{lend.daysOverdue} dias atrasado</Badge>
                      </div>
                      <h3 className="font-semibold text-[#7f6e62] mb-1">{lend.item}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                        <User className="w-4 h-4" />
                        {lend.borrower}
                      </div>
                      <p className="text-xs text-gray-500">Vencimento: {lend.dueDate}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar empréstimos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setShowLendsCategoryFilter(!showLendsCategoryFilter)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    {selectedCategory}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  {showLendsCategoryFilter && (
                    <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-10 min-w-[150px]">
                      {categories.map((category) => (
                        <button
                          key={category.name}
                          onClick={() => {
                            setSelectedCategory(category.name)
                            setShowLendsCategoryFilter(false)
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 ${
                            selectedCategory === category.name ? "bg-[#d09c91] text-white" : ""
                          }`}
                        >
                          <category.icon className="w-4 h-4" />
                          {category.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Dialog open={isAddLendOpen} onOpenChange={setIsAddLendOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#d09c91] hover:bg-[#7f6e62]">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Empréstimo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Empréstimo</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      handleAddLend(formData)
                    }}
                  >
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="item-select">Nome do Item</Label>
                        <Select name="item-select" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um item" />
                          </SelectTrigger>
                          <SelectContent>
                            {materials.map((material) => (
                              <SelectItem key={material.id} value={material.name}>
                                {material.name} (Disponível: {material.quantity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lend-quantity">Quantidade Emprestada</Label>
                        <Input name="lend-quantity" type="number" placeholder="Quantidade" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="borrower">Solicitante</Label>
                        <Input name="borrower" placeholder="Nome de quem pegou o item" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="delivery-date">Data da Entrega</Label>
                        <Input name="delivery-date" type="date" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea name="description" placeholder="Descrição do empréstimo" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="authorized-by">Autorizado por</Label>
                        <Input name="authorized-by" placeholder="Nome do responsável" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="delivered-by">Entregue por</Label>
                        <Input name="delivered-by" placeholder="Nome de quem entregou" required />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddLendOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-[#d09c91] hover:bg-[#7f6e62]">
                        Cadastrar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#7f6e62] mb-4">Empréstimos Gerais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLends.map((lend) => (
                  <Card
                    key={lend.id}
                    className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedLend(lend)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#7f6e62] text-sm">{lend.item}</h4>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {lend.category}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedLend(lend)
                              setIsEditingLend(true)
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <User className="w-3 h-3" />
                          {lend.borrower}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {lend.dueDate}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedMaterial} onOpenChange={() => setSelectedMaterial(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Material</DialogTitle>
          </DialogHeader>
          {selectedMaterial && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="font-semibold">Nome</Label>
                <p className="text-sm text-gray-700">{selectedMaterial.name}</p>
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Quantidade</Label>
                <p className="text-sm text-gray-700">{selectedMaterial.quantity}</p>
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Categoria</Label>
                <p className="text-sm text-gray-700">{selectedMaterial.category}</p>
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Descrição</Label>
                <p className="text-sm text-gray-700">{selectedMaterial.description}</p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    handleStockAdjustment(selectedMaterial.id, "remove")
                    setSelectedMaterial(null)
                  }}
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Remover
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    handleStockAdjustment(selectedMaterial.id, "add")
                    setSelectedMaterial(null)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedLend}
        onOpenChange={() => {
          setSelectedLend(null)
          setIsEditingLend(false)
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditingLend ? "Editar Empréstimo" : "Detalhes do Empréstimo"}</DialogTitle>
          </DialogHeader>
          {selectedLend && (
            <div className="grid gap-4 py-4">
              {!isEditingLend ? (
                <>
                  <div className="grid gap-2">
                    <Label className="font-semibold">Item</Label>
                    <p className="text-sm text-gray-700">{selectedLend.item}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-semibold">Solicitante</Label>
                    <p className="text-sm text-gray-700">{selectedLend.borrower}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-semibold">Data de Entrega</Label>
                    <p className="text-sm text-gray-700">{selectedLend.dueDate}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-semibold">Descrição</Label>
                    <p className="text-sm text-gray-700">{selectedLend.description}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-semibold">Autorizado por</Label>
                    <p className="text-sm text-gray-700">{selectedLend.authorizedBy}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-semibold">Entregue por</Label>
                    <p className="text-sm text-gray-700">{selectedLend.deliveredBy}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsEditingLend(true)}>
                      Editar
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleReturnLend(selectedLend.id)}
                    >
                      Entregue
                    </Button>
                  </div>
                </>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleEditLend(formData)
                  }}
                >
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-borrower">Solicitante</Label>
                      <Input name="edit-borrower" defaultValue={selectedLend.borrower} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-due-date">Data de Entrega</Label>
                      <Input name="edit-due-date" type="date" defaultValue={selectedLend.dueDate} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-description">Descrição</Label>
                      <Textarea name="edit-description" defaultValue={selectedLend.description} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-authorized-by">Autorizado por</Label>
                      <Input name="edit-authorized-by" defaultValue={selectedLend.authorizedBy} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-delivered-by">Entregue por</Label>
                      <Input name="edit-delivered-by" defaultValue={selectedLend.deliveredBy} required />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => setIsEditingLend(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="flex-1 bg-[#d09c91] hover:bg-[#7f6e62]">
                        Salvar
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
      />
    </PageContainer>
  )
}
