"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  CalendarIcon,
  Edit,
  Search,
  Mail,
  Bell,
  Camera,
  Clock,
} from "lucide-react";
import { format, isFuture, isToday, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import { useNotification } from "@/hooks/use-notification";
import { Reminder } from "@/lib/reminder/reminder.dto";
import { Attendance } from "@/lib/attendance/attendance.dto";
import { getAttendance } from "@/lib/attendance/attendance.service";
import { Activity } from "@/lib/activity/activity.dto";
import { getWeeklyAttendanceSummary } from "@/lib/graph/graph.service";
import { createReminder, getReminders } from "@/lib/reminder/reminder.service";
import {
  getActivities,
  createActivity,
  updateActivity,
} from "@/lib/activity/activity.service";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  getCarouselImages,
  setCarouselImages as saveCarouselImages,
  uploadCarouselImage,
  testCarouselTableConnection,
  type CarouselImage,
} from "@/lib/carousel";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip bg-white p-3 border border-gray-300 rounded-md shadow-lg text-sm">
        <p className="label font-semibold text-[#7f6e62] mb-1">{`Dia: ${data.day}`}</p>
        <p className="intro text-green-700">{`Presenças: ${data.presences}`}</p>
        <p className="intro text-red-700">{`Faltas: ${data.absences}`}</p>
        <p className="intro text-yellow-600">{`Justificadas: ${data.justified}`}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const router = useRouter();
  const { showSuccess, showError } = useNotification();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [recentAttendances, setRecentAttendances] = useState<Attendance[]>([]);
  const [chartData, setChartData] = useState([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [isActivityDetailOpen, setIsActivityDetailOpen] = useState(false);
  const [isEditingActivity, setIsEditingActivity] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(
    null
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [isReminderDetailOpen, setIsReminderDetailOpen] = useState(false);
  const [isEditingReminder, setIsEditingReminder] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(
    null
  );
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(
    null
  );

  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedDateString = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : "";

  const todayActivity = activities.find(
    (activity) => activity.date === selectedDateString
  ) || {
    id: "default-id",
    title: "Oficina de Arte",
    responsible: "Professora Carla",
    spots: 20,
    description:
      "Atividade de pintura e desenho para desenvolver a criatividade das crianças.",
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Testar conexão com a tabela primeiro
        await testCarouselTableConnection();

        const [
          activitiesData,
          attendanceData,
          remindersData,
          summaryData,
          carouselData,
        ] = await Promise.all([
          getActivities(),
          getAttendance(),
          getReminders(),
          getWeeklyAttendanceSummary(),
          getCarouselImages(),
        ]);

        setActivities(activitiesData);
        setReminders(remindersData);
        setChartData(summaryData);
        setCarouselImages(carouselData);

        const uniqueDates = [...new Set(attendanceData.map((a) => a.date))];
        const recentDates = uniqueDates
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
          .slice(0, 5)
          .map((date) => ({ date } as Attendance));

        setRecentAttendances(recentDates);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        showError("Erro ao carregar dados do dashboard");
      }
    };
    loadDashboardData();
  }, []);

  const handleCalendarDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setIsCalendarOpen(false);
    const dateString = format(date, "yyyy-MM-dd");
    const today = startOfDay(new Date());
    const selectedDay = startOfDay(date);
    if (isFuture(selectedDay)) {
      showError("Não é possível interagir com uma data futura.");
      return;
    }
    if (isToday(selectedDay)) {
      router.push(`/students/chamadas?date=${dateString}`);
    } else {
      router.push(`/students/chamadas/relatorio?date=${dateString}`);
    }
  };

  const handleAddActivity = async (formData: FormData) => {
    try {
      const newActivity = {
        title: formData.get("activity-title") as string,
        responsible: formData.get("responsible") as string,
        spots: Number.parseInt(formData.get("spots") as string),
        description: formData.get("activity-description") as string,
        date: format(new Date(), "yyyy-MM-dd"),
        photo_url: null,
      };
      const created = await createActivity(newActivity);
      setActivities([created, ...activities]);
      showSuccess("Atividade criada com sucesso!");
      setIsAddActivityOpen(false);
    } catch (error) {
      showError("Erro ao criar atividade");
    }
  };

  const handleEditActivity = async (formData: FormData) => {
    try {
      if (!selectedActivity) {
        showError("Nenhuma atividade selecionada para edição");
        return;
      }
      const updates = {
        title: formData.get("activity-title") as string,
        responsible: formData.get("responsible") as string,
        spots: Number.parseInt(formData.get("spots") as string),
        description: formData.get("activity-description") as string,
      };
      const updatedActivity = await updateActivity(
        selectedActivity.id,
        updates
      );
      setActivities(
        activities.map((a) =>
          a.id === selectedActivity.id ? updatedActivity : a
        )
      );
      setIsEditingActivity(false);
      setIsActivityDetailOpen(false);
      showSuccess("Atividade atualizada com sucesso!");
    } catch (error) {
      showError("Erro ao atualizar atividade");
    }
  };

  const handleDateRangeFilter = () => {
    if (dateRange.start && dateRange.end) {
      showSuccess(`Filtro aplicado: ${dateRange.start} até ${dateRange.end}`);
      setIsDateFilterOpen(false);
    }
  };

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

  const handleEditReminder = async (formData: FormData) => {
    try {
      if (!selectedReminder) return;
      const updates = {
        title: formData.get("reminder-title") as string,
        description: formData.get("reminder-description") as string,
        date: formData.get("reminder-date") as string,
      };
      const { updateReminder } = await import("@/lib/database");
      const updated = await updateReminder(selectedReminder.id, updates);
      setReminders(
        reminders.map((r) => (r.id === selectedReminder.id ? updated : r))
      );
      showSuccess("Lembrete atualizado!");
      setIsEditingReminder(false);
      setIsReminderDetailOpen(false);
    } catch (error) {
      showError("Erro ao editar lembrete");
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (!confirm("Deseja realmente excluir este lembrete?")) return;
    try {
      const { deleteReminder } = await import("@/lib/database");
      await deleteReminder(id);
      setReminders(reminders.filter((r) => r.id !== id));
      showSuccess("Lembrete excluído!");
    } catch (error) {
      showError("Erro ao excluir lembrete");
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 5) {
      showError("Você pode selecionar no máximo 5 imagens.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setIsUploadModalOpen(false);
    showSuccess("Enviando imagens... Isso pode levar um momento.");

    try {
      console.log(
        "handleImageUpload: Iniciando upload de",
        files.length,
        "arquivos"
      );

      const uploadPromises = Array.from(files).map((file, index) => {
        const filePath = `public/${Date.now()}-${index}-${file.name}`;
        console.log(
          "handleImageUpload: Fazendo upload do arquivo:",
          file.name,
          "para:",
          filePath
        );
        return uploadCarouselImage(file, filePath);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      console.log(
        "handleImageUpload: URLs das imagens uploadadas:",
        uploadedUrls
      );

      const newImageList = uploadedUrls.map((url, index) => ({
        image_url: url,
        order: index,
      }));
      console.log(
        "handleImageUpload: Lista de imagens para inserir no DB:",
        newImageList
      );

      await saveCarouselImages(newImageList);
      console.log("handleImageUpload: Imagens salvas no banco com sucesso");

      const updatedImages = await getCarouselImages();
      console.log(
        "handleImageUpload: Imagens recuperadas do banco:",
        updatedImages
      );
      setCarouselImages(updatedImages);

      showSuccess("Galeria atualizada com sucesso!");
    } catch (error) {
      console.error("handleImageUpload: Erro no upload:", error);
      showError("Ocorreu um erro ao enviar as imagens.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 bg-[#EAE8E8] p-4 rounded-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#7f6e62]">Visão Geral</h1>
        <div className="flex gap-2">
          <Popover open={isDateFilterOpen} onOpenChange={setIsDateFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="border-[#d5c4aa] bg-white">
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
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        start: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-date">Data de fim</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, end: e.target.value }))
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDateFilterOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleDateRangeFilter}
                    className="bg-[#88957d] hover:bg-[#7f6e62]"
                  >
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
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleAddActivity(formData);
                }}
              >
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="activity-title">Título da Atividade</Label>
                    <Input
                      id="activity-title"
                      name="activity-title"
                      placeholder="Título da atividade"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="responsible">Responsável</Label>
                    <Input
                      id="responsible"
                      name="responsible"
                      placeholder="Nome do responsável"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="spots">Vagas</Label>
                    <Input
                      id="spots"
                      name="spots"
                      type="number"
                      placeholder="Número de vagas"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="activity-description">Descrição</Label>
                    <Textarea
                      id="activity-description"
                      name="activity-description"
                      placeholder="Detalhes"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="activity-photo">Foto</Label>
                    <Input
                      id="activity-photo"
                      name="activity-photo"
                      type="file"
                      accept="image/*"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsAddActivityOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#88957d] hover:bg-[#7f6e62]"
                  >
                    Criar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm relative group">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#7f6e62]">Galeria</CardTitle>
            <Dialog
              open={isUploadModalOpen}
              onOpenChange={setIsUploadModalOpen}
            >
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Edit className="w-4 h-4 text-gray-500" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Atualizar Imagens da Galeria</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Selecione até 5 novas imagens. As imagens antigas serão
                    substituídas.
                  </p>
                  <Input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <p className="text-sm text-blue-600 mt-2">Enviando...</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0 pb-4">
            {carouselImages.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {carouselImages.map((img, index) => (
                    <CarouselItem key={img.image_url}>
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex aspect-video items-center justify-center p-0 overflow-hidden rounded-lg">
                            <Image
                              src={img.image_url}
                              alt={`Imagem da galeria ${index + 1}`}
                              width={400}
                              height={225}
                              className="object-cover w-full h-full"
                              priority={index === 0}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CarouselNext className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Carousel>
            ) : (
              <div className="aspect-video flex items-center justify-center text-gray-500 p-4 text-center">
                <p>
                  Nenhuma imagem na galeria. Clique no ícone de editar para
                  adicionar.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-[#7f6e62]">Análise da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis hide />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(213, 196, 170, 0.3)" }}
                />
                <Legend verticalAlign="top" height={36} iconSize={10} />
                <Bar
                  dataKey="presences"
                  name="Presenças"
                  fill="#88957d"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="absences"
                  name="Faltas"
                  fill="#d09c91"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="justified"
                  name="Justificadas"
                  fill="#d5c4aa"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm overflow-y-auto max-h-[27rem] lg:min-h-[27rem]">
          <CardHeader>
            <CardTitle className="text-[#7f6e62]">Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-transparent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "PPP", { locale: ptBR })
                    : "Selecione uma data"}
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
            <p className="text-sm text-gray-600 mt-2">
              Clique em uma data para ver ou fazer a chamada.
            </p>
            {recentAttendances.length > 0 && (
              <div className="mt-4">
                <Separator className="mb-4" />
                <div className="flex items-center mb-2">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-800">
                    Chamadas Recentes
                  </h4>
                </div>
                <div className="space-y-1">
                  {recentAttendances.map((att) => (
                    <Link
                      key={att.date}
                      href={`/students/chamadas/relatorio?date=${att.date}`}
                      className="block"
                    >
                      <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                        <span className="text-sm font-medium text-gray-700">
                          Relatório do dia{" "}
                          {format(
                            new Date(att.date + "T12:00:00Z"),
                            "dd 'de' MMMM",
                            { locale: ptBR }
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(att.date + "T12:00:00Z"), "EEE", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm overflow-y-auto max-h-[27rem] lg:min-h-[27rem]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#7f6e62]">Atividades</CardTitle>
            <Dialog
              open={isAddActivityOpen}
              onOpenChange={setIsAddActivityOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#88957d] hover:bg-[#7f6e62]">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Atividade</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleAddActivity(formData);
                  }}
                >
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="activity-title">
                        Título da Atividade
                      </Label>
                      <Input
                        id="activity-title"
                        name="activity-title"
                        placeholder="Título"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="responsible">Responsável</Label>
                      <Input
                        id="responsible"
                        name="responsible"
                        placeholder="Nome do responsável"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="spots">Vagas</Label>
                      <Input
                        id="spots"
                        name="spots"
                        type="number"
                        placeholder="Número de vagas"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="activity-description">Descrição</Label>
                      <Textarea
                        id="activity-description"
                        name="activity-description"
                        placeholder="Detalhes"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="activity-photo">Foto</Label>
                      <Input
                        id="activity-photo"
                        name="activity-photo"
                        type="file"
                        accept="image/*"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setIsAddActivityOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#88957d] hover:bg-[#7f6e62]"
                    >
                      Criar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-gray-600">
                Nenhuma atividade criada ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {activities.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-md border border-gray-200 flex justify-between items-start min-h-[6rem]"
                  >
                    <div
                      onClick={() => {
                        setSelectedActivity(a);
                        setIsActivityDetailOpen(true);
                        setIsEditingActivity(false);
                      }}
                      className="cursor-pointer flex-1 flex gap-3"
                    >
                      <div className="w-28 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={a.photo_url || "/computer-classroom.png"}
                          alt="Atividade"
                          width={112}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="line-clamp-2 lg:line-clamp-3 font-medium text-[#7f6e62]">
                          {a.title}
                        </h4>
                        {a.date && (
                          <p className="text-xs text-gray-500">
                            {format(
                              new Date(a.date + "T12:00:00Z"),
                              "dd 'de' MMMM",
                              { locale: ptBR }
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedActivity(a);
                          setIsEditingActivity(true);
                          setIsActivityDetailOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setActivityToDelete(a)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm overflow-y-auto max-h-[27rem] lg:min-h-[27rem]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#7f6e62]">Lembretes</CardTitle>
            <Dialog
              open={isAddReminderOpen}
              onOpenChange={setIsAddReminderOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#88957d] hover:bg-[#7f6e62]">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Lembrete</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleAddReminder(formData);
                  }}
                >
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="reminder-title">Título</Label>
                      <Input
                        id="reminder-title"
                        name="reminder-title"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reminder-description">Descrição</Label>
                      <Textarea
                        id="reminder-description"
                        name="reminder-description"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reminder-date">Data</Label>
                      <Input
                        id="reminder-date"
                        name="reminder-date"
                        type="date"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setIsAddReminderOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#88957d] hover:bg-[#7f6e62]"
                    >
                      Salvar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {reminders.length === 0 ? (
              <p className="text-sm text-gray-600">
                Nenhum lembrete criado ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {reminders.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-md border border-gray-200 flex flex-col gap-2"
                  >
                    <div
                      onClick={() => {
                        setSelectedReminder(r);
                        setIsReminderDetailOpen(true);
                        setIsEditingReminder(false);
                      }}
                      className="cursor-pointer"
                    >
                      <h4 className="font-medium text-[#7f6e62] line-clamp-5 mt-1 mb-2">
                        {r.title}
                      </h4>
                      {r.date && (
                        <p className="text-xs text-gray-500">
                          {format(
                            new Date(r.date + "T12:00:00Z"),
                            "dd 'de' MMMM",
                            { locale: ptBR }
                          )}
                        </p>
                      )}
                      {r.description && (
                        <p className="text-sm text-gray-600 line-clamp-5 mt-1 mb-2">
                          {r.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedReminder(r);
                          setIsEditingReminder(true);
                          setIsReminderDetailOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setReminderToDelete(r)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!activityToDelete}
        onOpenChange={(open) => {
          if (!open) setActivityToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Deseja realmente excluir a atividade{" "}
              <strong>{activityToDelete?.title}</strong>?
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setActivityToDelete(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={async () => {
                if (!activityToDelete) return;
                try {
                  await import("@/lib/database").then(({ deleteActivity }) =>
                    deleteActivity(activityToDelete.id)
                  );
                  setActivities(
                    activities.filter((a) => a.id !== activityToDelete.id)
                  );
                  showSuccess("Atividade excluída!");
                  setActivityToDelete(null);
                } catch {
                  showError("Erro ao excluir atividade");
                }
              }}
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isActivityDetailOpen}
        onOpenChange={setIsActivityDetailOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditingActivity ? "Editar Atividade" : "Detalhes da Atividade"}
            </DialogTitle>
          </DialogHeader>
          {selectedActivity &&
            (isEditingActivity ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleEditActivity(formData);
                }}
              >
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-activity-title">
                      Título da Atividade
                    </Label>
                    <Input
                      id="edit-activity-title"
                      name="activity-title"
                      defaultValue={selectedActivity.title}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-responsible">Responsável</Label>
                    <Input
                      id="edit-responsible"
                      name="responsible"
                      defaultValue={selectedActivity.responsible}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-spots">Vagas</Label>
                    <Input
                      id="edit-spots"
                      name="spots"
                      type="number"
                      defaultValue={selectedActivity.spots}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-activity-description">Descrição</Label>
                    <Textarea
                      id="edit-activity-description"
                      name="activity-description"
                      defaultValue={selectedActivity.description}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsEditingActivity(false)}
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
                <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={
                      selectedActivity.photo_url || "/computer-classroom.png"
                    }
                    alt="Atividade"
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="font-medium">Responsável</Label>
                    <p className="text-sm text-gray-600">
                      {selectedActivity.responsible}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Vagas</Label>
                    <p className="text-sm text-gray-600">
                      {selectedActivity.spots} vagas disponíveis
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Descrição</Label>
                    <p className="text-sm text-gray-600">
                      {selectedActivity.description}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsActivityDetailOpen(false)}
                  >
                    Fechar
                  </Button>
                  <Button
                    className="bg-[#88957d] hover:bg-[#7f6e62]"
                    onClick={() => setIsEditingActivity(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            ))}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!reminderToDelete}
        onOpenChange={(open) => {
          if (!open) setReminderToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Deseja realmente excluir o lembrete{" "}
              <strong>{reminderToDelete?.title}</strong>?
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReminderToDelete(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={async () => {
                if (!reminderToDelete) return;
                try {
                  const { deleteReminder } = await import("@/lib/database");
                  await deleteReminder(reminderToDelete.id);
                  setReminders(
                    reminders.filter((r) => r.id !== reminderToDelete.id)
                  );
                  showSuccess("Lembrete excluído!");
                  setReminderToDelete(null);
                } catch {
                  showError("Erro ao excluir lembrete");
                }
              }}
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isReminderDetailOpen}
        onOpenChange={setIsReminderDetailOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditingReminder ? "Editar Lembrete" : "Detalhes do Lembrete"}
            </DialogTitle>
          </DialogHeader>
          {selectedReminder &&
            (isEditingReminder ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleEditReminder(formData);
                }}
              >
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="reminder-title">Título</Label>
                    <Input
                      id="reminder-title"
                      name="reminder-title"
                      defaultValue={selectedReminder.title}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reminder-description">Descrição</Label>
                    <Textarea
                      id="reminder-description"
                      name="reminder-description"
                      defaultValue={selectedReminder.description || ""}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reminder-date">Data</Label>
                    <Input
                      id="reminder-date"
                      name="reminder-date"
                      type="date"
                      defaultValue={selectedReminder.date}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsEditingReminder(false)}
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
                <div>
                  <Label className="font-medium">Título</Label>
                  <p className="text-sm text-gray-600">
                    {selectedReminder.title}
                  </p>
                </div>
                {selectedReminder.date && (
                  <div>
                    <Label className="font-medium">Data</Label>
                    <p className="text-sm text-gray-600">
                      {format(
                        new Date(selectedReminder.date + "T12:00:00Z"),
                        "dd 'de' MMMM",
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                )}
                {selectedReminder.description && (
                  <div>
                    <Label className="font-medium">Descrição</Label>
                    <p className="text-sm text-gray-600">
                      {selectedReminder.description}
                    </p>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsReminderDetailOpen(false)}
                  >
                    Fechar
                  </Button>
                  <Button
                    className="bg-[#88957d] hover:bg-[#7f6e62]"
                    onClick={() => setIsEditingReminder(true)}
                  >
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
