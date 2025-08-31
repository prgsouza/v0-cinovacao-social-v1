import { getAttendance } from "../attendance/attendance.service";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ==================================================================
// FUNÇÃO DO GRÁFICO (REAPLICADA COM A LÓGICA MAIS ROBUSTA)
// ==================================================================
export async function getWeeklyAttendanceSummary(): Promise<
  { day: string; presences: number; absences: number; justified: number }[]
> {
  console.log("✅ Servidor: Buscando resumo de chamadas da semana...");

  try {
    // 1. Reutilizamos sua função existente para buscar os registros.
    const allAttendanceData = await getAttendance();
    console.log(
      `Encontrados ${allAttendanceData.length} registros de chamada no total para processar.`
    );

    // 2. Usamos um objeto simples para a contagem
    const summary: {
      [date: string]: {
        presences: number;
        absences: number;
        justified: number;
      };
    } = {};

    // 3. Criamos os "potes" de contagem dinamicamente a partir dos dados recebidos
    for (const record of allAttendanceData) {
      // Se o pote para esta data ainda não existe, crie-o.
      if (!summary[record.date]) {
        summary[record.date] = { presences: 0, absences: 0, justified: 0 };
      }

      // 4. Adicionamos a contagem ao pote correto
      const status = record.status.toLowerCase();
      if (status === "presente" || status === "present") {
        summary[record.date].presences++;
      } else if (status === "faltou" || status === "absent") {
        summary[record.date].absences++;
      } else if (status === "justificada" || status === "justified") {
        summary[record.date].justified++;
      }
    }

    // 5. Transformamos o objeto em uma lista e ordenamos pela data mais recente
    const sortedSummary = Object.entries(summary)
      .map(([date, counts]) => ({
        date: date,
        ...counts,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 6. Pegamos apenas os 7 dias mais recentes que tiveram aula
    const latest7DaysWithData = sortedSummary.slice(0, 7);

    // 7. Formatamos para o gráfico
    const chartData = latest7DaysWithData
      .map(({ date, presences, absences, justified }) => ({
        day: format(new Date(date + "T12:00:00Z"), "EEE", { locale: ptBR })
          .charAt(0)
          .toUpperCase(),
        presences,
        absences,
        justified,
      }))
      .reverse(); // Inverte para mostrar do mais antigo para o mais novo

    console.log("✅ Servidor: Resumo da semana gerado com sucesso:", chartData);
    return chartData;
  } catch (error) {
    console.error("❌ Erro geral na função getWeeklyAttendanceSummary:", error);
    throw error;
  }
}
