"use client";

import { SetStateAction, use, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Material } from "@/lib/material/material.dto";
import { Lend } from "@/lib/lend/lend.dto";
import { createLend, updateLend } from "@/lib/lend/lend.service";
import { useNotification } from "@/hooks/use-notification";
import { Plus } from "lucide-react";

interface LendsTabProps {
  materials: Material[];
  lends: Lend[];
  setLends: (lends: Lend[]) => void;
  confirmDialog: any;
  setConfirmDialog: (dialog: any) => void;
}

export default function LendsTab({
  materials,
  lends,
  setLends,
}: LendsTabProps) {
  const { showSuccess, showError } = useNotification();
  const [isAddLendOpen, setIsAddLendOpen] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);

  const selectedMaterial = useMemo(() => {
    return materials.find((m) => m.id === selectedMaterialId) || null;
  }, [selectedMaterialId, materials]);

  const handleMaterialChange = (e: {
    target: { value: SetStateAction<string | null> };
  }) => {
    setSelectedMaterialId(e.target.value);
    setQuantity(1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(Number(e.target.value));
  };

  const handleDeliveryDateChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setDeliveryDate(e.target.value);
  };

  const handleAddLend = async (formData: FormData) => {
    try {
      const materialId = formData.get("material-id") as string;
      const material = materials.find((m) => m.id === materialId);
      const newLend = {
        material_id: materialId,
        item_name: material?.name ?? "",
        borrower: formData.get("borrower") as string,
        quantity: Number(formData.get("quantity") as string),
        due_date: new Date(formData.get("return-date") as string).toISOString(),
        category: material?.category ?? "",
        description: formData.get("description") as string,
        authorized_by: formData.get("authorized-by") as string,
        delivered_by: formData.get("delivered-by") as string,
        delivery_date: new Date(
          formData.get("delivery-date") as string
        ).toISOString(),
      };
      const created = await createLend(newLend);
      console.log(created);
      setLends([...lends, created]);
      showSuccess("Empréstimo registrado!");
      setIsAddLendOpen(false);
    } catch (error) {
      console.error(error);
      showError("Erro ao registrar empréstimo");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Dialog open={isAddLendOpen} onOpenChange={setIsAddLendOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#237C52] hover:bg-[#237C52] flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Registrar Empréstimo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Registrar Empréstimo</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleAddLend(formData);
              }}
              className="grid gap-6 py-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Material
                  </label>
                  <select
                    name="material-id"
                    required
                    className="input border rounded p-2"
                    value={selectedMaterialId ?? ""}
                    onChange={handleMaterialChange}
                  >
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (Qtd: {m.quantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Quantidade
                  </label>
                  <input
                    name="quantity"
                    type="number"
                    min={1}
                    max={selectedMaterial?.quantity || 1}
                    placeholder="Quantidade"
                    value={quantity}
                    onChange={handleQuantityChange}
                    required
                    className="input p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Solicitante
                  </label>
                  <input
                    name="borrower"
                    placeholder="Digite o nome do solicitante"
                    required
                    className="input border rounded p-2"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Data da Entrega
                  </label>
                  <input
                    type="date"
                    id="delivery-date"
                    name="delivery-date"
                    required
                    onChange={handleDeliveryDateChange}
                    className="input border rounded p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Data de Devolução
                  </label>
                  <input
                    type="date"
                    id="return-date"
                    name="return-date"
                    required
                    min={deliveryDate}
                    disabled={!deliveryDate}
                    className="input border rounded p-2"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Autorizado por
                  </label>
                  <input
                    name="authorized-by"
                    placeholder="Digite o nome de quem autorizou"
                    required
                    className="input border rounded p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Entregue por
                  </label>
                  <input
                    name="delivered-by"
                    placeholder="Digite o nome de quem entregou"
                    required
                    className="input border rounded p-2"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-1">
                  <label className="text-sm font-medium text-gray-700">
                    Descrição
                  </label>
                  <textarea
                    rows={3}
                    name="description"
                    placeholder="Digite a descrição"
                    required
                    className="input border rounded p-2 h-[100px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddLendOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#237C52] hover:bg-[#237C52]"
                >
                  Registrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-[#ffffff] mb-4">
          Empréstimos Registrados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lends.map((lend) => {
            const material = materials.find((m) => m.id === lend.material_id);
            return (
              <Card key={lend.id} className="bg-white/90 backdrop-blur-sm">
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[#7f6e62]">
                      {lend.item_name}
                    </h4>
                    {material && (
                      <Badge variant="secondary">{material.category}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Material: {material?.name ?? "Desconhecido"}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Quantidade: {lend.quantity}
                  </p>
                  <p className="text-xs text-gray-500">
                    Emprestado para: {lend.borrower}
                  </p>
                  <p className="text-xs text-gray-500">
                    Entregue por: {lend.delivered_by}
                  </p>
                  <p className="text-xs text-gray-500">
                    Autorizado por: {lend.authorized_by}
                  </p>
                  <p className="text-xs text-gray-500">
                    Data de Entrega:{" "}
                    {new Date(lend.delivery_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Data de Devolução:{" "}
                    {new Date(lend.due_date).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
