// app/students/chamadas/page.tsx

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// --- NOVO: Importando o ícone de alerta ---
import { CheckCircle, X, AlertCircle, TriangleAlert } from "lucide-react";
import { useNotification } from "@/hooks/use-notification";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Student } from "@/lib/student/student.dto";
import { getStudents } from "@/lib/student/student.service";
// --- NOVO: Importando a nova função do service de chamada ---
import { createAttendance, getAtRiskStudents } from "@/lib/attendance/attendance.service";
import { format } from "date-fns";

function ChamadaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useNotification();

  const [students, setStudents] = useState<Student[]>([]);
  // --- NOVO: Estado para guardar a lista de alunos em risco ---
  const [atRiskStudents, setAtRiskStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const dateParam = searchParams.get("date");
  const selectedDate = dateParam ? new Date(dateParam + "T12:00:00Z") : new Date();

  // --- ALTERAÇÃO: Carrega a lista de alunos E a lista de alunos em risco ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Carrega os dados em paralelo para mais performance
        const [studentsData, atRiskData] = await Promise.all([
          getStudents(),
          getAtRiskStudents(3) // Aqui você define o número de faltas (3)
        ]);
        setStudents(studentsData);
        setAtRiskStudents(atRiskData);
      } catch (error) {
        showError("Erro ao carregar dados da chamada");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceData((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = () => {
    setConfirmDialog({
      open: true,
      title: "Salvar Chamada",
      description: "Deseja salvar a chamada do dia? Esta ação não pode ser desfeita.",
      onConfirm: async () => {
        try {
          const dateStr = format(selectedDate, "yyyy-MM-dd");
          const attendancePromises = Object.entries(attendanceData).map(
            ([studentId, status]) =>
              createAttendance({
                student_id: studentId,
                date: dateStr,
                status: status as 'present' | 'absent' | 'justified',
              })
          );
          await Promise.all(attendancePromises);
          showSuccess("Chamada salva com sucesso!");
          router.push("/students/dashboard");
        } catch (error) {
          showError("Erro ao salvar chamada");
        } finally {
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-[#E6742D] p-4 rounded-md">
          <h1 className="text-3xl font-bold text-[#ffffff]">Chamada do Dia</h1>
          <div className="text-sm text-white">{selectedDate?.toLocaleDateString("pt-BR")}</div>
        </div>





        {/* Alerta de Faltas Consecutivas*/}
        {atRiskStudents.length > 0 && (
          <Card className="">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <TriangleAlert className="w-5 h-5" />
                Alerta de Faltas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600">
                Atenção! Os seguintes alunos atingiram 3 ou mais faltas consecutivas:
              </p>
              <ul className="mt-2 font-medium text-black grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {atRiskStudents.map(student => (
                  <li key={student.id}>{student.name}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        
        {loading ? (
          <div className="text-center py-8"><p className="text-gray-600">Carregando alunos...</p></div>
        ) : (
          <div className="grid gap-4">
            {students.map((student) => (
              <Card key={student.id} className="bg-white/90 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={student.photo_url || "/placeholder.svg"} alt={student.name} />
                        <AvatarFallback>{student.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-[#7f6e62]">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.age} anos - {student.community}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant={attendanceData[student.id] === "present" ? "default" : "outline"} className={attendanceData[student.id] === "present" ? "bg-green-500 hover:bg-green-600" : ""} onClick={() => handleAttendanceChange(student.id, "present")}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Presente
                      </Button>
                      <Button size="sm" variant={attendanceData[student.id] === "absent" ? "default" : "outline"} className={attendanceData[student.id] === "absent" ? "bg-red-500 hover:bg-red-600" : ""} onClick={() => handleAttendanceChange(student.id, "absent")}>
                        <X className="w-4 h-4 mr-1" /> Faltou
                      </Button>
                      <Button size="sm" variant={attendanceData[student.id] === "justified" ? "default" : "outline"} className={attendanceData[student.id] === "justified" ? "bg-yellow-500 hover:bg-yellow-600" : ""} onClick={() => handleAttendanceChange(student.id, "justified")}>
                        <AlertCircle className="w-4 h-4 mr-1" /> Justificada
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2 bg-[#E6742D] p-4 rounded-md">
          <Button variant="outline" onClick={() => router.push("/students/dashboard")}>Cancelar</Button>
          <Button className="bg-[#237C52] hover:bg-[#7f6e62]" onClick={handleSaveAttendance}>Salvar Chamada</Button>
        </div>
      </div>
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
      />
    </>
  );
}

export default function ChamadaPage() {
  return (
    <Suspense fallback={<div>Carregando informações da chamada...</div>}>
      <ChamadaContent />
    </Suspense>
  );
}