import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { TrendingUp, Users, DollarSign, Zap } from 'lucide-react';
import { DayHistory } from '@/src/store/gameStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface VibeAnalyticsProps {
  history: DayHistory[];
}

export default function VibeAnalytics({ history }: VibeAnalyticsProps) {
  const stats = useMemo(() => {
    if (history.length === 0) return null;

    const totalProfit = history.reduce((acc, curr) => acc + curr.profit, 0);
    const avgProfit = totalProfit / history.length;
    const totalCustomers = history.reduce((acc, curr) => acc + curr.customers, 0);
    
    const segments = history.reduce((acc: any, curr) => {
      acc[curr.mainSegment] = (acc[curr.mainSegment] || 0) + 1;
      return acc;
    }, {});

    const segmentProfits = history.reduce((acc: any, curr) => {
      if (!acc[curr.mainSegment]) acc[curr.mainSegment] = { total: 0, count: 0 };
      acc[curr.mainSegment].total += curr.profit;
      acc[curr.mainSegment].count += 1;
      return acc;
    }, {});

    return {
      avgProfit,
      totalCustomers,
      segments,
      segmentProfits
    };
  }, [history]);

  if (!stats) {
    return (
      <div className="pop-card bg-white p-8 text-center space-y-4">
        <TrendingUp className="w-16 h-16 mx-auto text-gray-300" />
        <h2 className="text-xl font-black uppercase">ยังไม่มีข้อมูล</h2>
        <p className="font-bold text-gray-500">เปิดร้านสักพักเพื่อดูการวิเคราะห์เชิงลึก!</p>
      </div>
    );
  }

  const segmentData = {
    labels: Object.keys(stats.segments).map(s => s === 'Economy' ? 'กลุ่มประหยัด' : 'กลุ่มพรีเมียม'),
    datasets: [
      {
        label: 'จำนวนวันที่ครองตลาด',
        data: Object.values(stats.segments),
        backgroundColor: ['#00e5ff', '#ff007f'],
        borderColor: '#1a1a1a',
        borderWidth: 2,
      },
    ],
  };

  const profitBySegmentData = {
    labels: Object.keys(stats.segmentProfits).map(s => s === 'Economy' ? 'กลุ่มประหยัด' : 'กลุ่มพรีเมียม'),
    datasets: [
      {
        label: 'กำไรเฉลี่ยต่อกลุ่ม',
        data: Object.keys(stats.segmentProfits).map(
          (k) => stats.segmentProfits[k].total / stats.segmentProfits[k].count
        ),
        backgroundColor: ['#fff01f', '#00e5ff'],
        borderColor: '#1a1a1a',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="grid grid-cols-2 gap-4">
        <div className="pop-card bg-pop-blue text-black p-4">
          <DollarSign className="w-6 h-6 mb-2" />
          <p className="text-[10px] font-black uppercase opacity-60">กำไรเฉลี่ย</p>
          <p className="text-xl font-black">฿{stats.avgProfit.toFixed(0)}</p>
        </div>
        <div className="pop-card bg-pop-pink text-white p-4">
          <Users className="w-6 h-6 mb-2" />
          <p className="text-[10px] font-black uppercase opacity-60">ลูกค้ารวม</p>
          <p className="text-xl font-black">{stats.totalCustomers}</p>
        </div>
      </div>

      <div className="pop-card bg-white space-y-4">
        <h3 className="font-black text-lg uppercase flex items-center gap-2">
          <TrendingUp className="text-pop-blue" /> สัดส่วนกลุ่มลูกค้า
        </h3>
        <div className="h-48">
          <Pie 
            data={segmentData} 
            options={{ 
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: { font: { weight: 'bold' } }
                }
              }
            }} 
          />
        </div>
      </div>

      <div className="pop-card bg-white space-y-4">
        <h3 className="font-black text-lg uppercase flex items-center gap-2">
          <DollarSign className="text-pop-pink" /> กำไรตามกลุ่มลูกค้า
        </h3>
        <div className="h-48">
          <Bar 
            data={profitBySegmentData} 
            options={{ 
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }} 
          />
        </div>
      </div>

      <div className="pop-card bg-pop-dark text-white p-6 text-center">
        <Zap className="w-12 h-12 mx-auto mb-4 text-pop-yellow" />
        <h3 className="text-xl font-black uppercase">Vibe Check</h3>
        <p className="font-bold opacity-80 mt-2">
          {stats.avgProfit > 200 
            ? "ร้านของคุณคือตำนาน! บรรยากาศยอดเยี่ยมมาก" 
            : "บรรยากาศโอเคนะ แต่เราน่าจะดึงกำไรจากลูกค้าได้มากกว่านี้!"}
        </p>
      </div>
    </div>
  );
}
