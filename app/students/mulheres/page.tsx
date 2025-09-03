// app/students/mulheres/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  Camera, 
  Edit, 
  Search, 
  CheckCircle, 
  X
} from "lucide-react";
import { useNotification } from "@/hooks/use-notification";

// Interfaces
interface Woman {
  id: string;
  name: string;
  age: number;
  community: string;
  phone: string;
  observations?: string;
  photo_url?: string;
  created_at: string;
}

interface AttendanceCount {
  woman_id: string;
  woman_name: string;
  presences: number;
  absences: number;
  justified: number;
  total_sessions: number;
  attendance_rate: number;
}

export default function MulheresPage() {
  const { showSuccess, showError } = useNotification();
  
  // Estados principais
  const [women, setWomen] = useState<Woman[]>([]);
  const [attendanceCounts, setAttendanceCounts] = useState<AttendanceCount[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados dos modais
  const [isAddWomanOpen, setIsAddWomanOpen] = useState(false);
  const [selectedWoman, setSelectedWoman] = useState<Woman | null>(null);
  const [isEditingWoman, setIsEditingWoman] = useState(false);
  
  // Estados de filtro e chamada
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredWomen = women.filter((woman) =>
    woman.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Simulação de dados
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Simulando dados de mulheres (adicionando mais para testar overflow)
        const mockWomen: Woman[] = [
          {
            id: "1",
            name: "Maria Silva",
            age: 35,
            community: "Vila Esperança",
            phone: "(81) 99999-1111",
            observations: "Interessada em cursos de artesanato",
            photo_url: undefined,
            created_at: "2024-01-15"
          },
          {
            id: "2", 
            name: "Ana Santos",
            age: 28,
            community: "Jardim das Flores",
            phone: "(81) 99999-2222",
            observations: "",
            photo_url: undefined,
            created_at: "2024-02-10"
          },
          {
            id: "3",
            name: "Rosa Lima",
            age: 42,
            community: "Novo Horizonte",
            phone: "(81) 99999-3333",
            observations: "Tem experiência em costura",
            photo_url: undefined,
            created_at: "2024-01-20"
          },
          {
            id: "4",
            name: "Claudia Oliveira",
            age: 31,
            community: "Centro",
            phone: "(81) 99999-4444",
            observations: "Líder comunitária",
            photo_url: undefined,
            created_at: "2024-02-15"
          },
          {
            id: "5",
            name: "Fernanda Costa",
            age: 29,
            community: "Boa Vista",
            phone: "(81) 99999-5555",
            observations: "Professora voluntária",
            photo_url: undefined,
            created_at: "2024-03-01"
          },
          {
            id: "6",
            name: "Joana Pereira",
            age: 38,
            community: "São José",
            phone: "(81) 99999-6666",
            observations: "Artesã experiente",
            photo_url: undefined,
            created_at: "2024-03-10"
          }
        ];

        // Simulando dados de frequência
        const mockAttendanceCounts: AttendanceCount[] = [
          {
            woman_id: "1",
            woman_name: "Maria Silva",
            presences: 18,
            absences: 2,
            justified: 1,
            total_sessions: 21,
            attendance_rate: 85.7
          },
          {
            woman_id: "2",
            woman_name: "Ana Santos", 
            presences: 15,
            absences: 4,
            justified: 2,
            total_sessions: 21,
            attendance_rate: 71.4
          },
          {
            woman_id: "3",
            woman_name: "Rosa Lima",
            presences: 20,
            absences: 1,
            justified: 0,
            total_sessions: 21,
            attendance_rate: 95.2
          },
          {
            woman_id: "4",
            woman_name: "Claudia Oliveira",
            presences: 19,
            absences: 2,
            justified: 0,
            total_sessions: 21,
            attendance_rate: 90.5
          },
          {
            woman_id: "5",
            woman_name: "Fernanda Costa",
            presences: 17,
            absences: 3,
            justified: 1,
            total_sessions: 21,
            attendance_rate: 81.0
          },
          {
            woman_id: "6",
            woman_name: "Joana Pereira",
            presences: 16,
            absences: 4,
            justified: 1,
            total_sessions: 21,
            attendance_rate: 76.2
          }
        ];

        setWomen(mockWomen);
        setAttendanceCounts(mockAttendanceCounts.sort((a, b) => b.attendance_rate - a.attendance_rate));
        
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        showError("Erro ao carregar dados das mulheres");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddWoman = async (formData: FormData) => {
    try {
      const newWoman: Woman = {
        id: Date.now().toString(),
        name: formData.get("woman-name") as string,
        age: Number.parseInt(formData.get("age") as string),
        community: formData.get("community") as string,
        phone: formData.get("phone") as string,
        observations: formData.get("observations") as string,
        photo_url: undefined,
        created_at: new Date().toISOString()
      };

      // Adicionar também ao ranking com contadores zerados
      const newAttendanceCount: AttendanceCount = {
        woman_id: newWoman.id,
        woman_name: newWoman.name,
        presences: 0,
        absences: 0,
        justified: 0,
        total_sessions: 0,
        attendance_rate: 0
      };

      setWomen([...women, newWoman]);
      setAttendanceCounts([...attendanceCounts, newAttendanceCount]);
      showSuccess("Mulher cadastrada com sucesso!");
      setIsAddWomanOpen(false);
    } catch (error) {
      showError("Erro ao cadastrar mulher");
    }
  };

  const handleEditWoman = async (formData: FormData) => {
    if (!selectedWoman) return;
    
    try {
      const updatedWoman: Woman = {
        ...selectedWoman,
        name: formData.get("woman-name") as string,
        age: Number.parseInt(formData.get("age") as string),
        community: formData.get("community") as string,
        phone: formData.get("phone") as string,
        observations: formData.get("observations") as string,
      };

      setWomen(women.map((w) => (w.id === selectedWoman.id ? updatedWoman : w)));
      
      // Atualizar também o nome no ranking
      setAttendanceCounts(attendanceCounts.map(count => 
        count.woman_id === selectedWoman.id 
          ? { ...count, woman_name: updatedWoman.name }
          : count
      ));
      
      setSelectedWoman(updatedWoman);
      setIsEditingWoman(false);
      showSuccess("Dados atualizados com sucesso!");
    } catch (error) {
      showError("Erro ao atualizar dados");
    }
  };

  const handleAttendanceChange = (womanId: string, status: string) => {
    // Atualizar apenas o estado da chamada atual (não altera o ranking ainda)
    setAttendanceData((prev) => ({ ...prev, [womanId]: status }));
  };

  const handleSaveAttendance = async () => {
    try {
      setIsSavingAttendance(true);
      
      // Simular delay de salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Após "salvar", atualizar o ranking com os novos dados
      setAttendanceCounts((prevCounts) => {
        return prevCounts.map((count) => {
          const status = attendanceData[count.woman_id];
          if (status) {
            let newPresences = count.presences;
            let newAbsences = count.absences;
            let newJustified = count.justified;
            let newTotalSessions = count.total_sessions + 1;

            if (status === "present") newPresences += 1;
            else if (status === "absent") newAbsences += 1;
            else if (status === "justified") newJustified += 1;

            const newAttendanceRate = newTotalSessions > 0 
              ? (newPresences / newTotalSessions) * 100 
              : 0;

            return {
              ...count,
              presences: newPresences,
              absences: newAbsences,
              justified: newJustified,
              total_sessions: newTotalSessions,
              attendance_rate: newAttendanceRate,
            };
          }
          return count;
        }).sort((a, b) => b.attendance_rate - a.attendance_rate);
      });

      // Limpar dados da chamada atual após salvar
      setAttendanceData({});
      showSuccess(`Chamada do dia ${new Date(attendanceDate).toLocaleDateString('pt-BR')} salva com sucesso!`);
      
    } catch (error) {
      showError("Erro ao salvar a chamada. Tente novamente.");
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const canSaveAttendance = () => {
    const totalWomen = women.length;
    const markedAttendance = Object.keys(attendanceData).length;
    return markedAttendance === totalWomen && markedAttendance > 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#7f6e62]">Mulheres</h1>
        <div className="text-center py-8">
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#EAE8E8] p-4 rounded-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#7f6e62]">Mulheres</h1>
      </div>

      {/* Grid ajustado: Chamada maior (2 colunas) e Ranking menor (1 coluna) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chamada - Agora ocupa 2 colunas (maior) com overflow limitado a 4 pessoas */}
        <Card className="lg:col-span-2 bg-[#F4A460] backdrop-blur-sm relative">
          <CardHeader className="pb-3">
            <CardTitle className="text-white font-bold">Chamada</CardTitle>
            {!canSaveAttendance() && (
              <div className="text-center pt-2">
                <p className="text-white/70 text-sm">
                  Marque a presença de todas as mulheres para confirmar a chamada
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
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-gray-600">
                        {woman.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="font-medium text-white">{woman.name}</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant={
                        attendanceData[woman.id] === "present" ? "default" : "secondary"
                      }
                      className={`text-xs px-2 py-1 ${
                        attendanceData[woman.id] === "present"
                          ? "bg-white text-green-600 hover:bg-gray-100"
                          : "bg-white/80 text-black hover:bg-white"
                      }`}
                      onClick={() => handleAttendanceChange(woman.id, "present")}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Presente
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        attendanceData[woman.id] === "absent" ? "default" : "secondary"
                      }
                      className={`text-xs px-2 py-1 ${
                        attendanceData[woman.id] === "absent"
                          ? "bg-white text-red-600 hover:bg-gray-100"
                          : "bg-white/80 text-black hover:bg-white"
                      }`}
                      onClick={() => handleAttendanceChange(woman.id, "absent")}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Faltou
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {/* Controles na parte inferior */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-black/20">
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
            </div>
          </CardContent>
        </Card>

        {/* Ranking de Presenças - Agora ocupa 1 coluna (menor) com overflow limitado a 4 pessoas */}
        <Card className="bg-[#F4A460] backdrop-blur-sm text-white">
          <CardHeader>
            <CardTitle className="text-white">Ranking de Participação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-y-auto max-h-[320px] space-y-3 pr-2">
              {attendanceCounts.map((count, index) => (
                <div
                  key={count.woman_id}
                  className="flex items-center justify-between p-3 bg-white/20 rounded-lg min-h-[60px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[#F4A460]">
                        {count.woman_name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="font-medium text-sm">{count.woman_name}</span>
                  </div>
                  <span className="font-medium text-sm flex-shrink-0">
                    {count.presences} Presenças
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Mulheres Cadastradas com overflow limitado a 2 linhas */}
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleAddWoman(formData);
                }}
              >
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
                    <Label htmlFor="woman-photo">Foto</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="woman-photo"
                        name="woman-photo"
                        type="file"
                        accept="image/*"
                      />
                      <Camera className="w-5 h-5 text-gray-400" />
                    </div>
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
                  >
                    Cadastrar
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
                        {woman.name.split(" ").map((n) => n[0]).join("")}
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

      {/* Modal de detalhes/edição */}
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleEditWoman(formData);
                }}
              >
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
                      defaultValue={selectedWoman.observations}
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
                  >
                    Salvar Alterações
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
                      {selectedWoman.name.split(" ").map((n: string) => n[0]).join("")}
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
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedWoman(null)}
                  >
                    Fechar
                  </Button>
                  <Button
                    className="bg-[#88957d] hover:bg-[#7f6e62]"
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
    </div>
  );
}