// app/students/chamadas/page.tsx

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, X, AlertCircle } from "lucide-react";
import { useNotification } from "@/hooks/use-notification";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Student } from "@/lib/student/student.dto";
import { getStudents } from "@/lib/student/student.service";
import { createAttendance } from "@/lib/attendance/attendance.service";
import { format } from "date-fns";

function ChamadaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useNotification();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>(
    {}
  );
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const dateParam = searchParams.get("date");
  const selectedDate = dateParam
    ? new Date(dateParam + "T12:00:00Z")
    : new Date();

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const studentsData = await getStudents();
        setStudents(studentsData);
      } catch (error) {
        showError("Erro ao carregar alunos");
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, []);

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceData((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = () => {
    setConfirmDialog({
      open: true,
      title: "Salvar Chamada",
      description:
        "Deseja salvar a chamada do dia? Esta ação não pode ser desfeita.",
      onConfirm: async () => {
        try {
          const dateStr = selectedDate
            ? format(selectedDate, "yyyy-MM-dd")
            : "";
          if (!dateStr) {
            showError("Data inválida.");
            return;
          }
          const attendancePromises = Object.entries(attendanceData).map(
            ([studentId, status]) =>
              createAttendance({
                student_id: studentId,
                date: dateStr,
                status: status,
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#7f6e62]">Chamada do Dia</h1>
          <div className="text-sm text-gray-600">
            {selectedDate?.toLocaleDateString("pt-BR")}
          </div>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Carregando alunos...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {students.map((student) => (
              <Card key={student.id} className="bg-white/90 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
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
                      <div>
                        <h3 className="font-semibold text-[#7f6e62]">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {student.age} anos - {student.community}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={
                          attendanceData[student.id] === "present"
                            ? "default"
                            : "outline"
                        }
                        className={
                          attendanceData[student.id] === "present"
                            ? "bg-green-500 hover:bg-green-600"
                            : ""
                        }
                        onClick={() =>
                          handleAttendanceChange(student.id, "present")
                        }
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Presente
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          attendanceData[student.id] === "absent"
                            ? "default"
                            : "outline"
                        }
                        className={
                          attendanceData[student.id] === "absent"
                            ? "bg-red-500 hover:bg-red-600"
                            : ""
                        }
                        onClick={() =>
                          handleAttendanceChange(student.id, "absent")
                        }
                      >
                        <X className="w-4 h-4 mr-1" />
                        Faltou
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          attendanceData[student.id] === "justified"
                            ? "default"
                            : "outline"
                        }
                        className={
                          attendanceData[student.id] === "justified"
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : ""
                        }
                        onClick={() =>
                          handleAttendanceChange(student.id, "justified")
                        }
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Justificada
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/students/dashboard")}
          >
            Cancelar
          </Button>
          <Button
            className="bg-[#88957d] hover:bg-[#7f6e62]"
            onClick={handleSaveAttendance}
          >
            Salvar Chamada
          </Button>
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
