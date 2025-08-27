"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarX } from "lucide-react"
import { useNotification } from "@/hooks/use-notification"
import { getStudents, getAttendance, type Student } from "@/lib/database"

function StatusBadge({ status }: { status: string }) {
  const statusInfo = {
    present: {
      text: "Presente",
      className: "bg-green-500 text-white hover:bg-green-600",
    },
    absent: {
      text: "Faltou",
      className: "bg-red-500 text-white hover:bg-red-600",
    },
    justified: {
      text: "Justificada",
      className: "bg-yellow-500 text-white hover:bg-yellow-600",
    },

    default: {
      text: status,
      className: "",
    },
  };
  const currentStatus = statusInfo[status?.toLowerCase()] || statusInfo.default;
  return (
    <Badge className={currentStatus.className}>
      {currentStatus.text}
    </Badge>
  );
}


function RelatorioChamadaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showError } = useNotification()

  const [students, setStudents] = useState<Student[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>({})
  
  // ==================================================================
  // MUDANÇA PRINCIPAL: Usamos um único estado para o status da UI
  // ==================================================================
  const [uiStatus, setUiStatus] = useState<'loading' | 'success' | 'empty' | 'error'>('loading');

  const dateParam = searchParams.get("date")
  const selectedDate = dateParam ? new Date(dateParam + "T12:00:00Z") : new Date()

  useEffect(() => {
    if (!dateParam) {
      showError("Data não especificada para o relatório.")
      setUiStatus('error');
      return
    }
    
    const loadDataSequentially = async () => {
      try {
        setUiStatus('loading'); // Sempre começa como 'loading'
        
        const attendanceData = await getAttendance(dateParam)

        if (attendanceData && attendanceData.length > 0) {
          const studentsData = await getStudents()
          setStudents(studentsData)

          const recordsMap = attendanceData.reduce((acc, record) => {
            acc[record.student_id] = record.status
            return acc
          }, {} as Record<string, string>)
          setAttendanceRecords(recordsMap)

          setUiStatus('success');
        } else {
          setUiStatus('empty');
        }
      } catch (error) {
        showError("Erro ao carregar o relatório de chamada.")
        setUiStatus('error');
      }
    }

    loadDataSequentially()
  }, [dateParam])

  const renderContent = () => {
    switch (uiStatus) {
      case 'loading':
        return <div className="text-center py-8"><p className="text-gray-600">Carregando relatório...</p></div>;
      
      case 'empty':
        return (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
              <CalendarX className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="font-semibold text-lg text-[#7f6e62]">Nenhum Registro Encontrado</h3>
              <p className="text-sm text-gray-600 mt-1">
                A chamada para este dia não foi realizada ou não houve aula.
              </p>
            </CardContent>
          </Card>
        );

      case 'success':
        return (
          <div className="grid gap-4">
            {students.map((student) => {
              const status = attendanceRecords[student.id] || "Não Registrado"
              return (
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
                      <StatusBadge status={status} />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        );

      case 'error':
        return (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-8 text-center text-red-700">
              <p>Ocorreu um erro ao carregar os dados.</p>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#7f6e62]">Relatório de Chamada</h1>
        <div className="text-sm text-gray-600">{selectedDate?.toLocaleDateString("pt-BR")}</div>
      </div>
      
      {/* O conteúdo principal agora é renderizado pela nossa nova função */}
      {renderContent()}
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/students/dashboard")}>
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  )
}

export default function RelatorioChamadaPage() {
  return (
    <Suspense fallback={<div>Carregando relatório...</div>}>
      <RelatorioChamadaContent />
    </Suspense>
  )
}