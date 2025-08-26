"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { PageContainer } from "@/components/page-container"
import { useNotification } from "@/hooks/use-notification"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  CalendarIcon,
  AlertCircle,
  Camera,
  Edit,
  CheckCircle,
  X,
  Home,
  Search,
  Mail,
  Bell,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import {
  getStudents,
  createStudent,
  updateStudent, // Added updateStudent import
  createAttendance,
  getActivities,
  createActivity,
  updateActivity, // Added updateActivity import
  type Student,
  type Activity,
} from "@/lib/database"

const weeklyAttendanceData = [
  { day: "D", attendance: 45, color: "#d09c91" },
  { day: "S", attendance: 42, color: "#88957d" },
  { day: "T", attendance: 48, color: "#88957d" },
  { day: "Q", attendance: 44, color: "#d5c4aa" },
  { day: "Q", attendance: 46, color: "#88957d" },
  { day: "S", attendance: 40, color: "#d5c4aa" },
  { day: "S", attendance: 38, color: "#d09c91" },
]

export default function StudentsPage() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false)
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [isEditingStudent, setIsEditingStudent] = useState(false) // Added editing states
  const [isEditingActivity, setIsEditingActivity] = useState(false)
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({})
  const [students, setStudents] = useState<Student[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
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
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false)
  const [isActivityDetailOpen, setIsActivityDetailOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const todayActivity = activities.find((activity) => activity.date === selectedDate?.toISOString().split("T")[0]) || {
    title: "Oficina de Arte",
    responsible: "Professora Carla",
    spots: 20,
    description: "Atividade de pintura e desenho para desenvolver a criatividade das crianças.",
  }

  const filteredStudents = students.filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const sidebarItems = [
    {
      title: "MENU",
      items: [
        { title: "Visão Geral", icon: LayoutDashboard, id: "dashboard" },
        { title: "Alunos", icon: Users, id: "students" },
        { title: "Mulheres", icon: UserCheck, id: "women" },
      ],
    },
    {
      title: "GERAL",
      items: [
        { title: "Configurações", icon: Settings, id: "settings" },
        { title: "Ajuda", icon: HelpCircle, id: "help" },
        { title: "Sair", icon: LogOut, id: "logout" },
      ],
    },
  ]

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceData((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleAddActivity = async (formData: FormData) => {
    try {
      const newActivity = {
        title: formData.get("activity-title") as string,
        responsible: formData.get("responsible") as string,
        spots: Number.parseInt(formData.get("spots") as string),
        description: formData.get("activity-description") as string,
        date: new Date().toISOString().split("T")[0],
        photo_url: null,
      }

      console.log("[v0] Criando atividade:", newActivity)
      const created = await createActivity(newActivity)
      setActivities([created, ...activities])
      showSuccess("Atividade criada com sucesso!")
      setIsAddActivityOpen(false)
    } catch (error) {
      console.error("[v0] Erro ao criar atividade:", error)
      showError("Erro ao criar atividade")
    }
  }

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
        photo_url: null,
      }

      console.log("[v0] Criando estudante:", newStudent)
      const created = await createStudent(newStudent)
      setStudents([...students, created])
      showSuccess("Aluno cadastrado com sucesso!")
      setIsAddStudentOpen(false)
    } catch (error) {
      console.error("[v0] Erro ao criar estudante:", error)
      showError("Erro ao cadastrar aluno")
    }
  }

  const handleSaveAttendance = () => {
    setConfirmDialog({
      open: true,
      title: "Salvar Chamada",
      description: "Deseja salvar a chamada do dia? Esta ação não pode ser desfeita.",
      onConfirm: async () => {
        try {
          const dateStr = selectedDate?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0]

          console.log("[v0] Salvando chamada para:", dateStr)
          const attendancePromises = Object.entries(attendanceData).map(([studentId, status]) =>
            createAttendance({
              student_id: studentId,
              date: dateStr,
              status: status,
            }),
          )

          await Promise.all(attendancePromises)
          showSuccess("Chamada salva com sucesso!")
          setCurrentView("dashboard")
          setAttendanceData({})
        } catch (error) {
          console.error("[v0] Erro ao salvar chamada:", error)
          showError("Erro ao salvar chamada")
        }
        setConfirmDialog({ ...confirmDialog, open: false })
      },
    })
  }

  const handleCalendarDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setCurrentView("attendance")
      setIsCalendarOpen(false)
    }
  }

  const handleDateRangeFilter = () => {
    if (dateRange.start && dateRange.end) {
      showSuccess(`Filtro aplicado: ${dateRange.start} até ${dateRange.end}`)
      setIsDateFilterOpen(false)
      // Here you would typically update the dashboard data based on the date range
    }
  }

  const handleEditStudent = async (formData: FormData) => {
    if (!selectedStudent) return

    try {
      const updates = {
        name: formData.get("student-name") as string,
        community: formData.get("community") as string,
        age: Number.parseInt(formData.get("age") as string),
        guardian_name: formData.get("guardian-name") as string,
        guardian_phone: formData.get("guardian-phone") as string,
        observations: formData.get("observations") as string,
        can_go_alone: formData.get("can-go-alone") === "on",
      }

      console.log("[v0] Editando estudante:", selectedStudent.id, updates)
      const updatedStudent = await updateStudent(selectedStudent.id, updates)

      // Update local state
      setStudents(students.map((s) => (s.id === selectedStudent.id ? updatedStudent : s)))
      setSelectedStudent(updatedStudent)
      setIsEditingStudent(false)
      showSuccess("Aluno atualizado com sucesso!")
    } catch (error) {
      console.error("[v0] Erro ao editar estudante:", error)
      showError("Erro ao atualizar aluno")
    }
  }

  const handleEditActivity = async (formData: FormData) => {
    try {
      const updates = {
        title: formData.get("activity-title") as string,
        responsible: formData.get("responsible") as string,
        spots: Number.parseInt(formData.get("spots") as string),
        description: formData.get("activity-description") as string,
      }

      console.log("[v0] Editando atividade:", todayActivity.id, updates)
      const updatedActivity = await updateActivity(todayActivity.id || "", updates)

      // Update local state
      setActivities(activities.map((a) => (a.id === (todayActivity.id || "") ? updatedActivity : a)))
      setIsEditingActivity(false)
      setIsActivityDetailOpen(false)
      showSuccess("Atividade atualizada com sucesso!")
    } catch (error) {
      console.error("[v0] Erro ao editar atividade:", error)
      showError("Erro ao atualizar atividade")
    }
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm p-4 rounded-lg border border-[#d5c4aa]/30">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Pesquisar" className="pl-10 bg-gray-50 border-gray-200" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <Mail className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm">
            <Bell className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg" alt="Joyce" />
              <AvatarFallback>J</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">Joyce</p>
              <p className="text-gray-500 text-xs">gris@ong.br</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#7f6e62]">Visão Geral</h1>
        <div className="flex gap-2">
          <Popover open={isDateFilterOpen} onOpenChange={setIsDateFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="border-[#d5c4aa] bg-transparent">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Data
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filtrar por período</h4>
                <div className="grid gap-2">
                  <Label htmlFor="start-date">Data de início</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-date">Data de fim</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDateFilterOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleDateRangeFilter} className="bg-[#88957d] hover:bg-[#7f6e62]">
                    Aplicar Filtro
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Dialog open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#88957d] hover:bg-[#7f6e62]">
                <Plus className="w-4 h-4 mr-2" />
                Atividade
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Evento/Atividade</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  handleAddActivity(formData)
                }}
              >
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="activity-title">Título da Atividade</Label>
                    <Input id="activity-title" name="activity-title" placeholder="Título da atividade" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="responsible">Responsável pela Atividade</Label>
                    <Input id="responsible" name="responsible" placeholder="Nome do responsável" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="spots">Quantidade de Vagas</Label>
                    <Input id="spots" name="spots" type="number" placeholder="Número de vagas" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="activity-description">Descrição</Label>
                    <Textarea
                      id="activity-description"
                      name="activity-description"
                      placeholder="Detalhes sobre a atividade"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="activity-photo">Foto da Atividade</Label>
                    <div className="flex items-center gap-2">
                      <Input id="activity-photo" name="activity-photo" type="file" accept="image/*" />
                      <Camera className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddActivityOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#88957d] hover:bg-[#7f6e62]">
                    Criar Atividade
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#88957d] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Frequência</h3>
              <Edit className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <div className="text-center">
                <span className="text-4xl font-bold">24</span>
                <p className="text-sm opacity-90">presenças</p>
              </div>
              <div className="text-center">
                <span className="text-4xl font-bold text-[#d09c91]">5</span>
                <p className="text-sm opacity-90">faltas</p>
              </div>
            </div>
            <p className="text-sm opacity-90 mt-4 text-center">Mais alunos que semana passada</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-[#7f6e62]">Análise da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="attendance" fill="#88957d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-[#7f6e62]">Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleCalendarDateSelect}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            <p className="text-sm text-gray-600 mt-2">Clique em uma data para fazer a chamada</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#7f6e62]">Atividade do dia</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsActivityDetailOpen(true)}
              className="border-[#88957d] text-[#88957d] hover:bg-[#88957d] hover:text-white"
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          </CardHeader>
          <CardContent>
            <div
              className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              onClick={() => setIsActivityDetailOpen(true)}
            >
              <div className="flex gap-4">
                <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src="/computer-classroom.png"
                    alt="Atividade"
                    width={96}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-[#7f6e62] mb-1">{todayActivity.title}</h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{todayActivity.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#88957d] rounded-full"></div>
                    <span className="text-sm font-medium">{todayActivity.responsible}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-[#7f6e62]">Lembretes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </p>
              <div className="border-t pt-3">
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua.
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isActivityDetailOpen} onOpenChange={setIsActivityDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditingActivity ? "Editar Atividade" : "Detalhes da Atividade"}</DialogTitle>
          </DialogHeader>
          {todayActivity &&
            (isEditingActivity ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  handleEditActivity(formData)
                }}
              >
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-activity-title">Título da Atividade</Label>
                    <Input id="edit-activity-title" name="activity-title" defaultValue={todayActivity.title} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-responsible">Responsável</Label>
                    <Input id="edit-responsible" name="responsible" defaultValue={todayActivity.responsible} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-spots">Vagas</Label>
                    <Input id="edit-spots" name="spots" type="number" defaultValue={todayActivity.spots} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-activity-description">Descrição</Label>
                    <Textarea
                      id="edit-activity-description"
                      name="activity-description"
                      defaultValue={todayActivity.description}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditingActivity(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#88957d] hover:bg-[#7f6e62]">
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src="/computer-classroom.png"
                    alt="Atividade"
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="font-medium">Responsável</Label>
                    <p className="text-sm text-gray-600">{todayActivity.responsible}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Vagas</Label>
                    <p className="text-sm text-gray-600">{todayActivity.spots} vagas disponíveis</p>
                  </div>
                  <div>
                    <Label className="font-medium">Descrição</Label>
                    <p className="text-sm text-gray-600">{todayActivity.description}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsActivityDetailOpen(false)}>
                    Fechar
                  </Button>
                  <Button className="bg-[#88957d] hover:bg-[#7f6e62]" onClick={() => setIsEditingActivity(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            ))}
        </DialogContent>
      </Dialog>
    </div>
  )

  const renderStudents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#7f6e62]">Alunos</h1>
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#88957d] hover:bg-[#7f6e62]">
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
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleAddStudent(formData)
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="student-name">Nome Completo</Label>
                  <Input id="student-name" name="student-name" placeholder="Nome completo do aluno" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="community">Qual comunidade pertence?</Label>
                  <Input id="community" name="community" placeholder="Nome da comunidade" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="student-photo">Foto do Aluno</Label>
                  <div className="flex items-center gap-2">
                    <Input id="student-photo" name="student-photo" type="file" accept="image/*" />
                    <Camera className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="age">Idade</Label>
                  <Input id="age" name="age" type="number" placeholder="Idade do aluno" required />
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
                  <h3 className="font-semibold text-[#7f6e62] mb-3">Informações do Responsável</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="guardian-name">Nome do Responsável</Label>
                      <Input id="guardian-name" name="guardian-name" placeholder="Nome do responsável" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="guardian-phone">Telefone de Contato</Label>
                      <Input id="guardian-phone" name="guardian-phone" placeholder="(11) 99999-9999" required />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddStudentOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#88957d] hover:bg-[#7f6e62]">
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
                    <AvatarImage src={student.photo_url || "/placeholder.svg"} alt={student.name} />
                    <AvatarFallback>
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#7f6e62]">{student.name}</h3>
                    <p className="text-sm text-gray-600">Idade: {student.age} anos</p>
                    <p className="text-sm text-gray-600">{student.community}</p>
                    <Badge variant={student.can_go_alone ? "default" : "secondary"} className="mt-1">
                      {student.can_go_alone ? "Independente" : "Acompanhado"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredStudents.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p className="text-gray-600">Nenhum aluno encontrado para "{searchQuery}"</p>
        </div>
      )}

      <Dialog
        open={!!selectedStudent}
        onOpenChange={() => {
          setSelectedStudent(null)
          setIsEditingStudent(false) // Reset editing state when closing
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditingStudent ? "Editar Aluno" : "Perfil do Aluno"}</DialogTitle>
          </DialogHeader>
          {selectedStudent &&
            (isEditingStudent ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  handleEditStudent(formData)
                }}
              >
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-student-name">Nome Completo</Label>
                    <Input id="edit-student-name" name="student-name" defaultValue={selectedStudent.name} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-community">Comunidade</Label>
                    <Input id="edit-community" name="community" defaultValue={selectedStudent.community} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-age">Idade</Label>
                    <Input id="edit-age" name="age" type="number" defaultValue={selectedStudent.age} required />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-can-go-alone"
                      name="can-go-alone"
                      defaultChecked={selectedStudent.can_go_alone}
                    />
                    <Label htmlFor="edit-can-go-alone">Pode voltar sozinho?</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-observations">Observações</Label>
                    <Textarea id="edit-observations" name="observations" defaultValue={selectedStudent.observations} />
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-[#7f6e62] mb-3">Informações do Responsável</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-guardian-name">Nome do Responsável</Label>
                        <Input
                          id="edit-guardian-name"
                          name="guardian-name"
                          defaultValue={selectedStudent.guardian_name}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-guardian-phone">Telefone de Contato</Label>
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
                  <Button variant="outline" onClick={() => setIsEditingStudent(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#88957d] hover:bg-[#7f6e62]">
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={selectedStudent.photo_url || "/placeholder.svg"} alt={selectedStudent.name} />
                    <AvatarFallback>
                      {selectedStudent.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-[#7f6e62]">{selectedStudent.name}</h3>
                    <p className="text-gray-600">Idade: {selectedStudent.age} anos</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div>
                    <Label className="font-medium">Comunidade</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.community}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Pode voltar sozinho?</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.can_go_alone ? "Sim" : "Não"}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Responsável</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.guardian_name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Telefone</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.guardian_phone}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Observações</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.observations}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                    Fechar
                  </Button>
                  <Button className="bg-[#88957d] hover:bg-[#7f6e62]" onClick={() => setIsEditingStudent(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            ))}
        </DialogContent>
      </Dialog>
    </div>
  )

  const renderAttendance = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#7f6e62]">Chamada do Dia</h1>
        <div className="text-sm text-gray-600">{selectedDate?.toLocaleDateString("pt-BR")}</div>
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
                      <AvatarImage src={student.photo_url || "/placeholder.svg"} alt={student.name} />
                      <AvatarFallback>
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-[#7f6e62]">{student.name}</h3>
                      <p className="text-sm text-gray-600">
                        {student.age} anos - {student.community}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={attendanceData[student.id] === "present" ? "default" : "outline"}
                      className={attendanceData[student.id] === "present" ? "bg-green-500 hover:bg-green-600" : ""}
                      onClick={() => handleAttendanceChange(student.id, "present")}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Presente
                    </Button>
                    <Button
                      size="sm"
                      variant={attendanceData[student.id] === "absent" ? "default" : "outline"}
                      className={attendanceData[student.id] === "absent" ? "bg-red-500 hover:bg-red-600" : ""}
                      onClick={() => handleAttendanceChange(student.id, "absent")}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Faltou
                    </Button>
                    <Button
                      size="sm"
                      variant={attendanceData[student.id] === "justified" ? "default" : "outline"}
                      className={attendanceData[student.id] === "justified" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                      onClick={() => handleAttendanceChange(student.id, "justified")}
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
        <Button variant="outline" onClick={() => setCurrentView("dashboard")}>
          Cancelar
        </Button>
        <Button className="bg-[#88957d] hover:bg-[#7f6e62]" onClick={handleSaveAttendance}>
          Salvar Chamada
        </Button>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return renderDashboard()
      case "students":
        return renderStudents()
      case "attendance":
        return renderAttendance()
      case "women":
        return (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-[#7f6e62] mb-4">Módulo Mulheres</h1>
            <p className="text-gray-600">Em desenvolvimento...</p>
          </div>
        )
      default:
        return (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-[#7f6e62] mb-4">Em Desenvolvimento</h1>
            <p className="text-gray-600">Esta seção está sendo desenvolvida.</p>
          </div>
        )
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("[v0] Carregando dados do banco...")
        const [studentsData, activitiesData] = await Promise.all([getStudents(), getActivities()])
        console.log("[v0] Dados carregados:", { students: studentsData.length, activities: activitiesData.length })
        setStudents(studentsData)
        setActivities(activitiesData)
      } catch (error) {
        console.error("[v0] Erro ao carregar dados:", error)
        showError("Erro ao carregar dados do banco")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <PageContainer>
      <SidebarProvider>
        <div className="flex w-full">
          <Sidebar className="bg-white/95 backdrop-blur-sm border-r border-[#d5c4aa]/30">
            <SidebarContent>
              <div className="p-4 border-b border-[#d5c4aa]/30">
                <div className="flex items-center gap-3">
                  <Image src="/images/gris-logo.png" alt="GRIS Logo" width={40} height={40} className="rounded-full" />
                  <div>
                    <h2 className="font-semibold text-[#7f6e62]">GRIS</h2>
                    <p className="text-xs text-gray-600">Gestão de Alunos</p>
                  </div>
                </div>
                <Link
                  href="/"
                  className="flex items-center gap-2 text-sm text-[#88957d] hover:text-[#7f6e62] transition-colors mt-2"
                >
                  <Home className="w-3 h-3" />
                  Voltar ao Hub
                </Link>
              </div>
              {sidebarItems.map((group) => (
                <SidebarGroup key={group.title}>
                  <SidebarGroupLabel className="text-[#7f6e62] font-semibold">{group.title}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            onClick={() => setCurrentView(item.id)}
                            className={`${
                              currentView === item.id
                                ? "bg-[#88957d] text-white"
                                : "text-[#7f6e62] hover:bg-[#d5c4aa]/30"
                            }`}
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>

          <main className="flex-1">
            <div className="border-b border-[#d5c4aa]/30 bg-white/95 backdrop-blur-sm p-4">
              <SidebarTrigger className="text-[#7f6e62]" />
            </div>
            <div className="p-6">{renderContent()}</div>
          </main>
        </div>
      </SidebarProvider>

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
