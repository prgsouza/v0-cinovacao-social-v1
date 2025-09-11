// app/students/alunos/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Camera, Edit, Search } from "lucide-react";
import { useNotification } from "@/hooks/use-notification";
import { Student } from "@/lib/student/student.dto";
import {
  getStudents,
  createStudent,
  updateStudent,
} from "@/lib/student/student.service";

export default function AlunosPage() {
  const { showSuccess, showError } = useNotification();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const loadStudents = async () => {
      // É aqui que você adiciona o "recado"
      console.log("1. FRONT-END: Tentando chamar getStudents agora...");

      try {
        const studentsData = await getStudents();
        setStudents(studentsData);
      } catch (error) {
        console.error("Falha ao carregar alunos:", error);
        showError("Não foi possível carregar os alunos.");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const handleAddStudent = async (formData: FormData) => {
    try {
      const newStudent = {
        name: formData.get("student-name") as string,
        community: formData.get("community") as string,
        age: Number.parseInt(formData.get("age") as string),
        guardian_name: formData.get("guardian-name") as string,
        guardian_phone: formData.get("guardian-phone") as string,
        observations: formData.get("observations") as string,
        can_go_alone: formData.get("can-go-alone") === "on",
        photo_url: undefined,
      };
      const created = await createStudent(newStudent);
      setStudents([...students, created]);
      showSuccess("Aluno cadastrado com sucesso!");
      setIsAddStudentOpen(false);
    } catch (error) {
      showError("Erro ao cadastrar aluno");
    }
  };

  const handleEditStudent = async (formData: FormData) => {
    if (!selectedStudent) return;
    try {
      const updates = {
        name: formData.get("student-name") as string,
        community: formData.get("community") as string,
        age: Number.parseInt(formData.get("age") as string),
        guardian_name: formData.get("guardian-name") as string,
        guardian_phone: formData.get("guardian-phone") as string,
        observations: formData.get("observations") as string,
        can_go_alone: formData.get("can-go-alone") === "on",
      };
      const updatedStudent = await updateStudent(selectedStudent.id, updates);
      setStudents(
        students.map((s) => (s.id === selectedStudent.id ? updatedStudent : s))
      );
      setSelectedStudent(updatedStudent);
      setIsEditingStudent(false);
      showSuccess("Aluno atualizado com sucesso!");
    } catch (error) {
      showError("Erro ao atualizar aluno");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#ffffff]">Alunos</h1>
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#237C52] hover:bg-[#7f6e62]">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastro de Novo Aluno</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleAddStudent(formData);
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="student-name">Nome Completo</Label>
                  <Input
                    id="student-name"
                    name="student-name"
                    placeholder="Nome completo do aluno"
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
                  <Label htmlFor="student-photo">Foto do Aluno</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="student-photo"
                      name="student-photo"
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
                    placeholder="Idade do aluno"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="can-go-alone" name="can-go-alone" />
                  <Label htmlFor="can-go-alone">Pode voltar sozinho?</Label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    name="observations"
                    placeholder="Restrições alimentares, alergias, medicamentos, etc."
                  />
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-[#7f6e62] mb-3">
                    Informações do Responsável
                  </h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="guardian-name">Nome do Responsável</Label>
                      <Input
                        id="guardian-name"
                        name="guardian-name"
                        placeholder="Nome do responsável"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="guardian-phone">
                        Telefone de Contato
                      </Label>
                      <Input
                        id="guardian-phone"
                        name="guardian-phone"
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddStudentOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#237C52] hover:bg-[#7f6e62]"
                >
                  Cadastrar Aluno
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Pesquisar alunos por nome..."
          className="pl-10 bg-white/90 backdrop-blur-sm border-[#d5c4aa]/30"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Carregando alunos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <Card
              key={student.id}
              className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedStudent(student)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage
                      src={student.photo_url || "/placeholder.svg"}
                      alt={student.name}
                    />
                    <AvatarFallback>
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#7f6e62]">
                      {student.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Idade: {student.age} anos
                    </p>
                    <p className="text-sm text-gray-600">{student.community}</p>
                    <Badge
                      variant={student.can_go_alone ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {student.can_go_alone ? "Independente" : "Acompanhado"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {filteredStudents.length === 0 && searchQuery && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">
            Nenhum aluno encontrado para "{searchQuery}"
          </p>
        </div>
      )}
      <Dialog
        open={!!selectedStudent}
        onOpenChange={() => {
          setSelectedStudent(null);
          setIsEditingStudent(false);
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditingStudent ? "Editar Aluno" : "Perfil do Aluno"}
            </DialogTitle>
          </DialogHeader>
          {selectedStudent &&
            (isEditingStudent ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleEditStudent(formData);
                }}
              >
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-student-name">Nome Completo</Label>
                    <Input
                      id="edit-student-name"
                      name="student-name"
                      defaultValue={selectedStudent.name}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-community">Comunidade</Label>
                    <Input
                      id="edit-community"
                      name="community"
                      defaultValue={selectedStudent.community}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-age">Idade</Label>
                    <Input
                      id="edit-age"
                      name="age"
                      type="number"
                      defaultValue={selectedStudent.age}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-can-go-alone"
                      name="can-go-alone"
                      defaultChecked={selectedStudent.can_go_alone}
                    />
                    <Label htmlFor="edit-can-go-alone">
                      Pode voltar sozinho?
                    </Label>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-observations">Observações</Label>
                    <Textarea
                      id="edit-observations"
                      name="observations"
                      defaultValue={selectedStudent.observations}
                    />
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-[#7f6e62] mb-3">
                      Informações do Responsável
                    </h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-guardian-name">
                          Nome do Responsável
                        </Label>
                        <Input
                          id="edit-guardian-name"
                          name="guardian-name"
                          defaultValue={selectedStudent.guardian_name}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-guardian-phone">
                          Telefone de Contato
                        </Label>
                        <Input
                          id="edit-guardian-phone"
                          name="guardian-phone"
                          defaultValue={selectedStudent.guardian_phone}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditingStudent(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#237C52] hover:bg-[#7f6e62]"
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
                      src={selectedStudent.photo_url || "/placeholder.svg"}
                      alt={selectedStudent.name}
                    />
                    <AvatarFallback>
                      {selectedStudent.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-[#7f6e62]">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-gray-600">
                      Idade: {selectedStudent.age} anos
                    </p>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div>
                    <Label className="font-medium">Comunidade</Label>
                    <p className="text-sm text-gray-600">
                      {selectedStudent.community}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Pode voltar sozinho?</Label>
                    <p className="text-sm text-gray-600">
                      {selectedStudent.can_go_alone ? "Sim" : "Não"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Responsável</Label>
                    <p className="text-sm text-gray-600">
                      {selectedStudent.guardian_name}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Telefone</Label>
                    <p className="text-sm text-gray-600">
                      {selectedStudent.guardian_phone}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Observações</Label>
                    <p className="text-sm text-gray-600">
                      {selectedStudent.observations || "Nenhuma observação."}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedStudent(null)}
                  >
                    Fechar
                  </Button>
                  <Button
                    className="bg-[#237C52] hover:bg-[#7f6e62]"
                    onClick={() => setIsEditingStudent(true)}
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
