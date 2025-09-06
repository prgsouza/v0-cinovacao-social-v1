"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Plus,
  Minus,
  AlertTriangle,
  ChevronDown,
  Trash,
} from "lucide-react";
import { useNotification } from "@/hooks/use-notification";
import { Material } from "@/lib/material/material.dto";
import {
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "@/lib/material/material.service";

const materialCategories = [
  "Todos",
  "Escolar",
  "Arte",
  "Esporte",
  "Educação",
  "Recreação",
  "Manutenção",
];

interface MaterialsTabProps {
  materials: Material[];
  setMaterials: (materials: Material[]) => void;
  confirmDialog: any;
  setConfirmDialog: (dialog: any) => void;
}

export default function MaterialsTab({
  materials,
  setMaterials,
}: MaterialsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterialCategory, setSelectedMaterialCategory] =
    useState("Todos");
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);

  const { showSuccess, showError } = useNotification();

  const filteredMaterials = materials.filter(
    (material) =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedMaterialCategory === "Todos" ||
        material.category === selectedMaterialCategory)
  );

  const handleAddMaterial = async (formData: FormData) => {
    try {
      const newMaterial = {
        name: formData.get("item-name") as string,
        quantity: Number.parseInt(formData.get("quantity") as string),
        category: formData.get("category") as string,
        description: formData.get("description") as string,
      };
      const created = await createMaterial(newMaterial);
      setMaterials([...materials, created]);
      showSuccess("Material cadastrado com sucesso!");
      setIsAddMaterialOpen(false);
    } catch (error) {
      console.error(error);
      showError("Erro ao cadastrar material");
    }
  };

  const handleStockAdjustment = async (
    materialId: string,
    action: "add" | "remove"
  ) => {
    try {
      const material = materials.find((m) => m.id === materialId);
      if (!material) return;
      const newQuantity =
        action === "add"
          ? material.quantity + 1
          : Math.max(0, material.quantity - 1);
      const updated = await updateMaterial(materialId, {
        quantity: newQuantity,
      });
      setMaterials(materials.map((m) => (m.id === materialId ? updated : m)));
      showSuccess(`Estoque de ${material.name} atualizado!`);
    } catch (error) {
      console.error(error);
      showError("Erro ao atualizar estoque");
    }
  };

  const handleQuantityEdit = async (
    materialId: string,
    newQuantity: string
  ) => {
    try {
      const quantity = Number.parseInt(newQuantity) || 0;
      const material = materials.find((m) => m.id === materialId);
      if (!material) return;
      const updated = await updateMaterial(materialId, {
        quantity: Math.max(0, quantity),
      });
      setMaterials(materials.map((m) => (m.id === materialId ? updated : m)));
      setEditingQuantity(null);
      showSuccess(
        `Quantidade de ${material.name} atualizada para ${quantity}!`
      );
    } catch (error) {
      console.error(error);
      showError("Erro ao editar quantidade");
    }
  };

  // Função para excluir material
  const handleDeleteMaterial = async (materialId: string) => {
    try {
      await deleteMaterial(materialId);
      setMaterials(materials.filter((m) => m.id !== materialId));
      showSuccess("Material excluído com sucesso!");
    } catch (error) {
      console.error(error);
      showError("Erro ao excluir material");
    }
  };

  return (
    <div className="space-y-8">
      {/* Shortage Carousel */}
      <div>
        <h2 className="text-2xl font-bold text-[#7f6e62] text-center mb-6">
          Materiais que estão em falta
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {materials
            .filter((material) => material.quantity < 10)
            .map((item) => (
              <Card
                key={item.id}
                className="min-w-[280px] bg-red-50 border-red-200"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <Badge variant="destructive">Falta</Badge>
                  </div>
                  <h3 className="font-semibold text-[#7f6e62] mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Atual: {item.quantity} | Necessário: 10
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Categoria: {item.category}
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Search & Add Material */}
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
                      setSelectedMaterialCategory(category);
                      setShowCategoryFilter(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                      selectedMaterialCategory === category
                        ? "bg-[#88957d] text-white"
                        : ""
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
            <Button className="bg-[#124F32] hover:bg-[#7f6e62]">
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
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleAddMaterial(formData);
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="item-name">Item</Label>
                  <Input
                    name="item-name"
                    placeholder="Nome do material"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    name="quantity"
                    type="number"
                    placeholder="Quantidade inicial"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    name="description"
                    placeholder="Descrição do material"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialCategories
                        .filter((c) => c !== "Todos")
                        .map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddMaterialOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#124F32] hover:bg-[#7f6e62]"
                >
                  Cadastrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Materials Grid */}
      <div>
        <h3 className="text-xl font-semibold text-[#7f6e62] mb-4">
          Materiais Gerais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {filteredMaterials.map((material) => (
            <Card
              key={material.id}
              className="group relative bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer w-full max-w-sm h-full mx-auto"
              onClick={() => setSelectedMaterial(material)}
            >
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[#7f6e62]">
                      {material.name}
                    </h4>
                    <span className="relative inline-block w-20 h-8 align-middle">
                      {/* Categoria visível normalmente */}
                      <Badge
                        variant="secondary"
                        className="transition-opacity duration-200 group-hover:opacity-0 w-20 h-8 flex items-center justify-center absolute inset-0"
                      >
                        {material.category}
                      </Badge>
                      {/* Lixeira minimalista aparece só no hover */}
                      <span
                        className="absolute inset-0 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                        style={{ left: "50%", transform: "translateX(-50%)" }}
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteMaterial(material.id);
                        }}
                        title="Excluir material"
                      >
                        <Trash className="w-6 h-6 text-red-500 drop-shadow" />
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Quantidade: {material.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStockAdjustment(material.id, "remove");
                    }}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStockAdjustment(material.id, "add");
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
    </div>
  );
}
