import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateMean, calculateSD, calculateMode, randomNormal } from '@/src/lib/stats';

export interface DayHistory {
  day: number;
  sales: number;
  profit: number;
  customers: number;
  price: number;
  mainSegment: 'Economy' | 'Premium';
  event: string | null;
}

interface GameState {
  day: number;
  money: number;
  highScore: number;
  inventory: { beans: number; milk: number };
  history: DayHistory[];
  currentEvent: string | null;
  customerSegments: { type: string; prefPrice: number; count: number }[];
  
  // Actions
  nextDay: (orderBeans: number, price: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      day: 1,
      money: 1000, // ทุนเริ่มแรก 1,000 เหรียญ
      highScore: 0, // คะแนนสูงสุดเริ่มต้นที่ 0
      inventory: { beans: 0, milk: 0 },
      history: [],
      currentEvent: null,
      customerSegments: [],

      nextDay: (orderBeans, price) => {
        const state = get();
        const weekNum = Math.ceil(state.day / 7);
        const volatilityBase = 5 + (weekNum * 2);
        
        // 🌩️ ระบบ Outlier Event (เหตุการณ์พิเศษ)
        let eventName = null;
        let demandMultiplier = 1;
        const rand = Math.random();
        
        if (rand < 0.15) {
          eventName = "🌧️ ฝนตกหนักพายุเข้า! ลูกค้าหายหมด (Negative Outlier)";
          demandMultiplier = 0.4; // ลูกค้าลดลงเหลือ 40%
        } else if (rand > 0.85) {
          eventName = "✨ ดารามาเช็คอิน! ยอดพุ่งกระฉูด (Positive Outlier)";
          demandMultiplier = 2.5; // ลูกค้าเพิ่มขึ้น 2.5 เท่า
        }
        
        // คำนวณลูกค้าพร้อมคูณผลกระทบจากเหตุการณ์
        const ecoCount = Math.floor(randomNormal(15, volatilityBase) * demandMultiplier);
        const premiumCount = Math.floor(randomNormal(10, volatilityBase) * demandMultiplier);
        
        let sales = 0;
        let servedCustomers = 0;
        
        const processSales = (count: number, maxPrice: number) => {
          for(let i=0; i<count; i++) {
            const prob = price <= maxPrice ? 0.9 : Math.max(0, 1 - (price - maxPrice) / 50);
            if (Math.random() < prob && (state.inventory.beans + orderBeans) > servedCustomers) {
              sales += price;
              servedCustomers++;
            }
          }
        };

        processSales(ecoCount, 50);
        processSales(premiumCount, 100);

        const cost = orderBeans * 10;
        const dailyProfit = sales - cost;
        const currentMoney = state.money + dailyProfit;

        const newDayData: DayHistory = {
          day: state.day,
          sales,
          profit: dailyProfit,
          customers: servedCustomers,
          price: price,
          mainSegment: ecoCount > premiumCount ? 'Economy' : 'Premium',
          event: eventName // บันทึกเหตุการณ์ลงประวัติเพื่อนำไปแสดงผล
        };

        // ถ้าเล่นจบ 30 วัน แล้วเงินเยอะกว่าคะแนนสูงสุดเดิม ให้บันทึกสถิติใหม่!
        let newHighScore = state.highScore;
        if (state.day >= 30 && currentMoney > state.highScore) {
          newHighScore = currentMoney;
        }

        set((state) => ({
          day: state.day + 1,
          money: currentMoney,
          highScore: newHighScore,
          inventory: { beans: 0, milk: 0 },
          history: [...state.history, newDayData],
        }));
      },

      // เวลารีเซ็ตเกม เราจะไม่ล้างค่า highScore ทิ้ง
      resetGame: () => set((state) => ({ 
        day: 1, 
        money: 1000, 
        history: [], 
        inventory: { beans: 0, milk: 0 } 
      })),
    }),
    {
      name: 'statcafe-storage', // ชื่อแฟ้มลับในเบราว์เซอร์
      partialize: (state) => ({ highScore: state.highScore }), // สั่งให้จำแค่คะแนนสูงสุดเท่านั้น
    }
  )
);
