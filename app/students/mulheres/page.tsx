// app/students/mulheres/page.tsx

"use client";

import { useState, useEffect } from "react";

// --- ALTERAÇÃO: Importando a função 'deleteWoman' e 'uploadWomanPhoto' ---
import { Woman } from "@/lib/woman/woman.dto";
import {
  getWomen,
  createWoman,
  updateWoman,
  updateAttendances,
  resetAllRankings,
  deleteWoman,
  uploadWomanPhoto,
} from "@/lib/woman/woman.service";

// Componentes da UI e Hooks
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// --- ALTERAÇÃO: Importando o ícone de lixeira ---
import {
  Plus,
  Camera,
  Edit,
  Search,
  CheckCircle,
  X,
  Trash2,
} from "lucide-react";
import { useNotification } from "@/hooks/use-notification";

export default function MulheresPage() {
  const { showSuccess, showError } = useNotification();

  const [women, setWomen] = useState<Woman[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddWomanOpen, setIsAddWomanOpen] = useState(false);
  const [selectedWoman, setSelectedWoman] = useState<Woman | null>(null);
  const [isEditingWoman, setIsEditingWoman] = useState(false);
  const [isResetRankingModalOpen, setIsResetRankingModalOpen] = useState(false);
  // --- NOVO: Estado para o modal de confirmação de exclusão ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // --- NOVO: Estado para upload de foto ---
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceData, setAttendanceData] = useState<
    Record<string, "present" | "absent">
  >({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const fetchWomenData = async () => {
    try {
      const dataFromDb = await getWomen();
      setWomen(dataFromDb);
    } catch (error) {
      console.error("Erro ao buscar dados do banco:", error);
      showError("Não foi possível carregar os dados das mulheres.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWomenData();
  }, []);

  const filteredWomen = women.filter((woman) =>
    woman.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddWoman = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const photoFile = formData.get("woman-photo") as File;

    const newWomanData = {
      name: formData.get("woman-name") as string,
      age: Number(formData.get("age")),
      community: formData.get("community") as string,
      phone: formData.get("phone") as string,
      observations: formData.get("observations") as string,
      presences: 0,
      absences: 0,
      total_sessions: 0,
    };

    try {
      // First, create the woman
      const createdWoman = await createWoman(newWomanData);

      // If there's a photo, upload it
      if (photoFile && photoFile.size > 0) {
        setUploadingPhoto(true);
        try {
          await uploadWomanPhoto(createdWoman.id, photoFile);
          showSuccess("Mulher cadastrada com foto!");
        } catch (photoError) {
          console.error("Erro no upload da foto:", photoError);
          showSuccess("Mulher cadastrada, mas houve erro no upload da foto.");
        } finally {
          setUploadingPhoto(false);
        }
      } else {
        showSuccess("Mulher cadastrada com sucesso!");
      }

      setIsAddWomanOpen(false);
      await fetchWomenData();
    } catch (error) {
      showError("Erro ao cadastrar mulher.");
      console.error(error);
    }
  };

  const handleEditWoman = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedWoman) return;

    const formData = new FormData(event.currentTarget);
    const photoFile = formData.get("woman-photo") as File;

    const updatedData = {
      name: formData.get("woman-name") as string,
      age: Number(formData.get("age")),
      community: formData.get("community") as string,
      phone: formData.get("phone") as string,
      observations: formData.get("observations") as string,
    };

    try {
      // Update woman data
      await updateWoman(selectedWoman.id, updatedData);

      // If there's a new photo, upload it
      if (photoFile && photoFile.size > 0) {
        setUploadingPhoto(true);
        try {
          await uploadWomanPhoto(selectedWoman.id, photoFile);
          showSuccess("Dados e foto atualizados com sucesso!");
        } catch (photoError) {
          console.error("Erro no upload da foto:", photoError);
          showSuccess("Dados atualizados, mas houve erro no upload da foto.");
        } finally {
          setUploadingPhoto(false);
        }
      } else {
        showSuccess("Dados atualizados com sucesso!");
      }

      setIsEditingWoman(false);
      setSelectedWoman(null);
      await fetchWomenData();
    } catch (error) {
      showError("Erro ao atualizar os dados.");
      console.error(error);
    }
  };

  // --- NOVA FUNÇÃO: Lógica para deletar uma mulher ---
  const handleDeleteWoman = async () => {
    if (!selectedWoman) return;

    try {
      await deleteWoman(selectedWoman.id);
      showSuccess(`${selectedWoman.name} foi excluída com sucesso.`);
      setIsDeleteModalOpen(false); // Fecha o modal de confirmação
      setSelectedWoman(null); // Fecha o modal de perfil
      await fetchWomenData(); // Atualiza a lista
    } catch (error) {
      showError(
        "Erro ao excluir. Verifique as políticas de DELETE no Supabase."
      );
      console.error(error);
    }
  };

  const handleAttendanceChange = (
    womanId: string,
    status: "present" | "absent"
  ) => {
    setAttendanceData((prev) => ({ ...prev, [womanId]: status }));
  };

  const handleSaveAttendance = async () => {
    setIsSavingAttendance(true);
    try {
      await updateAttendances(attendanceData);
      showSuccess("Chamada salva com sucesso!");
      setAttendanceData({});
      await fetchWomenData();
    } catch (error) {
      showError("Erro ao salvar a chamada. Tente novamente.");
      console.error(error);
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const handleResetRanking = async () => {
    try {
      await resetAllRankings();
      showSuccess("Ranking zerado com sucesso!");
      setIsResetRankingModalOpen(false);
      await fetchWomenData();
    } catch (error) {
      showError("Não foi possível zerar o ranking.");
      console.error(error);
    }
  };

  const canSaveAttendance = () => {
    return (
      Object.keys(attendanceData).length === women.length && women.length > 0
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 bg-[#EAE8E8] p-4 rounded-xl">
        <h1 className="text-3xl font-bold text-[#7f6e62]">Mulheres</h1>
        <div className="text-center py-8">
          <p className="text-gray-600">Carregando dados do banco...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#EAE8E8] p-4 rounded-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#7f6e62]">Mulheres</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de Chamada */}
        <Card className="lg:col-span-2 bg-[#F4A460] backdrop-blur-sm relative">
          <CardHeader className="pb-3">
            <CardTitle className="text-white font-bold">Chamada</CardTitle>
            {!canSaveAttendance() && (
              <div className="text-center pt-2">
                <p className="text-white/70 text-sm">
                  Marque a presença de todas as mulheres para confirmar a
                  chamada
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="overflow-y-auto max-h-[280px] space-y-2 pr-2">
              {women.map((woman) => (
                <div
                  key={woman.id}
                  className={`rounded-lg p-3 flex items-center justify-between min-h-[60px] transition-all ${
                    attendanceData[woman.id]
                      ? "bg-[#FF6B35]"
                      : "bg-[#217E53] border-2 border-dashed border-[#FFFF]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={woman.photo_url || ""} />
                      <AvatarFallback>
                        {woman.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-white">{woman.name}</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      className={`text-xs px-2 py-1 ${
                        attendanceData[woman.id] === "present"
                          ? "bg-white text-green-600 hover:bg-gray-100"
                          : "bg-white/80 text-black hover:bg-white"
                      }`}
                      onClick={() =>
                        handleAttendanceChange(woman.id, "present")
                      }
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Presente
                    </Button>
                    <Button
                      size="sm"
                      className={`text-xs px-2 py-1 ${
                        attendanceData[woman.id] === "absent"
                          ? "bg-white text-red-600 hover:bg-gray-100"
                          : "bg-white/80 text-black hover:bg-white"
                      }`}
                      onClick={() => handleAttendanceChange(woman.id, "absent")}
                    >
                      <X className="w-3 h-3 mr-1" /> Faltou
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-2 pt-3 border-t border-black/20">
            <Input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="bg-white/90 text-black border-none text-sm w-auto"
            />
            <Button
              onClick={handleSaveAttendance}
              disabled={!canSaveAttendance() || isSavingAttendance}
              className={`text-xs px-3 py-1 ${
                canSaveAttendance()
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
              }`}
            >
              {isSavingAttendance ? "Salvando..." : "Confirmar Chamada"}
            </Button>
          </CardFooter>
        </Card>

        {/* Card de Ranking */}
        <Card className="bg-[#F4A460] backdrop-blur-sm text-white flex flex-col">
          <CardHeader>
            <CardTitle className="text-white">
              Ranking de Participação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex-grow">
            <div className="overflow-y-auto max-h-[280px] space-y-3 pr-2">
              {[...women]
                .sort((a, b) => b.presences - a.presences)
                .map((woman) => (
                  <div
                    key={woman.id}
                    className="flex items-center justify-between p-3 bg-white/20 rounded-lg min-h-[60px]"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={woman.photo_url || ""} />
                        <AvatarFallback>
                          {woman.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{woman.name}</span>
                    </div>
                    <span className="font-medium text-sm flex-shrink-0">
                      {woman.presences} Presenças
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
          <CardFooter className="pt-4 mt-auto border-t border-white/20">
            <Dialog
              open={isResetRankingModalOpen}
              onOpenChange={setIsResetRankingModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-lx bg-red-600 hover:bg-red-700"
                  onClick={() => setIsResetRankingModalOpen(true)}
                >
                  Zerar Ranking
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Você tem certeza?</DialogTitle>
                  <DialogDescription className="pt-2">
                    Esta ação é irreversível e irá zerar permanentemente todos
                    os dados de presença de todas as participantes. Deseja
                    continuar?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsResetRankingModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleResetRanking}
                  >
                    Confirmar e Zerar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>

      {/* Lista e Cadastro */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Pesquisar mulheres por nome..."
              className="pl-10 bg-white/90 backdrop-blur-sm border-[#d5c4aa]/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isAddWomanOpen} onOpenChange={setIsAddWomanOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#217E53] hover:bg-[#7f6e62] flex-shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Nova Mulher
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastro de Nova Mulher</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddWoman}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="woman-name">Nome Completo</Label>
                    <Input
                      id="woman-name"
                      name="woman-name"
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="community">Qual comunidade pertence?</Label>
                    <Input
                      id="community"
                      name="community"
                      placeholder="Nome da comunidade"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="woman-photo">Foto de Perfil</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="woman-photo"
                        name="woman-photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={uploadingPhoto}
                      />
                      <Camera className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Formatos aceitos: JPEG, PNG, WebP. Tamanho máximo: 5MB
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      placeholder="Idade"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone de Contato</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="observations">Observações</Label>
                    <Textarea
                      id="observations"
                      name="observations"
                      placeholder="Interesses, habilidades especiais, etc."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddWomanOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#88957d] hover:bg-[#7f6e62]"
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? "Enviando foto..." : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="overflow-y-auto max-h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-2">
            {filteredWomen.map((woman) => (
              <Card
                key={woman.id}
                className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedWoman(woman)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage
                        src={woman.photo_url || "/placeholder.svg"}
                        alt={woman.name}
                      />
                      <AvatarFallback>
                        {woman.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#7f6e62]">
                        {woman.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Idade: {woman.age} anos
                      </p>
                      <p className="text-sm text-gray-600">{woman.community}</p>
                      <p className="text-sm text-gray-600">{woman.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes / Edição */}
      <Dialog
        open={!!selectedWoman}
        onOpenChange={() => {
          setSelectedWoman(null);
          setIsEditingWoman(false);
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditingWoman ? "Editar Dados" : "Perfil da Mulher"}
            </DialogTitle>
          </DialogHeader>
          {selectedWoman &&
            (isEditingWoman ? (
              <form onSubmit={handleEditWoman}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-woman-name">Nome Completo</Label>
                    <Input
                      id="edit-woman-name"
                      name="woman-name"
                      defaultValue={selectedWoman.name}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-community">Comunidade</Label>
                    <Input
                      id="edit-community"
                      name="community"
                      defaultValue={selectedWoman.community}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-woman-photo">
                      Nova Foto de Perfil (opcional)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="edit-woman-photo"
                        name="woman-photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={uploadingPhoto}
                      />
                      <Camera className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Deixe em branco para manter a foto atual. Formatos: JPEG,
                      PNG, WebP. Máximo: 5MB
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-age">Idade</Label>
                    <Input
                      id="edit-age"
                      name="age"
                      type="number"
                      defaultValue={selectedWoman.age}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-phone">Telefone</Label>
                    <Input
                      id="edit-phone"
                      name="phone"
                      defaultValue={selectedWoman.phone}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-observations">Observações</Label>
                    <Textarea
                      id="edit-observations"
                      name="observations"
                      defaultValue={selectedWoman.observations || ""}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditingWoman(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#88957d] hover:bg-[#7f6e62]"
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? "Salvando foto..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage
                      src={selectedWoman.photo_url || "/placeholder.svg"}
                      alt={selectedWoman.name}
                    />
                    <AvatarFallback>
                      {selectedWoman.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-[#7f6e62]">
                      {selectedWoman.name}
                    </h3>
                    <p className="text-gray-600">
                      Idade: {selectedWoman.age} anos
                    </p>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div>
                    <Label className="font-medium">Comunidade</Label>
                    <p className="text-sm text-gray-600">
                      {selectedWoman.community}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Telefone</Label>
                    <p className="text-sm text-gray-600">
                      {selectedWoman.phone}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Observações</Label>
                    <p className="text-sm text-gray-600">
                      {selectedWoman.observations || "Nenhuma observação."}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedWoman(null)}
                  >
                    Fechar
                  </Button>
                  <Button
                    className="bg-[#237C52] hover:bg-[#7f6e62]"
                    onClick={() => setIsEditingWoman(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            ))}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription className="pt-2">
              Você tem certeza que deseja excluir permanentemente o registro de{" "}
              <strong>{selectedWoman?.name}</strong>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteWoman}>
              Confirmar Exclusão
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
