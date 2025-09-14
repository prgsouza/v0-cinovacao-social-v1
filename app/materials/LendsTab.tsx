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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Material } from "@/lib/material/material.dto";
import { Lend } from "@/lib/lend/lend.dto";
import { createLend, updateLend, deleteLend } from "@/lib/lend/lend.service";
import { useNotification } from "@/hooks/use-notification";
import { Plus, Trash2, AlertTriangle, Clock, Check } from "lucide-react";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deliverDialogOpen, setDeliverDialogOpen] = useState(false);
  const [lendToDelete, setLendToDelete] = useState<Lend | null>(null);
  const [lendToDeliver, setLendToDeliver] = useState<Lend | null>(null);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const [deliveredBy, setDeliveredBy] = useState("");
  const maxDescriptionLength = 140;

  const selectedMaterial = useMemo(() => {
    return materials.find((m) => m.id === selectedMaterialId) || null;
  }, [selectedMaterialId, materials]);

  // Função para verificar se um empréstimo está em atraso
  const isOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  // Função para calcular dias de atraso
  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Função para calcular quantidade disponível
  const getAvailableQuantity = (materialId: string) => {
    const total = materials.find((m) => m.id === materialId)?.quantity ?? 0;
    const emprestado = lends
      .filter((l) => l.material_id === materialId)
      .reduce((sum, l) => sum + l.quantity, 0);
    return total - emprestado;
  };

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

  const handleDeleteClick = (lend: Lend) => {
    setLendToDelete(lend);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!lendToDelete) return;

    try {
      await deleteLend(lendToDelete.id);
      setLends(lends.filter((l) => l.id !== lendToDelete.id));
      showSuccess("Empréstimo removido com sucesso!");
      setDeleteDialogOpen(false);
      setLendToDelete(null);
    } catch (error) {
      console.error(error);
      showError("Erro ao remover empréstimo");
    }
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
        description, // pega do estado
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

  const handleMarkAsDelivered = async (lend: Lend) => {
    try {
      await deleteLend(lend.id);
      setLends(lends.filter((l) => l.id !== lend.id));
      showSuccess("Empréstimo marcado como entregue!");
    } catch (error) {
      console.error(error);
      showError("Erro ao marcar como entregue");
    }
  };

  const handleDeliverClick = (lend: Lend) => {
    setLendToDeliver(lend);
    setDeliverDialogOpen(true);
  };

  const handleConfirmDeliver = async () => {
    if (!lendToDeliver) return;
    try {
      await deleteLend(lendToDeliver.id);
      setLends(lends.filter((l) => l.id !== lendToDeliver.id));
      showSuccess("Empréstimo marcado como entregue!");
      setDeliverDialogOpen(false);
      setLendToDeliver(null);
    } catch (error) {
      console.error(error);
      showError("Erro ao marcar como entregue");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between bg-[#E6742D] p-4 rounded-lg sm:items-center">
        <h3 className="text-3xl font-semibold text-[#ffffff]">
          Empréstimos Registrados
        </h3>
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
                    max={selectedMaterialId ? getAvailableQuantity(selectedMaterialId) : 1}
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
                    value={deliveredBy}
                    onChange={e => setDeliveredBy(e.target.value)}
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
                    maxLength={maxDescriptionLength}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input border rounded p-2 h-[100px]"
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {description.length}/{maxDescriptionLength}
                  </div>
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

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-black">
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o empréstimo do material{" "}
              <strong>{lendToDelete?.item_name}</strong> para{" "}
              <strong>{lendToDelete?.borrower}</strong>?
              <br />
              <span className="text-sm text-gray-500 mt-2 block">
                Esta ação não pode ser desfeita.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLendToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação de entrega */}
      <AlertDialog open={deliverDialogOpen} onOpenChange={setDeliverDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-black">
              Confirmar Entrega
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja marcar o empréstimo do material{" "}
              <strong>{lendToDeliver?.item_name}</strong> para{" "}
              <strong>{lendToDeliver?.borrower}</strong> como{" "}
              <span className="text-green-700 font-bold">entregue</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLendToDeliver(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeliver}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4" />
              Entregue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {lends.map((lend) => {
            const material = materials.find((m) => m.id === lend.material_id);
            const overdueStatus = isOverdue(lend.due_date);
            const daysOverdue = overdueStatus ? getDaysOverdue(lend.due_date) : 0;

            return (
              <Card
                key={lend.id}
                className="bg-white/90 backdrop-blur-sm relative min-h-[260px] flex flex-col"
              >
                <CardContent className="relative flex flex-col h-full">
                  {/* Linha do título e atraso */}
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-[#7f6e62] text-lg">
                      {lend.item_name}
                    </h4>
                    {overdueStatus && (
                      <Badge className="bg-[#E6742D] text-white rounded-4 px-3 py-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {daysOverdue} dia{daysOverdue !== 1 ? 's' : ''} de atraso
                      </Badge>
                    )}
                  </div>
                  {/* Categoria */}
                  {material && (
                    <div className="mb-1">
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        {material.category}
                      </Badge>
                    </div>
                  )}

                  {/* Demais informações */}
                  <div className="flex flex-col gap-1 text-xs text-gray-700 mb-2">
                    <span>
                      <span className="font-semibold text-[#7f6e62]">Quantidade:</span> {lend.quantity}
                    </span>
                    <span>
                      <span className="font-semibold text-[#7f6e62]">Solicitante:</span> {lend.borrower}
                    </span>
                    <span>
                      <span className="font-semibold text-[#7f6e62]">Entregue por:</span> {lend.delivered_by}
                    </span>
                    <span>
                      <span className="font-semibold text-[#7f6e62]">Autorizado por:</span> {lend.authorized_by}
                    </span>
                    <span>
                      <span className="font-semibold text-[#7f6e62]">Data de Entrega:</span> {new Date(lend.delivery_date).toLocaleDateString()}
                    </span>
                    <span>
                      <span className="font-semibold text-[#7f6e62]">Data de Devolução:</span>{" "}
                      <span className={overdueStatus ? "text-[#E6742D] font-semibold" : ""}>
                        {new Date(lend.due_date).toLocaleDateString()}
                      </span>
                    </span>
                  </div>

                  {/* Descrição no final, com limite e quebra de linha */}
                  {lend.description && (
                    <div className="mb-2 max-h-16 overflow-y-auto break-words text-xs italic text-gray-500 border-t pt-2">
                      {lend.description}
                    </div>
                  )}

                  {/* Rodapé com botões em extremos, mais afastados */}
                  <div className="mt-auto flex justify-between items-center pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(lend)}
                      className="text-white hover:text-white bg-red-600 hover:bg-red-500 flex items-center gap-1 border-red-600 hover:border-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeliverClick(lend)}
                      className="text-white hover:text-white bg-green-600 hover:bg-green-500 flex items-center gap-1 border-green-600 hover:border-green-500"
                    >
                      <Check className="w-4 h-4" />
                      Entregue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}