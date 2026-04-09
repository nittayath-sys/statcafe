import { calculateSD, calculateMean } from "@/src/lib/stats";
import { Coffee, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { DayHistory } from "@/src/store/gameStore";

interface BaristaFeedbackProps {
  history: DayHistory[];
}

export default function BaristaFeedback({ history }: BaristaFeedbackProps) {
  // ถ้ายังไม่เริ่มเกม ให้กล่าวทักทายปกติ
  if (history.length === 0) {
    return (
      <div className="pop-card bg-pop-blue flex items-center gap-4 animate-vibe">
        <div className="bg-white p-3 rounded-full border-4 border-black shrink-0">
          <Coffee className="w-8 h-8 text-pop-pink" />
        </div>
        <div>
          <h3 className="font-bold text-xl">Barista Bot:</h3>
          <p className="font-medium text-sm">Welcome boss! What price should we set today?</p>
        </div>
      </div>
    );
  }

  const lastDay = history[history.length - 1];
  const profits = history.map((h) => h.profit);
  const recentProfits = profits.slice(-7); // ดูสถิติย้อนหลัง 7 วันล่าสุด
  
  const mean = calculateMean(recentProfits);
  const sd = calculateSD(recentProfits);
  
  let message = "Keep going boss! Things are stable, maintain the level!";
  let Icon = Coffee;
  let bgColor = "bg-pop-yellow text-black";

  // เช็คเหตุการณ์พิเศษล่าสุดก่อน
  if (lastDay.event) {
    message = lastDay.event;
    Icon = AlertCircle;
    bgColor = lastDay.event.includes("✨") ? "bg-pop-blue text-black" : "bg-pop-pink text-white";
  } else if (sd > 150) {
    message = `Careful! SD (Volatility) is high at ${sd.toFixed(0)}. Sales are swinging wildly. Try adjusting the price?`;
    Icon = AlertCircle;
    bgColor = "bg-pop-pink text-white";
  } else if (mean > 150) {
    message = `Awesome! Average profit (Mean) for the last 7 days is ฿${mean.toFixed(0)}. Customers love us!`;
    Icon = TrendingUp;
    bgColor = "bg-pop-blue text-black";
  } else if (mean < 0) {
    message = `Oh no boss! Average loss is ฿${Math.abs(mean).toFixed(0)}. Check the price, customers might be leaving!`;
    Icon = TrendingDown;
    bgColor = "bg-gray-300 text-black";
  }

  return (
    <div className={`pop-card ${bgColor} flex items-center gap-4 transition-all duration-500`}>
      <div className="bg-white p-3 rounded-full border-4 border-black animate-vibe shrink-0">
        <Icon className="w-8 h-8 text-black" />
      </div>
      <div>
        <h3 className="font-bold text-lg leading-none">Barista Insight:</h3>
        <p className="font-medium mt-1 text-sm">{message}</p>
      </div>
    </div>
  );
}
