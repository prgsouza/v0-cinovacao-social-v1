  "use client"

  import { useState, useEffect } from "react"
  import { useRouter } from "next/navigation"
  import Link from "next/link"
  import { Button } from "@/components/ui/button"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
  import { Label } from "@/components/ui/label"
  import { Input } from "@/components/ui/input"
  import { Textarea } from "@/components/ui/textarea"
  import { Calendar } from "@/components/ui/calendar"
  import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
  import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
  import { Plus, CalendarIcon, Edit, Search, Mail, Bell, Camera, Clock } from "lucide-react"
  import { format, isFuture, isToday, startOfDay } from "date-fns"
  import { ptBR } from "date-fns/locale"
  import Image from "next/image"
  import { useNotification } from "@/hooks/use-notification"
  import { getActivities, createActivity, updateActivity, getAttendance, getReminders, createReminder, type Activity, type Attendance, type Reminder} from "@/lib/database"
  import { Separator } from "@/components/ui/separator"

  const weeklyAttendanceData = [
    { day: "D", attendance: 45, color: "#d09c91" },
    { day: "S", attendance: 42, color: "#88957d" },
    { day: "T", attendance: 48, color: "#88957d" },
    { day: "Q", attendance: 44, color: "#d5c4aa" },
    { day: "Q", attendance: 46, color: "#88957d" },
    { day: "S", attendance: 40, color: "#d5c4aa" },
    { day: "S", attendance: 38, color: "#d09c91" },
  ]

  export default function DashboardPage() {
    const router = useRouter()
    const { showSuccess, showError } = useNotification()

    const [activities, setActivities] = useState<Activity[]>([])
    const [recentAttendances, setRecentAttendances] = useState<Attendance[]>([])
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [isAddActivityOpen, setIsAddActivityOpen] = useState(false)
    const [isActivityDetailOpen, setIsActivityDetailOpen] = useState(false)
    const [isEditingActivity, setIsEditingActivity] = useState(false)
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [dateRange, setDateRange] = useState({ start: "", end: "" })
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false)
    const [reminders, setReminders] = useState<Reminder[]>([])
    const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // estados do formulário
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");

    const selectedDateString = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

    const todayActivity = activities.find((activity) => activity.date === selectedDateString) || {
      id: "default-id",
      title: "Oficina de Arte",
      responsible: "Professora Carla",
      spots: 20,
      description: "Atividade de pintura e desenho para desenvolver a criatividade das crianças.",
    }

    useEffect(() => {
      const loadDashboardData = async () => {
        try {
          const [activitiesData, attendanceData, remindersData] = await Promise.all([
            getActivities(),
            getAttendance(),
            getReminders()
          ]);
          
          setActivities(activitiesData);

          const uniqueDates = [...new Set(attendanceData.map(a => a.date))];
          const recentDates = uniqueDates
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .slice(0, 2)
            .map(date => ({ date } as Attendance));
          
          setRecentAttendances(recentDates);

          setReminders(remindersData);

        } catch (error) {
          showError("Erro ao carregar dados do dashboard")
        }
      }
      loadDashboardData()
    }, [showError])

    const handleCalendarDateSelect = (date: Date | undefined) => {
      if (!date) return;
      setIsCalendarOpen(false)
      const dateString = format(date, "yyyy-MM-dd")
      const today = startOfDay(new Date());
      const selectedDay = startOfDay(date);
      if (isFuture(selectedDay)) {
        showError("Não é possível interagir com uma data futura.");
        return;
      }
      if (isToday(selectedDay)) {
        router.push(`/students/chamadas?date=${dateString}`);
      } 
      else {
        router.push(`/students/chamadas/relatorio?date=${dateString}`);
      }
    }
    
    const handleAddActivity = async (formData: FormData) => {
      try {
        const newActivity = {
          title: formData.get("activity-title") as string,
          responsible: formData.get("responsible") as string,
          spots: Number.parseInt(formData.get("spots") as string),
          description: formData.get("activity-description") as string,
          date: format(new Date(), 'yyyy-MM-dd'),
          photo_url: null,
        }
        const created = await createActivity(newActivity)
        setActivities([created, ...activities])
        showSuccess("Atividade criada com sucesso!")
        setIsAddActivityOpen(false)
      } catch (error) {
        showError("Erro ao criar atividade")
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
        const updatedActivity = await updateActivity(todayActivity.id || "", updates)
        setActivities(activities.map((a) => (a.id === (todayActivity.id || "") ? updatedActivity : a)))
        setIsEditingActivity(false)
        setIsActivityDetailOpen(false)
        showSuccess("Atividade atualizada com sucesso!")
      } catch (error) {
        showError("Erro ao atualizar atividade")
      }
    }

    const handleDateRangeFilter = () => {
      if (dateRange.start && dateRange.end) {
        showSuccess(`Filtro aplicado: ${dateRange.start} até ${dateRange.end}`)
        setIsDateFilterOpen(false)
      }
    }

    const handleAddReminder = async (formData: FormData) => {
      try {
        const newReminder = {
          title: formData.get("reminder-title") as string,
          description: formData.get("reminder-description") as string,
          date: formData.get("reminder-date") as string,
        };
        const created = await createReminder(newReminder);
        setReminders([created, ...reminders]);
        showSuccess("Lembrete criado com sucesso!");
        setIsAddReminderOpen(false);
      } catch (error) {
        showError("Erro ao criar lembrete");
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#7f6e62]">Visão Geral</h1>
          <div className="flex gap-2">
            <Popover open={isDateFilterOpen} onOpenChange={setIsDateFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-[#d5c4aa] bg-white">
                  <CalendarIcon className="w-4 h-4 mr-2" />Data
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filtrar por período</h4>
                  <div className="grid gap-2"><Label htmlFor="start-date">Data de início</Label><Input id="start-date" type="date" value={dateRange.start} onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}/></div>
                  <div className="grid gap-2"><Label htmlFor="end-date">Data de fim</Label><Input id="end-date" type="date" value={dateRange.end} onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}/></div>
                  <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsDateFilterOpen(false)}>Cancelar</Button><Button onClick={handleDateRangeFilter} className="bg-[#88957d] hover:bg-[#7f6e62]">Aplicar Filtro</Button></div>
                </div>
              </PopoverContent>
            </Popover>
            <Dialog open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
              <DialogTrigger asChild><Button className="bg-[#88957d] hover:bg-[#7f6e62]"><Plus className="w-4 h-4 mr-2" />Atividade</Button></DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader><DialogTitle>Criar Evento/Atividade</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.currentTarget); handleAddActivity(formData); }}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2"><Label htmlFor="activity-title">Título da Atividade</Label><Input id="activity-title" name="activity-title" placeholder="Título da atividade" required /></div>
                    <div className="grid gap-2"><Label htmlFor="responsible">Responsável pela Atividade</Label><Input id="responsible" name="responsible" placeholder="Nome do responsável" required /></div>
                    <div className="grid gap-2"><Label htmlFor="spots">Quantidade de Vagas</Label><Input id="spots" name="spots" type="number" placeholder="Número de vagas" required /></div>
                    <div className="grid gap-2"><Label htmlFor="activity-description">Descrição</Label><Textarea id="activity-description" name="activity-description" placeholder="Detalhes sobre a atividade" required /></div>
                    <div className="grid gap-2"><Label htmlFor="activity-photo">Foto da Atividade</Label><div className="flex items-center gap-2"><Input id="activity-photo" name="activity-photo" type="file" accept="image/*" /><Camera className="w-5 h-5 text-gray-400" /></div></div>
                  </div>
                  <div className="flex justify-end gap-2"><Button variant="outline" type="button" onClick={() => setIsAddActivityOpen(false)}>Cancelar</Button><Button type="submit" className="bg-[#88957d] hover:bg-[#7f6e62]">Criar Atividade</Button></div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-[#88957d] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-medium">Frequência</h3><Edit className="w-5 h-5" /></div>
              <div className="space-y-2"><div className="text-center"><span className="text-4xl font-bold">24</span><p className="text-sm opacity-90">presenças</p></div><div className="text-center"><span className="text-4xl font-bold text-[#d09c91]">5</span><p className="text-sm opacity-90">faltas</p></div></div>
              <p className="text-sm opacity-90 mt-4 text-center">Mais alunos que semana passada</p>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm">
            <CardHeader><CardTitle className="text-[#7f6e62]">Análise da Semana</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyAttendanceData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis hide /><Tooltip /><Bar dataKey="attendance" fill="#88957d" radius={[4, 4, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader><CardTitle className="text-[#7f6e62]">Calendário</CardTitle></CardHeader>
            <CardContent>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />{selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar 
                    mode="single" 
                    selected={selectedDate} 
                    onSelect={handleCalendarDateSelect} 
                    disabled={{ after: new Date() }}
                    initialFocus 
                    locale={ptBR} 
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-gray-600 mt-2">Clique em uma data para ver ou fazer a chamada.</p>
              {recentAttendances.length > 0 && (
                <div className="mt-4">
                  <Separator className="mb-4" />
                  <div className="flex items-center mb-2">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      <h4 className="text-sm font-medium text-gray-800">Chamadas Recentes</h4>
                  </div>
                  <div className="space-y-1">
                    {recentAttendances.map((att) => (
                      <Link key={att.date} href={`/students/chamadas/relatorio?date=${att.date}`} className="block">
                        <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                          <span className="text-sm font-medium text-gray-700">Relatório do dia {format(new Date(att.date + "T12:00:00Z"), "dd 'de' MMMM", { locale: ptBR })}</span>
                          <span className="text-xs text-gray-500">{format(new Date(att.date + "T12:00:00Z"), "EEE", { locale: ptBR })}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#7f6e62]">Atividade do dia</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setIsActivityDetailOpen(true)} className="border-[#88957d] text-[#88957d] hover:bg-[#88957d] hover:text-white"><Edit className="w-4 h-4 mr-1" />Editar</Button>
            </CardHeader>
            <CardContent>
              <div className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" onClick={() => setIsActivityDetailOpen(true)}>
                <div className="flex gap-4">
                  <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden"><Image src="/computer-classroom.png" alt="Atividade" width={96} height={64} className="w-full h-full object-cover" /></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[#7f6e62] mb-1">{todayActivity.title}</h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{todayActivity.description}</p>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#88957d] rounded-full"></div><span className="text-sm font-medium">{todayActivity.responsible}</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#7f6e62]">Lembretes</CardTitle>
              <Dialog open={isAddReminderOpen} onOpenChange={setIsAddReminderOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-[#88957d] hover:bg-[#7f6e62]">
                    <Plus className="w-4 h-4 mr-2" />Novo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader><DialogTitle>Criar Lembrete</DialogTitle></DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleAddReminder(formData);
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="reminder-title">Título</Label>
                        <Input id="reminder-title" name="reminder-title" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="reminder-description">Descrição</Label>
                        <Textarea id="reminder-description" name="reminder-description" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="reminder-date">Data</Label>
                        <Input id="reminder-date" name="reminder-date" type="date" required />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" type="button" onClick={() => setIsAddReminderOpen(false)}>Cancelar</Button>
                      <Button type="submit" className="bg-[#88957d] hover:bg-[#7f6e62]">Salvar</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {reminders.length === 0 ? (
                <p className="text-sm text-gray-600">Nenhum lembrete criado ainda.</p>
              ) : (
                <div className="space-y-3">
                  {reminders.map((r) => (
                    <div key={r.id} className="p-3 rounded-md border border-gray-200">
                      <h4 className="font-medium text-[#7f6e62]">{r.title}</h4>
                      {r.date && (
                        <p className="text-xs text-gray-500">
                          {format(new Date(r.date), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                      )}
                      {r.description && <p className="text-sm text-gray-600 mt-1">{r.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={isActivityDetailOpen} onOpenChange={setIsActivityDetailOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>{isEditingActivity ? "Editar Atividade" : "Detalhes da Atividade"}</DialogTitle></DialogHeader>
            {todayActivity && (isEditingActivity ? (
              <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.currentTarget); handleEditActivity(formData); }}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2"><Label htmlFor="edit-activity-title">Título da Atividade</Label><Input id="edit-activity-title" name="activity-title" defaultValue={todayActivity.title} required /></div>
                  <div className="grid gap-2"><Label htmlFor="edit-responsible">Responsável</Label><Input id="edit-responsible" name="responsible" defaultValue={todayActivity.responsible} required /></div>
                  <div className="grid gap-2"><Label htmlFor="edit-spots">Vagas</Label><Input id="edit-spots" name="spots" type="number" defaultValue={todayActivity.spots} required /></div>
                  <div className="grid gap-2"><Label htmlFor="edit-activity-description">Descrição</Label><Textarea id="edit-activity-description" name="activity-description" defaultValue={todayActivity.description} required /></div>
                </div>
                <div className="flex justify-end gap-2"><Button variant="outline" type="button" onClick={() => setIsEditingActivity(false)}>Cancelar</Button><Button type="submit" className="bg-[#88957d] hover:bg-[#7f6e62]">Salvar Alterações</Button></div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden"><Image src="/computer-classroom.png" alt="Atividade" width={400} height={192} className="w-full h-full object-cover" /></div>
                <div className="space-y-3">
                  <div><Label className="font-medium">Responsável</Label><p className="text-sm text-gray-600">{todayActivity.responsible}</p></div>
                  <div><Label className="font-medium">Vagas</Label><p className="text-sm text-gray-600">{todayActivity.spots} vagas disponíveis</p></div>
                  <div><Label className="font-medium">Descrição</Label><p className="text-sm text-gray-600">{todayActivity.description}</p></div>
                </div>
                <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsActivityDetailOpen(false)}>Fechar</Button><Button className="bg-[#88957d] hover:bg-[#7f6e62]" onClick={() => setIsEditingActivity(true)}><Edit className="w-4 h-4 mr-2" />Editar</Button></div>
              </div>
            ))}
          </DialogContent>
        </Dialog>
      </div>
    )
  }