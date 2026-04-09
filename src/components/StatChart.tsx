import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { DayHistory } from "@/src/store/gameStore";

// ต้องลงทะเบียนส่วนประกอบต่างๆ ของ Chart.js ก่อนใช้งาน
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StatChartProps {
  history: DayHistory[];
}

export default function StatChart({ history }: StatChartProps) {
  // ดึงข้อมูลวันที่และกำไรมาทำเป็นแกน X และ Y
  const labels = history.map((data) => `Day ${data.day}`);
  const profits = history.map((data) => data.profit);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Daily Profit/Loss (฿)",
        data: profits,
        borderColor: "#00e5ff", // Electric Blue
        backgroundColor: "#ff007f", // Neon Pink
        borderWidth: 4,
        pointBackgroundColor: history.map(h => 
          h.event?.includes("✨") ? "#00ff00" : 
          h.event?.includes("🌧️") ? "#ff0000" : "#fff01f"
        ),
        pointBorderColor: "#1a1a1a",
        pointBorderWidth: 3,
        pointRadius: history.map(h => h.event ? 10 : 6),
        tension: 0.3, 
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { 
          font: { family: "Kanit", size: 12, weight: "bold" as const }, 
          color: "#1a1a1a" 
        },
      },
      tooltip: {
        backgroundColor: "#1a1a1a",
        titleFont: { family: "Kanit", size: 12 },
        bodyFont: { family: "Inter", size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          afterBody: (context: any) => {
            const dataIndex = context[0].dataIndex;
            const event = history[dataIndex]?.event;
            return event ? `\nEvent: ${event}` : "";
          }
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "Kanit", weight: "bold" as const }, color: "#1a1a1a" },
      },
      y: {
        grid: { color: "rgba(0,0,0,0.1)", lineWidth: 2 },
        ticks: { font: { family: "Inter", weight: "bold" as const }, color: "#1a1a1a" },
      },
    },
  };

  if (history.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center pop-card bg-gray-100">
        <p className="font-bold text-gray-500 uppercase text-xs">No data yet. Start your first day!</p>
      </div>
    );
  }

  return (
    <div className="pop-card bg-white w-full h-[250px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
