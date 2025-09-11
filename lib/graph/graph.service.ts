import { getAttendance } from "../attendance/attendance.service";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

// ==================================================================
// FUNÇÃO DO GRÁFICO (MONDAY TO SUNDAY FIXED WEEK)
// ==================================================================
export async function getWeeklyAttendanceSummary(): Promise<
  { day: string; presences: number; absences: number; justified: number }[]
> {
  console.log(
    "✅ Servidor: Buscando resumo de chamadas da semana atual (Segunda a Domingo)..."
  );

  try {
    // 1. Get current week (Monday to Sunday)
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // 1 = Monday

    // 2. Generate all 7 days of the current week
    const weekDays = Array.from({ length: 7 }, (_, index) => {
      const day = addDays(startOfCurrentWeek, index);
      return {
        date: format(day, "yyyy-MM-dd"),
        dayName: format(day, "EEE", { locale: ptBR }).substring(0, 3),
        fullDate: day,
      };
    });

    console.log(
      `Semana atual: ${format(startOfCurrentWeek, "dd/MM/yyyy")} a ${format(
        addDays(startOfCurrentWeek, 6),
        "dd/MM/yyyy"
      )}`
    );

    // 3. Get all attendance data
    const allAttendanceData = await getAttendance();
    console.log(
      `Encontrados ${allAttendanceData.length} registros de chamada no total.`
    );

    // 4. Create summary for the current week
    const chartData = weekDays.map(({ date, dayName }) => {
      // Filter attendance records for this specific day
      const dayAttendance = allAttendanceData.filter(
        (record) => record.date === date
      );

      console.log(
        `📅 Processando ${date} (${dayName}): ${dayAttendance.length} registros encontrados`
      );

      let presences = 0;
      let absences = 0;
      let justified = 0;

      // Count attendance for this day
      for (const record of dayAttendance) {
        const status = record.status.toLowerCase();
        console.log(
          `  - Aluno: ${record.student_id}, Status: "${record.status}" -> normalizado: "${status}"`
        );

        if (status === "presente" || status === "present") {
          presences++;
        } else if (status === "faltou" || status === "absent") {
          absences++;
        } else if (status === "justificada" || status === "justified") {
          justified++;
        } else {
          console.warn(`  ⚠️ Status não reconhecido: "${record.status}"`);
        }
      }

      const dayResult = {
        day: dayName,
        presences,
        absences,
        justified,
      };

      console.log(
        `📊 Resultado para ${date}: P:${presences}, F:${absences}, J:${justified}`
      );
      return dayResult;
    });

    console.log(
      "✅ Servidor: Resumo da semana atual (Segunda a Domingo) gerado:",
      chartData
    );
    return chartData;
  } catch (error) {
    console.error("❌ Erro geral na função getWeeklyAttendanceSummary:", error);
    throw error;
  }
}
